var express = require('express');
var router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

var Web3 = require("web3");

web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));
/* email sender */
const nodemailer = require('nodemailer');

/* sign with default (HMAC SHA256) */
const jwt = require('jsonwebtoken')

/* images management */
var multer = require('multer');
const IDStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // if (req.body.picture == "IDfront" || "IDback") {
        cb(null, './public/images/ID')
        // }
        // else{
        // cb(null, './images/bank_booklet/')
        // }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const uploadIDImages = multer({ storage: IDStorage })
const BookletStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/bank_booklet')

    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const uploadBookletImage = multer({ storage: BookletStorage })


// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* 登入 */
router.post('/signIn', function (req, res) {
    // console.log('sign in')
    console.log(req.body)

    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT u_email,u_eth_add FROM user WHERE u_email = \'' + req.body.email + '\'', function (err) {
        let data = {
            email: result.email,
            address: result.address,
        }
        /* 登入有效時間24小時 */
        let time = {
            expiresIn: '24h'
        }
        result.token = jwt.sign(data, 'secret', time)

        console.log(result)
        res.json(result)
    })

})

/* 寄送註冊表單 */
// router.post('/user_information', function (req, res) {
//     console.log(req.files)

//     let mysqlPoolQuery = req.pool;
//     let insertData = {
//         u_email: req.body.email,
//         u_salt: req.body.salt,
//         u_password_hash: req.body.password_hash,
//         u_cellphone: req.body.phone_number,
//         u_eth_add: req.body.eth_account,
//         u_name: req.body.user_name,
//         u_verify_status: req.body.verify_status,
//         u_imagef: req.body.imageURLF,
//         u_imageb: req.body.imageURLB,
//     };

//     let query = mysqlPoolQuery('INSERT INTO user SET ?', insertData, function (err) {
//         if (err) {
//             res.status(400)
//             res.json({
//                 "message": "新增帳戶失敗:" + err
//             })
//         }
//         else {
//             res.status(200);
//             // res.set({
//             //     'Content-Type': 'application/json',
//             //     'Access-Control-Allow-Origin': '*'
//             // });
//             res.json({
//                 "message": "新增帳戶成功！"
//             });
//         }
//     });
// });

//寄驗證信
router.post('/send_email', function (req, res) {
    let email = req.body.email
    let passwordHash = req.body.passwordHash

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
        from: ' <jmh@hcat.io>', // sender address
        to: email, // list of receivers
        subject: '帳號註冊驗證信', // Subject line
        text: '請點以下連結以完成驗證： http://140.119.101.130:3030/user/verify_email?hash=' + passwordHash, // plain text body
        // html: '<b>Hello world?</b>' // html body
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
                "message": "驗證信寄送成功"
            })
        }
        // console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
})

//驗證信連結
router.get('/verify_email', function (req, res) {
    var passwordHash = req.query.hash

    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('UPDATE user SET u_verify_status = 1 WHERE u_password_hash = \'' + passwordHash + '\'', function (err) {
        if (err) {
            res.sendFile(path.join(__dirname + '/verify_fail.html'));
            //edit page at /routes/verify_fail.html
        }
        else {
            res.sendFile(path.join(__dirname + '/verify_success.html'));
            //edit page at /routes/verify_success.html
        }
        /* code = 304? */
    });
});


/* test post image function */
router.post('/post_IDImage', uploadIDImages.single('image'), function (req, res) {
    let mysqlPoolQuery = req.pool;
    var email = req.body.email
    var imageLocation = req.body.imageLocation

    if (req.body.picture == "IDfront") {
        mysqlPoolQuery('UPDATE user SET u_imagef =\'' + imageLocation + '\'' + 'WHERE u_email = \'' + email + '\'', function (err) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "新增照片地址失敗:" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "新增照片地址成功！"
                })
            }
        })
    } else if (req.body.picture == "IDback") {
        mysqlPoolQuery('UPDATE user SET u_imageb =\'' + imageLocation + '\'' + 'WHERE u_email = \'' + email + '\'', function (err) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "新增照片地址失敗:" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "新增照片地址成功！"
                })
            }
        })
    }

    /* error handling for image upload*/
    // upload(req, res, function (err) {
    //     if (err instanceof multer.MulterError) {
    //         console.log('照片上傳發生錯誤：' + err)
    //     } else if (err) {
    //         console.log('照片上傳發生錯誤：' + err)
    //     }
    //     console.log('照片上傳成功！')
    // });
})

router.post('/post_BookletImage', uploadBookletImage.single('image'), function (req, res) {
    let mysqlPoolQuery = req.pool;
    var email = req.body.email;
    var imageLocation = req.body.imageLocation;
    mysqlPoolQuery('UPDATE user SET u_bankBooklet =\'' + imageLocation + '\'' + 'WHERE u_email = \'' + email + '\'', function (err) {
        if (err) {
            res.status(400)
            res.json({
                "message": "新增照片地址失敗" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "新增照片地址成功！"
            })
        }
    })
})

//-----------------------==
//http://localhost:3000/user/AddUser
router.post('/AddUser', function (req, res, next) {
    console.log('------------------------==\n@user/AddUser');
    const qstr1 = 'INSERT INTO htoken.user SET ?';
    var mysqlPoolQuery = req.pool;

    console.log('req.query', req.query, 'req.body', req.body);
    let user;
    if (req.body.email) {
        user = req.body;
    } else { user = req.query; }//Object.keys(user).length === 0 && user.constructor === Object
    console.log('user', user);

    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    let passwordHash = {};
    bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            console.log(`Salt: ${salt}`);
            user.salt = salt;
            return bcrypt.hash(user.password, salt);
        })
        .then(hash => {
            console.log(`Password Hash: ${hash}`);
            let userNew = {
                u_email: user.email,
                u_salt: user.salt,
                u_password_hash: hash,
                u_identityNumber: user.ID,
                u_imagef: user.imageURLF,
                u_imageb: user.imageURLB,
                u_bankBooklet: user.bankBooklet,
                u_eth_add: user.eth_account,
                u_verify_status: user.verify_status,
                u_cellphone: user.phoneNumber,
                u_name: user.name,
                u_investorLevel: 1
            };//Math.random().toString(36).substring(2, 15)
            passwordHash.passwordHash = hash

            console.log(userNew);
            var qur = mysqlPoolQuery(qstr1, userNew, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] Failure :\n" + err,
                        "success": false,
                    });
                } else {
                    console.log("[Success] /AddUser");
                    res.status(200);
                    res.json({
                        "message": "[Success] Success",
                        "result": passwordHash,
                        "success": true,
                    });
                }
            });
        })
        .catch(err => console.error(err.message));
});


//http://localhost:3000/user/UserLogin
router.get('/UserLogin', function (req, res, next) {
    console.log('------------------------==\n@User/UserLogin');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_email = ?';
    var mysqlPoolQuery = req.pool;
    // console.log('req.query', req.query, 'req.body', req.body);
    // let email, password;
    // if (req.body.email) {
    //     email = req.body.email;
    //     password = req.body.password;
    // } else {
    //     email = req.query.email;
    //     password = req.query.password;
    // }
    const email = req.query.email;
    const password = req.query.password;

    mysqlPoolQuery(qstr1, email, function (err, result) {
        if (err) {
            res.status(400);
            res.json({
                "message": "[Error] db to/from DB :\n" + err,
            });
            console.log(err);
        } else {
            if (result.length === 0) {
                res.status(400);
                res.json({
                    "message": "No email is found",
                });
                console.error('No email is found:', email)
            } else if (result.length === 1) {
                if (result[0].u_verify_status === 0) {
                    res.status(400);
                    res.json({
                        "message": "Email is not verified",
                    });
                    console.error('Email is not verified:', email)
                }
                else {
                    const timeLogin = Date.now() / 1000 | 0;//new Date().getTime();
                    const timeExpiry = timeLogin + 60 * 60;

                    bcrypt
                        .compare(password, result[0].u_password_hash)
                        .then(compareResult => {
                            if (compareResult) {
                                var data = {
                                    u_email: result[0].u_email,
                                    u_identityNumber: result[0].u_identityNumber,
                                    u_assetbookContractAddress: result[0].u_assetbookContractAddress,
                                    u_investorLevel: result[0].u_investorLevel,
                                    u_verify_status: result[0].u_verify_status,
                                };
                                time = { expiresIn: '24h' };
                                token = jwt.sign(data, 'privatekey', time);

                                res.status(200);
                                res.json({
                                    "message": "password is correct",
                                    "result": result[0],
                                    "expiry": timeExpiry,
                                    "jwt": token
                                });
                            } else {
                                res.status(400);
                                res.json({
                                    "message": "password is not correct",
                                });
                                console.error("password is not correct");
                            }
                        })
                        .catch(err => console.error('Error at compare password & pwHash', err.message));
                }
            } else {
                res.status(400);
                res.json({
                    "message": "Duplicate entries are found in DB",
                });
                console.error('Duplicate entries are found in DB:', email)
            }
        }
    });
});

//http://localhost:3000/user/UserByEmail
router.get('/UserByEmail', function (req, res, next) {
    console.log('------------------------==\n@User/User');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_email = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let email, password;
    if (req.body.email) {
        email = req.body.email; password = req.body.password;
    } else { email = req.query.email; password = req.query.password; }

    var qur = mysqlPoolQuery(qstr1, email, function (err, result) {
        if (err) {
            console.log("[Error] db to/from DB :\n", err);
            res.status(400);
            res.json({
                "message": "[Error] db to/from DB :\n" + err,
                "success": false
            });
        } else {
            res.status(200);
            if (result.length === 0) {
                console.log("[Not Valid] No email is found", result);
                res.json({
                    "message": "[Not Valid] email Not found",
                    "result": result,
                    "success": false
                });
            } else if (result.length === 1) {
                console.log("[Success] 1 Email is found", result, 'result[0]', result[0], 'result[0].u_assetbookContractAddress', result[0].u_assetbookContractAddress);
                // var data = {
                //     "u_assetbookContractAddress": result[0].u_assetbookContractAddress
                // };
                //token = jwt.sign(data, 'privatekey', time);
                res.json({
                    "message": "[Success] The entered email is found",
                    "result": result[0].u_assetbookContractAddress,
                    "success": true,
                    //"jwt": token
                });

            } else {
                console.log("[Duplicated] Duplicate entries are found");
                res.json({
                    "message": "[Duplicated] Duplicate entries are found",
                    "result": result,
                    "success": false
                });
            }
        }
    });
});

//http://localhost:3000/user/UserByCellphone
router.get('/UserByCellphone', function (req, res, next) {
    console.log('------------------------==\n@User/UserByCellphone');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_cellphone = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let cellphone, password;
    if (req.body.cellphone) {
        cellphone = req.body.cellphone; password = req.body.password;
    } else { cellphone = req.query.cellphone; password = req.query.password; }

    var qur = mysqlPoolQuery(qstr1, cellphone, function (err, result) {
        if (err) {
            console.log("[Error] db to/from DB :\n", err);
            res.status(400);
            res.json({
                "message": "[Error] db to/from DB :\n" + err,
                "success": false
            });
        } else {
            res.status(200);
            if (result.length === 0) {
                console.log("[Not Valid] No cellphone is found", result);
                res.json({
                    "message": "[Not Valid] No cellphone is found",
                    "result": result,
                    "success": false
                });

            } else if (result.length === 1) {
                console.log("[Success] 1 cellphone is found", result);
                res.json({
                    "message": "[Success] The entered cellphone is found",
                    "result": result[0].u_assetbookContractAddress,
                    "success": true,
                    //"jwt": token
                });

            } else {
                console.log("[Duplicated] Duplicate entries are found");
                res.json({
                    "message": "[Duplicated] Duplicate entries are found",
                    "result": result,
                    "success": false
                });
            }
        }
    });
});


//http://localhost:3000/user/UserByUserId
router.get('/UserByUserId', function (req, res, next) {
    console.log('------------------------==\n@User/UserByUserId');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_identityNumber = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, userId, qstrz;
    if (req.body.userId) {
        userId = req.body.userId;
    } else { userId = req.query.userId; }
    var qur = mysqlPoolQuery(qstr1, userId, function (err, result) {
        if (err) {
            console.log("[Error] Failure :\n", err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err,
                "success": false,
            });
        } else {
            res.status(200);
            if (result.length === 0) {
                console.log("[Not Valid] No UserId is found", result);
                res.json({
                    "message": "[Not Valid] No UserId is found",
                    "result": result,
                    "success": false
                });
            } else if (result.length === 1) {
                console.log("[Success] 1 UserId is found", result);
                var data = {
                    u_identityNumber: result[0].u_identityNumber,
                };
                token = jwt.sign(data, 'privatekey', time);
                res.json({
                    "message": "[Success] The UseId is found",
                    "result": result,
                    "success": true,
                    "data": data,
                    "jwt": token
                });
            } else {
                console.log("[Duplicated] Duplicate entries are found");
                res.json({
                    "message": "[Duplicated] Duplicate entries are found",
                    "result": result,
                    "success": false
                });
            }
        }
    });
});

// 獲取Endorser
router.get('/GetEndorser', function (req, res, next) {
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
                console.log("＊JWT Content:" + decoded.u_email);
                //查詢Endorser Email  
                let mysqlPoolQuery = req.pool;
                let query = mysqlPoolQuery('SELECT u_endorser1,u_endorser2,u_endorser3 FROM htoken.user WHERE u_email = ?', decoded.u_email, function (err, result) {
                    if (err) {
                        console.log("查詢endorser失敗:" + err);
                        console.log(err);
                        res.status(400);
                        res.json({
                            "message": "[Error] Failure :\n" + err,
                            "success": false,
                        });
                    }
                    else {
                        console.log("查詢endorser成功:");
                        res.status(200);
                        res.json({
                            "message": "[Success] Success",
                            "result": result,
                            "success": true,
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

// 編輯Endorser
router.post('/EditEndorser', function (req, res, next) {
    // console.log('------------------------==\n@user/EditEndorser');
    // console.log(req.body.EndorserEmail1);
    // console.log(req.body.EndorserEmail2);
    // console.log(req.body.EndorserEmail3);
    // console.log("＊＊＊＊" + req.body.userEmail);

    userEmail = req.body.userEmail;
    EndorserEmail1 = req.body.EndorserEmail1;
    EndorserEmail2 = req.body.EndorserEmail2;
    EndorserEmail3 = req.body.EndorserEmail3;

    var mysqlPoolQuery = req.pool;
    const queryUserByEmail = email => {
        return new Promise((resolve, reject) => {
            // 如果使用者有填寫Endorser Email
            if (email != "" && email != null) {
                mysqlPoolQuery(
                    'SELECT * FROM htoken.user WHERE u_email = ? ;',
                    email,
                    (err, rows, fields) => {
                        //   console.log(rows);
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
                // 如果使用者沒填寫
            } else {
                // 隨便傳回一個長度為2的字串，代表使用者沒填寫
                resolve("11");
            }
        });
    };

    // 用來保存搜尋結果，1代表Endorser Email存在資料庫，0代表不存在，2代表使用者沒填寫
    var data = [];
    // 檢查EndorserEmail1是否存在資料庫，存在則寫入該使用者的EndorserEmail1
    queryUserByEmail(EndorserEmail1)
        .then(results => {
            //   console.log(results.length);
            data.push(results.length);

            //假如EndorserEmail1存在資料庫
            if (results.length == 1 || results.length == 2) {
                //寫入該使用者的EndorserEmail
                //假如使用者沒填寫，就清空該endorser email
                let mysqlPoolQuery = req.pool;
                let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser1 = ? WHERE u_email = ?', [EndorserEmail1, userEmail], function (err) {
                    if (err) {
                        console.log("寫入EndorserEmail1失敗:" + err);
                    }
                    else {
                        console.log("寫入EndorserEmail1成功:");
                    }
                });
            }

            return queryUserByEmail(EndorserEmail2);
        })
        .then(results => {
            // console.log(results.length);
            data.push(results.length);

            //假如EndorserEmail2存在資料庫
            if (results.length == 1 || results.length == 2) {
                //寫入該使用者的EndorserEmail
                //假如使用者沒填寫，就清空該endorser email
                let mysqlPoolQuery = req.pool;
                let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser2 = ? WHERE u_email = ?', [EndorserEmail2, userEmail], function (err) {
                    if (err) {
                        console.log("寫入EndorserEmail2失敗:" + err);
                    }
                    else {
                        console.log("寫入EndorserEmail2成功:");
                    }
                });
            }

            return queryUserByEmail(EndorserEmail3);
        })
        .then(results => {
            // console.log(results.length);
            data.push(results.length);

            //假如EndorserEmail3存在資料庫
            if (results.length == 1 || results.length == 2) {
                //寫入該使用者的EndorserEmail
                //假如使用者沒填寫，就清空該endorser email
                let mysqlPoolQuery = req.pool;
                let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser3 = ? WHERE u_email = ?', [EndorserEmail3, userEmail], function (err) {
                    if (err) {
                        console.log("寫入EndorserEmail3失敗:" + err);
                    }
                    else {
                        console.log("寫入EndorserEmail3成功:");
                    }
                });
            }

            res.status(200);
            res.json({
                "message": "[Success] Success",
                "result": data,
                "success": true,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err,
                "success": false,
            });
        });
});


router.post('/ForgetPassword', function (req, res, next) {
    //   var db = req.con;
    var mysqlPoolQuery = req.pool;
    var emailAddress = req.body.emailAddress;
    mysqlPoolQuery('SELECT * FROM htoken.user WHERE u_email = ?', emailAddress, function (err, rows) {
        if (err) {
            console.log(err);
        }
        // console.log(rows.length);

        //查無此帳號
        if (rows.length == 0) {
            res.render('error', { message: '查無此帳號', error: '' });
        } else {
            //將重新設置連結寄送到信箱
            console.log(rows[0].u_email);
            email = rows[0].u_email;
            passwordHash = rows[0].u_password_hash;

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
                text: '請點以下連結重新設置密碼： http://140.119.101.130:3030/user/ResetPassword?hash=' + passwordHash, // plain text body
                // html: '<b>Hello world?</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    res.status(400)
                    res.json({
                        "message": "重新設置密碼連結 寄送失敗：" + err
                    })
                }
                else {
                    res.status(200);
                    res.json({
                        "message": "重新設置密碼連結 寄送成功"
                    })
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
    var newPassword = req.body.password1;
    var ResetPasswordHash= req.body.resetPasswordHash;
    var sql = {}
    console.log(newPassword);
    console.log(ResetPasswordHash);

    const saltRounds = 10;
    bcrypt
    .genSalt(saltRounds)
    .then(salt => {
        console.log(`Salt: ${salt}`);
        sql.u_salt = salt
        return bcrypt.hash(newPassword, salt);
    })
    .then(hash  => {
        console.log(`Hash: ${hash}`);
        sql.u_password_hash = hash
        console.log("###" + JSON.stringify(sql));

        mysqlPoolQuery('UPDATE htoken.user SET ? WHERE u_password_hash = ?', [sql, ResetPasswordHash], function (err, rows) {
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

router.get('/ResetPassword', function (req, res, next) {
    res.render('FrontendResetPassword', { title: 'FrontendResetPassword' });
});

module.exports = router;
/**
    function bcryptHash(pw) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
        const myPlaintextPassword = '1111';
        const someOtherPlaintextPassword = '1112';

        bcrypt
        .hash(pw, saltRounds)
        .then(hash => {
            console.log(`Hash: ${hash}`);
            return hash;
            // Store hash in your password DB.
        })
        .catch(err => console.error('[Error@bcryptHash]',err.message));
    }
 */