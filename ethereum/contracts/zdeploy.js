/**
$ yarn run deploy
*/
const Web3 = require('web3');
const PrivateKeyProvider = require("truffle-privatekey-provider");

let provider, web3, gasLimitValue, gasPriceValue, prefix = '';
console.log('process.argv', process.argv);
if (process.argv.length < 6) {
  console.log('not enough arguments. Make it like: yarn run deploy --chain 1 --ctrtName contractName');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log('ctrtName = platform, multisig, assetbook, registry, erc721splc, crowdfunding');
  process.exit(1);
}
const chain = parseInt(process.argv[3]);//0;
const ctrtName = process.argv[5];//'assetbook';
let timeCurrent = 201903081040;
console.log('chain = ', chain, ', ctrtName =', ctrtName, ', timeCurrent =', timeCurrent);

let Backend, AssetOwner1, AssetOwner2, acc3, acc4;
let BackendpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw;
let addrPlatform, addrMultiSig1, addrMultiSig2, addrRegistry, addrTokenController;
let addrERC721SPLC, addrAssetBook1, addrAssetBook2, addrIncomeManagement, addrProductManager;

//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain
  /**https://iancoleman.io/bip39
m/44'/60'/0'/0/0 	0xa6cc621A179f01A719ee57dB4637A4A1f603A442 	0x02afa51468bfb825ddfa794b360f42c016da3dba10df065a11650b63799befed45 	0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a

m/44'/60'/0'/0/1 	0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2 	0x025e0eaf152f741fc91f437d0b6dfdaf96c076ad98010a0d60ba0490c05a46bbdd 	0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca

m/44'/60'/0'/0/2 	0x470Dea51542017db8D352b8B36B798a4B6d92c2E 	0x0384a124835b166c5b3fceec66c861959843eeccb92e18de938be272328692d33f 	0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2

m/44'/60'/0'/0/3 	0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61 	0x034d315e0adb4a832b692b51478feb1b81e761b9834aaf35f83cd23c43239027ed 	0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45

m/44'/60'/0'/0/4 	0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E 	0x0231900ed8b38e4c23ede6c151bf794418da573c9f63a1235d8823ab229ed251e3 	0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f
   */
  Backend = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
  BackendpkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";
  AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
  AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
  AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
  AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
  acc3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
  acc4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";

  /** deployed contracts
   * 'ctrtName = platform, multisig, assetbook, registry, tokencontroller, erc721splc, crowdfunding'
   */
  addrPlatform = "0x2F706dd9955FfE3A0655846b9f5058D16A9B5Fa5";
  addrMultiSig1 = "0xb5C37059C85c5F5d59755226B9fa08bec3B2B47c";
  addrMultiSig2 = "0xf6B7d36EBdeb036b308d30b93C4F34a6902f5828";
  addrAssetBook1 = "0x3614d6068aC16b7Cc4eb34b70c7a9BB6fb9e9B43";
  addrAssetBook2 = "0x9CEEb4137F0FeDF180afeaDD2A49Bcc555e03EeF";
  addrRegistry = "0x7b376c71A04Bc487F3Cf2B5938DdDAe8EdB33bb3";
  addrTokenController = "0xd1b8609793DC685e25c34343c37F547c457145eb";
  addrERC721SPLC = "0xACEf03ac42CE601CF8921ccBEcE7f12A80Df5778";
  //addrIncomeManagement = "";
  //addrProductManager = "";  

  // let backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
  // let backendRawPrivateKey = '0x'+backendPrivateKey;

  // Backend = "0xe19082253bF60037EA79d2F530585629dB23A5c5";
  // AssetOwner1 = "0xc808643EaafF6bfeAC44A809003B6Db816Bf9c5b";
  // AssetOwner2 = "0x669Bc3d51f4920baef0B78899e98150Dcd013B50";
  // acc3 = "0x4fF6a6E7E052aa3f046050028842d2D7704C7fB9";
  // acc4 = "0xF0F7C2Bbfb931a9CD1788E9540e51B70014ad643";

  gasLimitValue = '7000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
  console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

  const nodeUrl = "http://140.119.101.130:8545";
  provider = new PrivateKeyProvider(BackendpkRaw.substr(2), nodeUrl);
  web3 = new Web3(provider);
  prefix = '0x';
  
} else if (chain === 2) {//2: POW private chain
  //gasLimitValue = 5000000 for POW private chain
  const options = { gasLimit: 9000000 };
  gasLimitValue = '9000000';
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "http://140.119.101.130:8540";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else if (chain === 3) {
  //gasLimitValue = 5000000 for POW Infura Rinkeby chain
  const options = { gasLimit: 7000000 };
  gasLimitValue = '7000000';
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "https://rinkeby.infura.io/v3/b789f67c3ef041a8ade1433c4b33de0f";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else {
  console.log('chain is out of range. chain =', chain);
  process.exit(1);
}

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
    console.log('[Good] Platform.abi is defined');
      //console.log('Platform.abi:', Platform.abi);
  }
  if (Platform.bytecode === undefined || Platform.bytecode.length < 10){
    console.log('[Error] Platform.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Platform.bytecode is defined');
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
    console.log('[Good] MultiSig.abi is defined');
      //console.log('MultiSig.abi:', MultiSig.abi);
  }
  if (MultiSig.bytecode === undefined || MultiSig.bytecode.length < 10){
    console.log('[Error] MultiSig.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] MultiSig.bytecode is defined');
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
    console.log('[Good] AssetBook.abi is defined');
      //console.log('AssetBook.abi:', AssetBook.abi);
  }
  if (AssetBook.bytecode === undefined || AssetBook.bytecode.length < 10){
    console.log('[Error] AssetBook.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] AssetBook.bytecode is defined');
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
    console.log('[Good] Registry.abi is defined');
      //console.log('Registry.abi:', Registry.abi);
  }
  if (Registry.bytecode === undefined || Registry.bytecode.length < 10){
    console.log('[Error] Registry.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Registry.bytecode is defined');
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
    console.log('[Good] TokenController.abi is defined');
      //console.log('TokenController.abi:', TokenController.abi);
  }
  if (TokenController.bytecode === undefined || TokenController.bytecode.length < 10){
    console.log('[Error] TokenController.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TokenController.bytecode is defined');
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
    console.log('[Good] ERC721SPLC.abi is defined');
      //console.log('ERC721SPLC.abi:', ERC721SPLC.abi);
  }
  if (ERC721SPLC.bytecode === undefined || ERC721SPLC.bytecode.length < 10){
    console.log('[Error] ERC721SPLC.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ERC721SPLC.bytecode is defined');
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
    console.log('[Good] CrowdFunding.abi is defined');
      //console.log('CrowdFunding.abi:', CrowdFunding.abi);
  }
  if (CrowdFunding.bytecode === undefined || CrowdFunding.bytecode.length < 10){
    console.log('[Error] CrowdFunding.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] CrowdFunding.bytecode is defined');
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
    console.log('[Good] IncomeManagement.abi is defined');
      //console.log('IncomeManagement.abi:', IncomeManagement.abi);
  }
  if (IncomeManagement.bytecode === undefined || IncomeManagement.bytecode.length < 10){
    console.log('[Error] IncomeManagement.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManagement.bytecode is defined');
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
    console.log('[Good] ProductManager.abi is defined');
      //console.log('ProductManager.abi:', ProductManager.abi);
  }
  if (ProductManager.bytecode === undefined || ProductManager.bytecode.length < 10){
    console.log('[Error] ProductManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ProductManager.bytecode is defined');
      //console.log('ProductManager.bytecode:', ProductManager.bytecode);
  }
  //console.log(ProductManager);
}


//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let accounts;
let instRegistry; 
let instTokenController; 
let instERC721SPLC; 
let instCrowdFunding; 
let instIncomeManagement;
let instProductManager;

let management;
let balance0; let balance1; let balance2;
let platformCtAdmin;

let balance0A; let balance0B;
let balance1A; let balance1B;
let balance2A; let balance2B;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

let argsAssetBook1; let argsAssetBook2;
let instAssetBook1; let instAssetBook2; let instAsset3; let instAsset4; 

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

const _tokenSymbol = nftSymbol;
const _tokenPrice = initialAssetPricing;
const _currency = pricingCurrency;
const _quantityMax = maxTotalSupply;
const _goalInPercentage = 97;
const _CFSD2 = timeCurrent+1;
const _CFED2 = timeCurrent+10;
let _serverTime = timeCurrent;


const deploy = async () => {
    console.log('\n--------==To deploy');

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

    console.log('\nDeploying contracts...');
    //JSON.parse() is not needed because the abi and bytecode are already objects

    if (ctrtName === 'platform') {
      //Deploying Platform contract...
      platformCtAdmin = Backend;
      const argsPlatform = [platformCtAdmin, management];
      console.log('\nDeploying Platform contract...');
      instPlatform =  await new web3.eth.Contract(Platform.abi)
      .deploy({ data: prefix+Platform.bytecode, arguments: argsPlatform })
      .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
      //.then(console.log);
      console.log('Platform.sol has been deployed');
      if (instPlatform === undefined) {
        console.log('[Error] instPlatform is NOT defined');
        } else {console.log('[Good] instPlatform is defined');}
      instPlatform.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrPlatform = instPlatform.options.address;
      console.log('addrPlatform:', addrPlatform);

    } else if (ctrtName === 'multisig') {

      const argsMultiSig1 = [AssetOwner1, addrPlatform];
      const argsMultiSig2 = [AssetOwner2, addrPlatform];

      console.log('\nDeploying multiSig contracts...');
      instMultiSig1 =  await new web3.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig1 })
      .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
      //.then(console.log);
      console.log('MultiSig1 has been deployed');
      if (instMultiSig1 === undefined) {
        console.log('[Error] instMultiSig1 is NOT defined');
        } else {console.log('[Good] instMultiSig1 is defined');}
      instMultiSig1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig1 = instMultiSig1.options.address;
      console.log('addrMultiSig1:', addrMultiSig1);
      console.log('waiting for addrMultiSig2...');

      instMultiSig2 =  await new web3.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig2 })
      .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
      //.then(console.log);
      console.log('MultiSig2 has been deployed');
      if (instMultiSig2 === undefined) {
        console.log('[Error] instMultiSig2 is NOT defined');
        } else {console.log('[Good] instMultiSig2 is defined');}
      instMultiSig2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig2 = instMultiSig2.options.address;
      console.log('addrMultiSig2:', addrMultiSig2);

  } else if (ctrtName === 'assetbook') {
    // addrMultiSig1 = '0xAF5065cD6A1cCe522D8ce712A5C7C52682740565';
    // addrMultiSig2 = '0xc993fD11a829d96015Cea876D46ac67B5aADCAF1';
    // addrPlatform = '0x9AC39FFC9de438F52DD3232ee07e95c5CDeDd4F9';
    argsAssetBook1 = [ AssetOwner1, addrMultiSig1, addrPlatform, timeCurrent];
    argsAssetBook2 = [ AssetOwner2, addrMultiSig2, addrPlatform, timeCurrent];

    //Deploying AssetBook contract... 
    console.log('\nDeploying AssetBook contracts...');
    
    instAssetBook1 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook1 })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('AssetBook.sol has been deployed');
    //instAssetBook1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAssetBook1 = instAssetBook1.options.address;
    console.log('addrAssetBook1:', addrAssetBook1);
    console.log('waiting for addrAssetBook2...');

    instAssetBook2 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook2 })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('AssetBook.sol has been deployed');
    if (instAssetBook2 === undefined) {
      console.log('[Error] instAssetBook2 is NOT defined');
      } else {console.log('[Good] instAssetBook2 is defined');}
    instAssetBook2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAssetBook2 = instAssetBook2.options.address;
    console.log('addrAssetBook2:', addrAssetBook2);
    //*/

  } else if (ctrtName === 'registry') {
    //Deploying Registry contract...
    console.log('\nDeploying Registry contract...');
    const argsRegistry = [management];
    instRegistry =  await new web3.eth.Contract(Registry.abi)
    .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined) {
      console.log('[Error] instRegistry is NOT defined');
      } else {console.log('[Good] instRegistry is defined');}
    instRegistry.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrRegistry = instRegistry.options.address;
    console.log('addrRegistry:', addrRegistry);

  } else if (ctrtName === 'tokencontroller') {
    //Deploying TokenController contract...
    console.log('\nDeploying TokenController contract...');
    const argsTokenController = [
      timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, management ];
    instTokenController = await new web3.eth.Contract(TokenController.abi)
    .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('TokenController.sol has been deployed');
    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrTokenController = instTokenController.options.address;
    console.log('addrTokenController:', addrTokenController);

  } else if (ctrtName === 'erc721splc') {
    //Deploying ERC721SPLC contract...
    /**
     * 
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, 201902150000,
    203903310000, 201901310000, "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a"
    */

    const argsERC721SPLC = [
    nftName, nftSymbol, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency, IRR20yrx100,
    addrRegistry, addrTokenController];
    // string memory _nftName, string memory _nftSymbol, 
    // uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
    // string memory _pricingCurrency, uint _IRR20yrx100,
    // address _addrRegistryITF, address _addrTokenControllerITF
  
    console.log('\nDeploying ERC721SPLC contract...');
    instERC721SPLC = await new web3.eth.Contract(ERC721SPLC.abi)
    .deploy({ data: prefix+ERC721SPLC.bytecode, arguments: argsERC721SPLC })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('ERC721SPLC.sol has been deployed');
    if (instERC721SPLC === undefined) {
      console.log('[Error] instERC721SPLC is NOT defined');
      } else {console.log('[Good] instERC721SPLC is defined');}
    instERC721SPLC.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrERC721SPLC = instERC721SPLC.options.address;
    console.log('addrERC721SPLC:', addrERC721SPLC);
    /**
    value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue
    value: web3.utils.toWei('10','ether')
    */

  } else if (ctrtName === 'crowdfunding') {
   console.log('\nDeploying CrowdFunding contract...');
   const argsCrowdFunding = [_tokenSymbol, _tokenPrice, _currency, _quantityMax, _goalInPercentage, _CFSD2, _CFED2, _serverTime, management];
   instCrowdFunding = await new web3.eth.Contract(CrowdFunding.abi)
    .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('CrowdFunding.sol has been deployed');
    if (instCrowdFunding === undefined) {
      console.log('[Error] instCrowdFunding is NOT defined');
      } else {console.log('[Good] instCrowdFunding is defined');}
    instCrowdFunding.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrCrowdFunding = instCrowdFunding.options.address;
    console.log('addrCrowdFunding:', addrCrowdFunding);

    /*
  } else if (ctrtName === 'incomemanagement') {
    const addrTokenCtrt = addrERC721SPLC;
    const argsIncomeManagement =[TimeAnchor, addrTokenCtrt, addrPA_Ctrt, addrFMXA_Ctrt, addrPlatformCtrt];

    instIncomeManagement = await new web3.eth.Contract(IncomeManagement.abi)
    .deploy({ data: IncomeManagement.bytecode, arguments: argsIncomeManagement })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('IncomeManagement.sol has been deployed');
    if (instIncomeManagement === undefined) {
      console.log('[Error] instIncomeManagement is NOT defined');
      } else {console.log('[Good] instIncomeManagement is defined');}
    instIncomeManagement.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrIncomeManagement = instIncomeManagement.options.address;
    console.log('addrIncomeManagement:', addrIncomeManagement);


  } else if (ctrtName === 'productmanager') {
    instProductManager = await new web3.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode })
    .send({ from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      console.log('[Error] instProductManager is NOT defined');
      } else {console.log('[Good] instProductManager is defined');}
    instProductManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrProductManager = instProductManager.options.address;
    console.log('addrProductManager:', addrProductManager);
    */

    // addrPA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    // addrFMXA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    // addrPlatformCtrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
  } else {
    console.log('ctrtName is not found');
    process.exit(1);
  }


}
deploy();

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
    //-------------==
