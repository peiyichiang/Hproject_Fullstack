/**
$ yarn run livechain -c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 
//yarn run livechain -c 1 --f 0
checkDeployedContracts

//yarn run livechain -c 1 --f 1
setupTest

//yarn run livechain -c 1 --f 2
setTokenController

//yarn run livechain -c 1 --f 3
showAssetBookBalance_TokenId

//yarn run livechain -c 1 --f 4
showAssetInfo

//yarn run livechain -c 1 --f 5 -a 1 -b 190
mintTokens

//yarn run livechain -c 1 --f 6
sequentialMintSuperAPI

//yarn run livechain -c 1 --f 7 -a 1 -b 190 -t 2
transferTokens

//yarn run livechain -c 1 --f 39
transferTokensKY
*/
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
//const PrivateKeyProvider = require("truffle-privatekey-provider");

const { sequentialMintSuper } = require('../../timeserver/blockchain');

const { getTime, asyncForEach, checkBoolTrueArray } = require('../../timeserver/utilities');

const { findCtrtAddr, getForecastedSchedulesFromDB } = require('../../timeserver/mysql');

const {serverPort, blockchainURL, gasLimitValue, gasPriceValue, operationMode, backendAddrChoice} = require('../../timeserver/envVariables');

const { addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray,  symNum, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid, CFSD, CFED, argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManagement
} = require('./zTestParameters');

const { TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManagement, ProductManager
} = require('./zsetupData');

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10]= assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;
// assetOwnerArray, assetOwnerpkRawArray

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
const [addrAssetBook1, addrAssetBook2, addrAssetBook3, addrAssetBook4, addrAssetBook5, addrAssetBook6, addrAssetBook7, addrAssetBook8, addrAssetBook9, addrAssetBook10] = assetbookArray;
let provider, chain, func, arg1, arg2, arg3, result, backendAddr, backendAddrpkRaw;

//backendAddrChoice: 0 API dev, 1 Blockchain dev, 2 Backend dev, 3 .., 4 timeserver
if(backendAddrChoice === 0){//reserved to API developer
  backendAddr = admin;
  backendAddrpkRaw = adminpkRaw;

} else if(backendAddrChoice === 1){//reserved to Blockchain developer
  backendAddr = AssetOwner1;
  backendAddrpkRaw = AssetOwner1pkRaw;

} else if(backendAddrChoice === 2){//reserved to Backend developer
  backendAddr = AssetOwner2;
  backendAddrpkRaw = AssetOwner2pkRaw;

} else if(backendAddrChoice === 3){//
  backendAddr = AssetOwner3;
  backendAddrpkRaw = AssetOwner3pkRaw;

} else if(backendAddrChoice === 4){//reserved tp the timeserver
  backendAddr = AssetOwner4;
  backendAddrpkRaw = AssetOwner4pkRaw;
}
console.log(`using backendAddr: ${backendAddr}`);


console.log('process.argv', process.argv);
const arguLen = process.argv.length;
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run livechain -c C --f F -a A -b b');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  process.exit(0);
} else if (arguLen < 4) {
  console.log('not enough arguments. --h for help');
  chain = 1;
} else {
  //Number.isInteger(process.argv[3])
  chain = parseInt(process.argv[3]);
  if (chain < 0) {
    console.log('chain value should be >= 0. chain = ', chain);
    process.exit(1);
  }
  if (arguLen < 6) {
    func = 0;
  } else {
    func = parseInt(process.argv[5]);
    if (arguLen < 8) {
      arg1 = 0;
    } else {
      arg1 = parseInt(process.argv[7]);
      if (arguLen < 10) {
        arg2 = 0;
      } else {
        arg2 = parseInt(process.argv[9]);
        if (arguLen < 12) {
          arg3 = 0;
        } else {
          arg3 = parseInt(process.argv[11]);
        }
      }
    }
  }
}


let txnNum = 2;
console.log('chain = ', chain, ', txnNum =', txnNum);

let addrTestCtrt, assetbook1M, assetbook2M;
let amount, to, fromAssetbook, toAssetbook, tokenIds, tokenId_now, nodeUrl, authLevelM, ownerCindexM, isOwnerAdded, idxToOwnerM;
const uriBase = "nccu0".trim();

//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain
  console.log('inside chain === 1');

  let scenario = 1;//1: new accounts, 2: POA node accounts
  if (scenario === 1) {
    console.log('scenario = ', scenario);
    console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);
    prefix = '0x';

    /*choiceOfHCAT721 = 1; 1: HCAT721_Test, 2: HCAT721
    if(choiceOfHCAT721===1){
      console.log('use HCAT721_Test!!!');
      _addrHCAT721 = '0x6978c55dee93a2351150A8C34BD5a2ddA6D1d327';
    } else if(choiceOfHCAT721===2){
      console.log('use HCAT721');
      _addrHCAT721 = "0xe589C3c07D6733b57adD21F8C17132059Ad6b2b0";
    }*/
    
    console.log('\nconst symbolArray =', symbolArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray, ';');

    chairman = AssetOwner1;
    director = AssetOwner2;
    manager = AssetOwner3;
    owner = AssetOwner4;

  } else if (scenario === 2) {
    console.log('scenario = ', scenario);
  }

  console.log('leaving chain === 1');

} else if (chain === 2) {
  const options = { gasLimit: parseInt(gasLimitValue) };
  provider = ganache.provider(options);

} else if (chain === 3) {
  const options = { gasLimit: parseInt(gasLimitValue) };
  provider = ganache.provider(options);

} else {
  console.log('chain is out of range. chain =', chain);
}
console.log('blockchainURL = '+blockchainURL);
const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

require('events').EventEmitter.defaultMaxListeners = 30;
//require('events').EventEmitter.prototype._maxListeners = 20;
/* emitter.setMaxListeners();
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
*/

//--------------------==
console.log('Load contract json file compiled from sol file');

//const { interface, bytecode } = require('../compile');//dot dot for one level up



console.log('\n---------------==Make contract instances from deployment');

console.log('more variables...');
let balanceM, balance0, balance1, balance2;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";
let tokenId, uriStr, uriBytes32, uriStrB, tokenOwner, tokenOwnerM;
let tokenControllerDetail, timeAtDeployment;
let TimeUnlockM, TimeValidM, isLockedForRelease, isTokenApproved;
let isTokenApprovedOperational, bool2, userId, serverTime;


const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);

const instAssetBook1 = new web3.eth.Contract(AssetBook.abi, addrAssetBook1);
const instAssetBook2 = new web3.eth.Contract(AssetBook.abi, addrAssetBook2);
const instAssetBook3 = new web3.eth.Contract(AssetBook.abi, addrAssetBook3);

const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addrCrowdFunding);

/*let choiceOfHCAT721;
if(choiceOfHCAT721===1){
  console.log('use HCAT721_Test!!!');
  instHCAT721 = new web3.eth.Contract(HCAT721_Test.abi, addrHCAT721);
} else if(choiceOfHCAT721===2){
  console.log('use HCAT721');
  instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
}*/
const instTestCtrt = new web3.eth.Contract(TestCtrt.abi, addrTestCtrt);
// const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManager);
// const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);

const checkEq = (value1, value2) => {
  if (value1 === value2) {
    console.log('checked ok');
  } else {
    console.log("\x1b[31m", '[Error] _' + value1 + '<vs>' + value2 + '_', typeof value1, typeof value2);
    process.exit(1);
  }
}

//yarn run livechain -c 1 --f 0
const checkDeployedContracts = async () => {


}


//yarn run livechain -c 1 --f 18
const changePermissionToPS_API = async() => {
  const platformSupervisorNew = AssetOwner1;
  const encodedData= instHelium.methods.changePermissionToPS(platformSupervisorNew).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, addrHelium, encodedData).catch((err) => {
    reject('[Error @ signTx() changePermissionToPS()]'+ err);
    return false;
  });
  //console.log('\nTxResult', TxResult);
  let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
  console.log('\nafter adding platformSupervisor: result', result);
  process.exit(0);
}


//yarn run livechain -c 1 --f 19
const addPlatformSupervisor_API = async() => {
  const platformSupervisorNew = AssetOwner10;
  const encodedData= instHelium.methods.addPlatformSupervisor(platformSupervisorNew).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, addrHelium, encodedData).catch((err) => {
    reject('[Error @ signTx() addPlatformSupervisor()]'+ err);
    return false;
  });
  //console.log('\nTxResult', TxResult);
  let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
  console.log('\nafter adding platformSupervisor: result', result);
  process.exit(0);
}

//yarn run livechain -c 1 --f 20
const addBackendToCustomerService = async() => {
  console.log(`\n----------------==addBackendToCustomerService() \nAdding AssetOwner3: ${AssetOwner3} \nfrom admin: ${admin}`);
  const encodedData = instHelium.methods.addCustomerService(AssetOwner3).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, addrHelium, encodedData);
  //console.log('\nTxResult', TxResult);
  console.log(`after adding backend as customerService...`);

  isCustomerService = await instHelium.methods.checkCustomerService(AssetOwner3).call();
  console.log('isCustomerService:', isCustomerService);
  process.exit(0);
}

//yarn run livechain -c 1 --f 21


//yarn run livechain -c 1 --f 22
const getUserFromAssetbook = async() => {
  const index = 0;
  const assetbookAddr = assetbookArray[index];
  console.log(`\n-----------------==getUserFromAssetbook 
assetbookArray length: ${assetbookArray.length}
index = ${index}, assetbookAddr: ${assetbookAddr}`);

  const userDetails = await instRegistry.methods.getUserFromAssetbook(assetbookAddr).call();
  console.log('\nuserDetails', userDetails);
  process.exit(0);
}



//yarn run livechain -c 1 --f 1
// -a 1 -b 3
const setupTest = async () => {
  //const addr1 = web3.utils.toChecksumAddress(addrPlatform);

  console.log('\n--------==Start tests...');
  console.log('admin', admin);
  console.log('AssetOwner1', AssetOwner1);
  console.log('AssetOwner2', AssetOwner2);
  console.log('AssetOwner3', AssetOwner3);
  console.log('AssetOwner4', AssetOwner4);

  if (2 === 1) {
    balance0 = await web3.eth.getBalance(admin);//returns strings!
    balance1 = await web3.eth.getBalance(AssetOwner1);//returns strings!
    balance2 = await web3.eth.getBalance(AssetOwner2);//returns strings!
    console.log('admin', admin, balance0);//100,00000000,0000000000
    console.log('AssetOwner1', AssetOwner1, balance1);
    console.log('AssetOwner2', AssetOwner2, balance2);
  }

  console.log('\n------------==Check Helium contract');
  adminM = await instHelium.methods.Helium_Admin().call();
  checkEq(adminM, admin);
  console.log('check1')

  chairmanM = await instHelium.methods.Helium_Chairman().call();
  checkEq(chairmanM, chairman);

  directorM = await instHelium.methods.Helium_Director().call();
  checkEq(directorM, director);

  managerM = await instHelium.methods.Helium_Manager().call();
  checkEq(managerM, manager);

  ownerM = await instHelium.methods.Helium_Owner().call();
  checkEq(ownerM, owner);
  console.log('Helium contract all checked good');

  //----------------==Check MultiSig & AssetBook contracts
  // console.log('\n------------==Check MultiSig contract 1 & 2');
  // console.log('addrMultiSig1', addrMultiSig1);
  // console.log('addrMultiSig2', addrMultiSig2);

  // let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
  // console.log('\nassetOwnerM1', assetOwnerM1);
  // checkEq(assetOwnerM1, AssetOwner1);
  // let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
  // checkEq(assetOwnerM2, AssetOwner2);

  // console.log('\nCheck getPlatformContractAddr()');
  // let platformM1 = await instMultiSig1.methods.getPlatformContractAddr().call();
  // checkEq(platformM1, addrPlatform);
  // let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
  // checkEq(platformM2, addrPlatform);

  console.log('\n------------==Check AssetBook contract 1, 2, 3');
  console.log('addrAssetBook1', addrAssetBook1);
  console.log('addrAssetBook2', addrAssetBook2);
  console.log('addrAssetBook3', addrAssetBook3);

  assetbook1M = await instAssetBook1.methods.getAsset(0, addrHCAT721).call();
  console.log('\nassetbook1M:', assetbook1M);
  const amountInitAB1 = parseInt(assetbook1M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  assetbook2M = await instAssetBook2.methods.getAsset(0, addrHCAT721).call();
  console.log('\nassetbook2M:', assetbook2M);
  const amountInitAB2 = parseInt(assetbook2M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  assetbook3M = await instAssetBook3.methods.getAsset(0, addrHCAT721).call();
  console.log('\nassetbook3M:', assetbook3M);
  const amountInitAB3 = parseInt(assetbook3M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook3, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook3).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  // process.exit(0);

  //----------------==
  console.log('\n------------==Check HCAT721 parameters');
  console.log('addrHCAT721', addrHCAT721);

  let nftNameM = await instHCAT721.methods.name().call();
  let nftsymbolM = await instHCAT721.methods.symbol().call();
  let initialAssetPricingM = await instHCAT721.methods.initialAssetPricing().call();
  let IRR20yrx100M = await instHCAT721.methods.IRR20yrx100().call();
  let maxTotalSupplyM = await instHCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await instHCAT721.methods.pricingCurrency().call();
  let siteSizeInKWM = await instHCAT721.methods.siteSizeInKW().call();
  let tokenURI_M = await instHCAT721.methods.tokenURI().call();

  tokenIdM = await instHCAT721.methods.tokenId().call();
  const tokenIdM_init = parseInt(tokenIdM);

  //checkEq(nftNameM, nftName);
  //checkEq(nftsymbolM, nftSymbol);
  checkEq(initialAssetPricingM, '' + initialAssetPricing);
  checkEq(IRR20yrx100M, '' + IRR20yrx100);
  checkEq(maxTotalSupplyM, '' + maxTotalSupply);
  //checkEq(pricingCurrencyM, ''+pricingCurrency);
  checkEq(siteSizeInKWM, '' + siteSizeInKW);
  checkEq(tokenIdM_init, 0);
  console.log('nftNameM', web3.utils.toAscii(nftNameM), 'nftsymbolM', web3.utils.toAscii(nftsymbolM), 'maxTotalSupplyM', maxTotalSupplyM, 'tokenURI', web3.utils.toAscii(tokenURI_M), 'pricingCurrencyM', web3.utils.toAscii(pricingCurrencyM));
  //checkEq(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

  console.log("\x1b[33m", '\nConfirm tokenId = ', tokenIdM, ', tokenIdM_init', tokenIdM_init);

  let supportsInterface0x80ac58cd = await instHCAT721.methods.supportsInterface("0x80ac58cd").call();
  checkEq(supportsInterface0x80ac58cd, true);
  let supportsInterface0x5b5e139f = await instHCAT721.methods.supportsInterface("0x5b5e139f").call();
  checkEq(supportsInterface0x5b5e139f, true);
  let supportsInterface0x780e9d63 = await instHCAT721.methods.supportsInterface("0x780e9d63").call();
  checkEq(supportsInterface0x780e9d63, true);

  console.log('setup has been completed');
  process.exit(0);
};

/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/




//yarn run livechain -c 1 --f 2
const setTokenController = async () => {
  process.exit(0);
}


//yarn run livechain -c 1 --f 3
const showAssetBookBalance_TokenId = async () => {
  await asyncForEach(assetbookArray, async (assetbook, idx) => {
    console.log(`\n--------==AssetOwner${idx+1}: AssetBook${idx+1} and HCAT721...`);
    tokenIds = await instHCAT721.methods.getAccountIds(assetbook, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(assetbook).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(assetbook).call();
    console.log('HCAT getAccount():', accountM);

    const instAssetBookX = new web3.eth.Contract(AssetBook.abi, assetbook);
    assetbookXM = await instAssetBookX.methods.getAsset(0, addrHCAT721).call();
    console.log(`AssetBook${idx}: ${assetbookXM}`);
  });

  console.log('showAssetBookBalance_TokenId() has been completed');
  process.exit(0);
}

//yarn run livechain -c 1 --f 31
const showAssetBookBalances = async () => {
  process.exit(0);
}


//yarn run livechain -c 1 --f 4
const showAssetInfo = async () => {
  process.exit(0);
}





// yarn run livechain -c 1 --f 6
const sequentialMintSuperAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperAPI()');
  let amountArray, toAddressArray;
  const choice = 7;
  if(choice === 1){
    amountArray = [20, 37, 41];//98
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];
  } else if(choice === 2){
    amountArray = [180, 370, 27];//5083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 3){
    amountArray = [1000, 1900, 2183];//5083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 4){
    amountArray = [2000, 3900, 4183];//10083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 5){
    amountArray = [69, 77, 81, 99, 104, 113, 128, 139, 147, 156];//1169
    toAddressArray = [...assetbookArray];

  } else if(choice === 6){
    amountArray = [1231, 1776, 1974, 2025, 2038, 2386, 2731, 3132, 3416, 3612];//24321
    toAddressArray = [...assetbookArray];

  } else if(choice === 7){
                //[ 1737, 1926, 2206, 2498, 2551, 2349, 2889, 3115, 3324, 3446 ]
    amountArray = [2212, 2424, 2868, 2992,  3247, 3391, 3479, 3746, 3952, 3855 ];//24321
    toAddressArray = [...assetbookArray];

  }
  // yarn run livechain -c 1 --f 31 for balances


  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const pricing = 15000;
  const maxMintAmountPerRun = 190;

  const serverTime = TimeTokenUnlock-1;//201906271000;//297
  //from blockchain.js
  const [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, is_addAssetRecordRowArray, is_addActualPaymentTime, is_setFundingStateDB] = await sequentialMintSuper(toAddressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime, nftSymbol).catch((err) => {
    console.log('[Error @ sequentialMintSuper]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);

  if (isFailed || isFailed === undefined || isFailed === null) {
    mesg = '[Failed] Some/All minting actions have failed. Check isCorrectAmountArray!';
    console.log('\n'+mesg);

  } else if(!is_addAssetRecordRowArray) {
    mesg = '[Token minting Successful but addAssetRecordRowArray() Failed]';
    console.log('\n'+mesg);

  } else if (emailArrayError.length > 0 || amountArrayError.length > 0) {
    mesg = `[Error] Token minting is successful, but addAssetRecordRowArray() returned emailArrayError and/or amountArrayError.\nemailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`;  
    console.log('\n'+mesg);

  } else if(!is_addActualPaymentTime) {
    mesg = '[Token minting Successful but addActualPaymentTime() Failed]';
    console.log('\n'+mesg);

  } else if(!is_setFundingStateDB) {
    mesg = '[Token minting Successful but setFundingStateDB() Failed]';
    console.log('\n'+mesg);

  } else {
    mesg = '[Success] All token minting, addAssetRecordRowArray(), addActualPaymentTime(), and setFundingStateDB() have been completed successfully';
    console.log('\n'+mesg);
  }

  /*
  ownerCindexM = await instHCAT721.methods.ownerCindex().call();
  console.log('\nownerCindexM', ownerCindexM);

  const ownerAddrArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
  console.log('\nownerAddrArray', ownerAddrArray);

  await asyncForEach(toAddressArray, async (_to, index) => {
    isOwnerAdded = await instHCAT721.methods.isOwnerAdded(_to).call();
    console.log('\nisOwnerAdded', isOwnerAdded);
    if (isOwnerAdded === true) {
      console.log(`This assetbook has been added into ownerAddrList: ${_to}`);
    } else {
      console.log(`This assetbook has NOT been added into ownerAddrList: ${_to}`);
      process.exit(1);
    }
    // idxToOwnerM = await instHCAT721.methods.idxToOwner(1).call();
    // console.log('\nidxToOwnerM', idxToOwnerM);
    // checkeq(idxToOwnerM, _to);
  });*/

  process.exit(0);
}

//yarn run livechain -c 1 --f 38 -a 1 -b 3
const sequentialMintSuperNoMintAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperNoMintAPI()');

  const toAddressArray =[addrAssetBook1, addrAssetBook2, addrAssetBook3];
  const amountArray = [236, 312, 407];//236, 312 ... prev 250, 270, 0
  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const pricing = 20000;

  //from blockchain.js
  const [isFailed, isCorrectAmountArray] = await sequentialMintSuperNoMint(toAddressArray, amountArray, tokenCtrtAddr, fundingType, pricing).catch((err) => {
    console.log('[Error @ sequentialMintSuperNoMint]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);
  process.exit(0);
}

// yarn run livechain -c 1 --f 5 -a 1 -b 190
const mintTokens = async (assetbookNum, amount) => {
  console.log('-------------==mintTokens ... Mint Token Batch');
  serverTime = TimeTokenUnlock+1;
  console.log('assetbookNum', assetbookNum, 'amount', amount);
  if (assetbookNum < 1 || assetbookNum > 3) {
    console.log('assetbookNum value should be >= 1 and <= 3. assetbookNum = ', assetbookNum);
    process.exit(1);
  } else if (!Number.isInteger(amount)){
    console.log('amount value should be an integer. amount = ', amount);
    process.exit(1);
  } else if (amount < 1) {
    console.log('amount value should be >= 1. amount = ', amount);
    process.exit(1);
  } else {
    console.log('assetbookNum = ', assetbookNum);
  }

  //addrHCAT721_Test = '0x6978c55dee93a2351150A8C34BD5a2ddA6D1d327';
  //addrPlatform  addrRegistry  addrMultiSig1 addrAssetBook1  addrTokenController  addrHCAT721

  tokenIdM = await instHCAT721.methods.tokenId().call();
  const tokenIdM_init = parseInt(tokenIdM);
  console.log('\ncurrent tokenId = ', tokenIdM_init);
  //checkEq(tokenIdM, tokenIdM_init.toString());

  if (assetbookNum < 1 || assetbookNum > assetbookArray.length) {
    console.log('not valid assetbookNum value... assetbookNum:', assetbookNum);
    process.exit(1);
  } else {
    to = assetbookArray[assetbookNum-1];
  }
  balanceM = await instHCAT721.methods.balanceOf(to).call();

  console.log('\ntokenId =', tokenIdM_init + 1, 'to', tokenIdM_init + amount, ' to AssetBook' + assetbookNum, 'amount', amount, typeof amount, 'initialAssetPricing', initialAssetPricing, typeof initialAssetPricing, 'fundingType', fundingType, typeof fundingType, 'serverTime', serverTime, typeof serverTime, 'balanceM of target assetbook before minting', balanceM);//fundingType: 1 Public Offering, 2 Private Placement

  balanceM = await instHCAT721.methods.balanceOf(to).call();
  const amountInit = parseInt(balanceM);
  console.log(`assetbook${assetbookNum} has balanceM: ${balanceM}, amountInit: ${amountInit}`);

  result = await instHCAT721.methods.checkMintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).call({from: backendAddr});
  console.log('\nresult', result);
  if(result[0].every(checkBoolTrueArray)){
    console.log('[Success] all checks have passed');
  } else {console.log('[Failed] Some/one check(s) have/has failed');}
  checkEq(result[0].every(checkBoolTrueArray), true);

  // const arrayNew = array1.map(x => x * 2);
  // const reducer = (accumulator, currentValue) => accumulator + currentValue;
  // console.log(array1.reduce(reducer));
  // checkEq(result[1], authLevel+ maxBuyAmount+ maxBalance+'');
  checkEq(result[1][0], '5');//authLevel

  const tokenCtrtAddr = addrHCAT721;
  console.log('tokenCtrtAddr', tokenCtrtAddr);
  
  //process.exit(0);
  //Transaction has been reverted by the EVM:
  //----------------------------==
  console.log('\nbefore mintSerialNFT()');
  const choice = 1;
  if (choice === 1) {
    const encodedData = instHCAT721.methods.mintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch((err) => console.log('[Error @ signTx()]', err));
    console.log('TxResult', TxResult);

  } else if(choice === 99){
    await instHCAT721.methods.mintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).send({
      value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue
    }).on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      }).on('error', function (error) {
        console.log('error:', error.toString());
      });
  }

  tokenIdM_now = tokenIdM_init + amount;
  tokenIdM = await instHCAT721.methods.tokenId().call();
  checkEq(tokenIdM, tokenIdM_now.toString());

  if (amount > 2) {
    tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdM_now - 2).call();
    checkEq(tokenOwnerM, to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdM_now - 1).call();
    checkEq(tokenOwnerM, to);

  } else if (amount > 1) {
    tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdM_now - 1).call();
    checkEq(tokenOwnerM, to);
  }
  tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdM_now).call();
  checkEq(tokenOwnerM, to);

  balanceM = await instHCAT721.methods.balanceOf(to).call();
  console.log('\n-----------==after minting balanceM:', balanceM);

  console.log('\n-----------==Switching to showAssetBookBalance_TokenId()...');
  await showAssetBookBalance_TokenId();
  console.log('mintTokens() has been completed');
  process.exit(0);
}



// 6 mintTokenFn1
const mintTokenFn1 = async () => {
  console.log('inside mintTokenFn1');
  let to = addrAssetBook1;
  let amount = 160;
  let fundingType = 2;//PO: 1, PP: 2
  let price = 18000;
  let currentTime = 201905170500;

  const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
  const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
  const backendAddrpkRaw = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';
  
  tokenIdM = await instHCAT721.methods.tokenId().call();
  const tokenIdM_init = parseInt(tokenIdM);
  let totalSupply = await instHCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);
  let nftNameM = await instHCAT721.methods.name().call();
  let nftsymbolM = await instHCAT721.methods.symbol().call();
  let maxTotalSupplyM = await instHCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await instHCAT721.methods.pricingCurrency().call();
  let tokenURI_M = await instHCAT721.methods.tokenURI().call();
  let isNormalModeEnabled = await instHCAT721.methods.isNormalModeEnabled().call();

  console.log(`\nnftNameM ${web3.utils.toAscii(nftNameM)}, nftsymbolM ${web3.utils.toAscii(nftsymbolM)}, tokenURI ${web3.utils.toAscii(tokenURI_M)}, pricingCurrencyM ${web3.utils.toAscii(pricingCurrencyM)}, isNormalModeEnabled ${isNormalModeEnabled}, maxTotalSupplyM ${maxTotalSupplyM}, tokenId ${tokenIdM_init}, totalSupply ${totalSupply}`);

  //process.exit(0);

  // await getTime().then(function (time) {
  //     currentTime = time;
  // })
  console.log(`\ncurrent time: ${currentTime}, to ${to}, amount ${amount}, fundingType ${fundingType}, price ${price}`);

  let encodedData = instHCAT721.methods.mintSerialNFT(to, amount, price, fundingType, currentTime).encodeABI();
  //let contractAddr = addrHCAT721_Test;
  let contractAddr = addrHCAT721;
  result = await signTx(backendAddr, backendAddrpkRaw, contractAddr, encodedData).catch((err) => console.log('\n[Error @ signTx()]', err));
  console.log('result', result);

  totalSupply = await instHCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);
}
//yarn run livechain -c 1 --f 3  ... showAssetbook balances


//yarn run livechain -c 1 --f 7 -a 1 -b 3 -t 2
//yarn run livechain -c 1 --f 7 -a 1 -b 190 -t 2
const transferTokens = async (assetbookNumFrom, amountStr, assetbookNumTo) => {
  const amount = parseInt(amountStr);
  console.log(`\n--------==Send tokens\nassetbookNumFrom: ${assetbookNumFrom}, amount: ${amount}, assetbookNumTo: ${assetbookNumTo}`);
  let instAssetBookFrom, instAssetBookTo;

  if (assetbookNumFrom < 1 || assetbookNumFrom > 3) {
    console.log('assetbookNumFrom value should be >= 1 and <= 3. assetbookNumFrom = ', assetbookNumFrom);
    process.exit(1);
  } else if (assetbookNumFrom === undefined || assetbookNumTo === undefined) {
    console.log('assetbookNumFrom or assetbookNumTo is undefined');
    process.exit(1);
  } else if (assetbookNumFrom === 0 || assetbookNumTo === 0) {
    console.log('assetbookNumFrom or assetbookNumTo is 0');
    process.exit(1);
  } else if (assetbookNumTo < 1 || assetbookNumTo > 3) {
    console.log('assetbookNumTo value should be >= 1 and <= 3. assetbookNumTo = ', assetbookNumTo);
    process.exit(1);
  } else if (!Number.isInteger(amount)){
    console.log('amount value should be an integer. amount = ', amount);
    process.exit(1);
  } else if (amount < 1) {
    console.log('amount value should be >= 1. amount = ', amount);
    process.exit(1);
  } else {
    console.log('all input values are good');
  }

  fromAssetbook = assetbookArray[parseInt(assetbookNumFrom) - 1];
  toAssetbook   = assetbookArray[parseInt(assetbookNumTo) - 1];
  //const [addrAssetBook1, addrAssetBook2, addrAssetBook3] = assetbookArray;
  price = 21000;
  _fromAssetOwner = assetOwnerArray[assetbookNumFrom];
  //_toAssetOwner = assetOwnerArray[assetbookNumTo];
  const _fromAssetOwnerpkRaw = assetOwnerpkRawArray[assetbookNumFrom];
  console.log('_fromAssetOwner', _fromAssetOwner, '_fromAssetOwnerpkRaw', _fromAssetOwnerpkRaw);
  // _fromAssetOwner, _fromAssetOwnerpkRaw

  const balanceFromB4Str = await instHCAT721.methods.balanceOf(fromAssetbook).call();
  const balanceToB4Str = await instHCAT721.methods.balanceOf(toAssetbook).call();
  const balanceFromB4 = parseInt(balanceFromB4Str);
  const balanceToB4 = parseInt(balanceToB4Str);
  console.log('\n--------==balanceFromB4:', balanceFromB4, ', balanceToB4', balanceToB4);

  instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);
  instAssetBookTo = new web3.eth.Contract(AssetBook.abi, toAssetbook);

  let assetbookFromM = await instAssetBookFrom.methods.getAsset(0, addrHCAT721).call();//assetIndex_, address assetAddr_, bytes32 symbol, uint balance
  const balanceFromB4_AB = parseInt(assetbookFromM[3]);
  console.log(`\nassetbookFromM: assetIndex_= ${assetbookFromM[0]}, symbol= ${web3.utils.toAscii(assetbookFromM[2])}, balanceFromB4_AB = ${assetbookFromM[3]}`);

  let assetbookToM = await instAssetBookTo.methods.getAsset(0, addrHCAT721).call();
  const balanceToB4_AB = parseInt(assetbookToM[3]);
  console.log(`\nassetbookToM: assetIndex_= ${assetbookToM[0]}, symbol= ${web3.utils.toAscii(assetbookToM[2])}, balanceFromB4_AB = ${assetbookToM[3]}`);
  
  checkEq(balanceFromB4, balanceFromB4_AB);
  checkEq(balanceFromB4 >= amount, true);
  checkEq(balanceToB4, balanceToB4_AB);

  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  checkEq(isTokenApprovedOperational, true);
  console.log('isTokenApprovedOperational is true => ready to send tokens');

  serverTime = TimeTokenUnlock+5;

  const isAmountInt = Number.isInteger(amount);
  const isPriceInt = Number.isInteger(price);
  const isServerTimeInt = Number.isInteger(serverTime);

  checkEq(isAmountInt, true);
  checkEq(isPriceInt, true);
  checkEq(isServerTimeInt, true);

  result = await instHCAT721.methods.getTokenContractDetails().call({from: AssetOwner1});
  console.log('result', result);

  //assetIndex, assetAddr, fromAssetbook, toAssetbook, amount, price, serverTime)
  result = await instAssetBookFrom.methods.checkSafeTransferFromBatch(0, addrHCAT721, addrZero, toAssetbook, amount, price, serverTime).call({from: _fromAssetOwner});
  console.log('\ncheckSafeTransferFromBatch result', result);
  //assetAddr_.isContract(), msg.sender == assetOwner

  if(result[0].every(checkBoolTrueArray)){
    console.log('\n[Success] all checks have passed checkSafeTransferFromBatch()');
  } else {
    console.log('\n[Failed] Some/one check(s) have/has failed checkSafeTransferFromBatch()');
  }
  /**
   * [ true, true, true, true, true,    true, true, true, true, true,    true, false ]
  const instCtrt = new web3.eth.Contract(jsonCtrt.abi, addrCtrt);
  const encodedData = instCtrt.methods.updateState(currentTime).encodeABI();
  const TxResult = await signTx(fromEOA, fromEOA_RawPk, addrCtrt, encodedData);
  */
  // yarn run livechain -c 1 --f 7 -a 1 -b 1 -t 2
  console.log('\nencodedData...');
  const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, addrHCAT721, addrZero, toAssetbook, amount, price, serverTime).encodeABI();
  //process.exit(0);

  console.log(`safeTransferFromBatch()... 
  AssetBook${assetbookNumFrom} sending to AssetBook${assetbookNumTo}
  fromAssetbook = ${fromAssetbook}
  toAssetbook = ${toAssetbook}
  ${amount} tokens ${typeof amount} ${isAmountInt}
  price: ${price} ${typeof price} ${isPriceInt} 
  serverTime: ${serverTime} ${typeof serverTime} ${isServerTimeInt}
  serverTime = TimeTokenUnlock+5

  balanceFromB4: ${balanceFromB4}, balanceToB4: ${balanceToB4}
  _fromAssetOwner = ${_fromAssetOwner}
  _fromAssetOwnerpkRaw = ${_fromAssetOwnerpkRaw}
  addrHCAT721 = ${addrHCAT721}
  `);
  console.log('\nsending tokens via transferAssetBatch()...');
  TxResult = await signTx(_fromAssetOwner, _fromAssetOwnerpkRaw, fromAssetbook, encodedData).catch( async(err) => {
    console.log('[Error @ signTx()]', err);
    result = await instAssetBookFrom.methods.checkSafeTransferFromBatch(0, addrHCAT721, addrZero, toAssetbook, amount, price, serverTime).call({from: _fromAssetOwner});
    console.log('\ncheckSafeTransferFromBatch result', result);
    process.exit(1);
  });// _fromAssetOwner, _fromAssetOwnerpkRaw
  //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
  console.log('TxResult', TxResult);

  console.log(`\n-------------==safeTransferFromBatch is completed.`);
  const balanceFromAfter = await instHCAT721.methods.balanceOf(fromAssetbook).call();
  const balanceToAfter = await instHCAT721.methods.balanceOf(toAssetbook).call();
  
  console.log(`balanceFromB4: ${balanceFromB4}
  balanceFromAfter: ${balanceFromAfter}

  balanceToB4: ${balanceToB4}
  balanceToAfter:   ${balanceToAfter}
  `);
  process.exit(0);
}//yarn run livechain -c 1 --f 7 -a 1 -b 1 -t 2


/*
scenario: 0, check initial values
yarn run livechain -c 1 --f 8 -s 0 -t 1 -a 10

scenario: 1, serverTime = CFSD+1. set state to funding start
yarn run livechain -c 1 --f 8 -s 1 -t 1 -a 10


scenario: 3: check investors
yarn run livechain -c 1 --f 8 -s 3 -t 1 -a 10
[ '790',
  '460',
  '550',
  '690',
  '730',
  '840',
  '970',
  '1080',
  '1110',
  '1230' ]
scenario: 4: funding
yarn run livechain -c 1 --f 8 -s 4 -t 1 -a 10

scenario: 5
scenario: 6
scenario: 7

scenario: 9, serverTime = CFED+1. set state to funding end
yarn run livechain -c 1 --f 8 -s 2 -t 1 -a 10

Check CFC details:  yarn run livechain -c 1 --f 8 -s 0 -t 1 -a 1
Set CFC to funding: yarn run livechain -c 1 --f 8 -s 1 -t 1 -a 1
Check all balances: yarn run livechain -c 1 --f 8 -s 3 -t 1 -a 1
Invest/buy:         yarn run livechain -c 1 --f 8 -s 4 -t 1 -a 1079

toAssetbookNumStr: 1 for assetBook1...
*/
const setTimeOnCFC = async (scenarioStr, toAssetbookNumStr, amountToInvestStr) => {
  console.log('\n------------==Check CrowdFunding parameters');
  console.log('addrCrowdFunding', addrCrowdFunding);
  const scenario = parseInt(scenarioStr);
  const toAssetbookNum = parseInt(toAssetbookNumStr);
  const amountToInvest = parseInt(amountToInvestStr);
  let tokenSymbolM, initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSD2M, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM, encodedData, TxResult;

  if(toAssetbookNumStr < 1){
    console.log('[Error] toAssetbookNumStr must be >= 1');
    process.exit(1);
  }
  const addrAssetbookX = assetbookArray[toAssetbookNum-1];
  console.log("CFSD:", CFSD, ", CFED:", CFED, "\nscenarioStr", scenarioStr, ", toAssetbookNum", toAssetbookNum, ", amountToInvest", amountToInvest, ", addrAssetbookX:", addrAssetbookX);

  if(scenario === 0){
    // use getDetailsCFC() ... //yarn run testmt -f 39

  //update serverTime to CFSD+1 for funding, then read stateDescription and fundingState
  //serverTime = CFSD+1;
  //yarn run livechain -c 1 --f 8 -s 1 -t 1 -a 10
  } else if(scenario === 1){
    console.log('--------==scenario:', scenario);

  
  //update serverTime to CFED to end funding,then read stateDescription and fundingState
  //serverTime = CFED;
  //yarn run livechain -c 1 --f 8 -s 2 -t 1 -a 10
  } else if(scenario === 9){
    console.log('--------==scenario:', scenario);

  // to get investor assetbook list
  // yarn run livechain -c 1 --f 8 -s 3 -t
  } else if(scenario === 3){
    // getInvestorsFromCFC() ... yarn run testmt -f 41

  //['4224','4194','4884','4224','4564','4174','4444','4854','5084','4604' ]
  //[ 3724, 3468, 3712, 3562, 3847, 3371, 3479, 3746, 3952, 4355 ]
  // to invest, -t 1 is for assetbook1
  // yarn run livechain -c 1 --f 8 -s 4 -t 1 -a 4334
  } else if(scenario === 4){
    console.log('--------==scenario:', scenario);

  } else if(scenario === 4){
    console.log('--------==scenario:', scenario);


  } else {
    console.log('--------==scenario:', scenario);

  }
  //const encodedData = instCtrt.methods.updateState(currentTime).encodeABI();
  //const TxResult = await signTx(fromEOA, fromEOA_RawPk, addrCtrt, encodedData);
  
/**
    if (1==2){
      serverTime = CFED;
      console.log('\nset serverTime = CFED', CFED);
      await instCrowdFunding.methods.updateState(serverTime)
      .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  
      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "fundingNotClosed: ended with goal not reached");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 5);
      //process.exit(1);
    }

    serverTime = CFSD+1;
    console.log('\nset serverTime = CFSD+1', serverTime, '\nmakeFundingAction(), invest()');
    // await instCrowdFunding.methods.makeFundingActive(serverTime)
    // .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });


    let modResult = quantityGoal % maxTokenQtyForEachInvestmentFund;
    let quotient = (quantityGoal - modResult)/maxTokenQtyForEachInvestmentFund;
    console.log('quantityGoal:', quantityGoal, ', maxTokenQtyForEachInvestmentFund:', maxTokenQtyForEachInvestmentFund, ', modResult:', modResult, ', quotient:', quotient);
    assert.equal(Number.isInteger(quotient), true);
    console.log('quotient is integer');

    // let modResult = maxTotalSupply % maxTokenQtyForEachInvestmentFund;
    // let quotient = (maxTotalSupply - modResult)/maxTokenQtyForEachInvestmentFund;
    // console.log('maxTotalSupply:', maxTotalSupply, ', maxTokenQtyForEachInvestmentFund:', maxTokenQtyForEachInvestmentFund, ', modResult:', modResult, ', quotient:', quotient);
    // assert.equal(Number.isInteger(quotient), true);
    // console.log('quotient is integer');

    for(i = 0; i < quotient; i++) {
      await instCrowdFunding.methods.invest(addrAssetbookX, maxTokenQtyForEachInvestmentFund, serverTime).send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      console.log('invest()... take ', i);
    }
    remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('remainingTokenQtyM:', remainingTokenQtyM, ' V.s. modResult:', modResult, '... maxTotalSupply', maxTotalSupply, ', quantityGoal', quantityGoal, 'quantitySoldM', quantitySoldM);
    assert.equal(remainingTokenQtyM, modResult+maxTotalSupply-quantityGoal);

    await instCrowdFunding.methods.invest(addrAssetbookX, modResult, serverTime).send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('invest(modResult=', modResult, ')');
    quantitySoldM = await instCrowdFunding.methods.quantitySold().call();
    console.log('quantitySoldM:', quantitySoldM, 'V.s. quantityGoal:', quantityGoal);

    console.log('after investing the target goal amount');
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "fundingGoalReached: still funding and has reached goal");

    result = await instCrowdFunding.methods.getInvestors(0, 0).call();
    console.log('assetbookArray', result[0]);
    console.log('investedTokenQtyArray', result[1]);

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 3);


    //------------------==Set time to initial
    console.log('\nset serverTime = CFSD-1');
    serverTime = CFSD-1;
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: goal reached already");

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 0);

    //------------------==Back to CFSD
    serverTime = CFSD;
    console.log('\nset serverTime = CFSD');
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });

    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "fundingGoalReached: still funding and has reached goal");

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 3);


    //------------------==Overbuying
    let quantityAvailable = maxTotalSupply - quantityGoal;//24

    let error = false;
    try {
      console.log('\nTrying to invest quantityAvailable+1');
      await instCrowdFunding.methods.invest(addrAssetbookX, quantityAvailable+1, serverTime).send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] over-buying failed because of not enough quantity for sales. quantityAvailable:', quantityAvailable, 'err:', err.toString().substr(0, 100));
      assert(err);
    }
    if (error) {assert(false);}

    if(1==1){
      //-------------------==Pause the crowdfunding
      serverTime = CFSD+3;
      console.log('\nPause funding');
      await instCrowdFunding.methods.pauseFunding(serverTime)
      .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "funding paused");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 2);

      //-------------------==resumeFunding the crowdfunding
      serverTime = CFSD+3;
      console.log('\nResume funding');
      await instCrowdFunding.methods.resumeFunding(CFED, maxTotalSupply, serverTime)
      .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      //assert.equal(stateDescriptionM, "funding paused");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      //assert.equal(fundingStateM, 2);
      console.log('check stateDescriptionM and fundingStateM!!!');

      if(1==2) {
        reason = 'a good reason...';
        console.log('\nTerminate');
        await instCrowdFunding.methods.abort(reason, serverTime)
        .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  
        stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
        console.log('stateDescriptionM', stateDescriptionM);
        assert.equal(stateDescriptionM, "terminated:"+reason);
  
        fundingStateM = await instCrowdFunding.methods.fundingState().call();
        console.log('fundingStateM', fundingStateM);
        assert.equal(fundingStateM, 6);
        console.log('check stateDescriptionM and fundingStateM!!!');

      } else {
        //-------------------==Buying the available quantity
        console.log('\nTrying to invest quantityAvailable');
        await instCrowdFunding.methods.invest(addrAssetBook2, quantityAvailable, serverTime)
        .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });

        stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
        console.log('stateDescriptionM', stateDescriptionM);
        assert.equal(stateDescriptionM, "fundingClosed: sold out");

        result = await instCrowdFunding.methods.getInvestors(0, 0).call();
        console.log('assetbookArray', result[0]);
        console.log('investedTokenQtyArray', result[1]);

        fundingStateM = await instCrowdFunding.methods.fundingState().call();
        console.log('fundingStateM', fundingStateM);
        assert.equal(fundingStateM, 4);
      }
      
    } else {
      //-------------------==CFED has been reached
      console.log('\nCFED has been reached');
      serverTime = CFED;
      await instCrowdFunding.methods.updateState(serverTime)
      .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "fundingClosed: goal reached but not sold out");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 4);
    }
 */
}





//-------------------------==
//-------------------------==

//yarn run livechain -c 1 --f 39
const transferTokensKY = async () => {
  console.log('\ntransferTokensKY...');
  const contractAddr = "0xC4b0CC61E12175Ea0Ed87d29fE7670F5462244F8";
  const fromAssetbook = "0x997307566Fd444b3195E348E4E16B52814C4e766";
  const to = "0x8aC7c2Fb825e822C2255bf2169A325a4cCa56ceA";
  const amount = 1;
  const price = 21000;
  const serverTime = 201905311435;

  const inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, contractAddr);
  let encodedData = inst_HCAT721.methods.safeTransferFromBatch(fromAssetbook, to, amount, price, serverTime).encodeABI();
  //safeTransferFromBatch(address fromAssetbook, address toAssetbook, uint amount, uint price, uint serverTime)
  let TxResult = await signTx(backendAddr, backendAddrpkRaw, contractAddr, encodedData);
  console.log('TxResult', TxResult);
} 



const sendAssetBeforeAllowed = async () => {
  //----------------==Send tokens before allowed time
  console.log('\n------------==Send tokens before allowed time');
  serverTime = TimeTokenUnlock+1;
  await instTokenController.methods.setTimeCurrent(serverTime)
    .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  console.log('isTokenApprovedOperational', isTokenApprovedOperational);
  checkEq(isTokenApprovedOperational, false);

  amount = 1;
  fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; to = addrAssetBook1;
  let error = false;
  try {
    if (txnNum === 1) {
      encodedData = instAssetBookFrom.methods.transferAssetBatch(addrHCAT721, amount, to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBookFrom.methods.transferAssetBatch(addrHCAT721, amount, to)
        .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    }
  } catch (err) {
    console.log('[Success] sending 1 token from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: serverTime < TimeTokenUnlock', serverTime, TimeTokenUnlock);//assert(err);
  }
  if (error) {
    console.log("\x1b[31m", '[Error] Why did not this fail???', error);
    process.exit(1);
  }
  process.exit(0);
}




//------------------------------==
const testCtrt = async () => {
  console.log('\n---------------==inside testCtrt');
  let newNum;
  addrTestCtrt = '0xAB7CBD512dF8226b5Ad6062982959DE6A64b7cA2';

  let HCAT721SerialNumber = await instTestCtrt.methods.HCAT721SerialNumber().call();
  console.log('\nHCAT721SerialNumber', HCAT721SerialNumber);

  let addrHeliumM = await instTestCtrt.methods.addrHelium().call();
  console.log('addrHeliumM', addrHeliumM);

  process.exit(0);
  newNum = 2030;
  const encodedData = instTestCtrt.methods.setHCAT721SerialNumberNG(newNum).encodeABI();
  let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrTestCtrt, encodedData);
  console.log('TxResult', TxResult);

  /*//Error: Returned error: unknown account
  await instTestCtrt.methods.setHCAT721SerialNumberNG(newNum)
    .send({ value: '0', from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  HCAT721SerialNumber = await instTestCtrt.methods.HCAT721SerialNumber().call();
  console.log('HCAT721SerialNumber', HCAT721SerialNumber);
  checkEq(HCAT721SerialNumber, newNum);
  */
}

const showMenu = () => {
  console.log('\n');
  console.log("\x1b[32m", '$ yarn run testlive1 --chain C --func F --arg1 arg1 --arg2 arg2');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: setTokenController, 2: showAssetBookBalance_TokenId, 3: mintTokens(assetbookNum, amount), 4: showAssetInfo(tokenId), 5: sendAssetBeforeAllowed(), 6: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount)');
  console.log("\x1b[32m", 'arg1, arg2, ... are arguments used in above functions ...');
}



//-------------------------------==

//yarn run livechain -c 1 --f 0
if (func === 0) {
  checkDeployedContracts();

//yarn run livechain -c 1 --f 1
} else if (func === 1) {
  setupTest();

//yarn run livechain -c 1 --f 2
} else if (func === 2) {
  setTokenController();

//yarn run livechain -c 1 --f 3
} else if (func === 3) {
  showAssetBookBalance_TokenId();

//yarn run livechain -c 1 --f 4
} else if (func === 4) {
  showAssetInfo();

//yarn run livechain -c 1 --f 5 -a 1 -b 190
} else if (func === 5) {
  mintTokens(arg1, arg2);

//yarn run livechain -c 1 --f 6
} else if (func === 6) {
  sequentialMintSuperAPI();

//yarn run livechain -c 1 --f 7 -a 1 -b 190 -t 2
} else if (func === 7) {
  transferTokens(arg1, arg2, arg3);

//yarn run livechain -c 1 --f 8 -s 0 -t 1 -a 10
} else if (func === 8) {
  setTimeOnCFC(arg1, arg2, arg3);


//yarn run livechain -c 1 --f 11
} else if (func === 11) {
  sendAssetBeforeAllowed();

//yarn run livechain -c 1 --f 8 -a 1
} else if (func === 8) {
  //setServerTime(arg1);

//yarn run livechain -c 1 --f 9
} else if (func === 9) {
  mintTokenFn1();

//yarn run livechain -c 1 --f 18
} else if (func === 18) {
  changePermissionToPS_API();

//yarn run livechain -c 1 --f 19
} else if (func === 19) {
  addPlatformSupervisor_API();

//yarn run livechain -c 1 --f 20
} else if (func === 20) {
  addBackendToCustomerService();

//yarn run livechain -c 1 --f 21
} else if (func === 21) {

//yarn run livechain -c 1 --f 22
} else if (func === 22) {
  getUserFromAssetbook();

//yarn run livechain -c 1 --f 23
} else if (func === 23) {

//yarn run livechain -c 1 --f 31
} else if (func === 31) {
  showAssetBookBalances();

//------------------==
//yarn run livechain -c 1 --f 91
} else if (func === 91) {
  testCtrt();

//yarn run livechain -c 1 --f 92
} else if (func === 92) {
  sequentialMintSuperNoMintAPI();

//yarn run livechain -c 1 --f 93
} else if (func === 93) {
  transferTokensKY();
} else {
  console.log('no matched entry number');
}
//showMenu();


//-------------==
/*
Three ways to transfer 721 tokens
owner transfer tokens directly
owner approves B then B, the approved, can transfer tokens
owner sets C as the operator, then C transfer owner's tokens
  Operator can approve others to take tokens or transfer tokens directly

  -> setApprovalForAll(_operator, T/F):
    ownerToOperators[owner][_operator]= true/false
-> isApprovedForAll(_owner, _operator) ... check if this is the _operator for _owner

-> canOperate(tokenId)... used only once in approve
    tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender]

-> approve(_approved, tokenId) external canOperate(tokenId)... set approved address
    idToApprovals[tokenId] = _approved;
-> getApproved(tokenId) ... check the approved address

-> canTransfer(tokenId) ... used in transferFrom and safeTransferFrom
    tokenOwner == msg.sender || getApproved(tokenId) == msg.sender || ownerToOperators[tokenOwner][msg.sender]
*/





const signTxn = (fromAddr, ctrtAddr, encodedData, privateKey) => {
  web3.eth.getTransactionCount(fromAddr).then((count) => {
    console.log("Count: ", count);
    //var amount = web3.utils.toHex(1e16);
    var rawTransaction = {
      "from": fromAddr,
      "gasPrice": web3.utils.toHex(gasPriceValue),
      "gasLimit": web3.utils.toHex(gasLimitValue),
      "to": ctrtAddr,
      "value": "0x0",
      "data": encodedData,
      "nonce": web3.utils.toHex(count)
    }
    /**
    value: web3.utils.toHex(web3.toBigNumber(web3.eth.getBalance(address))
    .minus(web3.toBigNumber(21000).times(20000000000)))
    */
    console.log(rawTransaction);

    var transaction = new Tx(rawTransaction);//make txn via ethereumjs-tx
    transaction.sign(privateKey);//sign transaction with private key

    //https://web3.readthedocs.io/en/1.0/web3-eth.html#eth-sendsignedtransaction
    web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
      .on('transactionHash', console.log)
      .on('receipt', console.log)
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log('confirmationNumber', confirmationNumber, 'receipt', receipt);
      })
      .on('error', console.error);
  });
}

/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2),'hex');
              console.log(userPrivateKey);
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: gasLimitValue,//9000000,
                  gasPrice: gasPriceValue,//0,
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
