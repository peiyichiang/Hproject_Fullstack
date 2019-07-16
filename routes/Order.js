var express = require('express');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');
var async = require('async');
var router = express.Router();

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

    var qur = mysqlPoolQuery('INSERT INTO order_list SET ?', sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "訂單寫入資料庫失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "訂單寫入資料庫成功",
                "result": result
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
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol, email, authLevel, fundingType, buyAmount, isComplied, reason = '', errInput;
    if (req.body.symbol) {
        symbol = req.body.symbol;
        email = req.body.email;
        authLevel = req.body.authLevel;
        buyAmount = Number(req.body.buyAmount);
        fundingType = req.body.fundingType;
    } else {
        symbol = req.query.symbol;
        email = req.query.email;
        authLevel = req.query.authLevel;
        buyAmount = Number(req.query.buyAmount);
        fundingType = req.query.fundingType;
    }
    console.log('symbol', symbol, 'email', email, 'authLevel', authLevel, 'buyAmount', buyAmount, 'fundingType', fundingType);

    var fundingTypeArray = ["PublicOffering", "PrivatePlacement", "1", "2"];
    //fundingType= PO: 1, PP: 2

    var qur = mysqlPoolQuery(
        'SELECT SUM(o_fundCount) AS total FROM order_list WHERE o_symbol = ? AND o_email = ? AND (o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished")', [symbol, email], function (err, orderBalance) {
            if (err) {
                console.log(err);
                res.status(400);
                res.json({ "message": "[Error] Failure :" + err });
            } else if (!Number.isInteger(Number(authLevel))) {
                reason = 'authLevel is not an integer';
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

            } else if (isNaN(buyAmount)) {
                reason = 'buyAmount should not be NaN';
                errInput = buyAmount;
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
                res.status(200);
                console.log('\norderBalance', orderBalance[0].total);
                isComplied = doesPassCompliance(authLevel, orderBalance[0].total, buyAmount, fundingType);
                res.json({
                    "message": "[Success] Success",
                    "orderBalance": orderBalance[0].total,
                    "isComplied": isComplied
                });
            }
        });
});

/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/


function PersonClassified(maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate) {
    this.maxBuyAmountPublic = maxBuyAmountPublic;
    this.maxBalancePublic = maxBalancePublic;
    this.maxBuyAmountPrivate = maxBuyAmountPrivate;
    this.maxBalancePrivate = maxBalancePrivate;
}
//maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate
let NaturalPerson = new PersonClassified(0, 0, Infinity, Infinity);
let ProfInstitutionalInvestor = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let HighNetworthInvestmentLegalPerson = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let LegalPersonOrFundOfProfInvestor = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let NaturalPersonOfProfInvestor = new PersonClassified(300000, 300000, Infinity, Infinity);

const COMPLIANCE_LEVELS = {
    "currencyType": "NTD",
    "1": NaturalPerson,
    "2": ProfInstitutionalInvestor,
    "3": HighNetworthInvestmentLegalPerson,
    "4": LegalPersonOrFundOfProfInvestor,
    "5": NaturalPersonOfProfInvestor
};

const doesPassCompliance = (authLevel, balance, buyAmount, fundingType) => {
    console.log('authLevel', authLevel, typeof authLevel, 'balance', balance, typeof balance, 'buyAmount', buyAmount, typeof buyAmount, 'fundingType', fundingType, typeof fundingType);

    if (fundingType === "PublicOffering" || fundingType === '1') {
        console.log("inside fundingType == PublicOffering\n", COMPLIANCE_LEVELS[authLevel]);
        if (buyAmount > COMPLIANCE_LEVELS[authLevel].maxBuyAmountPublic) {
            console.log("buyAmount should be <= maxBuyAmountPublic;", buyAmount, COMPLIANCE_LEVELS[authLevel].maxBuyAmountPublic);
            return false;

        } else if (balance + buyAmount > COMPLIANCE_LEVELS[authLevel].maxBalancePublic) {
            console.log("balance + buyAmount should be <= maxBalancePublic;", balance, buyAmount, COMPLIANCE_LEVELS[authLevel].maxBalancePublic);
            return false;
        } else {
            console.log("passing both buyAmount and new balance regulation in the Public Offering case");
            return true;
        }

    } else if (fundingType === "PrivatePlacement" || fundingType === '2') {
        console.log("inside fundingType == PrivatePlacement\n", COMPLIANCE_LEVELS[authLevel]);
        if (buyAmount > COMPLIANCE_LEVELS[authLevel].maxBuyAmountPrivate) {
            console.log("buyAmount should be <= maxBuyAmountPrivate;", buyAmount, COMPLIANCE_LEVELS[authLevel].maxBuyAmountPrivate);
            return false;

        } else if (balance + buyAmount > COMPLIANCE_LEVELS[authLevel].maxBalancePrivate) {
            console.log("balance + buyAmount should be <= maxBalancePrivate;", balance, buyAmount, COMPLIANCE_LEVELS[authLevel].maxBalancePrivate);
            return false;
        } else {
            console.log("passing both buyAmount and new balance regulation in the Private Placement case");
            return true;
        }
    } else {
        console.log('fundingType is not valid', fundingType);
        return false;
    }

}

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
