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
let instAsset1; let instAsset2; let addrAsset1; let addrAsset2;
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

let AssetsOwner1; let AssetsOwner2; let Platform;
const TimeCurrent = 201902201040;
const TimeTokenLaunch = TimeCurrent+3;
const TimeTokenUnlock = TimeCurrent+4; 
const TimeTokenValid =  TimeCurrent+9;
let argsAsset1; let argsAsset2;

const nftName = "NCCU site No.1(2018)";
const nftSymbol = "NCCU1801";
const siteSizeInKW = 300;
const maxTotalSupply = 800; 
const initialAssetPricing = 17000;
const pricingCurrency = "NTD";
const IRR20yrx100 = 470;
//const addrRegistry = "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a";
//const addrERC721SPLC_Controller = "0x39523jt032";

const argsERC721SPLC_Controller = [
  TimeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid ];

const _htokenSYMBOL = nftSymbol;
const _tokenprice = initialAssetPricing;
const _totalamount = maxTotalSupply;
const TargetPercents = 95;
const CrowdFundingDeadline = TimeCurrent+2;
const CrowdFundingStartTime = TimeCurrent+1;
const argsCrowdFunding = [_htokenSYMBOL, _tokenprice, _totalamount, TargetPercents, CrowdFundingDeadline, CrowdFundingStartTime];

const TimeAnchor = TimeTokenLaunch;
let addrPA_Ctrt; let addrFMXA_Ctrt; let addrPlatformCtrt;
let uid1; let uid2; let assetCtAddr1; let assetCtAddr2;
let extoAddr1; let extoAddr2;

let tokenId; let to; let _to; let _from; let _tokenId; let uri; let tokenOwner; let tokenOwnerM;
let timeCurrent;

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
    Platform = acc0;
    argsAsset1 = [AssetsOwner1, Platform, TimeCurrent];
    argsAsset2 = [AssetsOwner2, Platform, TimeCurrent];

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
describe('ERC721SPLC_Functional_Test', () => {
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

  it('Asset, Registry, ERC721SPLC_H_Token functions test', async () => {
    //----------------==Check Asset contract
    console.log('Asset contract 1 & 2');
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
    assert.equal(assetsMeasured1[0], 0);
    assert.equal(assetsMeasured2[0], 0);

    //----------------==Registry contract
    console.log('Registry contract');
    uid1 = "A500000001"; assetCtAddr = addrAsset1; extoAddr = acc1;
    await instRegistry.methods.addNewUser(
      uid1, assetCtAddr, extoAddr, TimeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    let user1M = await instRegistry.methods.getUser(uid1).call();
    assert.equal(user1M[0], uid1);
    assert.equal(user1M[1], assetCtAddr);
    assert.equal(user1M[2], extoAddr);
    assert.equal(user1M[3], 0);

    uid2 = "A500000002"; assetCtAddr = addrAsset2; extoAddr = acc2;
    await instRegistry.methods.addNewUser(
      uid2, assetCtAddr, extoAddr, TimeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    let user2M = await instRegistry.methods.getUser(uid2).call();
    assert.equal(user2M[0], uid2);
    assert.equal(user2M[1], assetCtAddr);
    assert.equal(user2M[2], extoAddr);
    assert.equal(user2M[3], 0);

    //----------------==Mint s token
    console.log('Mint tokenId = 1');
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
    console.log('tokenInfo', tokenInfo);
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

    //----------------==Send tokens from assetCtrt1 to assetCtrt2
    console.log('Send tokens from assetCtrt1 to assetCtrt2');
    tokenId = 1; timeCurrent = TimeCurrent;
    _from = addrAsset1; _to = addrAsset2; _tokenId = 1;

    await instERC721SPLC.methods.safeTransferFrom(_from, to, _tokenId)
    .send({ value: '0', from: acc1, gas: '1000000' });

    await instAsset1.methods.addAsset(tokenAddr, TimeCurrent)
    .send({ value: '0', from: acc0, gas: '1000000' });

    await instAsset1.methods.transferAsset(tokenAddr, tokenId, to, timeCurrent).send({ value: '0', from: acc0, gas: '1000000' });

    //----------------==
    console.log('Test ERC721SPLC');
    console.log('addrERC721SPLC', addrERC721SPLC);

    // await instERC721SPLC.methods.set_admin(acc1, acc0).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//set_tokenDump(address _tokenDump, address vendor)

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

    //-------------==set NewOwner to acc4
    // await instERC721SPLC.methods.addNewOwner(acc4).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//
    // ownerNew = await instERC721SPLC.methods.ownerNew().call();
    // assert.equal(ownerNew, acc4);
    // await instERC721SPLC.methods.transferOwnership().send({
    //   value: '0', from: acc4, gas: '1000000'
    // });//
    // owner = await instERC721SPLC.methods.owner().call();
    // assert.equal(owner, acc4);

  });

  /*
  it('mintSerialNFT -> safeTransferFrom & transferFrom initiated by owner', async () => {
    addrERC721SPLC = instERC721SPLC.options.address;
    console.log('addrERC721SPLC', addrERC721SPLC);

    //-------------==balances
    const balance0A = await instERC721SPLC.methods.balanceOf(acc0).call();
    assert.equal(balance0A, 0);
    const balance1A = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balance1A, 0);
    const balance3A = await instERC721SPLC.methods.balanceOf(acc3).call();
    assert.equal(balance3A, 0);
    // assert(balance3B > 1000);

    //-------------==

    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    assert.equal(tokenIdM, 2);

    let asset1 = await instERC721SPLC.methods.getNFT(1).call();
    console.log('asset1', asset1);

    let givenAssetName = "NCCU site No.1(2018)";
    let givenAssetSymbol = "NCCU1801";
    assert.equal(asset1[0], givenAssetName);
    assert.equal(asset1[1], givenAssetSymbol);
    assert.equal(asset1[2], "NTD");
    assert.equal(asset1[3], URI_tokenId01);
    assert.equal(asset1[4], 17000);

    let tokenURI = await instERC721SPLC.methods.tokenURI(1).call();
    assert.equal(tokenURI, URI_tokenId01);
    let tokenOwner = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc1);
    let balanceOf1B = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1B, 1);

    //-------------==Lockup for token transfers
    let LockUpPeriod = await instERC721SPLC.methods.LockUpPeriod().call();
    assert.equal(LockUpPeriod, 300);
    let tokenMintTime = await instERC721SPLC.methods.tokenMintTime().call();
    assert.equal(tokenMintTime, 1);
    const lockupUntil = await instERC721SPLC.methods.get_lockupUntil().call();
    assert.equal(lockupUntil, 301);
    console.log("lockupUntil = ", lockupUntil);
    const nowTime = await instERC721SPLC.methods.get_now().call();
    console.log("nowTime = ", nowTime);//now =  1542250964
    assert(parseInt(nowTime) > parseInt(lockupUntil));

    await instERC721SPLC.methods.setTokenMintTime(parseInt(nowTime)).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    tokenMintTime = await instERC721SPLC.methods.tokenMintTime().call();
    assert.equal(tokenMintTime, parseInt(nowTime));

    let _LockUpPeriod_inMins = 1; let _LockUpPeriod_inWeeks = 1;//1wk: 604800
    await instERC721SPLC.methods.setLockUpPeriod(_LockUpPeriod_inMins, _LockUpPeriod_inWeeks).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    let lockupperiod = _LockUpPeriod_inMins * 60 + _LockUpPeriod_inWeeks * 60 * 60 * 24 * 7;
    LockUpPeriod = await instERC721SPLC.methods.LockUpPeriod().call();
    assert.equal(LockUpPeriod, lockupperiod);

    console.log("after changing lockup time");
    // assert(balance3B > 1000);
    // assert(true);
    // console.log(typeof nowTime);


    await instERC721SPLC.methods.setTokenMintTime(1).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    
    //-------------==isAfterLockup: Open Lockup for token transfers
    // let isAfterLockup = await instERC721SPLC.methods.isAfterLockup().call();
    // assert.equal(isAfterLockup, false);
    // await instERC721SPLC.methods.set_isAfterLockup().send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//
    // isAfterLockup = await instERC721SPLC.methods.isAfterLockup().call();
    // assert.equal(isAfterLockup, true);

    //-------------==safeTransferFrom by owner
    console.log("safeTransferFrom by owner1");
    let _from = acc1; let _to = acc2; let _tokenId = 1;
    await instERC721SPLC.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc1, gas: '1000000'
    });//
    tokenOwner = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc2);

    let balanceOf1C = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1C, 0);
    let balanceOf2C = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2C, 1);

    //-------------==transferFrom by owner
    console.log("transferFrom by owner");
    let balanceOf3C = await instERC721SPLC.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3C, 0);
    _from = acc2; _to = acc3; _tokenId = 1;

    console.log("transferFrom by owner2");
    await instERC721SPLC.methods.transferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    balanceOf2C = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2C, 0);
    console.log("transferFrom by owner3");
    let balanceOf3D = await instERC721SPLC.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3D, 1);

    //-------------==owner approves, then the approved transfers via safeTransferFrom
    console.log("owner approves. the approved transfers via safeTransferFrom");
    const _approved = acc2; _tokenId = 1;
    await instERC721SPLC.methods.approve(_approved, _tokenId).send({
      value: '0', from: acc3, gas: '1000000'
    });// 
    let isApproved = await instERC721SPLC.methods.getApproved(_tokenId).call();
    assert.equal(isApproved, acc2);

    //safeTransferFrom by the approved
    _from = acc3; _to = acc2; _tokenId = 1;
    await instERC721SPLC.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    tokenOwner = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc2);
    let balanceOf3E = await instERC721SPLC.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3E, 0);
    let balanceOf2E = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2E, 1);


    //-------------==acc3 to set acc4 as operator
    console.log("operator transfers");
    let _owner = acc2; let _operator = acc4;
    isApproved = await instERC721SPLC.methods.isApprovedForAll(_owner, _operator).call();
    assert.equal(isApproved, false);

    await instERC721SPLC.methods.setApprovalForAll(_operator, true).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    isApproved = await instERC721SPLC.methods.isApprovedForAll(_owner, _operator).call();
    assert.equal(isApproved, true);
    
    //safeTransferFrom by the operator
    _from = acc2; _to = acc1; _tokenId = 1;
    await instERC721SPLC.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc4, gas: '1000000'
    });//
    tokenOwner = await instERC721SPLC.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc1);
    let balanceOf2F = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2F, 0);
    let balanceOf1E = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1E, 1); 

    //-------------==burn()
    _owner = acc1; _tokenId = 1;
    await instERC721SPLC.methods.burnNFT(_owner, _tokenId).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    console.log("after burnNFT");
    if (1===2){//The code below will fail ... but that is what we want to see, because
      //burned tokens will have owner == 0x0, which is not allowed!
      tokenOwner = await instERC721SPLC.methods.ownerOf(1).call();
      assert.equal(tokenOwner, addrZero);
    }
    let balanceOf2G = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2G, 0);
    let balanceOf1G = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1G, 0); 

  });
    */

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

-> approve(_approved, _tokenId) external canOperate(tokenId)... set approved address
    idToApprovals[_tokenId] = _approved;
-> getApproved(_tokenId) ... check the approved address

-> canTransfer(tokenId) ... used in transferFrom and safeTransferFrom
    tokenOwner == msg.sender || getApproved(_tokenId) == msg.sender || ownerToOperators[tokenOwner][msg.sender]
*/
    //-------------==
