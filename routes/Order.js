var express = require('express');
var router = express.Router();

//新增資料：接收資料的post
router.post('/POST/AddOrder', function(req, res, next) {
  console.log('------------------------==');
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

  var sql = {
      o_id: req.body.o_symbol + "_" + req.body.nationalIdLast5 + "_" + timeStamp,
      o_symbol: req.body.o_symbol,
      o_fromAddress:Math.random().toString(36).substring(2, 15),
      o_txHash:Math.random().toString(36).substring(2, 15),
      o_tokenCount: req.body.o_tokenCount,
      o_fundCount: req.body.o_fundCount,
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

//http://localhost:3000/Order/GET/OrdersByUserId
router.get('/GET/OrdersByUserId', function(req, res, next) {
    console.log('------------------------==\n@Order/GET/OrdersByUserId');
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


module.exports = router;
