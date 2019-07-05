const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const moment = require('moment');
const chalk = require('chalk');
const log = console.log;

const { getTime, isEmpty, asyncForEach, checkInt, checkIntFromOne } = require('./utilities');
const { AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetOwnerArray, assetOwnerpkRawArray } = require('../ethereum/contracts/zsetupData');

const { mysqlPoolQueryB, setFundingStateDB, getFundingStateDB, setTokenStateDB, getTokenStateDB, addAssetRecordRowArray, findCtrtAddr, getForecastedSchedulesFromDB } = require('./mysql.js');

const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateExpiredOrders = 1000;

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;
//-----------------==Copied from routes/Contracts.js
/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
console.log('loading blockchain.js smart contract json files');
const backendAddr = admin;
const backendRawPrivateKey = adminpkRaw;

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
  return new Promise(async (resolve, reject) => {
    console.log('\n[updateTokenStateTCC] tokenControllerAddr:', tokenControllerAddr, ', serverTime:', serverTime);
    const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
      
    const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);
    console.log('\nTxResult', TxResult);

    let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
    console.log('\ntokenState:', tokenState);
    console.log('tokenControllerAddr', tokenControllerAddr);
    resolve(tokenState);
  });
}

const checkIMC_isSchGoodForRelease = async (addrIncomeManager, serverTime) => {
  console.log('\n[checkIMC_isSchGoodForRelease] addrIncomeManager', addrIncomeManager, 'serverTime', serverTime);
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
  let isScheduleGoodForRelease = await instIncomeManager.methods.isScheduleGoodForRelease(serverTime).call({ from: backendAddr });
  console.log('\nisScheduleGoodForRelease:', isScheduleGoodForRelease);
  console.log('addrIncomeManager', addrIncomeManager);
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

//const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

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
    if(!amountArray.every(checkInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] amountArray has non integer item');
      return;
    }
    if(!balanceArrayBefore.every(checkInt)){
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

const checkMint = async(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    const result = await instHCAT721.methods.checkMintSerialNFT(toAddress, amount, price, fundingType, serverTime).call({from: backendAddr});
    console.log('\nresult', result);
    const boolArray = result[0];
    let mesg;
    if(amountArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', [0] toAddress has no contract';
      } else if(!boolArray[1]){
        mesg += ', [1] toAddress has no onERC721Received()';
      } else if(!boolArray[2]){
        mesg += ', [2] amount <= 0';
      } else if(!boolArray[3]){
        mesg += ', [3] price <= 0';
      } else if(!boolArray[4]){
        mesg += ', [4] fundingType <= 0';
      } else if(!boolArray[5]){
        mesg += ', [5] serverTime <= TimeOfDeployment';
      } else if(!boolArray[6]){
        mesg += ', [6] tokenId + amount > maxTotalSupply';
      } else if(!boolArray[7]){
        mesg += ', [7] Caller is not approved by HeliumCtrt.checkPlatformSupervisor()';
      } else if(!boolArray[8]){
        mesg += ', [8] Registry.isFundingApproved() ... buyAmount > maxBuyAmount';
      } else if(!boolArray[9]){
        mesg += ', [9] Registry.isFundingApproved() ... balance + buyAmount > maxBalance';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(mesg);
    }
  });
}


const sequentialMint = async(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr, serverTime) => {
  console.log('\n----------------------==sequentialMint()');
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
    const TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData).catch(async(err) => {
      console.log('\n[Error @ signTx()]', err);
      const mesg = await checkMint(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime)
    });
    console.log('TxResult', TxResult);
  });
  console.log('\n--------------==Done sequentialMint()');
  console.log('[Completed] All of the investor list has been cycled through');
}


//to be called from API and zlivechain.js, etc...
const sequentialMintSuper = async (toAddressArray, amountArray, tokenCtrtAddr, fundingType, price, maxMintAmountPerRun, serverTime) => {
  console.log('\n----------------------==inside sequentialMintSuper()...');
  //const waitTimeSuper = 13000;
  //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
  if(!amountArray.every(checkIntFromOne)){
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
  await sequentialMint(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr, serverTime).catch((err) => {
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

  console.log('\n--------------==About to call addAssetRecordRowArray()');
  const ar_time = serverTime;
  const singleActualIncomePayment = 0;// after minting tokens

  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const acquired_cost = 13000;
  const moving_ave_holding_cost = 13000;
  const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost).catch((err) => {
    console.log('[Error @ addAssetRecordRowArray]', err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true];
  });;

  return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, false];
  //resolve(isFailed, isCorrectAmountArray);
}


//-----------------------------==
const sequentialRun = async (mainInputArray, waitTime, serverTime, extraInputArray) => {
  console.log('\n----------==inside sequentialRun()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, serverTime= ${serverTime}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime is not an integer. serverTime:', serverTime);
    return;
  }
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return;
  }

  const actionType = extraInputArray[0];
  if(waitTime < 7000 && actionType !== 'updateExpiredOrders'){
    //give DB a list of todos, no async/await ... make orders expired
    console.log('[Warning] waitTime is < min 5000, which is determined by the blockchain block interval time');
    return;
  }
  //console.log('actionType:', actionType);

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
    if (symbol === undefined || symbol === null || symbol.length < 8){
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
        const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
        const serverTimeM = moment(serverTime, ['YYYYMMDD']);
        //console.log('serverTimeM', serverTimeM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
        if (serverTimeM >= oPurchaseDateM.add(3, 'days')) {
          console.log(`oid ${oid} is found serverTime >= oPurchaseDate ... write to DB`);
          const queryStr1 = 'UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?';
          const results = await mysqlPoolQueryB(queryStr1, [oid]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]: setting o_paymentStatus to expired; oid: '+oid+ ', err: '+ err);
          });
          console.log(`[Success] have written status of oid ${oid} as expired.`);
          resolve(true);
        }

      } else {
        //send time to contracts to see the result of determined state: e.g. fundingState, tokenState, ...
        const targetAddr = await findCtrtAddr(symbol, actionType).catch((err) => {
          console.log('[Error @findCtrtAddr]:', err);
        });
        if(isEmpty(targetAddr)){
          console.log(`\ncontract address is not found: ${actionType}, ${symbol}, ${targetAddr}`);
          return false;
        } else {
          console.log(`\ncontract address is found for ${actionType}, ${symbol}, ${targetAddr}`);
          await writeToBlockchainAndDatabase(targetAddr, serverTime, symbol, actionType);
          console.log('[Success] writingToBlockchainAndDatabase() is completed');
        }
      }
    }
  });
  console.log('\n--------------==Done');
  console.log('SequentialRun() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  console.log('inside mintToken()');
  await getTime().then(async function (serverTime) {
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
//From DB check if product:fundingState needs to be updated
const updateFundingStateFromDB = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateFundingStateFromDB(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }
    const queryStr2 = 'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = "initial" AND p_CFSD <= '+serverTime+') OR (p_state = "funding" AND p_CFED <= '+serverTime+') OR (p_state = "fundingGoalReached" AND p_CFED <= '+serverTime+')';
    const symbolArray = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
      reject('[Error @ updateFundingStateFromDB: mysqlPoolQueryB(queryStr2)]: '+ err);
      return false;
    });

    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateFundingStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateFundingStateFromDB] no symbol was found for updating its crowdfunding contract');
    } else if (symbolArrayLen > 0) {
      await sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['crowdfunding']);
    }
    resolve(true);
  });
}


//yarn run testts -a 2 -c 2
//find still funding symbols that have passed CDED2 -> expire all orders of that symbol
const makeOrdersExpiredCFED2 = async (serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\ninside makeOrdersExpiredCFED2(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      reject('[Error] serverTime should be an integer');
      return false;
    }

    const queryStr1 = 'SELECT p_SYMBOL FROM htoken.product WHERE p_CFED <= ? AND (p_state = "initial" OR p_state = "funding" OR p_state = "fundingGoalReached")';
    const symbolArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)] '+ err);
      return false;
    });
    const symbolArrayLen = symbolArray.length;
    console.log('\nArray length @ makeOrdersExpiredCFED2:', symbolArrayLen, ', symbols:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[makeOrdersExpiredCFED2] no symbol was found');
      resolve(true);

    } else if (symbolArrayLen > 0) {
      console.log('[makeOrdersExpiredCFED2] symbol(s) found');

      //const queryStr = 'UPDATE htoken.product SET p_state = ? WHERE p_SYMBOL = ?';
      const queryStr3 = 'UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_symbol = ? AND o_paymentStatus = "waiting"';
      await asyncForEach(symbolArray, async (symbol, index) => {
        /*
        //------------== auto determines the crowdfunding results -> write it into DB
        const crowdFundingAddr = await findCtrtAddr(symbol.p_SYMBOL,'crowdfunding').catch((err) => {
          console.error('[Error @findCtrtAddr]:', err);
          continue;
        });
        const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    
        const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
        let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
        console.log('\nTxResult', TxResult);
      
        let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
        console.log('\nfundingState:', fundingState);

        let p_state;
        if(fundingState === '4'){
          p_state = 'fundingClosed';
        } else if(fundingState === '5'){
          p_state = 'fundingNotClosed';
        } else if(fundingState === '6'){
          p_state = 'terminated';
        }
        const results2 = await mysqlPoolQueryB(queryStr, [p_state, symbol.p_SYMBOL]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr)]', err);
        });
        console.log('\nUpdated product of', symbol.p_SYMBOL, results2);
        */

        //------------== 
        const results3 = await mysqlPoolQueryB(queryStr3, [symbol.p_SYMBOL]).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr3)] '+ err);
        });
        console.log('-------==[Success] updated orders to expired for symbol', symbol.p_SYMBOL);
        resolve(true);
      });
    }
  });
  //process.exit(0);
}


// yarn run testts -a 2 -c 1
// after order status change: waiting -> paid -> write into crowdfunding contract
const addAssetbooksIntoCFC = async (serverTime) => {
  // check if serverTime > CFSD2 for each symbol...
  console.log('\ninside addAssetbooksIntoCFC()... serverTime:',serverTime);
  const queryStr1 = 'SELECT DISTINCT o_symbol FROM htoken.order WHERE o_paymentStatus = "paid"';// AND o_symbol ="AOOS1902"
  const results1 = await mysqlPoolQueryB(queryStr1, []).catch((err) => {
    console.log('\n[Error @ mysqlPoolQueryB(queryStr1)]', err);
  });

  const foundSymbolArray = [];
  const symbolArray = [];

  if(results1.length === 0){
    log(chalk.green('>>[Success @ addAssetbooksIntoCFC()] No paid order is found'));
    return true;
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
  if(symbolArray.length === 0){
    log(chalk.green('>>[Success @ addAssetbooksIntoCFC()] paid orders are found but are all excluded'));
    return true;
  }

  await asyncForEach(symbolArray, async (symbol, index) => {

    const crowdFundingAddr = await findCtrtAddr(symbol, 'crowdfunding');
    console.error(`\n------==[Good] Found crowdsaleaddresses from symbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr}`);

    // Gives arrays of assetbooks, emails, and tokencounts for symbol x and payment status of y
    const queryStr3 = 'SELECT User.u_assetbookContractAddress, OrderList.o_email, OrderList.o_tokenCount, OrderList.o_id FROM htoken.user User, htoken.order OrderList WHERE User.u_email = OrderList.o_email AND OrderList.o_paymentStatus = "paid" AND OrderList.o_symbol = ?';
    //const queryStr3 = 'SELECT o_email, o_tokenCount, o_id FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = "paid"';
    const results3 = await mysqlPoolQueryB(queryStr3, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]', err);
    });
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
        const queryStr5 = 'UPDATE htoken.order SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';
        await asyncForEach(orderIdArray, async (orderId, index) => {
          const results5 = await mysqlPoolQueryB(queryStr5, [txnHashArray[index], orderId]).catch((err) => {
            console.log('\n[Error @ mysqlPoolQueryB(queryStr5)]', err);
          });
          //console.log('\nresults5', results5);
        });
        log(chalk.green('\n>>[Success @ addAssetbooksIntoCFC()];'));
      } else {
        log(chalk.red(`\n>>[Error @ addAssetbooksIntoCFC] orderIdArray and txnHashArray have different length
        orderIdArray: ${orderIdArray} \ntxnHashArray: ${txnHashArray}`));

      }

    }
  //process.exit(0);
  });
}

const checkInvest = async(crowdFundingAddr, addrAssetbook, tokenCount, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    const result = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });
    console.log('\nresult', result);
    const boolArray = result[0];
    let mesg;
    if(amountArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', [0] serverTime >= CFSD2';
      } else if(!boolArray[1]){
        mesg += ', [1] serverTime < CFED2';
      } else if(!boolArray[2]){
        mesg += ', [2] checkPlatformSupervisor()';
      } else if(!boolArray[3]){
        mesg += ', [3] addrAssetbook.isContract()';
      } else if(!boolArray[4]){
        mesg += ', [4] addrAssetbook onERC721Received()';
      } else if(!boolArray[5]){
        mesg += ', [5] quantityToInvest > 0';
      } else if(!boolArray[6]){
        mesg += ', [6] not enough remainingQty';
      } else if(!boolArray[7]){
        mesg += ', [7] serverTime > TimeOfDeployment';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(mesg);
    }
  });
}


const getInvestorsFromCFC_Check = async(serverTime) => {
  //check if serverTime > CFSD2
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
  return investorList;
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
//From DB check if product:tokenState needs to be updated
const updateTokenStateFromDB = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateTokenStateFromDB(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }

    const str = 'SELECT p_SYMBOL FROM htoken.product WHERE p_lockuptime <= ? OR p_validdate <= ?';
    const symbolArray = await mysqlPoolQueryB(str, [serverTime, serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(str)] '+ err);
      return false;
    });
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateTokenStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateTokenStateFromDB] no symbol was found for time >= lockuptime or time >= validdate');
    } else if (symbolArrayLen > 0) {
      await sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['tokencontroller']);
    }
    resolve(true);
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
        await setFundingStateDB(symbol, 'initial', undefined, undefined);
        break;
      case 1:
        await setFundingStateDB(symbol, 'funding', undefined, undefined);
        break;
      case 2:
        await setFundingStateDB(symbol, 'fundingPaused', undefined, undefined);
        break;
      case 3:
        await setFundingStateDB(symbol, 'fundingGoalReached', undefined, undefined);
        break;
      case 4:
        //diasabled for manual setting on funding state
        //await setFundingStateDB(symbol, 'fundingClosed', undefined, undefined);
        break;
      case 5:
        //diasabled for manual setting on funding state
        //await setFundingStateDB(symbol, 'fundingNotClosed', undefined, undefined);
        break;
      case 6:
        await setFundingStateDB(symbol, 'terminated', undefined, undefined);
        break;
      default:
        await setFundingStateDB(symbol, 'undefined', undefined, undefined);
    }

  } else if(actionType === 'tokencontroller'){
    console.log('\n-----------------=inside writeToBlockchainAndDatabase(), actionType: tokencontroller');
    const tokenStateStr = await updateTokenStateTCC(targetAddr, serverTime);
    console.log('tokenState', tokenStateStr, 'typeof', typeof tokenStateStr);
    const tokenState = parseInt(tokenStateStr);
    // lockupPeriod, normal, expired
    switch(tokenState) {
      case 0:
        await setTokenStateDB(symbol, 'lockupPeriod', undefined, undefined);
        break;
      case 1:
        await setTokenStateDB(symbol, 'normal', undefined, undefined);
        break;
      case 2:
        await setTokenStateDB(symbol, 'expired', undefined, undefined);
        break;
      default:
        await setTokenStateDB(symbol, 'undefined', undefined, undefined);
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


//---------------------------==Assetbook Contract
//---------------------------==
const getAssetbookDetails = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==getAssetbookDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = await instAssetBook.methods.assetOwner().call();
    result[1] = await instAssetBook.methods.addrHeliumContract().call();
    result[2] = await instAssetBook.methods.assetOwner_flag().call();
    result[3] = await instAssetBook.methods.HeliumContract_flag().call();
    result[4] = await instAssetBook.methods.endorserCtrts_flag().call();
    result[5] = await instAssetBook.methods.calculateVotes().call();

    const endorserCtrts = await instAssetBook.methods.endorserCtrts().call();
    result[6] = endorserCtrts[0];
    result[7] = endorserCtrts[1];
    result[8] = endorserCtrts[2];
    console.log('\nresult:', result);
    resolve(result);
  });
}

const setHeliumAddr = async(addrAssetBook, _addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==setHeliumAddr()');
    console.log(`serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.setHeliumAddr(_addrHeliumContract).encodeABI();
    let TxResult = await signTx(AssetOwner1, AssetOwner1pkRaw, addrAssetBook, encodedData);
    console.log('\nTxResult', TxResult);

    const addrHeliumContract = await instAssetBook.methods.addrHeliumContract().call();
    console.log('\naddrHeliumContract:', addrHeliumContract);
    if(addrHeliumContract === _addrHeliumContract){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}

const HeliumContractVote = async(addrAssetBook, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==HeliumContractVote()');
    console.log(`serverTime: ${serverTime}`);

    //const HeliumContract_flag_Before = await instAssetBook.methods.HeliumContract_flag().call();
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
    console.log('\nTxResult', TxResult);

    const HeliumContract_flag_After = await instAssetBook.methods.HeliumContract_flag().call();
    console.log('\nHeliumContract_flag_after:', HeliumContract_flag_After);

    if(HeliumContract_flag_After === '1'){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}


const resetVoteStatus = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==resetVoteStatus()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.resetVoteStatus().encodeABI();
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
    console.log('\nTxResult', TxResult);

    const assetOwner_flag = await instAssetBook.methods.assetOwner_flag().call();
    const HeliumContract_flag = await instAssetBook.methods.HeliumContract_flag().call();
    const endorserCtrts_flag = await instAssetBook.methods.endorserCtrts_flag().call();
    console.log('\assetOwner:', result);
    if(assetOwner_flag === '0' && HeliumContract_flag === '0' && endorserCtrts_flag === '0'){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}

const changeAssetOwner = async(addrAssetBook, _assetOwnerNew, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==changeAssetOwner()');
    console.log(`serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.changeAssetOwner(_assetOwnerNew, serverTime).encodeABI();
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
    console.log('\nTxResult', TxResult);

    const result = await instAssetBook.methods.assetOwner().call();
    console.log('\assetOwner:', result);
    if(result === _assetOwnerNew){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}
// const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
// const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
// let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrAssetBook, encodedData);
// console.log('\nTxResult', TxResult);

//---------------------------==Income Manager
//---------------------------==
const schCindex = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside schCindex()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result = await instIncomeManager.methods.schCindex().call();
    console.log('\nschCindex:', result);//assert.equal(result, 0);
    resolve(result);
  });
}

//yarn run livechain -c 1 --f 12
const getIncomeSchedule = async(symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside getIncomeSchedule()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    //const result = await instIncomeManager.methods.schCindex().call();
    //console.log('\nschCindex:', result);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);
    resolve(result2);
  });
}

//yarn run livechain -c 1 --f 13
const getIncomeScheduleList = async(symbol, indexStart = 0, amount = 0) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside getIncomeScheduleList()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    // const result = await instIncomeManager.methods.schCindex().call();
    // console.log('\nschCindex:', result);//assert.equal(result, 0);

    // const bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    // console.log('\nisScheduleGoodForRelease('+forecastedPayableTime+'):', bool1);

    const scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    resolve(scheduleList)
  });
}


//yarn run livechain -c 1 --f 14
const checkAddScheduleBatch1 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  console.log('\n-------------==inside checkAddScheduleBatch1()');
  const length = forecastedPayableTimes.length;
  if(length !== forecastedPayableAmounts.length){
    console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
    return;
  } else if(length === 0){
    console.log('forecastedPayableTimes has length zero');
    return;
  }

  const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
    console.log('[Error @findCtrtAddr]:', err);
  });
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
  
  const result = await instIncomeManager.methods.checkAddScheduleBatch1(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
  console.log('\nschCindex:', result);//assert.equal(result, 0);
  process.exit(0);
}

// yarn run livechain -c 1 --f 15
const checkAddScheduleBatch2 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  console.log('\n-------------==inside checkAddScheduleBatch1()');
  const length = forecastedPayableTimes.length;
  if(length !== forecastedPayableAmounts.length){
    console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
    return;
  } else if(length === 0){
    console.log('forecastedPayableTimes has length zero');
    return;
  }

  const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
    console.log('[Error @findCtrtAddr]:', err);
  });
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
  
  const result = await instIncomeManager.methods.checkAddScheduleBatch2(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
  console.log('\nschCindex:', result);//assert.equal(result, 0);
  process.exit(0);
}


// yarn run livechain -c 1 --f 16
const checkAddScheduleBatch = async (addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside checkAddScheduleBatch()');
    console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      reject('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      reject('forecastedPayableTimes has length zero');
      return false;
    }

    if(!forecastedPayableTimes.every(checkInt) || !forecastedPayableAmounts.every(checkInt)){
      console.log('None number has been detected. \nforecastedPayableTimes:', forecastedPayableTimes, '\nforecastedPayableAmounts:', forecastedPayableAmounts);
      reject('None number has been detected');
      return false;
    }

    for(let idx = 1; idx < length; idx++) {
      if(forecastedPayableTimes[idx] <= forecastedPayableTimes[idx - 1]){
        reject(`[Error] idx = ${idx}, forecastedPayableTimes[idx] ${forecastedPayableTimes[idx]} <= forecastedPayableTimes[idx - 1] ${forecastedPayableTimes[idx - 1]}
        forecastedPayableTime[idx] should be > forecastedPayableTime[idx-1]`);
        return false;
      }
    }

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const isPS = await instIncomeManager.methods.checkPlatformSupervisor().call({ from: backendAddr }); console.log('\nisPS', isPS);

    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schCindexM).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schCindexM}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    const first_forecastedPayableTime = parseInt(forecastedPayableTimes[0]);
    const last_forecastedPayableTime = parseInt(result2[0]);
    if(last_forecastedPayableTime >= first_forecastedPayableTime){
      reject(`last_forecastedPayableTime ${last_forecastedPayableTime} should be < first_forecastedPayableTime ${first_forecastedPayableTime}`);
      return false;
    }
    const results = await instIncomeManager.methods.checkAddScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
    console.log('results', results);

    resolve(results);
  });
}



const addScheduleBatchFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {

    const results1 = await getForecastedSchedulesFromDB(symbol);
    //console.log('results1', results1);
    const forecastedPayableTimes = [];
    const forecastedPayableAmounts = [];
    for(let i = 0; i < results1.length; i++) {
      if(typeof results1[i] === 'object' && results1[i] !== null){
        forecastedPayableTimes.push(results1[i].ia_time);
        forecastedPayableAmounts.push(results1[i].ia_single_Forecasted_Payable_Income_in_the_Period);
      }
    }
    console.log(`forecastedPayableTimes: ${forecastedPayableTimes} 
  forecastedPayableAmounts: ${forecastedPayableAmounts}`);

    const addrIncomeManager = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    const results2 = await addScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
    if(results2){
      resolve(true);
    } else {
      reject(false);
    }
  });
}

//yarn run livechain -c 1 --f 17
const addScheduleBatch = async (symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside addScheduleBatch()');
    const addrIncomeManager = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });

    console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);

    const length1 = forecastedPayableTimes.length;
    if(length1 !== forecastedPayableAmounts.length){
      const mesg = '[Error] forecastedPayableTimes and forecastedPayableAmounts from DB should have the same length';
      console.log(mesg);
      return;
    }
  
    const isCheckAddScheduleBatch = await checkAddScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
      reject('[Error @checkAddScheduleBatch]: '+ err);
      return false;
    });
    console.log('\nisCheckAddScheduleBatch:', isCheckAddScheduleBatch);

    if(isCheckAddScheduleBatch){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      //console.log(`getIncomeSchedule(${schCindexM}):\n${result2[0]}\n${result2[1]}\n${result2[2]}\n${result2[3]}\n${result2[4]}\n${result2[5]}\n${result2[6]}`);// all should be 0 and false before adding a new schedule
      let encodedData = instIncomeManager.methods.addScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).encodeABI();
      console.log('about to execute signTx()...');
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrIncomeManager, encodedData);
      console.log('TxResult', TxResult);

      const indexStart = 0; const amount = 0;
      let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
      console.log('\nscheduleList', scheduleList);
      const schCindexM = await instIncomeManager.methods.schCindex().call();
      console.log('schCindex:', schCindexM);//assert.equal(result, 0);
      resolve(true);

    } else {
      reject('[Error] isCheckAddScheduleBatch: '+ isCheckAddScheduleBatch);
      return false;
    }
  });
}


//yarn run livechain -c 1 --f 18
const removeIncomeSchedule = async (symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside removeIncomeSchedule()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    let encodedData = instIncomeManager.methods.removeIncomeSchedule(schIndex).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrIncomeManager, encodedData);
    console.log('TxResult', TxResult);

    const indexStart = 0; const amount = 0;
    let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
    resolve(true);
  });
}


//yarn run livechain -c 1 --f 19
const imApprove = async (symbol, schIndex, boolValue) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside imApprove()');
    console.log('schIndex', schIndex, 'boolValue', boolValue);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    if(result2[4] === boolValue){
      console.log('the desired status has already been set so');
      resolve(true);

    } else {
      let encodedData = instIncomeManager.methods.imApprove(schIndex, true).encodeABI();
      console.log('about to execute signTx()...');
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrIncomeManager, encodedData);
      console.log('TxResult', TxResult);
  
      const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
      console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);
      resolve(true);
    }
  });
}

//yarn run livechain -c 1 --f 20
const setPaymentReleaseResults = async (symbol, schIndex, actualPaymentTime, actualPaymentAmount,  errorCode) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside setPaymentReleaseResults()');
    console.log('schIndex', schIndex, 'actualPaymentTime', actualPaymentTime, 'actualPaymentAmount', actualPaymentAmount, 'errorCode', errorCode);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    //console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    let encodedData = instIncomeManager.methods.setPaymentReleaseResults(schIndex, actualPaymentTime, actualPaymentAmount,  errorCode).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrIncomeManager, encodedData);
    console.log('TxResult', TxResult);

    const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);

    resolve(true);
  });
}




const isScheduleGoodIMC = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside isScheduleGoodIMC(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }
    //let payableTime = ia_time; 
    //let payableAmount = ia_Payable_Period_End;
    //'SELECT htoken.income_arrangement.ia_SYMBOL,htoken.income_arrangement.ia_time , htoken.income_arrangement.ia_Payable_Period_End From htoken.income_arrangement where income_arrangement.ia_time = ?'

    const queryStr1 = 'SELECT htoken.income_arrangement.ia_SYMBOL From htoken.income_arrangement where income_arrangement.ia_time <= ?';
    const symbolArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ isScheduleGoodIMC: mysqlPoolQueryB(queryStr1)]: '+ err);
      return false;
    });
    const resultsLen = symbolArray.length;
    console.log('symbolArray length @ isScheduleGoodIMC', resultsLen);
    if (resultsLen > 0) {
      await sequentialRun(resultsLen, timeIntervalOfNewBlocks, serverTime, ['incomemanager']);
    }
    resolve(true);
  });
}



//---------------------------==
// orderDate+3 => expired orders
// yarn run testts -a 2 -c 19
const updateExpiredOrders = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateExpiredOrders(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return;
    }

    const queryStr ='SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"';
    const results = await mysqlPoolQueryB(queryStr, []).catch((err) => {
      reject('[Error @ updateExpiredOrders: mysqlPoolQueryB(queryStr)]: '+ err);
      return false;
    });

    const resultsLen = results.length;
    console.log('\nArray length @ updateExpiredOrders:', resultsLen, ', order_id and purchaseDate:', results);

    // const oidArray = [], purchaseDateArray = [];
    // for (let i = 0; i < results.length; i++) {
    //   oidArray.push(results[i].o_id);
    //   purchaseDateArray.push(results[i].o_purchaseDate);
    // }
  
    if (resultsLen === 0) {
      console.log('[updateExpiredOrders] no waiting order was found');
    } else if (resultsLen > 0) {
      await sequentialRun(results, timeIntervalUpdateExpiredOrders, serverTime, ['updateExpiredOrders']);
    }
    resolve(true);
  });
}





//--------------------------==
/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
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
  getFundingStateCFC, updateFundingStateFromDB, updateFundingStateCFC,
  addAssetbooksIntoCFC, getInvestorsFromCFC,
  getTokenStateTCC, updateTokenStateTCC, updateTokenStateFromDB, 
  isScheduleGoodIMC, makeOrdersExpiredCFED2,
  getInvestorsFromCFC_Check,
  schCindex, addScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddScheduleBatch1, checkAddScheduleBatch2, checkAddScheduleBatch, removeIncomeSchedule, imApprove, setPaymentReleaseResults, addScheduleBatchFromDB,
  resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr
}
