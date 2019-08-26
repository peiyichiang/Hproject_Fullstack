var express = require('express');
//var jwt = require('jsonwebtoken');
var router = express.Router();


router.get('/crowdfunding', function (req, res, next) {
  res.render('crowdfunding', {contractType: 'Crowdfunding'});
});

router.get('/tokenController', function (req, res, next) {
  res.render('tokenController', {contractType: 'TokenController'});
});

// router.post('/ContractExplorer', function (req, res, next) {
//     console.log('inside button response...');

//     res.send({
//       status: 'success'
//   });
// });
/**
    var mysqlPoolQuery = req.pool;
    var ID = req.body.m_id;
    var Password = req.body.m_password;

    mysqlPoolQuery('SELECT * FROM backend_user WHERE m_id = ?', ID, function (err, rows) {
        if (err) {
            console.log(err);
        }
        console.log(rows.length);

        if (rows.length == 0) {
            res.render('error', { message: '查無此帳號', error: '' });
        } else {
            // console.log("Password:" + Password);
            // console.log( rows[0].m_passwordhash);
        }
        // res.render('EditBackendUser', { title: 'Edit Product', data: data });
    });
 */


/*
router.get('/BackendUser_Platform_Supervisor', function (req, res, next) {
    var token=req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if(decoded.exp<dateNow.getLocalTime()/1000){
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: err, error: '' });
                // console.log("******:" + err);
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    console.log("******:" + JWT_decoded);
    if(JWT_decoded!==undefined){
        var mysqlPoolQuery = req.pool;
        var data = "";

        var iaData;
        mysqlPoolQuery(""  , function(err, rows) {
            if (err) {
                console.log(err);
            }
            iaData = rows;
            console.log("@@" + JSON.stringify(rows));
        });
    
        mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
            if (err) {
                console.log(err);
            }
            var data = rows;
    
            // use index.ejs
            console.log("***:" + JWT_decoded.payload.m_id);
            res.render('ProductAdministration', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data,iaData:iaData });
        });
    }

});
*/

module.exports = router;
