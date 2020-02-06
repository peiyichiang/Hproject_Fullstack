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
    mysqlPoolQuery('SELECT * FROM order_list', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        res.render('SalesReport', { title: 'Sales Report',UserID: JWT_decoded.payload.m_id, data: data });
        //res.render('ProductAdministrationByPlatformSupervisor', { title: 'Product Information', data: data});
    });
});

module.exports = router;