var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');


///////////刷卡部分//////////
//模擬銀行API（簡略版）
router.post('/postToBank', async function (req, res, next) {
    var paymentInfo = JSON.parse(req.body.JSONtoBank)
    console.log(paymentInfo)
    await setTimeout(function () {
        res.status(200);
        res.json({
            "message": "[Success] Success",
            "result": true,
            "amount": paymentInfo.amount
        });
    }, 3000);
});

//更新訂單狀態
router.post('/updateOrder', function (req, res, next) {

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
                res.status(400);
                res.json({ "message": "[Error] Failure :" + err });
            }
        });
    });
    res.status(200);
    res.json({
        "message": "[Success] Success",
        "o_IDs": order.o_IDs
    });

});

//寄付款成功信件
router.post('/sendPaidMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '107753016@mail2.nccu.tw',
            pass: 'dadada456'
        }
    });

    var text = '<h2>付款成功</h2> <p>' + mailInfo.name + '您好：<br>我們已收到您的付款，訂單編號為:<br>' + mailInfo.o_IDs + '，您可以從下列網址追蹤您的訂單。<a href="http://en.wikipedia.org/wiki/Lorem_ipsum" title="Lorem ipsum - Wikipedia, the free encyclopedia">Lorem ipsum</a>  </p>'

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
            console.log(err);
            res.status(400);
            res.json({ "message": "[Error] Failure :" + err });
        } else {
            console.log('訊息發送: ' + info.response);
            res.status(200);
            res.json({
                "message": "[Success] Success",
                "info": info.response
            });
        }
    });

})

///////////匯款部分//////////
//回傳虛擬帳號資訊
router.get('/virtualAccount', async function (req, res, next) {
    res.json({ v_account: "822-03113250581281" });
});

//寄付款資訊信件
router.post('/sendTransferInfoMail', function (req, res, next) {

    var mailInfo = JSON.parse(req.body.mailInfo);

    //宣告發信物件
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '107753016@mail2.nccu.tw',
            pass: 'dadada456'
        }
    });

    var text = '<h2>匯款資訊' + mailInfo.v_account + '</h2> <p>' + mailInfo.name + '您好：<br>此次預計付款訂單編號為:<br>' + mailInfo.o_IDs + '。<br>請將以下金額匯入指定帳戶:<br>' + mailInfo.amount + 'NTD。<br>以下是您的匯款資訊:<br>' + mailInfo.v_account + '  </p>'

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
            console.log(err);
            res.status(400);
            res.json({ "message": "[Error] Failure :" + err });
        } else {
            console.log('訊息發送: ' + info.response);
            res.status(200);
            res.json({
                "message": "[Success] Success",
                "info": info.response
            });
        }
    });
})

router.post('/bindOrder', function (req, res, next) {

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
                res.status(400);
                res.json({ "message": "[Error] Failure :" + err });
            }
        });
    });
    res.status(200);
    res.json({
        "message": "[Success] Success",
        "o_IDs": order.o_IDs,
        "v_account": req.body.v_account
    });

});


module.exports = router;
