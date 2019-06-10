var mysql = require("mysql");
//var util = require('util');
var debugSQL = require('debug')('dev:mysql');
const bcrypt = require('bcrypt');
require('dotenv').config()

const { isEmpty, asyncForEach } = require('./utilities');

const serverTimeMin = 201905270900;
const DatabaseCredential = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
var pool = mysql.createPool(DatabaseCredential);

//callback could not wait, but good for taking object input to make new rows
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


const mysqlPoolQueryB = async (sql, options) => {
  return new Promise( async ( resolve, reject ) => {
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
        } else {
          conn.query(sql, options, function (err, results) {
            if(err) {
              return reject(err);
            } else {
              conn.release();
              console.log(`[mysqlPoolQueryB @ mysql.js] `);
              resolve(results);
            }  
          });
        }
    });
  })
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


const addProductRow = async (nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD2, _CFED2, _quantityGoal, TimeTokenUnlock) => {
  console.log('\nto add product row into DB');
  return new Promise((resolve, reject) => {
    const sql = {
      p_SYMBOL: nftSymbol,
      p_name: nftName,
      p_location: location,
      p_pricing: initialAssetPricing,
      p_duration: duration,
      p_currency: pricingCurrency,
      p_irr: IRR20yrx100,
      p_releasedate: TimeReleaseDate,
      p_validdate: TimeTokenValid,
      p_size: siteSizeInKW,
      p_totalrelease: maxTotalSupply,
      p_fundmanager: fundmanager,
      p_CFSD: _CFSD2,
      p_CFED: _CFED2,
      p_state: "initial",
      p_fundingGoal: _quantityGoal,
      p_lockuptime: TimeTokenUnlock,
      p_tokenState: "lockupperiod",
    };
    console.log(sql);

    mysqlPoolQuery('INSERT INTO htoken.product SET ?', sql, function (err, result) {
      if (err) {
        console.log('[Error @ writing data into product rows]', err);
        reject('[Error @ writing data into product rows]', err);
      } else {
        console.log("\nProduct table has been added with one new row. result:", result);
        resolve(result);
      }
    });
  });
}

const addSmartContractRow = async (nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController) => {
  console.log('inside addSmartContractRow()...');
  return new Promise((resolve, reject) => {
    const sql = {
      sc_symbol: nftSymbol,
      sc_crowdsaleaddress: addrCrowdFunding,
      sc_erc721address: addrHCAT721,
      sc_totalsupply: maxTotalSupply,
      sc_remaining: maxTotalSupply,
      sc_incomeManagementaddress: addrIncomeManager,
      sc_erc721Controller: addrTokenController,
    };
    console.log(sql);

    mysqlPoolQuery('INSERT INTO htoken.smart_contracts SET ?', sql, function (err, result) {
      if (err) {
        console.log('[Error @ writing data into smart_contracts rows]', err);
        //reject('\n[Error @ writing data into smart_contracts rows]', err);
        reject(err);
      } else {
        console.log("\nSmart contract table has been added with one new row. result:", result);
        //console.log("result", result);
        resolve(true);
      }
    });

  });
}


const addUserRow = async (email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet) => {
  return new Promise((resolve, reject) => {
    console.log('------------------------==@user/addUserRow');
    let salt;
    //const account = web3.eth.accounts.create();
    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    bcrypt
      .genSalt(saltRounds)
      .then(saltNew => {
        salt = saltNew;
        console.log(`Salt: ${salt}`);
        return bcrypt.hash(password, salt);
      })
      .then(hash => {
        console.log(`Password Hash: ${hash}`);
        let userNew = {
          u_email: email,
          u_salt: salt,
          u_password_hash: hash,
          u_identityNumber: identityNumber,
          u_imagef: '',
          u_imageb: '',
          u_bankBooklet: '',
          u_eth_add: eth_add,
          u_verify_status: 0,
          u_cellphone: cellphone,
          u_name: name,
          u_assetbookContractAddress: addrAssetBook,
          u_investorLevel: investorLevel,
          u_imagef: imagef,
          u_imageb: imageb,
          u_bankBooklet: bank_booklet,
        };

        console.log(userNew);
        mysqlPoolQuery('INSERT INTO htoken.user SET ?', userNew, function (err, result) {
          if (err) {
            console.log("[Failed]", err);
            reject(err);
          } else {
            console.log("[Success]", result);
            resolve(true);
          }
        });
      });
  });
}

Date.prototype.myFormat = function () {
  return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

const addOrderRow = async (nationalId, symbol, tokenCount, fundCount, paymentStatus, email) => {
  return new Promise((resolve, reject) => {
    console.log('\n-------------==addOrderRow');
    console.log('inside addOrderRow. paymentStatus', paymentStatus, ', symbol', symbol);
    const timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    const currentDate = new Date().myFormat();//yyyymmddhhmm
    console.log('currentDate:', currentDate, ', timeStamp', timeStamp);
    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);

    const addrAssetBook1 = "0xdEc799A5912Ce621497BFD1Fe2C19f8e23307dbc";
    const sql = {
        o_id: orderId,
        o_symbol: symbol,
        o_email: email,
        o_fromAddress: addrAssetBook1,
        o_txHash: Math.random().toString(36).substring(2, 15),
        o_tokenCount: tokenCount,
        o_fundCount: fundCount,
        o_purchaseDate: currentDate,
        o_paymentStatus: paymentStatus
    };//random() to prevent duplicate NULL entry!

    console.log(sql);

    mysqlPoolQuery('INSERT INTO htoken.order SET ?', sql, function (err, result) {
      if (err) {
        console.log("error", err);
        reject(err);
      } else {
        console.log("result", result);
        resolve(true);
      }
    });

  });
}


const addAssetRecordsIntoDB = async (inputArray, amountArray, symbol, serverTime) => {
  console.log('\n-------------------==addAssetRecordsIntoDB');
  if(typeof symbol !== "string" || isEmpty(symbol)){
    console.log('[Error] symbol must be a string', symbol);
    return [null, null];
  
  } else if(!Array.isArray(inputArray) || inputArray.length === 0){
    console.log('[Error] inputArray must be a non empty array', inputArray);
    return [null, null];

  } else if(!Array.isArray(amountArray) || amountArray.length === 0){
    console.log('[Error] amountArray must be an non empty array', amountArray);
    return [null, null];
  
  } else if(!Number.isInteger(serverTime) || parseInt(serverTime) < serverTimeMin){ 
    console.log('[Error] serverTime must be an integer >= '+serverTimeMin);
    return [null, null];
  } else if(inputArray.length !== amountArray.length) {
    console.log('[Error] inputArray and amountArray must have the same length');
    return [null, null];
  }

  const emailArray = [];
  if(inputArray[0].includes('@')){
    inputArray.forEach( (element,idx) => emailArray.push(element) );

  } else {
    console.log('all input values are okay');
    const querySQL4 = 'SELECT u_email FROM htoken.user WHERE u_assetbookContractAddress = ?';
    await asyncForEach(inputArray, async (addrAssetbook, index) => {
      const results4 = await mysqlPoolQueryB(querySQL4, [addrAssetbook]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL4)]', err));
      console.log('\nresults4', results4);
      if(results4 === null || results4 === undefined){
        console.log('\n----==[Error] email address is null or undefined for addrAssetbook:', addrAssetbook, ', results4', results4); emailArray.push('email:_null_or_undefined');

      } else if(results4.length > 1){
        console.error('\n----==[Error] Got multiple email addresses from one addrAssetbook', addrAssetbook, ', results4', results4); emailArray.push('email:_multiple_emails_were_found');

      } else if(results4.length === 0){
        console.error('\n----==[Error] Got empty email address from one addrAssetbook', addrAssetbook, ', results4', results4);
        emailArray.push('email_not_found');

      } else {
        console.error('\n----==[Good] Got one email address from addrAssetbook', addrAssetbook);
        const email = results4[0].u_email;
        console.log('addrAssetbook', addrAssetbook, email, amountArray[index]);
        emailArray.push(email);
      }
    });
  }
  
  const emailArrayError = [];
  const amountArrayError = [];
  console.log('\n----------------==emailArray:', emailArray);
  await asyncForEach(emailArray, async (email, idx) => {
    const amount = amountArray[idx];
    if(!email.includes('@')){
      emailArrayError.push(email);
      amountArrayError.push(amount);

    } else {
      console.log(`email: ${email}, symbol: ${symbol}, serverTime: ${serverTime}, amount: ${amount}`);
      const sql = {
        ar_investorEmail: email,
        ar_tokenSYMBOL: symbol,
        ar_Time: serverTime,
        ar_Holding_Amount_in_the_end_of_Period: amount,
        ar_Accumulated_Income_Paid: 100,
        ar_User_Asset_Valuation: 13000,
        ar_User_Holding_Amount_Changed: 0,
        ar_User_Holding_CostChanged: 0,
        ar_User_Acquired_Cost: 13000,
        ar_Moving_Average_of_Holding_Cost: 13000
      };//random() to prevent duplicate NULL entry!
      console.log(sql);

      const querySQL5 = 'INSERT INTO htoken.investor_assetRecord SET ?';
      await mysqlPoolQuery(querySQL5, sql, function (err, result) {
        if (err) {
          console.log('[Error @ writing a new row]', err);
        } else {
          console.log("\nA new row has been added. result:", result);
        }
      });
    }
  });
  console.log(`\n------------------==End of addAssetRecordsIntoDB \nemailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`);
  return [emailArrayError, amountArrayError];
  //process.exit(0);
}

//---------------------------==
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
  const qur = mysqlPoolQuery(
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
    mysqlPoolQuery, addOrderRow, addUserRow,
    addTxnInfoRow, addTxnInfoRowFromObj,
    setFundingStateDB, getFundingStateDB,
    setTokenStateDB, getTokenStateDB,
    addProductRow, addSmartContractRow, 
    isIMScheduleGoodDB, setIMScheduleDB,
    addAssetRecordsIntoDB,
    mysqlPoolQueryB
}
/**
    //getCrowdFundingCtrtAddr,
    //getIncomeManagerCtrtAddr,
    //getHCAT721ControllerCtrtAddr,
    //getOrderDate,
    //setOrderExpired,
 */