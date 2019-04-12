/**
$ yarn global add mocha
$ yarn run test721
*/
console.log('process.argv', process.argv, process.argv[3]);
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

let provider, web3, gasLimitValue, gasPriceValue, prefix = '', tokenIds, assetbookXM, balanceXM, index, assebookId;
const options = { gasLimit: 9000000 };
gasLimitValue = '9000000';
gasPriceValue = '20000000000';
/**https://github.com/trufflesuite/ganache-cli#using-ganache-cli
 -g or --gasPrice: The price of gas in wei (defaults to 20000000000)
  -l or --gasLimit: The block gas limit (defaults to 0x6691b7)
*/
provider = ganache.provider(options);
// const server = ganache.server(options);
// server.listen(port, (err, blockchain) => {
//     /* */
// });
web3 = new Web3(provider);//lower case web3 means it is an instance

//process.setMaxListeners(Infinity);
//emitter.setMaxListeners(50);
require('events').EventEmitter.defaultMaxListeners = 50;
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

// const MultiSig = require('../ethereum/contracts/build/MultiSig.json');
// if (MultiSig === undefined){
//   console.log('[Error] MultiSig is Not Defined <<<<<<<<<<<<<<<<<<<<<');
// } else {
//   console.log('[Good] MultiSig is defined');
//   if (MultiSig.abi === undefined){
//     console.log('[Error] MultiSig.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
//   } else {
//     console.log('[Good] MultiSig.abi is defined');
//       //console.log('MultiSig.abi:', MultiSig.abi);
//   }
//   if (MultiSig.bytecode === undefined || MultiSig.bytecode.length < 10){
//     console.log('[Error] MultiSig.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
//   } else {
//     console.log('[Good] MultiSig.bytecode is defined');
//       //console.log('MultiSig.bytecode:', MultiSig.bytecode);
//   }
//   //console.log(MultiSig);
// }

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

const HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
if (HCAT721 === undefined){
  console.log('[Error] HCAT721 is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] HCAT721 is defined');
  if (HCAT721.abi === undefined){
    console.log('[Error] HCAT721.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.abi is defined');
      //console.log('HCAT721.abi:', HCAT721.abi);
  }
  if (HCAT721.bytecode === undefined || HCAT721.bytecode.length < 10){
    console.log('[Error] HCAT721.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.bytecode is defined');
      //console.log('HCAT721.bytecode:', HCAT721.bytecode);
  }
  //console.log(HCAT721);
}


/*const ArrayTesting = require('../ethereum/contracts/build/ArrayTesting.json');
if (ArrayTesting === undefined){
  console.log('[Error] ArrayTesting is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ArrayTesting is defined');
  if (ArrayTesting.abi === undefined){
    console.log('[Error] ArrayTesting.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ArrayTesting.abi is defined');
      //console.log('ArrayTesting.abi:', ArrayTesting.abi);
  }
  if (ArrayTesting.bytecode === undefined || ArrayTesting.bytecode.length < 10){
    console.log('[Error] ArrayTesting.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ArrayTesting.bytecode is defined');
      //console.log('ArrayTesting.bytecode:', ArrayTesting.bytecode);
  }
  //console.log(ArrayTesting);
}*/


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

//----------------==Income Manager Related...
const IncomeManagerCtrt = require('../ethereum/contracts/build/IncomeManagerCtrt.json');
if (IncomeManagerCtrt === undefined){
  console.log('[Error] IncomeManagerCtrt is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] IncomeManagerCtrt is defined');
  if (IncomeManagerCtrt.abi === undefined){
    console.log('[Error] IncomeManagerCtrt.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManagerCtrt.abi is defined');
      //console.log('IncomeManagerCtrt.abi:', IncomeManagerCtrt.abi);
  }
  if (IncomeManagerCtrt.bytecode === undefined || IncomeManagerCtrt.bytecode.length < 10){
    console.log('[Error] IncomeManagerCtrt.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManagerCtrt.bytecode is defined');
      //console.log('IncomeManagerCtrt.bytecode:', IncomeManagerCtrt.bytecode);
  }
  //console.log(IncomeManagerCtrt);
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

const maxTokenQtyForEachInvestmentFund = 120;
let instRegistry, addrRegistry;
let instTokenController, addrTokenController;
let instHCAT721, addrHCAT721;
let instCrowdFunding, addrCrowdFunding;
let instIncomeManagerCtrt, addrIncomeManagerCtrt;
let instProductManager, addrProductManager;

let accounts, managementTeam, acc3, acc4;//acc3 and acc4 are used for chairman and owner roles
let AssetOwner1, AssetOwner2, platformSupervisor, operator;
let amount, balancePlatformSupervisor = 0, balanceAO1 = 0, balanceAO2 = 0;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

let argsAssetBook1, argsAssetBook2;
let instAssetBook1, instAssetBook2, instAsset3, instAsset4; 
let addrAssetBook1, addrAssetBook2, addrAsset3, addrAsset4;

let timeCurrent = 201903081040;
const TimeTokenLaunch = timeCurrent+3;
const TimeTokenUnlock = timeCurrent+4; 
const TimeTokenValid =  timeCurrent+9;

const tokenName = "NCCU site No.1(2018)";
const tokenSymbol = "NCCU1801";
const siteSizeInKW = 300;
const maxTotalSupply = 773;
const quantityGoal = 752;//const _goalInPercentage = 0.97;
const initialAssetPricing = 17000;
const pricingCurrency = "NTD";
const IRR20yrx100 = 470;
const tokenURI = tokenSymbol+"/uri";
//const addrRegistry = "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a";
//const addrTokenController = "0x39523jt032";

const CFSD2 = timeCurrent+1;
const CFED2 = timeCurrent+10;
let reason, addrPlatformCtrt, uid1, uid2;
let extoAddr1, extoAddr2;

let tokenId, to, _from, uriStr, uriBytes32, uriStrB, tokenOwner;
let tokenOwnerM, tokenControllerDetail, timeCurrentM;
let TimeTokenLaunchM, TimeTokenUnlockM, TimeTokenValidM, isLaunchedM, bool1, bool2, assetIdsFromAssetBook;

beforeEach( async () => {
    console.log('\n--------==New beforeEach cycle');
    accounts = await web3.eth.getAccounts();
    platformSupervisor = accounts[0];
    AssetOwner1 = accounts[1];
    AssetOwner2 = accounts[2];
    acc3 = accounts[3];
    acc4 = accounts[4];
    platformSupervisor = accounts[3];
    fundManager = accounts[4];
    operator = accounts[4];

    managementTeam = [platformSupervisor, AssetOwner1, AssetOwner2, acc3, acc4];
    console.log('platformSupervisor', platformSupervisor);
    console.log('AssetOwner1', AssetOwner1);
    console.log('AssetOwner2', AssetOwner2);
    console.log('acc3', acc3);
    console.log('acc4', acc4);
    console.log('managementTeam', managementTeam);

    // console.log('AssetOwner1, to addr, or accounts[1]');
    // console.log('AssetOwner2, accounts[2]');

    if (2===1) {
        balancePlatformSupervisor = await web3.eth.getBalance(platformSupervisor);//returns strings!
        balanceAO1 = await web3.eth.getBalance(AssetOwner1);//returns strings!
        balanceAO2 = await web3.eth.getBalance(AssetOwner2);//returns strings!
        console.log('platformSupervisor',  platformSupervisor, balancePlatformSupervisor);//100,00000000,0000000000
        console.log('AssetOwner1',  AssetOwner1, balanceAO1);
        console.log('AssetOwner2',  AssetOwner2, balanceAO2);
    }

    console.log('\nDeploying Platform contract...');
    //JSON.parse() is not needed because the abi and bytecode are already objects
    console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);
    const argsPlatform = [platformSupervisor, managementTeam];
    console.log('\nDeploying Platform contract...');
    instPlatform =  await new web3.eth.Contract(Platform.abi)
    .deploy({ data: prefix+Platform.bytecode, arguments: argsPlatform })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('Platform.sol has been deployed');
    if (instPlatform === undefined) {
      console.log('[Error] instPlatform is NOT defined');
      } else {console.log('[Good] instPlatform is defined');}
    instPlatform.setProvider(provider);
    addrPlatformCtrt = instPlatform.options.address;
    console.log('addrPlatformCtrt:', addrPlatformCtrt);


    // const argsMultiSig1 = [AssetOwner1, addrPlatformCtrt];
    // const argsMultiSig2 = [AssetOwner2, addrPlatformCtrt];
    // console.log('\nDeploying multiSig contracts...');
    // instMultiSig1 =  await new web3.eth.Contract(MultiSig.abi)
    // .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig1 })
    // .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    // //.then(console.log);
    // console.log('MultiSig1 has been deployed');
    // if (instMultiSig1 === undefined) {
    //   console.log('[Error] instMultiSig1 is NOT defined');
    //   } else {console.log('[Good] instMultiSig1 is defined');}
    // instMultiSig1.setProvider(provider);
    // addrMultiSig1 = instMultiSig1.options.address;
    // console.log('addrMultiSig1:', addrMultiSig1);

    // instMultiSig2 =  await new web3.eth.Contract(MultiSig.abi)
    // .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig2 })
    // .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    // //.then(console.log);
    // console.log('MultiSig2 has been deployed');
    // if (instMultiSig2 === undefined) {
    //   console.log('[Error] instMultiSig2 is NOT defined');
    //   } else {console.log('[Good] instMultiSig2 is defined');}
    // instMultiSig2.setProvider(provider);
    // addrMultiSig2 = instMultiSig2.options.address;
    // console.log('addrMultiSig2:', addrMultiSig2);

    argsAssetBook1 = [ AssetOwner1, addrPlatformCtrt];
    argsAssetBook2 = [ AssetOwner2, addrPlatformCtrt];

    //Deploying AssetBook contract... 
    console.log('\nDeploying AssetBook contracts...');
    instAssetBook1 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook1 })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook1 === undefined) {
      console.log('[Error] instAssetBook1 is NOT defined');
      } else {console.log('[Good] instAssetBook1 is defined');}
    instAssetBook1.setProvider(provider);
    addrAssetBook1 = instAssetBook1.options.address;
    console.log('addrAssetBook1:', addrAssetBook1);

    instAssetBook2 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook2 })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook2 === undefined) {
      console.log('[Error] instAssetBook2 is NOT defined');
      } else {console.log('[Good] instAssetBook2 is defined');}
    instAssetBook2.setProvider(provider);
    addrAssetBook2 = instAssetBook2.options.address;
    console.log('addrAssetBook2:', addrAssetBook2);

    
    //Deploying Registry contract...
    console.log('\nDeploying Registry contract...');
    const argsRegistry = [managementTeam];
    instRegistry =  await new web3.eth.Contract(Registry.abi)
    .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined) {
      console.log('[Error] instRegistry is NOT defined');
      } else {console.log('[Good] instRegistry is defined');}
    instRegistry.setProvider(provider);
    addrRegistry = instRegistry.options.address;
    console.log('addrRegistry:', addrRegistry);
    
    //Deploying TokenController contract...
    console.log('\nDeploying TokenController contract...');
    const argsTokenController = [
      TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, managementTeam ];
    instTokenController = await new web3.eth.Contract(TokenController.abi)
    .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('TokenController.sol has been deployed');
    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);
    addrTokenController = instTokenController.options.address;
    console.log('addrTokenController:', addrTokenController);

    //Deploying HCAT721 contract...
    /** https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, 201902150000,
    203903310000, 201901310000, "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a"
    */
    const tokenURI_bytes32 = web3.utils.fromAscii(tokenURI);
    const argsHCAT721 = [
    tokenName, tokenSymbol, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency, IRR20yrx100,
    addrRegistry, addrTokenController, tokenURI_bytes32];
    // string memory _tokenName, string memory _tokenSymbol, 
    // uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
    // string memory _pricingCurrency, uint _IRR20yrx100,
    // address _addrRegistryITF, address _addrTokenControllerITF
  
    console.log('\nDeploying HCAT721 contract...');
    instHCAT721 = await new web3.eth.Contract(HCAT721.abi)
    .deploy({ data: prefix+HCAT721.bytecode, arguments: argsHCAT721 })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('HCAT721.sol has been deployed');
    if (instHCAT721 === undefined) {
      console.log('[Error] instHCAT721 is NOT defined');
      } else {console.log('[Good] instHCAT721 is defined');}
    instHCAT721.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrHCAT721 = instHCAT721.options.address;
    console.log('addrHCAT721:', addrHCAT721);
    /**
    value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue
    value: web3.utils.toWei('10','ether')
    */

    console.log('\nDeploying CrowdFunding contract...');
    const argsCrowdFunding = [tokenSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD2, CFED2, timeCurrent, managementTeam];
    instCrowdFunding = await new web3.eth.Contract(CrowdFunding.abi)
      .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
      .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('CrowdFunding.sol has been deployed');
    if (instCrowdFunding === undefined) {
      console.log('[Error] instCrowdFunding is NOT defined');
      } else {console.log('[Good] instCrowdFunding is defined');}
    instCrowdFunding.setProvider(provider);
    addrCrowdFunding = instCrowdFunding.options.address;
    console.log('addrCrowdFunding:', addrCrowdFunding);


    //---------=IncomeManagerCtrt related contracts
    //addrPlatformCtrt -> platformSupervisor for now...
    const argsIncomeManagerCtrt =[addrHCAT721, platformSupervisor, managementTeam];
    instIncomeManagerCtrt = await new web3.eth.Contract(IncomeManagerCtrt.abi)
    .deploy({ data: IncomeManagerCtrt.bytecode, arguments: argsIncomeManagerCtrt })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('IncomeManagerCtrt.sol has been deployed');
    if (instIncomeManagerCtrt === undefined) {
      console.log('[Error] instIncomeManagerCtrt is NOT defined');
      } else {console.log('[Good] instIncomeManagerCtrt is defined');}
    instIncomeManagerCtrt.setProvider(provider);
    addrIncomeManagerCtrt = instIncomeManagerCtrt.options.address;
    console.log('addrIncomeManagerCtrt:', addrIncomeManagerCtrt);

  /*
    console.log('\nDeploying ArrayTesting contract...');
    instArrayUtils = await new web3.eth.Contract(ArrayTesting.abi)
     .deploy({ data: prefix+ArrayTesting.bytecode })
     .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
     console.log('ArrayTesting.sol has been deployed');
     if (instArrayUtils === undefined) {
       console.log('[Error] instArrayUtils is NOT defined');
       } else {console.log('[Good] instArrayUtils is defined');}
     instArrayUtils.setProvider(provider);
     addrArrayUtils = instArrayUtils.options.address;
     console.log('addrArrayUtils:', addrArrayUtils);
    
    
    instProductManager = await new web3.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode })
    .send({ from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      console.log('[Error] instProductManager is NOT defined');
      } else {console.log('[Good] instProductManager is defined');}
    instProductManager.setProvider(provider);
    addrProductManager = instProductManager.options.address;
    console.log('addrProductManager:', addrProductManager);
    */

    console.log('--------==BeforeEach is finished');
});

console.log('\n----------------==');
describe('Tests on HCAT721', () => {
  //this.timeout(2500);
  /*it('check HCAT721 deployment test', async () => {
    //!!!!!!!!! New contract instance for EVERY it() => Different contract addresses!!!
    //addrAsset = instAssetBook1.options.address;
    assert.ok(addrMultiSig1);
    assert.ok(addrMultiSig2);
    assert.ok(addrAssetBook1);
    assert.ok(addrAssetBook2);
    assert.ok(addrRegistry);
    assert.ok(addrTokenController);
    assert.ok(addrHCAT721);
    assert.ok(addrCrowdFunding);
    //assert.ok(addrIncomeManagerCtrt);

    //console.log('instHCAT721', instHCAT721);
    //test if the instanceCtrt has a property options, which has a property of address. Test if such value exists or is not undefined

    //console.log(instanceCtrt);
    //console.log(accounts);
  });*/

  // it('AssetBook contract test', async () => {
  //   console.log('addrAssetBook1', addrAssetBook1);
  // });

  it('AssetBook, Registry, HCAT721 functions test', async function() {
    this.timeout(9500);

    console.log('\n------------==Check deployment');
    assert.ok(addrPlatformCtrt);
    // assert.ok(addrMultiSig1);
    // assert.ok(addrMultiSig2);
    assert.ok(addrAssetBook1);
    assert.ok(addrAssetBook2);
    assert.ok(addrRegistry);
    assert.ok(addrTokenController);
    assert.ok(addrHCAT721);
    assert.ok(addrCrowdFunding);
    //assert.ok(addrPlatformSupervisorCtrt);
    console.log('Deployment Check: Good');

    let _assetAddr = addrHCAT721;
    if(false) {
      console.log('\n------------==Check MultiSig contract 1 & 2');
      console.log('addrMultiSig1', addrMultiSig1);
      console.log('addrMultiSig2', addrMultiSig2);
      let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
      assert.equal(assetOwnerM1, AssetOwner1);
      let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
      assert.equal(assetOwnerM2, AssetOwner2);

      console.log('\nCheck getPlatformContractAddr()');
      let platformM1 = await instMultiSig1.methods.getPlatformContractAddr().call();
      assert.equal(platformM1, addrPlatformCtrt);
      let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
      assert.equal(platformM2, addrPlatformCtrt);
    }

    console.log('\n------------==Check AssetBook contract 1 & 2');
    console.log('addrAssetBook1', addrAssetBook1);
    console.log('addrAssetBook2', addrAssetBook2);

    let assetAddr = addrHCAT721;
    console.log('here1')
    let assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('assetbook1', assetsMeasured1);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

    let assetsMeasured2 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('\nassetbook2', assetsMeasured2);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

    // return (AssetBook.assetSymbol, AssetBook.assetAddrIndex, 
    //   AssetBook.assetAmount, AssetBook.timeIndexStart, 
    //   AssetBook.timeIndexEnd, AssetBook.isInitialized);


    //----------------==Registry contract
    console.log('\n------------==Registry contract: add AssetBook contracts 1 & 2');
    console.log('addrRegistry', addrRegistry);
    uid1 = "A500000001"; assetCtAddr = addrAssetBook1; extoAddr = AssetOwner1;
    await instRegistry.methods.addUser(
      uid1, assetCtAddr, extoAddr)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('Registry: getUser()');
    let user1M = await instRegistry.methods.getUser(uid1).call();
    assert.equal(user1M[0], uid1);
    assert.equal(user1M[1], assetCtAddr);
    assert.equal(user1M[2], extoAddr);
    assert.equal(user1M[3], 0);
    console.log('user1M', user1M);

    uid2 = "A500000002"; assetCtAddr = addrAssetBook2; extoAddr = AssetOwner2;
    await instRegistry.methods.addUser(
      uid2, assetCtAddr, extoAddr)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    let user2M = await instRegistry.methods.getUser(uid2).call();
    assert.equal(user2M[0], uid2);
    assert.equal(user2M[1], assetCtAddr);
    assert.equal(user2M[2], extoAddr);
    assert.equal(user2M[3], 0);
    console.log('\nuser2M', user2M);



    //----------------==
    console.log('\n------------==Check HCAT721 parameters');
    console.log('addrHCAT721', addrHCAT721);

    // await instHCAT721.methods.set_admin(AssetOwner1, platformSupervisor).send({
    //   value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue
    // });//set_tokenDump(address _tokenDump, address vendor)

    let tokenContractDetails = await instHCAT721.methods.getTokenContractDetails().call();
    console.log('tokenContractDetails', tokenContractDetails);

    let nameM = await instHCAT721.methods.name().call();
    let symbolM = await instHCAT721.methods.symbol().call();
    let initialAssetPricingM = await instHCAT721.methods.initialAssetPricing().call();
    let IRR20yrx100M = await instHCAT721.methods.IRR20yrx100().call();
    let maxTotalSupplyM = await instHCAT721.methods.maxTotalSupply().call();
    let pricingCurrencyM = await instHCAT721.methods.pricingCurrency().call();
    let siteSizeInKWM = await instHCAT721.methods.siteSizeInKW().call();
    let tokenURI_M = await instHCAT721.methods.tokenURI().call();

    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(nameM, tokenName);
    assert.equal(symbolM, tokenSymbol);
    assert.equal(initialAssetPricingM, initialAssetPricing);
    assert.equal(IRR20yrx100M, IRR20yrx100);
    assert.equal(maxTotalSupplyM, maxTotalSupply);
    assert.equal(pricingCurrencyM, pricingCurrency);
    assert.equal(siteSizeInKWM, siteSizeInKW);
    assert.equal(tokenIdM, 0);
    console.log('tokenURI', tokenURI, 'tokenURI_M', web3.utils.toAscii(tokenURI_M));
    //assert.equal(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

    let isActiveOperational = await instTokenController.methods.isActiveOperational().call();
    assert.equal(isActiveOperational, false);


    let supportsInterface0x80ac58cd = await instHCAT721.methods.supportsInterface("0x80ac58cd").call();
    assert.equal(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instHCAT721.methods.supportsInterface("0x5b5e139f").call();
    assert.equal(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instHCAT721.methods.supportsInterface("0x780e9d63").call();
    assert.equal(supportsInterface0x780e9d63, true);


    //----------------==Setup Assetbook
    console.log('\n------------==Setup Assetbook 1 & 2');
    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 0);

    const uriBase = "https://heliumcryptic.com/nccu0";
    uriStr = uriBase+"1";
    console.log('uriStr', uriStr);

    uriBytes32 = web3.utils.fromAscii(uriStr);
    console.log('uriBytes32', uriBytes32);

    uriStrB = web3.utils.toAscii(uriBytes32);
    console.log('uriStrB', uriStrB);

    console.log('check1');

    //----------------==Mint Token One
    console.log('\n------------==Assetbook1');
    let _to, tokenIdTarget, accountM, balanceM, accountIdsAll, assetbookMX, serverTime;
    _to = addrAssetBook1; tokenIdTarget = 1; serverTime = timeCurrent;

    assetbookMX = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log(assetbookMX);

    // tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdTarget).call();
    // console.log('SPLC tokenId = '+tokenIdTarget, tokenOwnerM);
    // assert.equal(tokenOwnerM, _to);

    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('\nSPLC accountM', accountM);

    balanceM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('SPLC balanceM =', balanceM);

    accountIdsAll = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    console.log('SPLC accountIdsAll =', accountIdsAll);

    console.log('\n------------==Mint token');
    console.log('Start minting tokenId=1 via mintSerialNFT() to AssetBook1...');
    await instHCAT721.methods.mintSerialNFT(_to, tokenIdTarget, serverTime).send({
      value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('after minting tokenId =', tokenIdTarget);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('\nassetbook1 after minting:', assetbookXM);

    tokenIdM = await instHCAT721.methods.tokenId().call();
    console.log('check tokenId = ', tokenIdM);
    assert.equal(tokenIdM, tokenIdTarget);

    tokenOwnerM = await instHCAT721.methods.ownerOf(tokenIdTarget).call();
    console.log('SPLC tokenId = '+tokenIdTarget, tokenOwnerM);
    assert.equal(tokenOwnerM, _to);

    //HCAT721: check getAccountIds(owner, 0, 0), balanceOf(owner); getIdToAsset(tokenId)
    tokenInfo = await instHCAT721.methods.getIdToAsset(tokenIdTarget).call();
    console.log('SPLC getIdToAsset(): tokenId = '+tokenIdTarget+':', tokenInfo);
    assert.equal(tokenInfo, addrAssetBook1);

    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('\nSPLC accountM', accountM);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('HCAT721 tokenIds =', tokenIds, ', balanceXM =', balanceXM);


    //-----------------==Mint Token Batch
    console.log('\n------------==Mint Token in Batch: tokenId = 2, 3, 4 to AssetBook1');
    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 1);

    _to = addrAssetBook1; amount = 3; serverTime = timeCurrent;
    //let _tos = [_to, _to, _to];
    let _uriStrs = [uriBase+"2", uriBase+"3", uriBase+"4"];
    const strToBytes32 = str => web3.utils.fromAscii(str);
    let _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    console.log('\nmintSerialNFT()... amount =', amount);
    await instHCAT721.methods.mintSerialNFT(_to, amount, serverTime).send({
      value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    //function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 4);

    console.log('SPLC ownerOf(tokenId)...')
    tokenOwnerM = await instHCAT721.methods.ownerOf(2).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(3).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(4).call();
    assert.equal(tokenOwnerM, _to);

    tokenInfo = await instHCAT721.methods.getIdToAsset(2).call();
    console.log('\nHCAT721 tokenId = 2:', tokenInfo);
    assert.equal(tokenInfo, addrAssetBook1);

    console.log('\ngetToken: tokenId = 2, 3, 4');
    //assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[2]);
    tokenInfo = await instHCAT721.methods.getIdToAsset(3).call();
    console.log('\ntokenInfo from HCAT721 tokenId = 3:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(4).call();
    console.log('\ntokenInfo from HCAT721 tokenId = 4:', tokenInfo);

    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    //  symbol, uint balance, bool isInitialized
    console.log('\nassetbook1 getAsset():', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 4);

    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('\nHCAT721 tokenId=', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);


    //HCAT721: check accountIdsAll(owner), balanceOf(owner); getIdToAsset(tokenId)
    //-----------------==Mint Token Batch
    console.log('\n\n------------==Mint Token in Batch: tokenId = 5, 6, 7 to AssetBook2');
    _to = addrAssetBook2; amount = 3; serverTime = timeCurrent;
    //_tos = [_to, _to, _to];
    _uriStrs = [uriBase+"5", uriBase+"6", uriBase+"7"];
    _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);
    
    console.log('\nstart minting via mintSerialNFTBatch()');
    await instHCAT721.methods.mintSerialNFT(_to, amount, serverTime).send({
      value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 7);

    tokenOwnerM = await instHCAT721.methods.ownerOf(5).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(6).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(7).call();
    assert.equal(tokenOwnerM, _to);

    tokenInfo = await instHCAT721.methods.getIdToAsset(5).call();
    console.log('tokenInfo from HCAT721 tokenId = 5:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(6).call();
    console.log('tokenInfo from HCAT721 tokenId = 6:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(7).call();
    console.log('tokenInfo from HCAT721 tokenId = 7:', tokenInfo);


    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('\nassetbook2:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], amount);

    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);


    //-----------------==Check Token Controller: time
    console.log('\n------------==Check TokenController parameters: time');
    console.log('addrTokenController', addrTokenController);
    let owner = await instTokenController.methods.owner().call();
    let chairman = await instTokenController.methods.chairman().call();
    let director = await instTokenController.methods.director().call();
    let manager = await instTokenController.methods.manager().call();
    let admin = await instTokenController.methods.admin().call();

    assert.equal(owner, acc4);
    assert.equal(chairman, acc3);
    assert.equal(director, AssetOwner2);
    assert.equal(manager, AssetOwner1);
    assert.equal(admin, platformSupervisor);

    // owner = managementTeam[4];
    // chairman = managementTeam[3];
    // director = managementTeam[2];
    // manager = managementTeam[1];
    // admin = managementTeam[0];

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
    await instTokenController.methods.updateState(timeCurrent)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isActiveOperational().call();
    console.log('isActiveOperational()', bool1);
    assert.equal(bool1, false);

    //enum TokenState{underLockupPeriod, operational, expired}
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 0);

    let error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 17000;
      _fromAssetOwner = AssetOwner2; serverTime = timeCurrent;
      console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
      await instAssetBook2.methods.safeTransferFromBatch(_assetAddr, _to, amount, price, serverTime)
      .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);
      assert(err);
    }
    if (error) {assert(false);}



    //-------------------------==Send tokens
    console.log('\n----------------==Send token by one: amount = 1 from AssetBook2 to AssetBook1');
    timeCurrent = TimeTokenUnlock+1;
    await instTokenController.methods.updateState(timeCurrent)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isActiveOperational().call(); 
    console.log('isActiveOperational()', bool1);
    assert.equal(bool1, true);
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 1);

    _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 17000;
    _fromAssetOwner = AssetOwner2; serverTime = timeCurrent;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instAssetBook2.methods.safeTransferFromBatch(_assetAddr, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    //safeTransferFromBatch(address _assetAddr, uint amount, address _to, uint price) 

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('SPLC getAccount():', accountM);

    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 2);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 5);




    //------------------------==
    //-----------------==Check AssetBook2
    _from = addrAssetBook1; _to = addrAssetBook2; amount = 5; price = 17000;
    _fromAssetOwner = AssetOwner1; serverTime = timeCurrent;
    console.log('\n\n\n----------------==Send tokens in batch: amount =', amount, ' from AssetBook1 to AssetBook2');
    console.log('sending tokens via safeTransferFromBatch()...');

    await instAssetBook1.methods.safeTransferFromBatch(_assetAddr, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    //safeTransferFromBatch(_assetAddr, amount, _to, _timeCurrent)


    console.log('\n-----==after sending 5 tokens...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('AssetBook1:', assetbookXM);

    
    //-----------------==Check AssetBook2
    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('AssetBook2:', assetbookXM);



    console.log('\n----------------==Send token in batch: amount = 7 from AssetBook2 to AssetBook1');
    _from = addrAssetBook2; _to = addrAssetBook1; amount = 7; price = 19000;
    _fromAssetOwner = AssetOwner2; serverTime = timeCurrent;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instAssetBook2.methods.safeTransferFromBatch(_assetAddr, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 0);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 7);


    console.log('\n----------------==Send token in batch: amount = 7 from AssetBook1 to AssetBook2');
    _from = addrAssetBook1; _to = addrAssetBook2; amount = 7; price = 21000;
    _fromAssetOwner = AssetOwner1; serverTime = timeCurrent;
    console.log('AssetBook1 sending tokens via safeTransferFromBatch()...');
    await instAssetBook1.methods.safeTransferFromBatch(_assetAddr, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nCheck AssetBook1 after txn...');
    //for(i=0, i< amount, i++) {    }
    tokenInfo = await instHCAT721.methods.getIdToAsset(1).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(2).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(3).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(4).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(5).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(6).call();
    assert.equal(tokenInfo, _to);
    tokenInfo = await instHCAT721.methods.getIdToAsset(7).call();
    assert.equal(tokenInfo, _to);

    //console.log('SPLC getIdToAsset(): tokenId = '+tokenIdTarget+':', tokenInfo);
    // assert.equal(tokenInfo[1], initialAssetPricing);
    // assert.equal(tokenInfo[2], addrZero);

    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 0);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from AssetBook2 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 7);


    console.log('\n----------------==Approval Functions');
    _from = addrAssetBook2; _fromAssetOwner = AssetOwner2; amount = 3; 

    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, 0);

    console.log('\ntokenApprove()... amount =', amount);
    await instAssetBook2.methods.assetbookApprove(_assetAddr, operator, amount)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, amount);


    console.log('\n----------------==Send token in batch: amount = '+amount+'  from AssetBook2 to AssetBook1');
    _from = addrAssetBook2; _to = addrAssetBook1; amount = 3; price = 19000;
    _fromAssetOwner = AssetOwner2; serverTime = timeCurrent;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instHCAT721.methods.safeTransferFromBatch(_from, _to, amount, price, serverTime)
    .send({value: '0', from: operator, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 4);


    console.log('\nCheck AssetBook1 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('SPLC getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    assert.equal(assetbookXM[0], tokenSymbol);
    assert.equal(assetbookXM[1], 3);

    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, 0);


    //----------------==Send tokens with not enough allowance
    console.log('\n------------==Send tokens with not enough allowance');
    error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 3; price = 19000;
      _fromAssetOwner = AssetOwner2; serverTime = timeCurrent;
      await instHCAT721.methods.safeTransferFromBatch(_from, _to, 1, price, serverTime)
      .send({value: '0', from: operator, gas: gasLimitValue, gasPrice: gasPriceValue });

      error = true;
    } catch (err) {
      console.log('[Success] sending 1 token from addrAssetBook2 to addrAssetBook1 failed because of not enough allowance: ', result);
      assert(err);
    }
    if (error) {assert(false);}



    //----------------==Send tokens after valid time
    console.log('\n------------==Send tokens after valid date');
    timeCurrent = TimeTokenValid+1;
    await instTokenController.methods.updateState(timeCurrent)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isActiveOperational().call();
    console.log('isActiveOperational()', bool1);
    assert.equal(bool1, false);

    //enum TokenState{underLockupPeriod, operational, expired}
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 2);


    error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 17000;
      _fromAssetOwner = AssetOwner2;
      console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
      await instAssetBook2.methods.safeTransferFromBatch(_assetAddr, _to, amount, price)
      .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });

      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt2 to assetCtrt1 failed because of not meeting the condition: timeCurrent > TimeTokenValid', timeCurrent, TimeTokenValid);
      assert(err);
    }
    if (error) {assert(false);}


  });//.then(done)

});



//-----------------------------------------==
describe('Tests on ArrayTesting', () => {

  it('ArrayTesting functions test', async function() {
    console.log('\n------------==Check ArrayTesting parameters');
    let array1 = [ '1', '2', '3', '4', '5'];
    let array2 = [ '6', '7', '8'];

    let array, idxStart, idxEnd, amount;
    array = array1; idxStart = 0; idxEnd = 4; amount = 5;
    //sliceB(uint[] calldata array, uint idxStart, uint idxEnd, uint amount) 
    let arrayOut = await instArrayUtils.methods.sliceB(array, idxStart, idxEnd, amount).call();
    console.log('\narrayOut', arrayOut);

    // console.log('addrCrowdFunding', addrCrowdFunding);
  });
});



//--------------------------------==
describe('Tests on IncomeManagerCtrt', () => {
  
  it('IncomeManagerCtrt functions test', async function() {
    this.timeout(9500);
    console.log('\n------------==Check IncomeManagerCtrt parameters');
    let forecastedPayableTime, forecastedPayableAmount, _index, forecastedPayableTimes, forecastedPayableAmounts, result, _errorCode;

    _index = 1; forecastedPayableTime = 201905110000; forecastedPayableAmount = 3000;

    console.log('\n--------==Initial conditions');
    result = await instIncomeManagerCtrt.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, 0);

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', result);
    assert.equal(result[0], false);
    assert.equal(result[1], false);
    assert.equal(result[2], false);
    assert.equal(result[3], false);
    assert.equal(result[4], false);
    assert.equal(result[5], false);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);

    console.log('\n--------==Add a new pair of forecastedPayableTime, forecastedPayableAmount');
    await instIncomeManagerCtrt.methods.addSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nafter adding a new schedule...');
    result = await instIncomeManagerCtrt.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, 1);

    result = await instIncomeManagerCtrt.methods.getSchIndex(0, forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, 1);

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    console.log('\n--------==imApprove()');
    await instIncomeManagerCtrt.methods.imApprove(_index, true)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, true);


    console.log('\n--------==setPaymentReleaseResults');
    _paymentDate = forecastedPayableTime;
    _paymentAmount = forecastedPayableAmount;
    _errorCode = 0;
    await instIncomeManagerCtrt.methods.setPaymentReleaseResults(_index, _paymentDate, _paymentAmount, _errorCode)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    //-----------------------==add 1 more pair
    _index = 2; forecastedPayableTime = 201906110000; forecastedPayableAmount = 3300;

    await instIncomeManagerCtrt.methods.addSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==after adding a new schedule...');
    result = await instIncomeManagerCtrt.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, _index);

    result = await instIncomeManagerCtrt.methods.getSchIndex(_index, forecastedPayableTime).call();
    console.log('getSchIndex(_index, forecastedPayableTime):', result);
    assert.equal(result, _index);

    result = await instIncomeManagerCtrt.methods.getSchIndex(0, forecastedPayableTime).call();
    console.log('getSchIndex(0, forecastedPayableTime):', result);
    assert.equal(result, _index);

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);


    //-----------------------==add 3 more pairs
    console.log('\n--------==Add 3 more pairs of forecastedPayableTime, forecastedPayableAmount');
    //forecastedPayableTime = 201906110000;
    forecastedPayableTimes = [201908170000, 201911210000, 202002230000];
    forecastedPayableAmounts = [3700, 3800, 3900];

    result = await instIncomeManagerCtrt.methods.getSchIndex(0, forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, _index);

    result = await instIncomeManagerCtrt.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, 2);


    await instIncomeManagerCtrt.methods.AddScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, 5);

    for(i = 0; i < forecastedPayableTimes.length; i++) {
      _index = i+3;
      result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
      console.log('\ngetIncomeSchedule(index='+_index+'):', result);
      forecastedPayableTime = forecastedPayableTimes[i];
      forecastedPayableAmount = forecastedPayableAmounts[i];
      assert.equal(result[0], forecastedPayableTime);
      assert.equal(result[1], forecastedPayableAmounts[i]);
      assert.equal(result[2], 0);
      assert.equal(result[3], 0);
      assert.equal(result[4], false);
      assert.equal(result[5], 0);
      assert.equal(result[6], false);
      
      bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
      console.log('isScheduleGoodForRelease:', bool1);
      assert.equal(bool1, false);
  
    }


    console.log('\n--------==imApprove()');
    await instIncomeManagerCtrt.methods.imApprove(_index, true)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', _index, forecastedPayableTime, forecastedPayableAmount, result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, true);


    console.log('\n--------==setPaymentReleaseResults');
    _paymentDate = forecastedPayableTime;
    _paymentAmount = forecastedPayableAmount;
    _errorCode = 21;
    await instIncomeManagerCtrt.methods.setPaymentReleaseResults(_index, _paymentDate, _paymentAmount, _errorCode)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], _errorCode);
    assert.equal(result[6], false);

    bool1 = await instIncomeManagerCtrt.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    await instIncomeManagerCtrt.methods.setErrResolution(_index, true)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManagerCtrt.methods.getIncomeSchedule(_index).call(); 
    console.log('\n--------==setErrResolution()', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], _errorCode);
    assert.equal(result[6], true);


    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 0; amount = 0;
    let scheduleList = await instIncomeManagerCtrt.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);



    console.log('\n--------==editIncomeSchedule');
    _index = 2; forecastedPayableTime = 201906110222; forecastedPayableAmount = 4000;

    await instIncomeManagerCtrt.methods.editIncomeSchedule(_index, forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 1; amount = 0;
    scheduleList = await instIncomeManagerCtrt.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);


    console.log('\n--------==removeIncomeSchedule()');
    _index = 3; forecastedPayableTime = 201906110999;
    await instIncomeManagerCtrt.methods.removeIncomeSchedule(_index)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 1; amount = 0;
    scheduleList = await instIncomeManagerCtrt.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);



  });
});

// describe('Tests on DDD', () => {

//   it('DDD functions test', async function()  {
//     console.log('\n------------==Check DDD parameters');
//   });
// });



//-----------------------------------------==
describe('Tests on CrowdFunding', () => {

  it('CrowdFunding functions test', async function() {
    console.log('\n------------==Check CrowdFunding parameters');
    console.log('addrCrowdFunding', addrCrowdFunding);

    const CFSD2 = timeCurrent+1;
    //CFED2 = timeCurrent+10;
    console.log("timeCurrent", timeCurrent, ", CFSD2:", CFSD2, ", CFED2:", CFED2);
    // timeCurrent = 201902281040;
    /**
    const tokenSymbol = "NCCU1801";
    const maxTotalSupply = 773; 
    const initialAssetPricing = 17000;

    string public tokenSymbol; //專案erc721合約
    uint public initialAssetPricing; //每片太陽能板定價
    uint public maxTotalSupply; //專案總token數
    uint public quantityGoal; //專案達標數目
    uint public quantitySold; //累積賣出數目
    uint public CFSD2; //start date yyyymmddhhmm
    uint public CFED2; //截止日期 yyyymmddhhmm
    */
    let tokenSymbolM = await instCrowdFunding.methods.tokenSymbol().call();
    console.log('\ntokenSymbolM', tokenSymbolM);
    assert.equal(tokenSymbolM, tokenSymbol);

    console.log('initialAssetPricing', initialAssetPricing);
    let initialAssetPricingM = await instCrowdFunding.methods.initialAssetPricing().call();
    console.log('initialAssetPricingM', initialAssetPricingM);
    assert.equal(initialAssetPricingM, initialAssetPricing);

    console.log('maxTotalSupply', maxTotalSupply);
    let maxTotalSupplyM = await instCrowdFunding.methods.maxTotalSupply().call();
    console.log('maxTotalSupplyM', maxTotalSupplyM);
    assert.equal(maxTotalSupplyM, maxTotalSupply);

    console.log('quantityGoal', quantityGoal);
    let quantityGoalM = await instCrowdFunding.methods.quantityGoal().call();
    console.log('quantityGoalM', quantityGoalM);
    assert.equal(quantityGoalM, quantityGoal);

    let CFSD2M = await instCrowdFunding.methods.CFSD2().call();
    console.log('CFSD2M', CFSD2M);
    assert.equal(CFSD2M, CFSD2);

    let CFED2M = await instCrowdFunding.methods.CFED2().call();
    console.log('CFED2M', CFED2M);
    assert.equal(CFED2M, CFED2);


    //-------------------==
    console.log('\nFundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, aborted}');
    serverTime = CFSD2-1;
    console.log('set servertime = CFSD2-1', serverTime);
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    let stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('\nstateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: not started yet");

    let fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 0);

    //-------------------==
    serverTime = CFSD2;
    console.log('\nset serverTime = CFSD2', CFSD2);
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "funding: with goal not reached yet");

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 1);

    if (1==2){
      serverTime = CFED2;
      console.log('\nset serverTime = CFED2', CFED2);
      await instCrowdFunding.methods.updateState(serverTime)
      .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
  
      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "fundingNotClosed: ended with goal not reached");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 5);
      //process.exit(1);
    }

    /**
    const tokenSymbol = "NCCU1801";
    const maxTotalSupply = 773; 
    const initialAssetPricing = 17000;
    */
    serverTime = CFSD2+1;
    console.log('\nset serverTime = CFSD2+1', serverTime, '\nmakeFundingAction(), invest()');
    await instCrowdFunding.methods.makeFundingActive(serverTime)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

    remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('\nremainingTokenQtyM:', remainingTokenQtyM);
    assert.equal(remainingTokenQtyM, maxTotalSupply);
    let quantitySoldM = await instCrowdFunding.methods.quantitySold().call();

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
      await instCrowdFunding.methods.invest(addrAssetBook1, maxTokenQtyForEachInvestmentFund, serverTime).send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
      console.log('invest()... take ', i);
    }
    remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('remainingTokenQtyM:', remainingTokenQtyM, ' V.s. modResult:', modResult, '... maxTotalSupply', maxTotalSupply, ', quantityGoal', quantityGoal, 'quantitySoldM', quantitySoldM);
    assert.equal(remainingTokenQtyM, modResult+maxTotalSupply-quantityGoal);

    await instCrowdFunding.methods.invest(addrAssetBook1, modResult, serverTime).send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('invest(modResult=', modResult, ')');
    quantitySoldM = await instCrowdFunding.methods.quantitySold().call();
    console.log('quantitySoldM:', quantitySoldM, 'V.s. quantityGoal:', quantityGoal);

    console.log('after investing the target goal amount');
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "fundingGoalReached: still funding and has reached goal");

    

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 3);


    //------------------==Set time to initial
    console.log('\nset serverTime = CFSD2-1');
    serverTime = CFSD2-1;
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: goal reached already");

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 0);

    //------------------==Back to CFSD2
    serverTime = CFSD2;
    console.log('\nset serverTime = CFSD2');
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

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
      await instCrowdFunding.methods.invest(addrAssetBook1, quantityAvailable+1, serverTime).send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] over-buying failed because of not enough quantity for sales. quantityAvailable:', quantityAvailable);
      assert(err);
    }
    if (error) {assert(false);}

    if(1==1){
      //-------------------==Pause the crowdfunding
      serverTime = CFSD2+3;
      console.log('\nPause funding');
      await instCrowdFunding.methods.pauseFunding(serverTime)
      .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "funding paused");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 2);

      //-------------------==resumeFunding the crowdfunding
      serverTime = CFSD2+3;
      console.log('\nResume funding');
      await instCrowdFunding.methods.resumeFunding(CFED2, maxTotalSupply, serverTime)
      .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      //assert.equal(stateDescriptionM, "funding paused");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      //assert.equal(fundingStateM, 2);
      console.log('check stateDescriptionM and fundingStateM!!!');

      if(1==2) {
        reason = 'a good reason...';
        console.log('\nAbort');
        await instCrowdFunding.methods.abort(reason, serverTime)
        .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });
  
        stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
        console.log('stateDescriptionM', stateDescriptionM);
        assert.equal(stateDescriptionM, "aborted:"+reason);
  
        fundingStateM = await instCrowdFunding.methods.fundingState().call();
        console.log('fundingStateM', fundingStateM);
        assert.equal(fundingStateM, 6);
        console.log('check stateDescriptionM and fundingStateM!!!');

      } else {
        //-------------------==Buying the available quantity
        console.log('\nTrying to invest quantityAvailable');
        await instCrowdFunding.methods.invest(addrAssetBook1, quantityAvailable, serverTime)
        .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

        stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
        console.log('stateDescriptionM', stateDescriptionM);
        assert.equal(stateDescriptionM, "fundingClosed: sold out");

        fundingStateM = await instCrowdFunding.methods.fundingState().call();
        console.log('fundingStateM', fundingStateM);
        assert.equal(fundingStateM, 4);
      }
      
    } else {
      //-------------------==CFED2 has been reached
      console.log('\nCFED2 has been reached');
      serverTime = CFED2;
      await instCrowdFunding.methods.updateState(serverTime)
      .send({ value: '0', from: platformSupervisor, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "fundingClosed: ended with unsold items");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 4);
    }


    //------------------==
    /*
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