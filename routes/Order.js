var express = require('express');
var router = express.Router();

//新增資料：接收資料的post
router.post('/POST/AddOrder', function(req, res, next) {

  var db = req.con;
  //當前時間
  var timeStamp = new Date().getTime();
  var sql = {
      o_id:req.body.o_symbol + "_" + timeStamp,
      o_symbol: req.body.o_symbol,
      o_fromAddress:Math.random().toString(36).substring(2, 15),
      o_txHash:Math.random().toString(36).substring(2, 15),
      o_tokenCount: req.body.o_tokenCount,
      o_fundCount: req.body.o_fundCount,
      o_purchaseDate: timeStamp,
      o_paymentStatus: "not_paid"
  };//random() to prevent duplicate NULL entry!

 console.log(sql);

  var qur = db.query('INSERT INTO htoken.order SET ?', sql, function(err, rows) {
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



module.exports = router;
