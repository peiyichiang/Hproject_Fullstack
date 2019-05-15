var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');

require('dotenv').config()

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const mysqlPoolQuery = async (sql, options, callback) => {
  debugSQL(sql, options, callback);
  if (typeof options === "function") {
      callback = options;
      options = undefined;
  }
  pool.getConnection(async function (err, conn) {
      if (err) {
          callback(err, null, null);
      } else {
          conn.query(sql, options, async function (err, results, fields) {
              // callback
              callback(err, results, fields);
              console.log(`[connection sussessful @ mysql.js] `);
              // http://localhost:${process.env.PORT}/Product/ProductList
          });
          // release connection。
          // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
          conn.release();
      }
  });
};




const addTxnInfoRow = (txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery('INSERT INTO htoken.transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook], function (err, result) {
      if (err) {
        reject('[Error @ writing data into transaction_info row]', err);
      } else {
        console.log("\ntransaction_info table has been added with one new row. result:", result);
        resolve(result);
      }
    });
  });
}

const addTxnInfoRowFromObj = (row) => {
  //txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook
  return new Promise((resolve, reject) => {
    mysqlPoolQuery('INSERT INTO htoken.transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [row.txid, row.tokenSymbol, row.fromAssetbook, row.toAssetbook, row.tokenId, row.txCount, row.holdingDays, row.txTime, row.balanceOffromassetbook], function (err, result) {
      if (err) {
        reject('[Error @ writing data into transaction_info row]', err);
      } else {
        console.log("\ntransaction_info table has been added with one new row. result:", result);
        resolve(result);
      }
    });
  });
}


const addProductRow = (nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD2, _CFED2, _quantityGoal, TimeTokenUnlock) => {
  mysqlPoolQuery('INSERT INTO htoken.product (p_SYMBOL, p_name, p_location, p_pricing,  p_duration, p_currency, p_irr, p_releasedate, p_validdate, p_size, p_totalrelease, p_fundmanager, p_CFSD, p_CFED, p_state, p_fundingGoal, p_lockuptime, p_tokenState ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD2, _CFED2, "initial", _quantityGoal, TimeTokenUnlock, "lockupperiod"], function (err, result) {
    if (err) {
      console.log('\n[Error @ writing data into product rows]', err);
    } else {
      console.log("\nProduct table has been added with one new row. result:", result);
    }
  });
}

const addSmartContractRow = (nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController) => {
  mysqlPoolQuery('INSERT INTO htoken.smart_contracts (sc_symbol, sc_crowdsaleaddress, sc_erc721address, sc_totalsupply, sc_remaining, sc_incomeManagementaddress, sc_erc721Controller) VALUES (?, ?, ?, ?, ?, ?, ?)', [nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, maxTotalSupply, addrIncomeManager, addrTokenController], function (err, result) {
    if (err) {
      console.log('\n[Error @ writing data into smart_contracts rows]', err);
    } else {
      console.log("\nSmart contract table has been added with one new row. result:", result);
    }
  });
}

function getFundingStateDB(symbol){
  console.log('inside getFundingStateDB()... get p_state');
  mysqlPoolQuery(
    'SELECT p_state, p_CFSD, p_CFED FROM htoken.product WHERE p_SYMBOL = ?', [symbol], function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('symbol', symbol, 'pstate', result[0], 'CFSD', result[1], 'CFED', result[2]);
    }
  });
}
function setFundingStateDB(symbol, pstate, CFSD, CFED){
  console.log('\ninside setFundingStateDB()... change p_state');
  if(CFSD !== undefined && CFED !== undefined && Number.isInteger(CFSD) && Number.isInteger(CFED)){
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_state = ?, p_CFSD = ?, p_CFED = ? WHERE p_SYMBOL = ?', [pstate, CFSD, CFED, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'pstate', pstate, 'CFSD', CFSD, 'CFED', CFED,'result', result);
      }
    });
  } else {
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_state = ? WHERE p_SYMBOL = ?', [pstate, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'pstate', pstate, 'result', result);
      }
    });
  }
}

//------------------------==
function setTokenStateDB(symbol, tokenState, lockuptime, validdate){
  console.log('\ninside setTokenStateDB()... change p_tokenState');
  if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?', [tokenState, lockuptime, validdate, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate,'result', result);
      }
    });
  } else {
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_tokenState = ? WHERE p_SYMBOL = ?', [tokenState, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'result', result);
      }
    });
  }
}

function getTokenStateDB(symbol){
  console.log('inside getTokenStateDB()... get p_tokenState');
  mysqlPoolQuery(
    'SELECT p_tokenState, p_lockuptime, p_validdate FROM htoken.product WHERE p_SYMBOL = ?', [symbol], function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('symbol', symbol, 'tokenState', result[0], 'lockuptime', result[1], 'validdate', result[2]);
    }
  });
}

//------------------------==
function setIMScheduleDB(symbol, tokenState, lockuptime, validdate){
  console.log('\ninside setTokenStateDB()... change p_tokenState');
  if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?', [tokenState, lockuptime, validdate, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate,'result', result);
      }
    });
  } else {
    mysqlPoolQuery(
      'UPDATE htoken.product SET p_tokenState = ? WHERE p_SYMBOL = ?', [tokenState, symbol], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'result', result);
      }
    });
  }
}

function isIMScheduleGoodDB(symbol){
  console.log('inside isIMScheduleGoodDB()');
  mysqlPoolQuery(
    'SELECT p_tokenState, p_lockuptime, p_validdate FROM htoken.product WHERE p_SYMBOL = ?', [symbol], function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('symbol', symbol, 'tokenState', result[0], 'lockuptime', result[1], 'validdate', result[2]);
    }
  });
}

/*
//------------------------==
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


function getIncomeManagerCtrtAddr(cb) {
    mysqlPoolQuery('SELECT sc_incomeManagementaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getOrderDate(cb) {
    mysqlPoolQuery('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getHCAT721ControllerCtrtAddr(cb) {
    mysqlPoolQuery('SELECT sc_erc721Controller FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function setOrderExpired(o_id, cb) {
    mysqlPoolQuery('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [[[o_id]]], function (err, result) {
        if (err) {
            print(err);
        }
        cb(result)
    })
}
*/

function print(s) {
    console.log('[timeserver@mysql] ' + s)
}

module.exports = {
    mysqlPoolQuery,
    //getCrowdFundingCtrtAddr,
    //getIncomeManagerCtrtAddr,
    //getHCAT721ControllerCtrtAddr,
    //getOrderDate,
    //setOrderExpired,
    addTxnInfoRow, addTxnInfoRowFromObj,
    setFundingStateDB, getFundingStateDB,
    setTokenStateDB, getTokenStateDB,
    addProductRow, addSmartContractRow, 
    isIMScheduleGoodDB, setIMScheduleDB
}