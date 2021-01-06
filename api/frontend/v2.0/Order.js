var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
var request = require('request');
const nodemailer = require('nodemailer');
const TokenGenerator = require('./TokenGenerator');
const { checkCompliance } = require('../../../ethereum/contracts/zsetupData');
const { getTimeServerTime } = require('../../../timeserver/utilities');
var request = require('request');

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

router.get('/QueryOrder', function(req,res){
    console.log("This is QueryOrder API");
    var _userEmail = req.decoded.data.u_email;
    console.log(_userEmail)
    // _userEmail = 'ivan55660228@gmail.com';
    const query = req.frontendPoolQuery;
    if (_userEmail){
        query('queryOrder',[_userEmail]).then((result) => {
            var string=JSON.stringify(result); 
            var data = JSON.parse(string);
            data = formating(data);
            if (data.length != 0){
                return res.status(200).json({success:"True",data: data, new_token: req.headers['x-access-token']});
            }else{
                // return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']});
                return res.status(200).json({success: "True", message: "this user has no order", new_token: req.headers['x-access-token']});
            }
        }).catch((err => {
            console.log(err);
            return res.status(500).json({success: "False", message: "sql error", new_token: req.headers['x-access-token']});
        }))
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
    function formating(data){
        newData = []                                // the output data for new format
        data.forEach(function(item, index, array){
            key = Object.keys(item);                // all the sql result has a key see mysql.js
            if(key=="main"){
                item[key].forEach(function(obj){
                    if(obj.status == 'waiting'){  // this is waiting
                        obj.date = obj.date.substring(0,10).replace(/[-]/g,'')+obj.temp_date.substring(8,12)
                    }
                    delete obj.temp_date
                    newData.push(obj);
                })
            }// forEach 就如同 for，不過寫法更容易
        });
        return newData
    }
})

const remainRelease = (query,symbol) => {
    return new Promise(function (resolve, reject) {
        query('remainRelease_Order',[symbol]).then((result) => {
            var string = JSON.stringify(result); 
            var data = JSON.parse(string);
            var remainRelease = data[0][0].remainRelease;
            if (remainRelease){
                resolve(remainRelease);
            }else{
                resolve(-1);
            }
        }).catch((err => {
            console.log("sql error\n"+ err);
            resolve(-1);
        }))
    });
  }

router.get('/RemainRelease',async function(req,res){
    console.log("This is RemainRelease API");
    const symbol = req.body.symbol;
    const query = req.frontendPoolQuery;
    if (symbol){
        var data = await remainRelease(query,symbol);
        if(data){
            return res.status(200).json({success: "True", remainRelease: data, new_token: req.headers['x-access-token']});
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']});
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
})

//檢查下單資格
router.get('/QualifyPlaceOrder',async function(req,res){
    var mysqlPoolQuery = req.pool;
    // 判斷案場是否仍在可下單的時間內 大於 CFSD 且 小於 CFED
    const symbol = req.body.symbol;
    if(symbol){
        const time = await getTimeServerTime();
        var result = await getSymbolCFSDCFED(mysqlPoolQuery,symbol);
        var cfsd = Number(result.p_CFSD);
        var cfed = Number(result.p_CFED);
        if(cfsd && cfed){
            if(time < cfsd || time > cfed){
                return res.status(200).json({success: "True", quaification: false, message: "非合法購買時間", new_token: req.headers['x-access-token']})
            }
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
    
    //要改用jwt取得
    // const email = 'ivan55660228@gmail.com';
    const email = req.decoded.data.u_email;
    console.log(email)
    if(email){
        var UserVerifyStatus = await getUserVerifyStatus(mysqlPoolQuery,email);
        if(UserVerifyStatus){
            if(UserVerifyStatus == 3){
                return res.status(200).json({success: "True", quaification: true, new_token: req.headers['x-access-token']});
            }else{
                var message = "";
                if(UserVerifyStatus == 2){
                    message = "第二階段註冊尚未完成審核"
                }else if(UserVerifyStatus == 1){
                    message = "已完成一階段註冊但尚未第二階段註冊"
                }else{
                    message = "一階段註冊尚未完成信箱驗證"
                }
                return res.status(200).json({success: "True", quaification: false, message: message, new_token: req.headers['x-access-token']});
            }
        }else{
            return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']})
        }
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
     
    function getUserVerifyStatus(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_verify_status  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve(DBresult[0].u_verify_status);
                }
            });
        })
    }
    function getSymbolCFSDCFED(mysqlPoolQuery, symbol){
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT p_CFSD,p_CFED  FROM product WHERE p_SYMBOL = ?', [symbol], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve(DBresult[0]);
                }
            });
        })
    }
    
})

router.post('/PlaceOrder', async function(req,res){
    console.log('------------------------==\n@Order/GET/PlaceOrder');
    const symbol = req.body.symbol;
    const mysqlPoolQuery = req.pool;
    const query = req.frontendPoolQuery;

    //當前時間
    var timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    var currentDate = new Date();
    var purchasedDate = currentDate.myFormat();//yyyymmddhhmm
    console.log('---------------== purchasedDate:', purchasedDate);
    var expiredDate = await new Date(currentDate.setDate(currentDate.getDate() + 3)).myFormat();
    console.log('---------------== expiredDate:', expiredDate);
    // 要用jwt來取資料
    // const nationalId = req.decoded.userIdentity;
    // const email = req.decoded.email;
    // const nationalId = 'A128465975';
    // const email = 'ivan55660228@gmail.com';
    const nationalId = req.decoded.data.u_identityNumber;
    const email = req.decoded.data.u_email;
    console.log(nationalId);
    console.log(email);
    const tokenCount = req.body.tokenCount;
    const fundCount = req.body.fundCount


    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);
    
    let userName;

    const bankVirtualAccount = await getBankVirtualAccount(orderId, symbol, email, expiredDate, fundCount);

    var sql = {
        o_id: orderId,
        o_symbol: symbol,
        o_email: email,
        o_txHash: Math.random().toString(36).substring(2, 15),
        o_tokenCount: tokenCount,
        o_fundCount: fundCount,
        o_purchaseDate: purchasedDate,
        o_paymentStatus: "waiting",
        o_bankvirtualaccount: bankVirtualAccount
    };//random() to prevent duplicate NULL entry!

    var remain = await remainRelease(query,symbol);
    if(tokenCount <= remain){
        mysqlPoolQuery('INSERT INTO order_list SET ?', sql, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({success: "False", message: "訂單寫入資料庫失敗:\n", new_token: req.headers['x-access-token']});
            } else {
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
                    subject: 'HCAT下單成功', // Subject line
                    html: `<h2>下單成功</h2>
                    <p>
                    <p>親愛的您好:<br>
                    <p>您剛下了一張訂單，此次購買 ${symbol} 共 ${tokenCount} 片，總計 ${fundCount} 元<br>
                    <p>請參照以下指示完成您的付款。<br><br>
                    <p>請儘快使用網路銀行、網絡 eATM 轉帳付款，或至就近銀行或郵局的 ATM 自動提款機輸入以下帳號及金額完成付款。<br><br>
    
                    <p>訂單編號: ${orderId}<br>
                    <p>購買時間: ${purchasedDate}<br>
                    <p>銀行代碼: 永豐銀行807
                    <p>轉帳帳號名: 銀鏈資產管理有限公司
                    <p>轉帳帳號: ${bankVirtualAccount}
                    <p>總金額: NT$${fundCount}
                    </p>`, // plain text body
                };
    
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(404).json({success: "False", message: "驗證信寄送失敗"+err, new_token: req.headers['x-access-token']});
                    }
                    else {
                        data = [{ "purchaseDate":purchasedDate , "orderId":orderId , "bankaccount":bankVirtualAccount}]
                    }
                    // console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    return res.status(200).json({success:"True",data: data, new_token: req.headers['x-access-token']});
                });
            }
        });
    }else{
        return res.status(404).json({success: "False", message: "下單數超過可購買數量", new_token: req.headers['x-access-token']});
    }
    
    /* TODO */
    function getBankVirtualAccount(orderId, symbol, email, expiredDate, fundCount) {
        return new Promise(async (resolve, reject) => {
            /**專案代號(3) oid(2) 身分證字號(3) 太陽日(5) 檢查碼(1) */
            let o_id = orderId;
            console.log(req.body);

            // SELECT table: product in: p_SYMBOL out: p_fundmanager
            // SELECT table: backend_user in: m_id out: m_bankcode
            // SELECT table: user in: u_email out:u_identityNumber, u_name
            let mysqlPoolQuery = req.pool;
            // let DBresult = await getInfoFromOrder_list(mysqlPoolQuery, o_id);
            console.log("o_symbol:" + symbol);
            let amountToPaid = fundCount;
            let fundmanager = await getFundmanager(mysqlPoolQuery, symbol);
            let bankcode = await getBankcode(mysqlPoolQuery, fundmanager);
            console.log(email);
            let userId = await getUserId(mysqlPoolQuery, email);
            let userName = await getUserName(mysqlPoolQuery, email);


            // 計算太陽日
            let expiredSolarDay = await countExpiredSolarDay(expiredDate);

            // 計算檢查碼
            let virtualAccount_13digits = bankcode + o_id.slice(-2) + userId.slice(-3) + expiredSolarDay;
            console.log(virtualAccount_13digits);
            let amountToPaid_11digits = lpad(amountToPaid, 11);
            console.log(amountToPaid_11digits);
            let checkCode = await calculateCheckCode(virtualAccount_13digits, amountToPaid_11digits);

            //產生14碼虛擬帳號
            let virtualAccount = bankcode + o_id.slice(-2) + userId.slice(-3) + expiredSolarDay + checkCode;


            //todo 將訂單資訊與虛擬帳號綁定 UPDATE table: order_list in: o_bankvirtualaccount
            // await bindOrder(mysqlPoolQuery, o_id, virtualAccount);

            resolve(virtualAccount);
        })
    }

    function getFundmanager(mysqlPoolQuery, p_SYMBOL) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT p_fundmanager  FROM product WHERE p_SYMBOL = ?', [p_SYMBOL], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    console.log(p_SYMBOL);
                    console.log(p_SYMBOL);
                    console.log(DBresult);
                    console.log(DBresult);
                    console.log(DBresult);

                    resolve(DBresult[0].p_fundmanager);
                }
            });
        })
    }
    function getBankcode(mysqlPoolQuery, m_id) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT m_bankcode  FROM backend_user WHERE m_id = ?', [m_id], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve(DBresult[0].m_bankcode);
                }
            });
        })
    }
    function getUserId(mysqlPoolQuery, u_email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_identityNumber  FROM user WHERE u_email = ?', [u_email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(DBresult);
                    resolve(DBresult[0].u_identityNumber);
                }
            });
        })
    }
    function getUserName(mysqlPoolQuery, email) {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery('SELECT u_name  FROM user WHERE u_email = ?', [email], function (err, DBresult, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log(DBresult);
                    resolve(DBresult[0].u_name);
                }
            });
        })
    }
    function countExpiredSolarDay(purchaseDate) {
        return new Promise((resolve, reject) => {
            let year = parseInt(expiredDate.slice(0, 4));
            let month = parseInt(expiredDate.slice(4, 6));
            let day = parseInt(expiredDate.slice(6, 8));
            console.log(year);
            console.log(month);
            console.log(day);

            let expired_days_passed = countDays_passed(new Date(year, month - 1, day));
            console.log(expired_days_passed);
            console.log(lpad(expired_days_passed, 3));

            let solarDay = expiredDate.slice(2, 4) + lpad(expired_days_passed, 3);
            console.log("訂單過期太陽日:"+solarDay);

            resolve(solarDay)
        })
    }

    //計算今年的第幾天
    function countDays_passed(date) {
        var current = new Date(date.getTime());
        var previous = new Date(date.getFullYear(), 0, 1);

        return Math.ceil((current - previous + 1) / 86400000);
    }

    //補足位數
    function lpad(value, padding) {
        var zeroes = new Array(padding + 1).join("0");
        return (zeroes + value).slice(-padding);
    }

    function calculateCheckCode(v_13digits, m_11digits) {
        let value1 = 0;
        let weightingarray1 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5];
        for (i = 0; i < 13; i++) {
            value1 += parseInt(v_13digits[i]) * parseInt(weightingarray1[i]);
        }
        console.log(value1);
        let value2 = 0;
        let weightingarray2 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3];
        for (i = 0; i < 11; i++) {
            value2 += parseInt(m_11digits[i]) * parseInt(weightingarray2[i]);
        }
        console.log(value2);
        let checkCode = (value1 + value2) % 10;
        return checkCode;
    }

    Date.prototype.myFormat = function () {
        return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
    }; 
})

// 新增二手市場的訂單
router.post('/Order', async function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    const Symbol = req.body.Symbol;
    const OrderPrice = req.body.OrderPrice;
    const OrderQuantity = req.body.OrderQuantity;
    const OrderType = "ASK";
    // const OrderOwnerEmail = req.body.OrderOwnerEmail;
    var OrderOwnerEmail;
    let OrderUUID = req.body.OrderUUID;
    const Action = req.body.Action;
    const JWT = req.body.JWT;
    const OrderTimestamp=Date.now();
    // 更新Order內容
    function UpdateOrder(OrderUUID,OrderType,OrderPrice,OrderQuantity,OrderSymbol,OrderOwnerEmail,OrderTimestamp){
        mysqlPoolQuery("SELECT * FROM Order_sec WHERE OrderUUID=?",[OrderUUID],async function(err,rows){
            if(rows[0]){
                if(rows[0].OrderQuantity!=OrderQuantity){ //本次UPDATE的數量與資料庫不同，故訂單Price需修改
                    try{
                        //觸動交割錢包，讓更新後的OrderQuantity數量與鎖倉Token數量持平
                        await TokenLockBalancing(OrderQuantity-rows[0].OrderQuantity,OrderOwnerEmail,TokenAddress,OrderPrice);
                        //更新DB中的細節
                        DbOrderDetailUpdate(OrderUUID,OrderPrice,OrderQuantity);
                    }catch(err){
                        res.status(401).send({
                            "success":"false",
                            "message": err
                        })
                    }
                }else{ //本次UPDATE的數量與資料庫相同，故只需要修改訂單Price，修改資料庫即可
                    DbOrderDetailUpdate(OrderUUID,OrderPrice,OrderQuantity);
                }
            }else{
                ResultObj={"success":false,"message":"Error occurred:Query Order detail failed (Update)"};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,OrderSymbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                res.status(401).send(ResultObj);
            }
        })
    }
    //更新Order的資料庫部分
    function DbOrderDetailUpdate(OrderUUID,OrderPrice,OrderQuantity){
        var sql={OrderPrice:OrderPrice,OrderQuantity:OrderQuantity}
        mysqlPoolQuery("UPDATE Order_sec SET ?  WHERE (OrderUUID = ?);",[sql,OrderUUID],function(err){
            if(err){
                ResultObj={"success":false,"message":"Error occurred:Update Order detail failed . "+err};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                res.status(401).send(ResultObj);
            }
            else{
                res.status(401).send({
                    "success":true,
                    "message":":Update Order detail successfully"
                })
            }
        })
    }
    //處理DB訂單數量與鎖倉數量平衡
    async function TokenLockBalancing(QuantityDelta,OrderOwnerEmail,TokenAddress,OrderPrice){
        return new Promise(function(resolve,reject){
            var options;
        if(QuantityDelta>0){
            options = {
                'method': 'POST',
                'url': 'http://127.0.0.1:3030/Contracts/TokenLock',
                'headers': {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                  'u_email': OrderOwnerEmail,
                  'quantity': QuantityDelta,
                  'TokenAddr': TokenAddress,
                  'price': OrderPrice
                }
            };
        }else{
            options = {
                'method': 'POST',
                'url': 'http://127.0.0.1:3030/Contracts/TokenTransferBack',
                'headers': {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                  'u_email': OrderOwnerEmail,
                  'quantity': -1*QuantityDelta,
                  'TokenAddr': TokenAddress
                }
            };
        }

        request(options, function (error, response) {
            if (error){
                ResultObj={"success":false,"message":"Token Manipulation Fail",data:error};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                reject(ResultObj);
            }
            if(JSON.parse(response.body).success){
                ResultObj=JSON.parse(response.body);
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                resolve(ResultObj);
                //res.status(401).send(ResultObj);
            }else{
                ResultObj=JSON.parse(response.body);
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                reject(ResultObj);
            }
        });
        })
        
    }
    // 鎖倉
    function TokenLock(OrderPrice,OrderQuantity,OrderOwnerEmail,TokenAddress){
        var options = {
            'method': 'POST',
            'url': 'http://127.0.0.1:3030/Contracts/TokenLock',
            'headers': {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
              'u_email': OrderOwnerEmail,
              'quantity': OrderQuantity,
              'TokenAddr': TokenAddress,
              'price': OrderPrice
            }
        };

        request(options, function (error, response) {
            if (error){
                ResultObj={"success":false,"message":"TokenLock Fail",data:error};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                res.status(401).send(ResultObj);
            }
            if(JSON.parse(response.body).success){
                ResultObj=JSON.parse(response.body);
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                CreateOrder(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp);
                //res.status(401).send(ResultObj);
            }else{
                ResultObj=JSON.parse(response.body);
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                res.status(401).send(ResultObj);
            }
        });
    }

    // 取得ToeknAddress
    function getToeknAddress(Symbol){
        // Step 1:撈取ToeknAddress
        mysqlPoolQuery("SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol=?",[Symbol],async function(err,rows){
            if(err){
                ResultObj={"success":false,"message":"Error occurred:Query sc_erc721address"};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                res.status(401).send(ResultObj);
            }
            else{
                if(rows.length>0){
                    TokenAddress=rows[0].sc_erc721address;
                    // Step 2:TokenLock
                    if(Action=="CREATE"){
                        TokenLock(OrderPrice,OrderQuantity,OrderOwnerEmail,TokenAddress);
                    }
                    if(Action=="UPDATE"){
                        UpdateOrder(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp);
                    }  
                }else{
                    ResultObj={"success":false,"message":"Symbol is not exist","errorCode":"108"};
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                    res.status(401).send(ResultObj);
                }
       
            }
        })
    }

    function SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,OrderSymbol,OrderOwnerEmail,OrderTimestamp,ActionType,OrderResult){
        sql={
            OrderUUID:OrderUUID,
            OrderType:OrderType,
            OrderPrice:OrderPrice,
            OrderQuantity:OrderQuantity,
            OrderSymbol:OrderSymbol,
            OrderOwnerEmail:OrderOwnerEmail,
            OrderTimestamp:OrderTimestamp,
            ActionType:ActionType,
            OrderResult:JSON.stringify(OrderResult)
        }

        var qur = mysqlPoolQuery('INSERT INTO OrderLog SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
                ResultObj={"success":false,"message":"Save OrderLog Fail",errorCode:"109",data:err};
                // res.status(401).send(ResultObj);
            }else{
                ResultObj={"success":true,"message":"Save data to OrderLog"};
                // res.status(401).send(ResultObj);
            }
        });
    }

    function CreateOrder(OrderUUID,OrderType,OrderPrice,OrderQuantity,OrderSymbol,OrderOwnerEmail,OrderTimestamp){
        sql={
            OrderUUID:OrderUUID,
            OrderType:OrderType,
            OrderPrice:OrderPrice,
            OrderQuantity:OrderQuantity,
            OrderSymbol:OrderSymbol,
            OrderOwnerEmail:OrderOwnerEmail,
            OrderTimestamp:OrderTimestamp
        }

        var qur = mysqlPoolQuery('INSERT INTO Order_sec SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
                ResultObj={"success":false,"message":"Save Order Fail",errorCode:"110",data:err};
                res.status(401).send(ResultObj);
            }else{
                ResultObj={"success":true,"message":"Save data to Order"};
                res.status(401).send(ResultObj);
            }
        });
    }

    

    // 驗證JWT並從JWT中讀取email
    {
        jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
            if (err) {
                responseObj={
                    success:"false",
                    message:"JWT verification failed",
                    errorCode:"104",
                    data:{err}
                }
                res.status(401).send(responseObj);
            }else{
                // responseObj={
                //     success:"true",
                //     message:"JWT verification success",
                //     data:{decoded}
                // }
                // // 從JWT中讀取email
                // res.status(401).send(responseObj);
                OrderOwnerEmail=decoded.data.u_email;
            }
        })
    }

    // 若Action=CREATE,則產生UUID
    {
        if(Action=="CREATE"){
            var dt = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (dt + Math.random()*16)%16 | 0;
                dt = Math.floor(dt/16);
                return (c=='x' ? r :(r&0x3|0x8)).toString(16);
            });
            OrderUUID=uuid;
        }
    }
    
    // 取得目前token在第幾期
    function getTokenPeriod(Symbol){
        mysqlPoolQuery("SELECT ia_time FROM income_arrangement WHERE ia_SYMBOL=?",[Symbol],async function(err,rows){
            if(err){
                ResultObj={"success":false,"message":"Error occurred:Query ia_time"};
                res.status(401).send(ResultObj);
            }
            else{
                if(rows.length>0){
                    // 取得當前時間
                    currentTimestamp=new Date().getTime();
                    currentPeroid=0;
                    // ia_time為預計發放時間,超過ia_time則算是下一期
                    for(var i=0;i<rows.length;i++){
                        ia_time_Year=parseInt(rows[i]["ia_time"].toString().substring(0,4));
                        ia_time_Month=parseInt(rows[i]["ia_time"].toString().substring(4,6))-1;     //JavaScript 表達月份 (month) 是從 0 到 11，0 是一月；11 是十二月
                        ia_time_Date=parseInt(rows[i]["ia_time"].toString().substring(6,8));
                        ia_time_Hour=parseInt(rows[i]["ia_time"].toString().substring(8,10));
                        ia_time_Minute=parseInt(rows[i]["ia_time"].toString().substring(10,12));
                        ia_time_Timestamp=new Date(ia_time_Year,ia_time_Month,ia_time_Date,ia_time_Hour,ia_time_Minute).getTime();
                        if(currentTimestamp>ia_time_Timestamp){
                            currentPeroid=currentPeroid+1
                        }
                        if(currentTimestamp<ia_time_Timestamp){
                            break;
                        }
                    }
                    // +1是因為發過就算下一期,-1是因為從0開始
                    currentPeroid=currentPeroid+1-1;
                    getTokenPriceLimit(Symbol,currentPeroid);
                    // ResultObj={"success":true,"message":"success",data:{"Peroid":currentPeroid}};
                    // res.status(401).send(ResultObj);
                }else{
                    ResultObj={
                      success:"false",
                      message:"Symbol is not exist",
                      errorCode:"108",
                      data:{}
                    };
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                    res.status(401).send(ResultObj);
                }
            }
        })
    }

    // 取得第N期的token的價格上下限
    function getTokenPriceLimit(Symbol,Period){
        mysqlPoolQuery("SELECT ia_tokenValuation FROM income_arrangement WHERE ia_SYMBOL=? AND ia_Payable_Period_End=?",[Symbol,Period],async function(err,rows){
            if(err){
                ResultObj={"success":false,"message":"Error occurred:Query ia_tokenValuation,ia_tradingRange"};
                res.status(401).send(ResultObj);
            }
            else{
                if(rows.length>0){
                    CheckData(rows[0]["ia_tokenValuation"]);
                    // ResultObj={"success":true,"message":"success",data:rows[0]["ia_tokenValuation"]};
                    // res.status(401).send(ResultObj);
                }else{
                    ResultObj={
                      success:"false",
                      message:"ia_tokenValuation is not exist",
                      errorCode:"108",
                      data:{}
                    };
                    res.status(401).send(ResultObj);
                }
            }
        })
    }

    // 資料檢查
    function CheckData(tokenValuation){
        // Action只能是CREATE,UPDATE
        if(Action!="CREATE" && Action!="UPDATE"){
            ResponseObj={
                success:"false",
                message:"Action is illegal",
                errorCode:"106",
                data:{}
            }
            SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
            res.status(401).send(ResponseObj);
            return false;
        }

        // 若action為Update則OrderUUID不能為空
        if(Action=="Update" && OrderUUID==""){
            ResponseObj={
                success:"false",
                message:"OrderUUID is empty",
                errorCode:"102",
                data:{}
            }
            SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
            res.status(401).send(ResponseObj);
            return false;
        }

        // OrderPrice不能超過當期的tokenValuation上下25%
        if(parseInt(OrderPrice)>parseInt(tokenValuation)*1.25 || parseInt(OrderPrice)<parseInt(tokenValuation)*0.75){
            ResponseObj={
              success:"false",
              message:"price is illegal",
              errorCode:"101",
              data:{}
            }
            SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
            res.status(401).send(ResponseObj);
            return false;
        }

        // 通過檢查後開始ToeknLock()
        // getToeknAddress() => TokenLock()
        getToeknAddress(Symbol);
    }

    // getTokenPeriod() => getTokenPriceLimit() => CheckData() => getToeknAddress() => TokenLock()
    getTokenPeriod(Symbol);
});

router.post("/OrderCancel", async function(req,res){
    const mysqlPoolQuery = req.pool;
    const query = req.frontendPoolQuery;
    var Symbol;
    var OrderQuantity ;
    const OrderUUID = req.body.OrderUUID;
    const OrderType = "ASK"
    const JWT = req.body.JWT;
    var OrderPrice ;
    const Action = "DELETE";
    
        
    const OrderTimestamp=Date.now();
    // decode JWT 取得用戶 e-mail 並且認證
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            responseObj={
                success:"false",
                message:"JWT verification failed",
                errorCode:"104",
                data:{err}
            }
            res.status(401).send(responseObj);
        }else{
            responseObj={
                success:"true",
                message:"JWT verification success",
                data:{decoded}
            }
            // 從JWT中讀取email
            OrderOwnerEmail=decoded.data.u_email;
        }
    })
    
    //執行刪除動in DB
    function DeleteOrderInDb(OrderUUID){
        mysqlPoolQuery("DELETE FROM `Order_sec` WHERE (`OrderUUID` = ?);",[OrderUUID],function(err){
            if(err){
                ResultObj={"success":false,"message":"Error occurred:Delete Order failed . "+err};
                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                res.status(401).send(ResultObj);
            }
            else{
                res.status(401).send({
                    "success":true,
                    "message":":Delete Order detail successfully"
                })
            }
        })
    }

    //儲存log資料的Function
    function SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,OrderSymbol,OrderOwnerEmail,OrderTimestamp,ActionType,OrderResult){
        sql={
            OrderUUID:OrderUUID,
            OrderType:OrderType,
            OrderPrice:OrderPrice,
            OrderQuantity:OrderQuantity,
            OrderSymbol:OrderSymbol,
            OrderOwnerEmail:OrderOwnerEmail,
            OrderTimestamp:OrderTimestamp,
            ActionType:ActionType,
            OrderResult:JSON.stringify(OrderResult)
        }

        var qur = mysqlPoolQuery('INSERT INTO OrderLog SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
                ResultObj={"success":false,"message":"Save OrderLog Fail",errorCode:"109",data:err};
                // res.status(401).send(ResultObj);
            }else{
                ResultObj={"success":true,"message":"Save data to OrderLog"};
                // res.status(401).send(ResultObj);
            }
        });
    }

    
    // 觸發區跨練取消掛單API，"/TokenTransferBack"
    async function TokenTransferBack(OrderQuantity,OrderOwnerEmail,TokenAddress){
        return new Promise(function(resolve, reject){
            var options = {
                'method': 'POST',
                'url': 'http://127.0.0.1:3030/Contracts/TokenTransferBack',
                'headers': {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                  'u_email': OrderOwnerEmail,
                  'quantity': OrderQuantity,
                  'TokenAddr': TokenAddress
                }
              };
    
              request(options, function (error, response) {
                if (error){
                    ResultObj={"success":false,"message":"TokenLock Fail",data:error};
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                    reject(ResultObj);
                }
                if(JSON.parse(response.body).success){
                    ResultObj=JSON.parse(response.body);
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                    resolve(ResultObj);
                    //res.status(401).send(ResultObj);
                }else{
                    ResultObj=JSON.parse(response.body);
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResultObj);
                    reject(ResultObj);
                }
            });
        })
    }

    async function MainFunction(){
        mysqlPoolQuery("SELECT * FROM Order_sec WHERE OrderUUID = ?",[OrderUUID],async function(err,rows){
            if(err){
                res.status(401).send({
                    "success":"false",
                    "message":"DB query for Order detail failed"
                })
            }
            else if(rows[0]){
                OrderQuantity = rows[0].OrderQuantity;
                OrderPrice = rows[0].OrderPrice;
                Symbol = rows[0].OrderSymbol;
                email = rows[0].OrderOwnerEmail;
                try{
                    mysqlPoolQuery('SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol=?',[Symbol],async function (err,rows){
                        if(err){
                            ResponseObj={
                                "success": "false",
                                "message": "erc721 address db query failed  "+err
                            }
                            SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                            res.status(401).send(ResponseObj)
                        }
                        else{
                            try{
                                if(OrderOwnerEmail==email){
                                    await TokenTransferBack(OrderQuantity,OrderOwnerEmail,rows[0].sc_erc721address);
                                    DeleteOrderInDb(OrderUUID);
                                }else{
                                    res.status(401).send({
                                        "success":"false",
                                        "message":"Invalid target order. Please choose your own Secondary Market order."
                                    })
                                }
                                
                            }catch(err){
                                ResponseObj={
                                    "success":"false",
                                    "message":err
                                }
                                SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                                res.status(401).send(ResponseObj)
                            }
                        }
                    })
                    // 成功取消掛單後，更新DB，PendingOrderUUID、PendingOrderPrice、PendingOrderQuantity這些
                    
                    
                }
                catch(err){
                    ResponseObj={
                        "success":"false",
                        "message":err
                    }
                    SaveOrderLog(OrderUUID,OrderType,OrderPrice,OrderQuantity,Symbol,OrderOwnerEmail,OrderTimestamp,Action,ResponseObj);
                    res.status(401).send(ResponseObj)
                }
            }
            else{
                res.status(401).send({
                    "success":"false",
                    "message":"DB query success but Order not found"
                })
            }
        })        
    }
    MainFunction();
    })



    router.get("/SecOrderQuery",function(req,res){
        const mysqlPoolQuery = req.pool;
        var OrderOwnerEmail = req.query.OrderOwnerEmail
        var OrderSymbol = req.query.OrderSymbol
        if(OrderOwnerEmail&&OrderSymbol){
            console.log("Sec Order Query By Email and Symbol")
            mysqlPoolQuery("SELECT * FROM htoken_newschema.Order_sec WHERE OrderOwnerEmail = ? AND OrderSymbol = ?",[OrderOwnerEmail,OrderSymbol],function(err,rows){
                if(err){
                    res.status(401).send({
                        "success":"false",
                        "message":"order query failed"
                    })
                }else if(rows[0]){
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success.",
                        "data":rows
                    })
                }else{
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success but no order found."
                    })
                }
            })
        }
        else if(OrderOwnerEmail){
            console.log("Sec Order Query By Email")
            mysqlPoolQuery("SELECT * FROM htoken_newschema.Order_sec WHERE OrderOwnerEmail = ?",[OrderOwnerEmail],function(err,rows){
                if(err){
                    res.status(401).send({
                        "success":"false",
                        "message":"order query failed"
                    })
                }else if(rows[0]){
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success.",
                        "data":rows
                    })
                }else{
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success but no order found."
                    })
                }
            })
        }else if(OrderSymbol){
            console.log("Sec Order Query by Symbol")
            mysqlPoolQuery("SELECT * FROM htoken_newschema.Order_sec WHERE OrderSymbol = ?",[OrderSymbol],function(err,rows){
                if(err){
                    res.status(401).send({
                        "success":"false",
                        "message":"order query failed"
                    })
                }else if(rows[0]){
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success.",
                        "data":rows
                    })
                }else{
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success but no order found."
                    })
                }
            })
        }
        else{
            console.log("Sec Order Query without Email")
            mysqlPoolQuery("SELECT * FROM htoken_newschema.Order_sec ",function(err,rows){
                if(err){
                    res.status(401).send({
                        "success":"false",
                        "message":"order query failed"
                    })
                }else if(rows[0]){
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success.",
                        "data":rows
                    })
                }else{
                    res.status(401).send({
                        "success":"true",
                        "message":"order query success but no order found."
                    })
                }
            })
        }
        
        
    })
    
    router.post('/GiftQualificationCheck',function(req,res){
        var mysqlPoolQuery = req.pool;
        var symbol = req.body.symbol;
        var quantity = req.body.quantity;
        mysqlPoolQuery('SELECT p_giftid,p_pricing,g_giftRequirement FROM product Inner Join gift On product.p_giftid=gift.g_id WHERE product.p_SYMBOL = ?',[symbol],function(err,rows){
            if(err){
                res.status(401).send({
                    "success":false,
                    "message":"DB query is failed. "+err
                })
            }else if(rows){
                if(quantity*rows[0].p_pricing>rows[0].g_giftRequirement){
                    res.status(401).send({
                        "success":true,
                        "message":"GiftQualificationCheck Pass"
                    })
                }else{
                    res.status(401).send({
                        "success":true,
                        "message":"GiftQualificationCheck doesn't Pass"
                    })
                }
            }else{
                res.status(401).send({
                    "success":false,
                    "message":"DB query is success but data not found."
                })
            }
        })
    })

    


module.exports = router;