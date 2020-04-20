var express = require('express');
var crypto = require('crypto');
var request = require('request');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
/* email sender */
const nodemailer = require('nodemailer');

var router = express.Router();

//撈取前台、後台使用者資料(Platform_Admin可訪問頁面，其他不行)
router.get('/backend_user', function (req, res, next) {
    // console.log("＊：" + JSON.stringify(req.session.m_permission));
    // console.log(req.cookies.access_token);
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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
    if(JWT_decoded!==undefined){
        mysqlPoolQuery('SELECT * FROM backend_user', function (err, rows) {
            if (err) {
                console.log(err);
            }
            //data=後端使用者資料
            var data = rows;
            mysqlPoolQuery('SELECT * FROM user', function (err, rows) {
                if (err) {
                    console.log(err);
                }
                //FrontEnd_data=前端使用者資料
                var FrontEnd_data = rows;
                res.render('PlatformAdmin', { title: 'Backend User Information', UserID: JWT_decoded.payload.m_id, data: data, FrontEnd_data: FrontEnd_data });
            });
        });
    }
});

//新增後端使用者資料:註冊頁面(無權限設置，大家都可以訪問)
router.get('/AddBackendUser', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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
    
    res.render('AddBackendUser', { title: 'Add Backend User' });
});

//＊＊新增後端使用者資料：接收資料的post(無權限設置，大家都可以訪問)
router.post('/AddBackendUser', function (req, res, next) {
    var mysqlPoolQuery = req.pool;

    // console.log(req.body.m_id);
    // console.log(req.body.m_passwordhash);
    // console.log(req.body.m_taxidnumber);
    // console.log(req.body.m_company);
    // console.log(req.body.m_bankcode);
    // console.log(req.body.m_email);
    console.log(req.body.m_permission);

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
            m_permission: req.body.m_permission,
            m_email:req.body.m_email,
            m_taxidnumber:req.body.m_taxidnumber,
            m_bankcode:req.body.m_bankcode
        };

        console.log("###" + JSON.stringify(sql));

        var qur = mysqlPoolQuery('INSERT INTO backend_user SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
                res.render('FailMessage', { message: '帳號重複', error: err });
            } else {
                // res.setHeader('Content-Type', 'application/json');
                // res.redirect('/BackendUser/backend_user');
                res.render('SuccessMessage', { message: '註冊成功', error: '' });
            }
        });

    })
    .catch(err => console.error(err.message));




});

//忘記密碼
router.get('/ForgetPassword', function (req, res, next) {
    res.render('ForgetPassword', { title: 'ForgetPassword' });
});

// 註冊成功
router.get('/SigupSuccess', function (req, res, next) {
    res.render('SuccessMessage', { title: '註冊成功' });
});
// 註冊失敗
router.get('/SigupFail', function (req, res, next) {
    res.render('FailMessage', { title: '註冊失敗' });
});
//等待授權
router.get('/WaitAuthorization', function (req, res, next) {
    res.render('WaitAuthorization', { title: '等待授權' });
});

//忘記密碼
router.post('/ForgetPassword', function (req, res, next) {
    //   var db = req.con;
    var mysqlPoolQuery = req.pool;
    var ID = req.body.m_id;
    mysqlPoolQuery('SELECT * FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
        if (err) {
            console.log(err);
        }
        // console.log(rows.length);

        //查無此帳號
        if (rows.length == 0) {
            res.render('error', { message: '查無此帳號', error: '' });
        } else {
            //將重新設置連結寄送到信箱

            // console.log(rows[0].m_email);
            email=rows[0].m_id;
            passwordHash=rows[0].m_passwordhash;

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
                subject: '重新設置密碼', // Subject line
                text: '請點以下連結重新設置密碼：' + process.env['SERVER_PROTOCOL'] + '://' + process.env['SERVER_HOST'] + ':' + process.env['SERVER_PORT'] + '/BackendUser/ResetPassword?hash=' + passwordHash, // plain text body
                // html: '<b>Hello world?</b>' // html body
            };
        
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    res.status(400)
                    // res.json({
                    //     "message": "重新設置密碼連結 寄送失敗：" + err
                    // })
                    res.render('error', { message: '重新設置密碼連結 寄送失敗', error: err });
                }
                else {
                    res.status(200);
                    // res.json({
                    //     "message": "重新設置密碼連結 寄送成功"
                    // })
                    res.render('error', { message: '重新設置密碼連結 寄送成功,若信箱內沒找到信,若是信件夾找不到，有可能是被系統分類到"垃圾郵件"或"廣告郵件"裡，請到這幾個信件夾找尋認證信。', error: '' });
                }
                // console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
            });
        }


        // res.render('EditBackendUser', { title: 'Edit Product', data: data });
    });
});

//重設密碼
router.post('/ResetPassword', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    var newPassword = req.body.m_password_1;
    var ResetPasswordHash= req.body.m_ResetPasswordHash;
    console.log(newPassword);
    console.log(ResetPasswordHash);

    const saltRounds = 10;
    bcrypt
    .genSalt(saltRounds)
    .then(salt => {
        console.log(`Salt: ${salt}`);
        return bcrypt.hash(newPassword, salt);
    })
    .then(hash  => {
        console.log(`Hash: ${hash}`);
        var sql = {
            m_passwordhash: hash,
        };

        console.log("###" + JSON.stringify(sql));

        var qur = mysqlPoolQuery('UPDATE backend_user SET ? WHERE m_passwordhash = ?', [sql, ResetPasswordHash], function (err, rows) {
            if (err) {
                console.log(err);
                res.render('error', { message: '更改密碼失敗：' + err, error: '' });
            } else {
                // res.setHeader('Content-Type', 'application/json');
                // res.redirect('/BackendUser/backend_user');
                res.render('error', { message: '更改密碼成功', error: '' });
            }
        });

    })
    .catch(err => console.error(err.message));
});

//重設密碼
router.get('/ResetPassword', function (req, res, next) {
    res.render('ResetPassword', { title: 'ResetPassword' });
});


//刪除後端使用者資料：獲取網址上的參數
router.get('/DeleteBackendUser', function (req, res, next) {
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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

    var ID = req.query.ID;
    var mysqlPoolQuery = req.pool;

    // var qur = mysqlPoolQuery('DELETE FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.redirect('/BackendUser/backend_user');
    // });
    var sql = {
        m_permission: "Deleted"
    };

    console.log("*:" + JSON.stringify(sql));

    var qur = mysqlPoolQuery('UPDATE backend_user SET ? WHERE m_id = ?', [sql, ID], function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
        }

        // res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/backend_user');
    });
});

//修改後端使用者資料：撈取原有資料到修改頁面
router.get('/EditBackendUser', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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

    var ID = req.query.ID;
    // var db = req.con;
    var mysqlPoolQuery = req.pool;
    var data = "";

    if(JWT_decoded!==undefined){
        mysqlPoolQuery('SELECT * FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
            if (err) {
                console.log(err);
            }
    
            var data = rows;
            res.render('EditBackendUser', { title: 'Edit Product', UserID: JWT_decoded.payload.m_id, data: data });
        });
    }

});

//修改後端使用者資料：將修改後的資料傳到資料庫
router.post('/EditBackendUser', function (req, res, next) {
    // console.log("＊：" + JSON.stringify(req.session.m_permission));
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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
        res.redirect('/BackendUser/backend_user');
    });

});

//後端使用者登入頁面
router.get('/BackendUserLogin', function (req, res, next) {
    res.render('BackendUserLogin');
});

//＊＊＊接收後端使用者登入資料
router.post('/BackendUserLogin', function (req, res, next) {

    //   var db = req.con;
    var mysqlPoolQuery = req.pool;
    var ID = req.body.m_id;
    var Password = req.body.m_password;

    mysqlPoolQuery('SELECT * FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
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
                    const token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, 'my_secret_key');
                    // console.log(token);
                    // 把JWT token存到cookie中
                    res.cookie('access_token', token);

                    //各種權限分流到不同頁面
                    if (rows[0].m_permission == "Platform_Admin") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/backend_user');
                    } else if (rows[0].m_permission == "Platform_Supervisor") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
                    } else if (rows[0].m_permission == "Platform_CustomerService") {
                        // res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/BackendUser_CustomerService');
                    } else if (rows[0].m_permission == "Company_FundManagerN") {
                        res.redirect('/product/ProductByFMN');
                    } else if (rows[0].m_permission == "Company_FundManagerS") {
                        res.redirect('/product/ProductByFMS');
                    } else if (rows[0].m_permission == "NA") {
                        res.render('WaitAuthorization', { message: 'NA', error: '' });
                    }
                } else {
                    res.render('PasswordWrongMessage', { message: '密碼錯誤', error: '' });
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
            //         res.redirect('/BackendUser/backend_user');
            //     } else if (rows[0].m_permission == "Platform_Supervisor") {
            //         // res.setHeader('Content-Type', 'application/json');
            //         res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
            //     } else if (rows[0].m_permission == "Platform_CustomerService") {
            //         // res.setHeader('Content-Type', 'application/json');
            //         res.redirect('/BackendUser/BackendUser_CustomerService');
            //     } else if (rows[0].m_permission == "Company_FundManagerN") {
            //         res.redirect('/product/ProductByFMN');
            //     } else if (rows[0].m_permission == "Company_FundManagerS") {
            //         res.redirect('/product/ProductByFMS');
            //     } else if (rows[0].m_permission == "NA") {
            //         res.render('error', { message: 'NA', error: '' });
            //     }
            // }
        }


        // res.render('EditBackendUser', { title: 'Edit Product', data: data });
    });

});

//CustomerService登入後跳轉到該頁面
router.get('/BackendUser_CustomerService', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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

    var data = "";
    var mysqlPoolQuery = req.pool;
    
    if(JWT_decoded!==undefined){
        mysqlPoolQuery('SELECT * FROM htoken.forget_pw AS FPTable INNER JOIN (SELECT fp_investor_email,  MAX(fp_application_date) AS fp_application_date_ FROM htoken.forget_pw group by fp_investor_email) AS SubqueryResult ON FPTable.fp_investor_email = SubqueryResult.fp_investor_email AND FPTable.fp_application_date = SubqueryResult.fp_application_date_', function (err, rows) {
            if (err) {
                console.log(err);
            }
            //data=前端使用者申請忘記密碼的資料
            var data = rows;
            // console.log("***：" + JSON.stringify(data));
            mysqlPoolQuery('SELECT * FROM user', function (err, rows) {
                if (err) {
                    console.log(err);
                }
                //FrontEnd_data=前端使用者資料
                var FrontEnd_data = rows;
                res.render('PlatformCustomerService', { title: 'Backend User Information', UserID: JWT_decoded.payload.m_id,ForgetPassword_data:data, FrontEnd_data: FrontEnd_data });
            });
        });
    }

});

//CustomerService設置 忘記密碼 審核通過
router.post('/SetForgetPasswordApproved', function (req, res, next) {
    var token = req.cookies.access_token;
    // console.log(token);
    var JWT_decoded;
    var dateNow = new Date();

    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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
    
    var email = req.body.ForgetPasswordEmail;
    var applicationTime = req.body.ForgetPasswordApplicationTime;
    console.log("#:" + email);
    console.log("#:" + applicationTime);

    var sql = {
        fp_isApproved: 1,
    };

    var mysqlPoolQuery = req.pool;
    if(JWT_decoded!==undefined){
        // 設置forget_pw的fp_isApproved = 將忘記密碼審核設置通過
        var qur = mysqlPoolQuery('UPDATE forget_pw SET ? WHERE fp_investor_email = ? AND fp_application_date = ?', [sql, email,applicationTime], function (err, rows) {
            if (err) {
                console.log(err);
                // res.render('error', { message: '更改密碼失敗：' + err, error: '' });
                res.redirect('/BackendUser/BackendUser_CustomerService');
            } else {
                // 撈forget password的salt跟password hash
                var qur = mysqlPoolQuery('SELECT fp_salt,fp_password_hash FROM htoken.forget_pw WHERE fp_investor_email = ? AND fp_application_date = ?', [email,applicationTime], function (err, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("＊＊＊:" + rows[0].fp_salt);
                        console.log("＊＊＊:" + rows[0].fp_password_hash);
                        var sql = {
                            u_salt: rows[0].fp_salt,
                            u_password_hash: rows[0].fp_password_hash,
                        };
                        // 修改htoken.user的salt跟hash
                        var qur = mysqlPoolQuery('UPDATE htoken.user SET ? WHERE u_email = ?', [sql, email], function (err, rows) {
                            if (err) {
                                console.log(err);
                                // res.render('error', { message: '更改密碼失敗：' + err, error: '' });
                                res.redirect('/BackendUser/BackendUser_CustomerService');
                            } else {
                                // res.render('error', { message: '更改密碼成功', error: '' });
                                res.redirect('/BackendUser/BackendUser_CustomerService');

                            }
                        });
                        
                    }
                });
            }
        });
    }

});

//BackendUser_Platform_Supervisor登入後跳轉到該頁面
router.get('/BackendUser_Platform_Supervisor', function (req, res, next) {
    var token=req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
                // console.log("******:" + err);
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

    console.log("******:" + JWT_decoded);
    if(JWT_decoded!==undefined){
        var mysqlPoolQuery = req.pool;
        var data = "";

        var iaData;
        mysqlPoolQuery("SELECT ia_SYMBOL,ia_time,ia_actualPaymentTime,ia_single_Forecasted_Payable_Income_in_the_Period,ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_State =?", "ia_state_underReview"  , function(err, rows) {
            if (err) {
                console.log(err);
            }
            iaData = rows;
            console.log("@@" + JSON.stringify(rows));
        });
    
        mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
            if (err) {
                console.log(err);
            }
            var data = rows;

            mysqlPoolQuery("SELECT * FROM product_editHistory where pe_status = 'WaitingAuditByPS' ", function (err, rows) {
                if (err) {
                    console.log(err);
                }
                var productEditHistory = rows;
                //console.log("***:" + JWT_decoded.payload.m_id);
                //res.render('ProductAdministration', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data,iaData:iaData,productEditHistory:productEditHistory });
                
                mysqlPoolQuery("SELECT * FROM product_editHistory where pe_status = 'RejectedByPS' or pe_status = 'Approved' ", function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    var productEditHistory_ = rows;
                    console.log("***:" + JWT_decoded.payload.m_id);
                    res.render('ProductAdministration', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data,iaData:iaData,productEditHistory:productEditHistory,productEditHistory_:productEditHistory_ });
                });
            });
        });
    }



});

//Company_FundManagerN登入後跳轉到該頁面(根據公司與產品階段撈取資料)
router.post('/BackendUser_Company_FundManagerN', function (req, res, next) {
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
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
