var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/TxRecord');
var productRouter = require('./routes/Product');
//有容
var userRouter = require('./routes/user');
//Ray
var NFTokenSPLCRouter = require('./routes/NFTokenSPLC');
//Chih-Hao
var orderRouter = require('./routes/Order');
//冠毅
var paymentGWRouter = require('./routes/paymentGW');

// var usersRouter = require('./routes/users');
// DataBase
var mysql = require("mysql");

var con = mysql.createConnection({
    host: "140.119.101.130",//outside: 140.119.101.130, else 192.168.0.2 or localhost
    user: "root",
    password: "bchub",
    database: "htoken",
});

con.connect(function(err) {
    if (err) {
        console.log('connecting error');
        console.log(err);
        return;
    }
    console.log('connecting success');
    console.log('http://localhost:3000/Product/productList');
});




var app = express();

//有容
app.use(cors({credentials: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(function(req, res, next) {
  req.con = con;
  next();
});

app.use('/', indexRouter);
app.use('/Product', productRouter);
app.use('/user', userRouter);
app.use('/NFTokenSPLC', NFTokenSPLCRouter);
app.use('/Order', orderRouter);
app.use('/paymentGW', paymentGWRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
