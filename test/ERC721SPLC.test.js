/**
$ yarn global add mocha
$ yarn run test
*/
const assert = require('assert');
const ganache = require('ganache-cli');
const options = { gasLimit: 9000000 };
/**https://github.com/trufflesuite/ganache-cli#using-ganache-cli
 -g or --gasPrice: The price of gas in wei (defaults to 20000000000)
 -l or --gasLimit: The block gas limit (defaults to 0x6691b7)
 */

const Web3 = require('web3');
const provider = ganache.provider(options);
// const server = ganache.server(options);
// server.listen(port, (err, blockchain) => {
//     /* */
// });
const web3 = new Web3(provider);//lower case web3 means it is an instance

require('events').EventEmitter.defaultMaxListeners = 30;
//require('events').EventEmitter.prototype._maxListeners = 20;
/* emitter.setMaxListeners();
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
*/

//--------------------==
console.log('Load contract json file compiled from sol file');
//const { interface, bytecode } = require('../compile');//dot dot for one level up

const Platform = require('../ethereum/contracts/build/Platform.json');
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

const MultiSig = require('../ethereum/contracts/build/MultiSig.json');
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

const AssetBook = require('../ethereum/contracts/build/AssetBook.json');
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



const Registry = require('../ethereum/contracts/build/Registry.json');
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

const TokenController = require('../ethereum/contracts/build/TokenController.json');
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

const ERC721SPLC = require('../ethereum/contracts/build/ERC721SPLC_HToken.json');
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

const CrowdFunding = require('../ethereum/contracts/build/CrowdFunding.json');
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

const IncomeManagement = require('../ethereum/contracts/build/IncomeManagement.json');
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

const ProductManager = require('../ethereum/contracts/build/ProductManager.json');
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
let instRegistry; let addrRegistry;
let instTokenController; let addrTokenController;
let instERC721SPLC; let addrERC721SPLC;
let instCrowdFunding; let addrCrowdFunding;
let instIncomeManagement; let addrIncomeManagement;
let instProductManager; let addrProductManager;

let acc0; let acc1; let acc2; let acc3; let acc4;
let balance0; let balance1; let balance2;
let AssetOwner1; let AssetOwner2;
let platformCtAdmin;

let balance0A; let balance0B;
let balance1A; let balance1B;
let balance2A; let balance2B;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

let argsAsset1; let argsAssetBook2; let argsAsset3; let argsAsset4;
let instAssetBook1; let instAssetBook2; let instAsset3; let instAsset4; 
let addrAssetBook1; let addrAssetBook2; let addrAsset3; let addrAsset4;


let timeCurrent = 201902281040;
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
//const addrRegistry = "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a";
//const addrTokenController = "0x39523jt032";

const argsTokenController = [
  timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid ];

const _tokenSymbol = nftSymbol;
const _tokenPrice = initialAssetPricing;
const _currency = pricingCurrency;
const _quantityMax = maxTotalSupply;
const _goalInPercentage = 97;
const _CFSD2 = timeCurrent+1;
const _CFED2 = timeCurrent+10;
let _serverTime = timeCurrent;
const argsCrowdFunding = [_tokenSymbol, _tokenPrice, _currency, _quantityMax, _goalInPercentage, _CFSD2, _CFED2, _serverTime];

const TimeAnchor = TimeTokenLaunch;
let addrPA_Ctrt; let addrFMXA_Ctrt; let addrPlatformCtrt;
let uid1; let uid2; let assetCtAddr1; let assetCtAddr2;
let extoAddr1; let extoAddr2;

let tokenId; let to; let _from; let uriStr; let uriBytes32; let uriStrB; let tokenOwner; let tokenOwnerM;
let tokenControllerDetail; let timeCurrentM;
let TimeTokenLaunchM; let TimeTokenUnlockM; let TimeTokenValidM; let isLaunchedM;
let bool1; let bool2;

beforeEach( async () => {
    console.log('\n--------==New beforeEach cycle');
    accounts = await web3.eth.getAccounts();
    acc0 = accounts[0];
    acc1 = accounts[1];
    acc2 = accounts[2];
    acc3 = accounts[3];
    acc4 = accounts[4];
    console.log('acc0', acc0);
    console.log('acc1', acc1);
    console.log('acc2', acc2);
    // console.log('acc1, to addr, or accounts[1]');
    // console.log('acc2, accounts[2]');

    if (2===1) {
        balance0 = await web3.eth.getBalance(acc0);//returns strings!
        balance1 = await web3.eth.getBalance(acc1);//returns strings!
        balance2 = await web3.eth.getBalance(acc2);//returns strings!
        console.log('acc0',  acc0, balance0);//100,00000000,0000000000
        console.log('acc1',  acc1, balance1);
        console.log('acc2',  acc2, balance2);
    }

    console.log('\nDeploying contracts...');
    //JSON.parse() is not needed because the abi and bytecode are already objects

    //Deploying Platform contract...
    platformCtAdmin = acc0;
    console.log('\nDeploying Platform contract...');
    instPlatform =  await new web3.eth.Contract(Platform.abi)
    .deploy({ data: Platform.bytecode, arguments: [platformCtAdmin] })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('Platform.sol has been deployed');
    if (instPlatform === undefined) {
      console.log('[Error] instPlatform is NOT defined');
      } else {console.log('[Good] instPlatform is defined');}
    instPlatform.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrPlatformContract = instPlatform.options.address;
    console.log('addrPlatformContract:', addrPlatformContract);


    AssetOwner1 = acc1; AssetOwner2 = acc2;
    let argsMultiSig1 = [AssetOwner1, addrPlatformContract];
    let argsMultiSig2 = [AssetOwner2, addrPlatformContract];

    console.log('\nDeploying multiSig contracts...');
    instMultiSig1 =  await new web3.eth.Contract(MultiSig.abi)
    .deploy({ data: MultiSig.bytecode, arguments: argsMultiSig1 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('MultiSig1 has been deployed');
    if (instMultiSig1 === undefined) {
      console.log('[Error] instMultiSig1 is NOT defined');
      } else {console.log('[Good] instMultiSig1 is defined');}
    instMultiSig1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrMultiSig1 = instMultiSig1.options.address;
    console.log('addrMultiSig1:', addrMultiSig1);

    instMultiSig2 =  await new web3.eth.Contract(MultiSig.abi)
    .deploy({ data: MultiSig.bytecode, arguments: argsMultiSig2 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('MultiSig2 has been deployed');
    if (instMultiSig2 === undefined) {
      console.log('[Error] instMultiSig2 is NOT defined');
      } else {console.log('[Good] instMultiSig2 is defined');}
    instMultiSig2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrMultiSig2 = instMultiSig2.options.address;
    console.log('addrMultiSig2:', addrMultiSig2);

    argsAssetBook1 = [addrMultiSig1, timeCurrent];
    argsAssetBook2 = [addrMultiSig2, timeCurrent];

    //Deploying AssetBook contract... 
    console.log('\nDeploying AssetBook contracts...');
    instAssetBook1 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: AssetBook.bytecode, arguments: argsAssetBook1 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook1 === undefined) {
      console.log('[Error] instAssetBook1 is NOT defined');
      } else {console.log('[Good] instAssetBook1 is defined');}
    instAssetBook1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAssetBook1 = instAssetBook1.options.address;
    console.log('addrAssetBook1:', addrAssetBook1);

    instAssetBook2 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: AssetBook.bytecode, arguments: argsAssetBook2 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook2 === undefined) {
      console.log('[Error] instAssetBook2 is NOT defined');
      } else {console.log('[Good] instAssetBook2 is defined');}
    instAssetBook2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAssetBook2 = instAssetBook2.options.address;
    console.log('addrAssetBook2:', addrAssetBook2);

    
    //Deploying Registry contract...
    console.log('\nDeploying Registry contract...');
    instRegistry =  await new web3.eth.Contract(Registry.abi)
    .deploy({ data: Registry.bytecode })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined) {
      console.log('[Error] instRegistry is NOT defined');
      } else {console.log('[Good] instRegistry is defined');}
    instRegistry.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrRegistry = instRegistry.options.address;
    console.log('addrRegistry:', addrRegistry);
    
    //Deploying TokenController contract...
    console.log('\nDeploying TokenController contract...');
    instTokenController = await new web3.eth.Contract(TokenController.abi)
    .deploy({ data: TokenController.bytecode, arguments: argsTokenController })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    console.log('TokenController.sol has been deployed');
    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrTokenController = instTokenController.options.address;
    console.log('addrTokenController:', addrTokenController);

    //Deploying ERC721SPLC contract...
    /** https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
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
    .deploy({ data: ERC721SPLC.bytecode, arguments: argsERC721SPLC })
    .send({ from: acc0, gas: '9000000', gasPrice: '20000000000' });
    console.log('ERC721SPLC.sol has been deployed');
    if (instERC721SPLC === undefined) {
      console.log('[Error] instERC721SPLC is NOT defined');
      } else {console.log('[Good] instERC721SPLC is defined');}
    instERC721SPLC.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrERC721SPLC = instERC721SPLC.options.address;
    console.log('addrERC721SPLC:', addrERC721SPLC);
    /**
    value: '0', from: acc0, gas: '1000000', gasPrice: '9000000000'
    value: web3.utils.toWei('10','ether')
    */

   console.log('\nDeploying CrowdFunding contract...');
   instCrowdFunding = await new web3.eth.Contract(CrowdFunding.abi)
    .deploy({ data: CrowdFunding.bytecode, arguments: argsCrowdFunding })
    .send({ from: acc0, gas: '9000000', gasPrice: '20000000000' });
    console.log('CrowdFunding.sol has been deployed');
    if (instCrowdFunding === undefined) {
      console.log('[Error] instCrowdFunding is NOT defined');
      } else {console.log('[Good] instCrowdFunding is defined');}
    instCrowdFunding.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrCrowdFunding = instCrowdFunding.options.address;
    console.log('addrCrowdFunding:', addrCrowdFunding);

    /*
    const addrTokenCtrt = addrERC721SPLC;
    const argsIncomeManagement =[TimeAnchor, addrTokenCtrt, addrPA_Ctrt, addrFMXA_Ctrt, addrPlatformCtrt];
    instIncomeManagement = await new web3.eth.Contract(IncomeManagement.abi)
    .deploy({ data: IncomeManagement.bytecode, arguments: argsIncomeManagement })
    .send({ from: acc0, gas: '9000000', gasPrice: '20000000000' });
    console.log('IncomeManagement.sol has been deployed');
    if (instIncomeManagement === undefined) {
      console.log('[Error] instIncomeManagement is NOT defined');
      } else {console.log('[Good] instIncomeManagement is defined');}
    instIncomeManagement.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrIncomeManagement = instIncomeManagement.options.address;
    console.log('addrIncomeManagement:', addrIncomeManagement);

    instProductManager = await new web3.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode })
    .send({ from: acc0, gas: '9000000', gasPrice: '20000000000' });
    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      console.log('[Error] instProductManager is NOT defined');
      } else {console.log('[Good] instProductManager is defined');}
    instProductManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrProductManager = instProductManager.options.address;
    console.log('addrProductManager:', addrProductManager);
    */

    addrPA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    addrFMXA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    addrPlatformCtrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
   
    console.log('--------==BeforeEach is finished');
});

console.log('\n----------------==');
describe('Tests on ERC721SPLC', () => {
  //this.timeout(2500);
  /*it('check ERC721SPLC deployment test', async () => {
    //!!!!!!!!! New contract instance for EVERY it() => Different contract addresses!!!
    //addrAsset = instAssetBook1.options.address;
    assert.ok(addrMultiSig1);
    assert.ok(addrMultiSig2);
    assert.ok(addrAssetBook1);
    assert.ok(addrAssetBook2);
    assert.ok(addrRegistry);
    assert.ok(addrTokenController);
    assert.ok(addrERC721SPLC);
    assert.ok(addrCrowdFunding);
    //assert.ok(addrIncomeManagement);

    //console.log('instERC721SPLC', instERC721SPLC);
    //test if the instanceCtrt has a property options, which has a property of address. Test if such value exists or is not undefined

    //console.log(instanceCtrt);
    //console.log(accounts);
  });*/

  // it('AssetBook contract test', async () => {
  //   console.log('addrAssetBook1', addrAssetBook1);
  // });

  it('AssetBook, Registry, ERC721SPLC HToken functions test', async function() {
    this.timeout(9500);

    console.log('\n------------==Check deployment');
    assert.ok(addrPlatformContract);
    assert.ok(addrMultiSig1);
    assert.ok(addrMultiSig2);
    assert.ok(addrAssetBook1);
    assert.ok(addrAssetBook2);
    assert.ok(addrRegistry);
    assert.ok(addrTokenController);
    assert.ok(addrERC721SPLC);
    assert.ok(addrCrowdFunding);
    console.log('Deployment Check: Good');

    //----------------==Check MultiSig & AssetBook contracts
    console.log('\n------------==Check MultiSig contract 1 & 2');
    console.log('addrMultiSig1', addrMultiSig1);
    console.log('addrMultiSig2', addrMultiSig2);
    let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
    assert.equal(assetOwnerM1, AssetOwner1);
    let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
    assert.equal(assetOwnerM2, AssetOwner2);

    console.log('\nCheck getPlatformContractAddr()');
    let platformM1 = await instMultiSig1.methods.getPlatformContractAddr().call();
    assert.equal(platformM1, addrPlatformContract);
    let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
    assert.equal(platformM2, addrPlatformContract);

    console.log('\n------------==Check AssetBook contract 1 & 2');
    console.log('addrAssetBook1', addrAssetBook1);
    console.log('addrAssetBook2', addrAssetBook2);

    let assetAddr = addrERC721SPLC;
    let assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    let assetsMeasured2 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('assetsMeasured1', assetsMeasured1);
    console.log('assetsMeasured2', assetsMeasured2);
    // return (AssetBook.assetSymbol, AssetBook.assetAddrIndex, 
    //   AssetBook.assetAmount, AssetBook.timeIndexStart, 
    //   AssetBook.timeIndexEnd, AssetBook.isInitialized);


    //----------------==Registry contract
    console.log('\n------------==Registry contract: add AssetBook contracts 1 & 2');
    console.log('addrRegistry', addrRegistry);
    uid1 = "A500000001"; assetCtAddr = addrAssetBook1; extoAddr = acc1;
    await instRegistry.methods.addUser(
      uid1, assetCtAddr, extoAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    let user1M = await instRegistry.methods.getUser(uid1).call();
    assert.equal(user1M[0], uid1);
    assert.equal(user1M[1], assetCtAddr);
    assert.equal(user1M[2], extoAddr);
    assert.equal(user1M[3], 0);
    console.log('user1M', user1M);

    uid2 = "A500000002"; assetCtAddr = addrAssetBook2; extoAddr = acc2;
    await instRegistry.methods.addUser(
      uid2, assetCtAddr, extoAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    let user2M = await instRegistry.methods.getUser(uid2).call();
    assert.equal(user2M[0], uid2);
    assert.equal(user2M[1], assetCtAddr);
    assert.equal(user2M[2], extoAddr);
    assert.equal(user2M[3], 0);
    console.log('user2M', user2M);



    //----------------==
    console.log('\n------------==Check ERC721SPLC parameters');
    console.log('addrERC721SPLC', addrERC721SPLC);

    // await instERC721SPLC.methods.set_admin(acc1, acc0).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//set_tokenDump(address _tokenDump, address vendor)

    let nameM = await instERC721SPLC.methods.name().call();
    let symbolM = await instERC721SPLC.methods.symbol().call();
    let initialAssetPricingM = await instERC721SPLC.methods.initialAssetPricing().call();
    let IRR20yrx100M = await instERC721SPLC.methods.IRR20yrx100().call();
    let maxTotalSupplyM = await instERC721SPLC.methods.maxTotalSupply().call();
    let pricingCurrencyM = await instERC721SPLC.methods.pricingCurrency().call();
    let siteSizeInKWM = await instERC721SPLC.methods.siteSizeInKW().call();
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(nameM, nftName);
    assert.equal(symbolM, nftSymbol);
    assert.equal(initialAssetPricingM, initialAssetPricing);
    assert.equal(IRR20yrx100M, IRR20yrx100);
    assert.equal(maxTotalSupplyM, maxTotalSupply);
    assert.equal(pricingCurrencyM, pricingCurrency);
    assert.equal(siteSizeInKWM, siteSizeInKW);
    assert.equal(tokenIdM, 0);

    let isUnlockedValid = await instTokenController.methods.isUnlockedValid().call();
    assert.equal(isUnlockedValid, false);


    let supportsInterface0x80ac58cd = await instERC721SPLC.methods.supportsInterface("0x80ac58cd").call();
    assert.equal(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instERC721SPLC.methods.supportsInterface("0x5b5e139f").call();
    assert.equal(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instERC721SPLC.methods.supportsInterface("0x780e9d63").call();
    assert.equal(supportsInterface0x780e9d63, true);

    //----------------==Mint Token One
    console.log('\n------------==Mint token: tokenId = 1');
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 0);

    const uriBase = "https://heliumcryptic.com/nccu0";
    uriStr = uriBase+"1";
    console.log('uriStr', uriStr);

    uriBytes32 = web3.utils.fromAscii(uriStr);
    console.log('uriBytes32', uriBytes32);

    uriStrB = web3.utils.toAscii(uriBytes32);
    console.log('uriStrB', uriStrB);

    //let assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    //addrPlatformContract
    console.log('from Platform contract to ');
    await instAssetBook1.methods.updateAssetOwner()
    .send({ value: '0', from: acc0, gas: '1000000' });

    await instPlatform.methods.setAssetCtrtApproval(addrAssetBook1, addrERC721SPLC, true)
    .send({ value: '0', from: acc0, gas: '1000000' });

    console.log('check1');
    await instAssetBook2.methods.updateAssetOwner()
    .send({ value: '0', from: acc0, gas: '1000000' });

    await instPlatform.methods.setAssetCtrtApproval(addrAssetBook2, addrERC721SPLC, true)
    .send({ value: '0', from: acc0, gas: '1000000' });

    console.log('start minting tokenId 1 to ');
    await instERC721SPLC.methods.mintSerialNFT(addrAssetBook1, uriBytes32).send({
      value: '0', from: acc0, gas: '1000000'
    });

    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 1);

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwnerM, addrAssetBook1);

    tokenInfo = await instERC721SPLC.methods.getNFT(1).call();
    console.log('tokenInfo from ERC721SPLC tokenId = 1:', tokenInfo);
    /**
    const nftName = "NCCU site No.1(2018)";
    const nftSymbol = "NCCU1801";
    const siteSizeInKW = 300; const maxTotalSupply = 800; 
    const initialAssetPricing = 17000; const pricingCurrency = "NTD";
    const IRR20yrx100 = 470;
     */
    assert.equal(tokenInfo[0], nftName);
    assert.equal(tokenInfo[1], nftSymbol);
    assert.equal(tokenInfo[2], pricingCurrency);
    assert.equal(web3.utils.toAscii(tokenInfo[3]), uriStr);
    assert.equal(tokenInfo[4], initialAssetPricing);

    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    console.log('getAsset(assetAddr):', assetsMeasured1);
    //let assetTimeIndexedTokenIdsM1 = await instAssetBook1.methods.getAssetTimeIndexedTokenIds(assetAddr).call();
    //console.log('assetTimeIndexedTokenIdsM1', assetTimeIndexedTokenIdsM1);

    // let assetIdsM1 = await instAssetBook1.methods.getAssetIds(assetAddr).call();
    // console.log('assetIdsM1', assetIdsM1);

    //-----------------==Mint Token Batch
    console.log('\n------------==Mint Token in Batch: tokenId = 2, 3, 4 to AssetBook1');
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 1);

    addrAssetBookX = addrAssetBook1;
    let _tos = [addrAssetBookX, addrAssetBookX, addrAssetBookX];
    let _uriStrs = [uriBase+"2", uriBase+"3", uriBase+"4"];
    const strToBytes32 = str => web3.utils.fromAscii(str);
    let _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    await instERC721SPLC.methods.mintSerialNFTBatch(_tos, _uriBytes32s).send({
      value: '0', from: acc0, gas: '1000000'
    });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 4);

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(2).call();
    assert.equal(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(3).call();
    assert.equal(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(4).call();
    assert.equal(tokenOwnerM, addrAssetBookX);

    tokenInfo = await instERC721SPLC.methods.getNFT(2).call();
    console.log('tokenInfo from ERC721SPLC id = 2:', tokenInfo);
    /**
    const nftName = "NCCU site No.1(2018)";
    const nftSymbol = "NCCU1801";
    const siteSizeInKW = 300; const maxTotalSupply = 800; 
    const initialAssetPricing = 17000; const pricingCurrency = "NTD";
    const IRR20yrx100 = 470;
     */
    assert.equal(tokenInfo[0], nftName);
    assert.equal(tokenInfo[1], nftSymbol);
    assert.equal(tokenInfo[2], pricingCurrency);
    assert.equal(tokenInfo[4], initialAssetPricing);
    assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[0]);

    console.log('check uri of Id 2, 3, 4');
    tokenInfo = await instERC721SPLC.methods.getNFT(3).call();
    assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[1]);
    tokenInfo = await instERC721SPLC.methods.getNFT(4).call();
    assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[2]);

    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[0], 'NCCU1801');
    assert.equal(assetsMeasured1[1], 1);//assetAddrIndex
    assert.equal(assetsMeasured1[2], 4);//amount
    assert.equal(assetsMeasured1[3], 0);//timeIndexStart
    assert.equal(assetsMeasured1[4], 3);//timeIndexEnd
    assert.equal(assetsMeasured1[5], true);//isInitialized

    //assetTimeIndexedTokenIdsM1 = await instAssetBook1.methods.getAssetTimeIndexedTokenIds(assetAddr).call();
    //console.log('assetTimeIndexedTokenIdsM1', assetTimeIndexedTokenIdsM1);
    // assetIdsM1 = await instAssetBook1.methods.getAssetIds(assetAddr).call();
    // console.log('assetIdsM1', assetIdsM1);

    //-----------------==Mint Token Batch
    console.log('\n------------==Mint Token in Batch: tokenId = 5, 6, 7 to AssetBook2');
    addrAssetBookX = addrAssetBook2;
    _tos = [addrAssetBookX, addrAssetBookX, addrAssetBookX];
    _uriStrs = [uriBase+"5", uriBase+"6", uriBase+"7"];
    _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    await instERC721SPLC.methods.mintSerialNFTBatch(_tos, _uriBytes32s).send({
      value: '0', from: acc0, gas: '1000000'
    });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 7);

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(5).call();
    assert.equal(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(6).call();
    assert.equal(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(7).call();
    assert.equal(tokenOwnerM, addrAssetBookX);

    tokenInfo = await instERC721SPLC.methods.getNFT(5).call();
    console.log('tokenInfo from ERC721SPLC id = 5:', tokenInfo);

    console.log('check uri of Id 2, 3, 4');
    tokenInfo = await instERC721SPLC.methods.getNFT(6).call();
    assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[1]);
    tokenInfo = await instERC721SPLC.methods.getNFT(7).call();
    assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[2]);

    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[0], 'NCCU1801');
    assert.equal(assetsMeasured1[1], 1);//assetAddrIndex
    assert.equal(assetsMeasured1[2], 3);//amount
    assert.equal(assetsMeasured1[3], 0);//timeIndexStart
    assert.equal(assetsMeasured1[4], 2);//timeIndexEnd
    assert.equal(assetsMeasured1[5], true);//isInitialized

    //assetTimeIndexedTokenIdsM1 = await instAssetBook2.methods.getAssetTimeIndexedTokenIds(assetAddr).call();
    //console.log('assetTimeIndexedTokenIdsM1', assetTimeIndexedTokenIdsM1);



    //-----------------==Check Token Controller: time
    console.log('\n------------==Check TokenController parameters: time');
    console.log('addrTokenController', addrTokenController);
    let owner = await instTokenController.methods.owner().call();
    let chairman = await instTokenController.methods.chairman().call();
    let director = await instTokenController.methods.director().call();
    let manager = await instTokenController.methods.manager().call();
    let admin = await instTokenController.methods.admin().call();

    assert.equal(owner, acc0);
    assert.equal(manager, acc0);
    assert.equal(admin, acc0);
    assert.equal(chairman, acc0);
    assert.equal(director, acc0);

    tokenControllerDetail = await instTokenController.methods.getHTokenControllerDetails().call(); 
    timeCurrentM = tokenControllerDetail[0];
    TimeTokenLaunchM = tokenControllerDetail[1];
    TimeTokenUnlockM = tokenControllerDetail[2];
    TimeTokenValidM = tokenControllerDetail[3];
    isLaunchedM = tokenControllerDetail[4];
    console.log('timeCurrent', timeCurrentM, ', TimeTokenLaunch', TimeTokenLaunchM, ', TimeTokenUnlock', TimeTokenUnlockM, ', TimeTokenValid', TimeTokenValidM, ', isLaunched', isLaunchedM);

    //----------------==Send tokens before Unlock Time
    console.log('\n------------==Send tokens before Unlock Time');
    timeCurrent = TimeTokenUnlock;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    assert.equal(bool1, false);

    tokenId = 1; _from = addrAssetBook1; to = addrAssetBook2;
    let error = false;
    try {
      await instAssetBook1.methods.transferAsset(assetAddr, tokenId, to, timeCurrent)
      .send({ value: '0', from: acc1, gas: '1000000' });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);
      assert(err);
    }
    if (error) {assert(false);}


    //-------------------------==Send tokens
    //-----------------==Send Token One
    console.log('\n------------==Send token by one: amount = 1 from AssetBook2 to AssetBook1');
    timeCurrent = 201902281045;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    assert.equal(bool1, true);

    console.log('sending tokens via transferAssetBatch()...');
    let _assetAddr = addrERC721SPLC; let amount = 1; 
    let _to = addrAssetBook1; let _timeCurrent = timeCurrent;
    await instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to)
    .send({value: '0', from: AssetOwner2, gas: '1000000'
    });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)

    await instAssetBook2.methods.fixTimeIndexedIds(_assetAddr, amount)
    .send({value: '0', from: AssetOwner2, gas: '1000000'
    });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)

    console.log('Check AssetBook2 after txn...');
    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[2], 2);//amount
    assert.equal(assetsMeasured1[3], 1);//timeIndexStart
    assert.equal(assetsMeasured1[4], 2);//timeIndexEnd
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    //   asset.ids, erc721.get_ownerToIds(address(this)));

    console.log('AssetBook1 to receive tokens...');
    await instAssetBook1.methods.updateReceivedAsset(assetAddr) 
    .send({value: '0', from: AssetOwner1, gas: '1000000'});
    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[2], 5);//amount
    assert.equal(assetsMeasured1[3], 0);//timeIndexStart
    assert.equal(assetsMeasured1[4], 4);//timeIndexEnd


    //-----------------==Send Tokens in batch
    console.log('\n------------==Send tokens in batch: amount = 3 from AssetBook1 to AssetBook2');
    console.log('sending tokens via transferAssetBatch()...');
    amount = 3; _to = addrAssetBook2;

    await instAssetBook1.methods.transferAssetBatch(_assetAddr, amount, _to)
    .send({value: '0', from: AssetOwner1, gas: '1000000'
    });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)

    await instAssetBook1.methods.fixTimeIndexedIds(_assetAddr, amount)
    .send({value: '0', from: AssetOwner1, gas: '1000000'
    });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)

    console.log('Check AssetBook1 after txn...');
    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[2], 2);//amount
    assert.equal(assetsMeasured1[3], 3);//timeIndexStart
    assert.equal(assetsMeasured1[4], 4);//timeIndexEnd
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    //   asset.ids, erc721.get_ownerToIds(address(this)));

    console.log('AssetBook2 to receive tokens...');
    await instAssetBook2.methods.updateReceivedAsset(assetAddr) 
    .send({value: '0', from: AssetOwner2, gas: '1000000'});
    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    assert.equal(assetsMeasured1[2], 5);//amount
    assert.equal(assetsMeasured1[3], 1);//timeIndexStart
    assert.equal(assetsMeasured1[4], 4);//timeIndexEnd


    //----------------==Send tokens after valid time
    console.log('\n------------==Send tokens after valid date');
    timeCurrent = TimeTokenValid;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    assert.equal(bool1, false);

    to = addrAssetBook1;
    error = false;
    try {
      await instAssetBook2.methods.transferAsset(assetAddr, tokenId, to, timeCurrent)
      .send({ value: '0', from: acc2, gas: '1000000' });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt2 to assetCtrt1 failed because of not meeting the condition: timeCurrent > TimeTokenValid', timeCurrent, TimeTokenValid);
      assert(err);
    }
    if (error) {assert(false);}


  });//.then(done)

});


//-----------------------------------------==
describe('Tests on CrowdFunding', () => {

  it('CrowdFunding functions test', async () => {
    console.log('\n------------==Check CrowdFunding parameters');
    console.log('addrCrowdFunding', addrCrowdFunding);
    console.log("timeCurrent", timeCurrent, ", _CFSD2:", _CFSD2, ", _CFED2:", _CFED2);
    // timeCurrent = 201902281040;
    // const _CFSD2 = timeCurrent+1;
    // const _CFED2 = timeCurrent+10;
    /**
    const nftSymbol = "NCCU1801";
    const maxTotalSupply = 773; 
    const _goalInPercentage = 97;//  773* 0.97 = 749.81
    const initialAssetPricing = 17000;

    string public tokenSymbol; //專案erc721合約
    uint public tokenPrice; //每片太陽能板定價
    uint public quantityMax; //專案總token數
    uint public quantityGoal; //專案達標數目
    uint public quantitySold; //累積賣出數目
    uint public CFSD2; //start date yyyymmddhhmm
    uint public CFED2; //截止日期 yyyymmddhhmm
    */
    let tokenSymbolM = await instCrowdFunding.methods.tokenSymbol().call();
    console.log('\ntokenSymbolM', tokenSymbolM);
    assert.equal(tokenSymbolM, nftSymbol);

    let tokenPriceM = await instCrowdFunding.methods.tokenPrice().call();
    console.log('tokenPriceM', tokenPriceM);
    assert.equal(tokenPriceM, 17000);

    let quantityMaxM = await instCrowdFunding.methods.quantityMax().call();
    console.log('quantityMaxM', quantityMaxM);
    assert.equal(quantityMaxM, 773);

    const quantityTargetGoal = 749;
    let quantityGoalM = await instCrowdFunding.methods.quantityGoal().call();
    console.log('quantityGoalM', quantityGoalM);
    assert.equal(quantityGoalM, quantityTargetGoal);

    let CFSD2M = await instCrowdFunding.methods.CFSD2().call();
    console.log('CFSD2M', CFSD2M);
    assert.equal(CFSD2M, _CFSD2);

    let CFED2M = await instCrowdFunding.methods.CFED2().call();
    console.log('CFED2M', CFED2M);
    assert.equal(CFED2M, _CFED2);

    //------------==
    await instCrowdFunding.methods.updateState()
    .send({ value: '0', from: acc0, gas: '1000000' });

    let serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('\nserverTimeM', serverTimeM);
    assert.equal(serverTimeM, 201902281040);

    let stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: not started yet");

    let salestateM = await instCrowdFunding.methods.salestate().call();
    console.log('salestateM', salestateM);
    assert.equal(salestateM, 0);

    //const _CFSD2 = timeCurrent+1;
    await instCrowdFunding.methods.setServerTime(_CFSD2)
    .send({ value: '0', from: acc0, gas: '1000000' });
    serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('\nserverTimeM', serverTimeM);
    assert.equal(serverTimeM, _CFSD2);
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "funding: with goal not reached yet");

    salestateM = await instCrowdFunding.methods.salestate().call();
    console.log('salestateM', salestateM);
    assert.equal(salestateM, 1);

    if (1==2){
      //const _CFED2 = timeCurrent+10;
      await instCrowdFunding.methods.setServerTime(_CFED2)
      .send({ value: '0', from: acc0, gas: '1000000' });
      serverTimeM = await instCrowdFunding.methods.serverTime().call();
      console.log('serverTimeM', serverTimeM);
      assert.equal(serverTimeM, _CFED2);//201902281050
      
      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "hasFailed: ended with goal not reached");

      salestateM = await instCrowdFunding.methods.salestate().call();
      console.log('salestateM', salestateM);
      assert.equal(salestateM, 5);
      process.exit(1);
    }

    /**
    const nftSymbol = "NCCU1801";
    const maxTotalSupply = 773; 
    const _goalInPercentage = 97;//  773* 0.97 = 749.81 ... 24
    const initialAssetPricing = 17000;
    */
    // serverTimeM = await instCrowdFunding.methods.serverTime().call();
    // console.log('\nserverTimeM', serverTimeM);
    // assert.equal(serverTimeM, 201902281041);

    await instCrowdFunding.methods.startFunding()
    .send({ value: '0', from: acc0, gas: '1000000' });

    await instCrowdFunding.methods.invest(addrAssetBook1, quantityTargetGoal)
    .send({ value: '0', from: acc0, gas: '1000000' });
    console.log('\nafter investing the target goal amount');

    //------------------==Set time to initial
    await instCrowdFunding.methods.setServerTime(_CFSD2-1)
    .send({ value: '0', from: acc0, gas: '1000000' });
    serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('serverTimeM', serverTimeM);
    assert.equal(serverTimeM, _CFSD2-1);//201902281039
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: goal reached already");

    salestateM = await instCrowdFunding.methods.salestate().call();
    console.log('salestateM', salestateM);
    assert.equal(salestateM, 0);

    //------------------==Back to _CFSD2
    await instCrowdFunding.methods.setServerTime(_CFSD2)
    .send({ value: '0', from: acc0, gas: '1000000' });
    serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('\nserverTimeM', serverTimeM);
    assert.equal(serverTimeM, _CFSD2);

    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "fundingWithGoalReached: still funding and has reached goal");

    salestateM = await instCrowdFunding.methods.salestate().call();
    console.log('salestateM', salestateM);
    assert.equal(salestateM, 3);


    //------------------==Overbuying
    let quantityAvailable = maxTotalSupply - quantityTargetGoal;//24

    let error = false;
    try {
      console.log('\nTrying to invest quantityAvailable+1');
      await instCrowdFunding.methods.invest(addrAssetBook1, quantityAvailable+1)
      .send({ value: '0', from: acc0, gas: '1000000' });
      error = true;
    } catch (err) {
      console.log('[Success] over-buying failed because of not enough quantity for sales. quantityAvailable:', quantityAvailable);
      assert(err);
    }
    if (error) {assert(false);}

    if(1==2){
      //-------------------==Buying the available quantity
      console.log('\nTrying to invest quantityAvailable');
      await instCrowdFunding.methods.invest(addrAssetBook1, quantityAvailable)
      .send({ value: '0', from: acc0, gas: '1000000' });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "hasSucceeded: sold out");

      salestateM = await instCrowdFunding.methods.salestate().call();
      console.log('salestateM', salestateM);
      assert.equal(salestateM, 4);

    } else {
      //-------------------==CFED2 has been reached
      console.log('\nCFED2 has been reached');
      await instCrowdFunding.methods.setServerTime(_CFED2)
      .send({ value: '0', from: acc0, gas: '1000000' });
      serverTimeM = await instCrowdFunding.methods.serverTime().call();
      console.log('serverTimeM', serverTimeM);
      assert.equal(serverTimeM, _CFED2);//201902281050

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "hasSucceeded: ended with unsold items");

      salestateM = await instCrowdFunding.methods.salestate().call();
      console.log('salestateM', salestateM);
      assert.equal(salestateM, 4);
    }


    //------------------==
    /*
    serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('\nserverTimeM', serverTimeM);
    assert.equal(serverTimeM, 201902281041);

    await instCrowdFunding.methods.startFunding()
    .send({ value: '0', from: acc0, gas: '1000000' });

    await instCrowdFunding.methods.invest(addrAssetBook1, maxTotalSupply)
    .send({ value: '0', from: acc0, gas: '1000000' });

    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "hasSucceeded: sold out");

    salestateM = await instCrowdFunding.methods.salestate().call();
    console.log('salestateM', salestateM);
    assert.equal(salestateM, 4);
    */

  });

});

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
