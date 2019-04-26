var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');

require('dotenv').config()

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

var mysqlPoolQuery = function (sql, options, callback) {
  debugSQL(sql, options, callback);
  if (typeof options === "function") {
      callback = options;
      options = undefined;
  }
  pool.getConnection(function (err, conn) {
      if (err) {
          callback(err, null, null);
      } else {
          conn.query(sql, options, function (err, results, fields) {
              // callback
              callback(err, results, fields);
              console.log(`[connection sussessful @ 111mysql.js] http://localhost:${process.env.PORT}/Product/ProductList`);
          });
          // release connection。
          // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
          conn.release();
      }
  });
};

function setCrowdFundingState(symbol, cfstate, cb) {
  console.log('setCrowdFundingState');
  let newState = '';
  if(cfstate == "initial"){ newState = "funding";
  } else if(cfstate == '') 

  var qur = mysqlPoolQuery(
    'UPDATE htoken.product SET p_state = ? WHERE p_SYMBOL = ?', [newState, symbol], function (err, result) {
      //console.log('result', result);
      if (err) {
        console.log(err);
      }
      cb(result);
    }
  );
}

// function setCrowdFundingState(o_id, cb) {
//   pool.query('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [[[o_id]]], function (err, result) {
//       if (err) {
//           print(err);
//       }
//       cb(result)
//   })
// }

function getCrowdFundingCtrtAddr(symbol, cb) {
  console.log('getCrowdFundingCtrtAddr');
  var qur = mysqlPoolQuery(
    'SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol =?', [symbol], function (err, result) {
      //console.log('result', result);
      if (err) {
        console.log(err);
      }
      cb(result);
    }
  );
}
// function getCrowdFundingCtrtAddr(cb) {
//     pool.query('SELECT sc_crowdsaleaddress FROM smart_contracts', function (err, rows) {
//         if (err) {
//             print(err);
//         }
//         cb(rows);
//     })
// }

function getIncomeManagerCtrtAddr(cb) {
    pool.query('SELECT sc_incomeManagementaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getOrderDate(cb) {
    pool.query('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getHCAT721ControllerCtrtAddr(cb) {
    pool.query('SELECT sc_erc721Controller FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function setOrderExpired(o_id, cb) {
    pool.query('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [[[o_id]]], function (err, result) {
        if (err) {
            print(err);
        }
        cb(result)
    })
}

function print(s) {
    console.log('[timeserver@mysql] ' + s)
}

module.exports = {
    mysqlPoolQuery,
    getCrowdFundingCtrtAddr,
    getIncomeManagerCtrtAddr,
    getOrderDate,
    getHCAT721ControllerCtrtAddr,
    setOrderExpired,
    setCrowdFundingState
}