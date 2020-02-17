var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

router.get('/SalesReport', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT htoken.order_list.o_symbol,htoken.user.u_name,htoken.order_list.o_purchaseDate,htoken.order_list.o_tokenCount,htoken.order_list.o_fundCount,htoken.order_list.o_txHash from htoken.user,htoken.order_list where htoken.user.u_email=htoken.order_list.o_email', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('SalesReport', { title: 'Sales Report',UserID: JWT_decoded.payload.m_id, data: data });
    });
});

router.get('/IncomeReport', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT investor_assetRecord.ar_tokenSYMBOL,htoken.user.u_name,investor_assetRecord.ar_Time,investor_assetRecord.ar_personal_income from htoken.user,htoken.investor_assetRecord where htoken.user.u_email=htoken.investor_assetRecord.ar_investorEmail', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('IncomeReport', { title: 'Income Report',UserID: JWT_decoded.payload.m_id, data: data });
    });
});

router.get('/InvestorReport', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT user.u_name,user.u_email,user.u_cellphone,user.u_identityNumber,user.u_bankBooklet,user.u_investorLevel,user.u_review_status from htoken.user', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('InvestorReport', { title: 'Investor Report',UserID: JWT_decoded.payload.m_id, data: data });
    });
});

router.get('/FMReport', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT backend_user.m_company,backend_user.m_email,backend_user.m_permission from htoken.backend_user', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('FMReport', { title: 'FM Report',UserID: JWT_decoded.payload.m_id, data: data });
    });
});

router.get('/ProductReport', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT htoken.product.p_SYMBOL,htoken.backend_user.m_company,htoken.product.p_name,htoken.product.p_PAdate,htoken.product.p_CFSD,htoken.product.p_CFED,htoken.product.p_fundingType,htoken.product.p_totalrelease,htoken.product.p_totalrelease*htoken.product.p_pricing as TotalReleaseAmount,htoken.product.p_paidNumber from htoken.product,htoken.backend_user where htoken.product.p_fundmanager=htoken.backend_user.m_id', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('ProductReport', { title: 'Product Report',UserID: JWT_decoded.payload.m_id, data: data });
    });
});


module.exports = router;