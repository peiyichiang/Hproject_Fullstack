/**
$ yarn run livechain --c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 0: 

0: setupTest
yarn run livechain --c 1 --f 0

1: getSystemInfo
yarn run livechain --c 1 --f 1

2: showAccountnAssetBooks
yarn run livechain --c 1 --f 2

3: showAssetInfo(tokenId)
yarn run livechain --c 1 --f 3 -a tokenId

4: mintTokens(assetbookNum, amountToMint)
yarn run livechain --c 1 --f 4 -a assetbookNum, -b amountToMint

8: sendAssetBeforeAllowed(),
yarn run livechain --c 1 --f 8

9: setServerTime(newServerTime)
yarn run livechain --c 1 --f 9 -a serverTime

10: transferTokens(assetbookNum, amount)
yarn run livechain --c 1 --f 10 -a 2 -b 1
*/
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");

let provider, web3, gasLimitValue, gasPriceValue, prefix = '', chain, func, arg1, arg2, argbool;

console.log('process.argv', process.argv);
const arguLen = process.argv.length;
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run livechain --c C --f F -a A -b b');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: getSystemInfo, 2: showAccountnAssetBooks, 3: showAssetInfo(tokenId), 4: mintTokens(assetbookNum, amountToMint), 8: sendAssetBeforeAllowed(), 9: setServerTime(newServerTime), 9: transferTokens(assetbookNum, amount)');
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
  if (chain < 0){
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

const timeInitial = 201903081040;
let timeCurrent = timeInitial, txnNum = 2, Bufferfrom = true, isShowCompiledCtrt = false; 
console.log('chain = ', chain, ', txnNum =', txnNum, ', Bufferfrom =', Bufferfrom, ', timeCurrent =', timeCurrent);

let Backend, AssetOwner1, AssetOwner2, acc3, acc4;
let BackendpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, acc3pkRaw, acc4pkRaw;
let Backendpk, AssetOwner1pk, AssetOwner2pk, acc3pk, acc4pk;
let addrPlatform, addrMultiSig1, addrMultiSig2, addrAssetBook1, addrAssetBook2, addrRegistry, addrTokenController, addrERC721SPLC, addrCrowdFunding;
let amount, _to, _from, tokenIds, tokenIdMX, nodeUrl;
const uriBase = "nccu0".trim();

//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain
  console.log('inside chain === 1');

  let scenario = 1;//1: new accounts, 2: POA node accounts
  if (scenario===1) {
    console.log('scenario = ', scenario);
    addrPlatform = "0x83Bc6D371C67EE0Bae73B0Af65219D56862FfcBC";
    addrMultiSig1 = "0x2Ce700F9CAD3F282588e9E9F036E63a67b666094";
    addrMultiSig2 = "0x4F6652c9a0A4a52b9d9c98801fA7aE9E2Dd7503F";
    addrAssetBook1 = "0x480Bf7d6fF9d9440d9960fB92424e641F14f90A6";
    addrAssetBook2 = "0x7b25D658702c8c15e5b97AF2fbfFdEf5c9882A7d";
    addrRegistry =   "0xCec672c1E3A042802449565b8fbeec5133998161";
    addrTokenController = "0xAFf9aEF820d17Bf3069cD647ec8e214f60927c9b";
    addrERC721SPLC = "0x38c8edC86B316DD8E8Ee04391B87345b904ea992";
    addrCrowdFunding = "0xf516b84A9b8bf8ABC2b7Ff6bC111544C38608739";

    Backend = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
    BackendpkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";
    AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
    AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
    AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
    acc3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
    acc3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
    acc4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
    acc4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";

  } else if (scenario === 2) {
    console.log('scenario = ', scenario);
    Backend = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    BackendpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
    //Backend = "0xe19082253bF60037EA79d2F530585629dB23A5c5";
    //BackendpkRaw = "0xdb7ec98d7453d3eebe01119c843e56159433a388362374a3b996b930ea182960";
    AssetOwner1 = "0xc808643EaafF6bfeAC44A809003B6Db816Bf9c5b";
    AssetOwner1pkRaw = "0xd05a673b9efe63079cd7fd35478f279233287294730a990a32fc29c699ec21de";
    AssetOwner2 = "0x669Bc3d51f4920baef0B78899e98150Dcd013B50";
    AssetOwner2pkRaw = "0x648dbeca98e7d88515596fa6d9793bf8852107f0b8fbaebb0a1f5f73dc39e9f0";
    acc3 = "0x4fF6a6E7E052aa3f046050028842d2D7704C7fB9";
    acc3pkRaw = "0xccaf612eab2e083aace09bf3b701a152d82c62f91462eee6edc581bcfe79e2f7";
    acc4 = "0xF0F7C2Bbfb931a9CD1788E9540e51B70014ad643";
    acc4pkRaw = "0x6e1d4a3eab8a8fab0e4c43c4ada1c644feda497b5aceeb487ec3b3bab493c5ce";
  }

  gasLimitValue = '9000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
  console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

  //Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send

  nodeUrl = "http://140.119.101.130:8545";
  prefix = '0x';
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
let _assetAddr = addrERC721SPLC, assetbook1M, assetbook2M;

require('events').EventEmitter.defaultMaxListeners = 30;
//require('events').EventEmitter.prototype._maxListeners = 20;
/* emitter.setMaxListeners();
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
*/

//--------------------==
console.log('Load contract json file compiled from sol file');
//const { interface, bytecode } = require('../compile');//dot dot for one level up

const Platform = require('./build/Platform.json');
if (Platform === undefined){
  console.log('[Error] Platform is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Platform is defined');
  if (Platform.abi === undefined){
    console.log('[Error] Platform.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Platform.abi is defined');
      //console.log('Platform.abi:', Platform.abi);
  }
  if (Platform.bytecode === undefined || Platform.bytecode.length < 10){
    console.log('[Error] Platform.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Platform.bytecode is defined');
      //console.log('Platform.bytecode:', Platform.bytecode);
  }
  //console.log(Platform);
}

const MultiSig = require('./build/MultiSig.json');
if (MultiSig === undefined){
  console.log('[Error] MultiSig is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] MultiSig is defined');
  if (MultiSig.abi === undefined){
    console.log('[Error] MultiSig.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] MultiSig.abi is defined');
      //console.log('MultiSig.abi:', MultiSig.abi);
  }
  if (MultiSig.bytecode === undefined || MultiSig.bytecode.length < 10){
    console.log('[Error] MultiSig.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] MultiSig.bytecode is defined');
      //console.log('MultiSig.bytecode:', MultiSig.bytecode);
  }
  //console.log(MultiSig);
}

const AssetBook = require('./build/AssetBook.json');
if (AssetBook === undefined){
  console.log('[Error] AssetBook is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] AssetBook is defined');
  if (AssetBook.abi === undefined){
    console.log('[Error] AssetBook.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] AssetBook.abi is defined');
      //console.log('AssetBook.abi:', AssetBook.abi);
  }
  if (AssetBook.bytecode === undefined || AssetBook.bytecode.length < 10){
    console.log('[Error] AssetBook.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] AssetBook.bytecode is defined');
      //console.log('AssetBook.bytecode:', AssetBook.bytecode);
  }
  //console.log(AssetBook);
}


const Registry = require('./build/Registry.json');
if (Registry === undefined){
  console.log('[Error] Registry is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Registry is defined');
  if (Registry.abi === undefined){
    console.log('[Error] Registry.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Registry.abi is defined');
      //console.log('Registry.abi:', Registry.abi);
  }
  if (Registry.bytecode === undefined || Registry.bytecode.length < 10){
    console.log('[Error] Registry.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] Registry.bytecode is defined');
      //console.log('Registry.bytecode:', Registry.bytecode);
  }
  //console.log(Registry);
}

const TokenController = require('./build/TokenController.json');
if (TokenController === undefined){
  console.log('[Error] TokenController is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] TokenController is defined');
  if (TokenController.abi === undefined){
    console.log('[Error] TokenController.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] TokenController.abi is defined');
      //console.log('TokenController.abi:', TokenController.abi);
  }
  if (TokenController.bytecode === undefined || TokenController.bytecode.length < 10){
    console.log('[Error] TokenController.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] TokenController.bytecode is defined');
      //console.log('TokenController.bytecode:', TokenController.bytecode);
  }
  //console.log(TokenController);
}

const ERC721SPLC = require('./build/ERC721SPLC_HToken.json');
if (ERC721SPLC === undefined){
  console.log('[Error] ERC721SPLC is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ERC721SPLC is defined');
  if (ERC721SPLC.abi === undefined){
    console.log('[Error] ERC721SPLC.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ERC721SPLC.abi is defined');
      //console.log('ERC721SPLC.abi:', ERC721SPLC.abi);
  }
  if (ERC721SPLC.bytecode === undefined || ERC721SPLC.bytecode.length < 10){
    console.log('[Error] ERC721SPLC.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ERC721SPLC.bytecode is defined');
      //console.log('ERC721SPLC.bytecode:', ERC721SPLC.bytecode);
  }
  //console.log(ERC721SPLC);
}

const CrowdFunding = require('./build/CrowdFunding.json');
if (CrowdFunding === undefined){
  console.log('[Error] CrowdFunding is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] CrowdFunding is defined');
  if (CrowdFunding.abi === undefined){
    console.log('[Error] CrowdFunding.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] CrowdFunding.abi is defined');
      //console.log('CrowdFunding.abi:', CrowdFunding.abi);
  }
  if (CrowdFunding.bytecode === undefined || CrowdFunding.bytecode.length < 10){
    console.log('[Error] CrowdFunding.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] CrowdFunding.bytecode is defined');
      //console.log('CrowdFunding.bytecode:', CrowdFunding.bytecode);
  }
  //console.log(CrowdFunding);
}

const IncomeManagement = require('./build/IncomeManagement.json');
if (IncomeManagement === undefined){
  console.log('[Error] IncomeManagement is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] IncomeManagement is defined');
  if (IncomeManagement.abi === undefined){
    console.log('[Error] IncomeManagement.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] IncomeManagement.abi is defined');
      //console.log('IncomeManagement.abi:', IncomeManagement.abi);
  }
  if (IncomeManagement.bytecode === undefined || IncomeManagement.bytecode.length < 10){
    console.log('[Error] IncomeManagement.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] IncomeManagement.bytecode is defined');
      //console.log('IncomeManagement.bytecode:', IncomeManagement.bytecode);
  }
  //console.log(IncomeManagement);
}

const ProductManager = require('./build/ProductManager.json');
if (ProductManager === undefined){
  console.log('[Error] ProductManager is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ProductManager is defined');
  if (ProductManager.abi === undefined){
    console.log('[Error] ProductManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ProductManager.abi is defined');
      //console.log('ProductManager.abi:', ProductManager.abi);
  }
  if (ProductManager.bytecode === undefined || ProductManager.bytecode.length < 10){
    console.log('[Error] ProductManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    if (isShowCompiledCtrt) console.log('[Good] ProductManager.bytecode is defined');
      //console.log('ProductManager.bytecode:', ProductManager.bytecode);
  }
  //console.log(ProductManager);
}


console.log('\n---------------==Make contract instances from deployment');

console.log('more variables...');
let management;
let balanceM, balance0, balance1, balance2;
let platformCtAdmin;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

const TimeTokenLaunch = timeCurrent+3;
const TimeTokenUnlock = timeCurrent+4; 
const TimeTokenValid =  timeCurrent+9;

const nftName = "NCCU site No.1(2018)";
const nftSymbol = "NCCU1801";
const siteSizeInKW = 300;
const maxTotalSupply = 773;
const initialAssetPricing = 17000;
const pricingCurrency = "NTD";
const IRR20yrx100 = 470;
const tokenURI = nftSymbol+"/uri";

const _tokenSymbol = nftSymbol;
const _tokenPrice = initialAssetPricing;
const _currency = pricingCurrency;
const _quantityMax = maxTotalSupply;
const _goalInPercentage = 97;
const _CFSD2 = timeCurrent+1;
const _CFED2 = timeCurrent+10;
let _serverTime = timeCurrent;

const TimeAnchor = TimeTokenLaunch;
let addrPA_Ctrt, addrFMXA_Ctrt, addrPlatformCtrt;
let uid1, uid2, extoAddr1, extoAddr2;

let tokenId, uriStr, uriBytes32, uriStrB, tokenOwner, tokenOwnerM;
let tokenControllerDetail; let timeCurrentM;
let TimeTokenLaunchM; let TimeTokenUnlockM; let TimeTokenValidM; let isLaunchedM;
let isUnlockedValid; let bool2;

/**
$ yarn run livechain --c C --f F --arg1 arg1
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 0: setupTest, 1: getSystemInfo, 2: showAccountnAssetBooks, 4: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount), 9: updateAssetBook(assetbookNum)
arg1, arg2, ... are arguments used in above functions ...
*/

//F = 1: getSystemInfo
const getSystemInfo = async () => {
  if (Bufferfrom){
    console.log('Backendpk use Buffer.from');
    Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');
  } 
  provider = new PrivateKeyProvider(Backendpk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
  web3 = new Web3(provider);
  //const instPlatform = new web3.eth.Contract(Platform.abi, addrPlatform);
  //const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
  const instMultiSig1 = new web3.eth.Contract(MultiSig.abi, addrMultiSig1);
  const instMultiSig2 = new web3.eth.Contract(MultiSig.abi, addrMultiSig2);

  const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
  const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);
  console.log('addrTokenController', addrTokenController);
  isUnlockedValid = await instTokenController.methods.isUnlockedValid().call(); 
  tokenIdM = await instERC721SPLC.methods.tokenId().call();
  console.log('isUnlockedValid() =', isUnlockedValid);
  console.log('tokenId or tokenCount from assetCtrt', tokenIdM);

  console.log('\n------------==Check MultiSig contract 1 & 2');
  console.log('addrMultiSig1', addrMultiSig1);
  console.log('addrMultiSig2', addrMultiSig2);
  let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
  console.log('assetOwnerM1', assetOwnerM1);
  checkEq(assetOwnerM1, AssetOwner1);
  let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
  console.log('assetOwnerM2', assetOwnerM2);
  checkEq(assetOwnerM2, AssetOwner2);

  //-----------------==Check Token Controller: time
  console.log('\n------------==Check TokenController parameters: time');
  console.log('addrTokenController', addrTokenController);
  let owner = await instTokenController.methods.owner().call();
  let chairman = await instTokenController.methods.chairman().call();
  let director = await instTokenController.methods.director().call();
  let manager = await instTokenController.methods.manager().call();
  let admin = await instTokenController.methods.admin().call();

  checkEq(owner, acc4);
  checkEq(chairman, acc3);
  checkEq(director, AssetOwner2);
  checkEq(manager, AssetOwner1);
  checkEq(admin, Backend);

  // owner = management[4];
  // chairman = management[3];
  // director = management[2];
  // manager = management[1];
  // admin = management[0];

  tokenControllerDetail = await instTokenController.methods.getHTokenControllerDetails().call(); 
  timeCurrentM = tokenControllerDetail[0];
  TimeTokenLaunchM = tokenControllerDetail[1];
  TimeTokenUnlockM = tokenControllerDetail[2];
  TimeTokenValidM = tokenControllerDetail[3];
  isLaunchedM = tokenControllerDetail[4];
  console.log('timeCurrent', timeCurrentM, ', TimeTokenLaunch', TimeTokenLaunchM, ', TimeTokenUnlock', TimeTokenUnlockM, ', TimeTokenValid', TimeTokenValidM, ', isLaunched', isLaunchedM);

  isUnlockedValid = await instTokenController.methods.isUnlockedValid().call(); 
  // if (!isUnlockedValid) {
  //   console.log('Setting timeCurrent to TimeTokenUnlock+1 ...');
  //   timeCurrent = TimeTokenUnlock+1;
  //   await instTokenController.methods.setTimeCurrent(timeCurrent)
  //   .send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
  //   isUnlockedValid = await instTokenController.methods.isUnlockedValid().call(); 
  // }
  console.log('isUnlockedValid()', isUnlockedValid);
}

const setupTest = async () => {
  //web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  //Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
  console.log('\n--------------==setupTest');
  if (Bufferfrom){
    console.log('Backendpk use Buffer.from');
    Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');
  } 

  provider = new PrivateKeyProvider(Backendpk, nodeUrl);
  web3 = new Web3(provider);
  
  //provider = new PrivateKeyProvider(Backendpk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
  //const addr1 = web3.utils.toChecksumAddress(addrPlatform);
  const instPlatform = new web3.eth.Contract(Platform.abi, addrPlatform);
  const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
  const instMultiSig1 = new web3.eth.Contract(MultiSig.abi,addrMultiSig1);
  const instMultiSig2 = new web3.eth.Contract(MultiSig.abi,addrMultiSig2);
  const instAssetBook1 = new web3.eth.Contract(AssetBook.abi,addrAssetBook1);
  const instAssetBook2 = new web3.eth.Contract(AssetBook.abi,addrAssetBook2);
  const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
  const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);
  // const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addrCrowdFunding);
  // const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManagement);
  // const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);
  
  //instMultiSig1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!

  console.log('\n--------==Start tests...');
  management = [Backend, AssetOwner1, AssetOwner2, acc3, acc4];
  console.log('Backend', Backend);
  console.log('AssetOwner1', AssetOwner1);
  console.log('AssetOwner2', AssetOwner2);
  console.log('acc3', acc3);
  console.log('acc4', acc4);
  console.log('management', management);

  if (2===1) {
      balance0 = await web3.eth.getBalance(Backend);//returns strings!
      balance1 = await web3.eth.getBalance(AssetOwner1);//returns strings!
      balance2 = await web3.eth.getBalance(AssetOwner2);//returns strings!
      console.log('Backend',  Backend, balance0);//100,00000000,0000000000
      console.log('AssetOwner1',  AssetOwner1, balance1);
      console.log('AssetOwner2',  AssetOwner2, balance2);
  }


  console.log('Deployment Check: Good');

  //----------------==Check MultiSig & AssetBook contracts
  console.log('\n------------==Check MultiSig contract 1 & 2');
  console.log('addrMultiSig1', addrMultiSig1);
  console.log('addrMultiSig2', addrMultiSig2);
  let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
    //{ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
  console.log('assetOwnerM1', assetOwnerM1);
  checkEq(assetOwnerM1, AssetOwner1);
  let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
  checkEq(assetOwnerM2, AssetOwner2);

  console.log('\nCheck getPlatformContractAddr()');
  let platformM1 = await instMultiSig1.methods.getPlatformContractAddr().call();
  checkEq(platformM1, addrPlatform);
  let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
  checkEq(platformM2, addrPlatform);

  console.log('\n------------==Check AssetBook contract 1 & 2');
  console.log('addrAssetBook1', addrAssetBook1);
  console.log('addrAssetBook2', addrAssetBook2);

  assetbook1M = await instAssetBook1.methods.getAsset(_assetAddr).call();
  console.log('assetbook1M:', assetbook1M);
  const amountInitAB1 = parseInt(assetbook1M[2]);

  assetbook2M = await instAssetBook2.methods.getAsset(_assetAddr).call();
  console.log('assetbook2M:', assetbook2M);
  const amountInitAB2 = parseInt(assetbook2M[2]);

  // assetSymbol, _assetAddrIndex, 
  // assetAmount, timeIndexStart, 
  // timeIndexEnd, isInitialized);


  //----------------==Registry contract
  console.log('\n------------==Registry contract: add AssetBook contracts 1 & 2');
  let fromAddr, ctrtAddr, privateKey, encodedData;
  console.log('addrRegistry', addrRegistry);
  let user1M, user2M;

  let getUserCountM = await instRegistry.methods.getUserCount().call();
  console.log('getUserCountM', getUserCountM);

  uid1 = "A500000001"; assetCtAddr = addrAssetBook1; extoAddr = AssetOwner1;
  console.log('uid1', uid1, 'assetCtAddr', assetCtAddr, 'extoAddr', extoAddr, 'timeCurrent', timeCurrent);
  let uid1HasBeenAdded = true;
  if (uid1HasBeenAdded) {
    user1M = await instRegistry.methods.getUser(uid1).call();
    console.log('user1M', user1M);
    checkEq(user1M[0], uid1);
    checkEq(user1M[1], assetCtAddr);
    checkEq(user1M[2], extoAddr);
    checkEq(user1M[3], '0');
  } else {
    fromAddr = Backend, ctrtAddr = addrRegistry;
    privateKey = Backendpk;
    if (txnNum===1) {
      encodedData = instRegistry.methods.addUser(uid1, assetCtAddr, extoAddr, timeCurrent).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);
    } else {
      console.log('txnNum', txnNum);
      await instRegistry.methods.addUser(
        uid1, assetCtAddr, extoAddr, timeCurrent)
      .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    }
    console.log('\nafter addUser() on AssetOwner1:');
    user1M = await instRegistry.methods.getUser(uid1).call();
    console.log('user1M', user1M);
    checkEq(user1M[0], uid1);
    checkEq(user1M[1], assetCtAddr);
    checkEq(user1M[2], extoAddr);
    checkEq(user1M[3], '0');
  }

  uid2 = "A500000002"; assetCtAddr = addrAssetBook2; extoAddr = AssetOwner2;
  let uid2HasBeenAdded = true;
  if (uid2HasBeenAdded) {
    console.log('\nafter addUser() on AssetOwner2:');
    user2M = await instRegistry.methods.getUser(uid2).call();
    checkEq(user2M[0], uid2);
    checkEq(user2M[1], assetCtAddr);
    checkEq(user2M[2], extoAddr);
    checkEq(user2M[3], '0');
    console.log('user2M', user2M);
  } else {
    fromAddr = Backend, ctrtAddr = addrRegistry;
    privateKey = Backendpk;
    if (txnNum===1) {
      encodedData = instRegistry.methods.addUser(uid2, assetCtAddr, extoAddr, timeCurrent).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);
    } else {
      await instRegistry.methods.addUser(
        uid2, assetCtAddr, extoAddr, timeCurrent)
      .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    }
  }



  //----------------==
  console.log('\n------------==Check ERC721SPLC parameters');
  console.log('addrERC721SPLC', addrERC721SPLC);

  let nftNameM = await instERC721SPLC.methods.nftName().call();
  let nftsymbolM = await instERC721SPLC.methods.nftSymbol().call();
  let initialAssetPricingM = await instERC721SPLC.methods.initialAssetPricing().call();
  let IRR20yrx100M = await instERC721SPLC.methods.IRR20yrx100().call();
  let maxTotalSupplyM = await instERC721SPLC.methods.maxTotalSupply().call();
  let pricingCurrencyM = await instERC721SPLC.methods.pricingCurrency().call();
  let siteSizeInKWM = await instERC721SPLC.methods.siteSizeInKW().call();
  let tokenURI_M = await instERC721SPLC.methods.tokenURI().call();

  tokenIdM = await instERC721SPLC.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);
  
  checkEq(nftNameM, nftName);
  checkEq(nftsymbolM, nftSymbol);
  checkEq(initialAssetPricingM, ''+initialAssetPricing);
  checkEq(IRR20yrx100M, ''+IRR20yrx100);
  checkEq(maxTotalSupplyM, ''+maxTotalSupply);
  checkEq(pricingCurrencyM, ''+pricingCurrency);
  checkEq(siteSizeInKWM, ''+siteSizeInKW);
  checkEq(tokenIdMX, 0);
  console.log('tokenURI', tokenURI, 'tokenURI_M', web3.utils.toAscii(tokenURI_M));
  //checkEq(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

  const tokenIdMXInit = tokenIdMX;
  console.log("\x1b[33m", '\nConfirm tokenId = ', tokenIdM, 'tokenIdMXInit', tokenIdMXInit);

  console.log('\n-----Set time at TokenController');
  timeCurrent = timeInitial;
  await instTokenController.methods.setTimeCurrent(timeCurrent)
  .send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });

  let isUnlockedValid = await instTokenController.methods.isUnlockedValid().call();
  checkEq(isUnlockedValid, false);


  let supportsInterface0x80ac58cd = await instERC721SPLC.methods.supportsInterface("0x80ac58cd").call();
  checkEq(supportsInterface0x80ac58cd, true);
  let supportsInterface0x5b5e139f = await instERC721SPLC.methods.supportsInterface("0x5b5e139f").call();
  checkEq(supportsInterface0x5b5e139f, true);
  let supportsInterface0x780e9d63 = await instERC721SPLC.methods.supportsInterface("0x780e9d63").call();
  checkEq(supportsInterface0x780e9d63, true);

};


const mintTokens = async (assetbookNum, amountToMint) => {
  console.log('-------------==mintTokens ... Mint Token Batch');
  console.log('assetbookNum', assetbookNum, 'amountToMint', amountToMint);

  if (assetbookNum < 1 || assetbookNum > 2){
    console.log('assetbookNum value should be >= 1 and <= 2. assetbookNum = ', assetbookNum);
    process.exit(1);
  } else if (amountToMint < 1) {
    console.log('amountToMint value should be >= 1. amountToMint = ', assetbookNum);
    process.exit(1);
  } else {
    console.log('assetbookNum = ', assetbookNum);
  }

  if (Bufferfrom){
    console.log('Backendpk use Buffer.from');
    Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');
  }

  provider = new PrivateKeyProvider(Backendpk, nodeUrl);
  web3 = new Web3(provider);
  //addrPlatform  addrRegistry  addrMultiSig1 addrAssetBook1  addrTokenController  addrERC721SPLC
  const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);

  tokenIdM = await instERC721SPLC.methods.tokenId().call();
  tokenIdMX = parseInt(tokenIdM);
  console.log('\ncurrent tokenId = ', tokenIdMX);
  //checkEq(tokenIdM, tokenIdMX.toString());

  if (assetbookNum === 1){
    _to = addrAssetBook1;
    instAssetBookX = new web3.eth.Contract(AssetBook.abi,_to);
  } else if (assetbookNum === 2){
    _to = addrAssetBook2;
    instAssetBookX = new web3.eth.Contract(AssetBook.abi,_to);
  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }

  console.log('\n------------==Mint Token in Batch: tokenId =', tokenIdMX+1, 'to ', tokenIdMX+amountToMint, ' to AssetBook'+assetbookNum);

  balanceM = await instERC721SPLC.methods.balanceOf(_to).call();
  const amountInitAB1 = parseInt(balanceM);
  console.log('balanceM:', balanceM, 'amountInitAB1', amountInitAB1);

  console.log('before mintSerialNFT()');
  await instERC721SPLC.methods.mintSerialNFT(_to, amountToMint).send({
    value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });


  tokenIdMX += amountToMint;
  tokenIdM = await instERC721SPLC.methods.tokenId().call();
  checkEq(tokenIdM, tokenIdMX.toString());

  tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdMX-2).call();
  checkEq(tokenOwnerM, _to);
  tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdMX-1).call();
  checkEq(tokenOwnerM, _to);
  tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdMX).call();
  checkEq(tokenOwnerM, _to);

  console.log('\ncheck getToken(): Id = ', tokenIdMX-2, tokenIdMX-1, tokenIdMX);
  tokenInfo = await instERC721SPLC.methods.getToken(tokenIdMX-2).call();
  console.log('\ntokenInfo from ERC721SPLC id = :', tokenIdMX-2, tokenInfo);
  checkEq(tokenInfo[0], _to);
  checkEq(tokenInfo[1], initialAssetPricing.toString());

  tokenInfo = await instERC721SPLC.methods.getToken(tokenIdMX-1).call();
  checkEq(tokenInfo[0], _to);
  checkEq(tokenInfo[1], initialAssetPricing.toString());

  tokenInfo = await instERC721SPLC.methods.getToken(tokenIdMX).call();
  checkEq(tokenInfo[0], _to);
  checkEq(tokenInfo[1], initialAssetPricing.toString());

  console.log('\n-----------==Switching to showAccountnAssetBooks()...');
  showAccountnAssetBooks();
  console.log('mintTokens() has completed');
}

const showAssetInfo = async (_tokenId) => {
  console.log('\n--------==showAssetInfo from ERC721SPLC...');
  console.log('Backendpk use Buffer.from');
  Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(Backendpk, nodeUrl);
  web3 = new Web3(provider);
  const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);

  tokenInfo = await instERC721SPLC.methods.getToken(_tokenId).call();
  console.log('_tokenId', _tokenId, 'tokenInfo', tokenInfo);
  console.log('addrAssetBook1', addrAssetBook1);
  console.log('addrAssetBook2', addrAssetBook2);
}


const showAccountnAssetBooks = async () => {
  console.log('\n--------==AssetOwner1: AssetBook and ERC721SPLC...');
  if (Bufferfrom){
    console.log('Backendpk use Buffer.from');
    Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');
  } 
  provider = new PrivateKeyProvider(Backendpk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
  web3 = new Web3(provider);
  const instAssetBook1 = new web3.eth.Contract(AssetBook.abi,addrAssetBook1);
  const instAssetBook2 = new web3.eth.Contract(AssetBook.abi,addrAssetBook2);
  const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);

  tokenIds = await instERC721SPLC.methods.getAccountIdsAll(addrAssetBook1).call();
  balanceXM = await instERC721SPLC.methods.balanceOf(addrAssetBook1).call();
  console.log('\ntokenIds from ERC721SPLC =', tokenIds, ', balanceXM =', balanceXM);
  accountM = await instERC721SPLC.methods.getAccount(addrAssetBook1).call();
  console.log('SPLC getAccount():', accountM);
  assetbookXM = await instAssetBook1.methods.getAsset(_assetAddr).call();
  console.log('AssetBook1:', assetbookXM);
  //const isTokenIdsCorrect1 = arraysSortedEqual(assetbook[7], assetbook[8]);

  
  console.log('\n--------==AssetOwner2: AssetBook and ERC721SPLC...');
  tokenIds = await instERC721SPLC.methods.getAccountIdsAll(addrAssetBook2).call();
  balanceXM = await instERC721SPLC.methods.balanceOf(addrAssetBook2).call();
  console.log('tokenIds from ERC721SPLC =', tokenIds, ', balanceXM =', balanceXM);
  accountM = await instERC721SPLC.methods.getAccount(addrAssetBook2).call();
  console.log('SPLC getAccount():', accountM);
  assetbookXM = await instAssetBook2.methods.getAsset(_assetAddr).call();
  console.log('AssetBook2:', assetbookXM);
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


const transferTokens = async (assetbookNum, amount) => {
    //-------------------------==Send tokens:
    console.log('\n------------==Send tokens: amount ='+amount, 'from AssetBook'+assetbookNum);
    let instAssetBookFrom, instAssetBookTo;
    if (assetbookNum < 1){
      console.log('assetbookNum value should be >= 1. assetbookNum = ', assetbookNum);
      process.exit(1);
    } else if (amount < 1){
      console.log('amount value should be >= 1. amount = ', amount);
      process.exit(1);
    }

    console.log('Backendpk use Buffer.from');
    AssetOwner1pk = Buffer.from(AssetOwner1pkRaw.substr(2), 'hex');
    AssetOwner2pk = Buffer.from(AssetOwner2pkRaw.substr(2), 'hex');

    console.log('assetbookNum', assetbookNum);
    if (assetbookNum === 1){
      _from = addrAssetBook1; _to = addrAssetBook2; price = 21000;
      _fromAssetOwner = AssetOwner1;
      
      provider = new PrivateKeyProvider(AssetOwner1pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
      web3 = new Web3(provider);
      instAssetBookFrom = new web3.eth.Contract(AssetBook.abi,_from);
      instAssetBookTo = new web3.eth.Contract(AssetBook.abi,_to);
      privateKey = AssetOwner1pk; 

    } else if (assetbookNum === 2){
      _from = addrAssetBook2; _to = addrAssetBook1; price = 21000;
      _fromAssetOwner = AssetOwner2;

      provider = new PrivateKeyProvider(AssetOwner2pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
      web3 = new Web3(provider);
      instAssetBookFrom = new web3.eth.Contract(AssetBook.abi,addrAssetBook2);
      instAssetBookTo = new web3.eth.Contract(AssetBook.abi,addrAssetBook1);
      privateKey = AssetOwner2pk;

    } else {
      console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
      process.exit(1);
    }
    
    instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
    //instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);

    let assetbookFromM = await instAssetBookFrom.methods.getAsset(_assetAddr).call();
    console.log('\n--------==assetbookFromM:', assetbookFromM);
    const amountInitABFrom = parseInt(assetbookFromM[1]);
    checkEq(amountInitABFrom > 0, true);

    let assetbookToM = await instAssetBookTo.methods.getAsset(_assetAddr).call();
    console.log('\n--------==assetbookToM:', assetbookToM);
    const amountInitABTo = parseInt(assetbookToM[1]);

    isUnlockedValid = await instTokenController.methods.isUnlockedValid().call();

    checkEq(isUnlockedValid, true);
    console.log('isUnlockedValid is true => ready to send tokens');
    console.log('amountInitABFrom', amountInitABFrom, 'amountInitABTo', amountInitABTo, 'txnNum', txnNum);

    console.log('\nsending tokens via transferAssetBatch()...');

    console.log('AssetBook'+assetbookNum+' sending tokens via safeTransferFromBatch()...');
    await instAssetBookFrom.methods.safeTransferFromBatch(_assetAddr, amount, _to, price).send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('safeTransferFromBatch is finished. From account:', amountInitABFrom, 'minus', amount, ', to account: ', amountInitABTo, 'add', amount);

    console.log('\nCheck AssetBookFrom after txn...');
    showAccountnAssetBooks();
}


const setServerTime = async (timeX) => {
  console.log('\n------------==setServerTime=', timeX);
  Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(Backendpk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
  web3 = new Web3(provider);
  const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);

  await instTokenController.methods.setTimeCurrent(timeX)
  .send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });

  isUnlockedValid = await instTokenController.methods.isUnlockedValid().call(); 
  console.log('\nisUnlockedValid', isUnlockedValid);
}

const sendAssetBeforeAllowed = async () => {
  //----------------==Send tokens before allowed time
  console.log('\n------------==Send tokens before allowed time');
  Backendpk = Buffer.from(BackendpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(Backendpk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
  web3 = new Web3(provider);
  const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);

  await instTokenController.methods.setTimeCurrent(timeCurrent)
  .send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
  isUnlockedValid = await instTokenController.methods.isUnlockedValid().call();
  console.log('isUnlockedValid', isUnlockedValid);
  checkEq(isUnlockedValid, false);

  amount = 1;
  fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; _to = addrAssetBook1;
  let error = false;
  try {
    if (txnNum===1) {
      encodedData = instAssetBookFrom.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);
  
    } else {
      await instAssetBookFrom.methods.transferAssetBatch(_assetAddr, amount, _to)
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    }
  } catch (err) {
    console.log('[Success] sending 1 token from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);//assert(err);
  }
  if (error) {
    console.log("\x1b[31m", '[Error] Why did not this fail???', error);
    process.exit(1);
  }

}


const showMenu = () => {
  console.log('\n');
  console.log("\x1b[32m", '$ yarn run testlive1 --chain C --func F --arg1 arg1 --arg2 arg2');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", 'F = 0: setupTest,  1: getSystemInfo, 2: showAccountnAssetBooks, 3: mintTokens(assetbookNum), 4: sendAssetBeforeAllowed(), 5: setServerTime(newServerTime), 7: transferTokens(assetbookNum, amount), 9: updateAssetBook(assetbookNum), 99: resetAssetBook(assetbookNum);');
  console.log("\x1b[32m", 'arg1, arg2, ... are arguments used in above functions ...');
}
//-------------------------------==
if (func === 0) {
  setupTest();

} else if (func === 1) {
  getSystemInfo();

} else if (func === 2) {
  showAccountnAssetBooks();

} else if (func === 3) {
  showAssetInfo(arg1);

} else if (func === 4) {
  mintTokens(arg1, arg2);

} else if (func === 8) {
  sendAssetBeforeAllowed();

} else if (func === 9) {
  setServerTime(arg1);

} else if (func === 10) {
  transferTokens(arg1, arg2);

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
    console.log("\x1b[31m", '[Error] _'+ value1+'<vs>'+value2+'_', typeof value1, typeof value2);
    process.exit(1);
  }
}

const signTxn = (fromAddr, ctrtAddr, encodedData, privateKey) => {
web3.eth.getTransactionCount(fromAddr).then((count) => {
  console.log("Count: ", count);
  //var amount = web3.utils.toHex(1e16);
  var rawTransaction = {
    "from":fromAddr, 
    "gasPrice":web3.utils.toHex(20*1e9),
    "gasLimit":web3.utils.toHex(7000000),
    "to":ctrtAddr,
    "value":"0x0",
    "data":encodedData,
    "nonce":web3.utils.toHex(count)
  }
  /**
  value: web3.utils.toHex(web3.toBigNumber(web3.eth.getBalance(address))
  .minus(web3.toBigNumber(21000).times(20000000000)))
  */
  console.log(rawTransaction);

  var transaction = new Tx(rawTransaction);//make txn via ethereumjs-tx
  transaction.sign(privateKey);//sign transaction with private key

  //https://web3.readthedocs.io/en/1.0/web3-eth.html#eth-sendsignedtransaction
  web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
  .on('transactionHash',console.log)
  .on('receipt', console.log)
  .on('confirmation', function(confirmationNumber, receipt){
    console.log('confirmationNumber', confirmationNumber, 'receipt',receipt);
  })
  .on('error', console.error);
});
}
/*sign rawtx*/
function signTx(userEthAddr, userRowPrivateKey, contractAddr, encodedData) {
return new Promise((resolve, reject) => {

    web3.eth.getTransactionCount(userEthAddr)
        .then(nonce => {

            let userPrivateKey = Buffer.from(userRowPrivateKey.slice(2), 'hex');
            console.log(userPrivateKey);
            let txParams = {
                nonce: web3.utils.toHex(nonce),
                gas: 7000000,
                gasPrice: 0,
                //gasPrice: web3js.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(7000000),
                to: contractAddr,
                value: 0,
                data: encodedData
            }//gasLimitValue = '7000000'

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
/**
const updateAssetBook = async (assetbookNum) => {
  console.log('\n--------------==inside updateAssetBook');
  let instAssetBook;
  if (assetbookNum < 1){
    console.log('assetbookNum value should be >= 1. assetbookNum = ', assetbookNum);
    process.exit(1);
  }

  if (assetbookNum === 1){
    provider = new PrivateKeyProvider(AssetOwner1pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook1);
    fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1; _to = addrAssetBook2;

  } else if (assetbookNum === 2){
    provider = new PrivateKeyProvider(AssetOwner2pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook2);
    fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; _to = addrAssetBook1;

  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }

  console.log('AssetBookTo to receive tokens...');
  if (txnNum===1) {
    encodedData = instAssetBook.methods.updateReceivedAsset(_assetAddr).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

  } else {
    await instAssetBook.methods.updateReceivedAsset(_assetAddr) 
    .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  }

  assetbookM = await instAssetBook.methods.getAsset(_assetAddr).call();
  console.log('getAsset(assetbookM):', assetbookM);
  //checkEq(assetbookM[2], (amountInitABTo).toString());//amount
  //checkEq(AssetBookM[3], timeIndexStartInitTo.toString());//timeIndexStart
  //checkEq(AssetBookM[4], (timeIndexEndInitTo).toString());//timeIndexEnd
  console.log("\x1b[33m", 'CHECK amount increase, timeIndexEnd increase');

}

const resetAssetBook = async (assetbookNum) => {
  console.log('\n--------------==inside resetAssetBook');
  let instAssetBook;
  if (assetbookNum < 1){
    console.log('assetbookNum value should be >= 1. assetbookNum = ', assetbookNum);
    process.exit(1);
  }

  if (assetbookNum === 1){
    provider = new PrivateKeyProvider(AssetOwner1pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook1);
    fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1; _to = addrAssetBook2;

  } else if (assetbookNum === 2){
    provider = new PrivateKeyProvider(AssetOwner2pk, nodeUrl);//Backendpk, AssetOwner1pk, AssetOwner2pk
    web3 = new Web3(provider);
    instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook2);
    fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; _to = addrAssetBook1;

  } else {
    console.log('not valid assetbookNum... assetbookNum =', assetbookNum);
    process.exit(1);
  }

  console.log('AssetBookTo to receive tokens...');
  if (txnNum===1) {
    encodedData = instAssetBook.methods.updateAssetTokenDetails(_assetAddr).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

  } else {
    await instAssetBook.methods.updateAssetTokenDetails(_assetAddr) 
    .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  }

  assetbookM = await instAssetBook.methods.getAsset(_assetAddr).call();
  console.log('getAsset(assetbookM):', assetbookM);
} 
 */