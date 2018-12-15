var express = require('express');
var router = express.Router();

//新增資料：接收資料的post
router.post('/POST/AddOrder', function(req, res, next) {

  var db = req.con;
  //當前時間
  var timeStamp = new Date().getTime();
  var currentDate = new Date();
  var date = currentDate.getDate();
  if (date<10) {date = '0'+date;}
  var month = currentDate.getMonth()+1; //Be careful! January is 0 not 1
  if (month<10) {month = '0'+month;}
  var year = currentDate.getFullYear();
  var yyyymmdd = year.toString() + month.toString() + date.toString();
  console.log('timeStamp', timeStamp, 'yyyymmdd', yyyymmdd, year, month, date);

  var sql = {
      o_id:req.body.o_symbol + "_" + timeStamp,
      o_symbol: req.body.o_symbol,
      o_fromAddress:Math.random().toString(36).substring(2, 15),
      o_txHash:Math.random().toString(36).substring(2, 15),
      o_tokenCount: req.body.o_tokenCount,
      o_fundCount: req.body.o_fundCount,
      o_purchaseDate: yyyymmdd,
      o_paymentStatus: "new"
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
