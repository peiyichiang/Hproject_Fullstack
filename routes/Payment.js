const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require("path")





//回傳虛擬帳號資訊
router.post('/virtualAccount', async function (req, res, next) {
    /**專案代號(3) 身分證字號(6) 太陽日(4) 檢查碼(1) */
    let o_id = req.body.o_id;

    // SELECT table: order_list in: o_id out:o_symbol, o_email
    // SELECT table: product in: p_SYMBOL out: p_fundmanager
    // SELECT table: backend_user in: m_id out: m_bankcode
    // SELECT table: user in: u_email out:u_identityNumber
    let mysqlPoolQuery = req.pool;
    let DBresult = await getInfoFromOrder_list(mysqlPoolQuery, o_id);
    let email = DBresult.o_email;
    let symbol = DBresult.o_symbol;
    let amountToPaid = DBresult.o_fundCount;
    let purchaseDate = DBresult.o_purchaseDate;
    let fundmanager = await getFundmanager(mysqlPoolQuery, symbol);
    let bankcode = await getBankcode(mysqlPoolQuery, fundmanager);
    console.log(email);
    let userId = await getUserId(mysqlPoolQuery, email);

    // 計算太陽日
    let expiredSolarDay = await countExpiredSolarDay(purchaseDate);

    // 計算檢查碼
    let virtualAccount_13digits = bankcode + userId.slice(4) + expiredSolarDay;
    console.log(virtualAccount_13digits);
    let amountToPaid_11digits = lpad(amountToPaid, 11);
    console.log(amountToPaid_11digits);
    let checkCode = await calculateCheckCode(virtualAccount_13digits, amountToPaid_11digits);

    //產生14碼虛擬帳號
    let virtualAccount = bankcode + userId.slice(4) + expiredSolarDay + checkCode;


    //todo 將訂單資訊與虛擬帳號綁定 UPDATE table: order_list in: o_bankvirtualaccount
    await bindOrder(mysqlPoolQuery, o_id, virtualAccount);


    res.send({
        email: email,
        symbol: symbol,
        amountToPaid: amountToPaid,
        fundmanager: fundmanager,
        bankcode: bankcode,
        userId: userId,
        purchaseDate: purchaseDate,
        expiredSolarDay: expiredSolarDay,
        checkCode: checkCode,
        virtualAccount: virtualAccount
    });

});

//寄付款資訊信件
router.post('/sendTransferInfoMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        /* Helium */
        host: 'server239.web-hosting.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var text = '<h2>匯款資訊' + mailInfo.v_account + '</h2> <p>' + mailInfo.name + '您好：<br>此次預計付款訂單編號為:<br>' + mailInfo.o_IDs + '。<br>請將以下金額匯入指定帳戶:<br>' + mailInfo.amount + 'NTD。<br>以下是您的匯款資訊:<br>' + mailInfo.v_account + '  </p>'

    var options = {
        //寄件者
        from: ' <noreply@hcat.io>', // sender address
        //收件者
        to: mailInfo.email,
        //主旨
        subject: ' 匯款通知',
        //嵌入 html 的內文
        html: text
    };

    //發送信件方法
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(err);
            res.status(400);
            res.send({ "message": "[Error] Failure :" + err });
        } else {
            console.log('訊息發送: ' + info.response);
            res.status(200);
            res.send({
                "message": "[Success] Success",
                "info": info.response
            });
        }
    });
})

//處理銷帳資料
router.post('/accountingDetails', async function (req, res, next) {
    let mysqlPoolQuery = req.pool;
    fs.readdir(__dirname + '/../public/payment/accountStated', async function (err, files) {
        if (err) {
            res.send("Error getting directory information.");
        } else {
            for (const file of files) {
                console.log("====================" + file + "銷帳開始==================");
                let accountingDetails = [];
                var array = await fs.readFileSync(__dirname + '/../public/payment/accountStated/' + file, 'utf-8').toString().split("\n");
                for (i in array) {
                    console.log(i + " :::" + array[i]);
                    accountingDetails[i] = array[i].split("|").map(function (val) { return val; });
                    // console.log(accountingDetails[i][0])
                    let v_account = accountingDetails[i][2];
                    let payAmount = accountingDetails[i][9]
                    let amountToPay = await getAmountToPay(mysqlPoolQuery, v_account);
                    let status = await getStatus(mysqlPoolQuery, v_account);

                    console.log("應繳金額：" + amountToPay + " >>>>實繳金額 " + payAmount);
                    //金額正確 & 訂單沒過期
                    if (amountToPay == payAmount && status != "expired") {
                        console.log("amountCorrect");
                        await updatePayemtStatus(mysqlPoolQuery, v_account);
                    }
                }
                console.log("====================" + file + "銷帳完成==================");
                //把銷帳過的檔案丟到另一個資料夾
                await fs.rename(__dirname + '/../public/payment/accountStated/' + file, __dirname + '/../public/payment/accountStatedDone/' + file, (err) => {
                    if (err) throw err;
                    // console.log('Rename complete!');
                });
            }
            res.send("accountingDetails");
        }

    })

});

//寄付款成功信件
router.post('/sendPaidMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        /* Helium */
        host: 'server239.web-hosting.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var text = '<h2>付款成功</h2> <p>' + mailInfo.name + '您好：<br>我們已收到您的付款，訂單編號為:<br>' + mailInfo.o_IDs + '，您可以從下列網址追蹤您的訂單。<a href="http://en.wikipedia.org/wiki/Lorem_ipsum" title="Lorem ipsum - Wikipedia, the free encyclopedia">Lorem ipsum</a>  </p>'

    var options = {
        //寄件者
        from: 'noreply@hcat.io',
        //收件者
        to: mailInfo.email,
        //主旨
        subject: '付款成功通知',
        //嵌入 html 的內文
        html: text
    };

    //發送信件方法
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(err);
            res.status(400);
            res.json({ "message": "[Error] Failure :" + err });
        } else {
            console.log('訊息發送: ' + info.response);
            res.status(200);
            res.json({
                "message": "[Success] Success",
                "info": info.response
            });
        }
    });

})

function getInfoFromOrder_list(mysqlPoolQuery, o_id) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT o_symbol,o_email,o_purchaseDate,o_fundCount  FROM order_list WHERE o_id = ?', [o_id], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(DBresult);
                resolve(DBresult[0]);
            }
        });
    })
}

function getFundmanager(mysqlPoolQuery, p_SYMBOL) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT p_fundmanager  FROM product WHERE p_SYMBOL = ?', [p_SYMBOL], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(DBresult);
                resolve(DBresult[0].p_fundmanager);
            }
        });
    })
}

function getBankcode(mysqlPoolQuery, m_id) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT m_bankcode  FROM backend_user WHERE m_id = ?', [m_id], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(DBresult);
                resolve(DBresult[0].m_bankcode);
            }
        });
    })
}

function getUserId(mysqlPoolQuery, u_email) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT u_identityNumber  FROM user WHERE u_email = ?', [u_email], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(DBresult);
                resolve(DBresult[0].u_identityNumber);
            }
        });
    })
}

//將訂單資訊與虛擬帳號綁定
function bindOrder(mysqlPoolQuery, o_id, virtualAccount) {
    return new Promise((resolve, reject) => {
        var sql = { o_bankvirtualaccount: virtualAccount };
        mysqlPoolQuery('UPDATE order_list SET ? WHERE o_id = ?', [sql, o_id], function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}

function countExpiredSolarDay(purchaseDate) {
    return new Promise((resolve, reject) => {
        let purchaseDay = purchaseDate.slice(0, 8);

        let year = parseInt(purchaseDate.slice(0, 4));
        let month = parseInt(purchaseDate.slice(4, 6));
        let day = parseInt(purchaseDate.slice(6, 8));
        console.log(year);
        console.log(month);
        console.log(day);

        let purchase_days_passed = countDays_passed(new Date(year, month - 1, day));
        console.log(purchase_days_passed);
        let expired_days_passed = purchase_days_passed + 3;
        console.log(lpad(expired_days_passed, 3));

        let solarDay = purchaseDay.slice(3, 4) + lpad(expired_days_passed, 3);
        resolve(solarDay)
    })
}

//計算今年的第幾天
function countDays_passed(date) {
    var current = new Date(date.getTime());
    var previous = new Date(date.getFullYear(), 0, 1);

    return Math.ceil((current - previous + 1) / 86400000);
}

//補足位數
function lpad(value, padding) {
    var zeroes = new Array(padding + 1).join("0");
    return (zeroes + value).slice(-padding);
}

function calculateCheckCode(v_13digits, m_11digits) {
    let value1 = 0;
    let weightingarray1 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5];
    for (i = 0; i < 13; i++) {
        value1 += parseInt(v_13digits[i]) * parseInt(weightingarray1[i]);
    }
    console.log(value1);
    let value2 = 0;
    let weightingarray2 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3];
    for (i = 0; i < 11; i++) {
        value2 += parseInt(m_11digits[i]) * parseInt(weightingarray2[i]);
    }
    console.log(value2);
    let checkCode = (value1 + value2) % 10;
    return checkCode;
}

function getAmountToPay(mysqlPoolQuery, virtualAccount) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT o_fundCount  FROM order_list WHERE o_bankvirtualaccount = ?', [virtualAccount], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                // console.log(DBresult);
                resolve(DBresult[0].o_fundCount);
            }
        });
    })
}

function getStatus(mysqlPoolQuery, virtualAccount) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT o_paymentStatus  FROM order_list WHERE o_bankvirtualaccount = ?', [virtualAccount], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(DBresult);
                resolve(DBresult[0].o_paymentStatus);
            }
        });
    })
}

function updatePayemtStatus(mysqlPoolQuery, virtualAccount) {
    return new Promise((resolve, reject) => {
        var sql = { o_paymentStatus: "paid" };
        mysqlPoolQuery('UPDATE order_list SET ? WHERE o_bankvirtualaccount = ?', [sql, virtualAccount], function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve();
            }
        });

    })
}

module.exports = router;
