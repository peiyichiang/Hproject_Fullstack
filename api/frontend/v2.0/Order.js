var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
const nodemailer = require('nodemailer');
const TokenGenerator = require('./TokenGenerator');
const { checkCompliance } = require('../../../ethereum/contracts/zsetupData');
const { getTimeServerTime } = require('../../../timeserver/utilities');

router.use(function (req, res, next) {

    const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEY, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '10m', notBefore: '2s' });
    var token = req.headers['x-access-token'];


    if (token) {
        jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
            req.decoded = decoded;
            new_token = tokenGenerator.refresh(token, { verify: { audience: 'myaud', issuer: 'myissuer' }, jwtid: '2' });
            req.headers['x-access-token'] = new_token;
            next();
        }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

router.get('/QueryOrder', function(req,res){
    console.log("This is QueryOrder API");
    var _userEmail = req.decoded.data.u_email;
    console.log(_userEmail)
    // _userEmail = 'ivan55660228@gmail.com';
    const query = req.frontendPoolQuery;
    if (_userEmail){
        query('queryOrder',[_userEmail]).then((result) => {
            var string=JSON.stringify(result); 
            var data = JSON.parse(string);
            data = formating(data);
            if (data.length != 0){
                return res.status(200).json({success:"True",data: data, new_token: req.headers['x-access-token']});
            }else{
                // return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']});
                return res.status(200).json({success: "True", message: "this user has no order", new_token: req.headers['x-access-token']});
            }
        }).catch((err => {
            console.log(err);
            return res.status(500).json({success: "False", message: "sql error", new_token: req.headers['x-access-token']});
        }))
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
    function formating(data){
        newData = []                                // the output data for new format
        data.forEach(function(item, index, array){
            key = Object.keys(item);                // all the sql result has a key see mysql.js
            if(key=="main"){
                item[key].forEach(function(obj){
                    if(obj.status == 'waiting'){  // this is waiting
                        obj.date = obj.date.substring(0,10).replace(/[-]/g,'')+obj.temp_date.substring(7,12)
                        
                    }
                    delete obj.temp_date
                    newData.push(obj);
                })
            }// forEach 就如同 for，不過寫法更容易
        });
        return newData
    }
})

const remainRelease = (query,symbol) => {
    return new Promise(function (resolve, reject) {
        query('remainRelease_Order',[symbol]).then((result) => {
            var string = JSON.stringify(result); 
            var data = JSON.parse(string);
            var remainRelease = data[0][0].remainRelease;
            if (remainRelease){
                resolve(remainRelease);
            }else{
                resolve(-1);
            }
        }).catch((err => {
            console.log("sql error\n"+ err);
            resolve(-1);
        }))
    });
  }

router.get('/RemainRelease',async function(req,res){
    console.log("This is RemainRelease API");
    const symbol = req.body.symbol;
    const query = req.frontendPoolQuery;
    if (symbol){
        var data = await remainRelease(query,symbol);
        if(data){
            return res.status(200).json({success: "True", remainRelease: data, new_token: req.headers['x-access-token']});
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']});
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
})

//檢查下單資格
router.get('/QualifyPlaceOrder',async function(req,res){
    var mysqlPoolQuery = req.pool;
    // 判斷案場是否仍在可下單的時間內 大於 CFSD 且 小於 CFED
    const symbol = req.body.symbol;
    if(symbol){
        const time = await getTimeServerTime();
        var result = await getSymbolCFSDCFED(mysqlPoolQuery,symbol);
        var cfsd = Number(result.p_CFSD);
        var cfed = Number(result.p_CFED);
        if(cfsd && cfed){
            if(time < cfsd || time > cfed){
                return res.status(200).json({success: "True", quaification: false, message: "非合法購買時間", new_token: req.headers['x-access-token']})
            }
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
    
    //要改用jwt取得
    // const email = 'ivan55660228@gmail.com';
    const email = req.decoded.data.u_email;
    console.log(email)
    if(email){
        var UserVerifyStatus = await getUserVerifyStatus(mysqlPoolQuery,email);
        if(UserVerifyStatus){
            if(UserVerifyStatus == 3){
                return res.status(200).json({success: "True", quaification: true, new_token: req.headers['x-access-token']});
            }else{
                var message = "";
                if(UserVerifyStatus == 2){
                    message = "第二階段註冊尚未完成審核"
                }else if(UserVerifyStatus == 1){
                    message = "已完成一階段註冊但尚未第二階段註冊"
                }else{
                    message = "一階段註冊尚未完成信箱驗證"
                }
                return res.status(200).json({success: "True", quaification: false, message: message, new_token: req.headers['x-access-token']});
            }
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
     
    function getUserVerifyStatus(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_verify_status  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve(DBresult[0].u_verify_status);
                }
            });
        })
    }
    function getSymbolCFSDCFED(mysqlPoolQuery, symbol){
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT p_CFSD,p_CFED  FROM product WHERE p_SYMBOL = ?', [symbol], function (err, DBresult, rows) {
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
    
})

router.post('/PlaceOrder', async function(req,res){
    console.log('------------------------==\n@Order/GET/PlaceOrder');
    const symbol = req.body.symbol;
    const mysqlPoolQuery = req.pool;
    const query = req.frontendPoolQuery;

    //當前時間
    var timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    var currentDate = new Date();
    var purchasedDate = currentDate.myFormat();//yyyymmddhhmm
    console.log('---------------== purchasedDate:', purchasedDate);
    var expiredDate = await new Date(currentDate.setDate(currentDate.getDate() + 3)).myFormat();
    console.log('---------------== expiredDate:', expiredDate);
    // 要用jwt來取資料
    // const nationalId = req.decoded.userIdentity;
    // const email = req.decoded.email;
    // const nationalId = 'A128465975';
    // const email = 'ivan55660228@gmail.com';
    const nationalId = req.decoded.data.u_identityNumber;
    const email = req.decoded.data.u_email;
    console.log(nationalId);
    console.log(email);
    const tokenCount = req.body.tokenCount;
    const fundCount = req.body.fundCount


    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);
    
    let userName;

    const bankVirtualAccount = await getBankVirtualAccount(orderId, symbol, email, expiredDate, fundCount);

    var sql = {
        o_id: orderId,
        o_symbol: symbol,
        o_email: email,
        o_txHash: Math.random().toString(36).substring(2, 15),
        o_tokenCount: tokenCount,
        o_fundCount: fundCount,
        o_purchaseDate: purchasedDate,
        o_paymentStatus: "waiting",
        o_bankvirtualaccount: bankVirtualAccount
    };//random() to prevent duplicate NULL entry!

    var remain = await remainRelease(query,symbol);
    if(tokenCount <= remain){
        mysqlPoolQuery('INSERT INTO order_list SET ?', sql, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({success: "False", message: "訂單寫入資料庫失敗:\n", new_token: req.headers['x-access-token']});
            } else {
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
    
                // setup email data with unicode symbols
                let mailOptions = {
                    from: ' <noreply@hcat.io>', // sender address
                    to: email, // list of receivers
                    subject: 'HCAT下單成功', // Subject line
                    html: `<h2>下單成功</h2>
                    <p>
                    <p>親愛的您好:<br>
                    <p>您剛下了一張訂單，此次購買 ${symbol} 共 ${tokenCount} 片，總計 ${fundCount} 元<br>
                    <p>請參照以下指示完成您的付款。<br><br>
                    <p>請儘快使用網路銀行、網絡 eATM 轉帳付款，或至就近銀行或郵局的 ATM 自動提款機輸入以下帳號及金額完成付款。<br><br>
    
                    <p>訂單編號: ${orderId}<br>
                    <p>購買時間: ${purchasedDate}<br>
                    <p>銀行代碼: 永豐銀行807
                    <p>轉帳帳號名: 銀鏈資產管理有限公司
                    <p>轉帳帳號: ${bankVirtualAccount}
                    <p>總金額: NT$${fundCount}
                    </p>`, // plain text body
                };
    
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(404).json({success: "False", message: "驗證信寄送失敗"+err, new_token: req.headers['x-access-token']});
                    }
                    else {
                        data = [{ "purchaseDate":purchasedDate , "orderId":orderId , "bankaccount":bankVirtualAccount}]
                    }
                    // console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    return res.status(200).json({success:"True",data: data, new_token: req.headers['x-access-token']});
                });
            }
        });
    }else{
        return res.status(404).json({success: "False", message: "下單數超過可購買數量", new_token: req.headers['x-access-token']});
    }
    
    /* TODO */
    function getBankVirtualAccount(orderId, symbol, email, expiredDate, fundCount) {
        return new Promise(async (resolve, reject) => {
            /**專案代號(3) oid(2) 身分證字號(3) 太陽日(5) 檢查碼(1) */
            let o_id = orderId;
            console.log(req.body);

            // SELECT table: product in: p_SYMBOL out: p_fundmanager
            // SELECT table: backend_user in: m_id out: m_bankcode
            // SELECT table: user in: u_email out:u_identityNumber, u_name
            let mysqlPoolQuery = req.pool;
            // let DBresult = await getInfoFromOrder_list(mysqlPoolQuery, o_id);
            console.log("o_symbol:" + symbol);
            let amountToPaid = fundCount;
            let fundmanager = await getFundmanager(mysqlPoolQuery, symbol);
            let bankcode = await getBankcode(mysqlPoolQuery, fundmanager);
            console.log(email);
            let userId = await getUserId(mysqlPoolQuery, email);
            let userName = await getUserName(mysqlPoolQuery, email);


            // 計算太陽日
            let expiredSolarDay = await countExpiredSolarDay(expiredDate);

            // 計算檢查碼
            let virtualAccount_13digits = bankcode + o_id.slice(-2) + userId.slice(-3) + expiredSolarDay;
            console.log(virtualAccount_13digits);
            let amountToPaid_11digits = lpad(amountToPaid, 11);
            console.log(amountToPaid_11digits);
            let checkCode = await calculateCheckCode(virtualAccount_13digits, amountToPaid_11digits);

            //產生14碼虛擬帳號
            let virtualAccount = bankcode + o_id.slice(-2) + userId.slice(-3) + expiredSolarDay + checkCode;


            //todo 將訂單資訊與虛擬帳號綁定 UPDATE table: order_list in: o_bankvirtualaccount
            // await bindOrder(mysqlPoolQuery, o_id, virtualAccount);

            resolve(virtualAccount);
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
                    console.log(p_SYMBOL);
                    console.log(p_SYMBOL);
                    console.log(DBresult);
                    console.log(DBresult);
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
    function getUserName(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_name  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log(DBresult);
                    resolve(DBresult[0].u_name);
                }
            });
        })
    }
    function countExpiredSolarDay(purchaseDate) {
        return new Promise((resolve, reject) => {
            let year = parseInt(expiredDate.slice(0, 4));
            let month = parseInt(expiredDate.slice(4, 6));
            let day = parseInt(expiredDate.slice(6, 8));
            console.log(year);
            console.log(month);
            console.log(day);

            let expired_days_passed = countDays_passed(new Date(year, month - 1, day));
            console.log(expired_days_passed);
            console.log(lpad(expired_days_passed, 3));

            let solarDay = expiredDate.slice(2, 4) + lpad(expired_days_passed, 3);
            console.log("訂單過期太陽日:"+solarDay);

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

    Date.prototype.myFormat = function () {
        return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
    }; 
})


module.exports = router;