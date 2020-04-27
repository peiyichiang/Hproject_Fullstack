var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
const { getTimeServerTime } = require('../../../timeserver/utilities');
const powerGenerationdata = {
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
router.get('/asset',async function (req,res){
    console.log("This is asset API")
    //get user information from req.decoded
    //_userName = req.decoded.name;
    //_userEmail = req.decoded.email;
    _userEmail = 'ivan55660228@gmail.com';
    // _date = getTimeServerTime().then()
    // console.log(_date)
    //database query
    const time = await getTimeServerTime() // using await to avoid async problem (function should be async)
    const query = req.frontendPoolQuery;
    query('asset',[_userEmail,time]).then((result) => {
        var string=JSON.stringify(result); 
        var data = JSON.parse(string);
        data = formating(data);
        return res.json({message: 'success',data: data});
    }).catch((err => {
        console.log(err);
        return res.json({message: 'fail'});
    }))

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
