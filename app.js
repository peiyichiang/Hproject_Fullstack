var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
var multer = require('multer');
var debugSQL = require('debug')('dev:mysql');

require("dotenv").config();

//智豪
var indexRouter = require('./routes/TxRecord');
var productRouter = require('./routes/Product');
var backendUserRouter = require('./routes/backend_user');
//有容
var userRouter = require('./routes/user');
var incomeManagementRouter = require('./routes/incomeManagementAPI');

//Chih-Hao
var orderRouter = require('./routes/Order');
//冠毅
var paymentGWRouter = require('./routes/PaymentGW');
var ContractsRouter = require('./routes/Contracts');

//Chiu
require('./timeserver/manager')

// var usersRouter = require('./routes/users');
// DataBase
const { mysqlPoolQuery } = require('./timeserver/lib/mysql.js');

// var mysql = require("mysql");

// var pool = mysql.createPool({
//     host: process.env.DB_HOST,//outside: 140.119.101.130, else 192.168.0.2 or localhost
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT
// });

// var mysqlPoolQuery = function (sql, options, callback) {
//     debugSQL(sql, options, callback);
//     if (typeof options === "function") {
//         callback = options;
//         options = undefined;
//     }
//     pool.getConnection(function (err, conn) {
//         if (err) {
//             callback(err, null, null);
//         } else {
//             conn.query(sql, options, function (err, results, fields) {
//                 // callback
//                 callback(err, results, fields);
//                 console.log(`connection sussessful.http://localhost:${process.env.PORT}/Product/ProductList`);
//             });
//             // release connection。
//             // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
//             conn.release();
//         }
//     });
// };




var app = express();
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
var cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }, { name: 'image6', maxCount: 1 }, { name: 'image7', maxCount: 1 }, { name: 'image8', maxCount: 1 }, { name: 'image9', maxCount: 1 }, { name: 'image10', maxCount: 1 }])
app.post('/upload', cpUpload, function (req, res, next) {
    console.log(req.files);
    res.json({
        filePath: req.files
    })
    // 兩種文件有沒有上傳的三種情況
    // if (typeof (req.files['file']) != 'undefined' && typeof (req.files['icon']) != 'undefined') {
    //     res.json({
    //         filePath: req.files['file'][0].path,
    //         iconPath: req.files['icon'][0].path
    //     })
    // } else if (typeof (req.files['file']) == 'undefined' && typeof (req.files['icon']) != 'undefined') {
    //     res.json({
    //         filePath: "",
    //         iconPath: req.files['icon'][0].path
    //     })
    // } else if (typeof (req.files['file']) != 'undefined' && typeof (req.files['icon']) == 'undefined') {
    //     res.json({
    //         filePath: req.files['file'][0].path,
    //         iconPath: ""
    //     })
    // } else if (typeof (req.files['file']) == 'undefined' && typeof (req.files['icon']) == 'undefined') {
    //     res.json({
    //         filePath: "",
    //         iconPath: ""
    //     })
    // }

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
console.log(`[end of @ app.js] http://localhost:${process.env.PORT}/Product/ProductList`);
//http://localhost:3000/Product/ProductList
module.exports = app;
