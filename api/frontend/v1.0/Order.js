var express = require('express');
const jwt = require('jsonwebtoken');
var async = require('async');
const nodemailer = require('nodemailer');
var router = express.Router();
const { checkCompliance } = require('../../../ethereum/contracts/zsetupData');

/**
 * Order Status Types: 
 * 1.waiting: order has been added. Waiting for payment
 * 2.expired: order has passed expiry time and still not paid
 * 3.cancelledByUser: order has been cancelled by the user who made the order.
 * 4.pendingByPlatform: order has been changed to this status by the platform
 * 5.paid: order has been paid in full
 * 6.txnFinished: order has been added to the CrowdFunding contract 
 */

router.post('/AddOrder', async function (req, res, next) {
    console.log('------------------------==\n@Order/POST/AddOrder');
    const symbol = req.body.symbol;
    console.log('req.query', req.query, 'req.body', req.body);

    var mysqlPoolQuery = req.pool;
    //當前時間
    var timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    var currentDate = new Date();
    var purchasedDate = currentDate.myFormat();//yyyymmddhhmm
    console.log('---------------== purchasedDate:', purchasedDate);
    var expiredDate = await new Date(currentDate.setDate(currentDate.getDate() + 3)).myFormat();
    console.log('---------------== expiredDate:', expiredDate);
    const nationalId = req.body.userIdentity;
    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);
    const email = req.body.email;
    const tokenCount = req.body.tokenCount;
    const fundCount = req.body.fundCount
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

    console.log(sql);
    const JWT = req.body.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery('INSERT INTO order_list SET ?', sql, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "訂單寫入資料庫失敗:\n" + err
                    });
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
                            res.status(400)
                            res.json({
                                "message": "驗證信寄送失敗：" + err
                            })
                        }
                        else {
                            res.status(200);
                            res.json({
                                "message": "訂單寫入資料庫成功 & 驗證信寄送成功",
                                "result": orderId
                            });
                        }
                        // console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    });
                }
            });
        }
    })
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
});

// router.get('/SumAllOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumAllOrdersBySymbol');
//     var mysqlPoolQuery = req.pool;
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol;
//     if (req.body.symbol) {
//         symbol = req.body.symbol;
//     } else { symbol = req.query.symbol; }

//     var qur = mysqlPoolQuery(
//         'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ?', symbol, function (err, result) {
//             if (err) {
//                 console.log(err);
//                 res.status(400);
//                 res.json({
//                     "message": "[Error] Failure :\n" + err
//                 });
//             } else {
//                 res.status(200);
//                 res.json({
//                     "message": "[Success] Success",
//                     "result": result
//                 });
//             }
//         });
// });

//http://localhost:3000/Order/SumWaitingOrdersBySymbol
// router.get('/SumWaitingOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumWaitingOrdersBySymbol');
//     let qstr1 = 'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?';
//     var mysqlPoolQuery = req.pool;
//     const status = 'waiting';
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol, userId, qstrz;
//     if (req.body.symbol) {
//         symbol = req.body.symbol; userId = req.body.userId;
//     } else {
//         symbol = req.query.symbol; userId = req.query.userId;
//         if (userId) {
//             qstrz = qstr1 + ' AND o_fromAddress = ?';
//         } else { qstrz = qstr1; }
//     }
//     var qur = mysqlPoolQuery(qstrz, [symbol, status], function (err, result) {
//         if (err) {
//             console.log(err);
//             res.status(400);
//             res.json({
//                 "message": "[Error] Failure :\n" + err
//             });
//         } else {
//             res.status(200);
//             res.json({
//                 "message": "[Success] Success",
//                 "result": result
//             });
//         }
//     });
// });

router.get('/OrdersByEmail', function (req, res, next) {
    console.log('------------------------==\n@Order/OrdersByEmail');
    let qstr1 = 'SELECT * FROM order_list WHERE o_email = ?';
    var mysqlPoolQuery = req.pool;
    let status, qstrz;
    status = req.query.status;
    if (status) {
        qstrz = qstr1 + ' AND (';
        for (var i = 0; i < status.length; i++) {
            if (i != status.length - 1) {
                qstrz = qstrz + `o_paymentStatus = '${status[i]}' OR `
            } else {
                qstrz = qstrz + `o_paymentStatus = '${status[i]}'`
            }
        }
        qstrz = qstrz + ')'
    } else { qstrz = qstr1; }
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            const email = decoded.u_email;
            mysqlPoolQuery(qstrz, [email, status], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] Failure :\n" + err
                    });
                } else {
                    res.status(200);
                    res.json({
                        "message": "[Success] Success",
                        "result": result
                    });
                }
            });
        }
    })
});
/*
 * 
 *
 *
 * 
 */
router.get('/OrdersByStatus', function (req, res, next) {
    console.log('------------------------==\n@Order/OrdersByStatus');
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            /* 宣告 */
            const mysqlPoolQuery = req.pool;
            const email = decoded.u_email;
            const status = req.query.status;
            let statusString = '';
            let query = `
                SELECT  o_id AS Id,
                        o_symbol AS name,
                        o_fundCount AS price,
                        o_tokenCount AS tokenCount,
                        o_paymentStatus AS status,
                        o_bankvirtualaccount AS virtualAccount
                FROM    order_list 
                WHERE   o_email = ? 
                AND
                `;
            const responseHandler = (err, result) => {
                if (err) {
                    res.status(400).send({ "message": "取得投資人訂單失敗: " + err })
                    console.error(err);
                } else {
                    if (result.length === 0) {
                        res.status(404).send({ "message": "找不到符合狀態的訂單" })
                    } else {
                        res.status(200).json({
                            "message": "取得投資人訂單成功",
                            "result": result
                        });
                    }
                }
            }

            /* 執行 */
            if (typeof (status) === 'string') {
                statusString += 'o_paymentStatus = \'' + status + '\''
            } else {
                statusString = status.reduce((acc, cur, index) => {
                    if (index === status.length - 1) {
                        return acc += 'o_paymentStatus = \'' + cur + '\''
                    } else {
                        return acc += 'o_paymentStatus = \'' + cur + '\'' + ' OR '
                    }
                }, '');
            }
            query += '(' + statusString + ')';
            mysqlPoolQuery(query, email, responseHandler);
        }
    })
});

// router.get('/OrdersByFromAddr', function (req, res, next) {
//     console.log('------------------------==\n@Order/OrdersByFromAddr');
//     let qstr1 = 'SELECT * FROM order_list WHERE o_fromAddress = ?';
//     var mysqlPoolQuery = req.pool;
//     console.log('req.query', req.query, 'req.body', req.body);
//     let status, userId, qstrz;
//     if (req.body.userId) {
//         userId = req.body.userId; status = req.body.status;
//     } else {
//         userId = req.query.userId; status = req.query.status;
//         if (status) {
//             qstrz = qstr1 + ' AND o_paymentStatus = ?';
//         } else { qstrz = qstr1; }
//     }
//     var qur = mysqlPoolQuery(qstrz, [userId, status], function (err, result) {
//         if (err) {
//             console.log(err);
//             res.status(400);
//             res.json({
//                 "message": "[Error] Failure :\n" + err
//             });
//         } else {
//             res.status(200);
//             res.json({
//                 "message": "[Success] Success",
//                 "result": result
//             });
//         }
//     });
// });

// router.get('/SumCancelledOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumCancelledOrdersBySymbol');
//     var mysqlPoolQuery = req.pool; const status = 'cancelledByUser';
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol;
//     if (req.body.symbol) {
//         symbol = req.body.symbol;
//     } else { symbol = req.query.symbol; }

//     var qur = mysqlPoolQuery(
//         'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status], function (err, result) {
//             if (err) {
//                 console.log(err);
//                 res.status(400);
//                 res.json({
//                     "message": "[Error] Failure :\n" + err
//                 });
//             } else {
//                 res.status(200);
//                 res.json({
//                     "message": "[Success] Success",
//                     "result": result
//                 });
//             }
//         });
// });

// router.get('/SumExpiredOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumExpiredOrdersBySymbol');
//     var mysqlPoolQuery = req.pool; const status = 'expired';
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol;
//     if (req.body.symbol) {
//         symbol = req.body.symbol;
//     } else { symbol = req.query.symbol; }

//     var qur = mysqlPoolQuery(
//         'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status], function (err, result) {
//             if (err) {
//                 console.log(err);
//                 res.status(400);
//                 res.json({
//                     "message": "[Error] Failure :\n" + err
//                 });
//             } else {
//                 res.status(200);
//                 res.json({
//                     "message": "[Success] Success",
//                     "result": result
//                 });
//             }
//         });
// });

// router.get('/SumPendingOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumPendingOrdersBySymbol');
//     var mysqlPoolQuery = req.pool; const status = 'pendingByPlatform';
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol;
//     if (req.body.symbol) {
//         symbol = req.body.symbol;
//     } else { symbol = req.query.symbol; }
//     var qur = mysqlPoolQuery(
//         'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status], function (err, result) {
//             if (err) {
//                 console.log(err);
//                 res.status(400);
//                 res.json({
//                     "message": "[Error] Failure :\n" + err
//                 });
//             } else {
//                 res.status(200);
//                 res.json({
//                     "message": "[Success] Success",
//                     "result": result
//                 });
//             }
//         });
// });

router.get('/SumPaidOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumPaidOrdersBySymbol');
    var mysqlPoolQuery = req.pool; const status = 'paid';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    var qur = mysqlPoolQuery(
        'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status], function (err, result) {
            if (err) {
                console.log(err);
                res.status(400);
                res.json({
                    "message": "[Error] Failure :\n" + err
                });
            } else {
                res.status(200);
                res.json({
                    "message": "[Success] Success",
                    "result": result
                });
            }
        });
});

// router.get('/SumTxnFinishedOrdersBySymbol', function (req, res, next) {
//     console.log('------------------------==\n@Order/SumTxnFinishedOrdersBySymbol');
//     var mysqlPoolQuery = req.pool; const status = 'txnFinished';
//     console.log('req.query', req.query, 'req.body', req.body);
//     let symbol;
//     if (req.body.symbol) {
//         symbol = req.body.symbol;
//     } else { symbol = req.query.symbol; }
//     var qur = mysqlPoolQuery(
//         'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status], function (err, result) {
//             if (err) {
//                 console.log(err);
//                 res.status(400);
//                 res.json({
//                     "message": "[Error] Failure :\n" + err
//                 });
//             } else {
//                 res.status(200);
//                 res.json({
//                     "message": "[Success] Success",
//                     "result": result
//                 });
//             }
//         });
// });

router.get('/SumReservedOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumReservedOrdersBySymbol');
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND (o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished")', [symbol], function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({
                            "message": "[Error] Failure :\n" + err
                        });
                    } else {
                        res.status(200);
                        res.json({
                            "message": "[Success] Success",
                            "result": result
                        });
                    }
                });
        }
    })
});

router.get('/CheckOrderCompliance', function (req, res, next) {
    console.log('------------------------==\n@Order/CheckOrderCompliance');
    let mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol, email, authLevel, fundingType, orderPayment, reason = '', errInput;

    if (req.body.symbol) {
        symbol = req.body.symbol;
        email = req.body.email;
        authLevel = req.body.authLevel;
        orderPayment = parseInt(req.body.fundCount);
        fundingType = req.body.fundingType;
    } else {
        symbol = req.query.symbol;
        email = req.query.email;
        authLevel = req.query.authLevel;
        orderPayment = parseInt(req.query.fundCount);
        fundingType = req.query.fundingType;
    }
    console.log('symbol', symbol, 'email', email, '\nauthLevel', authLevel, 'orderPayment', orderPayment, 'fundingType', fundingType);
    const fundingTypeArray = ['PublicOffering', 'PrivatePlacement', '1', '2'];//PO: 1, PP: 2
    const authLevelArray = ['1', '2', '3', '4', '5'];
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                'SELECT SUM(o_fundCount) AS total FROM order_list WHERE o_symbol = ? AND o_email = ? AND (o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished")', [symbol, email], function (err, result) {
                    let orderBalanceTotal = parseInt(result[0].total);
                    if (isNaN(orderBalanceTotal)) { orderBalanceTotal = 0; }

                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({ "message": "[Error] Failure :" + err });

                    } else if (!authLevelArray.includes(authLevel)) {
                        reason = 'authLevel is not not valid';
                        errInput = authLevel;
                        console.log(reason, authLevel);
                        res.status(400);
                        res.json({ "message": "[Error input]:" + reason + '...' + errInput });

                    } else if (authLevel < 1 || authLevel > 5) {
                        reason = 'authLevel is out of range';
                        errInput = authLevel;
                        console.log(reason, authLevel);
                        res.status(400);
                        res.json({ "message": "[Error input]:" + reason + '...' + errInput });

                    } else if (isNaN(orderPayment)) {
                        reason = 'orderPayment should not be NaN';
                        errInput = orderPayment;
                        res.status(400);
                        console.log(reason, authLevel);
                        res.json({ "message": "[Error input]:" + reason + '...' + errInput });

                    } else if (isNaN(orderBalanceTotal)) {
                        reason = 'orderBalanceTotal should not be NaN';
                        errInput = orderBalanceTotal;
                        res.status(400);
                        console.log(reason, authLevel);
                        res.json({ "message": "[Error input]:" + reason + '...' + errInput });

                    } else if (!fundingTypeArray.includes(fundingType)) {
                        reason = 'fundingType is not valid';
                        errInput = fundingType;
                        console.log(reason, authLevel);
                        res.status(400);
                        res.json({ "message": "[Error input]:" + reason + '...' + errInput });

                    } else {
                        const results1 = checkCompliance(authLevel, orderBalanceTotal, orderPayment, fundingType);
                        if (results1) {
                            res.status(200);
                            console.log('\norderBalance', orderBalanceTotal);
                            res.json({
                                "message": "[Success] Success",
                                "orderBalance": orderBalanceTotal
                            });

                        } else {
                            reason = `does not pass compliance`;
                            errInput = fundingType;
                            console.log(reason, ', authLevel', authLevel);
                            res.status(400).send('[Error input]:' + reason + '...' + errInput);
                        }
                    }
                }
            );
        }
    })
});

//通過User ID獲取paid Order
router.get('/getPaidOrdersByUserEmail', function (req, res, next) {
    console.log('------------------------==\n@Order/getPaidOrdersByUserEmail');
    var token = req.query.JWT_Token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "privatekey", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                console.log("＊:JWT token驗證失敗");
                console.log(err);
                res.json({
                    "message": "JWT token is invalid.",
                    "success": false
                });
                return;
            } else {
                //JWT token驗證成功
                // console.log("＊JWT Content:" + decoded.u_email);
                //從order中查找完成的訂單，計算該使用者的資產
                var mysqlPoolQuery = req.pool;
                mysqlPoolQuery('SELECT DISTINCT o_symbol FROM order_list WHERE o_email = ? AND o_paymentStatus = ?', [decoded.u_email, "paid"], async function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({
                            "message": "[Success] 查找資產失敗",
                            "success": false,
                        });
                    } else {
                        // 生成sql查詢語句
                        sqls = [];
                        symbols = [];
                        for (var i = 0; i < rows.length; i++) {
                            sqls.push('SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_email = "' + decoded.u_email + '" AND o_symbol = "' + rows[i].o_symbol + '" AND o_paymentStatus = "paid"');
                            symbols.push(rows[i].o_symbol);
                        }

                        // 使用async.eachSeries執行sql查詢語句(確保上一句執行完後才執行下一句)
                        var count = -1;
                        var data = {};
                        async.eachSeries(sqls, function (item, callback) {
                            // 遍历每条SQL并执行
                            mysqlPoolQuery(item, function (err, results) {
                                if (err) {
                                    // 异常后调用callback并传入err
                                    callback(err);
                                } else {
                                    count++;
                                    data[symbols[count]] = results[0].total;
                                    // 执行完成后也要调用callback，不需要参数
                                    callback();
                                }
                            });
                        }, function (err) {
                            // 所有SQL执行完成后回调
                            if (err) {
                                console.log(err);
                            } else {
                                //console.log("SQL全部执行成功");
                                res.json({
                                    "message": "[Success] 查找資產成功",
                                    "success": true,
                                    "MyAsset": data,
                                    "AssetSymbols": symbols
                                });
                            }
                        });
                    }

                });
            }
        })
    } else {
        //不存在JWT token
        console.log("＊:不存在JWT token");
        res.json({
            "message": "No JWT Token.Please login.",
            "success": false
        });
        return;
    }
});

module.exports = router;
