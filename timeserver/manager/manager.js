const path = require('path');
const fs = require('fs');
const net = require("net");
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
//const PrivateKeyProvider = require("truffle-privatekey-provider");

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
              console.log(`[DB connection sussessful @ timeserver manager.js]`);
          });
          // release connection。
          // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
          conn.release();
      }
  });
};

// const { mysqlPoolQuery, getCrowdFundingCtrtAddr,
//     getIncomeManagerCtrtAddr, getOrderDate,
//     getHCAT721ControllerCtrtAddr,
//     setOrderExpired, setCrowdFundingState } = require('../lib/mysql.js');
// const { sendTimeTokenController, sendTimeCFctrt, sendTimeIMctrt } = require('../lib/contractAPI.js');

const portForIncomingTime = 7010;
let currentCount = 0;
const maxCount = 10;// time period in minutes

//-----------------==Copied from routes/Contracts.js
/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

const tokenControllerContract = require('../../ethereum/contracts/build/TokenController.json');
const crowdFundingContract = require('../../ethereum/contracts/build/CrowdFunding.json');
const HCAT721_AssetTokenContract = require('../../ethereum/contracts/build/HCAT721_AssetToken.json');
const incomeManagerContract = require('../../ethereum/contracts/build/IncomeManagerCtrt.json');
//-----------------==

createServer();
// if(currentCount < maxCount+1){
//   console.log('[timeserver] currentCount', currentCount);
//   currentCount++;
// } else {
//   currentCount = 1;
//   print('[timeserver] currentCount', currentCount);
// }

function createServer() {
    const server = net.createServer(c => {
        console.log('\ninside net.createServer');

        c.on("data", (timeCurrent) => {
            fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), timeCurrent, function (err) {
                if (err) console.error(`寫入時間失敗`);
            })
            print(timeCurrent);
            checkTimeOfOrder(timeCurrent.toString());
            updateCrowdFunding(timeCurrent.toString());
            //updateTokenController(timeCurrent.toString());
            //checkIncomeManager(timeCurrent.toString());
        });

        c.on("end", () => {
            print("end");
        });
        c.pipe(c);

    });

    server.on('error', (err) => {
        throw err;
    });
    server.listen(portForIncomingTime, () => {
        print(`server bound`);
      });
}


function updateCrowdFunding(timeCurrent){
  console.log('inside updateCrowdFunding(), timeCurrent:', timeCurrent);
  let pstate1 = "initial";
  let pstate2 = "funding";
  let pstate3 = "fundingGoalReached";
  var qur = mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = ? AND p_CFSD <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+')', [pstate1, pstate2, pstate3], function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen);

    if (err) {
      console.log(err);

    } else if (resultLen != 0) {
      for (let i in result) {
        let symbol = result[i].p_SYMBOL;
        console.log('symbol to update state:', symbol);
        if (symbol === undefined || symbol === null || symbol.length <4){
          console.log('[Error @ updateCrowdFunding(timeCurrent)]: symbol is not valid', symbol);

        } else {
          mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
            if (err) {
                console.log(err);
            } else {
              let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
              console.log('crowdFunding address:', crowdFundingAddr);

              let inst_crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

              let encodedData = inst_crowdFunding.methods.updateState(currentTime).encodeABI();
              let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);

              let fundingState = await inst_crowdFunding.methods.fundingState().call({ from: backendAddr });
              console.log('[Success @ updateCrowdFunding(timeCurrent)] fundingState:', fundingState);
            }
          });

        }
      }
    }
  });
}

//
function updateTokenController(timeCurrent) {
  console.log('inside updateTokenController(), timeCurrent:', timeCurrent);

  var qur = mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE p_lockupperiod <= '+timeCurrent+' OR p_validdate <= '+timeCurrent, function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen);

    if (err) {
      console.log(err);

    } else if (resultLen != 0) {
      for (let i in result) {
        let symbol = result[i].p_SYMBOL;
        console.log('symbol to update state:', symbol);
        if (symbol === undefined || symbol === null || symbol.length <4){
          console.log('[Error @ updateTokenController(timeCurrent)]: symbol is not valid', symbol);

        } else {
          mysqlPoolQuery('SELECT sc_erc721Controller FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
            if (err) {
                console.log(err);
            } else {
              let tokenControllerAddr = DBresult[0].sc_erc721Controller;
              console.log('tokenControllerAddr', tokenControllerAddr);

              let inst_tokenController = new web3.eth.Contract(tokenControllerContract.abi, tokenControllerAddr);
  
              /*用後台公私鑰sign*/
              let encodedData = inst_tokenController.methods.updateState(currentTime).encodeABI();
              let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);

              let tokenState = await tokenController.methods.tokenState().call({ from: backendAddr });
              console.log('[Success @ updateTokenController(timeCurrent)] tokenState:', tokenState);
            }
          });
        }
      }
    }
  });
}


// "?time?"
function checkIncomeManager(timeCurrent) {
  console.log('inside updateIncomeManager(), timeCurrent:', timeCurrent);

  var qur = mysqlPoolQuery(
    'SELECT htoken.income_arrangement.ia_SYMBOL,htoken.income_arrangement.ia_time , htoken.income_arrangement.ia_Payable_Period_End From htoken.income_arrangement where income_arrangement.ia_time=?',[timeCurrent], function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen);

    if (err) {
      console.log(err);

    } else if (resultLen != 0) {
      for (let i in result) {
        let symbol = result[i].ia_SYMBOL;
        let iatime = ia_time; 
        let isPayableTime = ia_Payable_Period_End;
        console.log('symbol to update state:', symbol);
        if (symbol === undefined || symbol === null || symbol.length <4){
          console.log('[Error @ updateIncomeManager(timeCurrent)]: symbol is not valid => Not an incomeManager schedule, symbole:', symbol);

        } else {
          mysqlPoolQuery('SELECT sc_incomeManagementaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
            if (err) {
                console.log(err);
            } else {
              let incomeManagerAddr = DBresult[0].sc_incomeManagementaddress;
              console.log('incomeManagerAddr', incomeManagerAddr);

              let inst_incomeManager = new web3.eth.Contract(incomeManagerContract.abi, incomeManagerAddr);

              let isScheduleGoodForRelease = await inst_incomeManager.methods.isScheduleGoodForRelease(currentTime).call({ from: backendAddr });

              if(isScheduleGoodForRelease){
                console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);

                /**
                 * Call bank to release income to customers
                 * Get banks' result: success or failure code
                 */
                const schIndex = await incomeManager.methods.getSchIndex(timeCurrent).call({ from: backendAddr });

                const actualPaymentTime = 0;//bankResult.paymentDateTime
                const actualPaymentAmount = 0;//bankResult.paymentAmount
                const errorCode = 0;//bankResult.paymentError

                //write bank's confirmation into IncomeManager.sol
                let encodedData = inst_incomeManager.methods.setPaymentReleaseResults(schIndex, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, incomeManagerAddr, encodedData);

                const scheduleDetails = await incomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
                console.log('[Success @ updateIncomeManager(timeCurrent)] scheduleDetails:', scheduleDetails);
              } else {
                console.log('[Error] date is found as an incomeManager date in DB but not such in IncomeManager.sol!!! isScheduleGoodForRelease:', isScheduleGoodForRelease);
              }
            }
          });
        }
      }
    }
  });
}

//    pool.query('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, rows) {
function checkTimeOfOrder(timeCurrent) {
  console.log('inside checkTimeOfOrder(), timeCurrent:', timeCurrent);

  var qur = mysqlPoolQuery('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen);

    if (err) {
      console.log(err);

    } else if (resultLen != 0) {
      for (let i in result) {
        let symbol = result[i].ia_SYMBOL;
        console.log('symbol to update state:', symbol);
        if (symbol === undefined || symbol === null || symbol.length <4){
          console.log('[Error @ checkTimeOfOrder(timeCurrent)]: symbol is not valid => Not an incomeManager schedule, symbole:', symbol);

        } else {
          try {
            if (parseInt(timeCurrent) >= result[i].o_purchaseDate.add3Day()) {
              mysqlPoolQuery('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [result[i].o_id], function (err, result) {
                if (err) {
                  console.log(err);
                } else {
                    print(result[i].o_id + " 已修改");
                }
              });
            }
          } catch (error) {
              print(result[i].o_purchaseDate + " invalid format");
          }
        }
      }
    }
  });
}



Object.prototype.add3Day = function () {
    let year = parseInt(this.toString().slice(0, 4));
    let month = parseInt(this.toString().slice(4, 6));
    let day = parseInt(this.toString().slice(6, 8));
    let hour = parseInt(this.toString().slice(8, 10));
    let minute = parseInt(this.toString().slice(10, 12));
    return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}

/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr)
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              console.log('userPrivateKey:', userPrivateKey);
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: 9000000,
                  gasPrice: 0,
                  //gasPrice: web3js.utils.toHex(20 * 1e9),
                  //gasLimit: web3.utils.toHex(3400000),
                  to: contractAddr,
                  value: 0,
                  data: encodedData
              }

              let tx = new Tx(txParams);
              tx.sign(userPrivateKey);
              const serializedTx = tx.serialize();
              const rawTx = '0x' + serializedTx.toString('hex');

              console.log('☆ RAW TX ☆\n', rawTx);

              web3.eth.sendSignedTransaction(rawTx)
                  .on('transactionHash', hash => {
                      console.log(hash);
                  })
                  .on('confirmation', (confirmationNumber, receipt) => {
                      // console.log('confirmation', confirmationNumber);
                  })
                  .on('receipt', function (receipt) {
                      console.log(receipt);
                      resolve(receipt)
                  })
                  .on('error', function (err) {
                      console.log(err);
                      reject(err);
                  })
          })

  })
}

function print(s) {
    console.log('[timeserver/manager/manager.js] ' + s)
}