var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');
const bcrypt = require('bcrypt');
require('dotenv').config()

const chalk = require('chalk');
const log = console.log;

const { isEmpty, asyncForEach } = require('./utilities');
const { TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetRecordArray, incomeArrangementArray} = require('../ethereum/contracts/zsetupData');

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
              // http://localhost:3000/Product/ProductList
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
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'INSERT INTO  transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await mysqlPoolQueryB(queryStr1, [txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    resolve(true);
  });
}

const addTxnInfoRowFromObj = (row) => {
  //txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'INSERT INTO  transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    await mysqlPoolQueryB(queryStr1, [row.txid, row.tokenSymbol, row.fromAssetbook, row.toAssetbook, row.tokenId, row.txCount, row.holdingDays, row.txTime, row.balanceOffromassetbook]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    resolve(true);
  });
}


const addProductRow = async (nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD2, _CFED2, _quantityGoal, TimeTokenUnlock) => {
  return new Promise(async(resolve, reject) => {
    console.log('\nto add product row into DB');
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

    const queryStr1 = 'INSERT INTO  product SET ?';
    await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: '+ err);
    });
    resolve(result);
  });
}

const addSmartContractRow = async (nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController) => {
  console.log('inside addSmartContractRow()...');
  return new Promise(async(resolve, reject) => {
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

    const queryStr1 = 'INSERT INTO  smart_contracts SET ?';
    await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: '+ err);
    });
    resolve(true);
  });
}


const addUserRow = async (email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet) => {
  return new Promise(async(resolve, reject) => {
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
      .then(async(hash) => {
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
        const queryStr2 = 'INSERT INTO  user SET ?';
        await mysqlPoolQueryB(queryStr2, userNew).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr2)]. err: '+ err);
        });
        resolve(true);
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

    const queryStr1 = 'INSERT INTO order_list SET ?';
    const results1 = await mysqlPoolQueryB(queryStr1, sqlObject).catch((err) => reject('[Error @ mysqlPoolQueryB()]'+ err));
    resolve(results1);

  });
}



const addIncomeArrangementRowDev = (incomeArrangementNum) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside addIncomeArrangementRowDev(), incomeArrangementNum:', incomeArrangementNum);
    incomeArrangement = incomeArrangementArray[incomeArrangementNum];
    const sqlObject = {
      ia_SYMBOL: incomeArrangement.symbol,
      ia_time:  incomeArrangement.ia_time,
      ia_actualPaymentTime:  incomeArrangement.actualPaymentTime,
      ia_Payable_Period_End:  incomeArrangement.payablePeriodEnd,
      ia_Annual_End:  incomeArrangement.annualEnd,
      ia_wholecase_Principal_Called_back : incomeArrangement.wholecasePrincipalCalledBack,
      ia_wholecase_Book_Value : incomeArrangement.wholecaseBookValue,
      ia_wholecase_Forecasted_Annual_Income : incomeArrangement.wholecaseForecastedAnnualIncome,
      ia_wholecase_Forecasted_Payable_Income_in_the_Period : incomeArrangement.wholecaseForecastedPayableIncome,
      ia_wholecase_Accumulated_Income : incomeArrangement.wholecaseAccumulatedIncome,
      ia_wholecase_Income_Recievable : incomeArrangement.wholecaseIncomeReceivable,
      ia_wholecase_Theory_Value : incomeArrangement.wholecaseTheoryValue,
      ia_single_Principal_Called_back : incomeArrangement.singlePrincipalCalledBack,
      ia_single_Forecasted_Annual_Income : incomeArrangement.singleForecastedAnnualIncome,
      ia_single_Forecasted_Payable_Income_in_the_Period : incomeArrangement.singleForecastedPayableIncome,
      ia_single_Actual_Income_Payment_in_the_Period : incomeArrangement.singleActualIncomePayment,
      ia_single_Accumulated_Income_Paid : incomeArrangement.singleAccumulatedIncomePaid,
      ia_single_Token_Market_Price : incomeArrangement.singleTokenMarketPrice,
      ia_State : incomeArrangement.ia_state,
      ia_single_Calibration_Actual_Income_Payment_in_the_Period : incomeArrangement.singleCalibrationActualIncome,
    };//random() to prevent duplicate NULL entry!
    console.log(sqlObject);

    const queryStr = 'INSERT INTO  income_arrangement SET ?';
    const results = await mysqlPoolQueryB(queryStr, sqlObject).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr)]'+ err);
    });
    console.log("\ntransaction_info table has been added with one new row. result:");
    resolve(results);
  });
}

//----------------------------==AssetRecord in DB
//For timeserver to trigger ... calculate periodic profit
const calculateLastPeriodProfit = async(_symbol) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside calculateLastPeriodProfit()');
    const asset_valuation = 13000;
    const holding_amount_changed = 0;
    const holding_costChanged = 0;
    const acquired_cost = 13000;
    const moving_ave_holding_cost = 13000;

    const addrHCAT721 = await findCtrtAddr(_symbol,'hcat721').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });

    const queryStr1 = 'SELECT ia_SYMBOL, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period FROM  income_arrangement WHERE ia_actualPaymentTime = (SELECT  MAX(ia_actualPaymentTime) FROM  income_arrangement WHERE ia_SYMBOL = ?)';
    const results = await mysqlPoolQueryB(queryStr1, [_symbol]).catch((err) => {
      reject('\n[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
      return;
    });
    const resultsLen = results.length;
    console.log('\nArray length @ lastPeriodProfit:', resultsLen, ', symbols:', results);

    if (resultsLen === 0) {
      console.log('[lastPeriodProfit] no symbol was found');

    } else if (resultsLen > 0) {
      console.log('[lastPeriodProfit] symbol(s) found');
      await asyncForEach(results, async (entry, index) => {
        const symbol = entry.ia_SYMBOL;
        const ar_time = entry.ia_actualPaymentTime;
        const singleActualIncomePayment = entry.ia_single_Actual_Income_Payment_in_the_Period;
        console.log(`symbol: ${symbol} \nar_time: ${ar_time} \nsingleActualIncomePayment: ${singleActualIncomePayment}`);

        const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
        const toAddressArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
        console.log(`\ntoAddressArray: ${toAddressArray}`);

        const amountArray = await instHCAT721.methods.balanceOfArray(toAddressArray).call();
        console.log(`\namountArray: ${amountArray}`);

        const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost).catch((err) => {
          reject('[Error @ addAssetRecordRowArray]'+ err);
          return;
        });
        resolve([emailArrayError, amountArrayError]);
      });
    }
  });
}


const addAssetRecordRow = async (investorEmail, symbol, ar_time, holdingAmount, AccumulatedIncomePaid, UserAssetValuation, HoldingAmountChanged, HoldingCostChanged, AcquiredCost, MovingAverageofHoldingCost) => {
  return new Promise(async(resolve, reject) => {
    console.log('-------==addAssetRecordRow');
    const sql = {
      ar_investorEmail: investorEmail,
      ar_tokenSYMBOL: symbol,
      ar_Time: ar_time,
      ar_Holding_Amount_in_the_end_of_Period: holdingAmount,
      ar_Accumulated_Income_Paid: AccumulatedIncomePaid,
      ar_User_Asset_Valuation: UserAssetValuation,
      ar_User_Holding_Amount_Changed: HoldingAmountChanged,
      ar_User_Holding_CostChanged: HoldingCostChanged,
      ar_User_Acquired_Cost: AcquiredCost,
      ar_Moving_Average_of_Holding_Cost: MovingAverageofHoldingCost
    };//random() to prevent duplicate NULL entry!
    //console.log(sql);

    const querySql1 = 'INSERT INTO  investor_assetRecord SET ?';
    const results5 = await mysqlPoolQueryB(querySql1, sql).catch((err) => {
      reject('[Error @ adding asset row(querySql1)]. err: '+ err);
      return(false);
    });
    console.log("\nA new row has been added. result:", results5);
    resolve(true);
  });
}

const addAssetRecordRowArray = async (inputArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n----------------------==addAssetRecordRowArray');
    let mesg;
    if(typeof symbol !== "string" || isEmpty(symbol)){
      mesg = '[Error] symbol must be a string. symbol: ' + symbol;
      reject(mesg);
      return [null, null];
    
    } else if(!Array.isArray(inputArray) || inputArray.length === 0){
      mesg = '[Error] inputArray must be a non empty array';
      console.log(mesg, inputArray);
      reject(mesg);
      return [null, null];

    } else if(!Array.isArray(amountArray) || amountArray.length === 0){
      mesg = '[Error] amountArray must be an non empty array';
      console.log(mesg, amountArray);
      reject(mesg);
      return [null, null];
    
    } else if(!Number.isInteger(parseInt(ar_time))){
      console.log('ar_time:', typeof ar_time, Number.isInteger(ar_time));
      mesg = '[Error] ar_time '+ar_time+' must be an integer';
      reject(mesg);
      return [null, null];

    } else if(parseInt(ar_time) < serverTimeMin){ 
      mesg = '[Error] ar_time '+ar_time+' must be >= '+serverTimeMin;
      reject(mesg);
      return [null, null];

    } else if(inputArray.length !== amountArray.length) {
      mesg = '[Error] inputArray and amountArray must have the same length';
      reject(mesg);
      return [null, null];
    }

    const emailArray = [];
    if(inputArray[0].includes('@')){
      inputArray.forEach( (element, idx) => emailArray.push(element) );

    } else {
      console.log('all input values are okay');
      const queryStr4 = 'SELECT u_email FROM  user WHERE u_assetbookContractAddress = ?';
      await asyncForEach(inputArray, async (addrAssetbook, index) => {
        const results4 = await mysqlPoolQueryB(queryStr4, [addrAssetbook]).catch((err) => {
          reject('\n[Error @ mysqlPoolQueryB(queryStr4)]'+ err);
        });
        console.log('\nresults4', results4);
        if(results4 === null || results4 === undefined){
          console.log('\n----==[Warning] email address is null or undefined for addrAssetbook:', addrAssetbook, ', results4', results4);
          emailArray.push('email:_null_or_undefined');

        } else if(results4.length > 1){
          console.error('\n----==[Error] Got multiple email addresses from one addrAssetbook', addrAssetbook, ', results4', results4); 
          emailArray.push('email:_multiple_emails_were_found');

        } else if(results4.length === 0){
          console.error('\n----==[Warning] Got empty email address from one addrAssetbook', addrAssetbook, ', results4', results4);
          emailArray.push('email:not_found');

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
    console.log('\n------------------==emailArray:\n', emailArray);
    await asyncForEach(emailArray, async (email, idx) => {
      const amount = amountArray[idx];

      if(!email.includes('@')){
        emailArrayError.push(email);
        amountArrayError.push(amount);
        console.log(`[Error @ email] email: ${email}, amount: ${amount} ... added to emailArrayError and amountArrayError`);

      } else {
        console.log(`email: ${email}, symbol: ${symbol}, ar_time: ${ar_time}, amount: ${amount}`);
        const sqlObject = {
          ar_investorEmail: email,
          ar_tokenSYMBOL: symbol,
          ar_Time: ar_time,
          ar_Holding_Amount_in_the_end_of_Period: amount,
          ar_personal_income: singleActualIncomePayment * amount,
          ar_User_Asset_Valuation: asset_valuation,
          ar_User_Holding_Amount_Changed: holding_amount_changed,
          ar_User_Holding_CostChanged: holding_costChanged,
          ar_User_Acquired_Cost: acquired_cost,
          ar_Moving_Average_of_Holding_Cost: moving_ave_holding_cost
        };//random() to prevent duplicate NULL entry!
        console.log(sqlObject);

        const queryStr6 = 'INSERT INTO  investor_assetRecord SET ?';
        const results6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr6)]'+ err);
        });
        console.log('results6', results6);
      }
    });
    console.log(`\n------------------==End of addAssetRecordRowArray`);
    resolve([emailArrayError, amountArrayError]);
  });
  //process.exit(0);
}




//---------------------------== FundingState and TokenState
const getFundingStateDB = (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside getFundingStateDB()... get p_state');
    const queryStr2 = 'SELECT p_state, p_CFSD, p_CFED FROM  product WHERE p_SYMBOL = ?';
    const results2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]:'+ err);
      return false;
    });
    console.log('symbol', symbol, 'pstate', results2[0], 'CFSD', results2[1], 'CFED', results2[2]);
    resolve(true);
  });
}

//-------------------------==Not to be confused with setTokenStateDB
const setFundingStateDB = (symbol, pstate, CFSD, CFED) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside setFundingStateDB()... change p_state');
    const queryStr1 = 'UPDATE  product SET p_state = ?, p_CFSD = ?, p_CFED = ? WHERE p_SYMBOL = ?';
    const queryStr2 = 'UPDATE  product SET p_state = ? WHERE p_SYMBOL = ?';

    if(Number.isInteger(CFSD) && Number.isInteger(CFED)){
      const results1 = await mysqlPoolQueryB(queryStr1, [pstate, CFSD, CFED, symbol]).catch((err) => {
        reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]:'+ err);
        return false;
      });
      console.log('[setFundingStateDB] symbol', symbol, 'pstate', pstate, 'CFSD', CFSD, 'CFED', CFED); 
      //console.log('results1', results1);
      resolve(true);
    } else {
      const results2 = await mysqlPoolQueryB(queryStr2, [pstate, symbol]).catch((err) => {
        reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]:'+ err);
        return false;
      });
      console.log('[setFundingStateDB] symbol', symbol, 'pstate', pstate);
      //console.log('results2', results2);
      resolve(true);
    }
  });
}


//-------------------------==Not to be confused with setFundingStateDB
const setTokenStateDB = (symbol, tokenState, lockuptime, validdate) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside setTokenStateDB()... change p_tokenState');

    const queryStr1 = 'UPDATE  product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
    const queryStr2 = 'UPDATE  product SET p_tokenState = ? WHERE p_SYMBOL = ?';

    if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
      const results1 = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
        reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr1)]:'+ err);
        return false;
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate);
      //console.log('result', results1);
      resolve(true);
    } else {
      const results1 = await mysqlPoolQueryB(queryStr2, [tokenState, symbol]).catch((err) => {
        reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]:'+ err);
        return false;
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState);
      //console.log('result', results1);
      resolve(true);
    }
  });
}

const getTokenStateDB = (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside getTokenStateDB()... get p_tokenState');
    const queryStr2 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM  product WHERE p_SYMBOL = ?';
    const results2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      reject('[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]:'+ err);
      return false;
    });
    console.log('symbol', symbol, 'tokenState', results2[0], 'lockuptime', results2[1], 'validdate', results2[2]);
    resolve(true);
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
    } else {
      reject(ctrtType+' is undefined for symbol '+ symbol);
      return undefined;
    }
    const queryStr1 = 'SELECT '+scColumnName+' FROM  smart_contracts WHERE sc_symbol = ?';
    const ctrtAddrResults = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
      (err) => {
        reject('[Error @ mysqlPoolQueryB(queryStr1)]:'+ err);
      });
    const ctrtAddrResultsLen = ctrtAddrResults.length;
    console.log('\nArray length @ findCtrtAddr:', ctrtAddrResultsLen, ', ctrtAddrResults:', ctrtAddrResults);
    if(ctrtAddrResultsLen == 0){
      reject('no '+ctrtType+' contract address for '+symbol+' is found');
    } else if(ctrtAddrResultsLen > 1){
      reject('multiple '+ctrtType+' addresses were found for '+symbol);
    } else {
      const targetAddr = ctrtAddrResults[0][scColumnName];//.sc_incomeManagementaddress;
      if(isEmpty(targetAddr)){
        reject('[Error] targetAddr is not valid. scColumnName: '+ scColumnName+ ', targetAddr: '+ targetAddr);
      } else {
        resolve(targetAddr);
      }
    }
  });
}
//------------------------==
function setIMScheduleDB(symbol, tokenState, lockuptime, validdate){
  return new Promise(async(resolve, reject) => {
    console.log('\ninside setIMScheduleDB()... change p_tokenState');
    if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
      const queryStr1 = 'UPDATE  product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
      const result = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
        reject('[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate, 'result', result);
      resolve(true);
    } else {
      const queryStr1 = 'UPDATE  product SET p_tokenState = ? WHERE p_SYMBOL = ?';
      const result = await mysqlPoolQueryB(queryStr1, [tokenState, symbol]).catch((err) => {
        reject('[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'result', result);
      resolve(true);
    }
  });
}

function isIMScheduleGoodDB(symbol){
  return new Promise(async(resolve, reject) => {
    console.log('inside isIMScheduleGoodDB()');
    const queryStr1 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM  product WHERE p_SYMBOL = ?';
    const result = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
    });
    console.log('symbol', symbol, 'tokenState', result[0], 'lockuptime', result[1], 'validdate', result[2]);
    resolve([result[0], result[1]]);
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

  const queryStr0 = 'SELECT distinct ia_SYMBOL FROM  product';
  const symbolObjArray = await mysqlPoolQueryB(queryStr0, []).catch((err) => {
    console.log('\n[Error @ mysqlPoolQueryB(queryStr0)]'+ err);
  });
  //console.log('symbolObjArray', symbolObjArray);

  const queryStr7 = 'SELECT ia_SYMBOL, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period FROM  income_arrangement WHERE ia_actualPaymentTime = (SELECT  MAX(ia_actualPaymentTime) FROM  income_arrangement WHERE ia_SYMBOL = ?)'
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const results1 = await mysqlPoolQueryB(queryStr7, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr7)]'+ err);
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
  const queryStr1 = 'SELECT ia_SYMBOL, MAX(ia_actualPaymentTime) FROM  income_arrangement WHERE ia_SYMBOL = ?';
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const results1 = await mysqlPoolQueryB(queryStr1, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
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
    const queryStr2 = 'SELECT ia_SYMBOL, ia_single_Actual_Income_Payment_in_the_Period FROM  income_arrangement WHERE ia_SYMBOL = ?';
    await asyncForEach(symbolArray, async (symbol, index) => {
      const results1 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]'+ err);
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

  
  //const crowdFundingAddr = await findCtrtAddr(symbol, 'hcat721');
  const queryStr2 = 'SELECT sc_erc721address FROM  smart_contracts WHERE sc_symbol = ?';
  await asyncForEach(symbolArray, async (symbol, index) => {
    const results2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]'+ err);
    });
    console.log('results2', results2);

    if(results2.length === 0){
      console.log('[Error] erc721 contract address was not found');
      addrHCAT_Array.push('Not on record');
    } else if(results2.length > 1){
      console.log('[Error] multiple erc721 contract addresses were found');
      addrHCAT_Array.push('multiple contract addr');
    } else if(isEmpty(results2[0].sc_erc721address)){
      console.log('[Error] erc21 contract addresses is null or undefined or empty string');
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
      const queryStr3 = 'SELECT u_email FROM  user WHERE u_assetbookContractAddress = ?';
      const results3 = await mysqlPoolQueryB(queryStr3, [assetbookAddr]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]'+ err);
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

      const queryStr6 = 'INSERT INTO  investor_assetRecord SET ?';
      const results6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
        console.log('[Error @ mysqlPoolQueryB(queryStr6)]'+ err);
      });
      console.log('results6', results6);
    });
    console.log(`emailArray: ${emailArray}`);
    emailArrayGroup.push(emailArray);
  });
  console.log(`\nemailArrayGroup: ${emailArrayGroup}`);


}


const getForecastedSchedulesFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {
    const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From  income_arrangement where ia_SYMBOL = ?';
    const results1 = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      reject('[Error @ addScheduleBatch: mysqlPoolQueryB(queryStr1)]:'+ err);
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
    addIncomeArrangementRowDev,
    setFundingStateDB, getFundingStateDB,
    setTokenStateDB, getTokenStateDB,
    addProductRow, addSmartContractRow, 
    isIMScheduleGoodDB, setIMScheduleDB,
    addAssetRecordRow, addAssetRecordRowArray, addIncomePaymentPerPeriodIntoDB,
    mysqlPoolQueryB, findCtrtAddr, getForecastedSchedulesFromDB,
    calculateLastPeriodProfit
}
