var express = require('express');
var router = express.Router();

//撈取資料
router.get('/GET/Product', function(req, res, next) {

  var db = req.con;
  var data = "";

  db.query('SELECT * FROM product', function(err, rows) {
      if (err) {
          console.log(err);
      }
      var data = rows;

      // use index.ejs
      res.render('ViewProduct', { title: 'Product Information', data: data});
  });

});

//新增資料:頁面
router.get('/GET/AddProduct', function(req, res, next) {
  // use userAdd.ejs
  res.render('AddProduct', { title: 'Add Product'});
});

//新增資料：接收資料的post
router.post('/POST/AddProduct', function(req, res, next) {

  var db = req.con;

  var sql = {
      SYMBOL: req.body.p_SYMBOL,
      p_name: req.body.p_name,
      Location: req.body.p_location,
      price: req.body.p_pricing,
      duration: req.body.p_duration,
      currency: req.body.p_currency,
      irr: req.body.p_irr
  };

 console.log(sql);

  var qur = db.query('INSERT INTO product SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/Product/GET/Product');
  });

});

//刪除資料：獲取網址上的參數
router.get('/GET/DeleteProduct', function(req, res, next) {

    var SYMBOL = req.query.SYMBOL;
    var db = req.con;
  
    var qur = db.query('DELETE FROM product WHERE SYMBOL = ?', SYMBOL, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/Product/GET/Product');
    });
  });

//修改資料：撈取原有資料到修改頁面
router.get('/GET/EditProduct', function(req, res, next) {

    var SYMBOL = req.query.SYMBOL;
    var db = req.con;
    var data = "";

    db.query('SELECT * FROM product WHERE SYMBOL = ?', SYMBOL, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditProduct', { title: 'Edit Product', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫
router.post('/POST/EditProduct', function(req, res, next) {

    var db = req.con;
    var SYMBOL = req.body.SYMBOL;

    console.log("*******");
    console.log(req.body);
    console.log("*******");

    var sql = {
        SYMBOL: req.body.SYMBOL,
        p_name: req.body.p_name,
        Location: req.body.Location,
        price: req.body.price,
        duration: req.body.duration,
        currency: req.body.currency,
        irr: req.body.irr
    };

    var qur = db.query('UPDATE product SET ? WHERE SYMBOL = ?', [sql, SYMBOL], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/Product');
    });

});

//有容
router.get('/productList', function (req, res) {
    let db = req.con;
    db.query('SELECT * FROM product', function (err , result) {
        if (err) {
            res.status(400)
            res.json({
                "message": "產品列表取得失敗:\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message" : "產品列表取得成功！",
                "result" : result
            });
        }
        /* code = 304? */
    });
});



module.exports = router;
