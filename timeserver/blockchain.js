const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const moment = require('moment');

const { getTime, isEmpty, asyncForEach } = require('./utilities');
const { TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA } = require('../ethereum/contracts/zsetupData');

const { mysqlPoolQuery, setFundingStateDB, getFundingStateDB, setTokenStateDB, getTokenStateDB, addAssetRecordsIntoDB, mysqlPoolQueryB } = require('./mysql.js');

const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateExpiredOrders = 1000;

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

// const choiceOfHCAT721 = 2;
// if(choiceOfHCAT721===1){
//   console.log('use HCAT721_Test!!!');
//   HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken_Test.json');
// } else if(choiceOfHCAT721===2){
//   console.log('use HCAT721');
//   HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
// }

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

const updateFundingStateCFC = async (crowdFundingAddr, serverTime) => {
  console.log('\n[updateFundingStateCFC] crowdFundingAddr', crowdFundingAddr, 'serverTime', serverTime);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
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

const updateTokenStateTCC = async (tokenControllerAddr, serverTime) => {
  console.log('\n[updateTokenStateTCC] tokenControllerAddr', tokenControllerAddr, 'serverTime', serverTime);
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
    
  const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
  console.log('\ntokenState:', tokenState);
  console.log('tokenControllerAddr', tokenControllerAddr);
  return tokenState;
}

const checkIMC_isSchGoodForRelease = async (incomemanagerAddr, serverTime) => {
  console.log('\n[checkIMC_isSchGoodForRelease] incomemanagerAddr', incomemanagerAddr, 'serverTime', serverTime);
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeManagerAddr);
  let isScheduleGoodForRelease = await instIncomeManager.methods.isScheduleGoodForRelease(serverTime).call({ from: backendAddr });
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
const breakdownArrays = (toAddressArray, amountArray, maxMintAmountPerRun) => {
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
      if(remainder > 0){ subAmountArray.push(remainder); }
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


async function asyncForEachFilter(array, callback) {
  console.log("\n--------------==array:", array);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    console.log(`--------------==next in asyncForEachFilter()
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        console.log('Skipping symbol:', item.o_symbol);
        continue;
      } else {
        await callback(item, idx, array);
      }
    } else {
      await callback(item, idx, array);
    }
  }
}


const sequentialCheckBalances = async (toAddressArray, tokenCtrtAddr) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n------==inside sequentialCheckBalances()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);

    const balanceArrayBefore = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    await asyncForEachFilter(toAddressArray, async (toAddress) => {
      console.log(`\n--------------==next: check the balance of ${toAddress}`);
      const tokenBalanceBeforeMinting = await instHCAT721.methods.balanceOf(toAddress).call();
      balanceArrayBefore.push(parseInt(tokenBalanceBeforeMinting));
    });

    console.log('\n--------------==Done sequentialCheckBalances()');
    console.log('[Completed] All of the investor list has been cycled through');
    return balanceArrayBefore;
    //resolve(balanceArrayBefore);
  //});
}


const sequentialCheckBalancesAfter = async (toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n---------------==inside sequentialCheckBalancesAfter()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
    const checkItem =(item) => Number.isInteger(item);
    if(!amountArray.every(checkItem)){
      console.log('[error @ sequentialCheckBalancesAfter()] amountArray has non integer item');
      return;
    }
    if(!balanceArrayBefore.every(checkItem)){
      console.log('[error @ sequentialCheckBalancesAfter()] balanceArrayBefore has non integer item. \nbalanceArrayBefore:', balanceArrayBefore);
      return;
    }

    const isCorrectAmountArray = [];
    const balanceArrayAfter = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    const symbol_bytes32 = await instHCAT721.methods.symbol().call();
    const symbol = web3.utils.toAscii(symbol_bytes32);
    
    if(toAddressArray.length !== amountArray.length){
      console.log(`toAddressArray and amountArray must be of the same length`);
      return;
    }
    await asyncForEach(toAddressArray, async (toAddress, idx) => {
      const amount = amountArray[idx];
      const balanceBefore = balanceArrayBefore[idx];
      const tokenBalanceAfterMinting_ = await instHCAT721.methods.balanceOf(toAddress).call();
      const tokenBalanceAfterMinting = parseInt(tokenBalanceAfterMinting_);
      const increase = tokenBalanceAfterMinting - balanceBefore;
      const isCorrect = (parseInt(amount) === increase);
      isCorrectAmountArray.push(isCorrect);
      console.log(`
      balance: expected increase: ${amount} ... actual increase: ${increase} = ${tokenBalanceAfterMinting} - ${balanceBefore}
      typeof amount ${typeof amount} ...  typeof tokenBalanceAfterMinting ${typeof tokenBalanceAfterMinting}, typeof balanceBefore ${typeof balanceBefore}, isCorrect: ${isCorrect}`);
      balanceArrayAfter.push(tokenBalanceAfterMinting);
    });

    console.log('\n--------------==Done sequentialCheckBalancesAfter()');
    console.log('[Completed] All of the investor list has been cycled through');
    return [isCorrectAmountArray, balanceArrayAfter, symbol];
    //resolve(isCorrectAmountArray);
  //});
}


const sequentialMint = async(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr) => {
  console.log('\n----------------------==sequentialMint()');
  const serverTime = await getTime();
  console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, acquired serverTime: ${serverTime}`);
  const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

  if(toAddressArrayOut.length !== amountArrayOut.length){
    console.log(`toAddressArrayOut and amountArrayOut must be of the same length`);
    return;
  }
  await asyncForEach(toAddressArrayOut, async (toAddress, idx) => {
    const amount = amountArrayOut[idx];
    console.log(`\n-----------==next: mint to ${toAddress} ${amount} tokens`);

    const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amount, price, fundingType, serverTime).encodeABI();
    const TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData).catch((err) => console.log('\n[Error @ signTx()]', err));
    console.log('TxResult', TxResult);
  });
  console.log('\n--------------==Done sequentialMint()');
  console.log('[Completed] All of the investor list has been cycled through');
}


//to be called from API and zlivechain.js, etc...
const sequentialMintSuper = async (toAddressArray, amountArray, tokenCtrtAddr, fundingType, price, maxMintAmountPerRun) => {
  console.log('\n----------------------==inside sequentialMintSuper()...');
  //const waitTimeSuper = 13000;
  //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
  checkItem =(item) =>  Number.isInteger(item) && Number(item) > 0;
  if(!amountArray.every(checkItem)){
    console.log('amountArray has non integer or zero element');
    process.exit(1);
  }

  const [toAddressArrayOut, amountArrayOut] = breakdownArrays(toAddressArray, amountArray, maxMintAmountPerRun);
  //console.log(`toAddressArray: ${toAddressArray}, amountArray: ${amountArray}
  //toAddressArrayOut: ${toAddressArrayOut}, amountArrayOut: ${amountArrayOut}`);

  console.log('\n--------------==before minting tokens, check balances now...');
  const balanceArrayBefore = await sequentialCheckBalances(toAddressArray, tokenCtrtAddr);
  console.log('balanceArrayBefore', balanceArrayBefore);

  console.log('\n--------------==Minting tokens via sequentialMint()...');
  await sequentialMint(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr).catch((err) => {
    console.log('[Error @ sequentialMint]', err);
    return;
  });

  console.log('\n--------------==after minting tokens, check balances now...');
  const [isCorrectAmountArray, balanceArrayAfter, symbol] = await sequentialCheckBalancesAfter(toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore).catch((err) => {
    console.log('[Error @ sequentialCheckBalancesAfter]', err);
  });
  console.log('\n--------------==Done sequentialCheckBalancesAfter()');
  console.log('\nbalanceArrayBefore', balanceArrayBefore, '\nbalanceArrayAfter after', balanceArrayAfter);

  const isFailed = isCorrectAmountArray.includes(false);
  console.log('\nisFailed', isFailed, 'isCorrectAmountArray', isCorrectAmountArray);

  console.log('\n--------------==About to call addAssetRecordsIntoDB()');
  const serverTime = await getTime();//297
  const personal_income = 100;
  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const acquired_cost = 13000;
  const moving_ave_holding_cost = 13000;
  const [emailArrayError, amountArrayError] = await addAssetRecordsIntoDB(toAddressArray, amountArray, symbol, serverTime, personal_income, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost);

  return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError];
  //resolve(isFailed, isCorrectAmountArray);
}


//-----------------------------==
const sequentialRun = async (mainInputArray, waitTime, serverTime, extraInputArray) => {
  console.log('\n----------==inside sequentialRun()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, serverTime= ${serverTime}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime is not an integer. serverTime:', serverTime);
  }
  const actionType = extraInputArray[0];
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return;
  }
  if(waitTime < 5000 && actionType !== 'updateExpiredOrders'){
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
    case 'updateExpiredOrders':
    case 'mintTokenToEachBatch':
      sqlColumn = '';
      break;
    default:
      //console.log('[Error] actionType is not valid:', actionType);
      return;
  }

  await asyncForEachFilter(mainInputArray, async (item) => {
    let symbol;
    if(item.hasOwnProperty('p_SYMBOL')){
      symbol = item.p_SYMBOL;

    } else if(item.hasOwnProperty('ia_SYMBOL')){
      symbol = item.ia_SYMBOL;

    } else if(actionType === 'mintTokenToEachBatch' && Number.isInteger(item) && extraInputArray.length === 5){
      symbol = 'Backend_mintToken_each_batch';
      console.log('item is an integer => mintTokenToEachBatch mode');

    } else if(actionType === 'updateExpiredOrders'){
      symbol = 'sym_updateExpiredOrders';
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

      } else if(actionType === 'updateExpiredOrders'){
        const oid = item.o_id;
        const oPurchaseDate = item.o_purchaseDate;
        if(oPurchaseDate.length < 12 || oPurchaseDate.length > 12){
          console.log('[Error] oPurchaseDate length is not of 12', oPurchaseDate);
          return;
        }
        try {
          const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
          const serverTimeM = moment(serverTime, ['YYYYMMDD']);
          //console.log('serverTimeM', serverTimeM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
          if (serverTimeM >= oPurchaseDateM.add(3, 'days')) {
            console.log('serverTime is found >= oPurchaseDate');
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
  
            writeToBlockchainAndDatabase(targetAddr, serverTime, symbol, actionType);
            console.log('[Success] writingToBlockchainAndDatabase() is completed');
          }
        });
      }
    }
    console.log('SequentialRun/asyncForEachFilter() is paused for waiting', waitTime, 'miliseconds');
    await waitFor(waitTime);
  });
  console.log('\n--------------==Done');
  console.log('SequentialRun() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  console.log('inside mintToken()');
  await getTime().then(async function (serverTime) {
    //console.log('blockchain.js: mintToken(), serverTime:', serverTime);
    console.log('acquired serverTime', serverTime);
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    let encodedData = instHCAT721.methods.mintSerialNFT(to, amountToMint, price, fundingType, serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData);
    //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
    console.log('TxResult', TxResult);
  });
}


// HHtoekn12222  Htoken001  Htoken0030
//-------------------------------==DB + BC
//-------------------==Crowdfunding
const updateCFC = async (serverTime) => {
  console.log('\ninside updateCFC(), serverTime:', serverTime, 'typeof', typeof serverTime);
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime should be an integer');
    return;
  }
  mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = "initial" AND p_CFSD <= '+serverTime+') OR (p_state = "funding" AND p_CFED <= '+serverTime+') OR (p_state = "fundingGoalReached" AND p_CFED <= '+serverTime+')', [], function (err, symbolArray) {
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateCFC:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (symbolArrayLen === 0) {
      console.log('[updateCFC] no symbol was found for updating its crowdfunding contract');
    } else if (symbolArrayLen > 0) {
      sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['crowdfunding']);
    }
  });
}



// yarn run testts -a 2 -c 1
const addAssetbooksIntoCFC = async (serverTime) => {
  console.log('\ninside blockchain.js: addAssetbooksIntoCFC()... serverTime:',serverTime);
  const querySQL1 = 'SELECT DISTINCT o_symbol FROM htoken.order WHERE o_paymentStatus = "paid"';// AND o_symbol ="AOOS1902"
  const results1 = await mysqlPoolQueryB(querySQL1, []).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL1)]', err));

  const foundSymbolArray = [];
  const symbolArray = [];

  if(results1.length === 0){
    console.log('No paid order is found');
  } else {
    for(let i = 0; i < results1.length; i++) {
      if(typeof results1[i] === 'object' && results1[i] !== null){
        foundSymbolArray.push(results1[i].o_symbol);
        if(!excludedSymbols.includes(results1[i].o_symbol)){
          symbolArray.push(results1[i].o_symbol)}
      } else {
        symbolArray.push(results1[i]);
      }
    }
  }
  //console.log('foundSymbolArray', foundSymbolArray);
  console.log('symbolArray of paid orders:', symbolArray);

  await asyncForEach(symbolArray, async (symbol, index) => {
    const querySQL2 = 'SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?';
    const results2 = await mysqlPoolQueryB(querySQL2, [symbol]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL2)]', err));
    console.log('results2', results2);
    if(results2.length > 1){
      console.error('\n------==[Error] Found multiple crowdsaleaddresses from one symbol! result', results2);

    } else if(results2.length === 0){
        console.error('\n------==[Error] no crowdsaleaddresses from symbol', symbol, ', result', results2);

    } else {
      const crowdFundingAddr = results2[0].sc_crowdsaleaddress;
      console.error(`\n------==[Good] Found crowdsaleaddresses from symbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr}`);


      // Gives arrays of assetbooks, emails, and tokencounts for symbol x and payment status of y
      const querySQL3 = 'SELECT User.u_assetbookContractAddress, OrderList.o_email, OrderList.o_tokenCount, OrderList.o_id FROM htoken.user User, htoken.order OrderList WHERE User.u_email = OrderList.o_email AND OrderList.o_paymentStatus = "paid" AND OrderList.o_symbol = ?';
      //const querySQL3 = 'SELECT o_email, o_tokenCount, o_id FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = "paid"';
      const results3 = await mysqlPoolQueryB(querySQL3, [symbol]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL3)]', err));
      console.log('results3', results3);
      if(results3.length === 0){
        console.error('[Error] Got no paid order where symbol', symbol, 'result3', results3);
      } else {
        console.log(`\n--------------==[Good] Found a list of email, tokenCount, and o_id for ${symbol}`);
        const assetbookArray = [];
        const assetbookArrayError = [];
        const emailArray = [];
        const emailArrayError = [];
        const tokenCountArray = [];
        const tokenCountArrayError = [];
        const orderIdArray = [];
        const orderIdArrayError = [];
        const txnHashArray = [];

        if(typeof results3[0] === 'object' && results3[0] !== null){
          results3.forEach((item)=>{
            if(!Number.isInteger(item.o_tokenCount) && parseInt(item.o_tokenCount) > 0 && isEmpty(item.o_email) || isEmpty(item.u_assetbookContractAddress) || isEmpty(item.o_id)){
              emailArrayError.push(item.o_email);
              tokenCountArrayError.push(parseInt(item.o_tokenCount));
              orderIdArrayError.push(item.o_id);
              assetbookArrayError.push(item.u_assetbookContractAddress);
            } else {
              emailArray.push(item.o_email);
              tokenCountArray.push(parseInt(item.o_tokenCount));
              orderIdArray.push(item.o_id);
              assetbookArray.push(item.u_assetbookContractAddress);
            }
          });
        }
        console.log(`\nemailArray: ${emailArray} \ntokenCountArray: ${tokenCountArray} \norderIdArray: ${orderIdArray} \nemailArrayError: ${emailArrayError} \ntokenCountArrayError: ${tokenCountArrayError} \norderIdArrayError: ${orderIdArrayError}`);


        console.log('\n----------------==assetbookArray', assetbookArray);
        if(assetbookArray.length !== emailArray.length){
          console.log('[Error] assetbookArray and emailArray have different length')
          return;//process.exit(0);
        }
        const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
        const investorListBf = await instCrowdFunding.methods.getInvestors(0, 0).call();
        console.log(`\nassetbookArrayBf: ${investorListBf[0]}, \ninvestedTokenQtyArrayBf: ${investorListBf[1]}`);

        await asyncForEach(assetbookArray, async (addrAssetbook, index) => {
          const tokenCount = parseInt(tokenCountArray[index]);
          console.log(`\n----==[Good] For ${addrAssetbook}, found its tokenCount ${tokenCount}`);

          const serverTime = 201905281420+1;//await getTime();//566
          console.log(`\n[Good] About to write the assetbook address into the crowdfunding contract
tokenCount: ${tokenCount}, serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

          const fundingState = await instCrowdFunding.methods.fundingState().call();
          console.log('\nfundingState:', fundingState);

          const isGoodToInvest = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });
          console.log('\nisGoodToInvest:', isGoodToInvest);

          //const investorList = await instCrowdFunding.methods.getInvestors(0, 0).call();
          //console.log('\ninvestList', investorList);
          //console.log(`\nassetbookArrayBf: ${investorList[0]}, \ninvestedTokenQtyArrayBf: ${investorList[1]}`);
          
          const encodedData = instCrowdFunding.methods.invest(addrAssetbook, tokenCount, serverTime).encodeABI();
          //invest(_assetbook, _quantityToInvest, serverTime)
          //OR...  investInBatch( _assetbookArr, _quantityToInvestArr, serverTime)
          
          ///*
          let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
          const txnHash = TxResult.transactionHash;
          txnHashArray.push(txnHash);
          console.log(`\nTxResult: ${TxResult} \ntxnHash: ${txnHash}`);

          const investorListAf = await instCrowdFunding.methods.getInvestors(0, 0).call();
          console.log(`\nassetbookArrayAf: ${investorListAf[0]}, \ninvestedTokenQtyArrayAf: ${investorListAf[1]}`);
            
        });

        console.log(`\ntxnHashArray: ${txnHashArray}`)
        if(orderIdArray.length === txnHashArray.length){
          const querySQL5 = 'UPDATE htoken.order SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';
          await asyncForEach(orderIdArray, async (orderId, index) => {
            const results5 = await mysqlPoolQueryB(querySQL5, [txnHashArray[index], orderId]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL5)]', err));
            console.log('\nresults5', results5);
          });
        } else {
          console.log(`\norderIdArray and txnHashArray have different length
          orderIdArray: ${orderIdArray} \ntxnHashArray: ${txnHashArray}`);

        }

      }
    }
  });


  //process.exit(0);
}

const getInvestorsFromCFC_Check = async() => {
  const serverTime = 201905281420+1;//await getTime(); //619
  const addrAssetbook = '0xdEc799A5912Ce621497BFD1Fe2C19f8e23307dbc';
  console.log(`\ngetInvestorsFromCFC_Check
serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

  const fundingState = await instCrowdFunding.methods.fundingState().call();
  console.log('\nfundingState:', fundingState);

  const isGoodToInvest = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });
  console.log('\nisGoodToInvest:', isGoodToInvest);

  const investorList = await instCrowdFunding.methods.getInvestors(0, 0).call();
  console.log('\ninvestList', investorList);
  console.log(`\nassetbookArrayBf: ${investorList[0]}, \ninvestedTokenQtyArrayBf: ${investorList[1]}`);
}

//to get all the list: set inputs to both zeros
const getInvestorsFromCFC = async (indexStart, tokenCountStr) => {
  console.log('\ngetInvestorsFromCFC()...');
  if(!Number.isInteger(indexStart) || !Number.isInteger(tokenCountStr)){
    console.log(`[Error] Non integer is found: indexStart: ${indexStart}, tokenCountStr: ${tokenCountStr}`);
    return [[-1],[-1]];
  }
  tokenCount = parseInt(tokenCountStr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const [assetbookArray, investedTokenQtyArray] = await instCrowdFunding.methods.getInvestors(indexStart, tokenCount).call();  //getInvestors(uint indexStart, uint tokenCount) external view returns(address[] memory assetbookArray, uint[] memory investedTokenQtyArray)
  console.log(`\nassetbookArray: ${assetbookArray}\ninvestedTokenQtyArray: ${investedTokenQtyArray}`);
  return [assetbookArray, investedTokenQtyArray];
}



//-------------------==Token Controller
const updateTCC = async (serverTime) => {
  console.log('\ninside updateTCC(), serverTime:', serverTime, 'typeof', typeof serverTime);
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime should be an integer');
    return;
  }

  mysqlPoolQuery(
    'SELECT p_SYMBOL FROM htoken.product WHERE p_lockuptime <= ? OR p_validdate <= ?', [serverTime, serverTime], function (err, symbolArray) {
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateTCC:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (symbolArrayLen === 0) {
      console.log('[updateTCC] no symbol was found for time >= lockuptime or time >= validdate');
    } else if (symbolArrayLen > 0) {
      sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['tokencontroller']);
    }
  });
}

const writeToBlockchainAndDatabase = async (targetAddr, serverTime, symbol, actionType) => {
  if(actionType === 'crowdfunding'){
    const fundingStateStr = await updateFundingStateCFC(targetAddr, serverTime);
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
    const tokenStateStr = await updateTokenStateTCC(targetAddr, serverTime);
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
    const isScheduleGoodForRelease = await checkIMC_isSchGoodForRelease(targetAddr, serverTime);
    console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);
    if(isScheduleGoodForRelease){
      /**
       * Call bank to release income to customers
       * Get banks' results: actualPaymentTime, actualPaymentAmount or error code 
       * NOT FOR for each token owner... one result for each schedule index!
       * Write that result into DB: 
       * too long name: ia_single_Forecasted_Payable_Income_in_the_Period, ia_single_Actual_Income_Payment_in_the_Period... actualPaymentTime?
       * Write that result into BC below...
       */
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, targetAddr);

      //for loop for each token owner(bankResult) => {}
      const actualPaymentTime = 0;//bankResult.paymentDateTime
      const actualPaymentAmount = 0;//bankResult.paymentAmount
      const errorCode = 0;//bankResult.paymentError

      //write bank's confirmation into IncomeManager.sol
      let encodedData = instIncomeManager.methods.setPaymentReleaseResults(serverTime, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, targetAddr, encodedData);
      console.log('TxResult', TxResult);

      //const scheduleDetails = await instIncomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
      //console.log('[Success @ updateIncomeManager(serverTime)] scheduleDetails:', scheduleDetails);

    } else {
      console.log('[Error] date is found as an incomeManager date in DB but not such in IncomeManager.sol!!! isScheduleGoodForRelease:', isScheduleGoodForRelease);
    }
  }
  console.log('end of writeToBlockchainAndDatabase() for', symbol, 'actionType:', actionType);
}

//-------------------==Income Manager
const isScheduleGoodIMC = async (serverTime) => {
  console.log('\ninside isScheduleGoodIMC(), serverTime:', serverTime, 'typeof', typeof serverTime);
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime should be an integer');
    return;
  }
  //let payableTime = ia_time; 
  //let payableAmount = ia_Payable_Period_End;
  //'SELECT htoken.income_arrangement.ia_SYMBOL,htoken.income_arrangement.ia_time , htoken.income_arrangement.ia_Payable_Period_End From htoken.income_arrangement where income_arrangement.ia_time = ?'
  mysqlPoolQuery(
    'SELECT htoken.income_arrangement.ia_SYMBOL From htoken.income_arrangement where income_arrangement.ia_time <= ?',[serverTime], function (err, results) {
    const resultsLen = results.length;
    console.log('symbolArray length @ isScheduleGoodIMC', resultsLen);

    if (err) {
      console.log('[Error] @ searching symbols:', err);
    } else if (resultsLen > 0) {
      sequentialRun(resultsLen, timeIntervalOfNewBlocks, serverTime, ['incomemanager']);
    }
  });
}


//-----------------------==
const updateExpiredOrders = async (serverTime) => {
  console.log('\ninside updateExpiredOrders(), serverTime:', serverTime, 'typeof', typeof serverTime);
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime should be an integer');
    return;
  }

  mysqlPoolQuery('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, results) {
    const resultsLen = results.length;
    console.log('\nArray length @ updateExpiredOrders:', resultsLen, ', order_id and purchaseDate:', results);

    // const oidArray = [], purchaseDateArray = [];
    // for (let i = 0; i < results.length; i++) {
    //   oidArray.push(results[i].o_id);
    //   purchaseDateArray.push(results[i].o_purchaseDate);
    // }
  
    if (err) {
      console.log('[Error] @ searching o_id and o_purchaseDate:', err);
    } else if (resultsLen === 0) {
      console.log('[updateExpiredOrders] no waiting order was found');
    } else if (resultsLen > 0) {
      sequentialRun(results, timeIntervalUpdateExpiredOrders, serverTime, ['updateExpiredOrders']);
    }
  });
}


//yarn run testts -a 2 -c 4
const addIncomePaymentPerPeriodIntoDB = async (serverTime) => {
  console.log('inside addIncomePaymentPerPeriodIntoDB()... serverTime:', serverTime);
  const symbolArray = [];
  const singleActualIncomePaymentArray = [];
  const addrHCAT_Array = [];
  const assetbookAddrArrayList = [];
  const assetbookBalanceArrayList = [];

  //Inside income_arrangement table
  const querySQL1 = 'SELECT ia_SYMBOL, ia_single_Actual_Income_Payment_in_the_Period FROM htoken.income_arrangement WHERE ia_actualPaymentTime <= ?';
  const results1 = await mysqlPoolQueryB(querySQL1, [serverTime]).catch((err) =>   console.log('\n[Error @ mysqlPoolQueryB(querySQL1)]', err));
  console.log('results1', results1);

  results1.forEach((element,idx) => {
    if(!excludedSymbolsIA.includes(element.o_symbol)){
      const incomePayment = parseInt(element.ia_single_Actual_Income_Payment_in_the_Period);
      if(incomePayment > 0) {
        singleActualIncomePaymentArray.push(incomePayment);
        symbolArray.push(element.ia_SYMBOL);
      }
    }
  });
  console.log(`\n----------------==\nsymbolArray: ${symbolArray} \nsingleActualIncomePaymentArray: ${singleActualIncomePaymentArray}`);

  const querySQL2 = 'SELECT sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?';
  await asyncForEach(symbolArray, async (symbol, index) => {
    const results2 = await mysqlPoolQueryB(querySQL2, [symbol]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL2)]', err));
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
    if(tokenCtrtAddr.length === 42){
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      const assetbookAddrArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
      
      const assetbookBalanceArray = await instHCAT721.methods.balanceOfArray(assetbookAddrArray).call();

      console.log(`\nassetbookAddrArray: ${assetbookAddrArray} \nassetbookBalanceArray: ${assetbookBalanceArray}`);

      assetbookAddrArrayList.push(assetbookAddrArray);
      assetbookBalanceArrayList.push(assetbookBalanceArray);
    } else {
      assetbookAddrArrayList.push('tokenCtrtAddr invalid');
      assetbookBalanceArrayList.push('x');
    }
  });
  console.log(`\nassetbookAddrArrayList: ${assetbookAddrArrayList} \nassetbookBalanceArrayList: ${assetbookBalanceArrayList}`);


  //singleActualIncomePaymentArray * assetbookBalanceArray
  //symbolArray[index]
  
}

//--------------------------==
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
  updateExpiredOrders, getDetailsCFC, 
  sequentialRun, sequentialMint, sequentialCheckBalancesAfter, sequentialCheckBalances,
  breakdownArrays, sequentialMintSuper,
  getFundingStateCFC, updateFundingStateCFC, updateCFC,
  addAssetbooksIntoCFC, getInvestorsFromCFC,
  getTokenStateTCC, updateTokenStateTCC, updateTCC, 
  isScheduleGoodIMC, addIncomePaymentPerPeriodIntoDB
}
