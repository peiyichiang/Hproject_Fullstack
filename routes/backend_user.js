var express = require('express');
var crypto = require('crypto');
var request = require('request');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

var router = express.Router();

//撈取前台、後台使用者資料(Platform_Admin可訪問頁面，其他不行)
router.get('/GET/backend_user', function (req, res, next) {
    // console.log("＊：" + JSON.stringify(req.session.m_permission));
    // console.log(req.cookies.access_token);
    var token = req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Admin") {
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

    //   var db = req.con;
    var data = "";
    var mysqlPoolQuery = req.pool;

    //   mysqlPoolQuery('SELECT * FROM backend_user', function(err, rows) {
    //       if (err) {
    //           console.log(err);
    //       }
    //       var data = rows;
    //       res.render('Viewbackend_user', { title: 'Backend User Information',UserID:JWT_decoded.payload.m_id, data: data});
    //   });

    mysqlPoolQuery('SELECT * FROM backend_user', function (err, rows) {
        if (err) {
            console.log(err);
        }
        //data=後端使用者資料
        var data = rows;
        mysqlPoolQuery('SELECT * FROM htoken.user', function (err, rows) {
            if (err) {
                console.log(err);
            }
            //FrontEnd_data=前端使用者資料
            var FrontEnd_data = rows;
            res.render('Viewbackend_user', { title: 'Backend User Information', UserID: JWT_decoded.payload.m_id, data: data, FrontEnd_data: FrontEnd_data });
        });
    });

});

//新增後端使用者資料:註冊頁面(無權限設置，大家都可以訪問)
router.get('/GET/AddBackendUser', function (req, res, next) {
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Admin"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    res.render('AddBackendUser', { title: 'Add Backend User' });
});

//＊＊新增後端使用者資料：接收資料的post(無權限設置，大家都可以訪問)
router.post('/POST/AddBackendUser', function (req, res, next) {
    var mysqlPoolQuery = req.pool;

    //前端傳明文密碼過來，將salt與明文密碼做sha256
    // var password = req.body.m_passwordhash;
    // req.body.m_passwordhash = crypto.createHash('sha256').update(req.body.m_salt + password).digest('hex');
    // var sql = {
    //     m_id: req.body.m_id,
    //     m_salt: req.body.m_salt,
    //     m_passwordhash: req.body.m_passwordhash,
    //     m_company: req.body.m_company,
    //     m_permission: "NA"
    // };

    // console.log("*:" + sql);

    // var qur = mysqlPoolQuery('INSERT INTO backend_user SET ?', sql, function (err, rows) {
    //     if (err) {
    //         console.log(err);
    //         res.render('error', { message: '帳號重複', error: '' });
    //     } else {
    //         // res.setHeader('Content-Type', 'application/json');
    //         // res.redirect('/BackendUser/GET/backend_user');
    //         res.render('error', { message: '註冊成功', error: '' });
    //     }
    // });

    const saltRounds = 10;
    bcrypt
    .genSalt(saltRounds)
    .then(salt => {
        console.log(`Salt: ${salt}`);
        return bcrypt.hash(req.body.m_passwordhash, salt);
    })
    .then(hash  => {
        console.log(`Hash: ${hash}`);
        req.body.m_passwordhash=hash;
        var sql = {
            m_id: req.body.m_id,
            m_salt: '0',
            m_passwordhash: hash,
            m_company: req.body.m_company,
            m_permission: "NA"
        };

        console.log("###" + JSON.stringify(sql));

        var qur = mysqlPoolQuery('INSERT INTO backend_user SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
                res.render('error', { message: '帳號重複', error: '' });
            } else {
                // res.setHeader('Content-Type', 'application/json');
                // res.redirect('/BackendUser/GET/backend_user');
                res.render('error', { message: '註冊成功', error: '' });
            }
        });

    })
    .catch(err => console.error(err.message));




});

//刪除後端使用者資料：獲取網址上的參數
router.get('/GET/DeleteBackendUser', function (req, res, next) {
    var token = req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Platform_Admin") {
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
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Admin"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var ID = req.query.ID;
    var mysqlPoolQuery = req.pool;

    var qur = mysqlPoolQuery('DELETE FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/BackendUser/GET/backend_user');
    });
});

//修改後端使用者資料：撈取原有資料到修改頁面
router.get('/GET/EditBackendUser', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Admin") {
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
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Admin"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var ID = req.query.ID;
    // var db = req.con;
    var mysqlPoolQuery = req.pool;
    var data = "";

    mysqlPoolQuery('SELECT * FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditBackendUser', { title: 'Edit Product', UserID: JWT_decoded.payload.m_id, data: data });
    });
});

//修改後端使用者資料：將修改後的資料傳到資料庫
router.post('/POST/EditBackendUser', function (req, res, next) {
    // console.log("＊：" + JSON.stringify(req.session.m_permission));
    var token = req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Platform_Admin") {
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
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Admin"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    // var db = req.con;
    var mysqlPoolQuery = req.pool;
    var ID = req.body.m_id;

    var sql = {
        m_id: req.body.m_id,
        m_salt: req.body.m_salt,
        m_passwordhash: req.body.m_passwordhash,
        m_company: req.body.m_company,
        m_permission: req.body.m_permission
    };

    console.log("*:" + JSON.stringify(sql));

    var qur = mysqlPoolQuery('UPDATE backend_user SET ? WHERE m_id = ?', [sql, ID], function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }

        // res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/GET/backend_user');
    });

});

//後端使用者登入頁面
router.get('/GET/BackendUserLogin', function (req, res, next) {
    res.render('BackendUserLogin');
});

//＊＊＊接收後端使用者登入資料
router.post('/POST/BackendUserLogin', function (req, res, next) {

    //   var db = req.con;
    var mysqlPoolQuery = req.pool;
    var ID = req.body.m_id;
    var Password = req.body.m_password;

    mysqlPoolQuery('SELECT * FROM htoken.backend_user WHERE m_id = ?', ID, function (err, rows) {
        if (err) {
            console.log(err);
        }
        console.log(rows.length);

        //查無此帳號
        if (rows.length == 0) {
            res.render('error', { message: '查無此帳號', error: '' });
        } else {
            // console.log("Password:" + Password);
            // console.log( rows[0].m_passwordhash);

            bcrypt
            .compare(Password, rows[0].m_passwordhash)
            .then(compareResult => {
                console.log(compareResult);
                if (compareResult) {
                    //JWT
                    const payload = {
                        m_id: rows[0].m_id,
                        m_company: rows[0].m_company,
                        m_permission: rows[0].m_permission
                    };
                    const token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
                    // console.log(token);
                    // 把JWT token存到cookie中
                    res.cookie('access_token', token);

                    //各種權限分流到不同頁面
                    if (rows[0].m_permission == "Platform_Admin") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/GET/backend_user');
                    } else if (rows[0].m_permission == "Platform_Auditor") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/GET/BackendUser_Platform_Auditor');
                    } else if (rows[0].m_permission == "Platform_CustomerService") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/GET/BackendUser_CustomerService');
                    } else if (rows[0].m_permission == "Company_FundManagerN") {
                        res.redirect('/product/GET/ProductByFMN');
                    } else if (rows[0].m_permission == "Company_FundManagerA") {
                        res.redirect('/product/GET/ProductByFMA');
                    } else if (rows[0].m_permission == "NA") {
                        res.render('error', { message: 'NA', error: '' });
                    }
                } else {
                    res.render('error', { message: '密碼錯誤', error: '' });
                }
            }).catch(err => console.error('Error at compare password & pwHash', err.message));
            
            
            
            //檢查密碼是否正確
            // var hash = crypto.createHash('sha256').update(rows[0].m_salt + Password).digest('hex');
            // if (hash != rows[0].m_passwordhash) {
            //     res.render('error', { message: '密碼錯誤', error: '' });
            // } else if (hash == rows[0].m_passwordhash) {
            //     // 改用JWT
            //     //將該user登入狀態、username、所屬公司、權限存到session中
            //     // req.session.login=true;
            //     // req.session.m_id=rows[0].m_id;
            //     // req.session.m_company=rows[0].m_company;
            //     // req.session.m_permission=rows[0].m_permission;

            //     //JWT
            //     const payload = {
            //         m_id: rows[0].m_id,
            //         m_company: rows[0].m_company,
            //         m_permission: rows[0].m_permission
            //     };
            //     const token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
            //     // console.log(token);
            //     // 把JWT token存到cookie中
            //     res.cookie('access_token', token);

            //     //各種權限分流到不同頁面
            //     if (rows[0].m_permission == "Platform_Admin") {
            //         // res.setHeader('Content-Type', 'application/json');
            //         res.redirect('/BackendUser/GET/backend_user');
            //     } else if (rows[0].m_permission == "Platform_Auditor") {
            //         // res.setHeader('Content-Type', 'application/json');
            //         res.redirect('/BackendUser/GET/BackendUser_Platform_Auditor');
            //     } else if (rows[0].m_permission == "Platform_CustomerService") {
            //         // res.setHeader('Content-Type', 'application/json');
            //         res.redirect('/BackendUser/GET/BackendUser_CustomerService');
            //     } else if (rows[0].m_permission == "Company_FundManagerN") {
            //         res.redirect('/product/GET/ProductByFMN');
            //     } else if (rows[0].m_permission == "Company_FundManagerA") {
            //         res.redirect('/product/GET/ProductByFMA');
            //     } else if (rows[0].m_permission == "NA") {
            //         res.render('error', { message: 'NA', error: '' });
            //     }
            // }
        }


        // res.render('EditBackendUser', { title: 'Edit Product', data: data });
    });

});

//CustomerService登入後跳轉到該頁面
router.get('/GET/BackendUser_CustomerService', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_CustomerService") {
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

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_CustomerService"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    // var db = req.con;
    var mysqlPoolQuery = req.pool;
    var data = "";
    console.log("＊：" + req);

    mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        res.render('ViewProduct', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data });
    });

});

//BackendUser_Platform_Auditor登入後跳轉到該頁面
router.get('/GET/BackendUser_Platform_Auditor', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Auditor") {
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
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    // var db = req.con;
    var mysqlPoolQuery = req.pool;
    var data = "";
    // console.log("＊：" + req);

    mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        console.log("**:" + JWT_decoded.payload.m_id);
        res.render('ProductAdministration', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data });
    });

});

//Company_FundManagerN登入後跳轉到該頁面(根據公司與產品階段撈取資料)
router.post('/POST/BackendUser_Company_FundManagerN', function (req, res, next) {
    var token = req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerN") {
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

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var db = req.con;
    // var id = req.req.body.m_id;
    // var company=req.body.m_company;
    console.log("＊:" + req.body);

    // db.query('SELECT * FROM product WHERE p_fundmanager = ?',id , function(err, rows) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     var data = rows;

    //     // use index.ejs
    //     res.render('ViewProduct', { title: 'Product Information', data: data});
    // });

});

module.exports = router;
