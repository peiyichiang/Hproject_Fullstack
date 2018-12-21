var express = require('express');
var router = express.Router();


// home page
router.get('/', function (req, res, next) {

    var db = req.con;
    var data = "";

    db.query('SELECT * FROM htoken.order', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        res.render('payment', { title: 'paymentGW', data: data });
    });

});

router.get('/GET/pay', async function (req, res, next) {
    res.render('payByCreditCard', { amount: 16800, o_IDs: ["MYRR1701_4920358206", "MYRR1701_1545109098627"] });
});

/*
router.get('/GET/bank', async function (req, res, next) {
    res.render('bank', { title: 'bankGW' });
});
*/

router.post('/POST/postToBank', async function (req, res, next) {
    var paymentInfo = JSON.parse(req.body.JSONtoBank)
    //console.log(paymentInfo)
    await setTimeout(function () {
        let bank = true;

        res.send({
            bank: bank,
            amount: paymentInfo.amount
        });
    }, 3000);
});

router.post('/POST/updateOrder', function (req, res, next) {

    var db = req.con;
    var order = JSON.parse(req.body.o_IDs);
    var sql = {
        o_paymentStatus: "completed"
    };

    order.o_IDs.forEach(element => {
        //console.log(element)
        db.query('UPDATE htoken.order SET ? WHERE o_id = ?', [sql, element], function (err, rows) {
            if (err) {
                console.log(err);
                res.send({
                    status: "fail",
                    o_IDs: element
                });
            }
        });
    });
    res.send({
        status: "success",
        o_IDs: order.o_IDs
    });

});


module.exports = router;
