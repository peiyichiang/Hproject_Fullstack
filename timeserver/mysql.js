var mysql = require("mysql");
//var util = require('util');
var debugSQL = require('debug')('dev:mysql');
const bcrypt = require('bcrypt');
require('dotenv').config()

const { isEmpty, asyncForEach } = require('./utilities');
const { TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, } = require('../ethereum/contracts/zsetupData');
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
              //console.log(`[connection sussessful @ mysql.js] `);
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
          return reject(err);
        } else {
          conn.query(sql, options, function (err, results) {
            if(err) {
              return reject(err);
            } else {
              conn.release();
              //console.log(`[Success: mysqlPoolQueryB @ mysql.js] `);
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

//used in zdeploy.js
const addOrderRow = async (nationalId, email, tokenCount, symbol, fundCount, paymentStatus) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n-----------==addOrderRow');
    console.log('inside addOrderRow. paymentStatus', paymentStatus, ', symbol', symbol);
    const timeStamp = Date.now() / 1000 | 0;//... new Date().getTime();
    const currentDate = new Date().myFormat();//yyyymmddhhmm
    console.log('currentDate:', currentDate, ', timeStamp', timeStamp);
    const nationalIdLast5 = nationalId.toString().slice(-5);
    const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
    console.log('orderId', orderId, 'nationalId', nationalId, 'nationalIdLast5', nationalIdLast5);

    const sqlObject = {
        o_id: orderId,
        o_symbol: symbol,
        o_email: email,
        o_txHash: Math.random().toString(36).substring(2, 15),
        o_tokenCount: tokenCount,
        o_fundCount: fundCount,
        o_purchaseDate: currentDate,
        o_paymentStatus: paymentStatus
    };//random() to prevent duplicate NULL entry!

    console.log(sqlObject);

    const queryStr1 = 'INSERT INTO htoken.order SET ?';
    const results1 = await mysqlPoolQueryB(queryStr1, sqlObject).catch((err) => reject('[Error @ mysqlPoolQueryB()]'+ err));
    resolve(results1);

    // mysqlPoolQuery(queryStr1, sql, function (err, result) {
    //   if (err) {
    //     console.log("error", err);
    //     reject(err);
    //   } else {
    //     console.log("result", result);
    //     resolve(true);
    //   }
    // });

  });
}


const addIncomeArrangementRow = (symbol, time, actualPaymentTime, actualPayment) => {
  return new Promise((resolve, reject) => {
    mysqlPoolQuery('INSERT INTO htoken.income_arrangement (ia_SYMBOL, ia_time, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period) VALUES (?, ?, ?, ?)', [symbol, time, actualPaymentTime, actualPayment], function (err, result) {
      if (err) {
        reject('[Error @ writing data into transaction_info row]', err);
      } else {
        console.log("\ntransaction_info table has been added with one new row. result:", result);
        resolve(result);
      }
    });
  });
}

//----------------------------==
const addAssetRecordsIntoDB = async (inputArray, amountArray, symbol, serverTime, personal_income, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost) => {
  return new Promise(async(resolve, reject) => {

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
      const queryStr4 = 'SELECT u_email FROM htoken.user WHERE u_assetbookContractAddress = ?';
      await asyncForEach(inputArray, async (addrAssetbook, index) => {
        const results4 = await mysqlPoolQueryB(queryStr4, [addrAssetbook]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr4)]', err);
        });
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

    const queryStr5 = 'SELECT ia_actualPaymentTime FROM htoken.income_arrangement WHERE ia_SYMBOL= ?';
    const results5 = await mysqlPoolQueryB(queryStr5, [symbol]).catch((err) => {
      console.log('[Error @ mysqlPoolQueryB(queryStr5)]'+ err);
    });
    const actualPaymentTime = results5.ia_actualPaymentTime;
    console.log('actualPaymentTime', actualPaymentTime);

    
    const emailArrayError = [];
    const amountArrayError = [];
    console.log('\n----------------==emailArray:', emailArray);
    await asyncForEach(emailArray, async (email, idx) => {
      const amount = amountArray[idx];
      if(!email.includes('@')){
        emailArrayError.push(email);
        amountArrayError.push(amount);

      } else {
        console.log(`email: ${email}, symbol: ${symbol}, actualPaymentTime: ${actualPaymentTime}, amount: ${amount}`);
        const sqlObject = {
          ar_investorEmail: email,
          ar_tokenSYMBOL: symbol,
          ar_Time: actualPaymentTime,
          ar_Holding_Amount_in_the_end_of_Period: amount,
          ar_personal_income: personal_income,
          ar_User_Asset_Valuation: asset_valuation,
          ar_User_Holding_Amount_Changed: holding_amount_changed,
          ar_User_Holding_CostChanged: holding_costChanged,
          ar_User_Acquired_Cost: acquired_cost,
          ar_Moving_Average_of_Holding_Cost: moving_ave_holding_cost
        };//random() to prevent duplicate NULL entry!
        console.log(sqlObject);

        const queryStr6 = 'INSERT INTO htoken.investor_assetRecord SET ?';
        const results5 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
          console.log('[Error @ mysqlPoolQueryB(queryStr6)]'+ err);
        });
        console.log('results5', results5);
      }
    });
    console.log(`\n------------------==End of addAssetRecordsIntoDB`);
    resolve([emailArrayError, amountArrayError]);
  });
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



// findCtrtAddr(symbol, 'incomemanager')
const findCtrtAddr = async(symbol, ctrtType) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n---------==inside findCtrtAddr');
    let scColumnName, mesg;
    if(ctrtType === 'incomemanager'){
      scColumnName = 'sc_incomeManagementaddress';
    } else if(ctrtType === 'crowdfunding'){
      scColumnName = 'sc_crowdsaleaddress';
    } else if(ctrtType === 'hcat721'){
      scColumnName = 'sc_erc721address';
    } else if(ctrtType === 'tokencontroller'){
      scColumnName = 'sc_erc721Controller';
    }
    const queryStr1 = 'SELECT '+scColumnName+' FROM htoken.smart_contracts WHERE sc_symbol = ?';
    const ctrtAddrResults = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
      (err) => {
        mesg = '[Error @ mysqlPoolQueryB(queryStr1)]:'+ err;
        //console.log('\n'+mesg);
        reject(mesg);
      });
    const ctrtAddrResultsLen = ctrtAddrResults.length;
    console.log('\nArray length @ findCtrtAddr:', ctrtAddrResultsLen, ', ctrtAddrResults:', ctrtAddrResults);
    if(ctrtAddrResultsLen == 0){
      mesg = 'no '+ctrtType+' is found';
      reject(mesg); //console.log();
    } else if(ctrtAddrResultsLen > 1){
      mesg = 'multiple '+ctrtType+' addresses were found';
      reject(mesg); //console.log();
    } else {
      const ctrtAddr = ctrtAddrResults[0][scColumnName];//.sc_incomeManagementaddress;
      resolve(ctrtAddr);
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


//yarn run testts -a 2 -c 4
const addIncomePaymentPerPeriodIntoDB = async (serverTime) => {
  console.log('inside addIncomePaymentPerPeriodIntoDB()... serverTime:', serverTime, typeof serverTime);
  const symbolArray = [];
  const acPaymentTimeArray = [];
  const acIncomePaymentArray = [];
  const addrHCAT_Array = [];
  const abAddrArrayGroup = [];
  const abBalArrayGroup = [];
  const incomePaymentArrayGroup = [];

  const queryStr0 = 'SELECT distinct ia_SYMBOL FROM htoken.product';
  const symbolObjArray = await mysqlPoolQueryB(queryStr0, []).catch((err) =>   console.log('\n[Error @ mysqlPoolQueryB(queryStr0)]', err));
  //console.log('symbolObjArray', symbolObjArray);

  const queryStr7 = 'SELECT ia_SYMBOL, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period FROM htoken.income_arrangement WHERE ia_actualPaymentTime = (SELECT  MAX(ia_actualPaymentTime) FROM htoken.income_arrangement WHERE ia_SYMBOL = ?)'
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const results1 = await mysqlPoolQueryB(queryStr7, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr7)]', err);
    });
    const symbolM = results1[0].ia_SYMBOL;
    const acpaymentTime = parseInt(results1[0]['MAX(ia_actualPaymentTime)']);
    if(serverTime >= acpaymentTime){
      console.log('found period', symbolM, acpaymentTime);
      symbolArray.push(symbolM);
      acPaymentTimeArray.push(acpaymentTime);
      const incomePayment = parseInt(results1[0].ia_single_Actual_Income_Payment_in_the_Period);
      acIncomePaymentArray.push(incomePayment);
    }
  });
  /*
  const queryStr1 = 'SELECT ia_SYMBOL, MAX(ia_actualPaymentTime) FROM htoken.income_arrangement WHERE ia_SYMBOL = ?';
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const results1 = await mysqlPoolQueryB(queryStr1, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr1)]', err);
    });
    //console.log('results1', results1, results1[0].ia_SYMBOL, results1[0]['MAX(ia_actualPaymentTime)']);
    const symbolM = results1[0].ia_SYMBOL;
    const acpaymentTime = parseInt(results1[0]['MAX(ia_actualPaymentTime)']);
    if(serverTime >= acpaymentTime){
      console.log('found period', symbolM, acpaymentTime);
      symbolArray.push(symbolM);
      acPaymentTimeArray.push(acpaymentTime);
    }
  });
  console.log('\n----------------==\nsymbolArray', symbolArray, '\nacPaymentTimeArray', acPaymentTimeArray);

  if(symbolArray.length > 0){
    const queryStr2 = 'SELECT ia_SYMBOL, ia_single_Actual_Income_Payment_in_the_Period FROM htoken.income_arrangement WHERE ia_SYMBOL = ?';
    await asyncForEach(symbolArray, async (symbol, index) => {
      const results1 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]', err);
      });
      const incomePayment = parseInt(results1[0].ia_single_Actual_Income_Payment_in_the_Period);
      acIncomePaymentArray.push(incomePayment);
    });
  
  } else {
    console.log('no periodSymbol is found.');
  }
  */

  console.log(`\n----------------==\nsymbolArray: ${symbolArray} \nacPaymentTimeArray: ${acPaymentTimeArray}
  acIncomePaymentArray: ${acIncomePaymentArray}`);


  const queryStr2 = 'SELECT sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?';
  await asyncForEach(symbolArray, async (symbol, index) => {
    const results2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]', err);
    });
    console.log('results2', results2);

    if(results2.length === 0){
      console.log('[Error] erc721 contract address was not found');
      addrHCAT_Array.push('Not on record');
    } else if(results2.length > 1){
      console.log('[Error] multiple erc721 contract addresses were found');
      addrHCAT_Array.push('multiple contract addr');
    } else if(results2[0].sc_erc721address === null || results2[0].sc_erc721address === undefined){
      console.log('[Error] erc21 contract addresses is null or undefined');
      addrHCAT_Array.push(results2[0].sc_erc721address);
    } else {
      console.log('[Good] erc721 contract address:', results2[0].sc_erc721address);
      addrHCAT_Array.push(results2[0].sc_erc721address);
    }
  });
  console.log('addrHCAT_Array', addrHCAT_Array);


  await asyncForEach(addrHCAT_Array, async (tokenCtrtAddr, index) => {
    if(tokenCtrtAddr !== null || tokenCtrtAddr !== undefined || tokenCtrtAddr !== 'multiple contract addr' || tokenCtrtAddr !== 'Not on record'){

      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      const abAddrArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
      const abBalArray = await instHCAT721.methods.balanceOfArray(abAddrArray).call();
      console.log(`\nabAddrArray: ${abAddrArray} \nassetbookBalanceArray: ${abBalArray}`);
      abAddrArrayGroup.push(abAddrArray);
      abBalArrayGroup.push(abBalArray);

      const singleActualIncomePayment = acIncomePaymentArray[index];
      const incomePaymentArray = abBalArray.map(function(balance) {
        return balance * singleActualIncomePayment;
      });
      incomePaymentArrayGroup.push(incomePaymentArray);
    }
  });
  console.log(`\n  symbolArray: ${symbolArray}
  acIncomePaymentArray: ${acIncomePaymentArray}
  abAddrArrayGroup: ${abAddrArrayGroup} 
  incomePaymentArrayGroup: ${incomePaymentArrayGroup}`);

  const emailArrayGroup = [];
  await asyncForEach(abAddrArrayGroup, async (abAddrArray, index) => {
    const symbol = symbolArray[index];
    const acPaymentTime = acPaymentTimeArray[index];
    const emailArray = [];
    await asyncForEach(abAddrArray, async (assetbookAddr, idx) => {
      const queryStr3 = 'SELECT u_email FROM htoken.user WHERE u_assetbookContractAddress = ?';
      const results3 = await mysqlPoolQueryB(queryStr3, [assetbookAddr]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]', err);
      });
      console.log('results3', results3);
      const email = results3[0].u_email;
      emailArray.push(email);

      const personal_income = incomePaymentArrayGroup[index][idx];
      const holding_Amount = abBalArrayGroup[index][idx];
      console.log(`    email: ${email}, symbol: ${symbol}, acPaymentTime: ${acPaymentTime}, holding_Amount: ${holding_Amount}
  personal_income: ${personal_income}`);
      const sqlObject = {
        ar_investorEmail: email,
        ar_tokenSYMBOL: symbol,
        ar_Time: acPaymentTime,
        ar_Holding_Amount_in_the_end_of_Period: holding_Amount,
        ar_personal_income: personal_income,
      };
      console.log(sqlObject);

      const queryStr6 = 'INSERT INTO htoken.investor_assetRecord SET ?';
      const results5 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
        console.log('[Error @ mysqlPoolQueryB(queryStr6)]'+ err);
      });
      console.log('results5', results5);
    });
    console.log(`emailArray: ${emailArray}`);
    emailArrayGroup.push(emailArray);
  });
  console.log(`\nemailArrayGroup: ${emailArrayGroup}`);


}


const getForecastedSchedulesFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {
    const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From htoken.income_arrangement where ia_SYMBOL = ?';
    const results1 = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      reject('[Error @ addScheduleBatch: mysqlPoolQueryB(queryStr1)]:', err);
      return false;
    });
    const results1Len = results1.length;
    console.log('symbolArray length @ addScheduleBatch', results1Len);
    if (results1Len === 0) {
      reject('ia_time, ia_single_Forecasted_Payable_Income_in_the_Period not found');
      return false;
    }
    //console.log('results1', results1);
    resolve(results1);
  });
}


module.exports = {
    mysqlPoolQuery, addOrderRow, addUserRow,
    addTxnInfoRow, addTxnInfoRowFromObj,
    addIncomeArrangementRow,
    setFundingStateDB, getFundingStateDB,
    setTokenStateDB, getTokenStateDB,
    addProductRow, addSmartContractRow, 
    isIMScheduleGoodDB, setIMScheduleDB,
    addAssetRecordsIntoDB, addIncomePaymentPerPeriodIntoDB,
    mysqlPoolQueryB, findCtrtAddr, getForecastedSchedulesFromDB
}
