var express = require('express');
var router = express.Router();
const { getTimeServerTime } = require('../../../timeserver/utilities');
const TokenGenerator = require('./TokenGenerator');
var jwt = require('jsonwebtoken');
var async = require('async');
const {bankCodes, bankBranchCodes} = require('./bankInfo')
var multer = require('multer');
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploadImgs');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const uploadImages = multer({ storage: Storage })

router.get('/bankCodes',function(req,res){
    console.log(bankCodes[0]);
    return res.status(200).json({success: "True", data: bankCodes});
})

router.get('/bankBranchCodes',function(req,res){
    var bankCode = req.body.bankCode;
    console.log(bankBranchCodes[bankCode]);
    return res.status(200).json({success: "True", data: bankBranchCodes[bankCode]});
})

router.use(function (req, res, next) {

    const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEY, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '10m', notBefore: '2s' });
    var token = req.headers['x-access-token'];


    if (token) {
        jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
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

router.post('/Image', uploadImages.array('image',3), function (req, res) {
    if(req.files.length != 3){
        return res.status(400).json({success: "False", message: "the number of uploaded images are less than 3", new_token: req.headers['x-access-token']})
    }else{
        data = {u_imagef: req.files[0].path, u_imageb: req.files[1].path, u_bankAccountimage: req.files[2].path};
        return res.status(200).json({success: "True", data: data, new_token: req.headers['x-access-token']})
    }
    
})
router.post('/AddUserInformation',function(req,res){
    var user = req.body;
    var email = req.body.email;
    var mysqlPoolQuery = req.pool;
    const data = {
        u_eth_add: user.u_eth_add,
        u_name: user.u_name,
        u_birthday: user.u_birthday,
        u_identityNumber: user.u_identityNumber,
        u_cellphone: user.u_cellphone,
        u_physicalAddress: user.u_physicalAddress,
        u_bankcode: user.u_bankcode,
        u_bankBooklet: user.u_bankBooklet,
        u_imagef: user.u_imagef,
        u_imageb: user.u_imageb,
        u_bankAccountimage: user.u_bankAccountimage,
        u_verify_status: 2, //第二階段註冊尚未完成審核
        u_investorLevel: 1,
        u_account_status: 0,
        u_review_status: "unapproved"
    }
    mysqlPoolQuery('UPDATE user SET ? WHERE u_email = ?', [data,email], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({success: "False", message: "更新帳戶資料庫失敗",new_token: req.headers['x-access-token']});
        } else {
            return res.status(200).json({success: "True", message: "更新帳戶資料庫成功",new_token: req.headers['x-access-token']});
        }
    });
})

router.get('/UserByEmail', function (req, res, next) {
    let qstr1 = 'SELECT * FROM  user WHERE u_email = ?';
    var mysqlPoolQuery = req.pool;
    var email = req.body.email;
    if (email) {
        mysqlPoolQuery(qstr1, email, function (err, result) {
            if(err){
                return res.status(500).json({success: "False", message: "sql error", new_token: req.headers['x-access-token']});
            }else{
                if(result.length == 0){
                    console.log("[Not Valid] No email is found", result);
                    return res.status(404).json({success: "False", message: " No email is found", new_token: req.headers['x-access-token']});
                }else if(result.length == 1){
                    console.log("email is found");
                    return res.status(200).json({success:"True",data: result, new_token: req.headers['x-access-token']});
                }else{
                    console.log("[Duplicated] Duplicate entries are found", result);
                    return res.status(404).json({success: "False", message: " Duplicate entries are found", new_token: req.headers['x-access-token']});
                }
            }
        })
    } else { 
        return res.status(400).json({success: "False", message: "wrong or lack parameters" ,new_token: req.headers['x-access-token']});
    }
});

module.exports = router;