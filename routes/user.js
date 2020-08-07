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
const { Console } = require('console');
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const imageLocation = req.body.imageLocation;
        cb(null, './public/images/' + imageLocation);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const uploadImages = multer({ storage: Storage })

const getTimeNow = () => {
    let timeNow = new Date();/* 現在時間 */
    const minuteAndHour = timeNow.toLocaleTimeString('en-US', {
        hour12: false,
        hour: "numeric",
        minute: "numeric"
    });
    let year = timeNow.getFullYear();
    let month = String(timeNow.getMonth() + 1).padStart(2, '0'); //January is 0!
    let day = String(timeNow.getDate()).padStart(2, '0');
    let hour = minuteAndHour.substring(0, 2);
    let minute = minuteAndHour.substring(3, 5);
    return year + month + day + hour + minute;
}

// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');

//http://140.119.101.130:3000/user/UserLogin
router.get('/UserLogin', function (req, res, next) {
    console.log('------------------------==\n@User/UserLogin');
    var mysqlPoolQuery = req.pool;
    const email = req.query.email;
    const password = req.query.password;
    let qstr1 = 'SELECT * FROM  user WHERE u_email = ?';

    mysqlPoolQuery(qstr1, email, function (err, result) {
        if (err) {
            res.status(400).send('查詢失敗：', err);
            console.error('query error : ', err);
        } else {
            if (result.length === 0) {
                res.status(400).send('查無此帳號');
                console.error('email is not found: ', email);
            } else if (result.length === 1) {
                if (result[0].u_verify_status === 0) {
                    res.status(400).send('此帳號信箱驗證尚未通過，請收取驗證信並點按驗證連結後再試一次');
                    console.error('email is not verified : ', email);
                }
                else {
                    bcrypt
                        .compare(password, result[0].u_password_hash)
                        .then(compareResult => {
                            if (compareResult) {
                                const data = {
                                    u_email: result[0].u_email,
                                    u_identityNumber: result[0].u_identityNumber,
                                    u_eth_add: result[0].u_eth_add,
                                    u_cellphone: result[0].u_cellphone,
                                    u_name: result[0].u_name,
                                    u_physicalAddress: result[0].u_physicalAddress,
                                    u_birthday: result[0].u_birthday,
                                    u_gender: result[0].u_gender,
                                    u_job: result[0].u_job,
                                    u_telephone: result[0].u_telephone,
                                    u_education: result[0].u_education,
                                    u_verify_status: result[0].u_verify_status,
                                    u_endorser1: result[0].u_endorser1,
                                    u_endorser2: result[0].u_endorser2,
                                    u_endorser3: result[0].u_endorser3,
                                    u_investorLevel: result[0].u_investorLevel,
                                    u_account_status: result[0].u_account_status,
                                }
                                time = { expiresIn: 1800 };
                                token = jwt.sign(data, process.env.JWT_PRIVATEKEY, time);

                                res.status(200).json({
                                    "message": "密碼正確",
                                    "jwt": token
                                });

                            } else {
                                res.status(400).send('密碼錯誤，請確認後再試一次');
                                console.error('wrong password : ', email);
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

//-----------------------==
//http://140.119.101.130:3000/user/AddUser
router.post('/AddUser', function (req, res, next) {
    console.log('------------------------==\n@user/AddUser');
    const qstr1 = 'INSERT INTO  user SET ?';
    var mysqlPoolQuery = req.pool;

    let user;
    if (req.body.email) {
        user = req.body;
    } else { user = req.query; }//Object.keys(user).length === 0 && user.constructor === Object

    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    let passwordHash = {};
    bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            user.salt = salt;
            return bcrypt.hash(user.password, salt);
        })
        .then(hash => {
            let userNew = {
                u_email: user.email,
                u_salt: user.salt,
                u_password_hash: hash,
                u_identityNumber: user.ID,
                u_imagef: user.imageURLF,
                u_imageb: user.imageURLB,
                u_bankBooklet: user.bankAccount,
                u_eth_add: user.eth_account,
                u_verify_status: user.verify_status,
                u_cellphone: user.phoneNumber,
                u_name: user.name,
                u_investorLevel: 1,
                u_account_status: 0,
                u_review_status: 'unapproved'
            };//Math.random().toString(36).substring(2, 15)
            passwordHash.passwordHash = hash

            var qur = mysqlPoolQuery(qstr1, userNew, function (err, result) {
                if (err) {
                    res.status(400);
                    res.json({
                        "message": "[Error] Failure :\n" + err,
                        "success": false,
                    });
                } else {
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

//設置reviewStatus
router.post('/reviewStatus', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log("＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊");
    console.log(req.body.reviewStatus);
    console.log(req.body.email);
    console.log("＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊");
    
    if(req.body.reviewStatus!="approved"){
        sql = {
            u_review_status: req.body.reviewStatus
        };
    }else if(req.body.reviewStatus=="approved"){
        sql = {
            u_review_status: req.body.reviewStatus,
            u_verify_status:3
        };
    }

    var qur = mysqlPoolQuery('UPDATE ' + process.env.DB_NAME + '.user SET ? WHERE u_email = ?', [sql, req.body.email], function (err, rows) {

        if (err) {
             res.status(400).json({ "message": "更改u_review_status失敗" + err }); 
             console.log("更改u_review_status失敗:" + err)
        }
        else {
            console.log("更改u_review_status成功")
            if(req.body.reviewStatus=="rejected"){
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
                    to: req.body.email, // list of receivers
                    subject: '電利超商 - 補上傳身分證明文件通知', // Subject line
                    text: "由於您的身分證明文件尚未齊備，請參考以下流程補上。流程：登入電利超商之後，請點擊左上角的菜單(menu) - 會員專區 - 補上傳身份證明文件，請補上身分證正反面 以及銀行存摺正面，以利完成會員註冊程序，謝謝", // plain text body
                    // html: '<b>Hello world?</b>' // html body
                };
            
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        res.status(400)
                        res.json({
                            "message": "身分證明文件補齊通知信寄送失敗：" + err
                        })
                    }
                    else {
                        res.status(200);
                        res.json({
                            "message": "身分證明文件補齊通知信寄送成功"
                        })
                    }
                });
            }
            
            res.redirect('/BackendUser/backend_user');
        }
    });
});

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
        from: ' <noreply@hcat.io>', // sender address
        to: email, // list of receivers
        subject: '帳號註冊驗證信', // Subject line
        text: `請點以下連結以完成驗證： ${process.env.SERVER_PROTOCOL}://hcat.io:${process.env.SERVER_PORT}/user/verify_email?hash=` + passwordHash, // plain text body
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
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

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

router.post('/Image', uploadImages.single('image'), function (req, res) {
    let mysqlPoolQuery = req.pool;
    const applicationType = req.body.applicationType;
    const pictureType = req.body.pictureType;
    const imageLocation = req.body.detailedImageLocation;
    const email = req.body.email;
    const params = [imageLocation, email]

    switch (applicationType) {
        case "signUp":
            switch (pictureType) {
                case "u_imagef":
                    mysqlPoolQuery('UPDATE user SET u_imagef = ? WHERE u_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                case "u_imageb":
                    mysqlPoolQuery('UPDATE user SET u_imageb = ? WHERE u_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                case "u_bankAccountimage":
                    mysqlPoolQuery('UPDATE user SET u_bankAccountimage = ? WHERE u_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                default:
                    console.log('pictureType is not found');
            }
            break;
        case "forget_password":
            switch (pictureType) {
                case "fp_imagef":
                    mysqlPoolQuery('UPDATE forget_pw SET fp_imagef = ? WHERE fp_investor_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                case "fp_imageb":
                    mysqlPoolQuery('UPDATE forget_pw SET fp_imageb = ? WHERE fp_investor_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                case "fp_bankAccountimage":
                    mysqlPoolQuery('UPDATE forget_pw SET fp_bankAccountimage = ? WHERE fp_investor_email = ?', params, function (err) {
                        if (err) { res.status(400).json({ "message": "新增照片地址失敗" + err }); }
                        else { res.status(200).json({ "message": "新增照片地址成功！" }); }
                    })
                    break;
                default:
                    console.log('pictureType is not found');
            }
            break;
        default:
            console.log('applicationType is not found');
    }
})

//http://140.119.101.130:3000/user/UserByEmail
router.get('/UserByEmail', function (req, res, next) {
    console.log('------------------------==\n@User/User');
    let qstr1 = 'SELECT * FROM  user WHERE u_email = ?';
    var mysqlPoolQuery = req.pool;
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

//http://140.119.101.130:3000/user/UserByCellphone
router.get('/UserByCellphone', function (req, res, next) {
    console.log('------------------------==\n@User/UserByCellphone');
    let qstr1 = 'SELECT * FROM  user WHERE u_cellphone = ?';
    var mysqlPoolQuery = req.pool;
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


//http://140.119.101.130:3000/user/UserByUserId
router.get('/UserByUserId', function (req, res, next) {
    console.log('------------------------==\n@User/UserByUserId');
    let qstr1 = 'SELECT * FROM  user WHERE u_identityNumber = ?';
    var mysqlPoolQuery = req.pool;
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
                let query = mysqlPoolQuery('SELECT u_endorser1,u_endorser2,u_endorser3 FROM  user WHERE u_email = ?', decoded.u_email, function (err, result) {
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
                    'SELECT * FROM  user WHERE u_email = ? ;',
                    email,
                    (err, result, fields) => {
                        //   console.log(result);
                        if (err) reject(err);
                        else resolve(result);
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
                let query = mysqlPoolQuery('UPDATE  user SET u_endorser1 = ? WHERE u_email = ?', [EndorserEmail1, userEmail], function (err) {
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
                let query = mysqlPoolQuery('UPDATE  user SET u_endorser2 = ? WHERE u_email = ?', [EndorserEmail2, userEmail], function (err) {
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
                let query = mysqlPoolQuery('UPDATE  user SET u_endorser3 = ? WHERE u_email = ?', [EndorserEmail3, userEmail], function (err) {
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
    console.log('------------------------==\n@user/ForgetPassword');
    var mysqlPoolQuery = req.pool;
    const email = req.body.email;
    const nationalID = req.body.ID;
    const timeNow = getTimeNow();
    const makeid = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const verificationCode = makeid(6);

    mysqlPoolQuery('SELECT * FROM  user WHERE u_email = ? AND u_identityNumber = ?', [email, nationalID], function (err, result) {
        /* 查詢失敗 */
        if (err) {
            res.status(400).send('查詢失敗：' + err);
            console.error('query error : ' + err);
        }
        /* 查無此帳號 */
        else if (result.length == 0) {
            res.status(404).send('查無此帳號');
            console.error('account not found : ' + email);
        }
        /* 新增申請的資料到忘記密碼的資料表 */
        else {
            mysqlPoolQuery(
                `INSERT INTO  forget_pw 
                 SET fp_investor_email = ? , 
                     fp_verification_code = ? , 
                     fp_application_date = ? , 
                     fp_isApproved = ?`,
                [email, verificationCode, timeNow, 0],
                function (err, result) {
                    /* 新增申請資料失敗 */
                    if (err) {
                        res.status(400).send('查詢失敗：' + err);
                        console.error('query error : ' + err);
                    }
                    /* 新增申請資料成功，將重新設置連結寄送到信箱 */
                    else {
                        var transporter = nodemailer.createTransport({
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
                            subject: '驗證碼', // Subject line
                            text: '以下為您的驗證碼：' + verificationCode, // plain text body
                            // html: '<b>Hello world?</b>' // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                res.status(400).send('驗證碼連結寄送失敗：' + err);
                                console.error('send varification code email error: ' + err);
                            }
                            else {
                                res.status(200).json({ "message": "驗證碼連結寄送成功" });
                                // console.log('send email success:' + email);
                            }
                        });
                    }
                })
        }
    });
});

router.post('/VerifyVerificationCode', function (req, res, next) {
    console.log('------------------------==\n@user/VerifyVerificationCode');
    var mysqlPoolQuery = req.pool;
    let email = req.body.email;
    let verificationCode = req.body.verificationCode;
    const timeNow = getTimeNow();
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };
    const getTenMinutesAfter_FP_application_date = (time) => {
        /* 分的十位數為5時，時進位且分歸0 */
        if (time.substring(10, 11) === 5) { return (parseInt(time, 10) + 50).toString(); }
        else { return (parseInt(time, 10) + 10).toString(); }
    }
    const isUserAbleToApplyQuery = `
    SELECT u_account_status
    FROM user
    WHERE u_email = ?`

    query(isUserAbleToApplyQuery, email)
        .then((result) => {
            const isUserAbleToApply = result[0].u_account_status === 0;
            if (isUserAbleToApply) {
                mysqlPoolQuery(
                    `SELECT fp_investor_email,
                            fp_verification_code,
                            fp_application_date
                     FROM   forget_pw 
                     WHERE  fp_investor_email = ? 
                     ORDER  BY fp_application_date DESC
                     LIMIT  0,1
                    `, email, function (err, result) {
                    /* 查詢失敗 */
                    if (err) {
                        res.status(400).send('查詢失敗：' + err);
                        console.error('query error : ' + err);
                    }
                    /* 無申請紀錄 */
                    else if (result.length == 0) {
                        res.status(404).send('無申請紀錄');
                        console.error('applications record not found : ' + email);
                    }
                    else {
                        const tenMinutesAfterFP_application_date = getTenMinutesAfter_FP_application_date(result[0].fp_application_date);
                        /* 驗證碼已過期 */
                        if (timeNow > tenMinutesAfterFP_application_date) {
                            res.status(400).send('驗證碼已過期，請重新申請');
                            console.error('verification code is expired : ' + email);
                        }
                        else {
                            /* 驗證碼錯誤 */
                            if (verificationCode != result[0].fp_verification_code) {
                                res.status(400).send('驗證碼錯誤，請檢查後再試');
                                console.error('wrong verification code : ' + email);
                            }
                            else {

                                res.status(200).json({ "message": "驗證通過" });
                            }
                        }
                    }
                });
            }
            else { res.status(200).json({ "message": "您上筆申請的資料正在審閱中，請等待通知信" }); }
        })
        .catch((err) => {
            res.status(400).send('查詢失敗：' + err);
            console.error('query error : ' + err);
        })
});

router.get('/IsAbleToApply', function (req, res, next) {
    console.log('------------------------==\n@user/IsAbleToApply');
    var mysqlPoolQuery = req.pool;
    const email = req.query.email;
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };

    const isUserAbleToApplyQuery = `
    SELECT u_account_status
    FROM user
    WHERE u_email = ?`

    query(isUserAbleToApplyQuery, email)
        .then((result) => {
            const isUserAbleToApply = result[0].u_account_status === 0;
            if (isUserAbleToApply) {
                res.status(200).json({ "message": "符合申請資格" });
            }
            else {
                res.status(400).send('您上筆申請的資料正在審閱中，請等待通知信');
                console.error('query error : ' + err);
            }
        })
        .catch((err) => {
            res.status(400).send('查詢失敗：' + err);
            console.error('query error : ' + err);
        })
});

//更新使用者資料
router.get('/UpdateUserInformation', function (req, res, next) {
    const mysqlPoolQuery = req.pool;
    const email = req.query.email;
    const sql = {
        u_gender: req.query.gender,
        u_birthday: req.query.birthday,
        u_job: req.query.job,
        u_education: req.query.education,
        u_physicalAddress: req.query.physicalAddress,
        u_telephone: req.query.telephone
    };
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };

    query('UPDATE  user SET ? WHERE u_email = ?', [sql, email])
        .then(() => { return query('SELECT * FROM  user WHERE u_email = ?', email) })
        .then((result) => {
            const data = {
                u_email: result[0].u_email,
                u_identityNumber: result[0].u_identityNumber,
                u_eth_add: result[0].u_eth_add,
                u_cellphone: result[0].u_cellphone,
                u_name: result[0].u_name,
                u_physicalAddress: result[0].u_physicalAddress,
                u_birthday: result[0].u_birthday,
                u_gender: result[0].u_gender,
                u_job: result[0].u_job,
                u_telephone: result[0].u_telephone,
                u_education: result[0].u_education,
                u_verify_status: result[0].u_verify_status,
                u_endorser1: result[0].u_endorser1,
                u_endorser2: result[0].u_endorser2,
                u_endorser3: result[0].u_endorser3,
                u_investorLevel: result[0].u_investorLevel,
                u_account_status: result[0].u_account_status
            }
            time = { expiresIn: 1800 };
            token = jwt.sign(data, process.env.JWT_PRIVATEKEY, time);

            res.status(200);
            res.json({
                "message": "更新使用者資料成功",
                "jwt": token
            })
        })
        .catch((err) => {
            res.status(400)
            res.json({
                "message": "更新使用者資料失敗：" + err
            })
        })
});

router.post('/ApplyForResettingPassword', function (req, res, next) {
    console.log('------------------------==\n@user/VerifyVerificationCode');
    var mysqlPoolQuery = req.pool;
    const email = req.body.email;
    const password = req.body.password;
    const verificationCode = req.body.verificationCode;
    const applicationType = req.body.applicationType;
    const isForgetPassword = applicationType == 0;
    let salt;
    let hash;
    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };

    bcrypt
        .genSalt(saltRounds)
        .then(_salt => {
            salt = _salt;
            return bcrypt.hash(password, salt);
        })
        .then(_hash => {
            hash = _hash;
            const applicationQuery = `
            UPDATE forget_pw 
            SET   fp_salt = ? ,
                  fp_password_hash = ?
            WHERE fp_investor_email = ? AND
                  fp_verification_code = ?`
            if (!isForgetPassword) {
                salt = null;
                hash = null;
            }
            return query(applicationQuery, [salt, hash, email, verificationCode])
        })
        .then(() => {
            let accountStatus;
            isForgetPassword ?
                accountStatus = 1 :/* 申請忘記密碼 */
                accountStatus = 2  /* 申請換機 */

            const updateAccountStatusQuery = `
            UPDATE user 
            SET    u_account_status = ? 
            WHERE  u_email = ?`
            return query(updateAccountStatusQuery, [accountStatus, email])
        })
        .then(() => {
            const getOriginalEOAQuery = `
            SELECT u_eth_add 
            FROM   user
            WHERE  u_email = ?`
            return query(getOriginalEOAQuery, email)
        })
        .then((result) => {
            const originalEOA = result[0].u_eth_add
            const insertOriginalEOAQuery = `
            UPDATE forget_pw 
            SET    fp_original_EOA = ?
            WHERE  fp_investor_email = ?
            ORDER BY fp_application_date DESC 
            LIMIT 1`
            return query(insertOriginalEOAQuery, [originalEOA, email])
        })
        .then(() => {
            isForgetPassword ?
                res.status(200).json({ "message": "申請成功，請等待身份驗證通過後再以新密碼登入" }) :
                res.status(200).json({ "message": "申請成功，請等待身份驗證通過後再重新登入" });
        })
        .catch((err) => {
            res.status(400).send('查詢失敗：' + err);
            console.error('query error : ' + err);
        })
})

router.get('/IsLoginPasswordCorrect', function (req, res, next) {
    console.log('------------------------==\n@User/IsLoginPasswordCorrect');
    var mysqlPoolQuery = req.pool;
    const email = req.query.email;
    const password = req.query.password;
    let qstr1 = 'SELECT * FROM  user WHERE u_email = ?';

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
                    bcrypt
                        .compare(password, result[0].u_password_hash)
                        .then(compareResult => {
                            if (compareResult) {
                                res.status(200).json({ "message": "密碼正確" });
                            } else {
                                res.status(400).send('帳號或密碼輸入錯誤');
                                console.error('query error');
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

router.post('/UpdateEOA', function (req, res, next) {
    console.log('------------------------==\n@user/UpdateEOA');
    const mysqlPoolQuery = req.pool;
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };
    const JWT = req.body.JWT;

    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            const updateUserEOAQuery = `
            UPDATE user 
            SET    u_eth_add = ? ,
             u_account_status = ?
            WHERE  u_email = ?`;
            try {
                const EOA = req.body.EOA;
                await query(updateUserEOAQuery, [EOA, 0, decoded.u_email]);
                res.status(200).json({ "message": "EOA更新成功" });
            }
            catch (err) {
                res.status(400).send('EOA更新失敗');
                console.error(err);
            }
        }
    })
});

router.post('/LetUserUnapproved', function (req, res, next) {
    console.log('------------------------==\n@user/LetUserUnapproved');
    const mysqlPoolQuery = req.pool;
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };
    const JWT = req.body.JWT;

    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            const letUserUnapprovedQuery = `
            UPDATE user 
            SET    u_review_status = ?
            WHERE  u_email = ?`;
            try {
                await query(letUserUnapprovedQuery, ['unapproved', decoded.u_email]);
                res.status(200).json({ "message": "重設使用者審查狀態成功" });
            }
            catch (err) {
                res.status(400).send('重設使用者審查狀態失敗');
                console.error(err);
            }
        }
    })
});

router.get('/NeedToReuploadMemberDocument', function (req, res, next) {
    console.log('------------------------==\n@user/NeedToReuploadMemberDocument');
    const mysqlPoolQuery = req.pool;
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };
    const JWT = req.query.JWT;

    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            const getUserReviewStatusQuery = `
            SELECT u_review_status
            FROM   user
            WHERE  u_email = ?`;
            try {
                let userReviewStatus = await query(getUserReviewStatusQuery, decoded.u_email);
                if (userReviewStatus === 'unapproved') {
                    res.status(200).json({ "message": "取得使用者審查狀態成功" });
                } else {
                    res.status(400).send('不需要補上傳身份文件');
                }
            }
            catch (err) {
                res.status(400).send('取得使用者審查狀態失敗');
                console.error(err);
            }
        }
    })
});

//
router.post('/AssetRecordDailySnapshot', function (req, res, next) {
    //Step 1:先撈取有幾種symbol
    var mysqlPoolQuery = req.pool;
    var qur = mysqlPoolQuery('SELECT ar_tokenSYMBOL,ar_investorEmail,ar_Holding_Amount_in_the_end_of_Period FROM ' + process.env.DB_NAME + '.investor_assetRecord;', async function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            // console.log(JSON.stringify(rows));
            // console.log(new Date().toString());
            var Year_=new Date().getFullYear().toString();
            var Month_=new Date().getMonth() + 1;
            Month_=Month_.toString();
            if(Month_.length==1){
                Month_="0" + Month_;
            }
            var Date_=new Date().getDate().toString();
            if(Date_.length==1){
                Date_="0" + Date_;
            }
            var DateStr = Year_ + "/" + Month_ + "/" + Date_;

            var sql = {
                DateTime:DateStr ,
                Content:JSON.stringify(rows)
            };
            var qur1 = mysqlPoolQuery('INSERT INTO  AseetRecordDailySnapshot SET ?',sql, async function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send('寫入AssetRecordDailySnapshot失敗');
                } else {
                    console.log("寫入AssetRecordDailySnapshot成功");
                    res.status(200).json({ "message": "寫入AssetRecordDailySnapshot成功" });
                }
            });
        }
    });
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