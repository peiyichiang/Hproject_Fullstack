var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');

router.get('/asset',function (req,res){
    console.log("This is asset API")
    //get parameter from req.query
    symbol = req.query.symbol;
    //get user information from jwt.decode
    userName = 'test';
    userEmail = 'ivan55660228@gmail.com';
    //database query
    const query = req.frontendPoolQuery;
    query('asset',[userEmail,symbol]).then((result) => {
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
    newData = []
    data.forEach(function(item, index, array){
        key = Object.keys(item);
        if(key=="main"){
            item[key].forEach(function(item){
                newData.push(item);
            })
        }else if(key=="assetRecord"){
            item[key].forEach(function(item){
                var symbol = item.symbol;
                id = newData.findIndex(obj => obj.symbol === symbol);
                delete item.symbol;
                if(newData[id][key]== undefined) newData[id][key] = [];
                newData[id][key].push(item);
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
