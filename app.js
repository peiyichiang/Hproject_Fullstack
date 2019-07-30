var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
var multer = require('multer');
// var debugSQL = require('debug')('dev:mysql');
// var timeout = require('connect-timeout'); //express v4

require("dotenv").config();

const { isTimeserverON, useFullTimeServer } = require('./ethereum/contracts/zsetupData');

console.log('loading app.js modules...');
//智豪
var indexRouter = require('./routes/TxRecord');
var productRouter = require('./routes/Product');
var backendUserRouter = require('./routes/backend_user');
//有容
var userRouter = require('./routes/user');
var incomeManagementRouter = require('./routes/IncomeManagementAPI');

//Chih-Hao
var orderRouter = require('./routes/Order');
//冠毅
var paymentGWRouter = require('./routes/PaymentGW');
var ContractsRouter = require('./routes/Contracts');
// var usersRouter = require('./routes/users');

// DataBase
const { mysqlPoolQuery } = require('./timeserver/mysql.js');


var app = express();
// app.use(timeout(1200000));
// app.use(haltOnTimedout);
// function haltOnTimedout(req, res, next){
//  if (!req.timedout) next();
// }

//智豪
app.use(session({
    secret: 'NCCU Blockchain Hub',
    resave: true,
    saveUninitialized: true
}));

//有容
app.use(cors({ credentials: true }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(function (req, res, next) {
    req.pool = mysqlPoolQuery;
    next();
});

//智豪
app.use('/', indexRouter);
app.use('/Product', productRouter);
app.use('/BackendUser', backendUserRouter);

//＊＊＊＊＊＊＊＊＊＊＊＊＊＊上傳文件＊＊＊＊＊＊＊＊＊＊＊＊＊＊
//配置diskStorage來控制文檔存儲的位置以及文檔名字等
var storage = multer.diskStorage({
    //確定圖片存儲的位置
    destination: function (req, file, cb) {
        cb(null, './public/uploadImgs')
    },
    //確定圖片存儲時的名字,注意，如果使用原名，可能會造成再次上傳同一張圖片的時候的衝突
    filename: function (req, file, cb) {
        //重新命名
        //console.log(file.fieldname);
        cb(null, Date.now() + "_" + file.fieldname + "_" + file.originalname);
    }
});
//生成的專門處理上傳的一個工具，可以傳入storage、limits等配置
var upload = multer({ storage: storage });
//接收上傳圖片請求的接口
var cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'csvFIle', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }, { name: 'image6', maxCount: 1 }, { name: 'image7', maxCount: 1 }, { name: 'image8', maxCount: 1 }, { name: 'image9', maxCount: 1 }, { name: 'image10', maxCount: 1 }])
app.post('/upload', cpUpload, function (req, res, next) {
    console.log(req.files);
    res.json({
        filePath: req.files
    })
});


//有容
app.use('/user', userRouter);
app.use('/Order', orderRouter);
app.use('/paymentGW', paymentGWRouter);
app.use('/Contracts', ContractsRouter);
app.use('/incomeManagementAPI',incomeManagementRouter)


// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


if(isTimeserverON){
  require('./timeserver/timeserverSource');
}
console.log(`\n------------------==timeserver: ${isTimeserverON}, useFullTimeServer: ${useFullTimeServer}`);

console.log(`[end of @ app.js] http://localhost:${process.env.PORT}/Product/ProductList`);
//http://localhost:3000/Product/ProductList


module.exports = app;
