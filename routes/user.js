var express = require('express');
var router = express.Router();
// var multer = require('multer');

// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');
const nodemailer = require('nodemailer');


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

module.exports = router;