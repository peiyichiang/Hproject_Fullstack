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

var pool = mysql.createPool({
  host: "140.119.101.130",//outside: 140.119.101.130, else 192.168.0.2 or localhost
  user: "root",
  password: "bchub",
  database: "htoken"
});

var mysqlPoolQuery = function(sql, options, callback) {
  console.log(sql, options, callback);
  if (typeof options === "function") {
      callback = options;
      options = undefined;
  }
  pool.getConnection(function(err, conn){
      if (err) {
          callback(err, null, null);
      } else {
          conn.query(sql, options, function(err, results, fields){
              // callback
              callback(err, results, fields);
          });
          // release connection。
          // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
          conn.release();
      }
  });
};




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
  req.pool = mysqlPoolQuery;
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
