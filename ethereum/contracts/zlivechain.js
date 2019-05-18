/**
$ yarn run livechain -c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 

0: setupTest,  1: getTokenController, 2: showAccountAssetBooks, 3: mintTokens(assetbookNum, amount), 4: showAssetInfo(tokenId), 5: sendAssetBeforeAllowed(), 6: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount)

0: setupTest
yarn run livechain -c 1 --f 0

1: getTokenController
yarn run livechain -c 1 --f 1

2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 4 -a tokenId

3: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 3 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 3 -a 2 -b 120

5: sendAssetBeforeAllowed(),
yarn run livechain -c 1 --f 5

6: setServerTime(newServerTime)
yarn run livechain -c 1 --f 6 -a serverTime

7: transferTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 7 -a 2 -b 1
*/
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const { sequentialMintSuper, sequentialMintSuperNoMint} = require('../../timeserver/blockchain');

let provider, web3, gasLimitValue, gasPriceValue, prefix = '', chain, func, arg1, arg2, argbool;

console.log('process.argv', process.argv);
const arguLen = process.argv.length;
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run livechain -c C --f F -a A -b b');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: getTokenController, 2: showAccountAssetBooks, 3: showAssetInfo(tokenId), 4: mintTokens(assetbookNum, amount), 8: sendAssetBeforeAllowed(), 9: setServerTime(newServerTime), 9: transferTokens(assetbookNum, amount)');
  console.log("\x1b[32m", 'a, b, ... are arguments used in above functions ...');
  process.exit(1);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
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
      }

    }

  }
}
let admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4;
let adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw;

let symNum = 0;
const timeInitial = 201903081040;
let timeCurrent = timeInitial, txnNum = 2, isShowCompiledCtrt = false;
console.log('chain = ', chain, ', txnNum =', txnNum, ', timeCurrent =', timeCurrent);


let adminpk, AssetOwner1pk, AssetOwner2pk, AssetOwner3pk, AssetOwner4pk;
let addrPlatform, addrMultiSig1, addrMultiSig2, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrRegistry, addrTokenController, addrHCAT721, addrCrowdFunding, addrTestCtrt, assetbook1M, assetbook2M;
let amount, to, _from, tokenIds, tokenIdMX, nodeUrl, authLevelM, amountInitAB1;
let choiceOfHCAT721;

let nftSymbol, nftName, location, maxTotalSupply, siteSizeInKW, initialAssetPricing, IRR20yrx100, duration, quantityGoal, fundingType;
let isFundingApprovedHCAT721, checkPlatformSupervisor;

const uriBase = "nccu0".trim();

function symbolObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, timeOfDeployment, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
  this.nftSymbol = nftSymbol;
  this.maxTotalSupply = maxTotalSupply;
  this.quantityGoal = Math.round(maxTotalSupply * 0.95);
  this.siteSizeInKW = siteSizeInKW;
  this.initialAssetPricing = initialAssetPricing;
  this.pricingCurrency = pricingCurrency;
  this.fundingType = fundingType;
  this.IRR20yrx100 = IRR20yrx100;
  this.duration = duration;
  this.nftName = nftSymbol + " site No.n(2019)";
  this.location = nftSymbol.substr(0, nftSymbol.length - 4);
  this.timeOfDeployment = timeOfDeployment;
  this.addrCrowdFunding = addrCrowdFunding;
  this.addrTokenController = addrTokenController;
  this.addrHCAT721 = addrHCAT721;
  this.addrIncomeManager = addrIncomeManager;
}

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


    //------------==Copied from zdeploy.js
    addrHelium = "0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7";
    addrAssetBook1 = "0x10C2E71CE92d637E6dc30BC1d252441A2E0865B0";
    addrAssetBook2 = "0xe1A64597056f5bf55268dF75F251e546879da89c";
    addrAssetBook3 = "0x22e2691be1312F69549d23A2C2d3AA3d55D56c92";
    addrRegistry = "0xe86976cEd3bb9C924235B904F43b829E4A32fa0d";

    choiceOfHCAT721 = 1; // 1: HCAT721_Test, 2: HCAT721
    if(choiceOfHCAT721===1){
      console.log('use HCAT721_Test!!!');
      _addrHCAT721 = '0x6978c55dee93a2351150A8C34BD5a2ddA6D1d327';
    } else if(choiceOfHCAT721===2){
      console.log('use HCAT721');
      _addrHCAT721 = "0xe589C3c07D6733b57adD21F8C17132059Ad6b2b0";
    }
    
    //addrCrowdFunding, addrTokenController, _addrHCAT721, addrIncomeManager
    const symbolObj0 = new symbolObject("AAOS1901", "", "", 973, 0, 300, 18000, "NTD", 470, 20, 201905150000, 2, "0x677835e97c4Dc35cc1D9eCd737Cc6Fc1380e1bDD", "0xF8Bbc068b325Fe7DA1Ef9bE8f69de38CB7299D10", _addrHCAT721, "");
    const symbolObj1 = new symbolObject("ABOS1901", "", "", 2073, 0, 300, 19000, "NTD", 470, 20, 201905150000, 2, "", "", _addrHCAT721, "");
    const symbolObj2 = new symbolObject("ACOS1901", "", "", 5073, 0, 400, 20000, "NTD", 490, 20, 201905150000, 2, "", "", _addrHCAT721, "");

    const symObjArray = [symbolObj0, symbolObj1, symbolObj2];
    const symArray = [];
    const crowdFundingAddrArray = [];
    const tokenControllerAddrArray = [];

    symObjArray.forEach((obj) => {
      symArray.push(obj.nftSymbol);
      crowdFundingAddrArray.push(obj.addrCrowdFunding);
      tokenControllerAddrArray.push(obj.addrTokenController)
    });
    console.log('\nconst symArray =', symArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray, ';');

    nftSymbol = symObjArray[symNum].nftSymbol;
    maxTotalSupply = symObjArray[symNum].maxTotalSupply;
    quantityGoal = symObjArray[symNum].quantityGoal;
    siteSizeInKW = symObjArray[symNum].siteSizeInKW;
    initialAssetPricing = symObjArray[symNum].initialAssetPricing;
    pricingCurrency = symObjArray[symNum].pricingCurrency;
    IRR20yrx100 = symObjArray[symNum].IRR20yrx100;
    duration = symObjArray[symNum].duration;
    nftName = symObjArray[symNum].nftName;
    location = symObjArray[symNum].location;
    timeOfDeployment = symObjArray[symNum].timeOfDeployment;
    fundingType = symObjArray[symNum].fundingType;

    addrCrowdFunding = symObjArray[symNum].addrCrowdFunding;
    addrTokenController = symObjArray[symNum].addrTokenController;
    addrHCAT721 = symObjArray[symNum].addrHCAT721;
    addrIncomeManager = symObjArray[symNum].addrIncomeManager;

/**
const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';
*/
    admin = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    adminpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
    AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
    AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
    AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
    AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
    AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";    
    AssetOwner4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
    AssetOwner4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";
    AssetOwner5 = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
    AssetOwner5pkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";

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
let managementTeam;
let balanceM, balance0, balance1, balance2;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

const TimeTokenLaunch = timeCurrent + 3;
const TimeTokenUnlock = timeCurrent + 4;
const TimeTokenValid = timeCurrent + 9;

const goalInPercentage = 97;
const CFSD2 = timeCurrent + 1;
const CFED2 = timeCurrent + 10;
let serverTime = timeCurrent;

const TimeAnchor = TimeTokenLaunch;
let addrPA_Ctrt, addrFMXA_Ctrt, addrPlatformCtrt;

let tokenId, uriStr, uriBytes32, uriStrB, tokenOwner, tokenOwnerM;
let tokenControllerDetail, timeAtDeployment;
let TimeUnlockM, TimeValidM, isLockedForRelease, isTokenApproved;
let isTokenApprovedOperational, bool2, userID;

/**
$ yarn run livechain -c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 0: setupTest, 1: getTokenController, 2: showAccountAssetBooks, 4: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount), 
arg1, arg2, ... are arguments used in above functions ...
*/

const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);

const instAssetBook1 = new web3.eth.Contract(AssetBook.abi, addrAssetBook1);
const instAssetBook2 = new web3.eth.Contract(AssetBook.abi, addrAssetBook2);

const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);

let inst_HCAT721;
if(choiceOfHCAT721===1){
  console.log('use HCAT721_Test!!!');
  inst_HCAT721 = new web3.eth.Contract(HCAT721_Test.abi, addrHCAT721);
} else if(choiceOfHCAT721===2){
  console.log('use HCAT721');
  inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
}

const instTestCtrt = new web3.eth.Contract(TestCtrt.abi, addrTestCtrt);


// const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addrCrowdFunding);
// const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManagement);
// const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);


//yarn run livechain -c 1 --f 0
const setupTest = async () => {
  //const addr1 = web3.utils.toChecksumAddress(addrPlatform);

  console.log('\n--------==Start tests...');
  managementTeam = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4];
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
  tokenIds = await inst_HCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
  balanceXM = await inst_HCAT721.methods.balanceOf(addrAssetBook1).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  assetbook2M = await instAssetBook2.methods.getAsset(0, addrHCAT721).call();
  console.log('assetbook2M:', assetbook2M);
  const amountInitAB2 = parseInt(assetbook2M[2]);
  tokenIds = await inst_HCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
  balanceXM = await inst_HCAT721.methods.balanceOf(addrAssetBook2).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);


  // assetSymbol, addrHCAT721Index, 
  // assetAmount, timeIndexStart, 
  // timeIndexEnd, isInitialized);
  //----------------==Registry contract
  console.log('\n------------==Registry contract: add AssetBook contracts 1 & 2');
  let fromAddr, ctrtAddr, privateKey, encodedData, userM, userIDHasBeenAdded;
  console.log('addrRegistry', addrRegistry);

  //let getUserCountM = await instRegistry.methods.getUserCount().call();
  //console.log('getUserCountM', getUserCountM);

  userID = "A500000001"; assetbookAddr = addrAssetBook1; authLevel = 5;
  userIDHasBeenAdded = true;
  fromAddr = admin; privateKey = adminpk;
  console.log('\nuserID1', userID, 'assetbookAddr', assetbookAddr, 'authLevel', authLevel);
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

  userID = "A500000002"; assetbookAddr = addrAssetBook2; authLevel = 5;
  userIDHasBeenAdded = true;
  console.log('\nuserID1', userID, 'assetbookAddr', assetbookAddr, 'authLevel', authLevel);
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

  // process.exit(0);

  //----------------==
  console.log('\n------------==Check HCAT721 parameters');
  console.log('addrHCAT721', addrHCAT721);

  let nftNameM = await inst_HCAT721.methods.name().call();
  let nftsymbolM = await inst_HCAT721.methods.symbol().call();
  let initialAssetPricingM = await inst_HCAT721.methods.initialAssetPricing().call();
  let IRR20yrx100M = await inst_HCAT721.methods.IRR20yrx100().call();
  let maxTotalSupplyM = await inst_HCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await inst_HCAT721.methods.pricingCurrency().call();
  let siteSizeInKWM = await inst_HCAT721.methods.siteSizeInKW().call();
  let tokenURI_M = await inst_HCAT721.methods.tokenURI().call();

  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);

  //checkEq(nftNameM, nftName);
  //checkEq(nftsymbolM, nftSymbol);
  checkEq(initialAssetPricingM, '' + initialAssetPricing);
  checkEq(IRR20yrx100M, '' + IRR20yrx100);
  checkEq(maxTotalSupplyM, '' + maxTotalSupply);
  //checkEq(pricingCurrencyM, ''+pricingCurrency);
  checkEq(siteSizeInKWM, '' + siteSizeInKW);
  checkEq(tokenIdMX, 0);
  console.log('nftNameM', web3.utils.toAscii(nftNameM), 'nftsymbolM', web3.utils.toAscii(nftsymbolM), 'tokenURI', web3.utils.toAscii(tokenURI_M), 'pricingCurrencyM', web3.utils.toAscii(pricingCurrencyM));
  //checkEq(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

  const tokenIdMXInit = tokenIdMX;
  console.log("\x1b[33m", '\nConfirm tokenId = ', tokenIdM, ', tokenIdMXInit', tokenIdMXInit);

  console.log('\n-----Update time at TokenController');
  timeCurrent = timeInitial;
  console.log('update tokencontroller time to timeInitial:', timeInitial);
  await instTokenController.methods.updateState(timeCurrent)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

  let isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  checkEq(isTokenApprovedOperational, false);


  let supportsInterface0x80ac58cd = await inst_HCAT721.methods.supportsInterface("0x80ac58cd").call();
  checkEq(supportsInterface0x80ac58cd, true);
  let supportsInterface0x5b5e139f = await inst_HCAT721.methods.supportsInterface("0x5b5e139f").call();
  checkEq(supportsInterface0x5b5e139f, true);
  let supportsInterface0x780e9d63 = await inst_HCAT721.methods.supportsInterface("0x780e9d63").call();
  checkEq(supportsInterface0x780e9d63, true);

  console.log('setup has been completed');
  process.exit(0);
};

//yarn run livechain -c 1 --f 1
const getTokenController = async () => {

  console.log('addrTokenController', addrTokenController);
  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  console.log('isTokenApprovedOperational() =', isTokenApprovedOperational);
  console.log('tokenId or tokenCount from assetCtrt', tokenIdM);

  //-----------------==Check Token Controller: time
  /*
  console.log('\n------------==Check TokenController parameters: time');
  console.log('addrTokenController', addrTokenController);
  let owner = await instTokenController.methods.owner().call();
  let chairman = await instTokenController.methods.chairman().call();
  let director = await instTokenController.methods.director().call();
  let manager = await instTokenController.methods.manager().call();
  let admin = await instTokenController.methods.admin().call();

  checkEq(owner, AssetOwner4);
  checkEq(chairman, AssetOwner3);
  checkEq(director, AssetOwner2);
  checkEq(manager, AssetOwner1);
  checkEq(admin, admin);
  */
  // owner = managementTeam[4];
  // chairman = managementTeam[3];
  // director = managementTeam[2];
  // manager = managementTeam[1];
  // admin = managementTeam[0];

  tokenControllerDetail = await instTokenController.methods.getHTokenControllerDetails().call();
  timeAtDeployment = tokenControllerDetail[0];
  TimeUnlockM = tokenControllerDetail[1];
  TimeValidM = tokenControllerDetail[2];
  isLockedForRelease = tokenControllerDetail[3];
  isTokenApproved = tokenControllerDetail[4];
  console.log('timeAtDeployment', timeAtDeployment, ', TimeUnlockM', TimeUnlockM, ', TimeValidM', TimeValidM, ', isLockedForRelease', isLockedForRelease, ', isTokenApproved', isTokenApproved);
  console.log('tokenControllerDetail', tokenControllerDetail);

  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
  // if (!isTokenApprovedOperational) {
  //   console.log('Setting timeCurrent to TimeTokenUnlock+1 ...');
  //   timeCurrent = TimeTokenUnlock+1;
  //   await instTokenController.methods.setTimeCurrent(timeCurrent)
  //   .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
  //   isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call(); 
  // }
  console.log('isTokenApprovedOperational()', isTokenApprovedOperational);
  console.log('getTokenController() is completed');
  process.exit(0);
}

/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
const showAssetInfo = async (_tokenId) => {
  console.log('\n--------==showAssetInfo from HCAT721...');

  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);
  let totalSupply = await inst_HCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);
  let nftNameM = await inst_HCAT721.methods.name().call();
  let nftsymbolM = await inst_HCAT721.methods.symbol().call();
  let initialAssetPricingM = await inst_HCAT721.methods.initialAssetPricing().call();
  let IRR20yrx100M = await inst_HCAT721.methods.IRR20yrx100().call();
  let maxTotalSupplyM = await inst_HCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await inst_HCAT721.methods.pricingCurrency().call();
  let siteSizeInKWM = await inst_HCAT721.methods.siteSizeInKW().call();
  let tokenURI_M = await inst_HCAT721.methods.tokenURI().call();
  let isNormalModeEnabled = await inst_HCAT721.methods.isNormalModeEnabled().call();

  console.log(`\nnftNameM ${web3.utils.toAscii(nftNameM)}, nftsymbolM ${web3.utils.toAscii(nftsymbolM)}, tokenURI ${web3.utils.toAscii(tokenURI_M)}, pricingCurrencyM ${web3.utils.toAscii(pricingCurrencyM)}, initialAssetPricingM ${initialAssetPricingM}, IRR20yrx100M ${IRR20yrx100M},  siteSizeInKWM ${siteSizeInKWM}, isNormalModeEnabled ${isNormalModeEnabled}, maxTotalSupplyM ${maxTotalSupplyM}, tokenId ${tokenIdMX}, totalSupply ${totalSupply}`);

  console.log('\naddrAssetBook1', addrAssetBook1);
  console.log('addrAssetBook2', addrAssetBook2);
  process.exit(0);
}

/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
const showAccountAssetBooks = async () => {
  console.log('\n--------==AssetOwner1: AssetBook and HCAT721...');
  tokenIds = await inst_HCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
  balanceXM = await inst_HCAT721.methods.balanceOf(addrAssetBook1).call();
  console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
  accountM = await inst_HCAT721.methods.getAccount(addrAssetBook1).call();
  console.log('HCAT getAccount():', accountM);
  assetbookXM = await instAssetBook1.methods.getAsset(0, addrHCAT721).call();
  console.log('AssetBook1:', assetbookXM);
  //const isTokenIdsCorrect1 = arraysSortedEqual(assetbook[7], assetbook[8]);


  console.log('\n--------==AssetOwner2: AssetBook and HCAT721...');
  tokenIds = await inst_HCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
  balanceXM = await inst_HCAT721.methods.balanceOf(addrAssetBook2).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
  accountM = await inst_HCAT721.methods.getAccount(addrAssetBook2).call();
  console.log('HCAT getAccount():', accountM);
  assetbookXM = await instAssetBook2.methods.getAsset(0, addrHCAT721).call();
  console.log('AssetBook2:', assetbookXM);

  console.log('showAccountAssetBooks() has been completed');
  process.exit(0);
}

/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
// 5 mintTokenFn1
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
  
  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);
  let totalSupply = await inst_HCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);
  let nftNameM = await inst_HCAT721.methods.name().call();
  let nftsymbolM = await inst_HCAT721.methods.symbol().call();
  let maxTotalSupplyM = await inst_HCAT721.methods.maxTotalSupply().call();
  let pricingCurrencyM = await inst_HCAT721.methods.pricingCurrency().call();
  let tokenURI_M = await inst_HCAT721.methods.tokenURI().call();
  let isNormalModeEnabled = await inst_HCAT721.methods.isNormalModeEnabled().call();

  console.log(`\nnftNameM ${web3.utils.toAscii(nftNameM)}, nftsymbolM ${web3.utils.toAscii(nftsymbolM)}, tokenURI ${web3.utils.toAscii(tokenURI_M)}, pricingCurrencyM ${web3.utils.toAscii(pricingCurrencyM)}, isNormalModeEnabled ${isNormalModeEnabled}, maxTotalSupplyM ${maxTotalSupplyM}, tokenId ${tokenIdMX}, totalSupply ${totalSupply}`);

  //process.exit(0);

  // await timer.getTime().then(function (time) {
  //     currentTime = time;
  // })
  console.log(`\ncurrent time: ${currentTime}, to ${to}, amount ${amount}, fundingType ${fundingType}, price ${price}`);

  let encodedData = inst_HCAT721.methods.mintSerialNFT(to, amount, price, fundingType, currentTime).encodeABI();
  let contractAddr = addrHCAT721_Test;
  let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData).catch((err) => console.log('\n[Error @ signTx()]', err));
  console.log('result', result);

  totalSupply = await inst_HCAT721.methods.totalSupply().call();
  console.log('\ntotalSupply', totalSupply);

}


// addAssetBook(assetBookAddr, userID, authLevel = 5)
const addAssetBook = async (assetBookAddr, userID, authLevel) => {
  console.log('\n------------==inside addAssetBook');
  console.log('userID1', userID, 'assetBookAddr', assetBookAddr, 'authLevel', authLevel);
  console.log('addrRegistry', addrRegistry);

  const tokenIds = await inst_HCAT721.methods.getAccountIds(assetBookAddr, 0, 0).call();
  const balanceXM = await inst_HCAT721.methods.balanceOf(assetBookAddr).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

  const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
  let encodedData = instRegistry.methods.addUser(userID, assetBookAddr, authLevel).encodeABI();

  let result = await signTx(admin, adminpkRaw, addrRegistry, encodedData);
  console.log('addUser() result', result);

  console.log('\nafter addUser() on AssetOwner1:');
  userM = await instRegistry.methods.getUserFromUid(userID).call();
  console.log('userM', userM);
  return userM;
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
  const userM = await addAssetBook(assetBookAddr, userID, authLevel);
  //checkEq(userM[0], assetBookAddr);
  //checkEq(userM[1], authLevel.toString());
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
  if(isFailed) {
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



/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
const mintTokens = async (assetbookNum, amount) => {
  console.log('-------------==mintTokens ... Mint Token Batch');
  console.log('assetbookNum', assetbookNum, 'amount', amount);

  if (assetbookNum < 1 || assetbookNum > 2) {
    console.log('assetbookNum value should be >= 1 and <= 2. assetbookNum = ', assetbookNum);
    process.exit(1);
  } else if (amount < 1) {
    console.log('amount value should be >= 1. amount = ', assetbookNum);
    process.exit(1);
  } else {
    console.log('assetbookNum = ', assetbookNum);
  }

  addrHCAT721_Test = '0x6978c55dee93a2351150A8C34BD5a2ddA6D1d327';

  //addrPlatform  addrRegistry  addrMultiSig1 addrAssetBook1  addrTokenController  addrHCAT721

  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);
  console.log('\ncurrent tokenId = ', tokenIdMX);
  //checkEq(tokenIdM, tokenIdMX.toString());

  if (assetbookNum === 1) {
    to = addrAssetBook1;
  } else if (assetbookNum === 2) {
    to = addrAssetBook2;
  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }

  //yarn run livechain -c 1 --f 3 -a 1 -b 3
  //yarn run livechain -c 1 --f 3 -a assetbookNum, -b amount
  console.log('\n------------==Mint Token in Batch: tokenId =', tokenIdMX + 1, 'to', tokenIdMX + amount, ' to AssetBook' + assetbookNum, 'amount', amount, typeof amount, 'initialAssetPricing', initialAssetPricing, typeof initialAssetPricing, 'fundingType', fundingType, typeof fundingType, 'serverTime', serverTime, typeof serverTime);

  balanceM = await inst_HCAT721.methods.balanceOf(to).call();
  amountInitAB1 = parseInt(balanceM);
  console.log('target assetbook has balanceM:', balanceM, 'amountInitAB1', amountInitAB1);

  const mintSerialNFT_ReqCheck = await inst_HCAT721.methods.mintSerialNFT_ReqCheck(to, amount, initialAssetPricing, fundingType, serverTime).call({from: admin});
  console.log('\nmintSerialNFT_ReqCheck', mintSerialNFT_ReqCheck);
  checkEq(mintSerialNFT_ReqCheck[0],true);
  checkEq(mintSerialNFT_ReqCheck[1],true);
  checkEq(mintSerialNFT_ReqCheck[2],amount+initialAssetPricing+serverTime+'');

  const ReqCheck_isContract = await inst_HCAT721.methods.ReqCheck_isContract(to).call();
  console.log('\nReqCheck_isContract', ReqCheck_isContract);
  checkEq(ReqCheck_isContract[0],true);
  checkEq(ReqCheck_isContract[1],true);

  //process.exit(0);
  /**
  let encodedData = instTestCtrt.methods.setHCAT721SerialNumberNG(newNum).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, addrTestCtrt, encodedData);
  console.log('TxResult', TxResult);
  
  signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
  */

  
  let isNormalModeEnabled = await inst_HCAT721.methods.isNormalModeEnabled().call();
  console.log('\nisNormalModeEnabled', isNormalModeEnabled);

  const tokenCtrtAddr = addrHCAT721;
  let encodedData = inst_HCAT721.methods.setTestMode(false).encodeABI();
  let TxResult = await signTx(admin, adminpkRaw, tokenCtrtAddr, encodedData).catch((err) => console.log('[Error @ signTx()]', err));
  console.log('TxResult', TxResult);

  isNormalModeEnabled = await inst_HCAT721.methods.isNormalModeEnabled().call();
  console.log('\nisNormalModeEnabled', isNormalModeEnabled);
  process.exit(0);
  //Transaction has been reverted by the EVM:


  //----------------------------==
  console.log('\nbefore mintSerialNFT()');
  const choice = 1;
  if (choice === 1) {
    let encodedData = inst_HCAT721.methods.mintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).encodeABI();
    let TxResult = await signTx(admin, adminpkRaw, tokenCtrtAddr, encodedData).catch((err) => console.log('[Error @ signTx()]', err));
    console.log('TxResult', TxResult);

  } else if(choice === 0){

  } else {
    await inst_HCAT721.methods.mintSerialNFT(to, amount, initialAssetPricing, fundingType, serverTime).send({
      value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue
    }).on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      }).on('error', function (error) {
        console.log('error:', error.toString());
      });
  }

  tokenIdMX += amount;
  tokenIdM = await inst_HCAT721.methods.tokenId().call();
  checkEq(tokenIdM, tokenIdMX.toString());

  if (amount > 2) {
    tokenOwnerM = await inst_HCAT721.methods.ownerOf(tokenIdMX - 2).call();
    checkEq(tokenOwnerM, to);
    tokenOwnerM = await inst_HCAT721.methods.ownerOf(tokenIdMX - 1).call();
    checkEq(tokenOwnerM, to);

  } else if (amount > 1) {
    tokenOwnerM = await inst_HCAT721.methods.ownerOf(tokenIdMX - 1).call();
    checkEq(tokenOwnerM, to);
  }
  tokenOwnerM = await inst_HCAT721.methods.ownerOf(tokenIdMX).call();
  checkEq(tokenOwnerM, to);

  balanceM = await inst_HCAT721.methods.balanceOf(to).call();
  amountInitAB1 = parseInt(balanceM);
  console.log('after minting balanceM:', balanceM, 'amountInitAB1', amountInitAB1);

  console.log('\n-----------==Switching to showAccountAssetBooks()...');
  await showAccountAssetBooks();
  console.log('mintTokens() has been completed');
  process.exit(0);
}

/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
// 32 

const transferTokens = async (assetbookNum, amount) => {
  //-------------------------==Send tokens:
  console.log('\n------------==Send tokens: amount =' + amount, 'from AssetBook' + assetbookNum);
  let instAssetBookFrom, instAssetBookTo;
  if (assetbookNum < 1) {
    console.log('assetbookNum value should be >= 1. assetbookNum = ', assetbookNum);
    process.exit(1);
  } else if (amount < 1) {
    console.log('amount value should be >= 1. amount = ', amount);
    process.exit(1);
  }

  console.log('adminpk use Buffer.from');
  AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
  AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');

  console.log('assetbookNum', assetbookNum);
  if (assetbookNum === 1) {
    _from = addrAssetBook1; to = addrAssetBook2; price = 21000;
    _fromAssetOwner = AssetOwner1;

    provider = new PrivateKeyProvider(AssetOwner1pk, nodeUrl);//adminpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, _from);
    instAssetBookTo = new web3.eth.Contract(AssetBook.abi, to);
    privateKey = AssetOwner1pk;

  } else if (assetbookNum === 2) {
    _from = addrAssetBook2; to = addrAssetBook1; price = 21000;
    _fromAssetOwner = AssetOwner2;

    provider = new PrivateKeyProvider(AssetOwner2pk, nodeUrl);//adminpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, addrAssetBook2);
    instAssetBookTo = new web3.eth.Contract(AssetBook.abi, addrAssetBook1);
    privateKey = AssetOwner2pk;

  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }

  instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
  //inst_HCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);

  let assetbookFromM = await instAssetBookFrom.methods.getAsset(addrHCAT721).call();
  console.log('\n--------==assetbookFromM:', assetbookFromM);
  const amountInitABFrom = parseInt(assetbookFromM[1]);
  checkEq(amountInitABFrom > 0, true);

  let assetbookToM = await instAssetBookTo.methods.getAsset(addrHCAT721).call();
  console.log('\n--------==assetbookToM:', assetbookToM);
  const amountInitABTo = parseInt(assetbookToM[1]);

  isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();

  checkEq(isTokenApprovedOperational, true);
  console.log('isTokenApprovedOperational is true => ready to send tokens');
  console.log('amountInitABFrom', amountInitABFrom, 'amountInitABTo', amountInitABTo, 'txnNum', txnNum);

  console.log('\nsending tokens via transferAssetBatch()...');

  console.log('AssetBook' + assetbookNum + ' sending tokens via safeTransferFromBatch()...');
  await instAssetBookFrom.methods.safeTransferFromBatch(addrHCAT721, amount, to, price).send({ value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
      console.log('error:', error.toString());
    });

  console.log('safeTransferFromBatch is completed. From account:', amountInitABFrom, 'minus', amount, ', to account: ', amountInitABTo, 'add', amount);

  console.log('\nCheck AssetBookFrom after txn...');
  showAccountAssetBooks();
  process.exit(0);
}



const sendAssetBeforeAllowed = async () => {
  //----------------==Send tokens before allowed time
  console.log('\n------------==Send tokens before allowed time');

  await instTokenController.methods.setTimeCurrent(timeCurrent)
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
    console.log('[Success] sending 1 token from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);//assert(err);
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
  let encodedData = instTestCtrt.methods.setHCAT721SerialNumberNG(newNum).encodeABI();
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


const showMenu = () => {
  console.log('\n');
  console.log("\x1b[32m", '$ yarn run testlive1 --chain C --func F --arg1 arg1 --arg2 arg2');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: getTokenController, 2: showAccountAssetBooks, 3: mintTokens(assetbookNum, amount), 4: showAssetInfo(tokenId), 5: sendAssetBeforeAllowed(), 6: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount)');
  console.log("\x1b[32m", 'arg1, arg2, ... are arguments used in above functions ...');
}

const arraysSortedEqual = (array1, array2) => {
  if (array1 === array2) return true;
  if (array1 == null || array2 == null) return false;
  if (array1.length != array2.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  let array1out = array1.sort((a, b) => a - b); // For ascending sort
  let array2out = array2.sort((a, b) => a - b); // For ascending sort
  //numArray.sort((array1, array2) => array2 - array1); // For descending sort

  for (let i = 0; i < array1out.length; ++i) {
    if (array1out[i] !== array2out[i]) return false;
  }
  return true;
}
//-------------------------------==
/*
2: showAccountAssetBooks
yarn run livechain -c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain -c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amount)
yarn run livechain -c 1 --f 4 -a assetbookNum, -b amount
yarn run livechain -c 1 --f 4 -a 2 -b 130

5: mintTokenFn1
yarn run livechain -c 1 --f 5 -a 1 -b 3
*/
if (func === 0) {
  setupTest();

} else if (func === 1) {
  getTokenController();

} else if (func === 2) {
  showAccountAssetBooks();

} else if (func === 3) {
  showAssetInfo(arg1);

} else if (func === 4) {
  mintTokens(arg1, arg2);

} else if (func === 5) {
  mintTokenFn1();

} else if (func === 6) {
  sendAssetBeforeAllowed();

} else if (func === 7) {
  setServerTime(arg1);

} else if (func === 8) {
  transferTokens(arg1, arg2);

} else if (func === 31) {
  testCtrt();

} else if (func === 36) {
  addAssetBookAPI();

} else if (func === 37) {
  sequentialMintSuperAPI();

} else if (func === 38) {
  sequentialMintSuperNoMintAPI();

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
