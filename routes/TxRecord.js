var express = require('express');
var router = express.Router();

//撈取資料
router.get('/GET/TxRecord', function(req, res, next) {

  var db = req.con;
  var data = "";

  db.query('SELECT * FROM tx_record', function(err, rows) {
      if (err) {
          console.log(err);
      }
      var data = rows;

      // use index.ejs
      res.render('ViewTxRecord', { title: 'Tx Information', data: data});
  });

});

//新增資料:頁面
router.get('/GET/AddTxRecord', function(req, res, next) {
  // use userAdd.ejs
  res.render('AddTxRecord', { title: 'Add User'});
});

//新增資料：接收資料的post
router.post('/POST/AddTxRecord', function(req, res, next) {

  var db = req.con;

  var sql = {
      tx_hash: req.body.tx_hash,
      tx_from: req.body.tx_from,
      tx_to: req.body.tx_to,
      tx_tokencount: req.body.tx_tokencount,
      tx_fundcount: req.body.tx_fundcount
  };

 console.log(sql);

  var qur = db.query('INSERT INTO tx_record SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/GET/TxRecord');
  });

});

//刪除資料：獲取網址上的參數
router.get('/GET/DeleteTxRecord', function(req, res, next) {

    var tx_hash = req.query.tx_hash;
    var db = req.con;
  
    var qur = db.query('DELETE FROM tx_record WHERE tx_hash = ?', tx_hash, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/GET/TxRecord');
    });
  });

//修改資料：撈取原有資料到修改頁面
router.get('/GET/EditTxRecord', function(req, res, next) {

    var tx_hash = req.query.tx_hash;
    var db = req.con;
    var data = "";

    db.query('SELECT * FROM tx_record WHERE tx_hash = ?', tx_hash, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditTxRecord', { title: 'Edit TxRecord', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫
router.post('/POST/EditTxRecord', function(req, res, next) {

    var db = req.con;
    var tx_hash = req.body.tx_hash;

    console.log("*******");
    console.log(req.body);
    console.log("*******");

    var sql = {
        tx_hash: req.body.tx_hash,
        tx_from: req.body.tx_from,
        tx_to: req.body.tx_to,
        tx_tokencount: req.body.tx_tokencount,
        tx_fundcount: req.body.tx_fundcount
    };

    var qur = db.query('UPDATE tx_record SET ? WHERE tx_hash = ?', [sql, tx_hash], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/GET/TxRecord');
    });

});



module.exports = router;
