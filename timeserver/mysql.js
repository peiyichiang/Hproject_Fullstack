var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');
const bcrypt = require('bcrypt');

const chalk = require('chalk');
const log = console.log;

const { DB_host, DB_user, DB_password, DB_name, DB_port } = require('./envVariables');

const { isEmpty, asyncForEach, asyncForEachAssetRecordRowArray, asyncForEachAssetRecordRowArray2 } = require('./utilities');

const { TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetRecordArray} = require('../ethereum/contracts/zsetupData');

const { userArray } = require('../ethereum/contracts/zTestParameters');
const userIdentityNumberArray = [];
const investorLevelArray = [];
const assetbookArray = [];
userArray.forEach((user, idx) => {
  if (idx !== 0 ){
    userIdentityNumberArray.push(user.identityNumber);
    investorLevelArray.push(user.investorLevel);
    assetbookArray.push(user.addrAssetBook);
  }
});

const serverTimeMin = 201905270900;

const DatabaseCredential = {
  host: DB_host,
  user: DB_user,
  password: DB_password,
  database: DB_name,
  port: DB_port,
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
          conn.query(sql, options, async function (err, result, fields) {
              // callback
              callback(err, result, fields);
              //console.log(`[connection sussessful @ mysql.js] `);
              // http://localhost:${serverPort}/Product/ProductList
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
          conn.query(sql, options, function (err, result) {
            if(err) {
              return reject(err);
            } else {
              conn.release();
              //console.log(`[Success: mysqlPoolQueryB @ mysql.js] `);
              resolve(result);
            }  
          });
        }
    });
  });
};




const addTxnInfoRow = (txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'INSERT INTO transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await mysqlPoolQueryB(queryStr1, [txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const deleteTxnInfoRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM transaction_info WHERE t_tokenSYMBOL = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const addTxnInfoRowFromObj = (row) => {
  //txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'INSERT INTO transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    const result = await mysqlPoolQueryB(queryStr1, [row.txid, row.tokenSymbol, row.fromAssetbook, row.toAssetbook, row.tokenId, row.txCount, row.holdingDays, row.txTime, row.balanceOffromassetbook]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}


const addProductRow = async (tokenSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD, _CFED, _quantityGoal, TimeTokenUnlock, fundingType, state) => {
  return new Promise(async(resolve, reject) => {
    console.log('\nto add product row into DB');
    const sql = {
      p_SYMBOL: tokenSymbol,
      p_name: nftName,
      p_location: location,
      p_pricing: initialAssetPricing,
      p_duration: duration,
      p_currency: pricingCurrency,
      p_irr: IRR20yrx100/100,
      p_releasedate: _CFED,
      p_validdate: _CFED,
      p_size: siteSizeInKW,
      p_totalrelease: maxTotalSupply,
      p_fundmanager: fundmanager,
      p_PAdate: "2019-8-8 00:00:00",
      p_CFSD: _CFSD,
      p_CFED: _CFED,
      p_icon: "",
      p_assetdocs: "",
      p_RPT: "9",
      p_FRP: "9",     
      p_PSD: _CFSD,
      p_FMXAdate: "2019-8-8 00:00:00", 
      p_state: state,
      p_Image1: "public/uploadImgs/1.jpg",
      p_Image2: "public/uploadImgs/2.jpg",
      p_Image3: "public/uploadImgs/3.jpg",
      p_Image4: "public/uploadImgs/4.jpg",
      p_Image5: "public/uploadImgs/5.jpg",
      p_Image6: "public/uploadImgs/6.jpg",
      p_Image7: "public/uploadImgs/7.jpg",
      p_Image8: "public/uploadImgs/8.jpg",
      p_Image9: "public/uploadImgs/9.jpg",
      p_Image10: "public/uploadImgs/10.jpg",
      p_fundingGoal: _quantityGoal,
      p_lockuptime: TimeTokenUnlock,
      p_tokenState: "lockup",
      p_fundingType: fundingType,
      p_ContractOut: _CFSD,
      p_CaseConstruction: _CFSD,
      p_ElectricityBilling: _CFSD,
      p_TaiPowerApprovalDate: _CFSD,
      p_BOEApprovalDate: _CFSD,
      p_PVTrialOperationDate: _CFSD,
      p_PVOnGridDate: _CFSD,
      p_Copywriting: "auto",
    };
    console.log(sql);

    const queryStr1 = 'INSERT INTO product SET ?';
    const result = await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: '+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const deleteProductRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM product WHERE p_SYMBOL = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const addSmartContractRow = async (tokenSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController) => {
  console.log('inside addSmartContractRow()...');
  return new Promise(async(resolve, reject) => {
    const sql = {
      sc_symbol: tokenSymbol,
      sc_crowdsaleaddress: addrCrowdFunding,
      sc_erc721address: addrHCAT721,
      sc_totalsupply: maxTotalSupply,
      sc_remaining: maxTotalSupply,
      sc_incomeManagementaddress: addrIncomeManager,
      sc_erc721Controller: addrTokenController,
    };
    console.log(sql);

    const queryStr1 = 'INSERT INTO smart_contracts SET ?';
    const result = await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: '+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const deleteSmartContractRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM smart_contracts WHERE sc_symbol = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}


const addUserRow = async (email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet) => {
  return new Promise(async(resolve, reject) => {
    console.log('----------==@user/addUserRow');
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
        const queryStr2 = 'INSERT INTO user SET ?';
        const result = await mysqlPoolQueryB(queryStr2, userNew).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr2)]. err: '+ err);
        });
        console.log(`result: ${result}`);
        resolve(true);
      });
  });
}


//-------------------==Add users
const addUsersIntoDB = async(users) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside addUsersIntoDB()');
    const result = await asyncForEach(users, async (user, idx) => {
      const email = user.email;
      const password = user.password;
      const identityNumber = user.identityNumber;
      const eth_add = user.eth_add;
      const cellphone = user.cellphone;
      const name = user.name;
      const addrAssetBook = user.addrAssetBook;
      const investorLevel = user.investorLevel;
      const imagef = user.imagef;
      const imageb = user.imageb;
      const bank_booklet = user.bank_booklet;

      console.log(`idx: ${idx}, email: ${email}, identityNumber: ${identityNumber}, eth_add: ${eth_add}, cellphone: ${cellphone}, name: ${name}, addrAssetbook: ${addrAssetBook}, investorLevel: ${investorLevel}, imagef: ${imagef}, imageb: ${imageb}, bank_booklet: ${bank_booklet}`);

      const result = await addUserRow(email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet).catch(err => reject(`addUserRow() failed. user: ${user}, err: ${err}`));
      console.log('result of addUserRow:', result);
    });
    resolve(true);
  });
}

const getAssetbookFromEmail = async(email) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside getAssetbookFromEmail()');
    const queryStr3 = 'SELECT u_assetbookContractAddress FROM user WHERE u_email = ?';
    const result1 = await mysqlPoolQueryB(queryStr3, [email]).catch((err) => {
      console.log('\n[Error @ getAssetbookFromEmail]');
      reject(err);
      return false;
    });
    const assetbookX = result1[0].u_assetbookContractAddress;
    resolve(assetbookX);
  });
}



Date.prototype.myFormat = function () {
  return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

//-----------------------------==Orders
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
    const result = await mysqlPoolQueryB(queryStr1, sqlObject).catch((err) => reject('[Error @ mysqlPoolQueryB()]'+ err));
    console.log(`result: ${result}`);
    resolve(true);

  });
}

const deleteOrderRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM order_list WHERE o_symbol = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const addUserArrayOrdersIntoDB = async(users, fundCount, paymentStatus, tokenSymbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside addUserArrayOrdersIntoDB()');
    await asyncForEach(users, async (user, idx) => {
      const identityNumber = user.identityNumber;
      const email = user.email;
      const tokenCount = user.tokenOrderAmount;
      console.log(`userNum: ${idx}, user: ${user}
  identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
  tokenSymbol: ${tokenSymbol}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);
  
      const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, fundCount, paymentStatus).catch((err) => {
        reject(err);
      });
      console.log(`addOrderRow result: ${result}`);
    });
    resolve(true);
  });
}

const addArrayOrdersIntoDB = async(userIndexArray, tokenCountArray, fundCount, paymentStatus, tokenSymbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside addArrayOrdersIntoDB()');
    if(userIndexArray.length !== tokenCountArray.length){
      reject('userIndexArray and tokenCountArray should have the same length');
    }
    const maxIndex = assetbookArray.length -1;
    userIndexArray.forEach((index, idx)=> {
      if(index > maxIndex || index < 0) {
        let mesg = `index should not be > maxIndex of ${maxIndex}. index value: ${index}`;
        console.log(mesg);
        reject(mesg);
      }
    });
    console.log('All index values have been checked good.');

    await asyncForEach(userIndexArray, async (userIndex, idx) => {
      const user = userArray[userIndex];
      const identityNumber = user.identityNumber;
      const email = user.email;
      const tokenCount = tokenCountArray[idx];
      console.log(`idx: ${idx}, 
identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
tokenSymbol: ${tokenSymbol}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);
  
      const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, fundCount, paymentStatus).catch((err) => {
        reject(err);
      });
      console.log(`addOrderRow result: ${result}`);
    });
    resolve(true);
  });
}

const addOrderIntoDB = async(identityNumber, email, tokenCount, fundCount, paymentStatus, tokenSymbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside addOrderIntoDB()');
    console.log(`userNum: ${idx}, user: ${user}
identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
tokenSymbol: ${tokenSymbol}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);

    const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, fundCount, paymentStatus).catch((err) => {
      reject(err);
    });
    console.log(`addOrderRow result: ${result}`);
    resolve(true);
  });
}

//-----------------------------==IncomeArrangement
const addActualPaymentTime = (actualPaymentTime, symbol, payablePeriodEnd) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside addActualPaymentTime(), actualPaymentTime:', actualPaymentTime);
    const queryStr = 'UPDATE income_arrangement SET ia_actualPaymentTime = ? WHERE ia_SYMBOL = ? AND ia_Payable_Period_End = ?';
    const result = await mysqlPoolQueryB(queryStr, [actualPaymentTime, symbol, payablePeriodEnd]).catch((err) => {
      console.log('[Error @ mysqlPoolQueryB(queryStr)]');
      reject(err);
      return false;
    });
    //console.log('result', result);
    resolve(true);
  });
}

const addIncomeArrangementRowFromObj = (iaObj) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside addIncomeArrangementRowFromObj(), iaObj:', iaObj);
    const sqlObject = {
      ia_SYMBOL: iaObj.symbol,
      ia_time:  iaObj.ia_time,
      ia_actualPaymentTime:  iaObj.actualPaymentTime,
      ia_Payable_Period_End:  iaObj.payablePeriodEnd,
      ia_Annual_End:  iaObj.annualEnd,
      ia_wholecase_Principal_Called_back : iaObj.wholecasePrincipalCalledBack,
      ia_wholecase_Book_Value : iaObj.wholecaseBookValue,
      ia_wholecase_Forecasted_Annual_Income : iaObj.wholecaseForecastedAnnualIncome,
      ia_wholecase_Forecasted_Payable_Income_in_the_Period : iaObj.wholecaseForecastedPayableIncome,
      ia_wholecase_Accumulated_Income : iaObj.wholecaseAccumulatedIncome,
      ia_wholecase_Income_Recievable : iaObj.wholecaseIncomeReceivable,
      ia_wholecase_Theory_Value : iaObj.wholecaseTheoryValue,
      ia_single_Principal_Called_back : iaObj.singlePrincipalCalledBack,
      ia_single_Forecasted_Annual_Income : iaObj.singleForecastedAnnualIncome,
      ia_single_Forecasted_Payable_Income_in_the_Period : iaObj.singleForecastedPayableIncome,
      ia_single_Actual_Income_Payment_in_the_Period : iaObj.singleActualIncomePayment,
      ia_single_Accumulated_Income_Paid : iaObj.singleAccumulatedIncomePaid,
      ia_single_Token_Market_Price : iaObj.singleTokenMarketPrice,
      ia_assetRecord_status: iaObj.assetRecordStatus,
      ia_State : iaObj.ia_state,
      ia_single_Calibration_Actual_Income_Payment_in_the_Period : iaObj.singleCalibrationActualIncome,
    };
    console.log(sqlObject);

    const queryStr = 'INSERT INTO income_arrangement SET ?';
    const result = await mysqlPoolQueryB(queryStr, sqlObject).catch((err) => {
      console.log('[Error @ mysqlPoolQueryB(queryStr)]'+err);
      reject(err);
      return false;
    });
    console.log(`result: ${result}`);
    console.log("income arrangement table has been added with one new row. result:");
    resolve(true);
  });
}

const addIncomeArrangementRow = (symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside addIncomeArrangementRow():', symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome);
    const sqlObject = {
      ia_SYMBOL: symbol,
      ia_time:  ia_time,
      ia_actualPaymentTime:  actualPaymentTime,
      ia_Payable_Period_End:  payablePeriodEnd,
      ia_Annual_End:  annualEnd,
      ia_wholecase_Principal_Called_back : wholecasePrincipalCalledBack,
      ia_wholecase_Book_Value : wholecaseBookValue,
      ia_wholecase_Forecasted_Annual_Income : wholecaseForecastedAnnualIncome,
      ia_wholecase_Forecasted_Payable_Income_in_the_Period : wholecaseForecastedPayableIncome,
      ia_wholecase_Accumulated_Income : wholecaseAccumulatedIncome,
      ia_wholecase_Income_Recievable : wholecaseIncomeReceivable,
      ia_wholecase_Theory_Value : wholecaseTheoryValue,
      ia_single_Principal_Called_back : singlePrincipalCalledBack,
      ia_single_Forecasted_Annual_Income : singleForecastedAnnualIncome,
      ia_single_Forecasted_Payable_Income_in_the_Period : singleForecastedPayableIncome,
      ia_single_Actual_Income_Payment_in_the_Period : singleActualIncomePayment,
      ia_single_Accumulated_Income_Paid : singleAccumulatedIncomePaid,
      ia_single_Token_Market_Price : singleTokenMarketPrice,
      ia_State : ia_state,
      ia_single_Calibration_Actual_Income_Payment_in_the_Period : singleCalibrationActualIncome,
    };
    console.log(sqlObject);

    const queryStr = 'INSERT INTO income_arrangement SET ?';
    const result = await mysqlPoolQueryB(queryStr, sqlObject).catch((err) => {
      console.log('[Error @ mysqlPoolQueryB(queryStr)]'+err);
      reject(err);
      return false;
    });
    console.log(`result: ${result}`);
    console.log("\ntransaction_info table has been added with one new row. result:");
    resolve(true);
  });
}

const deleteIncomeArrangementRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM income_arrangement WHERE ia_SYMBOL = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const addIncomeArrangementRows = async(incomeArrangementArray) => {
  return new Promise(async(resolve, reject) => {
    console.log('-----------------== addIncomeArrangementRows');
    const resultArray = [];
    await asyncForEach(incomeArrangementArray, async (item, idx) => {
      const result = await addIncomeArrangementRowFromObj(item).catch((err) => {
        reject('[Error @ addIncomeArrangementRowFromObj]'+ err);
      });
      //console.log(`result: ${result}`);
      resultArray.push(result);
    });
    resolve(resultArray);
  });
}


const getProductPricing = async(symbol) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside getProductPricing()');
    const queryStr1 = 'SELECT p_pricing FROM product WHERE p_SYMBOL = ?';//"NCCU0716"
    const result1 = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      console.log('\n[Error @ getProductPricing]');
      reject(err);
      return false;
    });
    const pricing = result1[0].p_pricing;
    if(Number.isInteger(pricing)){
      console.log('pricing found as an integer:', pricing);
      resolve(parseInt(pricing));
    } else{
      console.log('pricing is not an integer:', pricing);
      reject(false);
    }
  });
}

//yarn run testmt -f 26
const getMaxActualPaymentTime = async(symbol, serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('-----------==getProfitSymbolAddress');
    const queryStr2 = 'SELECT MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_actualPaymentTime <= ?';
    //SELECT MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = "ACHM6666" AND ia_actualPaymentTime <= 201906271235;

    const result2 = await mysqlPoolQueryB(queryStr2, [symbol, serverTime]).catch((err) => {
      console.log('\n[Error @ getMaxActualPaymentTime > mysqlPoolQueryB()]');
      reject(err);
      return false;
    });
    if(result2.length > 0){
      const MAX_ia_actualPaymentTime = result2[0]['MAX(ia_actualPaymentTime)'];
      console.log('MAX_ia_actualPaymentTime:', MAX_ia_actualPaymentTime);
      resolve(MAX_ia_actualPaymentTime);
    } else {
      console.log('result2', result2);
      resolve(undefined);
    }
  });
}


const getPastScheduleTimes = async(symbol, serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('-----------==getPastScheduleTimes');
    const queryStr1 = 'SELECT ia_time FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_time <= ?';
    const result1 = await mysqlPoolQueryB(queryStr1, [symbol, serverTime]).catch((err) => {
      console.log('\n[Error @ getPastScheduleTimes > mysqlPoolQueryB()]');
      reject(err);
      return false;
    });
    const pastSchedules = result1.map((item) => {
      return item.ia_time;
    });
    resolve(pastSchedules);
  });
}

const getSymbolsONM = async() => {
  return new Promise(async(resolve, reject) => {
    console.log('-----------==getSymbolsONM');
    let mesg;
    const queryStr2 = 'SELECT sc_symbol, smart_contracts.sc_erc721address FROM smart_contracts WHERE sc_symbol IN (SELECT p_SYMBOL FROM product WHERE p_state = "ONM")';
    const result2 = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
      console.log('\n[Error @ getProfitSymbolAddresses > mysqlPoolQueryB(queryStr2)]');
      reject(err);
      return false;
    });
    const result2Len = result2.length;
    console.log('\nArray length @ getProfitSymbolAddresses:', result2Len);
    if(result2Len === 0 ){
      mesg = '[Error @ getProfitSymbolAddresses > queryStr2';
      console.log('\n'+mesg);
      reject(mesg);
      return false;
    }
    // console.log('result2:', result2);
    const foundSymbols = [];
    const foundHCAT721Addrs = [];
    for(let i = 0; i < result2.length; i++) {
      if(typeof result2[i] === 'object' && result2[i] !== null && !excludedSymbols.includes(result2[i].sc_symbol)){
        foundSymbols.push(result2[i].sc_symbol);
        foundHCAT721Addrs.push(result2[i].sc_erc721address);
      }
    }
    resolve([foundSymbols, foundHCAT721Addrs]);
  });
}

//yarn run testmt -f 4
const getProfitSymbolAddresses = async(serverTime) => {
  return new Promise(async(resolve, reject) => {
    let mesg = '';
    console.log('-----------==getProfitSymbolAddress, serverTime:', serverTime);
    const [foundSymbols, foundHCAT721Addrs] = await getSymbolsONM().catch((err) => {
      console.log('\n[Error @getSymbolsONM] err:', err);
      reject(err);
      return false;
    });

    //console.log('foundHCAT721Addrs', foundHCAT721Addrs);
    const queryActualPaymentTime = 'SELECT ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_State = "ia_state_approved" AND ia_assetRecord_status = 0 AND ia_SYMBOL = ? AND ia_actualPaymentTime = ?';

    const acPaymentArray = [];
    const maxAcPaymentTimeArray = [];
    let result3;
    await asyncForEach(foundSymbols, async (symbol, index) => {
      const maxActualPaymentTime = await getMaxActualPaymentTime(symbol, serverTime);
      console.log('-----------==symbol:', symbol, ', serverTime:', serverTime, ', maxActualPaymentTime:', maxActualPaymentTime);

      if(maxActualPaymentTime){
        console.log('[Good] maxActualPaymentTime is found! maxActualPaymentTime =', maxActualPaymentTime);
        result3 = await mysqlPoolQueryB(queryActualPaymentTime, [symbol, maxActualPaymentTime]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryActualPaymentTime)]');
          reject(err);
          return false;
        });
        if(isEmpty(result3)){
          console.log('[Warning] Actual Payment Time Array query returns nothing. symbol = '+symbol);
        }
  
      } else {
        console.log('[Warning] maxActualPaymentTime is not found!');
      }
      acPaymentArray.push(result3);
      maxAcPaymentTimeArray.push(maxActualPaymentTime);
    });
    // const acPaymentArrayLen = acPaymentArray.length;
    // console.log('\nArray length @ lastPeriodProfit:', acPaymentArrayLen)
    console.log('acPaymentArray:', acPaymentArray);//[ [], [], [] ]
    resolve([foundSymbols, foundHCAT721Addrs, acPaymentArray, maxAcPaymentTimeArray]);
  });
}

//----------------------------==AssetRecord in DB
//For timeserver to trigger ... calculate periodic profit
const calculateLastPeriodProfit = async(serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==inside calculateLastPeriodProfit()');
    const asset_valuation = 13000;
    const holding_amount_changed = 0;
    const holding_costChanged = 0;
    const moving_ave_holding_cost = 13000;

    const [foundSymbols, foundHCAT721Addrs, acPaymentArray, maxAcPaymentTimeArray] = await getProfitSymbolAddresses(serverTime).catch((err) => {
      console.log('\n[Error @ getProfitSymbolAddresses]');
      return false;
    });
    console.log('mysql434: foundSymbols:', foundSymbols, '\nfoundHCAT721Addrs:', foundHCAT721Addrs, '\nacPaymentArray:', acPaymentArray, '\nmaxAcPaymentTimeArray:', maxAcPaymentTimeArray);

    const symbolsLength = foundSymbols.length;
    if(symbolsLength !== foundHCAT721Addrs.length){
      reject('[Error] foundSymbols and foundHCAT721Addrs are of difference length');
      return false;

    } else if(acPaymentArray.length !== foundSymbols.length){
      reject('[Error] acPaymentArray and foundSymbols are of different length');
      return false;

    } else if (symbolsLength === 0) {
      reject('[calculateLastPeriodProfit] no symbol was found');
      return false;

    } else if (symbolsLength > 0) {
      console.log('[calculateLastPeriodProfit] symbol(s) found');
      await asyncForEach(foundSymbols, async (symbol, index) => {

        if(acPaymentArray[index].length === 0){
          console.log('[Warning] Actual Payment Time Array query returns nothing');
          resolve([undefined, undefined]);
        } else {

          const pricing = await getProductPricing(symbol);
          if(!pricing){
            console.log('\n[Error @ addAssetRecordRowArray > getProductPricing]', pricing);
            reject(false);
            return false;
          }

          const ar_time = maxAcPaymentTimeArray[index];
          const singleActualIncomePayment = acPaymentArray[index];
          console.log(`symbol: ${symbol} \nar_time: ${ar_time} \nsingleActualIncomePayment: ${singleActualIncomePayment}`);

          const instHCAT721 = new web3.eth.Contract(HCAT721.abi, foundHCAT721Addrs[index]);
          const toAddressArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
          console.log(`\ntoAddressArray: ${toAddressArray}`);

          const amountArray = await instHCAT721.methods.balanceOfArray(toAddressArray).call();
          console.log(`\namountArray: ${amountArray}`);
          const acquiredCostArray = amountArray.map((item) => {
            return parseInt(item) * pricing;
          });

          const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost).catch((err) => {
            console.log('\n[Error @ addAssetRecordRowArray]');
            reject(err);
            return false;
          });

          const resultsetAssetRecordStatus = await setAssetRecordStatus('1', symbol, ar_time);
          console.log(`\n-----------------==At the end of calculateLastPeriodProfit(): emailArrayError=${emailArrayError}, amountArrayError=${amountArrayError}, resultsetAssetRecordStatus=${resultsetAssetRecordStatus}`)
          resolve([emailArrayError, amountArrayError, resultsetAssetRecordStatus]);
        }
      });
    }
  });
}

const setAssetRecordStatus = async (assetRecordStatus, symbol, actualPaymentTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n-------==setAssetRecordStatus');
    const queryStr1 = 'UPDATE income_arrangement SET ia_assetRecord_status = ? WHERE ia_SYMBOL = ? AND ia_actualPaymentTime = ?';
    const result1 = await mysqlPoolQueryB(queryStr1, [assetRecordStatus, symbol, actualPaymentTime]).catch((err) => {
      const mesg = '[Error @ setAssetRecordStatus]';
      console.log('\n'+mesg);
      reject(err);
      return false;
    });
    console.log("\nresult1:", result1);
    resolve(true);
  });
}

const addAssetRecordRow = async (investorEmail, symbol, ar_time, holdingAmount, AccumulatedIncomePaid, UserAssetValuation, HoldingAmountChanged, HoldingCostChanged, AcquiredCost, MovingAverageofHoldingCost) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n-------==addAssetRecordRow');
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

    const querySql1 = 'INSERT INTO investor_assetRecord SET ?';
    const result5 = await mysqlPoolQueryB(querySql1, sql).catch((err) => {
      console.log('[Error @ adding asset row(querySql1)]');
      reject(err);
      return(false);
    });
    console.log("\nA new row has been added. result:", result5);
    resolve(true);
  });
}

const deleteAssetRecordRows = (tokenSymbol) => {
  return new Promise(async(resolve, reject) => {
    const queryStr1 = 'DELETE FROM investor_assetRecord WHERE ar_tokenSYMBOL = ?';
    const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB]'+ err);
    });
    console.log(`result: ${result}`);
    resolve(true);
  });
}

const addAssetRecordRowArray = async (inputArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n----------------------==addAssetRecordRowArray');
    let mesg = '';
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
      inputArray.forEach( (item, idx) => emailArray.push(item) );

    } else {
      console.log('all input values are okay');
      const queryStr4 = 'SELECT u_email FROM user WHERE u_assetbookContractAddress = ?';
      await asyncForEachAssetRecordRowArray(inputArray, async (addrAssetbook, index) => {
        const result4 = await mysqlPoolQueryB(queryStr4, [addrAssetbook]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr4)]');
          reject(err);
          return [null, null];
        });
        console.log('\nresult4', result4);
        if(result4 === null || result4 === undefined){
          console.log('\n----==[Warning] email address is null or undefined for addrAssetbook:', addrAssetbook, ', result4', result4);
          emailArray.push('email:_null_or_undefined');

        } else if(result4.length > 1){
          console.error('\n----==[Error] Got multiple email addresses from one addrAssetbook', addrAssetbook, ', result4', result4); 
          emailArray.push('email:_multiple_emails_were_found');

        } else if(result4.length === 0){
          console.error('\n----==[Warning] Got empty email address from one addrAssetbook', addrAssetbook, ', result4', result4);
          emailArray.push('email:not_found');

        } else {
          console.error('\n----==[Good] Got one email address from addrAssetbook', addrAssetbook);
          const email = result4[0].u_email;
          console.log('addrAssetbook', addrAssetbook, email, amountArray[index]);
          emailArray.push(email);
        }
      });
    }

    const emailArrayError = [];
    const amountArrayError = [];
    console.log('\n------------------==emailArray:\n', emailArray);
    await asyncForEachAssetRecordRowArray2(emailArray, async (email, idx) => {
      const amount = amountArray[idx];
      const acquiredCost = acquiredCostArray[idx];

      if(!email.includes('@')){
        emailArrayError.push(email);
        amountArrayError.push(amount);
        console.log(`[Error @ email] email: ${email}, amount: ${amount} ... added to emailArrayError and amountArrayError`);

      } else {
        console.log(`mysql612: email: ${email}, symbol: ${symbol}, ar_time: ${ar_time}, amount: ${amount}, acquiredCost: ${acquiredCost}`);
        const sqlObject = {
          ar_investorEmail: email,
          ar_tokenSYMBOL: symbol,
          ar_Time: ar_time,
          ar_Holding_Amount_in_the_end_of_Period: amount,
          ar_personal_income: singleActualIncomePayment * amount,
          ar_User_Asset_Valuation: asset_valuation,
          ar_User_Holding_Amount_Changed: holding_amount_changed,
          ar_User_Holding_CostChanged: holding_costChanged,
          ar_User_Acquired_Cost: acquiredCost,
          ar_Moving_Average_of_Holding_Cost: moving_ave_holding_cost
        };
        console.log(sqlObject);

        const queryStr6 = 'INSERT INTO investor_assetRecord SET ?';
        const result6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr6)]');
          reject(err);
          return [null, null];
        });
        //console.log('result6', result6);
      }
    });
    console.log(`\n--------------==End of addAssetRecordRowArray`);
    resolve([emailArrayError, amountArrayError]);
  });
  //process.exit(0);
}




//---------------------------== FundingState and TokenState
const getFundingStateDB = (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside getFundingStateDB()... get p_state');
    const queryStr2 = 'SELECT p_state, p_CFSD, p_CFED FROM product WHERE p_SYMBOL = ?';
    const result2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]');
      reject(err);
      return false;
    });
    console.log('symbol', symbol, 'pstate', result2[0], 'CFSD', result2[1], 'CFED', result2[2]);
    resolve(true);
  });
}

//-------------------------==Not to be confused with setTokenStateDB
const setFundingStateDB = (symbol, pstate, CFSD, CFED) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside setFundingStateDB()... change p_state');
    const queryStr1 = 'UPDATE product SET p_state = ?, p_CFSD = ?, p_CFED = ? WHERE p_SYMBOL = ?';
    const queryStr2 = 'UPDATE product SET p_state = ? WHERE p_SYMBOL = ?';

    if(Number.isInteger(CFSD) && Number.isInteger(CFED)){
      const result1 = await mysqlPoolQueryB(queryStr1, [pstate, CFSD, CFED, symbol]).catch((err) => {
        console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]');
        reject(err);
        return false;
      });
      console.log('[setFundingStateDB] symbol', symbol, 'pstate', pstate, 'CFSD', CFSD, 'CFED', CFED); 
      //console.log('result1', result1);
      resolve(true);
    } else {
      const result2 = await mysqlPoolQueryB(queryStr2, [pstate, symbol]).catch((err) => {
        console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]');
        reject(err);
        return false;
      });
      console.log('[Success @setFundingStateDB] have set symbol', symbol, 'to p_state =', pstate);
      //console.log('result2', result2);
      resolve(true);
    }
  });
}


//-------------------------==Not to be confused with setFundingStateDB
const setTokenStateDB = (symbol, tokenState, lockuptime, validdate) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside setTokenStateDB()... change p_tokenState');

    const queryStr1 = 'UPDATE product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
    const queryStr2 = 'UPDATE product SET p_tokenState = ? WHERE p_SYMBOL = ?';

    if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
      const result1 = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
        console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr1)]');
        reject(err);
        return false;
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate);
      //console.log('result', result1);
      resolve(true);
    } else {
      const result = await mysqlPoolQueryB(queryStr2, [tokenState, symbol]).catch((err) => {
        console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]');
        reject(err);
        return false;
      });
      console.log(`\nresult: ${result} \n[DB] symbol: ${symbol}, tokenState: ${tokenState}`);
      //console.log('result', result1);
      resolve(true);
    }
  });
}

const getTokenStateDB = (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside getTokenStateDB()... get p_tokenState');
    const queryStr2 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM product WHERE p_SYMBOL = ?';
    const result2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      console.log('\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]');
      reject(err);
      return false;
    });
    console.log('symbol', symbol, 'tokenState', result2[0], 'lockuptime', result2[1], 'validdate', result2[2]);
    resolve(true);
  });
}


const getAllSmartContractAddrs = async(symbol) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n---------==inside getAllSmartContractAddrs');
    let mesg;
    const queryStr1 = 'SELECT * FROM smart_contracts WHERE sc_symbol = ?';
    const ctrtAddrResult = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
      (err) => {
        reject('[Error @ getAllSmartContractAddrs:'+ err);
      });
    const ctrtAddrResultLen = ctrtAddrResult.length;

    if(ctrtAddrResultLen == 0){
      resolve([false, undefined, `[Error] no contract row is found for ${symbol}`]);
    } else if(ctrtAddrResultLen > 1){
      resolve([false, 'multipleAddr', `[Error] multiple contract rows are found for ${symbol}`]);
    } else {
      //console.log(' ctrtAddrResult[0]:',  ctrtAddrResult[0]);
      //process.exit(0);
      const ctrtAddrObj = ctrtAddrResult[0];

      resolve([ctrtAddrObj['sc_crowdsaleaddress'], ctrtAddrObj['sc_erc721Controller'], ctrtAddrObj['sc_erc721address'], ctrtAddrObj['sc_incomeManagementaddress']]);
    }
  });
}

// getCtrtAddr(symbol, 'incomemanager')
// getCtrtAddr(symbol, 'tokencontroller')
const getCtrtAddr = async(symbol, ctrtType) => {
  return new Promise(async(resolve, reject) => {
    //console.log('\n---------==inside getCtrtAddr');
    let scColumnName, mesg;
    if(ctrtType === 'incomemanager'){
      scColumnName = 'sc_incomeManagementaddress';
    } else if(ctrtType === 'crowdfunding'){
      scColumnName = 'sc_crowdsaleaddress';
    } else if(ctrtType === 'hcat721'){
      scColumnName = 'sc_erc721address';
    } else if(ctrtType === 'tokencontroller'){
      scColumnName = 'sc_erc721Controller';
    // } else if(ctrtType === 'helium'){
    //   scColumnName = 'sc_helium';
    } else {
      reject(ctrtType+' is out of range');
      return undefined;
    }
    const queryStr1 = 'SELECT '+scColumnName+' FROM smart_contracts WHERE sc_symbol = ?';
    const ctrtAddrResult = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
      (err) => {
        reject('[Error @ getCtrtAddr:'+ err);
      });
    const ctrtAddrResultLen = ctrtAddrResult.length;
    //console.log('\nArray length @ getCtrtAddr:', ctrtAddrResultLen, ', ctrtAddrResult:', ctrtAddrResult);
    if(ctrtAddrResultLen == 0){
      resolve([false, undefined, `[Error] no ${ctrtType} contract address is found for ${symbol}`]);
    } else if(ctrtAddrResultLen > 1){
      resolve([false, 'multipleAddr', `[Error] multiple ${ctrtType} addresses are found for ${symbol}`]);
    } else {
      const targetAddr = ctrtAddrResult[0][scColumnName];//.sc_incomeManagementaddress;
      if(isEmpty(targetAddr)){
        resolve([false, '0x0', `[Error] empty ${ctrtType} contract address value is found for ${symbol}, targetAddr: ${targetAddr}`]);
      } else {
        resolve([true, targetAddr, `[Good] one ${ctrtType} address is found for ${symbol}`]);
      }
    }
  });
}

const getSymbolFromCtrtAddr = async(ctrtAddr, ctrtType) => {
  return new Promise(async(resolve, reject) => {
    //console.log('\n---------==inside getSymbolFromCtrtAddr');
    let scColumnName, mesg;
    if(ctrtType === 'incomemanager'){
      scColumnName = 'sc_incomeManagementaddress';
    } else if(ctrtType === 'crowdfunding'){
      scColumnName = 'sc_crowdsaleaddress';
    } else if(ctrtType === 'hcat721'){
      scColumnName = 'sc_erc721address';
    } else if(ctrtType === 'tokencontroller'){
      scColumnName = 'sc_erc721Controller';
    // } else if(ctrtType === 'helium'){
    //   scColumnName = 'sc_helium';
    } else {
      reject(ctrtType+' is out of range');
      return undefined;
    }
    const queryStr1 = 'SELECT sc_symbol from smart_contracts where '+ scColumnName+' = ?';
    const symbolResult = await mysqlPoolQueryB(queryStr1, [ctrtAddr]).catch((err) => {
      reject('[Error @ getSymbolFromCtrtAddr]'+err);
    });

    const symbolResultLen = symbolResult.length;
    //console.log('\nArray length @ getSymbolFromCtrtAddr:', symbolResultLen, ', symbolResult:', symbolResult);
    if(symbolResultLen == 0){
      resolve([false, undefined, `[Error] no symbol is found for ${ctrtType} contract address$ {ctrtAddr}`]);
    } else if(symbolResultLen > 1){
      resolve([false, 'multipleSymbols', `[Error] multiple symbols are found for ${ctrtType} addresses ${ctrtAddr}`]);
    } else {
      const symbol = symbolResult[0]['sc_symbol'];
      if(isEmpty(symbol)){
        resolve([false, '', `[Error] empty symbol value is found for ${ctrtType} contract address ${ctrtAddr}`]);
      } else {
        resolve([true, symbol, `[Good] one symbol is found for ${ctrtType} address ${ctrtAddr}`]);
      }
    }
  });
}

//------------------------==
function setIMScheduleDB(symbol, tokenState, lockuptime, validdate){
  return new Promise(async(resolve, reject) => {
    console.log('\ninside setIMScheduleDB()... change p_tokenState');
    if(Number.isInteger(lockuptime) && Number.isInteger(validdate)){
      const queryStr1 = 'UPDATE product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
      const result = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
        reject('[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
      });
      console.log('[DB] symbol', symbol, 'tokenState', tokenState, 'lockuptime', lockuptime, 'validdate', validdate, 'result', result);
      resolve(true);
    } else {
      const queryStr1 = 'UPDATE product SET p_tokenState = ? WHERE p_SYMBOL = ?';
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
    const queryStr1 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM product WHERE p_SYMBOL = ?';
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

  const queryStr0 = 'SELECT distinct ia_SYMBOL FROM product';
  const symbolObjArray = await mysqlPoolQueryB(queryStr0, []).catch((err) => {
    console.log('\n[Error @ mysqlPoolQueryB(queryStr0)]'+ err);
  });
  //console.log('symbolObjArray', symbolObjArray);

  const queryStr7 = 'SELECT ia_SYMBOL, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_actualPaymentTime = (SELECT  MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ?)'
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const result1 = await mysqlPoolQueryB(queryStr7, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr7)]'+ err);
    });
    const symbolM = result1[0].ia_SYMBOL;
    const acpaymentTime = parseInt(result1[0]['MAX(ia_actualPaymentTime)']);
    if(serverTime >= acpaymentTime){
      console.log('found period', symbolM, acpaymentTime);
      symbolArray.push(symbolM);
      acPaymentTimeArray.push(acpaymentTime);
      const incomePayment = parseInt(result1[0].ia_single_Actual_Income_Payment_in_the_Period);
      acIncomePaymentArray.push(incomePayment);
    }
  });
  /*
  const queryStr1 = 'SELECT ia_SYMBOL, MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ?';
  await asyncForEach(symbolObjArray, async (symbolObj, index) => {
    const result1 = await mysqlPoolQueryB(queryStr1, [symbolObj.ia_SYMBOL]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
    });
    //console.log('result1', result1, result1[0].ia_SYMBOL, result1[0]['MAX(ia_actualPaymentTime)']);
    const symbolM = result1[0].ia_SYMBOL;
    const acpaymentTime = parseInt(result1[0]['MAX(ia_actualPaymentTime)']);
    if(serverTime >= acpaymentTime){
      console.log('found period', symbolM, acpaymentTime);
      symbolArray.push(symbolM);
      acPaymentTimeArray.push(acpaymentTime);
    }
  });
  console.log('\n----------------==\nsymbolArray', symbolArray, '\nacPaymentTimeArray', acPaymentTimeArray);

  if(symbolArray.length > 0){
    const queryStr2 = 'SELECT ia_SYMBOL, ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_SYMBOL = ?';
    await asyncForEach(symbolArray, async (symbol, index) => {
      const result1 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]'+ err);
      });
      const incomePayment = parseInt(result1[0].ia_single_Actual_Income_Payment_in_the_Period);
      acIncomePaymentArray.push(incomePayment);
    });
  
  } else {
    console.log('no periodSymbol is found.');
  }
  */

  console.log(`\n----------------==\nsymbolArray: ${symbolArray} \nacPaymentTimeArray: ${acPaymentTimeArray}
  acIncomePaymentArray: ${acIncomePaymentArray}`);

  
  //const crowdFundingAddr = await getCtrtAddr(symbol, 'hcat721');
  const queryStr2 = 'SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol = ?';
  await asyncForEach(symbolArray, async (symbol, index) => {
    const result2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr2)]'+ err);
    });
    console.log('result2', result2);

    if(result2.length === 0){
      console.log('[Error] erc721 contract address was not found');
      addrHCAT_Array.push('Not on record');
    } else if(result2.length > 1){
      console.log('[Error] multiple erc721 contract addresses were found');
      addrHCAT_Array.push('multiple contract addr');
    } else if(isEmpty(result2[0].sc_erc721address)){
      console.log('[Error] erc21 contract addresses is null or undefined or empty string');
      addrHCAT_Array.push(result2[0].sc_erc721address);
    } else {
      console.log('[Good] erc721 contract address:', result2[0].sc_erc721address);
      addrHCAT_Array.push(result2[0].sc_erc721address);
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
      const queryStr3 = 'SELECT u_email FROM user WHERE u_assetbookContractAddress = ?';
      const result3 = await mysqlPoolQueryB(queryStr3, [assetbookAddr]).catch((err) => {
        console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]'+ err);
      });
      console.log('result3', result3);
      const email = result3[0].u_email;
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

      const queryStr6 = 'INSERT INTO investor_assetRecord SET ?';
      const result6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
        console.log('[Error @ mysqlPoolQueryB(queryStr6)]'+ err);
      });
      console.log('result6', result6);
    });
    console.log(`emailArray: ${emailArray}`);
    emailArrayGroup.push(emailArray);
  });
  console.log(`\nemailArrayGroup: ${emailArrayGroup}`);


}

const addForecastedSchedulesIntoDB = async () => {
  // already done when uploading csv into DB
}

const getForecastedSchedulesFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {
    const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From income_arrangement where ia_SYMBOL = ?';
    const result1 = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      reject('[Error @ addScheduleBatch: mysqlPoolQueryB(queryStr1)]:'+ err);
      return false;
    });
    const result1Len = result1.length;
    console.log('symbolArray length @ addScheduleBatch', result1Len);
    if (result1Len === 0) {
      reject('ia_time, ia_single_Forecasted_Payable_Income_in_the_Period not found');
      return false;

    } else {
      const forecastedPayableTimes = [];
      const forecastedPayableAmounts = [];
      const forecastedPayableTimesError = [];
      const forecastedPayableAmountsError = [];

      for(let i = 0; i < result1.length; i++) {
        if(typeof result1[i] === 'object' && result1[i] !== null && result1[i] !== undefined){
          forecastedPayableTimes.push(result1[i].ia_time);
          forecastedPayableAmounts.push(result1[i].ia_single_Forecasted_Payable_Income_in_the_Period);
        } else {
          forecastedPayableTimesError.push(result1[i].ia_time);
          forecastedPayableAmountsError.push(result1[i].ia_single_Forecasted_Payable_Income_in_the_Period);
        }
      }
      resolve([forecastedPayableTimes, forecastedPayableAmounts, forecastedPayableTimesError, forecastedPayableAmountsError]);
    }
  });
}


module.exports = {
    mysqlPoolQuery, addOrderRow, addUserRow, addTxnInfoRow, addTxnInfoRowFromObj,
    addIncomeArrangementRowFromObj, addIncomeArrangementRow, addIncomeArrangementRows, setFundingStateDB, getFundingStateDB,
    setTokenStateDB, getTokenStateDB, addProductRow, addSmartContractRow, addUsersIntoDB, addUserArrayOrdersIntoDB, addArrayOrdersIntoDB, addOrderIntoDB, isIMScheduleGoodDB, setIMScheduleDB, getPastScheduleTimes, getSymbolsONM, addAssetRecordRow, addAssetRecordRowArray, addActualPaymentTime, addIncomePaymentPerPeriodIntoDB,getAssetbookFromEmail, mysqlPoolQueryB, getCtrtAddr, getSymbolFromCtrtAddr, getForecastedSchedulesFromDB, calculateLastPeriodProfit, getProfitSymbolAddresses, setAssetRecordStatus, getMaxActualPaymentTime, deleteTxnInfoRows, deleteProductRows, deleteSmartContractRows, deleteOrderRows, deleteIncomeArrangementRows, deleteAssetRecordRows, getAllSmartContractAddrs
}
