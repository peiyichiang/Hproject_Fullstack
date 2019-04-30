const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
//const PrivateKeyProvider = require("truffle-privatekey-provider");

const { mysqlPoolQuery, setFundingStateDB, getFundingStateDB } = require('./mysql.js');

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

const TokenController = require('../../ethereum/contracts/build/TokenController.json');
const CrowdFunding = require('../../ethereum/contracts/build/CrowdFunding.json');
const HCAT721 = require('../../ethereum/contracts/build/HCAT721_AssetToken.json');
const IncomeManager = require('../../ethereum/contracts/build/IncomeManagerCtrt.json');

const heliumContractAddr = "0x7E5b6677C937e05db8b80ee878014766b4B86e05";
const registryContractAddr = "0xcaFCE4eE56DBC9d0b5b044292D3DcaD3952731d8";
const productManagerContractAddr = "0x96191257D876A4a9509D9F86093faF75B7cCAc31";


//-----------------==
const getCFC_fundingState = async (crowdFundingAddr) => {
  console.log('[getCFC_fundingState] crowdFundingAddr', crowdFundingAddr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('fundingState', fundingState, 'crowdFundingAddr', crowdFundingAddr);
}

const updateCFC_fundingState = async (crowdFundingAddr, timeCurrent) => {
  console.log('[updateCFC_fundingState] crowdFundingAddr', crowdFundingAddr, 'timeCurrent', timeCurrent);
  const inst_crowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const encodedData = inst_crowdFunding.methods.updateState(timeCurrent).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let fundingState = await inst_crowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('\nfundingState:', fundingState);
  console.log('crowdFundingAddr', crowdFundingAddr);
  return fundingState;
}

//getContractDetails()
const getCFC_Details = async (crowdFundingAddr) => {
  console.log('[getCFC_Details] crowdFundingAddr', crowdFundingAddr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  //let stateDescription = await instCrowdFunding.methods.stateDescription().call({ from: backendAddr })
  //let quantityGoal = await instCrowdFunding.methods.quantityGoal().call({ from: backendAddr })
  //let maxTotalSupply = await instCrowdFunding.methods.maxTotalSupply().call({ from: backendAddr })
  //let quantitySold = await instCrowdFunding.methods.quantitySold().call({ from: backendAddr })
  let CFSD2 = await instCrowdFunding.methods.CFSD2().call({ from: backendAddr })
  let CFED2 = await instCrowdFunding.methods.CFED2().call({ from: backendAddr })
  console.log('fundingState', fundingState, 'CFSD2', CFSD2, 'CFED2', CFED2);
}


// HHtoekn12222  Htoken001  Htoken0030
//-----------------==DB + BC
const updateCrowdFunding = async (timeCurrent) => {
  console.log('\ninside updateCrowdFunding(), timeCurrent:', timeCurrent);
  const pstate1 = "initial";
  const pstate2 = "funding";
  const pstate3 = "fundingGoalReached";
  mysqlPoolQuery(//how to fix this to be async func??? so I can use 'await'
    'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = ? AND p_CFSD <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+')', [pstate1, pstate2, pstate3], function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen, ', result:', result);

    if (err) {
      console.log(err);

    } else if (resultLen != 0) {

      async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }
      await asyncForEach(result, async (resultX) => {
        await waitFor(10000);
        console.log(resultX);
        const symbol = resultX.p_SYMBOL;
        //const symbol = result[i].p_SYMBOL;
        console.log('\nsymbol to update state:', symbol);
        if (symbol === undefined || symbol === null || symbol.length <4){
          console.log('[Error @ updateCrowdFunding(timeCurrent)]: symbol is not valid', symbol);

        } else {
          //send time to CFC to see the result of fundingState
          mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
            if (err) {
                console.log(err);
            } else {
              let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
              console.log('\ncrowdFundingAddr is found for', symbol, crowdFundingAddr);
              //return;

              setTimeout(writeToBlockchain, 10000, crowdFundingAddr, timeCurrent, symbol);
              console.log('[Success] updateCrowdFunding() is completed');

            }
          });
        }
      });
      console.log('--------------==Done');

      //for (let i in result) {

      //}

    }
  });
}
const writeToBlockchain = async (crowdFundingAddr, timeCurrent, symbol) => {
  const fundingState = await updateCFC_fundingState(crowdFundingAddr, timeCurrent);

  /*enum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}
   */
  switch(fundingState) {
    case 0:
      setFundingStateDB(symbol, 'initial', undefined, undefined);
      break;
    case 1:
      setFundingStateDB(symbol, 'funding', undefined, undefined);
      break;
    case 2:
      setFundingStateDB(symbol, 'fundingPaused', undefined, undefined);
      break;
    case 3:
      setFundingStateDB(symbol, 'fundingGoalReached', undefined, undefined);
      break;
    case 4:
      setFundingStateDB(symbol, 'fundingClosed', undefined, undefined);
      break;
    case 5:
      setFundingStateDB(symbol, 'fundingNotClosed', undefined, undefined);
      break;
    case 6:
      setFundingStateDB(symbol, 'terminated', undefined, undefined);
      break;
    default:
      setFundingStateDB(symbol, 'undefined', undefined, undefined);
  }
  console.log('[writeToBlockchain]', symbol);
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

              let inst_tokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  
              /*用後台公私鑰sign*/
              let encodedData = inst_tokenController.methods.updateState(timeCurrent).encodeABI();
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

              let inst_incomeManager = new web3.eth.Contract(IncomeManager.abi, incomeManagerAddr);

              let isScheduleGoodForRelease = await inst_incomeManager.methods.isScheduleGoodForRelease(timeCurrent).call({ from: backendAddr });

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



//------------------------==
function sendTimeIMctrt(addr, time) {
    let contract = new web3.eth.Contract(IncomeManagement.abi, addr);
    return contract.methods.getIncomeSchedule(time)
        .call()
        .then(function (result) {
            return `${addr} success`
        })
        .catch(function (error) {
            return `${addr} fail`
        })
}

async function sendTimeCFctrt(addr, time) {
    /*use admin EOA to sign transaction*/
    let CrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addr);
    let encodedData = CrowdFunding.methods.setServerTime(time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, addr, encodedData);

    return result;
}

function sendTimeTokenController(addr, time) {
    return web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(TokenController.abi, addr);
            return contract.methods.setTimeCurrent(time)
                .send({
                    from: accounts[0],
                    gasPrice: 0
                })
        })
        .then(function (result) {
            return `${addr} success`
        })
        .catch(function (error) {
            return `${addr} fail`
        })
}


function print(s) {
  console.log('[timeserver/lib/blockchain.js] ' + s)
}

module.exports = {
  checkTimeOfOrder, updateCrowdFunding, updateTokenController, checkIncomeManager,
  updateCFC_fundingState, getCFC_fundingState, getCFC_Details
}
