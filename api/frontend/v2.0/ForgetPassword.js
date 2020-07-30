let express = require('express');
let router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { getTimeServerTime } = require('../../../timeserver/utilities');
let async = require('async');
var multer = require('multer');
var jwt = require('jsonwebtoken');
const TokenGenerator = require('./TokenGenerator');
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploadImgs/forgetPW');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const uploadImages = multer({ storage: Storage })
//發送驗證碼
router.post('/send_email', async function (req, res) {

    const email = req.body.email;
    const _time = await getTimeServerTime()
    var expr = _time+10; // 時效為10分鐘 (單位為分鐘)
    var fp_verification_code = Math.floor(Math.random() * 1000000);
    var mysqlPoolQuery = req.pool;

    
    function addRecord(mysqlPoolQuery,status){
        let sql = {
            fp_investor_email:email,
            fp_investor_account_status:status,
            fp_verification_code:fp_verification_code,
            fp_verification_code_expr:expr,
            fp_application_date:_time,
            fp_isApproved:0
        };
        mysqlPoolQuery('INSERT INTO forget_pw SET ?', sql, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({success: "False", message: "帳戶新增寫入資料庫失敗:\n"});
            } else {
                console.log("新增寫入資料庫成功")
                sendEmail();
            }
        });
    }

    function forgetPassword(mysqlPoolQuery, email){
        mysqlPoolQuery('SELECT u_email,u_verify_status,u_password_hash FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
            if (err) {      // sql wrong
                console.log(err);
                return res.status(500).json({success: "False", message: "更新帳戶信箱驗證狀態失敗:\n"});
            }
            else {          // sql correct
                console.log(DBresult);
                if(DBresult.length==0){     // db can't find the email record
                    console.log('account is not found');
                    return res.status(404).json({success:"False",message:"查無此帳戶"});
                }else{                      // the email is exist in db 
                    console.log('account exist');
                    if(DBresult[0].u_verify_status == 0){       // the email is not verified yet
                        console.log('account is not verified');
                        return res.status(404).json({success:"False",message:"該帳戶尚未驗證通過，請先驗證"});
                    }else{                                      // the email is verified
                        console.log('account is verified')
                        if(DBresult[0].u_password_hash == null){ // email is not signUp
                            console.log('account is not signUp');
                            return res.status(404).json({success:"False",message:"該帳戶尚未註冊，請先註冊"});
                        }else{                                   // email has been signUp
                            addRecord(mysqlPoolQuery,DBresult[0].u_verify_status);
                        }
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
                   <p>您剛剛已申請忘記密碼, 請您依照以下六碼數字, 於HCAT電力超商APP上輸入, 以利平台驗證您的身分. 驗證通過後, 您將可以更新您的密碼.<br>
                   <p>驗證碼 : ${fp_verification_code}<br>
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
    forgetPassword(mysqlPoolQuery,email);
})

//送出驗證碼
router.post('/verify_email', async function(req,res){
    const email = req.body.email;
    const fp_verification_code = req.body.fp_verification_code;
    const _time = await getTimeServerTime()
    var mysqlPoolQuery = req.pool;
    
    if(email && fp_verification_code){
        var result = await getUserVerifyCode(mysqlPoolQuery,email);
        var status = result[0]
        var verify_code = result[1];
        var expr = result[2];
        if(fp_verification_code == verify_code && _time <= expr){
            if(status == 1 || status == 2){
                message = "投資者為一階段註冊會員，不需KYC審核"
                return res.status(200).json({success: "True", verify: true, need_KYC:0, message: message})
            }else{
                message = "投資者為二階段註冊會員，需要KYC審核"
                return res.status(200).json({success: "True", verify: true, need_KYC:1, message: message})
            }
        }else{
            return res.status(200).json({success: "True", verify: false, message: "驗證碼錯誤或是超過驗證時效"})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters"});
    }
    
    function getUserVerifyCode(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT fp_investor_account_status, fp_verification_code, fp_verification_code_expr  FROM forget_pw WHERE fp_investor_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult.length);
                    let id = DBresult.length-1
                    resolve([DBresult[id].fp_investor_account_status,DBresult[id].fp_verification_code,DBresult[id].fp_verification_code_expr]);
                }
            });
        })
    }
})
//一階端註冊會員可以直接更新密碼
router.post('/changePassword', function(req,res){
    const email = req.body.email;
    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    let passwordHash = {};
    var mysqlPoolQuery = req.pool;
    const qstr1 = 'UPDATE user SET ? WHERE u_email = ?';
    usr = req.body;
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
                console.error(err)
                return res.status(400).json({success: "False", message: "更換密碼失敗"});
            } else {
                return res.status(200).json({success: "True", message: "更換密碼成功", result: passwordHash});
            }
        });
    })
    .catch(err => console.error(err.message));
});

//以下只有二階段註冊會員才需要使用

//上傳照片
router.post('/Image', uploadImages.array('image',3), function (req, res) {
    if(req.files.length != 3){
        return res.status(400).json({success: "False", message: "the number of uploaded images are less than 3", new_token: req.headers['x-access-token']})
    }else{
        data = {fp_imagef: req.files[0].path, fp_imageb: req.files[1].path, fp_bankAccountimage: req.files[2].path};
        return res.status(200).json({success: "True", data: data, new_token: req.headers['x-access-token']})
    }
    
})
//檢查是否可以申請忘記密碼，避免重複申請
router.get('/IsAbleToApply', function (req, res, next) {
    console.log('------------------------==\n@user/IsAbleToApply');
    var mysqlPoolQuery = req.pool;
    const email = req.body.email;
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

router.post('/ApplyForResettingPassword', function (req, res, next) {
    console.log('------------------------==\n@user/VerifyVerificationCode');
    var mysqlPoolQuery = req.pool;
    const email = req.body.email;
    const password = req.body.password;
    let fp_imagef = req.body.fp_imagef;
    let fp_imageb = req.body.fp_imageb;
    let fp_bankAccountimage = req.body.fp_bankAccountimage;
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
            data = {fp_salt : salt,
                    fp_password_hash : hash,
                    fp_imagef : fp_imagef,
                    fp_imageb : fp_imageb,
                    fp_bankAccountimage : fp_bankAccountimage
            }
            const applicationQuery = `
            UPDATE forget_pw 
            SET   ?
            WHERE fp_investor_email = ? 
            ORDER BY fp_application_date DESC 
            LIMIT 1`
            return query(applicationQuery, [data, email])
        })
        .then(() => {
            let accountStatus = 1;
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
            res.status(200).json({ "message": "申請成功，請等待身份驗證通過後再以新密碼登入" });
        })
        .catch((err) => {
            res.status(400).send('查詢失敗：' + err);
            console.error('query error : ' + err);
        })
})

router.use(function (req, res, next) {

    const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEY, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '10m', notBefore: '2s' });
    var token = req.headers['x-access-token'];


    if (token) {
        jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
        if (err) {
            return res.status(200).json({success: false, message: 'Failed to authenticate token.'});
        } else {
            req.decoded = decoded;
            new_token = tokenGenerator.refresh(token, { verify: { audience: 'myaud', issuer: 'myissuer' }, jwtid: '2' });
            req.headers['x-access-token'] = new_token;
            next();
        }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})
//重新登入後再執行更新EOA
router.post('/UpdateEOA',function (req, res, next) {
    console.log('------------------------==\n@user/UpdateEOA');
    const mysqlPoolQuery = req.pool;
    const email = req.decoded.data.u_email;
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
    const updateUserEOAQuery = `
            UPDATE user 
            SET    u_eth_add = ? ,
                u_account_status = ?
            WHERE  u_email = ?`;
    try {
        const EOA = req.body.EOA;
        query(updateUserEOAQuery, [EOA, 0, email])
            .then(() => {
                return res.status(200).json({success: "True", message: "EOA更新成功", new_token: req.headers['x-access-token']});
            })
            .catch((err) => {
                return res.status(500).json({success: "False", message: "sql err", new_token: req.headers['x-access-token']});
            })
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({success: "False", message: "EOA更新失敗", new_token: req.headers['x-access-token']});
    }
});
module.exports = router;