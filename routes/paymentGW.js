var express = require('express');
var router = express.Router();



router.get('/GET/pay', async function (req, res, next) {
    res.render('payment', { amount: 16800, o_id: "MYRR1701_4920358206" });
});

/*
router.get('/GET/bank', async function (req, res, next) {
    res.render('bank', { title: 'bankGW' });
});
*/

router.post('/POST/postToBank', async function (req, res, next) {
    await setTimeout(function () {
        let bank = true;

        res.send({
            bank: bank,
            name: req.body.name,
            cardNumber: req.body.card_no1 + "-" + req.body.card_no2 + "-" + req.body.card_no3 + "-" + req.body.card_no4,
            securityCode: req.body.securityCode,
            dated: req.body.month + "-" + req.body.year,
            amount: req.body.amount,
            o_id: req.body.o_id
        });
    }, 3000);
});

router.post('/POST/updateOrder', function (req, res, next) {

    var db = req.con;
    var o_id = req.body.o_id;

    var sql = {
        o_paymentStatus: "paid"
    };

    var qur = db.query('UPDATE htoken.order SET ? WHERE o_id = ?', [sql, o_id], function (err, rows) {
        if (err) {
            console.log(err);
            res.send({
                status: "fail",
                o_id: o_id
            });
        }
        res.send({
            status: "success",
            o_id: o_id
        });
    });

});


module.exports = router;
