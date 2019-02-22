var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');


// home page
router.get('/', function (req, res, next) {

    var mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT * FROM htoken.order', function (err, rows) {
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
    res.render('payByTransfer', { amount: 16800, o_IDs: ["MYRR1701_4920358206", "MYRR1701_1545109098627"],v_account: "822-03113250581281" });
});
*/

router.post('/POST/postToBank', async function (req, res, next) {
    var paymentInfo = JSON.parse(req.body.JSONtoBank)
    console.log(paymentInfo)
    //console.log(paymentInfo)
    await setTimeout(function () {
        let bank = true;

        res.json({
            bank: bank,
            amount: paymentInfo.amount
        });
    }, 3000);
});

router.post('/POST/updateOrder', function (req, res, next) {

    var mysqlPoolQuery = req.pool;
    var order = JSON.parse(req.body.o_IDs);
    var sql = {
        o_paymentStatus: "completed"
    };

    order.o_IDs.forEach(element => {
        //console.log(element)
        mysqlPoolQuery('UPDATE htoken.order SET ? WHERE o_id = ?', [sql, element], function (err, rows) {
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

router.post('/POST/sendPaidMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '107753016@mail2.nccu.tw',
            pass: 'dadada456'
        }
    });

    var text = '<h2>付款成功</h2> <p>'+mailInfo.name+'您好：<br>我們已收到您的付款，訂單編號為:<br>'+ mailInfo.o_IDs+'，您可以從下列網址追蹤您的訂單。<a href="http://en.wikipedia.org/wiki/Lorem_ipsum" title="Lorem ipsum - Wikipedia, the free encyclopedia">Lorem ipsum</a>  </p>'

    var options = {
        //寄件者
        from: '103753016@mail2.nccu.tw',
        //收件者
        to: mailInfo.email,
        //主旨
        subject: '付款成功通知',
        //嵌入 html 的內文
        html: text
    };

    //發送信件方法
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('訊息發送: ' + info.response);
            res.send('success')
        }
    });
})

///////////匯款部分//////////
router.get('/GET/bank', async function (req, res, next) {
    res.json({ v_account: "822-03113250581281" });
});

router.post('/POST/sendTransferInfoMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '107753016@mail2.nccu.tw',
            pass: 'dadada456'
        }
    });

    var text = '<h2>匯款資訊'+mailInfo.v_account+'</h2> <p>'+mailInfo.name+'您好：<br>此次預計付款訂單編號為:<br>'+ mailInfo.o_IDs+'。<br>請將以下金額匯入指定帳戶:<br>'+mailInfo.amount+'NTD。<br>以下是您的匯款資訊:<br>'+ mailInfo.v_account +'  </p>'

    var options = {
        //寄件者
        from: '103753016@mail2.nccu.tw',
        //收件者
        to: mailInfo.email,
        //主旨
        subject: ' 匯款通知',
        //嵌入 html 的內文
        html: text
    };

    //發送信件方法
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('訊息發送: ' + info.response);
            res.send('success')
        }
    });
})

router.post('/POST/bindOrder', function (req, res, next) {

    var mysqlPoolQuery = req.pool;
    var order = JSON.parse(req.body.o_IDs);

    var sql = {
        o_bankvirtualaccount: req.body.v_account
    };

    order.o_IDs.forEach(element => {
        //console.log(element)
        mysqlPoolQuery('UPDATE htoken.order SET ? WHERE o_id = ?', [sql, element], function (err, rows) {
            if (err) {
                console.log(err);
                res.json({
                    status: "fail",
                    o_IDs: element
                });
            }
        });
    });
    res.json({
        status: "success",
        o_IDs: order.o_IDs,
        v_account: req.body.v_account
    });

});


module.exports = router;
