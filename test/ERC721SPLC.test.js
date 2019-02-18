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

const Registry = require('../ethereum/contracts/build/Registry.json');
if (Registry === undefined){
  console.log('[Error] Registry is NOT defined');
} else {
  console.log('[Good] Registry is defined');
  if (Registry.abi === undefined){
    console.log('[Error] Registry.abi is NOT defined');
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
  console.log('[Error] ERC721SPLC_Controller is NOT defined');
} else {
  console.log('[Good] ERC721SPLC_Controller is defined');
  if (ERC721SPLC_Controller.abi === undefined){
    console.log('[Error] ERC721SPLC_Controller.abi is NOT defined');
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

const ERC721SPLC = require('../ethereum/contracts/build/ERC721SPLC.json');
if (ERC721SPLC === undefined){
  console.log('[Error] ERC721SPLC is NOT defined');
} else {
  console.log('[Good] ERC721SPLC is defined');
  if (ERC721SPLC.abi === undefined){
    console.log('[Error] ERC721SPLC.abi is NOT defined');
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

//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let accounts;
let instRegistry; let addrRegistry;
let instERC721SPLC_Controller; let addrERC721SPLC_Controller;
let instERC721SPLC; let addrERC721SPLC;

let acc0; let acc1; let acc2; let acc4;
let balance0; let balance1; let balance2;
let balance1A; let balance2A;

//const rate = new BigNumber('1e22').mul(value);
const addr0 = "0x0000000000000000000000000000000000000000";
beforeEach( async () => {
    //use one of these accounts to deploy the contract
    accounts = await web3.eth.getAccounts();
    acc0 = accounts[0];
    acc1 = accounts[1];
    acc2 = accounts[2];
    acc3 = accounts[3];
    acc4 = accounts[4];

    if (2===1) {
        balance0 = await web3.eth.getBalance(acc0);//returns strings!
        balance1 = await web3.eth.getBalance(acc1);//returns strings!
        balance2 = await web3.eth.getBalance(acc2);//returns strings!
        console.log('acc0',  acc0, balance0);//100,00000000,0000000000
        console.log('acc1',  acc1, balance1);
        console.log('acc2',  acc2, balance2);
    }

    console.log('\n', acc0, ' = acc0');
    // console.log('acc1, to addr, or accounts[1]');
    // console.log('acc2, accounts[2]');

    console.log('Deploying contracts...');

    //check if json file is too small like 500B
    instRegistry =  await new web3.eth.Contract(JSON.parse(Registry.abi))
    .deploy({ data: Registry.bytecode })
    .send({ from: acc0, gas: '7000000', gasPrice: '1000000000' })
    .then(console.log);
    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined){
      console.log('[Error] instRegistry is NOT defined');
      } else {console.log('[Good] instRegistry is defined');}
    instRegistry.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!

    
    //Deploying ERC721SPLC_Controller contract...
    const argsERC721SPLC_Controller = [
      _currentTime, _TokenLaunchTime, _TokenUnlockTime, _TokenValidTime ]
    instERC721SPLC_Controller = await new web3.eth.Contract(ERC721SPLC_Controller.abi)
    .deploy({ data: ERC721SPLC_Controller.bytecode, arguments: argsERC721SPLC_Controller })
    .send({ from: acc0, gas: '7000000', gasPrice: '1000000000' });
    console.log('ERC721SPLC_Controller.sol has been deployed');
    if (instERC721SPLC_Controller === undefined){
      console.log('[Error] instERC721SPLC_Controller is NOT defined');
      } else {console.log('[Good] instERC721SPLC_Controller is defined');}
    instERC721SPLC_Controller.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
  

    //"NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "01312038"
    const _nftName = "NCCU site No.1(2018)";
    const _nftSymbol = "NCCU1801";
    const _siteSizeInKW = 300; const _maxTotalSupply = 800; 
    const _initialAssetPricing = 17000; const _pricingCurrency = "NTD";
    const _IRR20yrx100 = 470; 
    const _currentTime = 201902150000;
    const _TokenValidTime = 203903310000;
    const _TokenUnlockTime = 201901310000; 
    const _addrRegistry = "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a";
    const _addrERC721SPLC_Controller = "0x39523jt032";
    /**
    "NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, 201902150000,
    203903310000, 201901310000, "0xefD9Ae81Ca997a12e334fDE1fC45d5491f8E5b8a"
    */


    //https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    const args = [
        _nftName, _nftSymbol, _siteSizeInKW, _maxTotalSupply, 
        _initialAssetPricing, _pricingCurrency, _IRR20yrx100,
        _addrRegistry, _addrERC721SPLC_Controller ]
    instERC721SPLC = await new web3.eth.Contract(ERC721SPLC.abi)
      .deploy({ data: ERC721SPLC.bytecode, arguments: args
    })
    .send({ from: acc0, gas: '9000000', gasPrice: '1000000000' });
    /**
    instERC721SPLC = await new web3.eth.Contract(JSON.parse(ERC721SPLC.interface))
        string memory _nftName, string memory _nftSymbol, uint _siteSizeInKW, 
        uint _maxTotalSupply, uint _initialAssetPricing, 
        string memory _pricingCurrency, uint _IRR20yrx100,
        uint _currentTime, uint _TokenValidTime, uint _TokenUnlockTime, 
        address _addrRegistry) public {

    ### Error: Invalid number of parameters for "undefined". Got 0 expected 8!
    value: '0', from: acc0, gas: '1000000', gasPrice: '9000000000'
    value: web3.utils.toWei('10','ether')
     */
    //5940682 gas
  if (instERC721SPLC === undefined){
    console.log('[Error] instERC721SPLC is NOT defined');
    } else {console.log('[Good] instERC721SPLC is defined');}
  instERC721SPLC.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!

});

describe('ERC721SPLC_Functional_Test', () => {
  it('check ERC721SPLC deployment test', async () => {
    assert.ok(instERC721SPLC.options.address);
    //test if the instanceCtrt has a property options, which has a property of address
    //test if such value exists or is not undefined
    addrERC721SPLC = instERC721SPLC.options.address;
    console.log('addrERC721SPLC', addrERC721SPLC);

    //console.log(instanceCtrt);
    //console.log(accounts);
  });


  it('ERC721SPLC_H_Token read functions test', async () => {
    addrERC721SPLC = instERC721SPLC.options.address;//!!!!!!!!! different EVERY it()!!!
    console.log('addrERC721SPLC', addrERC721SPLC);

    let givenAssetName = "NCCU site No.1(2018)";
    let givenAssetSymbol = "NCCU1801";

    // await instERC721SPLC.methods.set_admin(acc1, acc0).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//set_tokenDump(address _tokenDump, address vendor)

    let owner = await instERC721SPLC.methods.owner().call();
    let ownerNew = await instERC721SPLC.methods.ownerNew().call();
    let manager = await instERC721SPLC.methods.manager().call();
    let admin = await instERC721SPLC.methods.admin().call();
    let chairman = await instERC721SPLC.methods.chairman().call();
    let director = await instERC721SPLC.methods.director().call();
    assert.equal(owner, acc0);
    assert.equal(ownerNew, addr0);
    assert.equal(manager, acc0);
    assert.equal(admin, acc0);
    assert.equal(chairman, acc0);
    assert.equal(director, acc0);

    let name = await instERC721SPLC.methods.name().call();
    let symbol = await instERC721SPLC.methods.symbol().call();
    let initialAssetPricing = await instERC721SPLC.methods.initialAssetPricing().call();
    let IRR20yrx100 = await instERC721SPLC.methods.IRR20yrx100().call();
    let isPreDelivery = await instERC721SPLC.methods.isPreDelivery().call();
    let maxTotalSupply = await instERC721SPLC.methods.maxTotalSupply().call();
    let pricingCurrency = await instERC721SPLC.methods.pricingCurrency().call();
    let SafeVault = await instERC721SPLC.methods.SafeVault().call();
    let SafeVaultNew = await instERC721SPLC.methods.SafeVaultNew().call();
    let siteSizeInKW = await instERC721SPLC.methods.siteSizeInKW().call();
    let nextTokenId = await instERC721SPLC.methods.nextTokenId().call();
    let ValidDate = await instERC721SPLC.methods.ValidDate().call();
    assert.equal(name, givenAssetName);
    assert.equal(symbol, givenAssetSymbol);
    assert.equal(initialAssetPricing, 17000);
    assert.equal(IRR20yrx100, 470);
    assert.equal(isPreDelivery, true);
    assert.equal(maxTotalSupply, 800);
    assert.equal(pricingCurrency, "NTD");
    assert.equal(SafeVault, acc0);
    assert.equal(SafeVaultNew, addr0);
    assert.equal(siteSizeInKW, 300);
    assert.equal(nextTokenId, 1);
    assert.equal(ValidDate, "01312038");

    let supportsInterface0x80ac58cd = await instERC721SPLC.methods.supportsInterface("0x80ac58cd").call();
    assert.equal(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instERC721SPLC.methods.supportsInterface("0x5b5e139f").call();
    assert.equal(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instERC721SPLC.methods.supportsInterface("0x780e9d63").call();
    assert.equal(supportsInterface0x780e9d63, true);

    //-------------==set NewOwner to acc4
    await instERC721SPLC.methods.addNewOwner(acc4).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    ownerNew = await instERC721SPLC.methods.ownerNew().call();
    assert.equal(ownerNew, acc4);
    await instERC721SPLC.methods.transferOwnership().send({
      value: '0', from: acc4, gas: '1000000'
    });//
    owner = await instERC721SPLC.methods.owner().call();
    assert.equal(owner, acc4);

  });

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

    //-------------==set SafeVault to acc1
    await instERC721SPLC.methods.addNewSafeVault(acc1).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    let SafeVaultNew = await instERC721SPLC.methods.SafeVaultNew().call();
    assert.equal(SafeVaultNew, acc1);

    await instERC721SPLC.methods.setNewSafeVault().send({
      value: '0', from: acc1, gas: '1000000'
    });//
    let SafeVault = await instERC721SPLC.methods.SafeVault().call();
    assert.equal(SafeVault, acc1);

    //-------------==
    nextTokenId = await instERC721SPLC.methods.nextTokenId().call();
    assert.equal(nextTokenId, 1);

    const URI_tokenId01 = "nccu01";
    await instERC721SPLC.methods.mintSerialNFT(URI_tokenId01).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    nextTokenId = await instERC721SPLC.methods.nextTokenId().call();
    assert.equal(nextTokenId, 2);

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
      assert.equal(tokenOwner, addr0);
    }
    let balanceOf2G = await instERC721SPLC.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2G, 0);
    let balanceOf1G = await instERC721SPLC.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1G, 0); 

    /**
    get_idToOwnerIndexPlus1
    get_ownerToIds
    tokenOfOwnerByIndex
    tokenStatus
    tokenURI
    totalSupply
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


});