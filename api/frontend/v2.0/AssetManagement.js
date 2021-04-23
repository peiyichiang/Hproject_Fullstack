var express = require('express');
const Web3 = require('web3');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
const { getTimeServerTime } = require('../../../timeserver/utilities');
const { blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, isTimeserverON, wlogger, addrRegistry } = require('../../../timeserver/envVariables');
const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
const TokenGenerator = require('./TokenGenerator');
const fetch = require("node-fetch");
const { stringify } = require('event-stream');
const powerGenerationdata = {
    "five":0,
    "six": 0,
    "seven": 0,
    "eight": 0,
    "nine": 0,
    "ten": 0,
    "eleven": 0,
    "twelve": 0,
    "thirteen": 0,
    "fourteen": 0,
    "fifteen": 0,
    "sixteen": 0,
    "seventeen": 0
}

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

function getbalanceof(mysqlPoolQuery,symbol,user){
    return new Promise(async (resolve, reject) => {
        mysqlPoolQuery("SELECT * FROM investor_assetRecord WHERE ar_tokenSYMBOL = ? AND ar_investorEmail = ?",[symbol,user],function(err,rows){
            if(err){
                resolve("QueryError")
            }else if(rows){
                resolve(rows[0].ar_Holding_Amount_in_the_end_of_Period)
            }else{
                resolve("NoRecord")
            }
        })
        /*const HCAT721_AssetTokenContract = require('../../../ethereum/contracts/build/HCAT721_AssetToken.json');
        var ctrtAddr = await getctrtAddr(mysqlPoolQuery,symbol);
        var assetbookAddr = await getassetbookAddr(mysqlPoolQuery,user);
        if(ctrtAddr && assetbookAddr){
            const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
            if(instHCAT721 != undefined){
                // console.log(instHCAT721)
                const balanceOf = await instHCAT721.methods.balanceOf(assetbookAddr).call();
                resolve(balanceOf);
            }  
        }*/
    })
}
function getctrtAddr(mysqlPoolQuery,symbol) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT sc_erc721address  FROM smart_contracts WHERE sc_symbol = ?', [symbol], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(DBresult[0].sc_erc721address);
            }
        });
    })
}
function getassetbookAddr(mysqlPoolQuery,user) {
    return new Promise((resolve, reject) => {
        mysqlPoolQuery('SELECT u_eth_add FROM user WHERE u_email = ?', [user], function (err, DBresult, rows) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(DBresult[0].u_eth_add);
            }
        });
    })
}

router.get('/asset',async function (req,res){
    console.log("This is asset API")
    var mysqlPoolQuery = req.pool;
    //get user information from req.decoded
    var _userName = req.decoded.data.u_name;
    var _userEmail = req.decoded.data.u_email;
    // var _userEmail = 'ivan55660228@gmail.com';
    console.log(_userEmail)
    //database query
    const _time = await getTimeServerTime() // using await to avoid async problem (function should be async)
    const query = req.frontendPoolQuery;
    if (_userEmail && _time){
        query('asset',[_userEmail,_time]).then(async (result) => {
            var string=JSON.stringify(result); 
            var data = JSON.parse(string);
            data = formating(data);
            if(data.length === 0) {
                return res.status(200).json({ success: "True", message: "this user has no asset", new_token: req.headers['x-access-token']}); // Brian: 新使用者沒有asset
            }
            data = await AddBalanceOf(data,_userEmail,mysqlPoolQuery);
            if (data.length != 0){
                //回傳累積電廠發電量
               var temp=0
               for(var i=0;i <data.length;i++){
                   var power_per = 0
                   power_per =await getAccPowerTotal(data,i)
                   temp+=power_per
               }
               temp = temp.toFixed(2)
               return res.status(200).json({success:"True",data: data,power_total_acc:parseFloat(temp),new_token: req.headers['x-access-token']});                
            }else{
                return res.status(404).json({success: "False", message: "data not found", new_token: req.headers['x-access-token']});
            }
        }).catch((err => {
            console.log(err);
            return res.status(500).json({success: "False", message: "sql error", new_token: req.headers['x-access-token']});
        }))
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters", new_token: req.headers['x-access-token']});
    }
    function AddBalanceOf(data,user,mysqlPoolQuery) {
        return new Promise(async (resolve, reject) => {
            var itemsProcessed = 0;
            data.forEach(async function(item,index,array){
                var symbol = item.symbol;
                var balanceOf = await getbalanceof(mysqlPoolQuery,symbol,user);
                data[index]['balanceOf'] = balanceOf;
                if(data[index]['balanceOf']){
                    itemsProcessed++;
                }
                if(itemsProcessed === array.length){
                    resolve(data);
                }
            })  
        })
    }
    async function getAccPowerTotal(data,i){
        return new Promise(function(resolve,reject){
           mysqlPoolQuery(`SELECT 
           temp.symbol,
           sum(temp.dailyrd)
           FROM (SELECT 
           rd.rd_apistringofmonitor AS symbol,
           rd.rd_sum/p.p_totalrelease AS  dailyrd
           FROM radiation_data rd
           inner join product p
           ON rd.rd_apistringofmonitor = p.p_SYMBOL) temp
           group by temp.symbol
           having symbol = ?`,data[i].symbol,(err,rows)=>{
               
            if(err){
                console.log(err)
                reject(0)
            }
            else{
                try{
                    resolve(rows[0]["sum(temp.dailyrd)"]*data[i]["balanceOf"])
                }catch(err){
                    resolve(0)
                }
                
            }
        })
           })
    }

    function formating(data){
        newData = []                                // the output data for new format
        data.forEach(function(item, index, array){
            key = Object.keys(item);                // all the sql result has a key see mysql.js
            if(key=="main"){
                item[key].forEach(async function(item){
                    item.feedInTariff=item.feedInTariff.toFixed(4)
                    newData.push(item);
                })
            }else if(key=="assetRecord"){
                item[key].forEach(function(item){
                    var symbol = item.symbol;
                    id = newData.findIndex(obj => obj.symbol === symbol);
                    delete item.symbol;
                    if(newData[id][key]== undefined) newData[id][key] = [];  // initialize the assetRecord with aan empty arry
                    newData[id][key].push(item);
                })
            }else if(key=="powerGeneration"){
                newData.forEach(function(elm){
                    if(elm[key]== undefined) elm[key] = powerGenerationdata;    // setting powerGeneration default values
                })
                item[key].forEach(function(item){
                    // console.log(item);
                    var symbol = item.symbol;
                    newData.forEach(function(elm){
                        if(elm.symbol == symbol) elm[key] = {...elm[key],...item};  // using spread syntax to overwrite default values
                    })
                })
    
            }else if(key=="powerGenerationAcc"){
                item[key].forEach(function(item){
                    // console.log(item);
                    var symbol = item.symbol;
                    newData.forEach(function(elm){
                        if(elm[key] == undefined) elm[key] = 0;
                        if(elm.symbol == symbol) elm[key] = parseFloat(item.sum);
                        if(elm.symbol == symbol) elm['forecastedPeriodIncomePerPiece'] = parseFloat((item.sum*item.p_feedintariff).toFixed(2));
                    })
                })
            }   // forEach 就如同 for，不過寫法更容易
        });
        return newData
    }

})
module.exports = router;
