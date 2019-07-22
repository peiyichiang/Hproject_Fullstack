var express = require('express');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');
var async = require('async');
const nodemailer = require('nodemailer');
var router = express.Router();

const { checkCompliance } = require('../ethereum/contracts/zsetupData');

/**
 * Order Status Types: 
 * 1.waiting: order has been added. Waiting for payment
 * 2.expired: order has passed expiry time and still not paid
 * 3.cancelledByUser: order has been cancelled by the user who made the order.
 * 4.pendingByPlatform: order has been changed to this status by the platform
 * 5.paid: order has been paid in full
 * 6.txnFinished: order has been added to the CrowdFunding contract 
 */
//新增資料：接收資料的post http://localhost:3000/Order/AddOrder
router.post('/AddOrder', function (req, res, next) {
    console.log('------------------------==\n@Order/POST/AddOrder');
    const symbol = req.body.symbol;
    console.log('req.query', req.query, 'req.body', req.body);

    var mysqlPoolQuery = req.pool;
    //當前時間
    var timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    var currentDate = new Date().myFormat();//yyyymmddhhmm
    console.log('---------------== currentDate:', currentDate);
    const nationalId = req.body.userIdentity;
    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);
    const email = req.body.email;
    const tokenCount = req.body.tokenCount;

    var sql = {
        o_id: orderId,
        o_symbol: symbol,
        o_email: email,
        o_txHash: Math.random().toString(36).substring(2, 15),
        o_tokenCount: req.body.tokenCount,
        o_fundCount: req.body.fundCount,
        o_purchaseDate: currentDate,
        o_paymentStatus: "waiting"
    };//random() to prevent duplicate NULL entry!

    console.log(sql);

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
                subject: '', // Subject line
                html: `<h2>付款成功</h2> <p>您好：我們已收到您的訂單<br>
                訂單編號為:${orderId}<br>
                您這次購買 ${symbol} 共 ${tokenCount} 片</p>`, // plain text body
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
                    });
                }
                // console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
            });
        }
    });
});

//SELECT SUM(o_tokenCount) AS total FROM `order` WHERE o_symbol = 'MYRR1701';
//http://localhost:3000/Order/SumAllOrdersBySymbol
router.get('/SumAllOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumAllOrdersBySymbol');
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }

    var qur = mysqlPoolQuery(
        'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ?', symbol, function (err, result) {
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

//http://localhost:3000/Order/SumWaitingOrdersBySymbol
router.get('/SumWaitingOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumWaitingOrdersBySymbol');
    let qstr1 = 'SELECT SUM(o_tokenCount) AS total FROM order_list WHERE o_symbol = ? AND o_paymentStatus = ?';
    var mysqlPoolQuery = req.pool;
    const status = 'waiting';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol, userId, qstrz;
    if (req.body.symbol) {
        symbol = req.body.symbol; userId = req.body.userId;
    } else {
        symbol = req.query.symbol; userId = req.query.userId;
        if (userId) {
            qstrz = qstr1 + ' AND o_fromAddress = ?';
        } else { qstrz = qstr1; }
    }
    var qur = mysqlPoolQuery(qstrz, [symbol, status], function (err, result) {
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

//http://localhost:3000/Order/OrdersByEmail
router.get('/OrdersByEmail', function (req, res, next) {
    console.log('------------------------==\n@Order/OrdersByEmail');
    let qstr1 = 'SELECT * FROM order_list WHERE o_email = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, email, qstrz;
    email = req.query.email; status = req.query.status;
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
    console.log(qstrz)
    var qur = mysqlPoolQuery(qstrz, [email, status], function (err, result) {
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

//http://localhost:3000/Order/OrdersByFromAddr
router.get('/OrdersByFromAddr', function (req, res, next) {
    console.log('------------------------==\n@Order/OrdersByFromAddr');
    let qstr1 = 'SELECT * FROM order_list WHERE o_fromAddress = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, userId, qstrz;
    if (req.body.userId) {
        userId = req.body.userId; status = req.body.status;
    } else {
        userId = req.query.userId; status = req.query.status;
        if (status) {
            qstrz = qstr1 + ' AND o_paymentStatus = ?';
        } else { qstrz = qstr1; }
    }
    var qur = mysqlPoolQuery(qstrz, [userId, status], function (err, result) {
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

//http://localhost:3000/Order/SumCancelledOrdersBySymbol
router.get('/SumCancelledOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumCancelledOrdersBySymbol');
    var mysqlPoolQuery = req.pool; const status = 'cancelledByUser';
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

//http://localhost:3000/Order/SumExpiredOrdersBySymbol
router.get('/SumExpiredOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumExpiredOrdersBySymbol');
    var mysqlPoolQuery = req.pool; const status = 'expired';
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

//http://localhost:3000/Order/SumPendingOrdersBySymbol
router.get('/SumPendingOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumPendingOrdersBySymbol');
    var mysqlPoolQuery = req.pool; const status = 'pendingByPlatform';
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


//http://localhost:3000/Order/SumPaidOrdersBySymbol
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


//http://localhost:3000/Order/SumTxnFinishedOrdersBySymbol
router.get('/SumTxnFinishedOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumTxnFinishedOrdersBySymbol');
    var mysqlPoolQuery = req.pool; const status = 'txnFinished';
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


//http://localhost:3000/Order/SumReservedOrdersBySymbol
router.get('/SumReservedOrdersBySymbol', function (req, res, next) {
    console.log('------------------------==\n@Order/SumReservedOrdersBySymbol');
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    var qur = mysqlPoolQuery(
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
});


//http://localhost:3000/Order/CheckOrderCompliance
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
    const authLevelArray = ['1', '2' ,'3', '4', '5'];
    
    let qur = mysqlPoolQuery(
        'SELECT SUM(o_fundCount) AS total FROM order_list WHERE o_symbol = ? AND o_email = ? AND (o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished")', [symbol, email], function (err, result) {
            let orderBalanceTotal = parseInt(result[0].total);
            if(isNaN(orderBalanceTotal)){orderBalanceTotal = 0;}

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
                const results1 = checkCompliance(authLevel, orderBalanceTotal, orderPayment,  fundingType);
                if (results1){
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
                  res.status(400);
                  res.json({ "message": "[Error input]:" + reason + '...' + errInput });
                }                  
            }
        });
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

    function objectify(key, value) {
        console.log("＊＊＊:" + { [key]: value });
        return {
            [key]: value
        };
    }
});

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

module.exports = router;
