/**
$ yarn global add mocha
$ yarn run testhcat
$ yarn run testcf
$ yarn run testim
$ yarn run testpm
*/
console.log('process.argv', process.argv, process.argv[3]);
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

let provider, web3, gasLimitValue, gasPriceValue, prefix = '', tokenIds, assetbookXM, balanceXM;
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

const Helium = require('../ethereum/contracts/build/Helium.json');
if (Helium === undefined){
  console.log('[Error] Helium is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Helium is defined');
  if (Helium.abi === undefined){
    console.log('[Error] Helium.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.abi is defined');
      //console.log('Helium.abi:', Helium.abi);
  }
  if (Helium.bytecode === undefined || Helium.bytecode.length < 10){
    console.log('[Error] Helium.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.bytecode is defined');
      //console.log('Helium.bytecode:', Helium.bytecode);
  }
  //console.log(Helium);
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
let instHelium, addrHeliumCtrt;
let instRegistry, addrRegistry;
let instTokenController, addrTokenController;
let instHCAT721, addrHCAT721;
let instCrowdFunding, addrCrowdFunding;
let instIncomeManager, addrIncomeManagerCtrt;
let instProductManager, addrProductManager;

let accounts, error, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, platformSupervisor, operator;
let amount, balancePlatformSupervisor = 0, balanceAO1 = 0, balanceAO2 = 0;
let _to, price, accountM, balanceM, accountIdsAll, assetbookMX, serverTime;

const addrZero = "0x0000000000000000000000000000000000000000";
let argsAssetBook1, argsAssetBook2, argsAssetBook3;
let instAssetBook1, instAssetBook2, instAssetBook3;
let addrAssetBook1, addrAssetBook2, addrAssetBook3;

// const { TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid, CFSD, CFED } = require('../ethereum/contracts/zTestParameters');
//const { checkAssetbook } = require('../timeserver/blockchain');

TimeOfDeployment_CF = 201905281410;
CFSD = TimeOfDeployment_CF+10;
CFED = TimeOfDeployment_CF+15;
TimeOfDeployment_TokCtrl = TimeOfDeployment_CF + 20;
TimeOfDeployment_HCAT = TimeOfDeployment_CF + 21;
TimeOfDeployment_IM = TimeOfDeployment_CF + 22;
TimeTokenUnlock = TimeOfDeployment_CF+30; 
TimeTokenValid =  TimeOfDeployment_CF+90;

const tokenName = "NCCU site No.1(2018)";
const tokenSymbol = "NCCU1801";
const siteSizeInKW = 300;
const maxTotalSupply = 773;
const quantityGoal = 752;//const _goalInPercentage = 0.97;
const initialAssetPricing = 15000;
const pricingCurrency = "NTD";
const IRR20yrx100 = 470;
const tokenURI = tokenSymbol+"/uri";

const tokenName_bytes32 = web3.utils.fromAscii(tokenName);
const tokenSymbol_bytes32 = web3.utils.fromAscii(tokenSymbol);
const pricingCurrency_bytes32 = web3.utils.fromAscii(pricingCurrency);
const tokenURI_bytes32 = web3.utils.fromAscii(tokenURI);


let reason, uid, authLevel, assetbookAddr;
let admin, chairman, director, manager, owner, isSenderAllowed;
let adminM, chairmanM, directorM, managerM, ownerM;

let tokenId, _from, uriStr, uriBytes32, uriStrB;
let tokenOwnerM, tokenControllerDetail, TimeAtDeploymentM, ownerCindexM
let TimeOfDeploymentM, TimeTokenUnlockM, TimeTokenValidM, bool1;

let tokenContractDetails, tokenNameM_b32, tokenNameM, tokenSymbolM_b32, tokenSymbolM, initialAssetPricingM, IRR20yrx100M, maxTotalSupplyM, pricingCurrencyM, siteSizeInKWM, tokenURI_M;
let result1, boolArray, uintArray;


beforeEach( async function() {
    this.timeout(9500);
    console.log('\n-------------==New beforeEach cycle');
    accounts = await web3.eth.getAccounts();
    admin = accounts[0];
    AssetOwner1 = accounts[1];
    AssetOwner2 = accounts[2];
    AssetOwner3 = accounts[3];
    AssetOwner4 = accounts[4];
    AssetOwner5 = accounts[5];

    platformSupervisor = accounts[3];
    operator = accounts[4];

    chairman = AssetOwner1;
    director = AssetOwner2;
    manager  = platformSupervisor;
    owner = operator;

    managementTeam = [admin, chairman, director, manager, owner];
    console.log('admin', admin);
    console.log('AssetOwner1', AssetOwner1);
    console.log('AssetOwner2', AssetOwner2);
    console.log('platformSupervisor', platformSupervisor);
    console.log('operator', operator);
    console.log('managementTeam', managementTeam);

    if (2===1) {
        balancePlatformSupervisor = await web3.eth.getBalance(platformSupervisor);//returns strings!
        balanceAO1 = await web3.eth.getBalance(AssetOwner1);//returns strings!
        balanceAO2 = await web3.eth.getBalance(AssetOwner2);//returns strings!
        console.log('platformSupervisor',  platformSupervisor, balancePlatformSupervisor);//100,00000000,0000000000
        console.log('AssetOwner1',  AssetOwner1, balanceAO1);
        console.log('AssetOwner2',  AssetOwner2, balanceAO2);
    }
    

    console.log('\nDeploying Helium contract...');
    //JSON.parse() is not needed because the abi and bytecode are already objects
    console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);
    const argsHelium = [managementTeam];
    console.log('\nDeploying Helium contract...');
    instHelium =  await new web3.eth.Contract(Helium.abi)
    .deploy({ data: prefix+Helium.bytecode, arguments: argsHelium })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('Helium.sol has been deployed');
    if (instHelium === undefined) {
      console.log('[Error] instHelium is NOT defined');
      } else {console.log('[Good] instHelium is defined');}
    instHelium.setProvider(provider);
    addrHeliumCtrt = instHelium.options.address;
    console.log('addrHeliumCtrt:', addrHeliumCtrt);


    argsAssetBook1 = [ AssetOwner1, addrHeliumCtrt];
    argsAssetBook2 = [ AssetOwner2, addrHeliumCtrt];
    argsAssetBook3 = [ AssetOwner3, addrHeliumCtrt];

    //Deploying AssetBook contract... 
    console.log('\nDeploying AssetBook contracts...');
    instAssetBook1 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook1 })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
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
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook2 === undefined) {
      console.log('[Error] instAssetBook2 is NOT defined');
      } else {console.log('[Good] instAssetBook2 is defined');}
    instAssetBook2.setProvider(provider);
    addrAssetBook2 = instAssetBook2.options.address;
    console.log('addrAssetBook2:', addrAssetBook2);

    instAssetBook3 =  await new web3.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBook3 })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    //.then(console.log);
    console.log('AssetBook.sol has been deployed');
    if (instAssetBook3 === undefined) {
      console.log('[Error] instAssetBook3 is NOT defined');
      } else {console.log('[Good] instAssetBook3 is defined');}
    instAssetBook3.setProvider(provider);
    addrAssetBook3 = instAssetBook3.options.address;
    console.log('addrAssetBook3:', addrAssetBook3);

    //Deploying Registry contract...
    console.log('\nDeploying Registry contract...');
    const argsRegistry = [addrHeliumCtrt];
    instRegistry =  await new web3.eth.Contract(Registry.abi)
    .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
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
      TimeOfDeployment_TokCtrl, TimeTokenUnlock, TimeTokenValid, addrHeliumCtrt ];
    instTokenController = await new web3.eth.Contract(TokenController.abi)
    .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('TokenController.sol has been deployed');
    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);
    addrTokenController = instTokenController.options.address;
    console.log('addrTokenController:', addrTokenController);

    const argsHCAT721 = [
    tokenName_bytes32, tokenSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
    addrRegistry, addrTokenController, tokenURI_bytes32, addrHeliumCtrt, TimeOfDeployment_HCAT];
    console.log('\nDeploying HCAT721 contract...');
    instHCAT721 = await new web3.eth.Contract(HCAT721.abi)
    .deploy({ data: prefix+HCAT721.bytecode, arguments: argsHCAT721 })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('HCAT721.sol has been deployed');
    if (instHCAT721 === undefined) {
      console.log('[Error] instHCAT721 is NOT defined');
      } else {console.log('[Good] instHCAT721 is defined');}
    instHCAT721.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrHCAT721 = instHCAT721.options.address;
    console.log('addrHCAT721:', addrHCAT721);

    console.log('\nDeploying CrowdFunding contract...');
    const argsCrowdFunding = [tokenSymbol_bytes32, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD, CFED, TimeOfDeployment_CF, addrHeliumCtrt];
    instCrowdFunding = await new web3.eth.Contract(CrowdFunding.abi)
      .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('CrowdFunding.sol has been deployed');
    if (instCrowdFunding === undefined) {
      console.log('[Error] instCrowdFunding is NOT defined');
      } else {console.log('[Good] instCrowdFunding is defined');}
    instCrowdFunding.setProvider(provider);
    addrCrowdFunding = instCrowdFunding.options.address;
    console.log('addrCrowdFunding:', addrCrowdFunding);


    //---------=IncomeManagerCtrt related contracts
    console.log('\nDeploying IncomeManager contract...');
    const argsIncomeManagerCtrt =[addrHCAT721, addrHeliumCtrt, TimeOfDeployment_IM];
    instIncomeManager = await new web3.eth.Contract(IncomeManagerCtrt.abi)
    .deploy({ data: IncomeManagerCtrt.bytecode, arguments: argsIncomeManagerCtrt })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('\nIncomeManagerCtrt.sol has been deployed');
    if (instIncomeManager === undefined) {
      console.log('[Error] instIncomeManager is NOT defined');
      } else {console.log('[Good] instIncomeManager is defined');}
    instIncomeManager.setProvider(provider);
    addrIncomeManagerCtrt = instIncomeManager.options.address;
    console.log('addrIncomeManagerCtrt:', addrIncomeManagerCtrt);

    console.log('--------==BeforeEach is finished');
});


console.log('\n----------------==');
describe('Tests on HCAT721Ctrt', () => {
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

  it('AssetBook, Registry, HCAT721 functions test', async function() {
    this.timeout(19500);

    const checkAssetbook = async(addrAssetbookX) => {
      return new Promise( async ( resolve, reject ) => {
        console.log('-----------==inside checkAssetbook()');
        try{
          const instAssetbook = new web3.eth.Contract(AssetBook.abi, addrAssetbookX);
          const assetOwnerM = await instAssetbook.methods.assetOwner().call();
          const lastLoginTimeM = await instAssetbook.methods.lastLoginTime().call();
          const assetCindexM = await instAssetbook.methods.assetCindex().call();
          console.log(`checkAssetbook()... assetOwnerM: ${assetOwnerM}
          lastLoginTimeM: ${lastLoginTimeM}, assetCindexM: ${assetCindexM}`);
          resolve([true, assetOwnerM, lastLoginTimeM, assetCindexM]);
        } catch(err) {
          console.log(`[Error] checkAssetbook() failed at addrAssetbookX: ${err} ${addrAssetbookX} <===================================`);
          resolve([false, undefined, undefined, undefined]);
        }
      });
    }
    const result001 = await checkAssetbook(addrAssetBook1);
    console.log(`--------------== ${result001}`);
    //process.exit(0);

    console.log('\n------------==Check deployment');
    assert.ok(addrHeliumCtrt);
    // assert.ok(addrMultiSig1);
    // assert.ok(addrMultiSig2);
    assert.ok(addrAssetBook1);
    assert.ok(addrAssetBook2);
    assert.ok(addrRegistry);
    assert.ok(addrTokenController);
    assert.ok(addrHCAT721);
    assert.ok(addrCrowdFunding);
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
      assert.equal(platformM1, addrHeliumCtrt);
      let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
      assert.equal(platformM2, addrHeliumCtrt);
    }

    console.log('\n------------==Check Helium contract');
    adminM = await instHelium.methods.Helium_Admin().call();
    assert.equal(adminM, admin);
    console.log('check1')

    chairmanM = await instHelium.methods.Helium_Chairman().call();
    assert.equal(chairmanM, chairman);

    directorM = await instHelium.methods.Helium_Director().call();
    assert.equal(directorM, director);

    managerM = await instHelium.methods.Helium_Manager().call();
    assert.equal(managerM, manager);

    ownerM = await instHelium.methods.Helium_Owner().call();
    assert.equal(ownerM, owner);
    console.log('Helium contract all checked good');


    console.log('\n------------==Check AssetBook contract 1 & 2');
    console.log('addrAssetBook1', addrAssetBook1);
    console.log('addrAssetBook2', addrAssetBook2);

    let assetAddr = addrHCAT721;
    console.log('here573')
    let assetsMeasured1 = await instAssetBook1.methods.getAsset(0, assetAddr).call();
    console.log('assetbook1', assetsMeasured1);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);

    let assetsMeasured2 = await instAssetBook2.methods.getAsset(0, assetAddr).call();
    console.log('\nassetbook2', assetsMeasured2);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);


    //----------------==Registry contract
    console.log('\n------------==Registry contract: add AssetBook 1, 2, 3');
    console.log('addrRegistry', addrRegistry);
    uid = "A500000001"; assetbookAddr = addrAssetBook1; authLevel = 5;
    await instRegistry.methods.addUser(uid, assetbookAddr, authLevel)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('Registry: getUserFromUid()');
    let user1M = await instRegistry.methods.getUserFromUid(uid).call();
    console.log('user1M', user1M);
    assert.equal(user1M[0], assetbookAddr);
    assert.equal(user1M[1], authLevel);

    uid = "A500000002"; assetbookAddr = addrAssetBook2; authLevel = 5;
    await instRegistry.methods.addUser(uid, assetbookAddr, authLevel)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    let user2M = await instRegistry.methods.getUserFromUid(uid).call();
    console.log('\nuser2M', user2M);
    assert.equal(user2M[0], assetbookAddr);
    assert.equal(user2M[1], authLevel);

    uid = "A500000003"; assetbookAddr = addrAssetBook3; authLevel = 5;
    await instRegistry.methods.addUser(uid, assetbookAddr, authLevel)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('Registry: getUserFromUid()');
    let user3M = await instRegistry.methods.getUserFromUid(uid).call();
    console.log('user3M', user3M);
    assert.equal(user3M[0], assetbookAddr);
    assert.equal(user3M[1], authLevel);

    //----------------==
    console.log('\n------------==Check HCAT721 parameters');
    console.log('addrHCAT721', addrHCAT721);


    tokenContractDetails = await instHCAT721.methods.getTokenContractDetails().call();
    console.log('tokenContractDetails', tokenContractDetails);

    tokenNameM_b32 = await instHCAT721.methods.name().call();
    tokenNameM = web3.utils.toAscii(tokenNameM_b32);
    tokenSymbolM_b32 = await instHCAT721.methods.symbol().call();
    tokenSymbolM = web3.utils.toAscii(tokenSymbolM_b32);
    initialAssetPricingM = await instHCAT721.methods.initialAssetPricing().call();
    IRR20yrx100M = await instHCAT721.methods.IRR20yrx100().call();
    maxTotalSupplyM = await instHCAT721.methods.maxTotalSupply().call();
    pricingCurrencyM = await instHCAT721.methods.pricingCurrency().call();
    siteSizeInKWM = await instHCAT721.methods.siteSizeInKW().call();
    tokenURI_M = await instHCAT721.methods.tokenURI().call();

    tokenIdM = await instHCAT721.methods.tokenId().call();
    //assert.equal(tokenNameM_b32, tokenName_bytes32);
    //assert.equal(tokenSymbolM_b32, tokenSymbol_bytes32);
    console.log("\nCheck tokenName", tokenNameM, tokenName, "\ntokenSymbol", tokenSymbolM, tokenSymbol, "pricingCurrency", web3.utils.toAscii(pricingCurrencyM), pricingCurrency);
    assert.equal(initialAssetPricingM, initialAssetPricing);
    assert.equal(IRR20yrx100M, IRR20yrx100);
    assert.equal(maxTotalSupplyM, maxTotalSupply);
    //assert.equal(pricingCurrencyM, pricingCurrency);
    assert.equal(siteSizeInKWM, siteSizeInKW);
    assert.equal(tokenIdM, 0);
    console.log('tokenURI', web3.utils.toAscii(tokenURI_M), tokenURI);
    //assert.equal(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

    let isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
    assert.equal(isTokenApprovedOperational, false);


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
    _to = addrAssetBook1; amount = 1; serverTime = TimeTokenUnlock-1
    price = 15000; fundingType = 1;//PO: 1, PP: 2
    tokenId = amount;

    assetbookMX = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log(assetbookMX);


    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('\nHCAT accountM', accountM);

    balanceM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('HCAT balanceM =', balanceM);

    accountIdsAll = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    console.log('HCAT accountIdsAll =', accountIdsAll);

    result1 = await instHCAT721.methods.checkMintSerialNFT(_to, amount, price, fundingType, serverTime).call();
    console.log('result of checkMintSerialNFT()', result1);
    //process.exit(0);

    console.log('\n------------==Mint token');
    console.log('Start minting tokenId = 1 via mintSerialNFT() to AssetBook1...');
    await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('after minting tokenId =', tokenId);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('\nassetbook1 after minting:', assetbookXM);

    tokenIdM = await instHCAT721.methods.tokenId().call();
    console.log('check tokenId = ', tokenIdM);
    assert.equal(tokenIdM, tokenId);

    tokenOwnerM = await instHCAT721.methods.ownerOf(tokenId).call();
    console.log('HCAT tokenId = '+tokenId, tokenOwnerM);
    assert.equal(tokenOwnerM, _to);

    //HCAT721: check getAccountIds(owner, 0, 0), balanceOf(owner); getIdToAsset(tokenId)
    tokenInfo = await instHCAT721.methods.getIdToAsset(tokenId).call();
    console.log('HCAT getIdToAsset(): tokenId = '+tokenId+':', tokenInfo);
    assert.equal(tokenInfo, addrAssetBook1);

    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('\nHCAT accountM', accountM);
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('HCAT721 tokenIds =', tokenIds, ', balanceXM =', balanceXM);

    ownerCindexM = await instHCAT721.methods.ownerCindex().call();
    console.log('\nownerCindexM', ownerCindexM);
    assert.equal(ownerCindexM, '1');

    isOwnerAdded = await instHCAT721.methods.isOwnerAdded(_to).call();
    console.log('\nisOwnerAdded', isOwnerAdded);
    assert.equal(isOwnerAdded, true);

    idxToOwnerM = await instHCAT721.methods.idxToOwner(1).call();
    console.log('\nidxToOwnerM', idxToOwnerM);
    assert.equal(idxToOwnerM, _to);


    //-----------------==Mint Token Batch
    console.log('\n------------==Mint Token in Batch: tokenId = 2, 3, 4 to AssetBook1');
    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 1);

    _to = addrAssetBook1; amount = 3; serverTime = TimeTokenUnlock-1
    //let _tos = [_to, _to, _to];
    let _uriStrs = [uriBase+"2", uriBase+"3", uriBase+"4"];
    const strToBytes32 = str => web3.utils.fromAscii(str);
    let _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    console.log('\nmintSerialNFT()... amount =', amount);
    await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({
      value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    //function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 4);

    console.log('HCAT ownerOf(tokenId)...')
    tokenOwnerM = await instHCAT721.methods.ownerOf(2).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(3).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(4).call();
    assert.equal(tokenOwnerM, _to);

    tokenInfo = await instHCAT721.methods.getIdToAsset(2).call();
    console.log('\nHCAT721: getIdToAsset() of tokenId = 2:', tokenInfo);
    assert.equal(tokenInfo, addrAssetBook1);

    console.log('\ngetToken: tokenId = 2, 3, 4');
    //assert.equal(web3.utils.toAscii(tokenInfo[3]), _uriStrs[2]);
    tokenInfo = await instHCAT721.methods.getIdToAsset(3).call();
    console.log('\nHCAT721: getIdToAsset() of tokenId = 3:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(4).call();
    console.log('\nHCAT721: getIdToAsset() of tokenId = 4:', tokenInfo);

    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    //symbol, uint balance, bool isInitialized
    console.log('\nassetbook1 getAsset():', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 4);

    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
    console.log('\nHCAT721 tokenId=', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);

    ownerCindexM = await instHCAT721.methods.ownerCindex().call();
    console.log('\nownerCindexM', ownerCindexM);
    assert.equal(ownerCindexM, '1');

    isOwnerAdded = await instHCAT721.methods.isOwnerAdded(_to).call();
    console.log('\nisOwnerAdded', isOwnerAdded);
    assert.equal(isOwnerAdded, true);

    idxToOwnerM = await instHCAT721.methods.idxToOwner(1).call();
    console.log('\nidxToOwnerM', idxToOwnerM);
    assert.equal(idxToOwnerM, _to);

    //HCAT721: check accountIdsAll(owner), balanceOf(owner); getIdToAsset(tokenId)
    //-----------------==Mint Token Batch
    console.log('\n\n------------==Mint Token in Batch: tokenId = 5, 6, 7 to AssetBook2');
    _to = addrAssetBook2; amount = 3; serverTime = TimeTokenUnlock-1
    //_tos = [_to, _to, _to];
    _uriStrs = [uriBase+"5", uriBase+"6", uriBase+"7"];
    _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);
    
    console.log('\nstart minting via mintSerialNFTBatch()');
    await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({
      value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdM = await instHCAT721.methods.tokenId().call();
    assert.equal(tokenIdM, 7);

    tokenOwnerM = await instHCAT721.methods.ownerOf(5).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(6).call();
    assert.equal(tokenOwnerM, _to);
    tokenOwnerM = await instHCAT721.methods.ownerOf(7).call();
    assert.equal(tokenOwnerM, _to);

    tokenInfo = await instHCAT721.methods.getIdToAsset(5).call();
    console.log('HCAT721: getIdToAsset() of tokenId = 5:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(6).call();
    console.log('HCAT721: getIdToAsset() of tokenId = 6:', tokenInfo);

    tokenInfo = await instHCAT721.methods.getIdToAsset(7).call();
    console.log('HCAT721: getIdToAsset() of tokenId = 7:', tokenInfo);


    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('\nassetbook2:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], amount);

    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook2, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook2).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);

    ownerCindexM = await instHCAT721.methods.ownerCindex().call();
    console.log('\nownerCindexM', ownerCindexM);
    assert.equal(ownerCindexM, '2');

    isOwnerAdded = await instHCAT721.methods.isOwnerAdded(_to).call();
    console.log('\nisOwnerAdded', isOwnerAdded);
    assert.equal(isOwnerAdded, true);

    idxToOwnerM = await instHCAT721.methods.idxToOwner(2).call();
    console.log('\nidxToOwnerM', idxToOwnerM);
    assert.equal(idxToOwnerM, _to);

    const ownerAddrsM1 = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
    console.log('\nownerAddrsM1', ownerAddrsM1);
    assert.equal(ownerAddrsM1.length, 2);
    assert.equal(ownerAddrsM1[0], addrAssetBook1);
    assert.equal(ownerAddrsM1[1], addrAssetBook2);



    //-----------------==Check if STO Compliance for buyAmount: addrAssetBook3
    console.log('\n------------==Check if STO Compliance for buyAmount: addrAssetBook3');
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook3).call();
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook3, 0, 0).call();
    let totalAssetBalance = initialAssetPricing * balanceXM;
    console.log(`HCAT721 tokenId = ${tokenIds}, balanceXM = ${balanceXM}
initialAssetPricing: ${initialAssetPricing}, total asset balance: ${totalAssetBalance}`);

    error = false;
    _to = addrAssetBook3; amount = 21; serverTime = TimeTokenUnlock-1;
    price = initialAssetPricing;  fundingType = 1; //PO: 1, PP: 2
    console.log(`mintSerialNFT()... to = addrAssetBook3
    amount: ${amount}, price: ${price}, fundingType: ${fundingType}, serverTime: ${serverTime}`);

    result1 = await instHCAT721.methods.checkMintSerialNFT(_to, amount, price, fundingType, serverTime).call();
    console.log(result1);
    boolArray = result1[0];
    uintArray = result1[1];
    //console.log('boolArray', boolArray);
  
    console.log(`to.isContract(): ${boolArray[0]}, is ctrt@to compatible: ${boolArray[1]}
    is amount > 0: ${boolArray[2]}, is price > 0: ${boolArray[3]}
    is fundingType > 0: ${boolArray[4]}, is serverTime > 201905240900: ${boolArray[5]}
    is tokenId.add(amount) <= maxTotalSupply: ${boolArray[6]}
    is msg.sender platformSupervisor: ${boolArray[7]}
    isOkBuyAmount: ${boolArray[8]}, isOkBalanceNew: ${boolArray[9]}
    authLevel: ${uintArray[0]}, maxBuyAmount: ${uintArray[1]}, maxBalance: ${uintArray[2]}
    `);

    try {
      await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({
        value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

      error = true;
    } catch (err) {
      console.log('[Success] STO Compliance for buyAmount of assetbook1. failed because of buyAmount has exceeded maximum restricted value. err:', err.toString().substr(0, 120));
      assert(err);
    }
    if (error) {assert(false);}


    amount = 20;
    await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({
    value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    
    tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook3, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook3).call();
    totalAssetBalance = initialAssetPricing * balanceXM;
    console.log(`\nHCAT721 tokenId = ${tokenIds}, balanceXM = ${balanceXM}
initialAssetPricing: ${initialAssetPricing}, total asset balance: ${totalAssetBalance}
[Success] minting 20 tokens to assetbook3 with maximum allowed buyAmount`);

    //-----------------==Check if STO Compliance for balance
    console.log('\n------------==Check if STO Compliance for balance: addrAssetBook3');

    error = false;
    amount = 1;
    console.log(`mintSerialNFT()... to = addrAssetBook3
    amount: ${amount}, price: ${price}, fundingType: ${fundingType}, serverTime: ${serverTime}`);

    result1 = await instHCAT721.methods.checkMintSerialNFT(_to, amount, price, fundingType, serverTime).call();
    console.log(result1);
    boolArray = result1[0];
    uintArray = result1[1];
    //console.log('boolArray', boolArray);
  
    console.log(`to.isContract(): ${boolArray[0]}, is ctrt@to compatible: ${boolArray[1]}
    is amount > 0: ${boolArray[2]}, is price > 0: ${boolArray[3]}
    is fundingType > 0: ${boolArray[4]}, is serverTime > 201905240900: ${boolArray[5]}
    is tokenId.add(amount) <= maxTotalSupply: ${boolArray[6]}
    is msg.sender platformSupervisor: ${boolArray[7]}
    isOkBuyAmount: ${boolArray[8]}, isOkBalanceNew: ${boolArray[9]}
    authLevel: ${uintArray[0]}, maxBuyAmount: ${uintArray[1]}, maxBalance: ${uintArray[2]}
    `);

    try {
      await instHCAT721.methods.mintSerialNFT(_to, amount, price, fundingType, serverTime).send({
        value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] STO Compliance for balance of assetbook1. failed because of balance has exceeded maximum restricted value. err: ', err.toString().substr(0, 120));
      assert(err);
    }
    if (error) {assert(false);}





    //-----------------==Check Token Controller: time
    console.log('\n------------==Check TokenController parameters: time');
    console.log('addrTokenController', addrTokenController);

    tokenControllerDetail = await instTokenController.methods.getHTokenControllerDetails().call(); 
    TimeOfDeployment_TokCtrlM = tokenControllerDetail[0];
    TimeTokenUnlockM = tokenControllerDetail[1];
    TimeTokenValidM = tokenControllerDetail[2];
    isLockedForReleaseM = tokenControllerDetail[3];
    isTokenApprovedM = tokenControllerDetail[4];
    console.log('TimeOfDeployment_TokCtrl', TimeOfDeployment_TokCtrlM, ', TimeTokenUnlock', TimeTokenUnlockM, ', TimeTokenValid', TimeTokenValidM, ', isLockedForReleaseM', isLockedForReleaseM, ', isTokenApprovedM', isTokenApprovedM);

    isSenderAllowed = await instTokenController.methods.checkPlatformSupervisorFromTCC().call({from: admin});
    assert.equal(isSenderAllowed, true);
    console.log('checkPlatformSupervisor() is confirmed working');


    //----------------==Send tokens before Unlock Time
    console.log('\n------------==Send tokens before Unlock Time');
    serverTime = TimeTokenUnlock-1;
    await instTokenController.methods.updateState(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    //enum TokenState{underLockupPeriod, operational, expired}
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 0);

    bool1 = await instTokenController.methods.isTokenApprovedOperational().call();
    console.log('isTokenApprovedOperational()', bool1);
    assert.equal(bool1, false);



    error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 15000;
      _fromAssetOwner = AssetOwner2; serverTime = TimeTokenUnlock-1;
      console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
      await instAssetBook2.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
      .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetbook1 to assetbook2 failed: serverTime should be > TimeTokenUnlock', serverTime, TimeTokenUnlock, err.toString().substr(0, 190));
      assert(err);
    }
    if (error) {assert(false);}



    //-------------------------==Send tokens
    console.log('\n----------------==Send token by one: amount = 1 from AssetBook2 to AssetBook1');
    serverTime = TimeTokenUnlock+1;
    await instTokenController.methods.updateState(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isTokenApprovedOperational().call(); 
    console.log('isTokenApprovedOperational()', bool1);
    assert.equal(bool1, true);
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 1);

    _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 15000;
    _fromAssetOwner = AssetOwner2; serverTime = TimeTokenUnlock+1;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instAssetBook2.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    //safeTransferFromBatch(address _assetAddr, uint amount, address _to, uint price) 

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('HCAT getAccount():', accountM);

    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 2);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 5);




    //------------------------==
    //-----------------==Check AssetBook2
    _from = addrAssetBook1; _to = addrAssetBook2; amount = 5; price = 15000;
    _fromAssetOwner = AssetOwner1; serverTime = TimeTokenUnlock+1;
    console.log('\n\n\n----------------==Send tokens in batch: amount =', amount, ' from AssetBook1 to AssetBook2');
    console.log('sending tokens via safeTransferFromBatch()...');

    await instAssetBook1.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    //safeTransferFromBatch(0, _assetAddr, amount, _to, _serverTime)


    console.log('\n-----==after sending 5 tokens...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook1:', assetbookXM);

    
    //-----------------==Check AssetBook2
    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook2:', assetbookXM);



    console.log('\n----------------==Send token in batch: amount = 7 from AssetBook2 to AssetBook1');
    _from = addrAssetBook2; _to = addrAssetBook1; amount = 7; price = 19000;
    _fromAssetOwner = AssetOwner2; serverTime = TimeTokenUnlock+1;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instAssetBook2.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 0);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 7);


    console.log('\n----------------==Send token in batch: amount = 7 from AssetBook1 to AssetBook2');
    _from = addrAssetBook1; _to = addrAssetBook2; amount = 7; price = 21000;
    _fromAssetOwner = AssetOwner1; serverTime = TimeTokenUnlock+1;
    console.log('AssetBook1 sending tokens via safeTransferFromBatch()...');
    await instAssetBook1.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
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

    //console.log('HCAT getIdToAsset(): tokenId = '+amount+':', tokenInfo);
    // assert.equal(tokenInfo[1], initialAssetPricing);
    // assert.equal(tokenInfo[2], addrZero);

    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 0);


    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('\ntokenIds from AssetBook2 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 7);


    console.log('\n----------------==Approval Functions');
    _from = addrAssetBook2; _fromAssetOwner = AssetOwner2; amount = 3; 

    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, 0);

    console.log('\ntokenApprove()... amount =', amount);
    await instAssetBook2.methods.assetbookApprove(0, _assetAddr, operator, amount)
    .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });
    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, amount);


    console.log('\n----------------==Send token in batch: amount = '+amount+'  from AssetBook2 to AssetBook1');
    _from = addrAssetBook2; _to = addrAssetBook1; amount = 3; price = 19000;
    _fromAssetOwner = AssetOwner2; serverTime = TimeTokenUnlock+1;
    console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
    await instHCAT721.methods.safeTransferFromBatch(_from, _to, amount, price, serverTime)
    .send({value: '0', from: operator, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nCheck AssetBook2 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_from, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_from).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_from).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook2.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook2:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 4);


    console.log('\nCheck AssetBook1 after txn...');
    tokenIds = await instHCAT721.methods.getAccountIds(_to, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(_to).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(_to).call();
    console.log('HCAT getAccount():', accountM);
    assetbookXM = await instAssetBook1.methods.getAsset(0,assetAddr).call();
    console.log('AssetBook1:', assetbookXM);
    tokenSymbolM = web3.utils.toAscii(assetbookXM[2]);
    console.log('check tokenSymbolM', tokenSymbolM, tokenSymbol);
    assert.equal(assetbookXM[3], 3);

    result = await instHCAT721.methods.allowance(_from, operator).call();
    console.log('allowance() AssetBook2 to operator:', result);
    assert.equal(result, 0);


    //----------------==Send tokens with not enough allowance
    console.log('\n------------==Send tokens with not enough allowance');
    error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 3; price = 19000; _fromAssetOwner = AssetOwner2; 
      serverTime = TimeTokenUnlock+1;
      await instHCAT721.methods.safeTransferFromBatch(_from, _to, 1, price, serverTime)
      .send({value: '0', from: operator, gas: gasLimitValue, gasPrice: gasPriceValue });

      error = true;
    } catch (err) {
      console.log('[Success] sending 1 token from addrAssetBook2 to addrAssetBook1 failed because of not enough allowance: ', result, 'err:', err.toString().substr(0, 190));
      assert(err);
    }
    if (error) {assert(false);}



    //----------------==Send tokens after valid time
    console.log('\n------------==Send tokens after valid date');
    serverTime = TimeTokenValid+1;
    await instTokenController.methods.updateState(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    //enum TokenState{underLockupPeriod, operational, expired}
    tokenStateM = await instTokenController.methods.tokenState().call();
    console.log('tokenStateM', tokenStateM);
    assert.equal(tokenStateM, 2);
    
    bool1 = await instTokenController.methods.isTokenApprovedOperational().call();
    console.log('isTokenApprovedOperational()', bool1);
    assert.equal(bool1, false);




    error = false;
    try {
      _from = addrAssetBook2; _to = addrAssetBook1; amount = 1; price = 15000;
      _fromAssetOwner = AssetOwner2;
      console.log('AssetBook2 sending tokens via safeTransferFromBatch()...');
      await instAssetBook2.methods.safeTransferFromBatch(0, _assetAddr, addrZero, _to, amount, price, serverTime)
      .send({value: '0', from: _fromAssetOwner, gas: gasLimitValue, gasPrice: gasPriceValue });

      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetbook2 to assetbook1 failed: serverTime should be < TimeTokenValid', serverTime, TimeTokenValid, 'err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


  });//.then(done)

});


//--------------------------------==
describe('Tests on AssetBookCtrt', () => {
  it('AssetBook functions test', async function()  {
    this.timeout(9500);
    console.log('\n------------==getAssetbookDetails()');
    let assetOwnerM, addrHeliumContractM, assetOwner_flagM, HeliumContract_flagM, endorsers_flagM, calculateVotesM, arraylength, endorser, checkNowTimeM, lastLoginTime, bool1, result;
    serverTime = 201906281600;

    assetOwnerM = await instAssetBook1.methods.assetOwner().call();
    console.log('assetOwnerM:', assetOwnerM);
    assert.equal(assetOwnerM, AssetOwner1);

    addrHeliumContractM = await instAssetBook1.methods.addrHeliumContract().call();
    console.log('addrHeliumContractM:', addrHeliumContractM);
    assert.equal(addrHeliumContractM, addrHeliumCtrt);

    assetOwner_flagM = await instAssetBook1.methods.assetOwner_flag().call();
    console.log('assetOwner_flagM:', assetOwner_flagM);
    assert.equal(assetOwner_flagM, '0');

    HeliumContract_flagM = await instAssetBook1.methods.HeliumContract_flag().call();
    console.log('HeliumContract_flagM:', HeliumContract_flagM);
    assert.equal(HeliumContract_flagM, '0');

    endorsers_flagM = await instAssetBook1.methods.endorsers_flag().call();
    console.log('endorsers_flagM:', endorsers_flagM);
    assert.equal(endorsers_flagM, '0');

    console.log('\n----------------==initial condition is the same as if the user has not logged in for a long time ... check if the Platform can override');
    // checkNowTimeM = await instAssetBook1.methods.checkNowTime().call();
    // console.log('checkNowTimeM:', checkNowTimeM);

    lastLoginTimeM = await instAssetBook1.methods.lastLoginTime().call();
    console.log('lastLoginTimeM:', lastLoginTimeM);

    bool1 = await instAssetBook1.methods.isAblePlatformOverride().call();
    console.log('isAblePlatformOverride:', bool1);
    assert.equal(bool1, true);

    assetOwner_flagM = await instAssetBook1.methods.assetOwner_flag().call();
    console.log('assetOwner_flagM after calculateVotes():', assetOwner_flagM);
    assert.equal(assetOwner_flagM, '0');

    HeliumContract_flagM = await instAssetBook1.methods.HeliumContract_flag().call();
    console.log('HeliumContract_flagM after calculateVotes():',HeliumContract_flagM);
    assert.equal(HeliumContract_flagM, '0');
    
    endorsers_flagM = await instAssetBook1.methods.endorsers_flag().call();
    console.log('endorsers_flagM after calculateVotes():', endorsers_flagM);
    assert.equal(endorsers_flagM, '0');


    console.log('\n----------------==check adding customerService role...');
    bool1 = await instAssetBook1.methods.checkCustomerService().call({from: admin});
    console.log('checkCustomerService(admin):', bool1);
    assert.equal(bool1, true);

    bool1 = await instAssetBook1.methods.checkCustomerService().call({from: AssetOwner2});
    console.log('checkCustomerService(AssetOwner2):', bool1);
    assert.equal(bool1, false);

    error = false;
    try {
      await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
      .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] Only customer service is allowed to change assetowner, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    await instHelium.methods.addCustomerService(AssetOwner2)
    .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instAssetBook1.methods.checkCustomerService().call({from: AssetOwner2});
    console.log('checkCustomerService(AssetOwner2):', bool1);
    assert.equal(bool1, true);


    console.log('\n----------------==Change asset owner when Platform override is allowed...');
    bool1 = await instAssetBook1.methods.checkAssetOwner().call({from: AssetOwner1});
    console.log('is AssetOwner1 the asset owner?', bool1);
    assert.equal(bool1, true);

    await instAssetBook1.methods.changeAssetOwner(AssetOwner5, serverTime)
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });

    assetOwnerM = await instAssetBook1.methods.assetOwner().call();
    console.log('assetOwnerM:', assetOwnerM);
    assert.equal(assetOwnerM, AssetOwner5);

    bool1 = await instAssetBook1.methods.checkAssetOwner().call({from: AssetOwner5});
    console.log('is AssetOwner5 the new asset owner?', bool1);
    assert.equal(bool1, true);


    console.log('\n----------------==after addLoginTime()');
    // checkNowTimeM = await instAssetBook1.methods.checkNowTime().call();
    // console.log('checkNowTimeM:', checkNowTimeM);

    console.log('addLoginTime()...');
    await instAssetBook1.methods.addLoginTime().send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
    lastLoginTimeM = await instAssetBook1.methods.lastLoginTime().call();
    console.log('lastLoginTimeM:', lastLoginTimeM);

    bool1 = await instAssetBook1.methods.isAblePlatformOverride().call();
    console.log('isAblePlatformOverride:', bool1)
    assert.equal(bool1, false);

    calculateVotesM = await instAssetBook1.methods.calculateVotes().call();
    console.log('calculateVotesM:', calculateVotesM);
    assert.equal(calculateVotesM, '0');

    error = false;
    try {
      await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
      .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] The Platform now cannot change assetowner after recent login, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}




    console.log('\n----------------==check adding endorser roles...');
    arraylength = await instAssetBook1.methods.endorserCount().call();
    console.log('endorserCount():', arraylength);
    assert.equal(arraylength, 0);

    error = false;
    try {
      await instAssetBook1.methods.addEndorser(AssetOwner5, serverTime)
      .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] new endorser cannot be the asset owner himself, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}

    console.log('\nadding AssetOwner3 as the 1st endorser ...');
    await instAssetBook1.methods.addEndorser(AssetOwner3, serverTime)
    .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });

    arraylength = await instAssetBook1.methods.endorserCount().call();
    console.log('endorserCount():', arraylength);
    assert.equal(arraylength, 1);

    endorser = await instAssetBook1.methods.endorsers(1).call();
    //if array requires index input, but if that index maps to an undefined value, it fails
    console.log('endorser:', endorser);
    assert.equal(endorser, AssetOwner3);

    console.log('\nadding AssetOwner4 as the 2nd endorser ...');
    await instAssetBook1.methods.addEndorser(AssetOwner4, serverTime)
    .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nadding AssetOwner3 again as a duplicated endorser ...');
    error = false;
    try {
      await instAssetBook1.methods.addEndorser(AssetOwner3, serverTime)
      .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] new endorser cannot be a duplicated one, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}

    console.log('\nadding AssetOwner1 as the 3rd endorser ...');
    await instAssetBook1.methods.addEndorser(AssetOwner1, serverTime)
    .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });

    arraylength = await instAssetBook1.methods.endorserCount().call();
    console.log('total amount of endorsers:', arraylength);
    assert.equal(arraylength, 3);

    error = false;
    try {
      await instAssetBook1.methods.addEndorser(AssetOwner2, serverTime)
      .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] cannot add more than 3 endorsers , err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}

    console.log('\nchange endorsers...');
    await instAssetBook1.methods.changeEndorser(AssetOwner1, AssetOwner2, serverTime)
    .send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
    endorser = await instAssetBook1.methods.endorsers(3).call();
    console.log('\n[Success]: AssetOwner2 has replaced AssetOwner1 as the new endorser', endorser);
    assert.equal(endorser, AssetOwner2);



    console.log('\ncheck if the asset owner can vote');
    await instAssetBook1.methods.assetOwnerVote(serverTime).send({value: '0', from: AssetOwner5, gas: gasLimitValue, gasPrice: gasPriceValue });
    assetOwner_flagM = await instAssetBook1.methods.assetOwner_flag().call();
    console.log('assetOwner_flagM:', assetOwner_flagM);
    assert.equal(assetOwner_flagM, '1');

    error = false;
    try {
      await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
      .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] endorser cannot change asset owner, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}

    error = false;
    try {
      await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
      .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] admin cannot change asset owner, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    console.log('\nReset the vote result');
    await instAssetBook1.methods.resetVoteStatus()
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
    assetOwner_flagM = await instAssetBook1.methods.assetOwner_flag().call();
    console.log('assetOwner_flagM after reset:', assetOwner_flagM);
    assert.equal(assetOwner_flagM, '0');


    console.log('\n----------------==change assetOwner by voting');
    lastLoginTimeM = await instAssetBook1.methods.lastLoginTime().call();
    console.log('lastLoginTimeM:', lastLoginTimeM);

    bool1 = await instAssetBook1.methods.isAblePlatformOverride().call();
    console.log('isAblePlatformOverride:', bool1);
    assert.equal(bool1, false);

    error = false;
    try {
      await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
      .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] When Platform cannot override, only calculateVotes() >=2 is allowed to change assetowner, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    error = false;
    try {
      await instAssetBook1.methods.endorserVote(serverTime)
      .send({value: '0', from: AssetOwner1, gas: gasLimitValue, gasPrice: gasPriceValue });
        error = true;
    } catch (err) {
      console.log('\n[Success] non endorsers cannot vote, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}

    console.log('\ncheck if AssetOwner4 can vote');
    await instAssetBook1.methods.endorserVote(serverTime)
    .send({value: '0', from: AssetOwner4, gas: gasLimitValue, gasPrice: gasPriceValue });
    endorsers_flagM = await instAssetBook1.methods.endorsers_flag().call();
    console.log('endorsers_flagM from AssetOwner4:', endorsers_flagM);
    assert.equal(endorsers_flagM, '1');

    console.log('\nLet Platform vote, too.');
    await instAssetBook1.methods.HeliumContractVote(serverTime)
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
    HeliumContract_flagM = await instAssetBook1.methods.HeliumContract_flag().call();
    console.log('HeliumContract_flagM:', HeliumContract_flagM);
    assert.equal(HeliumContract_flagM, '1');
    // const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
    // await waitFor(2000);

    console.log('\nabout to change the assetOwner with enough votes...');
    await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });

    bool1 = await instAssetBook1.methods.checkAssetOwner().call({from: AssetOwner1});
    console.log('is AssetOwner1 the new asset owner?', bool1);
    assert.equal(bool1, true);

    endorsers_flagM = await instAssetBook1.methods.endorsers_flag().call();
    console.log('endorsers_flagM after changing the assetOwner:', endorsers_flagM);
    assert.equal(endorsers_flagM, '0');

    HeliumContract_flagM = await instAssetBook1.methods.HeliumContract_flag().call();
    console.log('HeliumContract_flagM after changing the assetOwner:', HeliumContract_flagM);
    assert.equal(HeliumContract_flagM, '0');

    // await instAssetBook1.methods.changeAssetOwner(AssetOwner1, serverTime)
    // .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });

    // assetOwnerM = await instAssetBook1.methods.assetOwner().call();
    // console.log('assetOwnerM:', assetOwnerM);
    // assert.equal(assetOwnerM, AssetOwner1);
    // console.log('[Success] assetowner can change owner address by himself');


    //but after changing to an invalid Helium contract address, we cannot call functions...
    //so put this test at the very last!
    console.log('\n-----------------==');
    error = false;
    try {
      await instAssetBook1.methods.setHeliumAddr(AssetOwner2)
      .send({value: '0', from: AssetOwner1, gas: gasLimitValue, gasPrice: gasPriceValue });
      addrHeliumContractM = await instAssetBook1.methods.addrHeliumContract().call();
      error = true;
    } catch (err) {
      console.log('[Success] only a customer service rep can change Helium address, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    await instAssetBook1.methods.setHeliumAddr(AssetOwner2)
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
    addrHeliumContractM = await instAssetBook1.methods.addrHeliumContract().call();
    console.log('addrHeliumContractM after changing it:', addrHeliumContractM);
    assert.equal(addrHeliumContractM, AssetOwner2);
    console.log('[Success] Helium address has been changed by a customer service rep');


  });
});

//--------------------------------==
describe('Tests on HeliumCtrt', () => {
  it('HeliumCtrt functions test', async function()  {
    this.timeout(9500);
    console.log('\n------------==testing HeliumCtrt');
    bool1 = await instHelium.methods.checkCustomerService().call({from: admin});
    console.log('checkCustomerService(admin):', bool1);
    assert.equal(bool1, true);

    bool1 = await instHelium.methods.checkCustomerService().call({from: AssetOwner1});
    console.log('checkCustomerService(AssetOwner1):', bool1);
    assert.equal(bool1, false);

    await instHelium.methods.addCustomerService(AssetOwner1)
    .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instHelium.methods.checkCustomerService().call({from: AssetOwner1});
    console.log('checkCustomerService(AssetOwner1):', bool1);
    assert.equal(bool1, true);
  });
});


//--------------------------------==
describe('Tests on IncomeManagerCtrt', () => {
  
  it('IncomeManagerCtrt functions test', async function() {
    this.timeout(9500);
    console.log('\n------------==Check IncomeManagerCtrt parameters');
    let forecastedPayableTime, forecastedPayableAmount, schCindex, schIndex, result, _errorCode, _isErrorResolved, paymentCount;

    const forecastedPayableTimes = [TimeOfDeployment_IM+1, 201906110000, 201908170000, 201911210000, 202002230000];
    const forecastedPayableAmounts = [3000, 3300, 3700, 3800, 3900];

    console.log('\n--------==Initial conditions');
    schIndex = 0;
    result = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('getIncomeSchedule('+schIndex+'):', result);
    assert.equal(result[0], '0');
    assert.equal(result[1], '0');
    assert.equal(result[2], '0');
    assert.equal(result[3], '0');
    assert.equal(result[4], '0');
    assert.equal(result[5], '0');

    console.log('\n--------==Add a new pair of forecastedPayableTime, forecastedPayableAmount');
    schIndex = 1;
    forecastedPayableTime = forecastedPayableTimes[schIndex-1];
    forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];

    await instIncomeManager.methods.addForecastedSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nafter adding a new schedule...');
    result = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);


    //-----------------------==add 1 more pair
    schIndex += 1;
    forecastedPayableTime = forecastedPayableTimes[schIndex-1];
    forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];

    await instIncomeManager.methods.addForecastedSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==after adding a new schedule...');
    result = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex(forecastedPayableTime):', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, schIndex);

    result = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, schIndex);

    //-----------------------==add 3 more pairs
    console.log('\n--------==Add 3 more pairs of forecastedPayableTime, forecastedPayableAmount');

    await instIncomeManager.methods.addForecastedScheduleBatch(forecastedPayableTimes.slice(2), forecastedPayableAmounts.slice(2))
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    schCindex = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', schCindex, typeof schCindex);
    assert.equal(schCindex, '5');

    console.log('forecastedPayableTimes', forecastedPayableTimes,'\nforecastedPayableAmounts', forecastedPayableAmounts);
    for(let i = 3; i <= forecastedPayableTimes.length; i++) {
      result = await instIncomeManager.methods.getIncomeSchedule(i).call(); 
      console.log('\ngetIncomeSchedule(index='+i+'):', result);
      assert.equal(result[0], forecastedPayableTimes[i-1].toString());
      assert.equal(result[1], forecastedPayableAmounts[i-1].toString());
      assert.equal(result[2], 0);
      assert.equal(result[3], 0);
      assert.equal(result[4], false);
      assert.equal(result[5], 0);
    }

    console.log('\n-----------------==Test addPayment() and editActualSchedule()');
    paymentCount = await instIncomeManager.methods.paymentCount().call();
    console.log('paymentCount:', paymentCount, typeof paymentCount);
    assert.equal(paymentCount, '0');

    error = false;
    try {
      await instIncomeManager.methods.addPaymentCount()
      .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('[Success] only can add payment count when 1st actual payment time and amount exist, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    //require(schIndex > paymentCount
    schIndex = 1;
    console.log('\n--------==editActualSchedule for schIndex =', schIndex);
    forecastedPayableTime = forecastedPayableTimes[schIndex-1];
    forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];
    actualPaymentTime = forecastedPayableTimes[schIndex-1]+1;
    actualPaymentAmount = forecastedPayableAmounts[schIndex-1]+1;
    await instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], actualPaymentTime);
    assert.equal(result[3], actualPaymentAmount);
    assert.equal(result[4], '0');
    assert.equal(result[5], false);

    console.log('\n--------==addPaymentCount()');
    await instIncomeManager.methods.addPaymentCount()
    .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    paymentCount = await instIncomeManager.methods.paymentCount().call();
    console.log('paymentCount:', paymentCount, typeof paymentCount);
    assert.equal(paymentCount, '1');
    console.log('Successfully added paymentCount after entering 1st actual payment time & amount');


    console.log('\n-----------------==');
    error = false;
    try {
      await instIncomeManager.methods.addPaymentCount()
      .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] only can add payment count when actual payment time exists, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}


    schIndex = 2;
    console.log('\n--------==editActualSchedule for schIndex =', schIndex);
    forecastedPayableTime = forecastedPayableTimes[schIndex-1];
    forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];
    actualPaymentTime = forecastedPayableTimes[schIndex-1]+1;
    actualPaymentAmount = forecastedPayableAmounts[schIndex-1]+1;
    await instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], actualPaymentTime);
    assert.equal(result[3], actualPaymentAmount);
    assert.equal(result[4], '0');
    assert.equal(result[5], false);

    console.log('\n--------==addPaymentCount()');
    await instIncomeManager.methods.addPaymentCount()
    .send({value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    paymentCount = await instIncomeManager.methods.paymentCount().call();
    console.log('paymentCount:', paymentCount, typeof paymentCount);
    assert.equal(paymentCount, '2');
    console.log('Successfully added paymentCount after entering 2nd actual payment time & amount');


    error = false;
    try {
      schIndex = 2;
      console.log('\n--------==Try to editActualSchedule after addPaymentCount()');
      console.log('\n--------==editActualSchedule for schIndex =', schIndex);
      forecastedPayableTime = forecastedPayableTimes[schIndex-1];
      forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];
      actualPaymentTime = forecastedPayableTimes[schIndex-1]+1;
      actualPaymentAmount = forecastedPayableAmounts[schIndex-1]+1;
      await instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount)
      .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    } catch (err) {
      console.log('\n[Success] only can editActualPayment() when schIndex > paymentCount, err:', err.toString().substr(0, 150));
      assert(err);
    }
    if (error) {assert(false);}



    schIndex = 5;
    console.log('\n--------==editActualSchedule for schIndex =', schIndex);
    forecastedPayableTime = forecastedPayableTimes[schIndex-1];
    forecastedPayableAmount = forecastedPayableAmounts[schIndex-1];
    actualPaymentTime = forecastedPayableTimes[schIndex-1]+1;
    actualPaymentAmount = forecastedPayableAmounts[schIndex-1]+1;
    await instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], actualPaymentTime);
    assert.equal(result[3], actualPaymentAmount);
    assert.equal(result[4], '0');
    assert.equal(result[5], false);
    console.log('\nSuccess: can editActualSchedule('+schIndex+') way ahead');

    console.log('\n--------==getIncomeScheduleList(indexStart = 0; amount = 0;)');
    indexStart = 0; amount = 0;
    let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);


    _errorCode = 21;
    _isErrorResolved = true;
    await instIncomeManager.methods.setErrResolution(schIndex, _isErrorResolved, _errorCode)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log('\n--------==setErrResolution()', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], actualPaymentTime);
    assert.equal(result[3], actualPaymentAmount);
    assert.equal(result[4], _errorCode);
    assert.equal(result[5], _isErrorResolved);




    console.log('\n--------==getIncomeScheduleList(indexStart = 1; amount = 0;)');
    indexStart = 1; amount = 0;
    scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);


  });
});



//-----------------------------------------==Product Manager
describe('Tests on ProductManagerCtrt', () => {

  it('ProductManagerCtrt functions test', async function() {
    console.log('\ninside productManager test...');
    const argsProductManager = [addrHeliumCtrt];

    instProductManager = await new web3.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode, arguments: argsProductManager })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      console.log('[Error] instProductManager is NOT defined');
      } else {console.log('[Good] instProductManager is defined');}
    instProductManager.setProvider(provider);
    addrProductManager = instProductManager.options.address;
    console.log('addrProductManager:', addrProductManager);

    console.log('\n------------==Check CrowdFunding parameters');

    let groupCindexM = await instProductManager.methods.groupCindex().call();
    console.log('\groupCindexM', groupCindexM);
    assert.equal(groupCindexM, 0);

    let symbol = "Taipei101";
    let symbol_b32 = web3.utils.fromAscii(symbol);
    await instProductManager.methods.addNewCtrtGroup(symbol_b32, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManagerCtrt)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    let ctrtGroup = await instProductManager.methods.getCtrtGroup(symbol_b32).call();
    console.log('\ctrtGroup', ctrtGroup);
    //assert.equal(ctrtGroup, symbol_b32);

    groupCindexM = await instProductManager.methods.groupCindex().call();
    console.log('\groupCindexM', groupCindexM);
    assert.equal(groupCindexM, 1);


    let symbolM = await instProductManager.methods.idxToSymbol(1).call();
    console.log('\symbolM', web3.utils.toAscii(symbolM), symbol);

  });
});

//-----------------------------------------==
describe('Tests on CrowdFundingCtrt', () => {

  it('CrowdFunding functions test', async function() {
    this.timeout(9500);
    console.log('\n------------==Check CrowdFunding parameters');
    console.log('addrCrowdFunding', addrCrowdFunding);

    console.log("CFSD:", CFSD, ", CFED:", CFED);

    let tokenSymbolB32M = await instCrowdFunding.methods.tokenSymbol().call();
    tokenSymbolM = web3.utils.toAscii(tokenSymbolB32M);
    console.log('\ncheck tokenSymbolM', tokenSymbolM, tokenSymbol);
    //assert.equal(tokenSymbolM, tokenSymbol_bytes32);

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

    let CFSDM = await instCrowdFunding.methods.CFSD().call();
    console.log('CFSDM', CFSDM);
    assert.equal(CFSDM, CFSD);

    let CFEDM = await instCrowdFunding.methods.CFED().call();
    console.log('CFEDM', CFEDM);
    assert.equal(CFEDM, CFED);


    //-------------------==
    console.log('\nFundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, aborted}');
    serverTime = CFSD-1;
    console.log('set servertime = CFSD-1', serverTime);//201905281400;
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    let stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('\nstateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "initial: not started yet");

    let fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 0);

    //-------------------==
    serverTime = CFSD;
    console.log('\nset serverTime = CFSD', CFSD);
    await instCrowdFunding.methods.updateState(serverTime)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "funding: with goal not reached yet");

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM', fundingStateM);
    assert.equal(fundingStateM, 1);

    if (1==2){
      serverTime = CFED;
      console.log('\nset serverTime = CFED', CFED);
      await instCrowdFunding.methods.updateState(serverTime)
      .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
  
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
    // .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

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
      await instCrowdFunding.methods.invest(addrAssetBook1, maxTokenQtyForEachInvestmentFund, serverTime).send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
      console.log('invest()... take ', i);
    }
    remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('remainingTokenQtyM:', remainingTokenQtyM, ' V.s. modResult:', modResult, '... maxTotalSupply', maxTotalSupply, ', quantityGoal', quantityGoal, 'quantitySoldM', quantitySoldM);
    assert.equal(remainingTokenQtyM, modResult+maxTotalSupply-quantityGoal);

    await instCrowdFunding.methods.invest(addrAssetBook1, modResult, serverTime).send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
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
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
    
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
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

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
      await instCrowdFunding.methods.invest(addrAssetBook1, quantityAvailable+1, serverTime).send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
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
      .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

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
      .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

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
        .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });
  
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
        .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

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
      .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

      stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
      console.log('stateDescriptionM', stateDescriptionM);
      assert.equal(stateDescriptionM, "fundingClosed: goal reached but not sold out");

      fundingStateM = await instCrowdFunding.methods.fundingState().call();
      console.log('fundingStateM', fundingStateM);
      assert.equal(fundingStateM, 4);
    }

  });
});


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
// Make a script entry at package.json:
//    "testxyz": "mocha --grep xyzCtrt",
// describe('Tests on xyzCtrt', () => {
//   it('... functions test', async function()  {
//     this.timeout(9500);
//     console.log('\n------------==Check DDD parameters');
//   });
// });
//--------------------------------==

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
