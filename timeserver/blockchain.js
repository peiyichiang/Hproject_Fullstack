const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const timer = require('./api.js');
const moment = require('moment');

const { mysqlPoolQuery, setFundingStateDB, getFundingStateDB, setTokenStateDB, getTokenStateDB } = require('./mysql.js');

const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateTimeOfOrders = 1000;
const maxMintAmountPerRun = 100;

//-----------------==Copied from routes/Contracts.js
/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
console.log('loading blockchain.js smart contract json files');
const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

const TokenController = require('../ethereum/contracts/build/TokenController.json');
const CrowdFunding = require('../ethereum/contracts/build/CrowdFunding.json');
const HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
const IncomeManager = require('../ethereum/contracts/build/IncomeManagerCtrt.json');

//const heliumContractAddr = "0x7E5b6677C937e05db8b80ee878014766b4B86e05";
//const registryContractAddr = "0xcaFCE4eE56DBC9d0b5b044292D3DcaD3952731d8";
//const productManagerContractAddr = "0x96191257D876A4a9509D9F86093faF75B7cCAc31";


//-------------------==Crowdfunding
const getFundingStateCFC = async (crowdFundingAddr) => {
  console.log('[getFundingStateCFC] crowdFundingAddr', crowdFundingAddr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('fundingState', fundingState, 'crowdFundingAddr', crowdFundingAddr);
  //console.log('typeof fundingState', typeof fundingState);
}

const updateFundingStateCFC = async (crowdFundingAddr, timeCurrent) => {
  console.log('\n[updateFundingStateCFC] crowdFundingAddr', crowdFundingAddr, 'timeCurrent', timeCurrent);
  const inst_crowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const encodedData = inst_crowdFunding.methods.updateState(timeCurrent).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let fundingState = await inst_crowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('\nfundingState:', fundingState);
  console.log('crowdFundingAddr', crowdFundingAddr);
  return fundingState;
}


//-----------------==TokenController
const getTokenStateTCC = async (tokenControllerAddr) => {
  console.log('[getFundingStateCFC] tokenControllerAddr', tokenControllerAddr);
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
  console.log('tokenState', tokenState, 'tokenControllerAddr', tokenControllerAddr);
  //console.log('typeof tokenState', typeof tokenState);
}

const updateTokenStateTCC = async (tokenControllerAddr, timeCurrent) => {
  console.log('\n[updateTokenStateTCC] tokenControllerAddr', tokenControllerAddr, 'timeCurrent', timeCurrent);
  const inst_tokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
    
  const encodedData = inst_tokenController.methods.updateState(timeCurrent).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let tokenState = await inst_tokenController.methods.tokenState().call({ from: backendAddr });
  console.log('\ntokenState:', tokenState);
  console.log('tokenControllerAddr', tokenControllerAddr);
  return tokenState;
}

const checkIMC_isSchGoodForRelease = async (incomemanagerAddr, timeCurrent) => {
  console.log('\n[checkIMC_isSchGoodForRelease] incomemanagerAddr', incomemanagerAddr, 'timeCurrent', timeCurrent);
  const inst_incomeManager = new web3.eth.Contract(IncomeManager.abi, incomeManagerAddr);
  let isScheduleGoodForRelease = await inst_incomeManager.methods.isScheduleGoodForRelease(timeCurrent).call({ from: backendAddr });
  console.log('\nisScheduleGoodForRelease:', isScheduleGoodForRelease);
  console.log('incomemanagerAddr', incomemanagerAddr);
  return isScheduleGoodForRelease;
}

//getContractDetails()
const getDetailsCFC = async (crowdFundingAddr) => {
  console.log('[getDetailsCFC] crowdFundingAddr', crowdFundingAddr);
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


//-------------------------==
const breakdownArrays = (toAddressArray, amountArray) => {
  console.log('\n-----------------==\ninside breakdownArrays: amountArray', amountArray, '\ntoAddressArray', toAddressArray);

  if(toAddressArray.length !== amountArray.length){
    console.log('amountArray and toAddressArray should have the same length!');
    return;
  }

  console.log('for loop...');
  const amountArrayOut = [];
  const toAddressArrayOut = [];
  for (let idx = 0; idx < amountArray.length; idx++) {
    const amount = parseInt(amountArray[idx]);
    console.log('idx', idx, ', amount', amount);

    if(amount > maxMintAmountPerRun){
      const quotient = Math.floor(amount / maxMintAmountPerRun);
      const remainder = amount - maxMintAmountPerRun * quotient;
      const subAmountArray = Array(quotient).fill(maxMintAmountPerRun);
      subAmountArray.push(remainder);
      amountArrayOut.push(...subAmountArray);

      const subToAddressArray = Array(subAmountArray.length).fill(toAddressArray[idx]);
      toAddressArrayOut.push(...subToAddressArray);
      //amountArrayOut.splice(amountArrayOut.length, 0, ...subAmountArray);
    } else {
      amountArrayOut.push(amount);
      toAddressArrayOut.push(toAddressArray[idx]);
    }
    console.log('amountArrayOut', amountArrayOut);
    console.log('toAddressArrayOut', toAddressArrayOut);
  }
  return [toAddressArrayOut, amountArrayOut];
}

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function asyncForEachBasic(arrayBasic, callback) {
  console.log("arrayBasic:"+arrayBasic);
  for (let idxBasic = 0; idxBasic < arrayBasic.length; idxBasic++) {
    console.log("idxBasic:"+idxBasic, arrayBasic[idxBasic]);
    await callback(arrayBasic[idxBasic], idxBasic, arrayBasic);
  }
}
async function asyncForEachSuper(array1, array2, callback) {
  console.log("inside asyncForEachSuper. array1", array1, "array2:", array2);
  if(array1.length === array2.length){
    for (let idxSuper = 0; idxSuper < array1.length; idxSuper++) {
      console.log("idxSuper:", idxSuper, array1[idxSuper], array2[idxSuper]);
      await callback(array1[idxSuper], array2[idxSuper], idxSuper);
    }
  } else {
    console.log('[Error] array1 and array2 should be of the same length');
  }
}

const sequentialRunSuperCheck = async (toAddressArray, amountArray, tokenCtrtAddr) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n------==inside sequentialRunSuperCheck()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
    const checkItem =(item) => Number.isInteger(item);
    if(!amountArray.every(checkItem)){
      console.log('[error @ sequentialRunSuperCheck()] amountArray has non integer item');
      return;
    }

    const isCorrectAmountArray = [];
    const inst_HCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, tokenCtrtAddr);

    await asyncForEachSuper(toAddressArray, amountArray, async (toAddress, amountStr) => {
      console.log(`\n--------------==next: ${toAddress} should have ${amountStr} tokens`);
      const tokenBalanceAfterMinting = await inst_HCAT721.methods.balanceOf(toAddress).call();
      isCorrectAmountArray.push(parseInt(amountStr) === tokenBalanceAfterMinting);

      console.log('SequentialRunSuperCheck/asyncForEachSuper() is paused for waiting', waitTimeSuperCheck, 'miliseconds');
    });

    console.log('\n--------------==Done SequentialRunSuperCheck()');
    console.log('[Completed] All of the investor list has been cycled through');
    return isCorrectAmountArray;
    //resolve(isCorrectAmountArray);
  //});
}

const sequentialRunSuper = async(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr) => {
  console.log('\n----------------------==sequentialRunSuper()');
  const currentTime = await timer.getTime();
  console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, acquired currentTime: ${currentTime}`);
  const inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
  //async function asyncForEachSuper(array1, array2, callback) {}
  await asyncForEachSuper(toAddressArrayOut, amountArrayOut, async (toAddress, amount) => {
    console.log(`\n-----------==next: mint to ${toAddress} ${amount} tokens`);

    const encodedData = inst_HCAT721.methods.mintSerialNFT(toAddress, amount, price, fundingType, currentTime).encodeABI();
    const TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData).catch((err) => console.log('\n[Error @ signTx()]', err));
    console.log('TxResult', TxResult);
  });
  console.log('\n--------------==Done sequentialRunSuper()');
  console.log('[Completed] All of the investor list has been cycled through');
}

const sequentialRunSuperFn = async (toAddressArray, amountArray, tokenCtrtAddr, fundingType, price) => {

  console.log('\n----------------------==inside sequentialRunSuperFn()... going to get each toAddress...');
  //const waitTimeSuper = 13000;
  //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
  checkItem =(item) => Number.isInteger(item);
  if(!amountArray.every(checkItem)){
    reject('amountArray has non integer item');
  }

  const [toAddressArrayOut, amountArrayOut] = breakdownArrays(toAddressArray, amountArray);
  //console.log(`toAddressArray: ${toAddressArray}, amountArray: ${amountArray}
  //toAddressArrayOut: ${toAddressArrayOut}, amountArrayOut: ${amountArrayOut}`);
  await sequentialRunSuper(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr).catch((err) => {
    console.log('[Error @ sequentialRunSuper]', err);
    return;
  });

  console.log('\n--------------==after minting tokens, check balances now...');
  const isCorrectAmountArray = await sequentialRunSuperCheck(toAddressArray, amountArray, tokenCtrtAddr).catch((err) => {
    console.log('[Error @ sequentialRunSuperCheck]', err);
  });
  const isFailed = isCorrectAmountArray.includes(false);
  console.log('\n--------------==Done sequentialRunSuperCheck()');
  console.log('isFailed', isFailed, 'isCorrectAmountArray', isCorrectAmountArray);
  return [isFailed, isCorrectAmountArray];
  //resolve(isFailed, isCorrectAmountArray);
}


const sequentialRun = async (mainInputArray, waitTime, timeCurrent, extraInputArray) => {
  console.log('\n----------==inside sequentialRun()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, timeCurrent= ${timeCurrent}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(timeCurrent)){
    console.log('[Error] timeCurrent is not an integer. timeCurrent:', timeCurrent);
  }
  const actionType = extraInputArray[0];
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return;
  }
  if(waitTime < 5000 && actionType !== 'updateTimeOfOrders'){
    console.log('[Warning] waitTime is < min 5000, which is determined by the blockchain block interval time');
    return;
  }
  //console.log('actionType:', actionType);
  let sqlColumn;
  switch(actionType) {
    case 'crowdfunding':
      sqlColumn = 'sc_crowdsaleaddress';
      break;
    case 'tokencontroller':
      sqlColumn = 'sc_erc721Controller';
      break;
    case 'incomemanager':
      sqlColumn = 'sc_incomeManagementaddress';
      break;
    case 'updateTimeOfOrders':
    case 'mintTokenToEachBatch':
      sqlColumn = '';
      break;
    default:
      //console.log('[Error] actionType is not valid:', actionType);
      return;
  }

  await asyncForEachBasic(mainInputArray, async (item) => {
    let symbol;
    if(item.hasOwnProperty('p_SYMBOL')){
      symbol = item.p_SYMBOL;

    } else if(item.hasOwnProperty('ia_SYMBOL')){
      symbol = item.ia_SYMBOL;

    } else if(actionType === 'mintTokenToEachBatch' && Number.isInteger(item) && extraInputArray.length === 5){
      symbol = 'Backend_mintToken_each_batch';
      console.log('item is an integer => mintTokenToEachBatch mode');

    } else if(actionType === 'updateTimeOfOrders'){
      symbol = 'Backend_updateTime';
    }

    console.log('\n--------------==next symbol:', symbol);
    if (symbol === undefined || symbol === null || symbol.length < 18){
      console.log(`[Error] symbol not valid. actionType: ${actionType}, symbol: ${symbol}`);

    } else {

      if(actionType === 'mintTokenToEachBatch') {
        const amountToMint = item;
        const tokenCtrtAddr = extraInputArray[1];
        let toAddress = extraInputArray[2];
        let fundingType = extraInputArray[3];
        let price = extraInputArray[4];
        console.log(`to call mintToken(): amountToMint: ${amountToMint}, tokenCtrtAddr: ${tokenCtrtAddr}, toAddress: ${toAddress}, fundingType: ${fundingType}, price: ${price}`);
        await mintToken(amountToMint, tokenCtrtAddr, toAddress, fundingType, price);
        // see the above function defined below...

      } else if(actionType === 'updateTimeOfOrders'){
        const oid = item.o_id;
        const oPurchaseDate = item.o_purchaseDate;
        if(oPurchaseDate.length < 6){
          console.log('[Error] oPurchaseDate length is not 12');
          return;
        }
        try {
          const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
          const timeCurrentM = moment(timeCurrent, ['YYYYMMDD']);
          //console.log('timeCurrentM', timeCurrentM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
          if (timeCurrentM >= oPurchaseDateM.add(3, 'days')) {
            console.log('timeCurrent is found >= oPurchaseDate');
            mysqlPoolQuery('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [oid], function (err, result) {
              if (err) {
                console.log(`\n[Error] Failed at setting order table o_paymentStatus to expired at orderId = ${oid}, err: ${err}`);
              } else {
                  print(`\n[Success] the status of oid ${oid} has been updated to expired. result: ${result}`);
              }
            });
          }
        } catch (error) {
            print(`\n[Error] the purchaseDate ${oPurchaseDate} is of invalid format. order id: ${oid}, error: ${error}`);
        }

      } else {
        //send time to contracts to see the result of determined state: e.g. fundingState, tokenState, ...
        mysqlPoolQuery('SELECT '+sqlColumn+' FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
          if (err) {
              console.log(`[Error] @ getting ${actionType} addr from symbol:`,err);
  
            } else if(DBresult.length == 0){
            console.log('found symbol(s) is/are not found in the smart contract table');
  
          } else {
            console.log('targetAddr is going to be defined next... DBresult:', DBresult);
            let targetAddr = DBresult[0][sqlColumn];
            //let targetAddr = DBresult[0].sc_crowdsaleaddress;
            console.log(`\n${actionType} addr is found for`, symbol, targetAddr);
            //return;
  
            writeToBlockchainAndDatabase(targetAddr, timeCurrent, symbol, actionType);
            console.log('[Success] writingToBlockchainAndDatabase() is completed');
          }
        });
      }
    }
    console.log('SequentialRun/asyncForEachBasic() is paused for waiting', waitTime, 'miliseconds');
    await waitFor(waitTime);
  });
  console.log('\n--------------==Done');
  console.log('SequentialRun() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  console.log('inside mintToken()');
  await timer.getTime().then(async function (currentTime) {
    //console.log('blockchain.js: mintToken(), timeCurrent:', currentTime);
    console.log('acquired currentTime', currentTime);
    const inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    let encodedData = inst_HCAT721.methods.mintSerialNFT(to, amountToMint, price, fundingType, currentTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData);
    //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
    console.log('TxResult', TxResult);
  });
}


// HHtoekn12222  Htoken001  Htoken0030
//-------------------------------==DB + BC
//-------------------==updateCFC
const updateCFC = async (timeCurrent) => {
  console.log('\ninside updateCFC(), timeCurrent:', timeCurrent, 'typeof', typeof timeCurrent);
  if(!Number.isInteger(timeCurrent)){
    console.log('[Error] timeCurrent should be an integer');
    return;
  }
  const pstate1 = "initial";
  const pstate2 = "funding";
  const pstate3 = "fundingGoalReached";
  mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = ? AND p_CFSD <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+')', [pstate1, pstate2, pstate3], function (err, symbolArray) {
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateCFC:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (symbolArrayLen > 0) {
      sequentialRun(symbolArray, timeIntervalOfNewBlocks, timeCurrent, ['crowdfunding']);
    }
  });
}

//-------------------==Token Controller
const updateTCC = async (timeCurrent) => {
  console.log('\ninside updateTCC(), timeCurrent:', timeCurrent, 'typeof', typeof timeCurrent);
  if(!Number.isInteger(timeCurrent)){
    console.log('[Error] timeCurrent should be an integer');
    return;
  }

  mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE p_lockuptime <= ? OR p_validdate <= ?', [timeCurrent, timeCurrent], function (err, symbolArray) {
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateTCC:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (symbolArrayLen > 0) {
      sequentialRun(symbolArray, timeIntervalOfNewBlocks, timeCurrent, ['tokencontroller']);
    }
  });
}

const writeToBlockchainAndDatabase = async (targetAddr, timeCurrent, symbol, actionType) => {
  if(actionType === 'crowdfunding'){
    const fundingStateStr = await updateFundingStateCFC(targetAddr, timeCurrent);
    console.log('fundingState', fundingStateStr, 'typeof', typeof fundingStateStr);
    const fundingState = parseInt(fundingStateStr);
    /* 0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 
       4 fundingClosed, 5 fundingNotClosed, 6 terminated}*/
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

  } else if(actionType === 'tokencontroller'){
    console.log('\n-----------------=inside writeToBlockchainAndDatabase(), actionType: tokencontroller');
    const tokenStateStr = await updateTokenStateTCC(targetAddr, timeCurrent);
    console.log('tokenState', tokenStateStr, 'typeof', typeof tokenStateStr);
    const tokenState = parseInt(tokenStateStr);
    // lockupPeriod, normal, expired
    switch(tokenState) {
      case 0:
        setTokenStateDB(symbol, 'lockupPeriod', undefined, undefined);
        break;
      case 1:
        setTokenStateDB(symbol, 'normal', undefined, undefined);
        break;
      case 2:
        setTokenStateDB(symbol, 'expired', undefined, undefined);
        break;
      default:
        setTokenStateDB(symbol, 'undefined', undefined, undefined);
    }

  } else if(actionType === 'incomemanager'){
    const isScheduleGoodForRelease = await checkIMC_isSchGoodForRelease(targetAddr, timeCurrent);
    console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);
    if(isScheduleGoodForRelease){
      /**
       * Call bank to release income to customers
       * Get banks' resultArray: actualPaymentTime, actualPaymentAmount or error code 
       * NOT FOR for each token owner... one result for each schedule index!
       * Write that result into DB: 
       * too long name: ia_single_Forecasted_Payable_Income_in_the_Period, ia_single_Actual_Income_Payment_in_the_Period... actualPaymentTime?
       * Write that result into BC below...
       */
      const inst_incomeManager = new web3.eth.Contract(IncomeManager.abi, targetAddr);

      //for loop for each token owner(bankResult) => {}
      const actualPaymentTime = 0;//bankResult.paymentDateTime
      const actualPaymentAmount = 0;//bankResult.paymentAmount
      const errorCode = 0;//bankResult.paymentError

      //write bank's confirmation into IncomeManager.sol
      let encodedData = inst_incomeManager.methods.setPaymentReleaseResults(timeCurrent, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, targetAddr, encodedData);
      console.log('TxResult', TxResult);

      //const scheduleDetails = await inst_incomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
      //console.log('[Success @ updateIncomeManager(timeCurrent)] scheduleDetails:', scheduleDetails);

    } else {
      console.log('[Error] date is found as an incomeManager date in DB but not such in IncomeManager.sol!!! isScheduleGoodForRelease:', isScheduleGoodForRelease);
    }
  }
  console.log('end of writeToBlockchainAndDatabase() for', symbol, 'actionType:', actionType);
}

//-------------------==Income Manager
const isScheduleGoodIMC = async (timeCurrent) => {
  console.log('\ninside isScheduleGoodIMC(), timeCurrent:', timeCurrent, 'typeof', typeof timeCurrent);
  if(!Number.isInteger(timeCurrent)){
    console.log('[Error] timeCurrent should be an integer');
    return;
  }
  //let payableTime = ia_time; 
  //let payableAmount = ia_Payable_Period_End;
  //'SELECT htoken.income_arrangement.ia_SYMBOL,htoken.income_arrangement.ia_time , htoken.income_arrangement.ia_Payable_Period_End From htoken.income_arrangement where income_arrangement.ia_time = ?'
  mysqlPoolQuery(
    'SELECT htoken.income_arrangement.ia_SYMBOL From htoken.income_arrangement where income_arrangement.ia_time <= ?',[timeCurrent], function (err, resultArray) {
    const resultArrayLen = resultArray.length;
    console.log('symbolArray length @ isScheduleGoodIMC', resultArrayLen);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (resultArrayLen > 0) {
      sequentialRun(resultArrayLen, timeIntervalOfNewBlocks, timeCurrent, ['incomemanager']);
    }
  });
}

//-----------------------==
const updateTimeOfOrders = async (timeCurrent) => {
  console.log('\ninside updateTimeOfOrders(), timeCurrent:', timeCurrent, 'typeof', typeof timeCurrent);
  if(!Number.isInteger(timeCurrent)){
    console.log('[Error] timeCurrent should be an integer');
    return;
  }

  mysqlPoolQuery('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, resultArray) {
    const resultArrayLen = resultArray.length;
    console.log('\nArray length @ updateTimeOfOrders:', resultArrayLen, ', order_id and purchaseDate:', resultArray);

    // const oidArray = [], purchaseDateArray = [];
    // for (let i = 0; i < resultArray.length; i++) {
    //   oidArray.push(resultArray[i].o_id);
    //   purchaseDateArray.push(resultArray[i].o_purchaseDate);
    // }
  
    if (err) {
      console.log('[Error] @ searching o_id and o_purchaseDate:', err);
    } else if (resultArrayLen > 0) {
      sequentialRun(resultArray, timeIntervalUpdateTimeOfOrders, timeCurrent, ['updateTimeOfOrders']);
    }
  });
}



/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr)
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
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

              //console.log('☆ RAW TX ☆\n', rawTx);

              web3.eth.sendSignedTransaction(rawTx)
                  .on('transactionHash', hash => {
                      //console.log(hash);
                  })
                  .on('confirmation', (confirmationNumber, receipt) => {
                      // //console.log('confirmation', confirmationNumber);
                  })
                  .on('receipt', function (receipt) {
                      //console.log(receipt);
                      resolve(receipt)
                  })
                  .on('error', function (err) {
                      //console.log(err);
                      reject(err);
                  });
          });

  });
}


//------------------------==
async function sendTimeCFctrt(addr, time) {
    /*use admin EOA to sign transaction*/
    let CrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addr);
    let encodedData = CrowdFunding.methods.setServerTime(time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, addr, encodedData);

    return result;
}

function print(s) {
  console.log('[timeserver/lib/blockchain.js] ' + s)
}

module.exports = {
  updateTimeOfOrders, getDetailsCFC, sequentialRun, sequentialRunSuper, sequentialRunSuperCheck,
  breakdownArrays, sequentialRunSuperFn,
  getFundingStateCFC, updateFundingStateCFC, updateCFC, 
  getTokenStateTCC, updateTokenStateTCC, updateTCC, 
  isScheduleGoodIMC
}
