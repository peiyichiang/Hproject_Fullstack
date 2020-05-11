var express = require('express');
var router = express.Router();
// const TokenGenerator = require('./TokenGenerator');
var jwt = require('jsonwebtoken');
var async = require('async');

router.get('/QueryOrder', function(req,res){
    console.log("This is QueryOrder API");
    _userEmail = 'ivan55660228@gmail.com';
    const query = req.frontendPoolQuery;
    if (_userEmail){
        query('queryOrder',[_userEmail]).then((result) => {
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
            item[key].forEach(function(obj){
                if(obj.status == 'waiting'){  // this is waiting
                    obj.date = obj.date.substring(0,10).replace(/[-]/g,'')+obj.temp_date.substring(7,12)
                    
                }
                delete obj.temp_date
                newData.push(obj);
            })
        }// forEach 就如同 for，不過寫法更容易
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