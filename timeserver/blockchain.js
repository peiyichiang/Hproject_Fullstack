const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const moment = require('moment');
const chalk = require('chalk');
const log = console.log;
console.log('loading blockchain.js...');

const { getTime, isEmpty, asyncForEach, asyncForEachTsMain, asyncForEachMint, asyncForEachMint2, asyncForEachAbCFC, asyncForEachAbCFC2, asyncForEachAbCFC3, asyncForEachOrderExpiry, breakdownArrays, breakdownArray, checkInt, checkIntFromOne, checkBoolTrueArray } = require('./utilities');
const { Helium, AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetOwnerArray, assetOwnerpkRawArray, addrHelium } = require('../ethereum/contracts/zsetupData');
const { addActualPaymentTime } = require('./mysql');

const { mysqlPoolQueryB, setFundingStateDB, getFundingStateDB, setTokenStateDB, getTokenStateDB, addAssetRecordRowArray, findCtrtAddr, getForecastedSchedulesFromDB } = require('./mysql.js');

const ethAddrChoice = 1;//0 API dev, 1 Blockchain dev, 2 Backend dev, 3 .., 4 timeserver
const blockchainChoice = 1;//1 POA, 2 ganache, 3 Infura
const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateExpiredOrders = 1000;


let backendAddr, backendAddrpkRaw, blockchain_ip;
if(blockchainChoice === 1){//POA
  blockchain_ip = "http://140.119.101.130:8545";
} else if(blockchainChoice === 2){/*ganache*/
  blockchain_ip = "http://140.119.101.130:8540";
} else if(blockchainChoice === 3){/*Infura HttpProvider Endpoint*/
  blockchain_ip = "https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d";
} 
web3 = new Web3(new Web3.providers.HttpProvider(blockchain_ip));

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;

if(ethAddrChoice === 0){//reserved to API developer
  backendAddr = admin;
  backendAddrpkRaw = adminpkRaw;

} else if(ethAddrChoice === 1){//reserved to Blockchain developer
  backendAddr = AssetOwner1;
  backendAddrpkRaw = AssetOwner1pkRaw;

} else if(ethAddrChoice === 2){//reserved to Backend developer
  backendAddr = AssetOwner2;
  backendAddrpkRaw = AssetOwner2pkRaw;

} else if(ethAddrChoice === 3){//
  backendAddr = AssetOwner3;
  backendAddrpkRaw = AssetOwner3pkRaw;

} else if(ethAddrChoice === 4){//reserved tp the timeserver
  backendAddr = AssetOwner4;
  backendAddrpkRaw = AssetOwner4pkRaw;
}
console.log(`using backendAddr: ${backendAddr}`);

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


//-------------------==Helium Contract
const addPlatformSupervisor = async(platformSupervisorNew, addrHeliumX) => {
  return new Promise(async (resolve, reject) => {
    //console.log('--------------==adding additional PlatformSupervisor...');
    // const addrHeliumContract = await findCtrtAddr(symbol,'helium').catch((err) => {
    //   reject('[Error @findCtrtAddr]:'+ err);
    //   return false;
    // });
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumX);
    const encodedData= instHelium.methods.addPlatformSupervisor(platformSupervisorNew).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrHeliumX, encodedData).catch((err) => {
      reject('[Error @ signTx() addPlatformSupervisor()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
    resolve(result);
  });
}

const addCustomerService = async(platformSupervisorNew, addrHeliumX) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumX);
    const encodedData= instHelium.methods.addCustomerService(platformSupervisorNew).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrHeliumX, encodedData).catch((err) => {
      reject('[Error @ signTx() addCustomerService()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
    resolve(result);
  });
}

const checkPlatformSupervisor = async(eoa, addrHeliumX) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumX);
    const result= await instHelium.methods.checkPlatformSupervisor(eoa).call();
    resolve(result);
  });
}

const checkCustomerService = async(eoa, addrHeliumX) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumX);
    const result= await instHelium.methods.checkCustomerService(eoa).call();
    resolve(result);
  });
}


//Set compliance regulatory rules
const setRestrictions = async(authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate) => {
  return new Promise(async (resolve, reject) => {
    //console.log('--------------==setRestrictions()');
    const instHelium = new web3.eth.Contract(Helium.abi, addrRegistry);
    const encodedData= instHelium.methods.setRestrictions(authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrRegistry, encodedData).catch((err) => {
      reject('[Error @ signTx() setRestrictions()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(result);
  });
}



//-------------------==Crowdfunding
const getFundingStateCFC = async (crowdFundingAddr) => {
  console.log('[getFundingStateCFC] crowdFundingAddr...');
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let fundingState = await instCrowdFunding.methods.fundingState().call();
  let fundingStateAlphabets;
  if(fundingState === '0'){
    fundingStateAlphabets = 'initial';
  } else if(fundingState === '1'){
    fundingStateAlphabets = 'funding';
  } else if(fundingState === '2'){
    fundingStateAlphabets = 'fundingPaused';
  } else if(fundingState === '3'){
    fundingStateAlphabets = 'fundingGoalReached';
  } else if(fundingState === '4'){
    fundingStateAlphabets = 'fundingClosed';
  } else if(fundingState === '5'){
    fundingStateAlphabets = 'fundingNotClosed';
  } else if(fundingState === '6'){
    fundingStateAlphabets = 'terminated';
  } else {
    fundingStateAlphabets = 'out of range';
  }
  console.log('fundingState', fundingState, ', fundingStateAlphabets:', fundingStateAlphabets, ', crowdFundingAddr:', crowdFundingAddr);
}

const getHeliumAddrCFC = async (crowdFundingAddr) => {
  console.log('[getHeliumAddrCFC] crowdFundingAddr...');
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let addrHelium = await instCrowdFunding.methods.addrHelium().call();
  console.log('addrHelium', addrHelium, ', crowdFundingAddr:', crowdFundingAddr);
}

const updateFundingStateCFC = async (crowdFundingAddr, serverTime, symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n[updateFundingStateCFC] crowdFundingAddr', crowdFundingAddr, 'serverTime', serverTime);
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

    const stateDescription = await instCrowdFunding.methods.stateDescription().call();
    //const symbol = await instCrowdFunding.methods.tokenSymbol().call();
    let fundingState = await instCrowdFunding.methods.fundingState().call();
    console.log(`\nsymbol: ${symbol}, fundingState: ${fundingState}`);

    if(parseInt(fundingState) < 4){
      console.log(`the CF contract of ${symbol} is ready to be updated...`);
      const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
      console.log('about to execute updateState() in the CFC...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData).catch( async(err) => {
        const TimeOfDeployment = await instCrowdFunding.methods.TimeOfDeployment().call();
        const checkupdateState = serverTime > TimeOfDeployment;
        stateDescription = await instCrowdFunding.methods.stateDescription().call();
        const checkPlatformSupervisorFromCFC_M = await instCrowdFunding.methods.checkPlatformSupervisor().call({from: backendAddr});
        let addrHelium = await instCrowdFunding.methods.addrHelium().call();

        console.log('\n[Error @ signTx() updateState(serverTime)], checkupdateState:'+checkupdateState)
        console.log(`symbol: ${symbol}, fundingState: ${fundingState}, stateDescription: ${stateDescription}, TimeOfDeployment: ${TimeOfDeployment}, serverTime: ${serverTime}, checkPlatformSupervisorFromCFC_M: ${checkPlatformSupervisorFromCFC_M}, addrHelium: ${addrHelium}`);
        reject('err:'+err);
        return undefined;
      });
      console.log('\nTxResult', TxResult);
  
      fundingState = await instCrowdFunding.methods.fundingState().call();
      console.log('\nnew fundingState:', fundingState, ', stateDescription:', stateDescription, '\ncrowdFundingAddr', crowdFundingAddr);
      resolve(fundingState);

    } else {
      //    enum FundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated}
      let fundingStateAlphabets;
      if(fundingState === '0'){
        fundingStateAlphabets = 'initial';
      } else if(fundingState === '1'){
        fundingStateAlphabets = 'funding';
      } else if(fundingState === '2'){
        fundingStateAlphabets = 'fundingPaused';
      } else if(fundingState === '3'){
        fundingStateAlphabets = 'fundingGoalReached';
      } else if(fundingState === '4'){
        fundingStateAlphabets = 'fundingClosed';
      } else if(fundingState === '5'){
        fundingStateAlphabets = 'fundingNotClosed';
      } else if(fundingState === '6'){
        fundingStateAlphabets = 'terminated';
      } else {
        fundingStateAlphabets = 'out of range';
      }
      console.warn('[Warning] the CF contract should not be updated... DB p_state should be updated with ', fundingStateAlphabets, ', fundingState=', fundingState, ', stateDescription:', stateDescription);
      resolve(fundingState);
    }
  });
}


//-----------------==TokenController
const getTokenStateTCC = async (tokenControllerAddr) => {
  console.log('[getFundingStateCFC] tokenControllerAddr', tokenControllerAddr);
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
  let fundingStateAlphabets;
  if(fundingState === '0'){
    fundingStateAlphabets = 'lockup';
  } else if(fundingState === '1'){
    fundingStateAlphabets = 'normal';
  } else if(fundingState === '2'){
    fundingStateAlphabets = 'expired';
  } else {
    fundingStateAlphabets = 'out of range';
  }
  console.log('tokenState:', tokenState, ', fundingStateAlphabets:', fundingStateAlphabets, ', tokenControllerAddr:', tokenControllerAddr);
}
const getHeliumAddrTCC = async (tokenControllerAddr) => {
  console.log('[getHeliumAddrTCC] tokenControllerAddr...');
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let addrHelium = await instTokenController.methods.addrHelium().call();
  console.log('addrHelium', addrHelium, ', tokenControllerAddr:', tokenControllerAddr);
}

const updateTokenStateTCC = async (tokenControllerAddr, serverTime, symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n[updateTokenStateTCC] tokenControllerAddr:', tokenControllerAddr, ', serverTime:', serverTime);
    const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);

    let tokenState = await instTokenController.methods.tokenState().call();
    console.log(`\nsymbol: ${symbol}, tokenState: ${tokenState}`);

    if(parseInt(tokenState) < 2){
      console.log(`the CF contract of ${symbol} is ready to be updated...`);
      const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
      console.log('about to execute updateState() in the TCC...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenControllerAddr, encodedData).catch( async(err) => {
        const checkPlatformSupervisorFromTCC_M = await instTokenController.methods.checkPlatformSupervisorFromTCC().call({from: backendAddr});
        let addrHelium = await instTokenController.methods.addrHelium().call();

        console.log(`[Error @ signTx() updateState(serverTime) in TCC] \nsymbol: ${symbol}, tokenState: ${tokenState}, serverTime: ${serverTime}, checkPlatformSupervisorFromTCC_M: ${checkPlatformSupervisorFromTCC_M}, addrHelium: ${addrHelium}`);
        reject('err:'+ err);
        return undefined;
      });
      console.log('\nTxResult', TxResult);
      tokenState = await instTokenController.methods.tokenState().call();
      console.log('\nnew tokenState:', tokenState, '\ntokenControllerAddr', tokenControllerAddr);
      resolve(tokenState);

    } else {
      //enum TokenState{lockup, normal, expired}
      let fundingStateAlphabets;
      if(fundingState === '0'){
        fundingStateAlphabets = 'lockup';
      } else if(fundingState === '1'){
        fundingStateAlphabets = 'normal';
      } else if(fundingState === '2'){
        fundingStateAlphabets = 'expired';
      } else {
        fundingStateAlphabets = 'out of range';
      }
      console.warn('[Warning] the TC contract should not be updated... DB p_tokenState should be updated with', fundingStateAlphabets, ' tokenState=', tokenState);
      resolve(tokenState);
    }
  });
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



const sequentialCheckBalances = async (toAddressArray, tokenCtrtAddr) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n------==inside sequentialCheckBalances()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);

    const balanceArrayBefore = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    await asyncForEachMint(toAddressArray, async (toAddress) => {
      console.log(`\n--------------==next: check the balance of ${toAddress}`);
      const balB4Minting = await instHCAT721.methods.balanceOf(toAddress).call();
      balanceArrayBefore.push(parseInt(balB4Minting));
    });

    console.log('\n--------------==Done sequentialCheckBalances()');
    console.log('[Completed] All of the investor list has been cycled through');
    return balanceArrayBefore;
    //resolve(balanceArrayBefore);
  //});
}


const sequentialCheckBalancesAfter = async (toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore, isToMax) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n---------------==inside sequentialCheckBalancesAfter()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
    if(!amountArray.every(checkInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] amountArray has non integer item');
      return false;
    }
    if(!balanceArrayBefore.every(checkInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] balanceArrayBefore has non integer item. \nbalanceArrayBefore:', balanceArrayBefore);
      return false;
    }

    const isCorrectAmountArray = [];
    const balanceArrayAfter = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    
    if(toAddressArray.length !== amountArray.length){
      console.log(`toAddressArray and amountArray must be of the same length`);
      return false;
    }
    await asyncForEachMint(toAddressArray, async (toAddress, idx) => {
      const amount = amountArray[idx];
      const balanceBefore = balanceArrayBefore[idx];
      const tokenBalanceAfterMinting_ = await instHCAT721.methods.balanceOf(toAddress).call();
      const tokenBalanceAfterMinting = parseInt(tokenBalanceAfterMinting_);
      const increase = tokenBalanceAfterMinting - balanceBefore;
      let isCorrect;
      if(isToMax){
        isCorrect = (amount === tokenBalanceAfterMinting);
      } else {
        isCorrect = (parseInt(amount) === increase);
      }
      isCorrectAmountArray.push(isCorrect);
      console.log(`
      balance: expected increase: ${amount} ... actual increase: ${increase} = ${tokenBalanceAfterMinting} - ${balanceBefore}
      typeof amount ${typeof amount} ...  typeof tokenBalanceAfterMinting ${typeof tokenBalanceAfterMinting}, typeof balanceBefore ${typeof balanceBefore}, isCorrect: ${isCorrect}`);
      balanceArrayAfter.push(tokenBalanceAfterMinting);
    });

    console.log('\n--------------==Done sequentialCheckBalancesAfter()');
    console.log('[Completed] All of the investor list has been cycled through');
    return [isCorrectAmountArray, balanceArrayAfter];
    //resolve(isCorrectAmountArray);
  //});
}

const checkMint = async(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    const result = await instHCAT721.methods.checkMintSerialNFT(toAddress, amount, price, fundingType, serverTime).call({from: backendAddr});
    console.log('\nresult', result);
    const uintArray = result[1];
    const boolArray = result[0];

    let mesg;
    if(boolArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', [0] toAddress has no contract';
      } 
      if(!boolArray[1]){
        mesg += ', [1] toAddress has no onERC721Received()';
      } 
      if(!boolArray[2]){
        mesg += ', [2] amount <= 0';
      } 
      if(!boolArray[3]){
        mesg += ', [3] price <= 0';
      } 
      if(!boolArray[4]){
        mesg += ', [4] fundingType <= 0';
      } 
      if(!boolArray[5]){
        mesg += ', [5] serverTime <= TimeOfDeployment';
      } 
      if(!boolArray[6]){
        mesg += ', [6] tokenId + amount > maxTotalSupply';
      } 
      if(!boolArray[7]){
        mesg += ', [7] Caller is not approved by HeliumCtrt.checkPlatformSupervisor()';
      } 
      if(!boolArray[8]){
        mesg += ', [8] Registry.isFundingApproved() ... buyAmount > maxBuyAmount';
      } 
      if(!boolArray[9]){
        mesg += ', [9] Registry.isFundingApproved() ... balance + buyAmount > maxBalance';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(`${mesg} \nauthLevel: ${uintArray[0]}, maxBuyAmount: ${uintArray[1]}, maxBalance: ${uintArray[2]}`);
      resolve(true);
    }
  });
}


const sequentialMintToAdd = async(toAddressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime) => {
  console.log('\n----------------------==sequentialMintToAdd()');
  console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, serverTime: ${serverTime}`);
  const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

  if(toAddressArray.length !== amountArray.length){
    console.log(`toAddressArray and amountArray must be of the same length`);
    return false;
  }

  await asyncForEachMint(toAddressArray, async (toAddress, idxMint) => {
    const amountForThisAddr = amountArray[idxMint];
    const [toAddressArrayOut, amountArrayOut] = breakdownArray(toAddress, amountForThisAddr, maxMintAmountPerRun);
    console.log(`toAddressArray: ${toAddressArray}, amountArray: ${amountArray}
toAddressArrayOut: ${toAddressArrayOut}, amountArrayOut: ${amountArrayOut}`);
    console.log(`\n---------------==next: mint to ${toAddress} ${amountForThisAddr} tokens`);

    const balB4MintingStr1 = await instHCAT721.methods.balanceOf(toAddress).call();
    const balB4Minting1 = parseInt(balB4MintingStr1);
    const balMaxForThisAddr = balB4Minting1 + amountForThisAddr;
    console.log(`pre mint balance for this address: ${balB4MintingStr1}
    plus our minting amount ${amountForThisAddr}
    => max allowed balance for this addr: ${balMaxForThisAddr}`);

    const idxMintMax = toAddressArray.length -1;
    await asyncForEachMint2(toAddressArrayOut, idxMint, idxMintMax, async (toAddress, idxMintSub) => {
      let amountSub = amountArrayOut[idxMintSub];
      console.log(`\n    minting ${amountSub} tokens`);

      const balB4MintingStr2 = await instHCAT721.methods.balanceOf(toAddress).call();
      const balB4Minting2 = parseInt(balB4MintingStr2);
      const remainingAmount = balMaxForThisAddr - balB4Minting2;
      if(remainingAmount >= maxMintAmountPerRun && amountSub !== maxMintAmountPerRun){
        console.log('[Error] amountSub is not enough!');
        return false;
      } else if(remainingAmount < maxMintAmountPerRun && amountSub !== remainingAmount){
        console.log('[Error] amountSub is not correct!');
        return false;
      }

      if(balB4Minting2 < balMaxForThisAddr){
        console.log(`balance before sub mint: ${balB4Minting2} < max allowed balance for this addr: ${balMaxForThisAddr}`);
        const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amountSub, price, fundingType, serverTime).encodeABI();
        const TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch(async(err) => {
          console.log('\n[Error @ signTx() mintSerialNFT()]'+ err);
          await checkMint(tokenCtrtAddr, toAddress, amountSub, price, fundingType, serverTime);
        });
        console.log('TxResult', TxResult);
      } else {
        console.log('\nbalance for this address has been reached. Minting skipped');
      }
    });
  });
  console.log('\n--------------==Done sequentialMintToAdd()');
  console.log('[Completed] All of the investor list has been cycled through');
}


const sequentialMintToMax = async(toAddressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime) => {
  console.log('\n----------------------==sequentialMintToMax()');
  console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, serverTime: ${serverTime}`);
  const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

  if(toAddressArray.length !== amountArray.length){
    console.log(`toAddressArray and amountArray must be of the same length`);
    return false;
  }

  await asyncForEachMint(toAddressArray, async (toAddress, idxMint) => {
    const balMaxForThisAddr = amountArray[idxMint];
    const balB4MintingStr1 = await instHCAT721.methods.balanceOf(toAddress).call();
    const balB4Minting1 = parseInt(balB4MintingStr1);
    const [toAddressArrayOut, amountArrayOut] = breakdownArray(toAddress, balMaxForThisAddr-balB4Minting1, maxMintAmountPerRun);
    console.log(`toAddressArray: ${toAddressArray}, amountArray: ${amountArray}
toAddressArrayOut: ${toAddressArrayOut}, amountArrayOut: ${amountArrayOut}`);
    console.log(`\n---------------==next: mint to ${toAddress} ${balMaxForThisAddr} tokens`);

    const idxMintMax = toAddressArray.length -1;
    await asyncForEachMint2(toAddressArrayOut, idxMint, idxMintMax, async (toAddress, idxMintSub) => {
      let amountSub = amountArrayOut[idxMintSub];
      console.log(`\n    minting ${amountSub} tokens`);

      const balB4MintingStr2 = await instHCAT721.methods.balanceOf(toAddress).call();
      const balB4Minting2 = parseInt(balB4MintingStr2);
      const remainingAmount = balMaxForThisAddr - balB4Minting2;
      if(remainingAmount >= maxMintAmountPerRun){
        amountSub = maxMintAmountPerRun;
      } else {
        amountSub = remainingAmount;
      }
      if(amountSub > 0){
        const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amountSub, price, fundingType, serverTime).encodeABI();
        const TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch(async(err) => {
          console.log('\n[Error @ signTx() mintSerialNFT()]'+ err);
          await checkMint(tokenCtrtAddr, toAddress, amountSub, price, fundingType, serverTime);
        });
        console.log('TxResult', TxResult);
      } else {
        console.log('skipping minting 0 token');
      }
    });
  });
  console.log('\n--------------==Done sequentialMintToMax()');
  console.log('[Completed] All of the investor list has been cycled through');
}

//to be called from API and zlivechain.js, etc...
const sequentialMintSuper = async (toAddressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime, symbol) => {
  console.log('\n----------------------==inside sequentialMintSuper()...');
  //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
  if(!amountArray.every(checkIntFromOne)){
    console.log('amountArray has non integer or zero element');
    process.exit(1);
  }


  console.log('\n--------------==before minting tokens, check balances now...');
  const balanceArrayBefore = await sequentialCheckBalances(toAddressArray, tokenCtrtAddr);
  console.log('balanceArrayBefore', balanceArrayBefore);

  console.log('\n--------------==Minting tokens via sequentialMintToMax()...');
  await sequentialMintToMax(toAddressArray, amountArray, maxMintAmountPerRun, fundingType, pricing, tokenCtrtAddr, serverTime).catch((err) => {
    console.log('[Error @ sequentialMintToMax]'+ err);
    return false;
  });
  // console.log('\n--------------==Minting tokens via sequentialMintToAdd()...');
  // await sequentialMintToAdd(toAddressArray, amountArray, maxMintAmountPerRun, fundingType, pricing, tokenCtrtAddr, serverTime).catch((err) => {
  //   console.log('[Error @ sequentialMintToAdd]'+ err);
  //   return false;
  // });

  const isToMax = true;
  console.log('\n--------------==after minting tokens, check balances now...');
  const [isCorrectAmountArray, balanceArrayAfter] = await sequentialCheckBalancesAfter(toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore, isToMax).catch((err) => {
    console.log('[Error @ sequentialCheckBalancesAfter]'+ err);
  });
  // const [isCorrectAmountArray, balanceArrayAfter] = await sequentialCheckBalancesAfter(toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore).catch((err) => {
  //   console.log('[Error @ sequentialCheckBalancesAfter]'+ err);
  // });
  console.log('\n--------------==Done sequentialCheckBalancesAfter()');
  console.log('\nbalanceArrayBefore', balanceArrayBefore, '\nbalanceArrayAfter', balanceArrayAfter);

  const isFailed = isCorrectAmountArray.includes(false);
  console.log('\nisFailed:', isFailed, ', isCorrectAmountArray', isCorrectAmountArray);
  //process.exit(0);

  console.log('\n--------------==About to call addAssetRecordRowArray()');
  const ar_time = serverTime;
  const singleActualIncomePayment = 0;// after minting tokens

  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const moving_ave_holding_cost = 13000;

  const acquiredCostArray = amountArray.map((element) => {
    return element * pricing;
  });
  console.log(acquiredCostArray);

  const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost).catch((err) => {
    console.log('[Error @ addAssetRecordRowArray]'+ err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError,false,false,false];
  });
  console.log('emailArrayError:', emailArrayError, ', amountArrayError:', amountArrayError);

  const actualPaymentTime = serverTime;
  const payablePeriodEnd = 0;
  const result2 = await addActualPaymentTime(actualPaymentTime, symbol, payablePeriodEnd).catch((err) => {
    console.log('[Error @ addActualPaymentTime]'+ err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError,true,false,false];
  });

  const result3 = await setFundingStateDB(symbol, 'ONM', 'na', 'na').catch((err) => {
    console('[Error @ setFundingStateDB()', err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true, false, false];
  });

return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true, result2, result3];//last three boolean values: addAssetRecordRowArray(), addActualPaymentTime(), setFundingStateDB()
  //resolve(isFailed, isCorrectAmountArray);
}


//-----------------------------==
const sequentialRunTsMain = async (mainInputArray, waitTime, serverTime, extraInputArray) => {
  console.log('\n----------==inside sequentialRunTsMain()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, serverTime= ${serverTime}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime is not an integer. serverTime:', serverTime);
    return false;
  }
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return false;
  }

  const actionType = extraInputArray[0];
  if(waitTime < 7000 && actionType !== 'updateExpiredOrders'){
    //give DB a list of todos, no async/await ... make orders expired
    console.log('[Warning] waitTime is < min 5000, which is determined by the blockchain block interval time');
    return false;
  }
  //console.log('actionType:', actionType);

  await asyncForEachTsMain(mainInputArray, async (item) => {
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
          return false;
        }
        const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
        const serverTimeM = moment(serverTime, ['YYYYMMDD']);
        //console.log('serverTimeM', serverTimeM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
        if (serverTimeM >= oPurchaseDateM.add(3, 'days')) {
          console.log(`oid ${oid} is found serverTime >= oPurchaseDate ... write to DB`);
          const queryStr1 = 'UPDATE order_list SET o_paymentStatus = "expired" WHERE o_id = ?';
          const results = await mysqlPoolQueryB(queryStr1, [oid]).catch((err) => {
            console.log('[Error @ mysqlPoolQueryB(queryStr1)]: setting o_paymentStatus to expired; oid: '+oid+ ', err: '+ err);
          });
          console.log(`[Success] have written status of oid ${oid} as expired.`);
        }

      } else {
        //send time to contracts to see the result of determined state: e.g. fundingState, tokenState, ...
        const targetAddr = await findCtrtAddr(symbol, actionType).catch((err) => {
          console.log('[Error @findCtrtAddr]:'+ err);
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
  console.log('sequentialRunTsMain() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside mintToken()');
    await getTime().then(async function (serverTime) {
      console.log('acquired serverTime', serverTime);
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      let encodedData = instHCAT721.methods.mintSerialNFT(to, amountToMint, price, fundingType, serverTime).encodeABI();
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch((err) => {
        reject('[Error @ signTx() mintSerialNFT(serverTime)]'+ err);
        return false;
      });
      //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
      console.log('TxResult', TxResult);
      resolve(true);
    });
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
    const queryStr2 = 'SELECT p_SYMBOL FROM product WHERE (p_state = "initial" AND p_CFSD <= '+serverTime+') OR (p_state = "funding" AND p_CFED <= '+serverTime+') OR (p_state = "fundingGoalReached" AND p_CFED <= '+serverTime+')';
    const symbolArray = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
      reject('[Error @ updateFundingStateFromDB: mysqlPoolQueryB(queryStr2)]: '+ err);
      return false;
    });

    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateFundingStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateFundingStateFromDB] no symbol was found for updating its crowdfunding contract');
    } else if (symbolArrayLen > 0) {
      await sequentialRunTsMain(symbolArray, timeIntervalOfNewBlocks, serverTime, ['crowdfunding']);
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

    const queryStr1 = 'SELECT p_SYMBOL FROM product WHERE p_CFED <= ? AND (p_state = "initial" OR p_state = "funding" OR p_state = "fundingGoalReached")';
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

      //const queryStr = 'UPDATE product SET p_state = ? WHERE p_SYMBOL = ?';
      const queryStr3 = 'UPDATE order_list SET o_paymentStatus = "expired" WHERE o_symbol = ? AND o_paymentStatus = "waiting"';
      await asyncForEachOrderExpiry(symbolArray, async (symbol, index) => {
        /*
        //------------== auto determines the crowdfunding results -> write it into DB
        const crowdFundingAddr = await findCtrtAddr(symbol.p_SYMBOL,'crowdfunding').catch((err) => {
          console.error('[Error @findCtrtAddr]:'+ err);
          continue;
        });
        const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    
        const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
        let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData);
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
          console.log('\n[Error @ mysqlPoolQueryB(queryStr)]'+ err);
        });
        console.log('\nUpdated product of', symbol.p_SYMBOL, results2);
        */

        //------------== 
        const results3 = await mysqlPoolQueryB(queryStr3, [symbol.p_SYMBOL]).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr3)] '+ err);
          return false;
        });
        console.log('-------==[Success] updated orders to expired for symbol', symbol.p_SYMBOL);
        resolve(true);
      });
    }
  });
  //process.exit(0);
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
      resolve(true);

    } else {
      if(!boolArray[0]){
        mesg += ', [0] serverTime >= CFSD2';
      }
      if(!boolArray[1]){
        mesg += ', [1] serverTime < CFED2';
      }
      if(!boolArray[2]){
        mesg += ', [2] checkPlatformSupervisor()';
      }
      if(!boolArray[3]){
        mesg += ', [3] addrAssetbook.isContract()';
      }
      if(!boolArray[4]){
        mesg += ', [4] addrAssetbook onERC721Received()';
      }
      if(!boolArray[5]){
        mesg += ', [5] quantityToInvest > 0';
      }
      if(!boolArray[6]){
        mesg += ', [6] not enough remainingQty';
      }
      if(!boolArray[7]){
        mesg += ', [7] serverTime > TimeOfDeployment';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(true);
    }
  });
}

// yarn run testts -a 2 -c 1
// after order status change: waiting -> paid -> write into crowdfunding contract
const addAssetbooksIntoCFC = async (serverTime) => {
  // check if serverTime > CFSD2 for each symbol...
  console.log('\ninside addAssetbooksIntoCFC()... serverTime:',serverTime);
  const queryStr1 = 'SELECT DISTINCT o_symbol FROM order_list WHERE o_paymentStatus = "paid"';// AND o_symbol ="AOOS1902"
  const results1 = await mysqlPoolQueryB(queryStr1, []).catch((err) => {
    console.log('\n[Error @ addAssetbooksIntoCFC > mysqlPoolQueryB(queryStr1)]'+ err);
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

  await asyncForEachAbCFC(symbolArray, async (symbol, index) => {

    const crowdFundingAddr = await findCtrtAddr(symbol, 'crowdfunding');
    console.error(`\n------==[Good] Found crowdsaleaddresses from symbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr}`);

    // Gives arrays of assetbooks, emails, and tokencounts for symbol x and payment status of y
    const queryStr3 = 'SELECT User.u_assetbookContractAddress, OrderList.o_email, OrderList.o_tokenCount, OrderList.o_id FROM user User, order OrderList WHERE User.u_email = OrderList.o_email AND OrderList.o_paymentStatus = "paid" AND OrderList.o_symbol = ?';
    //const queryStr3 = 'SELECT o_email, o_tokenCount, o_id FROM order_list WHERE o_symbol = ? AND o_paymentStatus = "paid"';
    const results3 = await mysqlPoolQueryB(queryStr3, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]'+ err);
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
        return false;//process.exit(0);
      }
      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const investorListBf = await instCrowdFunding.methods.getInvestors(0, 0).call();
      console.log(`\nassetbookArrayBf: ${investorListBf[0]}, \ninvestedTokenQtyArrayBf: ${investorListBf[1]}`);

      await asyncForEachAbCFC2(assetbookArray, async (addrAssetbook, index) => {
        const tokenCount = parseInt(tokenCountArray[index]);
        console.log(`\n----==[Good] For ${addrAssetbook}, found its tokenCount ${tokenCount}`);

        console.log(`\n[Good] About to write the assetbook address into the crowdfunding contract
tokenCount: ${tokenCount}, serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

        //const investorList = await instCrowdFunding.methods.getInvestors(0, 0).call();
        //console.log('\ninvestList', investorList);
        //console.log(`\nassetbookArrayBf: ${investorList[0]}, \ninvestedTokenQtyArrayBf: ${investorList[1]}`);
        
        const encodedData = instCrowdFunding.methods.invest(addrAssetbook, tokenCount, serverTime).encodeABI();
        //invest(_assetbook, _quantityToInvest, serverTime)
        //OR...  investInBatch( _assetbookArr, _quantityToInvestArr, serverTime)
        ///*
        let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData).catch( async(err) => {
          const fundingState = await instCrowdFunding.methods.fundingState().call();
          console.log('\nfundingState:', fundingState);

          await checkInvest(crowdFundingAddr, addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });

          console.log('\n[Error @ signTx() invest()]'+ err);
          return false;
        });
        const txnHash = TxResult.transactionHash;
        txnHashArray.push(txnHash);
        console.log(`\nTxResult: ${TxResult} \ntxnHash: ${txnHash}`);

        const investorListAf = await instCrowdFunding.methods.getInvestors(0, 0).call();
        console.log(`\nassetbookArrayAf: ${investorListAf[0]}, \ninvestedTokenQtyArrayAf: ${investorListAf[1]}`);
          
      });

      console.log(`\ntxnHashArray: ${txnHashArray}`)
      if(orderIdArray.length === txnHashArray.length){
        const queryStr5 = 'UPDATE order_list SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';
        await asyncForEachAbCFC3(orderIdArray, async (orderId, index) => {
          const results5 = await mysqlPoolQueryB(queryStr5, [txnHashArray[index], orderId]).catch((err) => {
            console.log('\n[Error @ mysqlPoolQueryB(queryStr5)]'+ err);
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
    return [[undefined],[undefined]];
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

    const str = 'SELECT p_SYMBOL FROM product WHERE (p_tokenState = "lockup" AND p_lockuptime <= ?) OR (p_tokenState = "normal" AND p_validdate <= ?)';
    const symbolArray = await mysqlPoolQueryB(str, [serverTime, serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(str)] '+ err);
      return false;
    });
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateTokenStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateTokenStateFromDB] no symbol was found');
    } else if (symbolArrayLen > 0) {
      await sequentialRunTsMain(symbolArray, timeIntervalOfNewBlocks, serverTime, ['tokencontroller']);
    }
    resolve(true);
  });
}

const writeToBlockchainAndDatabase = async (targetAddr, serverTime, symbol, actionType) => {
  if(actionType === 'crowdfunding'){
    const fundingStateStr = await updateFundingStateCFC(targetAddr, serverTime, symbol);
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
    const tokenStateStr = await updateTokenStateTCC(targetAddr, serverTime, symbol);
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
    console.log('inside incomemanager timeserver... not active');
    // const isScheduleGoodForRelease = await checkIMC_isSchGoodForRelease(targetAddr, serverTime);
    // console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);
    if(false){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, targetAddr);

      //for loop for each token owner(bankResult) => {}
      const actualPaymentTime = 0;//bankResult.paymentDateTime
      const actualPaymentAmount = 0;//bankResult.paymentAmount
      const errorCode = 0;//bankResult.paymentError

      //write bank's confirmation into IncomeManager.sol
      let encodedData = instIncomeManager.methods.setPaymentReleaseResults(serverTime, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, targetAddr, encodedData).catch((err) => {
        console.log('\n[Error @ signTx() updateState(serverTime)]'+ err);
        return undefined;
      });
      console.log('TxResult', TxResult);

      //const scheduleDetails = await instIncomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
      //console.log('[Success @ updateIncomeManager(serverTime)] scheduleDetails:', scheduleDetails);

    } else {

    }
  }
  console.log('end of writeToBlockchainAndDatabase() for', symbol, 'actionType:', actionType);
}



//---------------------------==Income Manager contract / IncomeManagerContract
//---------------------------==
const get_schCindex = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_schCindex()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return undefined;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result = await instIncomeManager.methods.schCindex().call();
    //console.log('\nschCindex:', result);//assert.equal(result, 0);
    resolve(result);
  });
}

const tokenCtrt = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside tokenCtrt()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return undefined;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result = await instIncomeManager.methods.tokenCtrt().call();
    //console.log('\ntokenCtrt:', result);//assert.equal(result, 0);
    resolve(result);
  });
}

const get_paymentCount = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_paymentCount()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return undefined;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result = await instIncomeManager.methods.paymentCount().call();
    //console.log('\npaymentCount:', result);//assert.equal(result, 0);
    resolve(result);
  });
}

const get_TimeOfDeployment = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_TimeOfDeployment()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return undefined;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result = await instIncomeManager.methods.TimeOfDeployment().call();
    //console.log('\nTimeOfDeployment:', result);//assert.equal(result, 0);
    resolve(result);
  });
}


//yarn run testmt -f 12
const getIncomeSchedule = async(symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside getIncomeSchedule()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    //const result = await instIncomeManager.methods.schCindex().call();
    //console.log('\nschCindex:', result);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}): \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nerrorCode: ${result2[4]}\nisErrorResolved: ${result2[5]}`);
    resolve(result2);
  });
}

//yarn run testmt -f 13
const getIncomeScheduleList = async(symbol, indexStart = 0, amount = 0) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside getIncomeScheduleList()');
    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    const scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    // const schCindexM = await instIncomeManager.methods.schCindex().call();
    // console.log('schCindex:', schCindexM);//assert.equal(result, 0);

    resolve(scheduleList)
  });
}


//yarn run testmt -f 14
const checkAddForecastedScheduleBatch1 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside checkAddForecastedScheduleBatch1()');
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      console.log('forecastedPayableTimes has length zero');
      return false;
    }

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      console.log('[Error @findCtrtAddr]:'+ err);
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    
    const result = await instIncomeManager.methods.checkAddForecastedScheduleBatch1(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
    //assuming that backendAddr account is set to PlatformSupervisor in Helium contract 
    resolve(result);
  });
}

// yarn run testmt -f 15
const checkAddForecastedScheduleBatch2 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside checkAddForecastedScheduleBatch2()');
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      console.log('forecastedPayableTimes has length zero');
      return false;
    }

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      console.log('[Error @findCtrtAddr]:'+ err);
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    
    const result = await instIncomeManager.methods.checkAddForecastedScheduleBatch2(forecastedPayableTimes).call({ from: backendAddr });
    resolve(result);//assert.equal(result, 0);
  });
}


// yarn run testmt -f 16
const checkAddForecastedScheduleBatch = async (symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-----------------==inside checkAddForecastedScheduleBatch()');
    //console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
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

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => console.log('[Error @findCtrtAddr]:'+ err));

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const isPS = await instIncomeManager.methods.checkPlatformSupervisor().call({ from: backendAddr }); console.log('\nisPS:', isPS);

    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schCindexM).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schCindexM}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nerrorCode: ${result2[4]}\nisErrorResolved: ${result2[5]}`);

    const first_forecastedPayableTime = parseInt(forecastedPayableTimes[0]);
    const last_forecastedPayableTime = parseInt(result2[0]);
    if(last_forecastedPayableTime >= first_forecastedPayableTime){
      reject(`last_forecastedPayableTime ${last_forecastedPayableTime} should be < first_forecastedPayableTime ${first_forecastedPayableTime}`);
      return false;
    }
    const results = await instIncomeManager.methods.checkAddForecastedScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
    console.log('results', results);

    resolve(results);
  });
}


//yarn run testmt -f 17
const addForecastedScheduleBatch = async (symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-----------------==inside addForecastedScheduleBatch()');
    const addrIncomeManager = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });

    console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);

    const length1 = forecastedPayableTimes.length;
    if(length1 !== forecastedPayableAmounts.length){
      reject('[Error] forecastedPayableTimes and forecastedPayableAmounts from DB should have the same length');
      //console.log(mesg);
      return false;
    }
  
    // const ischeckAddForecastedScheduleBatch = await checkAddForecastedScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
    //   reject('[Error @checkAddForecastedScheduleBatch]: '+ err);
    //   return false;
    // });
    // console.log('\nischeckAddForecastedScheduleBatch:', ischeckAddForecastedScheduleBatch);

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    //console.log(`getIncomeSchedule(${schCindexM}):\n${result2[0]}\n${result2[1]}\n${result2[2]}\n${result2[3]}\n${result2[4]}\n${result2[5]}\n${result2[6]}`);// all should be 0 and false before adding a new schedule
    let encodedData = instIncomeManager.methods.addForecastedScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).encodeABI();
    console.log('about to execute addForecastedScheduleBatch()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
      reject('[Error @ signTx() addForecastedScheduleBatch()]'+ err);
      return false;
    });
    console.log('TxResult', TxResult);
    resolve(true);
  });
}


const addForecastedScheduleBatchFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {

    const [forecastedPayableTimes, forecastedPayableAmounts, forecastedPayableTimesError, forecastedPayableAmountsError] = await getForecastedSchedulesFromDB(symbol);
    console.log(`forecastedPayableTimes: ${forecastedPayableTimes} 
  forecastedPayableAmounts: ${forecastedPayableAmounts}
  forecastedPayableTimesError: ${forecastedPayableTimesError}
  forecastedPayableAmountsError: ${forecastedPayableAmountsError}`);
  
    if(forecastedPayableTimesError.length === 0 && forecastedPayableAmountsError.length === 0){
      const addrIncomeManager = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
        reject('[Error @findCtrtAddr]:'+ err);
        return false;
      });
      const results2 = await addForecastedScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
      if(results2){
        resolve(true);
      } else {
        reject(false);
      }
    } else {
      console.log(`Some values are found invalid. Check forecastedPayableTimesError and forecastedPayableAmountsError`);
      reject(false);
    }
  });
}

//yarn run testmt -f 19
const editActualSchedule = async (symbol, schIndex, actualPaymentTime, actualPaymentAmount) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside editActualSchedule()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    console.log('check001');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    let encodedData = instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount).encodeABI();
    console.log('about to execute editActualSchedule()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
      reject('[Error @ signTx() editActualSchedule()]'+ err);
      return false;
    });
    console.log('TxResult', TxResult);
    resolve(true);
  });
}

//yarn run testmt -f 20
const addPaymentCount = async (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside addPaymentCount()');
    console.log('symbol', symbol);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    console.log('check001');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    let encodedData = instIncomeManager.methods.addPaymentCount().encodeABI();
    console.log('about to execute addPaymentCount()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
      reject('[Error @ signTx() addPaymentCount()]'+ err);
      return false;
    });
    console.log('TxResult', TxResult);
    resolve(true);
  });
}



//yarn run testmt -f 21
const setErrResolution = async (symbol, schIndex, isErrorResolved, errorCode) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside setErrResolution()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    if(typeof isErrorResolved === "boolean"){
      reject('[Error @isErrorResolved not boolean]:'+ err);
      return false;

    } else if(typeof errorCode !== "number" || errorCode < 0 || errorCode > 255){
      reject('[Error @errorCode]:'+ err);
      return false;
    }
    console.log('check001');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    let encodedData = instIncomeManager.methods.setErrResolution(schIndex, isErrorResolved, errorCode).encodeABI();
    console.log('about to execute setErrResolution()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
      reject('[Error @ signTx() setErrResolution()]'+ err);
      return false;
    });
    console.log('TxResult', TxResult);
    resolve(true);
  });
}






//------------------------------------==
//------------------------------------==
// orderDate+3 => expired orders
// yarn run testts -a 2 -c 19
const updateExpiredOrders = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateExpiredOrders(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }

    const queryStr ='SELECT o_id, o_purchaseDate FROM order_list WHERE o_paymentStatus = "waiting"';
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
      await sequentialRunTsMain(results, timeIntervalUpdateExpiredOrders, serverTime, ['updateExpiredOrders']);
    }
    resolve(true);
  });
}



//---------------------------==Assetbook Contract / Assetbooks
//---------------------------==
const get_assetOwner = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==assetOwner()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.assetOwner().call();
    resolve(result);
  });
}

const get_lastLoginTime = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==lastLoginTime()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.lastLoginTime().call();
    resolve(result);
  });
}

const checkIsContract = async(addrAssetBook, assetAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==checkIsContract()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.checkIsContract(assetAddr).call();
    resolve(result);
  });
}


const getAssetbookDetails = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==getAssetbookDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = await instAssetBook.methods.assetOwner().call();
    result[1] = await instAssetBook.methods.addrHeliumContract().call();
    result[2] = await instAssetBook.methods.lastLoginTime().call();
    result[3] = await instAssetBook.methods.antiPlatformOverrideDays().call();
    result[4] = await instAssetBook.methods.checkAssetOwner().call();
    result[5] = await instAssetBook.methods.checkCustomerService().call({from: backendAddr});

    result[6] = await instAssetBook.methods.assetOwner_flag().call();
    result[7] = await instAssetBook.methods.HeliumContract_flag().call();
    result[8] = await instAssetBook.methods.endorsers_flag().call();
    result[9] = await instAssetBook.methods.calculateVotes().call();
    result[10] = await instAssetBook.methods.endorserCount().call();
    result[11] = await instAssetBook.methods.isAblePlatformOverride().call();
    console.log('\nresult:', result);
    resolve(result);
  });
}

const endorsers = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==endorsers()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0];
    result[0] = await instAssetBook.methods.endorsers(1).call();
    result[1] = await instAssetBook.methods.endorsers(2).call();
    result[2] = await instAssetBook.methods.endorsers(3).call();
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
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() setHeliumAddr()]'+ err);
      return false;
    });
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
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() HeliumContractVote(serverTime)]'+ err);
      return false;
    });
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
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() resetVoteStatus()]'+ err);
      return false;
    });
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
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() changeAssetOwner()]'+ err);
      return false;
    });
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
/* const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
 const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
 let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() updateState(serverTime)]'+ err);
      return undefined;
    });
console.log('\nTxResult', TxResult);
*/

//----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
const checkSafeTransferFromBatchFunction = async(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime) => {
  return new Promise( async ( resolve, reject ) => {

    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);

    const result = await instAssetBookFrom.methods.checkSafeTransferFromBatch(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).call({from: _fromAssetOwner});
    console.log('\ncheckSafeTransferFromBatch result', result);

    const boolArray = result[0];
    let mesg;
    if(amountArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', fromAddr has no contract';
      } else if(!boolArray[1]){
        mesg += ', toAddr has no contract';
      } else if(!boolArray[2]){
        mesg += ', toAddr has no onERC721Received()';
      } else if(!boolArray[3]){
        mesg += ', amount =< 0';
      } else if(!boolArray[4]){
        mesg += ', price =< 0';
      } else if(!boolArray[5]){
        mesg += ', fromAddr is the same as toAddr';
      } else if(!boolArray[6]){
        mesg += ', serverTime <= TimeOfDeployment';
      } else if(!boolArray[7]){
        mesg += ', TokenController not approved/not operational';
      } else if(!boolArray[8]){
        mesg += ', Registry has not approved toAddr';
      } else if(!boolArray[9]){
        mesg += ', Registry has not approved fromAddr';
      } else if(!boolArray[10]){
        mesg += ', balance of fromAddr is not enough to send tokens';
      } else if(!boolArray[11]){
        mesg += ', allowed amount from _from to caller is not enough to send tokens';
      } else if(!result[1]){
        mesg += ', assetAddr does not have contract';
      } else if(!result[2]){
        mesg += ', caller is not the assetOwner';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(mesg);
    }
  });
}


/**
 * Frontend makes API calls at '/HCAT721_AssetTokenContract/:nftSymbol' to get symbol XYZ's contract addresses
 * 
 * @param {*} addrHCAT721  the address of the HCAT721 smart contract
 * @param {*} fromAssetbook  the assetbook contract address from which the transfer deduct amount
 * @param {*} toAssetbook  the assetbook contract address to which the transfer will add amount
 * @param {*} amountStr  amount of this transfer
 * @param {*} priceStr  price associated with this transfer
 * @param {*} _fromAssetOwner  EOA that controls the assetbook
 * @param {*} _fromAssetOwnerpkRaw  EOA private key of the above EOA
 */
const transferTokens = async (addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, _fromAssetOwner, _fromAssetOwnerpkRaw ) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('entering transferTokens()');

    let mesg;
    const serverTimeStr = 201905281400;// only used for emitting events in the blockchain
    const addrZero = "0x0000000000000000000000000000000000000000";

    // const _fromAssetOwner = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    // const _fromAssetOwnerpkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";


    if (!Number.isInteger(amountStr) || !Number.isInteger(priceStr) || !Number.isInteger(serverTimeStr)){
      mesg = 'input values should be integers';
      console.log(`mesg, amount: ${amountStr}, price: ${priceStr}, serverTime: ${serverTimeStr}`);
      reject(mesg);
      return false;
    }

    const amount = parseInt(amountStr);
    const price = parseInt(priceStr);
    const serverTime = parseInt(serverTimeStr);
    if(amountStr < 1 || price < 1 || serverTime < 201905281000){
      mesg = 'input values should be > 0 or 201905281000';
      console.log(`mesg, amount: ${amount}, price: ${price}, serverTime: ${serverTime}`);
      reject(mesg);
      return false;
    }
    console.log('after checking amount and price values');

    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);
    console.log('after contract instances');


    console.log('fromAssetbook', fromAssetbook);
    const balanceFromB4Str = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToB4Str = await instHCAT721.methods.balanceOf(toAssetbook).call();
    const balanceFromB4 = parseInt(balanceFromB4Str);
    const balanceToB4 = parseInt(balanceToB4Str);
    console.log('balanceFromB4', balanceFromB4, 'balanceToB4', balanceToB4);

    //----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
    try {
      const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).encodeABI();

      let TxResult = await signTx(_fromAssetOwner, _fromAssetOwnerpkRaw, fromAssetbook, encodedData).catch((err) => {
        reject('[Error @ signTx() safeTransferFromBatch()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);

    } catch (error) {
      console.log("error:" + error);
      const result = checkSafeTransferFromBatchFunction(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime);
      //assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime
      reject(result);
      return false;
    }

    const balanceFromAfter = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToAfter = await instHCAT721.methods.balanceOf(toAssetbook).call();
    console.log(`balanceFromB4: ${balanceFromB4}
    balanceFromAfter: ${balanceFromAfter}

    balanceToB4: ${balanceToB4}
    balanceToAfter:   ${balanceToAfter}
    `);

    resolve(true);
    //call /HCAT721_AssetTokenContract/safeTransferFromBatch API to record txn info
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



module.exports = {
  addPlatformSupervisor, checkPlatformSupervisor, addCustomerService, checkCustomerService, setRestrictions, updateExpiredOrders, getDetailsCFC, 
  sequentialRunTsMain, sequentialMintToAdd, sequentialMintToMax, sequentialCheckBalancesAfter, sequentialCheckBalances, sequentialMintSuper,
  getFundingStateCFC, getHeliumAddrCFC, updateFundingStateFromDB, updateFundingStateCFC,
  addAssetbooksIntoCFC, getInvestorsFromCFC,
  getTokenStateTCC, getHeliumAddrTCC, updateTokenStateTCC, updateTokenStateFromDB, makeOrdersExpiredCFED2, getInvestorsFromCFC_Check,
  get_schCindex, tokenCtrt, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule, addPaymentCount, addForecastedScheduleBatchFromDB, setErrResolution, resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr, endorsers
}
