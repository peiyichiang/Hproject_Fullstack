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

const Asset = require('../ethereum/contracts/build/AssetContract.json');
if (Asset === undefined){
  console.log('[Error] Asset is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Asset is defined');
  if (Asset.abi === undefined){
    console.log('[Error] Asset.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Asset.abi is defined');
      //console.log('Asset.abi:', Asset.abi);
  }
  if (Asset.bytecode === undefined || Asset.bytecode.length < 10){
    console.log('[Error] Asset.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Asset.bytecode is defined');
      //console.log('Asset.bytecode:', Asset.bytecode);
  }
  //console.log(Asset);
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

const ERC721SPLC_Controller = require('../ethereum/contracts/build/ERC721SPLC_Controller.json');
if (ERC721SPLC_Controller === undefined){
  console.log('[Error] ERC721SPLC_Controller is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ERC721SPLC_Controller is defined');
  if (ERC721SPLC_Controller.abi === undefined){
    console.log('[Error] ERC721SPLC_Controller.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ERC721SPLC_Controller.abi is defined');
      //console.log('ERC721SPLC_Controller.abi:', ERC721SPLC_Controller.abi);
  }
  if (ERC721SPLC_Controller.bytecode === undefined || ERC721SPLC_Controller.bytecode.length < 10){
    console.log('[Error] ERC721SPLC_Controller.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ERC721SPLC_Controller.bytecode is defined');
      //console.log('ERC721SPLC_Controller.bytecode:', ERC721SPLC_Controller.bytecode);
  }
  //console.log(ERC721SPLC_Controller);
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

const System = require('../ethereum/contracts/build/System.json');
if (System === undefined){
  console.log('[Error] System is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] System is defined');
  if (System.abi === undefined){
    console.log('[Error] System.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] System.abi is defined');
      //console.log('System.abi:', System.abi);
  }
  if (System.bytecode === undefined || System.bytecode.length < 10){
    console.log('[Error] System.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] System.bytecode is defined');
      //console.log('System.bytecode:', System.bytecode);
  }
  //console.log(System);
}


//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let accounts;
let instRegistry; let addrRegistry;
let instERC721SPLC_Controller; let addrERC721SPLC_Controller;
let instERC721SPLC; let addrERC721SPLC;
let instCrowdFunding; let addrCrowdFunding;
let instIncomeManagement; let addrIncomeManagement;
let instSystem; let addrSystem;

let acc0; let acc1; let acc2; let acc3; let acc4;
let balance0; let balance1; let balance2;

let balance0A; let balance0B;
let balance1A; let balance1B;
let balance2A; let balance2B;

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

let AssetsOwner1; let AssetsOwner2; let AssetsOwner3; let AssetsOwner4; 
let argsAsset1; let argsAsset2; let argsAsset3; let argsAsset4;
let instAsset1; let instAsset2; let instAsset3; let instAsset4; 
let addrAsset1; let addrAsset2; let addrAsset3; let addrAsset4;

let Platform;
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
//const addrERC721SPLC_Controller = "0x39523jt032";

const argsERC721SPLC_Controller = [
  timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid ];

const _tokenSymbol = nftSymbol;
const _tokenPrice = initialAssetPricing;
const _quantityMax = maxTotalSupply;
const _goalInPercentage = 97;
const _CFSD2 = timeCurrent+1;
const _CFED2 = timeCurrent+10;
let _serverTime = timeCurrent;
const argsCrowdFunding = [_tokenSymbol, _tokenPrice, _quantityMax, _goalInPercentage, _CFSD2, _CFED2, _serverTime];

const TimeAnchor = TimeTokenLaunch;
let addrPA_Ctrt; let addrFMXA_Ctrt; let addrPlatformCtrt;
let uid1; let uid2; let assetCtAddr1; let assetCtAddr2;
let extoAddr1; let extoAddr2;

let tokenId; let to; let _from; let uri; let tokenOwner; let tokenOwnerM;
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

    AssetsOwner1 = acc1;
    AssetsOwner2 = acc2;
    AssetsOwner3 = acc3;

    Platform = acc0;
    argsAsset1 = [AssetsOwner1, Platform, timeCurrent];
    argsAsset2 = [AssetsOwner2, Platform, timeCurrent];
    argsAsset3 = [AssetsOwner3, Platform, timeCurrent];
    console.log('\nDeploying contracts...');

    //Deploying Asset contract... 
    //JSON.parse() is not needed because the abi and bytecode are already objects

    instAsset1 =  await new web3.eth.Contract(Asset.abi)
    .deploy({ data: Asset.bytecode, arguments: argsAsset1 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('Asset.sol has been deployed');
    if (instAsset1 === undefined) {
      console.log('[Error] instAsset1 is NOT defined');
      } else {console.log('[Good] instAsset1 is defined');}
    instAsset1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAsset1 = instAsset1.options.address;
    console.log('addrAsset1:', addrAsset1);

    instAsset2 =  await new web3.eth.Contract(Asset.abi)
    .deploy({ data: Asset.bytecode, arguments: argsAsset2 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('Asset.sol has been deployed');
    if (instAsset2 === undefined) {
      console.log('[Error] instAsset2 is NOT defined');
      } else {console.log('[Good] instAsset2 is defined');}
    instAsset2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAsset2 = instAsset2.options.address;
    console.log('addrAsset2:', addrAsset2);

    instAsset3 =  await new web3.eth.Contract(Asset.abi)
    .deploy({ data: Asset.bytecode, arguments: argsAsset3 })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    //.then(console.log);
    console.log('Asset.sol has been deployed');
    if (instAsset3 === undefined) {
      console.log('[Error] instAsset3 is NOT defined');
      } else {console.log('[Good] instAsset3 is defined');}
    instAsset3.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrAsset3 = instAsset3.options.address;
    console.log('addrAsset3:', addrAsset3);

    
    //Deploying Registry contract...
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
    
    //Deploying ERC721SPLC_Controller contract...
    instERC721SPLC_Controller = await new web3.eth.Contract(ERC721SPLC_Controller.abi)
    .deploy({ data: ERC721SPLC_Controller.bytecode, arguments: argsERC721SPLC_Controller })
    .send({ from: acc0, gas: '7000000', gasPrice: '20000000000' });
    console.log('ERC721SPLC_Controller.sol has been deployed');
    if (instERC721SPLC_Controller === undefined) {
      console.log('[Error] instERC721SPLC_Controller is NOT defined');
      } else {console.log('[Good] instERC721SPLC_Controller is defined');}
    instERC721SPLC_Controller.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrERC721SPLC_Controller = instERC721SPLC_Controller.options.address;
    console.log('addrERC721SPLC_Controller:', addrERC721SPLC_Controller);

    //Deploying ERC721SPLC contract...
    /** https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, 201902150000,
    203903310000, 201901310000, "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a"
    */
    const argsERC721SPLC = [
    nftName, nftSymbol, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency, IRR20yrx100,
    addrRegistry, addrERC721SPLC_Controller ];
    // string memory _nftName, string memory _nftSymbol, 
    // uint _siteSizeInKW, uint _maxTotalSupply, uint _initialAssetPricing, 
    // string memory _pricingCurrency, uint _IRR20yrx100,
    // address _addrRegistryITF, address _addrERC721SPLC_ControllerITF
  
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

    instSystem = await new web3.eth.Contract(System.abi)
    .deploy({ data: System.bytecode })
    .send({ from: acc0, gas: '9000000', gasPrice: '20000000000' });
    console.log('System.sol has been deployed');
    if (instSystem === undefined) {
      console.log('[Error] instSystem is NOT defined');
      } else {console.log('[Good] instSystem is defined');}
    instSystem.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrSystem = instSystem.options.address;
    console.log('addrSystem:', addrSystem);
    */

    addrPA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    addrFMXA_Ctrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
    addrPlatformCtrt = "0xd0F1163434C7b9FF10C093c3c4138E6e691FADb4";
   
    console.log('--------==BeforeEach is finished');
});

console.log('----------------==');
describe('Tests on ERC721SPLC', () => {
  it('check ERC721SPLC deployment test', async () => {
    //!!!!!!!!! New contract instance for EVERY it() => Different contract addresses!!!
    //addrAsset = instAsset1.options.address;
    assert.ok(addrAsset1);
    assert.ok(addrAsset2);
    assert.ok(addrRegistry);
    assert.ok(addrERC721SPLC_Controller);
    assert.ok(addrERC721SPLC);
    //assert.ok(addrCrowdFunding);
    //assert.ok(addrIncomeManagement);

    //console.log('instERC721SPLC', instERC721SPLC);
    //test if the instanceCtrt has a property options, which has a property of address. Test if such value exists or is not undefined

    //console.log(instanceCtrt);
    //console.log(accounts);
  });

  // it('Asset contract test', async () => {
  //   console.log('addrAsset1', addrAsset1);
  // });

  it('Asset, Registry, ERC721SPLC HToken functions test', async () => {
    //----------------==Check Asset contract
    console.log('------------==Check Asset contract 1 & 2');
    console.log('addrAsset1', addrAsset1);
    console.log('addrAsset2', addrAsset2);
    let assetsOwnerM1 = await instAsset1.methods.getAssetsOwner().call();
    assert.equal(assetsOwnerM1, AssetsOwner1);
    let assetsOwnerM2 = await instAsset2.methods.getAssetsOwner().call();
    assert.equal(assetsOwnerM2, AssetsOwner2);

    let platformM1 = await instAsset1.methods.getPlatformContractAddr().call();
    assert.equal(platformM1, Platform);
    let platformM2 = await instAsset2.methods.getPlatformContractAddr().call();
    assert.equal(platformM2, Platform);

    let tokenAddr = addrERC721SPLC;
    let assetsMeasured1 = await instAsset1.methods.getAsset(tokenAddr).call();
    let assetsMeasured2 = await instAsset2.methods.getAsset(tokenAddr).call();
    console.log('assetsMeasured1', assetsMeasured1);
    console.log('assetsMeasured2', assetsMeasured2);
    assert.equal(assetsMeasured1[0], '');
    assert.equal(assetsMeasured2[0], '');
    assert.equal(assetsMeasured1[1], 0);
    assert.equal(assetsMeasured2[1], 0);
    assert.equal(assetsMeasured1[2].length, 0);
    assert.equal(assetsMeasured2[2].length, 0);


    //----------------==Registry contract
    console.log('\n------------==Registry contract: add asset contracts 1 & 2');
    console.log('addrRegistry', addrRegistry);
    uid1 = "A500000001"; assetCtAddr = addrAsset1; extoAddr = acc1;
    await instRegistry.methods.addUser(
      uid1, assetCtAddr, extoAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    let user1M = await instRegistry.methods.getUser(uid1).call();
    assert.equal(user1M[0], uid1);
    assert.equal(user1M[1], assetCtAddr);
    assert.equal(user1M[2], extoAddr);
    assert.equal(user1M[3], 0);
    console.log('user1M', user1M);

    uid2 = "A500000002"; assetCtAddr = addrAsset2; extoAddr = acc2;
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

    let isUnlockedValid = await instERC721SPLC_Controller.methods.isUnlockedValid().call();
    assert.equal(isUnlockedValid, false);


    let supportsInterface0x80ac58cd = await instERC721SPLC.methods.supportsInterface("0x80ac58cd").call();
    assert.equal(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instERC721SPLC.methods.supportsInterface("0x5b5e139f").call();
    assert.equal(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instERC721SPLC.methods.supportsInterface("0x780e9d63").call();
    assert.equal(supportsInterface0x780e9d63, true);

    //----------------==Mint token
    console.log('\n------------==Mint token: tokenId = 1');
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 0);

    to = addrAsset1; uri = "https://heliumcryptic.com/nccu01";
    await instERC721SPLC.methods.mintSerialNFT(to, uri).send({
      value: '0', from: acc0, gas: '1000000'
    });

    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 1);

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwnerM, addrAsset1);

    tokenInfo = await instERC721SPLC.methods.getNFT(1).call();
    console.log('tokenInfo from ERC721SPLC', tokenInfo);
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
    assert.equal(tokenInfo[3], uri);
    assert.equal(tokenInfo[4], initialAssetPricing);

    await instAsset1.methods.addAsset(tokenAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    assetsMeasured1 = await instAsset1.methods.getAsset(tokenAddr).call();
    console.log('assetsMeasured1', assetsMeasured1);
    assert.equal(assetsMeasured1[0], 'NCCU1801');
    assert.equal(assetsMeasured1[1], 1);
    assert.equal(assetsMeasured1[2].length, 1);


    //-----------------==Check Token Controller: time
    console.log('\n------------==Check ERC721SPLC_Controller parameters: time');
    console.log('addrERC721SPLC_Controller', addrERC721SPLC_Controller);
    let owner = await instERC721SPLC_Controller.methods.owner().call();
    let chairman = await instERC721SPLC_Controller.methods.chairman().call();
    let director = await instERC721SPLC_Controller.methods.director().call();
    let manager = await instERC721SPLC_Controller.methods.manager().call();
    let admin = await instERC721SPLC_Controller.methods.admin().call();

    assert.equal(owner, acc0);
    assert.equal(manager, acc0);
    assert.equal(admin, acc0);
    assert.equal(chairman, acc0);
    assert.equal(director, acc0);

    tokenControllerDetail = await instERC721SPLC_Controller.methods.getHTokenControllerDetails().call(); 
    timeCurrentM = tokenControllerDetail[0];
    TimeTokenLaunchM = tokenControllerDetail[1];
    TimeTokenUnlockM = tokenControllerDetail[2];
    TimeTokenValidM = tokenControllerDetail[3];
    isLaunchedM = tokenControllerDetail[4];
    console.log('timeCurrent', timeCurrentM, ', TimeTokenLaunch', TimeTokenLaunchM, ', TimeTokenUnlock', TimeTokenUnlockM, ', TimeTokenValid', TimeTokenValidM, ', isLaunched', isLaunchedM);

    //----------------==Send tokens before Unlock Time
    console.log('\n------------==Send tokens before Unlock Time');
    timeCurrent = TimeTokenUnlock;
    await instERC721SPLC_Controller.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instERC721SPLC_Controller.methods.isUnlockedValid().call(); 
    assert.equal(bool1, false);

    tokenId = 1; _from = addrAsset1; to = addrAsset2;
    let error = false;
    try {
      await instAsset1.methods.transferAsset(tokenAddr, tokenId, to, timeCurrent)
      .send({ value: '0', from: acc1, gas: '1000000' });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);
      assert(err);
    }
    if (error) {assert(false);}


    //----------------==Send tokens from assetCtrt1 to assetCtrt2
    console.log('\n------------==Send tokens from assetCtrt1 to assetCtrt2');
    tokenId = 1; _from = addrAsset1; to = addrAsset2;

    timeCurrent = 201902281045;
    await instERC721SPLC_Controller.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instERC721SPLC_Controller.methods.isUnlockedValid().call(); 
    assert.equal(bool1, true);

    await instAsset1.methods.transferAsset(tokenAddr, tokenId, to, timeCurrent)
    .send({ value: '0', from: acc1, gas: '1000000' });
    //await instERC721SPLC.methods.safeTransferFrom(from, to, tokenId)
    //.send({ value: '0', from: _from, gas: '1000000' });

    await instAsset1.methods.addAsset(tokenAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    assetsMeasured1 = await instAsset1.methods.getAsset(tokenAddr).call();
    assert.equal(assetsMeasured1[1], 0);//amount of token
    assert.equal(assetsMeasured1[2].length, 0);//tokens Ids
    console.log('assetsMeasured1', assetsMeasured1);

    await instAsset2.methods.addAsset(tokenAddr, timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    assetsMeasured2 = await instAsset2.methods.getAsset(tokenAddr).call();
    assert.equal(assetsMeasured2[1], 1);//amount of token
    assert.equal(assetsMeasured2[2][0], 1);//Ids of tokens
    console.log('assetsMeasured2', assetsMeasured2);


    //----------------==Send tokens after valid time
    console.log('\n------------==Send tokens after valid date');
    timeCurrent = TimeTokenValid;
    await instERC721SPLC_Controller.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });
    bool1 = await instERC721SPLC_Controller.methods.isUnlockedValid().call(); 
    assert.equal(bool1, false);

    to = addrAsset1;
    error = false;
    try {
      await instAsset2.methods.transferAsset(tokenAddr, tokenId, to, timeCurrent)
      .send({ value: '0', from: acc2, gas: '1000000' });
      error = true;
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt2 to assetCtrt1 failed because of not meeting the condition: timeCurrent > TimeTokenValid', timeCurrent, TimeTokenValid);
      assert(err);
    }
    if (error) {assert(false);}


  });

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
    assert.equal(stateDescriptionM, "prefunding: not started yet");

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

    await instCrowdFunding.methods.invest(addrAsset1, quantityTargetGoal)
    .send({ value: '0', from: acc0, gas: '1000000' });
    console.log('\nafter investing the target goal amount');

    //------------------==Set time to prefunding
    await instCrowdFunding.methods.setServerTime(_CFSD2-1)
    .send({ value: '0', from: acc0, gas: '1000000' });
    serverTimeM = await instCrowdFunding.methods.serverTime().call();
    console.log('serverTimeM', serverTimeM);
    assert.equal(serverTimeM, _CFSD2-1);//201902281039
    
    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('stateDescriptionM', stateDescriptionM);
    assert.equal(stateDescriptionM, "prefunding: goal reached already");

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
      await instCrowdFunding.methods.invest(addrAsset1, quantityAvailable+1)
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
      await instCrowdFunding.methods.invest(addrAsset1, quantityAvailable)
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

    await instCrowdFunding.methods.invest(addrAsset1, maxTotalSupply)
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
