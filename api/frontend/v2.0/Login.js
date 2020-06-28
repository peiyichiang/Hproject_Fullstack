var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { getTimeServerTime } = require('../../../timeserver/utilities');
const TokenGenerator = require('./TokenGenerator');
var async = require('async');
//登入
router.post('/signIn',function(req,res){
    var mysqlPoolQuery = req.pool;
    const email = req.body.email;
    const password = req.body.password;
    let qstr1 = 'SELECT * FROM  user WHERE u_email = ?';

    mysqlPoolQuery(qstr1, email, function (err, result) {
        if (err) {
            console.error('query error : ', err);
            return res.status(500).json({success: "False", message: "sql error"});
        } else {
            if (result.length === 0 || result[0].u_password_hash == null) {
                console.error('email is not found: ', email);
                return res.status(404).json({success: "False", message: "您尚未註冊帳號，請註冊一個帳號"});
            } else if (result.length === 1) {
                if (result[0].u_verify_status === 0) {
                    console.error('email is not verified : ', email);
                    return res.status(404).json({success: "False", message: '此帳號信箱驗證尚未通過，請收取驗證信並驗證信箱之後再試一次'});        
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
                                async.waterfall([
                                    function(callback) {
                                        const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEY, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '10m', notBefore: '2s' })
                                        token = tokenGenerator.sign({ data:data }, { audience: 'myaud', issuer: 'myissuer', jwtid: '1', subject: 'user' })
                                        //callback(null, jwt.sign({usr_name: name},process.env.JWT_PRIVATEKEY, { expiresIn: 60 }))
                                        callback(null,token);
                                    },
                                    function(data, callback) {
                                        res.setHeader('Cache-Control', 'no-store');
                                        res.setHeader('Pragma', 'no-cache');
                                        res.status(200).json({success:"True",message:"密碼正確",jwt:data});
                                    }
                                ])
                            } else {
                                console.error('wrong password : ', email);
                                return res.status(404).json({success: "False", message: '密碼錯誤，請確認後再試一次'});
                            }
                        })
                        .catch(err => console.error('Error at compare password & pwHash', err.message));
                }
            } else {
                return res.status(404).json({success: "False", message: "Duplicate entries are found in DB",});
            }
        }
    });
});

//註冊成為會員
router.post('/signUp',function(req,res){
    const email = req.body.email;
    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    let passwordHash = {};
    var mysqlPoolQuery = req.pool;
    const qstr1 = 'UPDATE user SET ? WHERE u_email = ?';
    mysqlPoolQuery('SELECT u_email,u_verify_status,u_password_hash FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
        if(DBresult.length == 0 || (DBresult.length != 0 && DBresult[0].u_verify_status == 0)){
            console.log("the account are not verified yet\n")
            return res.status(404).json({success:"False",message:"信箱尚未驗證過"})
        }else if(DBresult[0].u_password_hash != null){
            console.log("the account has already signUp")
            return res.status(404).json({success:"False",message:"帳戶已經註冊過，請前往登入頁面"})
        }else{
            usr = req.body;
            console.log(DBresult[0])
            bcrypt
            .genSalt(saltRounds)
            .then(salt => {
                usr.salt = salt;
                return bcrypt.hash(usr.password, salt);
            })
            .then(hash => {
                let userNew = {
                    u_salt: usr.salt,
                    u_password_hash: hash,
                };
                passwordHash.passwordHash = hash;
                console.log(email);
                mysqlPoolQuery(qstr1, [userNew,email], function (err, result) {
                    if (err) {
                        res.status(400);
                        res.json({
                            "message": "[Error] Failure :\n" + err,
                            "success": false,
                        });
                        console.error(err)
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
            }
    });
});

//送出驗證碼
router.post('/verify_email', async function(req,res){
    const email = req.body.email;
    const u_verify_code = req.body.verify_code;
    const _time = await getTimeServerTime()
    var mysqlPoolQuery = req.pool;
    
    if(email && u_verify_code){
        var result = await getUserVerifyCode(mysqlPoolQuery,email);
        var verify_code = result[0];
        var expr = result[1];
        if(u_verify_code == verify_code && _time <= expr){
            var sql = { u_verify_status:1 };
            mysqlPoolQuery('UPDATE user SET ? WHERE u_email = ?', [sql,email], function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: "False", message: "更新帳戶信箱驗證狀態失敗:\n"});
                } else {
                    console.log("更新帳戶信箱驗證狀態成功")
                }
            });
            return res.status(200).json({success: "True", verify: true, message: "驗證成功"})
        }else{
            return res.status(200).json({success: "True", verify: false, message: "驗證碼錯誤或是超過驗證時效"})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters"});
    }
    
    function getUserVerifyCode(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_verify_code, u_verify_code_expr  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve([DBresult[0].u_verify_code,DBresult[0].u_verify_code_expr]);
                }
            });
        })
    }
})
//發送驗證信 ＆ 再次發送驗證信
router.post('/send_email', async function (req, res) {
    const email = req.body.email;
    const _time = await getTimeServerTime()
    var expr = _time+10; // 時效為10分鐘 (單位為分鐘)
    var u_verify_code = Math.floor(Math.random() * 1000000);
    var mysqlPoolQuery = req.pool;

    var sql = {
       u_email:email,
       u_verify_status:0,
       u_verify_code:u_verify_code,
       u_verify_code_expr:expr
    };
    console.log(sql)
    function addAccount(mysqlPoolQuery){
        mysqlPoolQuery('INSERT INTO user SET ?', sql, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({success: "False", message: "帳戶新增寫入資料庫失敗:\n"});
            } else {
                console.log("帳戶新增寫入資料庫成功")
            }
        });
    }
    function updateAccount(mysqlPoolQuery,email){
        mysqlPoolQuery('UPDATE user SET ? WHERE u_email = ?', [sql,email], function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({success: "False", message: "更新帳戶新增寫入資料庫失敗\n"});
            } else {
                console.log("更新帳戶新增寫入資料庫成功")
            }
        });
    }
    function checkUserAccount(mysqlPoolQuery, email) {
        mysqlPoolQuery('SELECT u_email,u_verify_status  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(DBresult);
                if(DBresult.length==0){
                    console.log('add new account');
                    addAccount(mysqlPoolQuery);
                    sendEmail();
                }else{
                    console.log('account already exist');
                    if(DBresult[0].u_verify_status == 0){
                        updateAccount(mysqlPoolQuery,email);
                        sendEmail();
                    }else{
                        console.log('account already verified')
                        return res.status(404).json({success:"False",message:"帳戶已經驗證通過\n"});
                    } 
                }
            }
        });
    }
    function sendEmail(){
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
            subject: '電利超商註冊驗證信', // Subject line
            html: `<p>HCAT電利超商會員您好:<br>
                   <p>您剛剛已送出會員註冊資料, 請您依照以下六碼數字, 於HCAT電力超商APP上輸入, 以利平台驗證您的身分. 驗證通過後, 您將成為HCAT電利超商正式會員.<br>
                   <p>驗證碼 : ${u_verify_code}<br>
                   <p>驗證碼有效至 : ${expr}<br><br>
                   <p>HCAT電利超商客服`
            // html: `<p>請點以下連結以完成驗證： <a href="${process.env.SERVER_PROTOCOL}://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/frontendAPI/v1.0/User/verify_email?hash=${passwordHash}">點我完成驗證</a>` // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                res.status(400)
                res.json({
                    "message": "驗證信寄送失敗：" + err
                })
                console.error(err);
            }
            else {
                res.status(200);
                res.json({
                    "message": "驗證信寄送成功"
                })
            }
        });
    }
    
    checkUserAccount(mysqlPoolQuery,email);
});

module.exports = router;