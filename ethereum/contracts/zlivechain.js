/**
$ yarn run livechain -c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 
*/
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const { sequentialMintSuper, sequentialMintSuperNoMint} = require('../../timeserver/blockchain');

let {  addrHelium, assetbookArray, userIDs, authLevels, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray,  managementTeam, symNum, TimeOfDeployment, TimeTokenUnlock, TimeTokenValid, CFSD2, CFED2 } = require('./zsetupData');
const TimeOfDeployment = TimeOfDeployment;

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5]= assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw] = assetOwnerpkRawArray;
// assetOwnerArray, assetOwnerpkRawArray

const [addrAssetBook1, addrAssetBook2, addrAssetBook3] = assetbookArray;
let provider, web3, gasLimitValue, gasPriceValue, prefix = '', chain, func, arg1, arg2, arg3, result;
const backendAddr = admin;
const backendRawPrivateKey = adminpkRaw;


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


let txnNum = 2, isShowCompiledCtrt = false;
console.log('chain = ', chain, ', txnNum =', txnNum, ', TimeOfDeployment =', TimeOfDeployment);

let addrTestCtrt, assetbook1M, assetbook2M;
let amount, to, _from, tokenIds, tokenId_now, nodeUrl, authLevelM;
let choiceOfHCAT721, isFundingApprovedHCAT721, checkPlatformSupervisor;

const uriBase = "nccu0".trim();


//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain
  console.log('inside chain === 1');

  let scenario = 1;//1: new accounts, 2: POA node accounts
  if (scenario === 1) {
    console.log('scenario = ', scenario);
    gasLimitValue = '9000000';//intrinsic gas too low
    gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
    console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

    nodeUrl = "http://140.119.101.130:8545";
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

    console.log('adminpk use Buffer.from');
    adminpk = Buffer.from(adminpkRaw.substr(2), 'hex');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');

    //backendRawPrivateKey = '0x....'
    //await signTx(admin, adminpkRaw, addrRegistry, encodedData);

    //provider = new PrivateKeyProvider(adminpk, nodeUrl);//adminpk, AssetOwner1pk, AssetOwner2pk
    //web3 = new Web3(provider);

    web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));

  } else if (scenario === 2) {
    console.log('scenario = ', scenario);
  }

  console.log('leaving chain === 1');

} else if (chain === 2) {
  //gasLimitValue = 5000000 for POW private chain
  const options = { gasLimit: 9000000 };
  gasLimitValue = '9000000';
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  nodeUrl = "http://140.119.101.130:8540";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else if (chain === 3) {
  //gasLimitValue = 5000000 for POW Infura Rinkeby chain
  const options = { gasLimit: 7000000 };
  gasLimitValue = '7000000';
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  nodeUrl = "https://rinkeby.infura.io/v3/b789f67c3ef041a8ade1433c4b33de0f";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else {
  console.log('chain is out of range. chain =', chain);
}

require('events').EventEmitter.defaultMaxListeners = 30;
//require('events').EventEmitter.prototype._maxListeners = 20;
/* emitter.setMaxListeners();
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
*/

//--------------------==
console.log('Load contract json file compiled from sol file');

//const { interface, bytecode } = require('../compile');//dot dot for one level up
const TestCtrt = require('./build/TestCtrt.json');
if (TestCtrt === undefined) {
  console.log('[Error] TestCtrt is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] TestCtrt is defined');
  if (TestCtrt.abi === undefined) {
    console.log('[Error] TestCtrt.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TestCtrt.abi is defined');
    //console.log('TestCtrt.abi:', TestCtrt.abi);
  }
  if (TestCtrt.bytecode === undefined || TestCtrt.bytecode.length < 10) {
    console.log('[Error] TestCtrt.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TestCtrt.bytecode is defined');
    //console.log('TestCtrt.bytecode:', TestCtrt.bytecode);
  }
  //console.log(TestCtrt);
}

const Helium = require('./build/Helium.json');
if (Helium === undefined) {
  console.log('[Error] Helium is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Helium is defined');
  if (Helium.abi === undefined) {
    console.log('[Error] Helium.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.abi is defined');
    //console.log('Helium.abi:', Helium.abi);
  }
  if (Helium.bytecode === undefined || Helium.bytecode.length < 10) {
    console.log('[Error] Helium.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.bytecode is defined');
    //console.log('Helium.bytecode:', Helium.bytecode);
  }
  //console.log(Helium);
}

const AssetBook = require('./build/AssetBook.json');
if (AssetBook === undefined) {
  console.log('[Error] AssetBook is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] AssetBook is defined');
  if (AssetBook.abi === undefined) {
    console.log('[Error] AssetBook.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] AssetBook.abi is defined');
    //console.log('AssetBook.abi:', AssetBook.abi);
  }
  if (AssetBook.bytecode === undefined || AssetBook.bytecode.length < 10) {
    console.log('[Error] AssetBook.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] AssetBook.bytecode is defined');
    //console.log('AssetBook.bytecode:', AssetBook.bytecode);
  }
  //console.log(AssetBook);
}

// Registry  addrRegistry
const Registry = require('./build/Registry.json');
if (Registry === undefined) {
  console.log('[Error] Registry is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Registry is defined');
  if (Registry.abi === undefined) {
    console.log('[Error] Registry.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Registry.abi is defined');
    //console.log('Registry.abi:', Registry.abi);
  }
  if (Registry.bytecode === undefined || Registry.bytecode.length < 10) {
    console.log('[Error] Registry.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Registry.bytecode is defined');
    //console.log('Registry.bytecode:', Registry.bytecode);
  }
  //console.log(Registry);
}

const TokenController = require('./build/TokenController.json');
if (TokenController === undefined) {
  console.log('[Error] TokenController is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] TokenController is defined');
  if (TokenController.abi === undefined) {
    console.log('[Error] TokenController.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] TokenController.abi is defined');
    //console.log('TokenController.abi:', TokenController.abi);
  }
  if (TokenController.bytecode === undefined || TokenController.bytecode.length < 10) {
    console.log('[Error] TokenController.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] TokenController.bytecode is defined');
    //console.log('TokenController.bytecode:', TokenController.bytecode);
  }
  //console.log(TokenController);
}

const HCAT721 = require('./build/HCAT721_AssetToken.json');
if (HCAT721 === undefined) {
  console.log('[Error] HCAT721 is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] HCAT721 is defined');
  if (HCAT721.abi === undefined) {
    console.log('[Error] HCAT721.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.abi is defined');
    //console.log('HCAT721.abi:', HCAT721.abi);
  }
  if (HCAT721.bytecode === undefined || HCAT721.bytecode.length < 10) {
    console.log('[Error] HCAT721.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.bytecode is defined');
    //console.log('HCAT721.bytecode:', HCAT721.bytecode);
  }
  //console.log(HCAT721);
}

const HCAT721_Test = require('./build/HCAT721_AssetToken_Test.json');
if (HCAT721_Test === undefined) {
  console.log('[Error] HCAT721_Test is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] HCAT721_Test is defined');
  if (HCAT721_Test.abi === undefined) {
    console.log('[Error] HCAT721_Test.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721_Test.abi is defined');
    //console.log('HCAT721_Test.abi:', HCAT721_Test.abi);
  }
  if (HCAT721_Test.bytecode === undefined || HCAT721_Test.bytecode.length < 10) {
    console.log('[Error] HCAT721_Test.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721_Test.bytecode is defined');
    //console.log('HCAT721_Test.bytecode:', HCAT721_Test.bytecode);
  }
  //console.log(HCAT721_Test);
}

const CrowdFunding = require('./build/CrowdFunding.json');
if (CrowdFunding === undefined) {
  console.log('[Error] CrowdFunding is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] CrowdFunding is defined');
  if (CrowdFunding.abi === undefined) {
    console.log('[Error] CrowdFunding.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] CrowdFunding.abi is defined');
    //console.log('CrowdFunding.abi:', CrowdFunding.abi);
  }
  if (CrowdFunding.bytecode === undefined || CrowdFunding.bytecode.length < 10) {
    console.log('[Error] CrowdFunding.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] CrowdFunding.bytecode is defined');
    //console.log('CrowdFunding.bytecode:', CrowdFunding.bytecode);
  }
  //console.log(CrowdFunding);
}

const IncomeManagement = require('./build/IncomeManagerCtrt.json');
if (IncomeManagement === undefined) {
  console.log('[Error] IncomeManagement is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] IncomeManagement is defined');
  if (IncomeManagement.abi === undefined) {
    console.log('[Error] IncomeManagement.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] IncomeManagement.abi is defined');
    //console.log('IncomeManagement.abi:', IncomeManagement.abi);
  }
  if (IncomeManagement.bytecode === undefined || IncomeManagement.bytecode.length < 10) {
    console.log('[Error] IncomeManagement.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] IncomeManagement.bytecode is defined');
    //console.log('IncomeManagement.bytecode:', IncomeManagement.bytecode);
  }
  //console.log(IncomeManagement);
}

const ProductManager = require('./build/ProductManager.json');
if (ProductManager === undefined) {
  console.log('[Error] ProductManager is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ProductManager is defined');
  if (ProductManager.abi === undefined) {
    console.log('[Error] ProductManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ProductManager.abi is defined');
    //console.log('ProductManager.abi:', ProductManager.abi);
  }
  if (ProductManager.bytecode === undefined || ProductManager.bytecode.length < 10) {
    console.log('[Error] ProductManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ProductManager.bytecode is defined');
    //console.log('ProductManager.bytecode:', ProductManager.bytecode);
  }
  //console.log(ProductManager);
}


console.log('\n---------------==Make contract instances from deployment');

console.log('more variables...');
let balanceM, balance0, balance1, balance2;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";
let tokenId, uriStr, uriBytes32, uriStrB, tokenOwner, tokenOwnerM;
let tokenControllerDetail, timeAtDeployment;
let TimeUnlockM, TimeValidM, isLockedForRelease, isTokenApproved;
let isTokenApprovedOperational, bool2, userID, serverTime;


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
// const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManagement);
// const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);

checkTrue = (item) => item;

async function asyncForEachBasic(arrayBasic, callback) {
  console.log("arrayBasic:"+arrayBasic);
  for (let idxBasic = 0; idxBasic < arrayBasic.length; idxBasic++) {
    console.log("idxBasic:"+idxBasic, arrayBasic[idxBasic]);
    await callback(arrayBasic[idxBasic], idxBasic, arrayBasic);
  }
}


//yarn run livechain -c 1 --f 0 -a 1 -b 3
const checkDeployedContracts = async () => {
  result = await instTokenController.methods.checkDeploymentConditions(...argsTokenController).call();
  console.log('\nTokenController checkDeploymentConditions():', result);
  if(result.every(checkTrue)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }
  
  result = await instHCAT721.methods.getTokenContractDetails().call();
  console.log('\ngetTokenContractDetails', result);

  result = await instHCAT721.methods.checkDeploymentConditions(...argsHCAT721).call();
  console.log('\nHCAT721 checkDeploymentConditions():', result);
  if(result.every(checkTrue)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }

  result = await instCrowdFunding.methods.checkDeploymentConditions(...argsCrowdFunding).call();
  console.log('\nCrowdFunding checkDeploymentConditions():', result);
  if(result.every(checkTrue)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }

}

const addOneUser = async () => {
  const userID = "";
  const assetbookAddr = "";
  const authLevel = 5;
  console.log('\nuserID1', userID, 'assetbookAddr', assetbookAddr, 'authLevel', authLevel);

  userIDHasBeenAdded = false;
  fromAddr = admin; privateKey = adminpk;
  if (userIDHasBeenAdded) {
    userM = await instRegistry.methods.getUserFromUid(userID).call();
    console.log('userM', userM);
    checkEq(userM[0], assetbookAddr);
    checkEq(userM[1], authLevel.toString());

  } else {
    await instRegistry.methods.addUser(userID, assetbookAddr, authLevel)
      .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('\nafter addUser() on AssetOwner1:');
    userM = await instRegistry.methods.getUserFromUid(userID).call();
    console.log('userM', userM);
    checkEq(userM[0], assetbookAddr);
    checkEq(userM[1], authLevel.toString());
  }

}


//yarn run livechain -c 1 --f 1 -a 1 -b 3
const setupTest = async () => {
  //const addr1 = web3.utils.toChecksumAddress(addrPlatform);

  console.log('\n--------==Start tests...');
  console.log('admin', admin);
  console.log('AssetOwner1', AssetOwner1);
  console.log('AssetOwner2', AssetOwner2);
  console.log('AssetOwner3', AssetOwner3);
  console.log('AssetOwner4', AssetOwner4);
  console.log('managementTeam', managementTeam);

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

  console.log('\n------------==Check AssetBook contract 1 & 2');
  console.log('addrAssetBook1', addrAssetBook1);
  console.log('addrAssetBook2', addrAssetBook2);

  assetbook1M = await instAssetBook1.methods.getAsset(0, addrHCAT721).call();
  console.log('assetbook1M:', assetbook1M);
  const amountInitAB1 = parseInt(assetbook1M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  assetbook2M = await instAssetBook2.methods.getAsset(0, addrHCAT721).call();
  console.log('assetbook2M:', assetbook2M);
  const amountInitAB2 = parseInt(assetbook2M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  assetbook3M = await instAssetBook3.methods.getAsset(0, addrHCAT721).call();
  console.log('assetbook3M:', assetbook3M);
  const amountInitAB3 = parseInt(assetbook3M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook3, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook3).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);


  // assetSymbol, addrHCAT721Index, 
  // assetAmount, timeIndexStart, 
  // timeIndexEnd, isInitialized);
  //----------------==Registry contract
  console.log('\n------------==Registry contract: add AssetBook contracts');
  let userM;
  console.log('addrRegistry', addrRegistry);
  //let getUserCountM = await instRegistry.methods.getUserCount().call();
  //console.log('getUserCountM', getUserCountM);

  if(userIDs.length !== assetbookArray.length) {
    console.log('userIDs and assetbookArray must have the same length!');
    process.exit(0);
  }
  await asyncForEachBasic(userIDs, async (item, idx) => {
    console.log('\n--------==AddUse():', idx)
    const encodedData = instRegistry.methods.addUser(item, assetbookArray[idx], authLevels[idx]).encodeABI();
    let TxResult = await signTx(admin, adminpkRaw, addrRegistry, encodedData);
    console.log('\nTxResult', TxResult);
    console.log(`after addUser() on AssetOwner${idx+1}...`);

    userM = await instRegistry.methods.getUserFromUid(item).call();
    console.log('userM', userM);
    checkEq(userM[0], assetbookArray[idx]);
    checkEq(userM[1], authLevels[idx].toString());
  });

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
  console.log('nftNameM', web3.utils.toAscii(nftNameM), 'nftsymbolM', web3.utils.toAscii(nftsymbolM), 'tokenURI', web3.utils.toAscii(tokenURI_M), 'pricingCurrencyM', web3.utils.toAscii(pricingCurrencyM));
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


// addAssetBook(assetBookAddr, userID, authLevel = 5)
const addAssetBook = async (assetBookAddr, userID, authLevel) => {
  console.log('\n------------==inside addAssetBook');
  console.log('userID1', userID, 'assetBookAddr', assetBookAddr, 'authLevel', authLevel);
  console.log('addrRegistry', addrRegistry);

  const tokenIds = await instHCAT721.methods.getAccountIds(assetBookAddr, 0, 0).call();
  const balanceXM = await instHCAT721.methods.balanceOf(assetBookAddr).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
  let encodedData = instRegistry.methods.addUser(userID, assetBookAddr, authLevel).encodeABI();

  result = await signTx(admin, adminpkRaw, addrRegistry, encodedData);
  console.log('addUser() result', result);

  console.log('\nafter addUser() on AssetOwner1:');
  userM = await instRegistry.methods.getUserFromUid(userID).call();
  console.log('userM', userM);
  return userM;
}

//yarn run livechain -c 1 --f 2
const getTokenController = async () => {

  tokenControllerDetail = await instTokenController.methods.getHTokenControllerDetails().call();
  timeAtDeployment = tokenControllerDetail[0];
  TimeUnlockM = tokenControllerDetail[1];
  TimeValidM = tokenControllerDetail[2];
  isLockedForRelease = tokenControllerDetail[3];
  isTokenApproved = tokenControllerDetail[4];
  console.log('\ntimeAtDeployment', timeAtDeployment, ', TimeUnlockM', TimeUnlockM, ', TimeValidM', TimeValidM, ', isLockedForRelease', isLockedForRelease, ', isTokenApproved', isTokenApproved);
  console.log('\ntokenControllerDetail', tokenControllerDetail);

  console.log('addrTokenController', addrTokenController);
  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  tokenIdM = await instHCAT721.methods.tokenId().call();
  console.log('isTokenApprovedOperational() =', isTokenApprovedOperational);
  console.log('tokenId or tokenCount from assetCtrt', tokenIdM);
  checkEq(isTokenApprovedOperational, false);
  checkEq(tokenIdM, '0');

  if (!isTokenApprovedOperational) {
    console.log('Setting serverTime to TimeTokenUnlock+1 ...');
    serverTime = TimeTokenUnlock+1;
    const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrTokenController, encodedData);
    console.log('\nTxResult', TxResult);
  }
  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call(); 
  console.log('isTokenApprovedOperational()', isTokenApprovedOperational);
  console.log('getTokenController() is completed');
  process.exit(0);
}


//yarn run livechain -c 1 --f 3
const showAssetBookBalances = async () => {
  await asyncForEachBasic(assetbookArray, async (item, idx) => {
    console.log(`\n--------==AssetOwner${idx+1}: AssetBook${idx+1} and HCAT721...`);
    tokenIds = await instHCAT721.methods.getAccountIds(item, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(item).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(item).call();
    console.log('HCAT getAccount():', accountM);

    const instAssetBookX = new web3.eth.Contract(AssetBook.abi, item);
    assetbookXM = await instAssetBookX.methods.getAsset(0, addrHCAT721).call();
    console.log('AssetBook1:', assetbookXM);
  });

  console.log('showAssetBookBalances() has been completed');
  process.exit(0);
}


//yarn run livechain -c 1 --f 4
const showAssetInfo = async () => {
  console.log('\n--------==showAssetInfo from HCAT721...');
  //const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);

  tokenIdM = await instHCAT721.methods.tokenId().call();
  const tokenIdM_init = parseInt(tokenIdM);
  let totalSupply = await instHCAT721.methods.totalSupply().call();
  console.log('\ntokenIdM', tokenIdM, 'totalSupply', totalSupply);

  let nftNameM = await instHCAT721.methods.name().call();
  let nftsymbolM = await instHCAT721.methods.symbol().call();
  let tokenURI_M = await instHCAT721.methods.tokenURI().call();

  let initialAssetPricingM = await instHCAT721.methods.initialAssetPricing().call();
  let IRR20yrx100M = await instHCAT721.methods.IRR20yrx100().call();
  let maxTotalSupplyM = await instHCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await instHCAT721.methods.pricingCurrency().call();
  let siteSizeInKWM = await instHCAT721.methods.siteSizeInKW().call();

  console.log(`\nnftNameM ${web3.utils.toAscii(nftNameM)}, nftsymbolM ${web3.utils.toAscii(nftsymbolM)}, tokenURI ${web3.utils.toAscii(tokenURI_M)}, pricingCurrencyM ${web3.utils.toAscii(pricingCurrencyM)}, initialAssetPricingM ${initialAssetPricingM}, IRR20yrx100M ${IRR20yrx100M},  siteSizeInKWM ${siteSizeInKWM}, maxTotalSupplyM ${maxTotalSupplyM}, tokenId ${tokenIdM_init}, totalSupply ${totalSupply}`);
  process.exit(0);
}

/*const encodedData = instRegistry.methods.addUser(item, assetbookArray[idx], authLevels[idx]).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, addrRegistry, encodedData);
  console.log('\nTxResult', TxResult);
  console.log(`after addUser() on AssetOwner${idx+1}...`);
*/
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
  const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';
  
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

  // await timer.getTime().then(function (time) {
  //     currentTime = time;
  // })
  console.log(`\ncurrent time: ${currentTime}, to ${to}, amount ${amount}, fundingType ${fundingType}, price ${price}`);

  let encodedData = instHCAT721.methods.mintSerialNFT(to, amount, price, fundingType, currentTime).encodeABI();
  //let contractAddr = addrHCAT721_Test;
  let contractAddr = addrHCAT721;
  result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData).catch((err) => console.log('\n[Error @ signTx()]', err));
  console.log('result', result);

  totalSupply = await instHCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);
}



//yarn run livechain -c 1 --f 5 -a 1 -b 190
const mintTokens = async (assetbookNum, amount) => {
  console.log('-------------==mintTokens ... Mint Token Batch');
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

  if (assetbookNum === 1) {
    to = addrAssetBook1;
  } else if (assetbookNum === 2) {
    to = addrAssetBook2;
  } else if (assetbookNum === 3) {
    to = addrAssetBook3;
  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }
  balanceM = await instHCAT721.methods.balanceOf(to).call();

  console.log('\ntokenId =', tokenIdM_init + 1, 'to', tokenIdM_init + amount, ' to AssetBook' + assetbookNum, 'amount', amount, typeof amount, 'initialAssetPricing', initialAssetPricing, typeof initialAssetPricing, 'fundingType', fundingType, typeof fundingType, 'serverTime', serverTime, typeof serverTime, 'balanceM of target assetbook before minting', balanceM);//fundingType: 1 Public Offering, 2 Private Placement

  balanceM = await instHCAT721.methods.balanceOf(to).call();
  const amountInit = parseInt(balanceM);
  console.log(`assetbook${assetbookNum} has balanceM: ${balanceM}, amountInit: ${amountInit}`);

  result = await instHCAT721.methods.checkMintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).call({from: admin});
  console.log('\nresult', result);
  if(result[0].every(checkTrue)){
    console.log('[Success] all checks have passed');
  } else {console.log('[Failed] Some/one check(s) have/has failed');}
  checkEq(result[0].every(checkTrue), true);

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
    let TxResult = await signTx(admin, adminpkRaw, tokenCtrtAddr, encodedData).catch((err) => console.log('[Error @ signTx()]', err));
    console.log('TxResult', TxResult);

  } else if(choice === 0){

  } else {
    await instHCAT721.methods.mintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).send({
      value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue
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

  console.log('\n-----------==Switching to showAssetBookBalances()...');
  await showAssetBookBalances();
  console.log('mintTokens() has been completed');
  process.exit(0);
}


//yarn run livechain -c 1 --f 39
const transferTokensKY = async () => {
  console.log('\ntransferTokensKY...');
  const contractAddr = "0x36fBC316ca6c4a316162b09F7c7e772a55DA5872";
  const _from = "0x2905D81FfD7EEd9Bf7aDB318B6F53bd567339925";
  const to = "0x6e2e81a113f8E02253a4aF2A8f8de15902899BFd";
  const amount = 1;
  const price = 21000;
  const serverTime = 201905281435;

  const inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, contractAddr);
  let encodedData = inst_HCAT721.methods.safeTransferFromBatch(_from, to, amount, price, serverTime).encodeABI();
  //safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime)
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);
  console.log('TxResult', TxResult);
} 

//yarn run livechain -c 1 --f 6 -a 1 -b 150 -t 2
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

  _from = assetbookArray[parseInt(assetbookNumFrom) - 1];
  _to   = assetbookArray[parseInt(assetbookNumTo) - 1];
  price = 21000;
  _fromAssetOwner = assetOwnerArray[assetbookNumFrom];
  _toAssetOwner = assetOwnerArray[assetbookNumTo];
  const assetOwnerpkRaw = assetOwnerpkRawArray[assetbookNumFrom];
  console.log('_fromAssetOwner', _fromAssetOwner, 'assetOwnerpkRaw', assetOwnerpkRaw);
  _privateKey = assetOwnerpkRaw;
  //_privateKey = Buffer.from(assetOwnerpkRaw.substr(2), 'hex');
  //AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
  // assetOwnerArray, assetOwnerpkRawArray

  let balanceFrom = await instHCAT721.methods.balanceOf(_from).call();
  let balanceTo = await instHCAT721.methods.balanceOf(_to).call();
  const balanceFromInitial = parseInt(balanceFrom);
  const balanceToInitial = parseInt(balanceTo);
  console.log('\n--------==balanceFromInitial:', balanceFromInitial, ', balanceToInitial', balanceToInitial);

  instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, _from);
  instAssetBookTo = new web3.eth.Contract(AssetBook.abi, _to);

  let assetbookFromM = await instAssetBookFrom.methods.getAsset(0, addrHCAT721).call();//assetIndex_, address assetAddr_, bytes32 symbol, uint balance
  const balanceFromInitial_AB = parseInt(assetbookFromM[3]);
  console.log(`\nassetbookFromM: assetIndex_= ${assetbookFromM[0]}, symbol= ${web3.utils.toAscii(assetbookFromM[2])}, balanceFromInitial_AB = ${assetbookFromM[3]}`);

  let assetbookToM = await instAssetBookTo.methods.getAsset(0, addrHCAT721).call();
  const balanceToInitial_AB = parseInt(assetbookToM[3]);
  console.log(`\nassetbookToM: assetIndex_= ${assetbookToM[0]}, symbol= ${web3.utils.toAscii(assetbookToM[2])}, balanceFromInitial_AB = ${assetbookToM[3]}`);
  
  checkEq(balanceFromInitial, balanceFromInitial_AB);
  checkEq(balanceFromInitial >= amount, true);
  checkEq(balanceToInitial, balanceToInitial_AB);

  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  checkEq(isTokenApprovedOperational, true);
  console.log('isTokenApprovedOperational is true => ready to send tokens');

  serverTime = TimeTokenUnlock+5;
  console.log('\nsending tokens via transferAssetBatch()...');

  const isAmountInt = Number.isInteger(amount);
  const isPriceInt = Number.isInteger(price);
  const isServerTimeInt = Number.isInteger(serverTime);
  console.log(`via safeTransferFromBatch()... 
  AssetBook${assetbookNumFrom} sending to AssetBook${assetbookNumTo}
  ${amount} tokens ${typeof amount} ${isAmountInt}
  balanceFromInitial: ${balanceFromInitial}, balanceToInitial: ${balanceToInitial}
  price: ${price} ${typeof price} ${isPriceInt} 
  serverTime: ${serverTime} ${typeof serverTime} ${isServerTimeInt}
  ... as TimeTokenUnlock+5
  _from: ${_from}
  _to:   ${_to}`);
  checkEq(isAmountInt, true);
  checkEq(isPriceInt, true);
  checkEq(isServerTimeInt, true);

  //const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
  result = await instHCAT721.methods.getTokenContractDetails().call({from: AssetOwner1});
  console.log('result', result);

  result = await instHCAT721.methods.checkSafeTransferFromBatch(_from, _to, amount, price, serverTime).call({from: AssetOwner1});
  console.log('result', result);
  if(result.every(checkTrue)){
    console.log('\n[Success] all checks have passed checkSafeTransferFromBatch()');
  } else {
    console.log('\n[Failed] Some/one check(s) have/has failed checkSafeTransferFromBatch()');
  }

  // yarn run livechain -c 1 --f 6 -a 1 -b 170 -t 3
  const encodedData = instHCAT721.methods.safeTransferFromBatch(_from, _to, amount, price, serverTime).encodeABI();//address _from, address _to, uint amount, uint price, uint serverTime

  //process.exit(0);
  //TxResult = await signTx(admin, adminpkRaw, addrHCAT721, encodedData);
  TxResult = await signTx(backendAddr, backendRawPrivateKey, addrHCAT721, encodedData).catch((err) => {
    console.log('[Error @ signTx()]', err)
    process.exit(1);
  });
  console.log('TxResult', TxResult);
  /**
  let TxResult = await signTx(admin, adminpkRaw, tokenCtrtAddr, encodedData).catch((err) => console.log('[Error @ signTx()]', err));

  console.log('TxResult', TxResult);
  //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)

  */
  console.log(`safeTransferFromBatch is completed. We have sent amount tokens from:, balanceFromInitial_AB, to account: balanceToInitial, add amount`);

  console.log('\nCheck AssetBookFrom after txn...');
  showAssetBookBalances();
  process.exit(0);
}



const sendAssetBeforeAllowed = async () => {
  //----------------==Send tokens before allowed time
  console.log('\n------------==Send tokens before allowed time');
  serverTime = TimeOfDeployment;
  await instTokenController.methods.setTimeCurrent(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
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
  let TxResult = await signTx(admin, adminpkRaw, addrTestCtrt, encodedData);
  console.log('TxResult', TxResult);

  /*//Error: Returned error: unknown account
  await instTestCtrt.methods.setHCAT721SerialNumberNG(newNum)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
  HCAT721SerialNumber = await instTestCtrt.methods.HCAT721SerialNumber().call();
  console.log('HCAT721SerialNumber', HCAT721SerialNumber);
  checkEq(HCAT721SerialNumber, newNum);
  */
}

/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/
//yarn run livechain -c 1 --f 36
const addAssetBookAPI = async () => {
  const assetBookAddr = addrAssetBook3;
  const userID = "A500000003", authLevel = 5;
  const [assetBookAddrM, authLevelM] = await addAssetBook(assetBookAddr, userID, authLevel);
}


//yarn run livechain -c 1 --f 37 -a 1 -b 3
const sequentialMintSuperAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperAPI()');

  const toAddressArray =[addrAssetBook1, addrAssetBook2, addrAssetBook3];
  const amountArray = [136, 212, 99];//236, 312 ... prev 522, 594, 407
  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const price = 20000;

  //from blockchain.js
  const [isFailed, isCorrectAmountArray] = await sequentialMintSuper(toAddressArray, amountArray, tokenCtrtAddr, fundingType, price).catch((err) => {
    console.log('[Error @ sequentialMintSuper]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);
  if(isFailed || isFailed === undefined || isFailed === null) {
    console.log('\n[Failed] Some/All minting actions have failed. Check balances!');
  } else {
    console.log('\n[Success] All minting actions have been completed successfully');
  }
  process.exit(0);
}

//yarn run livechain -c 1 --f 38 -a 1 -b 3
const sequentialMintSuperNoMintAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperNoMintAPI()');

  const toAddressArray =[addrAssetBook1, addrAssetBook2, addrAssetBook3];
  const amountArray = [236, 312, 407];//236, 312 ... prev 250, 270, 0
  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const price = 20000;

  //from blockchain.js
  const [isFailed, isCorrectAmountArray] = await sequentialMintSuperNoMint(toAddressArray, amountArray, tokenCtrtAddr, fundingType, price).catch((err) => {
    console.log('[Error @ sequentialMintSuperNoMint]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);
  process.exit(0);
}


const showMenu = () => {
  console.log('\n');
  console.log("\x1b[32m", '$ yarn run testlive1 --chain C --func F --arg1 arg1 --arg2 arg2');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: getTokenController, 2: showAssetBookBalances, 3: mintTokens(assetbookNum, amount), 4: showAssetInfo(tokenId), 5: sendAssetBeforeAllowed(), 6: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount)');
  console.log("\x1b[32m", 'arg1, arg2, ... are arguments used in above functions ...');
}


//-------------------------------==

//yarn run livechain -c 1 --f 0 -a 1 -b 3
if (func === 0) {
  checkDeployedContracts();

//yarn run livechain -c 1 --f 1 -a 1 -b 3
} else if (func === 1) {
  setupTest();

//yarn run livechain -c 1 --f 2 -a 1 -b 3
} else if (func === 2) {
  getTokenController();

//yarn run livechain -c 1 --f 3 -a 1 -b 3
} else if (func === 3) {
  showAssetBookBalances();

//yarn run livechain -c 1 --f 4 -a 1 -b 3
} else if (func === 4) {
  showAssetInfo();

//yarn run livechain -c 1 --f 5 -a 1 -b 3
} else if (func === 5) {
  mintTokens(arg1, arg2);

//yarn run livechain -c 1 --f 6 -a 1 -b 150 -t 2
} else if (func === 6) {
  transferTokens(arg1, arg2, arg3);

//yarn run livechain -c 1 --f 6 -a 1 -b 3
} else if (func === 9) {
  mintTokenFn1();

//yarn run livechain -c 1 --f 7 -a 1 -b 3
} else if (func === 7) {
  sendAssetBeforeAllowed();

//yarn run livechain -c 1 --f 8 -a 1 -b 3
} else if (func === 8) {
  setServerTime(arg1);

//yarn run livechain -c 1 --f 31 -a 1 -b 3
} else if (func === 31) {
  testCtrt();

//yarn run livechain -c 1 --f 36 -a 1 -b 3
} else if (func === 36) {
  addAssetBookAPI();

//yarn run livechain -c 1 --f 37 -a 1 -b 3
} else if (func === 37) {
  sequentialMintSuperAPI();

//yarn run livechain -c 1 --f 38 -a 1 -b 3
} else if (func === 38) {
  sequentialMintSuperNoMintAPI();

} else if (func === 39) {
  transferTokensKY();
}
showMenu();


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

const checkEq = (value1, value2) => {
  if (value1 === value2) {
    console.log('checked ok');
  } else {
    console.log("\x1b[31m", '[Error] _' + value1 + '<vs>' + value2 + '_', typeof value1, typeof value2);
    process.exit(1);
  }
}



const signTxn = (fromAddr, ctrtAddr, encodedData, privateKey) => {
  web3.eth.getTransactionCount(fromAddr).then((count) => {
    console.log("Count: ", count);
    //var amount = web3.utils.toHex(1e16);
    var rawTransaction = {
      "from": fromAddr,
      "gasPrice": web3.utils.toHex(20 * 1e9),
      "gasLimit": web3.utils.toHex(7000000),
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

      web3.eth.getTransactionCount(userEthAddr)
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              console.log(userPrivateKey);
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
