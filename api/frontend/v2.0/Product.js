var express = require('express');
var router = express.Router();
const TokenGenerator = require('./TokenGenerator');
var jwt = require('jsonwebtoken');
var async = require('async');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { getTimeServerTime } = require('../../../timeserver/utilities');

router.post('/a', function (req, res) {
    name = req.body.name;
    async.waterfall([
        function(callback) {
            const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEYp, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '1m', notBefore: '2s' })
            token = tokenGenerator.sign({ myclaim: 'something' }, { audience: name, issuer: 'myissuer', jwtid: '1', subject: 'user' })
            //callback(null, jwt.sign({usr_name: name},process.env.JWT_PRIVATEKEY, { expiresIn: 60 }))
            callback(null,token);
        },
        function(data, callback) {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
            res.status(302).json(data);
        }
    ])
})

router.post('/c',function(req,res){
    const tokenGenerator = new TokenGenerator('a', 'a', { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '2m', notBefore: '2s' })
    token = tokenGenerator.sign({ myclaim: 'something' }, { audience: 'myaud', issuer: 'myissuer', jwtid: '1', subject: 'user' })
    console.log(token)
    setTimeout(function () {
    token2 = tokenGenerator.refresh(token, { verify: { audience: 'myaud', issuer: 'myissuer' }, jwtid: '2' })
    console.log(jwt.decode(token, { complete: true }))
    console.log(jwt.decode(token2, { complete: true }))
    }, 3000)
})

router.get('/ProductInfo',function (req,res){
    console.log("This is ProductInfo API")
    //get parameter from req.query
    const status = req.query.status;
    //database query
    const query = req.frontendPoolQuery;
    query('product',[status]).then((result) => {
        var string=JSON.stringify(result); 
        var data = JSON.parse(string)
        data = formating(data);
        return res.json({message: 'success',data: data});
    }).catch((err => {
        // console.log(err);
        return res.json({message: 'fail'});
    }))

})
function formating(data){
    newData = [];
    data.forEach(function(item, index, array){
        key = Object.keys(item);
        if(key=="main"){
            item[key].forEach(function(obj){
                newData.push(obj);
            })
        }else if(key=="income"){
            console.log(item[key])
            newData.forEach(function(obj){
                symbol = obj.symbol;
                acc_income = [];
                item[key][symbol].forEach(function(value){
                    if(acc_income.length == 0) acc_income.push(value); 
                    else acc_income.push(value+acc_income[acc_income.length-1]);
                })
                obj["forecastedAnnualIncome"] = item[key][symbol];
                obj["accumulateForecastedAnnualIncome"] = acc_income;
            })
        }else{
            item[key].forEach(function(item){
                var symbol = item.symbol;
                id = newData.findIndex(obj => obj.symbol === symbol);
                delete item.symbol;
                newData[id][key] = item;
            })
        }    // forEach 就如同 for，不過寫法更容易
    });
    return newData;
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

router.get('/b', function (req, res) {
    res.json({message: 'Welcome to the APIs',token_playload: req.decoded});
})
module.exports = router;