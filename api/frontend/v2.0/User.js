var express = require('express');
var router = express.Router();
const { getTimeServerTime, GenerateEOA} = require('../../../timeserver/utilities');
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
router.post('/AddUserInformation',async function(req,res){
    var user = req.body;
    var email = req.body.email;
    var mysqlPoolQuery = req.pool;
    const _time = await getTimeServerTime()
    var register_time = _time + 0
    const EOA = GenerateEOA()
    const data = {
        u_eth_add: EOA[0],//user.u_eth_add,   更改為代管的部分因此由後端進行操作，註解部分為原本前端回傳公鑰的部分
        u_eth_p:EOA[1],// 更改為代管的部分因此由後端操作，private key is here
        u_name: user.u_name,
        u_birthday: user.u_birthday,
        u_identityNumber: user.u_identityNumber,
        u_cellphone: user.u_cellphone,
        u_physicalAddress: user.u_physicalAddress,
        u_postalCode: user.u_postalCode,
        u_bankAccountName: user.u_bankAccountName,
        u_bankcode: user.u_bankcode,
        u_branchBankCode:user.u_branchBankCode,
        u_bankBooklet: user.u_bankBooklet,
        u_imagef: user.u_imagef,
        u_imageb: user.u_imageb,
        u_bankAccountimage: user.u_bankAccountimage,
        u_verify_status: 2, //第二階段註冊尚未完成審核
        u_investorLevel: 1,
        u_account_status: 0,
        u_review_status: "unapproved",
        u_register_time: register_time
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

router.post('/UserByEmail', async function (req, res, next) {
    let qstr1 = 'SELECT u_email,u_eth_add,u_name,u_verify_status FROM  user WHERE u_email = ?';
    let mysqlPoolQuery = req.pool;
    let email = req.body.email;
    var OrderOwnerEmail;
    const JWT = req.body.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            responseObj={
                success:"false",
                message:"JWT verification failed",
                errorCode:"104",
                data:{err}
            }
            return res.status(401).send(responseObj);
        }else{
            OrderOwnerEmail=decoded.data.u_email;
        }
    })

    if(OrderOwnerEmail!=email){
        return res.status(404).json({success: "False", message: "Invalid request", new_token: req.headers['x-access-token']});
    }
    if (email) {
        mysqlPoolQuery(qstr1, [email], function (err, result) {
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

router.post('/IdRegistryCheck',async function(req,res){
    var id = req.body.id ;
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery("SELECT u_email from user WHERE u_identityNumber= ?",id,async function(err,rows){
        if(id){
            if(rows.length!=0){
                res.status(200).send({
                    success:"false",
                    message:"Invalid ID number"
                })
            }else if(err){
                console.log(err)
                res.status(400).send({
                    success:"false",
                    message:"SQL die"
                })
            }else{
                res.status(200).send({
                    success:"true",
                    message:"Available ID number"
                })
            }
        }else{
            res.status(200).send({
                success:"false",
                message:"Input cannt be empty"
            })
        }
    })
})


module.exports = router;