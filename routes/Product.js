var express = require('express');
var router = express.Router();

//撈取資料
router.get('/GET/Product', function (req, res, next) {

    var mysqlPoolQuery = req.pool;
    var data = "";

    mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        res.render('ViewProduct', { title: 'Product Information', data: data });
    });

});

//新增資料:頁面
router.get('/GET/AddProduct', function (req, res, next) {
    // use userAdd.ejs
    res.render('AddProduct', { title: 'Add Product' });
});

//新增資料：接收資料的post
router.post('/POST/AddProduct', function (req, res, next) {

    var mysqlPoolQuery = req.pool;

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

    var qur = mysqlPoolQuery('INSERT INTO product SET ?', sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/Product');
    });

});

//刪除資料：獲取網址上的參數
router.get('/GET/DeleteProduct', function (req, res, next) {

    var SYMBOL = req.query.SYMBOL;
    var mysqlPoolQuery = req.pool;

    var qur = mysqlPoolQuery('DELETE FROM product WHERE SYMBOL = ?', SYMBOL, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/Product/GET/Product');
    });
});

//修改資料：撈取原有資料到修改頁面
router.get('/GET/EditProduct', function (req, res, next) {

    var SYMBOL = req.query.SYMBOL;
    var mysqlPoolQuery = req.pool;
    var data = "";

    mysqlPoolQuery('SELECT * FROM product WHERE SYMBOL = ?', SYMBOL, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditProduct', { title: 'Edit Product', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫
router.post('/POST/EditProduct', function (req, res, next) {

    var mysqlPoolQuery = req.pool;
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

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE SYMBOL = ?', [sql, SYMBOL], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/Product');
    });

});

//有容
router.get('/productList', function (req, res) {
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT * FROM product', function (err, result) {
        if (err) {
            res.status(400)
            res.json({
                "message": "產品列表取得失敗:\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "產品列表取得成功！",
                "result": result
            });
        }
        /* code = 304? */
    });
});

//Ray ... htoken.  omitted
router.get('/Get/ProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    //console.log('req', req);
    console.log('------------------------==\n@Product/Get/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM htoken.product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    mysqlPoolQuery(qstr1, [symbol], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] 產品symbol found 取得成功！",
                "result": result
            });
        }
    });
});

module.exports = router;
