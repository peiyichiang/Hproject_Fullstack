var express = require('express');
var router = express.Router();
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
            callback(null, jwt.sign({usr_name: name},process.env.JWT_PRIVATEKEY, { expiresIn: 60 }))
        },
        function(data, callback) {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
            res.status(302).json(data);
        }
    ])
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
    newDataId = {};
    for (let i = 0; i < data.length; i++) {
        var key = Object.keys(data[i]);
        if (key == "main"){
            for (let j = 0; j < data[i]["main"].length; j++) {
                newData.push(data[i]["main"][j]);
                newDataId[data[i]["main"][j].symbol] = j;
            }  
        }
    }
    for (let i = 0; i < data.length; i++) {
        var key = Object.keys(data[i]);
        if (key != "main"){
            if(key == "income"){
                symbols = Object.keys(data[i][key])
                for (let k = 0; k < symbols.length; k++) {
                    symbol = symbols[k]
                    var id = newDataId[symbol];
                    var value = data[i][key][symbol];
                    acc_income = []
                    for (let h = 0; h < value.length; h++) {
                        if (h == 0){
                            acc_income.push(value[h])
                        }else{
                            acc_income.push(acc_income[h-1]+value[h])
                        }  
                    }
                    newData[id]["forecastedAnnualIncome"] = value;
                    newData[id]["accumulateForecastedAnnualIncome"] = acc_income;
                }
            }else{
                for (let j = 0; j < data[i][key].length; j++) {
                    var id = newDataId[data[i][key][j].symbol];
                    newData[id][key] = data[i][key][j];
                }
            }   
        }  
    }
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

router.get('/b', function (req, res) {
    res.json({message: 'Welcome to the APIs',token_playload: req.decoded, usr_name: req.decoded.usr_name});
})
module.exports = router;