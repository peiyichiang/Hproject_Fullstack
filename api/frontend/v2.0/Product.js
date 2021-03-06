var express = require("express");
var router = express.Router();
const TokenGenerator = require("./TokenGenerator");
var jwt = require("jsonwebtoken");
var async = require("async");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { getTimeServerTime } = require("../../../timeserver/utilities");

// router.post('/a', function (req, res) {
//     name = req.body.name;
//     async.waterfall([
//         function(callback) {
//             const tokenGenerator = new TokenGenerator(process.env.JWT_PRIVATEKEY, process.env.JWT_PRIVATEKEY, { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '1m', notBefore: '2s' })
//             token = tokenGenerator.sign({ name: name }, { audience: 'myaud', issuer: 'myissuer', jwtid: '1', subject: 'user' })
//             //callback(null, jwt.sign({usr_name: name},process.env.JWT_PRIVATEKEY, { expiresIn: 60 }))
//             callback(null,token);
//         },
//         function(data, callback) {
//             res.setHeader('Cache-Control', 'no-store');
//             res.setHeader('Pragma', 'no-cache');
//             res.status(302).json(data);
//         }
//     ])
// })

// router.post('/c',function(req,res){
//     const tokenGenerator = new TokenGenerator('a', 'a', { algorithm: 'HS256', keyid: '1', noTimestamp: false, expiresIn: '2m', notBefore: '2s' })
//     token = tokenGenerator.sign({ myclaim: 'something' }, { audience: 'myaud', issuer: 'myissuer', jwtid: '1', subject: 'user' })
//     console.log(token)
//     setTimeout(function () {
//     token2 = tokenGenerator.refresh(token, { verify: { audience: 'myaud', issuer: 'myissuer' }, jwtid: '2' })
//     console.log(jwt.decode(token, { complete: true }))
//     console.log(jwt.decode(token2, { complete: true }))
//     }, 3000)
// })
router.use(function (req, res, next) {
  const tokenGenerator = new TokenGenerator(
    process.env.JWT_PRIVATEKEY,
    process.env.JWT_PRIVATEKEY,
    {
      algorithm: "HS256",
      keyid: "1",
      noTimestamp: false,
      expiresIn: "10m",
      notBefore: "2s",
    }
  );
  var token = req.headers["x-access-token"];

  if (token) {
    jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: "Failed to authenticate token.",
        });
      } else {
        req.decoded = decoded;
        // res.setHeader('Cache-Control', 'store');
        new_token = tokenGenerator.refresh(token, {
          verify: { audience: "myaud", issuer: "myissuer" },
          jwtid: "2",
        });
        req.headers["x-access-token"] = new_token;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: "No token provided.",
    });
  }
});

router.get("/TimeServerTime", function (req, res) {
  console.log("This is TimeServerTime API");
  time = getTimeServerTime()
    .then((result) => {
      console.log("time", result);
      return res.status(200).json({
        success: "True",
        data: result,
        new_token: req.headers["x-access-token"],
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        success: "False",
        message: "timeserver error",
        new_token: req.headers["x-access-token"],
      });
    });
});

router.get("/ProductInfo", function (req, res) {
  console.log("This is ProductInfo API");
  //get parameter from req.query
  const status = req.query.status;
  //database query
  const query = req.frontendPoolQuery;
  if (status) {
    query("product", [status])
      .then((result) => {
        var string = JSON.stringify(result);
        var data = JSON.parse(string);
        data = formating(data);
        if (data.length != 0) {
          return res.status(200).json({
            success: "True",
            data: data,
            new_token: req.headers["x-access-token"],
          });
        } else {
          return res.status(404).json({
            success: "False",
            message: "data not found",
            new_token: req.headers["x-access-token"],
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          success: "False",
          message: "sql error",
          new_token: req.headers["x-access-token"],
        });
      });
  } else {
    return res.status(400).json({
      success: "False",
      message: "wrong or lack parameters",
      new_token: req.headers["x-access-token"],
    });
  }
  function formating(data) {
    newData = [];
    data.forEach(function (item, index, array) {
      key = Object.keys(item);
      if (key == "main") {
        item[key].forEach(function (obj) {
          newData.push(obj);
        });
      } else if (key == "income") {
        if (Object.keys(item[key]).length > 0) {
          newData.forEach(function (obj) {
            symbol = obj.symbol;
            acc_income = [];
            if (item[key][symbol] !== undefined) {
              item[key][symbol].forEach(function (value) {
                if (acc_income.length == 0) acc_income.push(value);
                else acc_income.push(value + acc_income[acc_income.length - 1]);
                obj["forecastedAnnualIncome"] = item[key][symbol];
                obj["accumulateForecastedAnnualIncome"] = acc_income;
              });
            } else {
              obj["forecastedAnnualIncome"] = 0;
              obj["accumulateForecastedAnnualIncome"] = 0;
            }
          });
        } else {
          newData.forEach(function (obj) {
            obj["forecastedAnnualIncome"] = [];
            obj["accumulateForecastedAnnualIncome"] = [];
          });
        }
      } else {
        item[key].forEach(function (item) {
          var symbol = item.symbol;
          id = newData.findIndex((obj) => obj.symbol === symbol);
          delete item.symbol;
          newData[id][key] = item;
        });
      } // forEach ????????? for????????????????????????
    });
    return newData;
  }
});

router.post("/GetRadiationData", async function (req, res) {
  var mysqlPoolQuery = req.pool;
  var symbol = req.body.symbol;
  time = await getTimeServerTime();
  time = time.toString().substr(0, 8);
  mysqlPoolQuery(
    "SELECT rd_five,rd_six,rd_seven,rd_eight,rd_nine,rd_ten,rd_eleven,rd_twelve,rd_thirteen,rd_fourteen,rd_fifteen,rd_sixteen,rd_seventeen,rd_sum FROM radiation_data WHERE rd_apistringofmonitor=? AND rd_date=?",
    [symbol, time],
    function (err, rows) {
      if (err) {
        res.send({
          success: "false",
          message: "SQL query error(radiation data):" + err,
        });
      } else if (rows[0]) {
        res.send({
          success: "true",
          data: rows[0],
        });
      } else {
        res.send({
          success: "false",
          message: "Query success but Symbol not found",
        });
      }
    }
  );
});

router.get("/b", function (req, res) {
  res.json({
    message: "Welcome to the APIs",
    token_playload: req.decoded,
    new_token: req.headers["x-access-token"],
  });
});
module.exports = router;
