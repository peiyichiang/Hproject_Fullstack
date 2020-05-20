var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
const { getTimeServerTime } = require('../../../timeserver/utilities');
const fetch = require("node-fetch");
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

async function getbalanceof(){
    const BcApiBase = "http://localhost:3030/Contracts/";
    console.log(BcApiBase)
    const url = BcApiBase+`tokenHCAT/balanceOf`;
    // http://localhost:3030/Contracts/tokenHCAT/balanceOf/
    var ctrtAddr = 0xAb974D97Ec089d326f493F44AfF9D3EA380DB4e8
    var assetbookAddr = 0xABeC535d76BE8aDDC7d19a630F94B6132239Ac43
    const data = {ctrtAddr, assetbookAddr };
    const options = {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers:{'Content-Type': 'application/json'}
    };
    const response = await fetch(url, options).catch(error => console.error('Error:', error));
    const jsonObj = await response.json();
    console.log('jsonObj', jsonObj);
    document.getElementById("balanceOfM").innerText = jsonObj['balanceOf'];
}
router.get('/asset',async function (req,res){
    console.log("This is asset API")
    // getbalanceof()
    //get user information from req.decoded
    //_userName = req.decoded.name;
    // _userEmail = req.decoded.email;
    _userEmail = 'ivan55660228@gmail.com';
    //database query
    const _time = await getTimeServerTime() // using await to avoid async problem (function should be async)
    const query = req.frontendPoolQuery;
    if (_userEmail && _time){
        query('asset',[_userEmail,_time]).then((result) => {
            var string=JSON.stringify(result); 
            var data = JSON.parse(string);
            data = formating(data);
            if (data.length != 0){
                return res.status(200).json({success:"True",data: data});
            }else{
                return res.status(404).json({success: "False", message: "data not found"});
            }
        }).catch((err => {
            console.log(err);
            return res.status(500).json({success: "False", message: "sql error"});
        }))
    }else{
        return res.status(400).json({success: "False", message: "wrong or lack parameters"});
    }
    

})
function formating(data){
    newData = []                                // the output data for new format
    data.forEach(function(item, index, array){
        key = Object.keys(item);                // all the sql result has a key see mysql.js
        if(key=="main"){
            item[key].forEach(function(item){
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
                    if(elm.symbol == symbol) elm[key] = item.sum;
                })
            })
        }    // forEach 就如同 for，不過寫法更容易
    });
    return newData
}
router.use(function (req, res, next) {
    
    var token = req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
            req.decoded = decoded;
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

module.exports = router;
