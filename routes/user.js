var express = require('express');
var router = express.Router();
// var multer = require('multer');

// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//寄送註冊表單
/* my DB */
// router.post('/user_information', function (req, res) {

//     let db = req.con;

//     let insertData = {
//         email: req.body.email,
//         salt: req.body.salt,
//         password_hash: req.body.password_hash,
//         phone_number: req.body.phone_number,
//         eth_account: req.body.eth_account,
//         user_name: req.body.user_name,
//         verify_status: req.body.verify_status,
//     };

//     // console.log(insertData);

//     let query = db.query('INSERT INTO user_information SET ?', insertData, function (err, rows) {
//         if (err) {
//             res.status(400)
//             res.json({
//                 "message": "新增帳戶失敗:\n" + err
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

/* Helium */
router.post('/user_information', function (req, res) {

    let db = req.con;
    let insertData = {
        u_email: req.body.email,
        salt: req.body.salt,
        password_hash: req.body.password_hash,
        u_cellphone: req.body.phone_number,
        eth_add: req.body.eth_account,
        u_name: req.body.user_name,
        verify_status: req.body.verify_status,
    };
    // console.log(insertData);

    let query = db.query('INSERT INTO user SET ?', insertData, function (err) {
        if (err) {
            res.status(400)
            res.json({
                "message": "新增帳戶失敗:\n" + err
            })
        }
        else {
            res.status(200);
            // res.set({
            //     'Content-Type': 'application/json',
            //     'Access-Control-Allow-Origin': '*'
            // });
            res.json({
                "message": "新增帳戶成功！"
            });
        }
    });
});

//寄驗證信
router.post('/send_email', function (req, res) {
    let email = req.body.email
    var transporter = nodemailer.createTransport({
        /* 我的gmail */
        // service: "Gmail",
        // port: 465,
        // secure: true, // use SSL
        // auth: {
        //     user: "neilliu84@gmail.com",
        //     pass: "f129612428"
        // }

        /* Helium */
        host: 'server239.web-hosting.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "user3@heliumcryptic.club",
            pass: "n{#K](MG.Orc"
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: ' <user3@heliumcryptic.club>', // sender address
        to: email, // list of receivers
        subject: '錢包帳號註冊驗證信', // Subject line
        text: '請點以下連結以完成驗證： http://localhost:3000/user/verify_email?email=' + email, // plain text body
        // html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(400)
            res.json({
                "message": "驗證信寄送失敗：\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "驗證信寄送成功： "
            })
        }
        // console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
})

//驗證信連結
/* my DB */
// router.get('/verify_email', function (req, res) {
//     var email = req.query.email

//     let db = req.con;
//     db.query('UPDATE user_information SET verify_status = 1 WHERE email = \'' + email + '\'', function (err) {
//         if (err) {
//             res.status(400)
//             res.json({
//                 "message": "信箱驗證失敗:\n" + err
//             })
//         }
//         else {
//             res.status(200);
//             res.json({
//                 "message": "信箱驗證成功！"
//             });
//         }
//         /* code = 304? */
//     });
// });

/* Helium */
router.get('/verify_email', function (req, res) {
    var email = req.query.email

    let db = req.con;
    db.query('UPDATE user SET verify_status = 1 WHERE u_email = \'' + email + '\'', function (err) {
        if (err) {
            res.status(400)
            res.json({
                "message": "信箱驗證失敗:\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "信箱驗證成功！"
            });
        }
        /* code = 304? */
    });
});


//-----------------------==
//http://localhost:3000/user/POST/AddUser
router.post('/POST/AddUser', function(req, res, next) {
    console.log('------------------------==\n@user/POST/AddUser');
    const qstr1 = 'INSERT INTO htoken.user SET ?';
    var db = req.con;

    console.log('req.query', req.query, 'req.body', req.body);
    let user;
    if (req.body.email) {user = req.body;
    } else {user = req.query;}//Object.keys(user).length === 0 && user.constructor === Object
    console.log('user', user);

    let passwordHash; const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    bcrypt
    .genSalt(saltRounds)
    .then(salt => {
        console.log(`Salt: ${salt}`);
        return bcrypt.hash(user.password, salt);
    })
    .then(hash => {
        console.log(`Hash: ${hash}`);
        let userNew = {
            u_email: user.email,
            u_salt: 0,
            u_password_hash: hash,
            u_identityNumber: user.nationalId,
            u_imagef: Math.random().toString(36).substring(2, 15),
            u_imageb: Math.random().toString(36).substring(2, 15),
            u_eth_add: '0x'+Math.random().toString(36).substring(2, 15),
            u_cellphone: user.phone,
            u_name: user.name,
        };
    
        console.log(userNew);
        var qur = db.query(qstr1, userNew, function (err, result) {
            if (err) {
                console.log(err);
                res.status(400);
                res.json({
                    "message": "[Error] Failure :\n" + err,
                    "success": false,
                });
            } else {
                res.status(200);
                res.json({
                    "message" : "[Success] Success",
                    "result" : result,
                    "success": true,
                });
            }
        });

    })
    .catch(err => console.error(err.message));

});


//http://localhost:3000/user/Get/UserByUserId
router.get('/GET/UserByUserId', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/UserByUserId');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_eth_add = ?';
    var db = req.con;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, userId, qstrz;
    if (req.body.userId) {userId = req.body.userId;
    } else {userId = req.query.userId;}
    var qur = db.query(qstr1, userId, function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err,
                "success": false,
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result,
                "success": true,
            });
        }
    });
});



//http://localhost:3000/user/Get/UserLogin
router.get('/GET/UserLogin', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/UserLogin');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_email = ?';
    var db = req.con;
    console.log('req.query', req.query, 'req.body', req.body);
    let email, password;
    if (req.body.email) {
        email = req.body.email; password = req.body.password;
    } else {email = req.query.email; password = req.query.password;}

    var qur = db.query(qstr1, email, function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] db.query to/from DB :\n" + err,
                "success": false
            });
        } else {
            res.status(200);
            if (result.length === 0) {
                res.json({
                    "message" : "[Error] email Not found",
                    "result" : result,
                    "success": false
                });
            } else if (result.length === 1) {
                console.log("1 email is found", result);
                const timeLogin = Date.now() / 1000 | 0;//new Date().getTime();
                const timeExpiry = timeLogin + 60*60;
                console.log('timeLogin', timeLogin, 'timeExpiry', timeExpiry);

                bcrypt
                .compare(password, result[0].u_password_hash)
                .then(compareResult => {
                    console.log(compareResult);
                    if (compareResult) {
                        const user = result[0];
                        jwt.sign({user}, 'privatekey', { expiresIn: '1h' },(err, token) => {
                            if(err) { console.log('[Error] no token is sent.', err);
                            } else {
                                console.log('[Success] login is successful!');
                                //res.send(token);
                                res.json({
                                    "message" : "[Success] password is correct",
                                    "result" : result,
                                    "success": true,
                                    "expiry": timeExpiry,
                                    "jwt": token
                                });
                            }
                        });

                    } else {
                        res.json({
                            "message" : "[Not Valid] password is not correct",
                            "result" : result,
                            "success": false
                        });
                    }
                }).catch(err => console.error('Error at compare password & pwHash', err.message));

            } else {
                res.json({
                    "message" : "[Error] Duplicate Entries are found",
                    "result" : result,
                    "success": false
                });
            }

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