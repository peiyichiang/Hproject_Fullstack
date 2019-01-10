var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var async = require('async');
var router = express.Router();

//新增資料：接收資料的post
router.post('/POST/AddOrder', function(req, res, next) {
  console.log('------------------------==\n@Order/POST/AddOrder');
  var db = req.con; let symbol;
  console.log('req.query', req.query, 'req.body', req.body);
  if (req.body.symbol) {symbol = req.body.symbol;
  } else {symbol = req.query.symbol;}

  var db = req.con;
  //當前時間
  var timeStamp = Date.now() / 1000 | 0;//new Date().getTime();
  var currentDate = new Date();
  var date = currentDate.getDate();
  if (date<10) {date = '0'+date;}
  var month = currentDate.getMonth()+1; //Be careful! January is 0 not 1
  if (month<10) {month = '0'+month;}
  var year = currentDate.getFullYear();
  var yyyymmdd = year.toString() + month.toString() + date.toString();
  console.log('timeStamp', timeStamp, 'yyyymmdd', yyyymmdd, year, month, date);

  const nationalId = req.body.nationalId;
  const nationalIdLast5 = nationalId.toString().slice(-5);
  console.log('nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);

  var sql = {
      o_id: symbol + "_" + nationalIdLast5 + "_" + timeStamp,
      o_symbol: req.body.symbol,
      o_userIdentityNumber: nationalId,
      o_fromAddress:Math.random().toString(36).substring(2, 15),
      o_txHash:Math.random().toString(36).substring(2, 15),
      o_tokenCount: req.body.tokenCount,
      o_fundCount: req.body.fundCount,
      o_purchaseDate: yyyymmdd,
      o_paymentStatus: "waiting"
  };//random() to prevent duplicate NULL entry!

    console.log(sql);

    var qur = db.query('INSERT INTO htoken.order SET ?', sql, function (err, rows) {
        if (err) {
            console.log(err);
            res.render('error', { message: '寫入失敗', error: '' });
        }
        res.render('error', { message: '寫入成功', error: '' });
    });
    // db.query('SELECT * FROM htoken.order', function(err, rows) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     var data = rows;
    //     console.log(JSON.stringify(data));
    // });

});

//SELECT SUM(o_tokenCount) AS total FROM htoken.`order` WHERE o_symbol = 'MYRR1701';
//http://localhost:3000/Order/GET/SumAllOrdersBySymbol
router.get('/GET/SumAllOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumAllOrdersBySymbol');
    var db = req.con;
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}

    var qur = db.query(
        'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ?', symbol, function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/SumWaitingOrdersBySymbol
router.get('/GET/SumWaitingOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumWaitingOrdersBySymbol');
    let qstr1 = 'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = ?';
    var db = req.con; const status = 'waiting';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol, userId, qstrz;
    if (req.body.symbol) {
        symbol = req.body.symbol; userId = req.body.userId;
    } else {
        symbol = req.query.symbol; userId = req.query.userId;
        if (userId) {qstrz = qstr1 + ' AND o_fromAddress = ?';
        } else {qstrz = qstr1;}
    }
    var qur = db.query(qstrz, [symbol, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/OrdersByNationalId
router.get('/GET/OrdersByNationalId', function(req, res, next) {
  console.log('------------------------==\n@Order/GET/OrdersByNationalId');
  let qstr1 = 'SELECT * FROM htoken.order WHERE o_userIdentityNumber = ?';
  var db = req.con;
  console.log('req.query', req.query, 'req.body', req.body);
  let status, nationalId, qstrz;
  if (req.body.nationalId) {
      nationalId = req.body.nationalId; status = req.body.status;
  } else {
      nationalId = req.query.nationalId; status = req.query.status;
      if (status) {qstrz = qstr1 + ' AND o_paymentStatus = ?';
      } else {qstrz = qstr1;}
  }
  var qur = db.query(qstrz, [nationalId, status] , function(err, result) {
      if (err) {
          console.log(err);
          res.status(400);
          res.json({
              "message": "[Error] Failure :\n" + err
          });
      } else {
          res.status(200);
          res.json({
              "message" : "[Success] Success",
              "result" : result
          });
      }
  });
});

//http://localhost:3000/Order/GET/OrdersByFromAddr
router.get('/GET/OrdersByFromAddr', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/OrdersByFromAddr');
    let qstr1 = 'SELECT * FROM htoken.order WHERE o_fromAddress = ?';
    var db = req.con;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, userId, qstrz;
    if (req.body.userId) {
        userId = req.body.userId; status = req.body.status;
    } else {
        userId = req.query.userId; status = req.query.status;
        if (status) {qstrz = qstr1 + ' AND o_paymentStatus = ?';
        } else {qstrz = qstr1;}
    }
    var qur = db.query(qstrz, [userId, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/SumCancelledOrdersBySymbol
router.get('/GET/SumCancelledOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumCancelledOrdersBySymbol');
    var db = req.con; const status = 'cancelled';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}

    var qur = db.query(
        'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/SumExpiredOrdersBySymbol
router.get('/GET/SumExpiredOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumExpiredOrdersBySymbol');
    var db = req.con; const status = 'expired';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}

    var qur = db.query(
        'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/SumPendingOrdersBySymbol
router.get('/GET/SumPendingOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumPendingOrdersBySymbol');
    var db = req.con; const status = 'pending';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}
    var qur = db.query(
        'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//http://localhost:3000/Order/GET/SumCompletedOrdersBySymbol
router.get('/GET/SumCompletedOrdersBySymbol', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/SumCompletedOrdersBySymbol');
    var db = req.con; const status = 'completed';
    console.log('req.query', req.query, 'req.body', req.body);
    let symbol;
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}
    var qur = db.query(
        'SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = ?', [symbol, status] , function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] Success",
                "result" : result
            });
        }
    });
});

//通過User ID獲取Completed Order
router.get('/GET/GetCompletedOrdersByUserIdentityNumber',function(req, res, next) {
    var token=req.query.JWT_Token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "privatekey",function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            console.log("＊:JWT token驗證失敗");
            console.log(err);
            res.json({
                "message": "JWT token is invalid.",
                "success": false
            });
            return;
          } else {
            //JWT token驗證成功
            // console.log("＊JWT Content:" + decoded.u_identityNumber);
            //從order中查找完成的訂單，計算該使用者的資產
            var db = req.con;
            db.query('SELECT DISTINCT o_symbol FROM htoken.order WHERE o_userIdentityNumber = ? AND o_paymentStatus = ?', [decoded.u_identityNumber , "completed"] , async function(err, rows) {
                if (err) {
                    console.log(err);
                    res.json({
                        "message" : "[Success] 查找資產失敗",
                        "success": false,
                    });
                }else{
                    // 生成sql查詢語句
                    sqls=[];
                    symbols=[];
                    for(var i=0;i<rows.length;i++){
                        sqls.push('SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_userIdentityNumber = "' + decoded.u_identityNumber + '" AND o_symbol = "' + rows[i].o_symbol + '" AND o_paymentStatus = "completed"');
                        symbols.push(rows[i].o_symbol);
                    }

                    // 使用async.eachSeries執行sql查詢語句(確保上一句執行完後才執行下一句)
                    var count=-1;
                    var data = {};
                    async.eachSeries(sqls, function(item, callback) {
                        // 遍历每条SQL并执行
                        db.query(item, function(err, results) {
                          if(err) {
                            // 异常后调用callback并传入err
                            callback(err);
                          } else {
                            count++;
                            data[symbols[count]]=results[0].total;
                            // 执行完成后也要调用callback，不需要参数
                            callback();
                          }
                        });
                      }, function(err) {
                        // 所有SQL执行完成后回调
                        if(err) {
                          console.log(err);
                        } else {
                          //console.log("SQL全部执行成功");
                          res.json({
                            "message" : "[Success] 查找資產成功",
                            "success": true,
                            "MyAsset":data,
                            "AssetSymbols":symbols
                          });
                        }
                      });
                }

            });
          }
        })
    }else {
        //不存在JWT token
        console.log("＊:不存在JWT token");
        res.json({
            "message": "No JWT Token.Please login.",
            "success": false
        });
        return;
    }

    function objectify(key,value){
        console.log("＊＊＊:" + {[key]:value});
        return{
            [key]:value
        };
    }
});



module.exports = router;
