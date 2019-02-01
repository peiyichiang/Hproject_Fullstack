/**
$ yarn global add mocha
$ yarn run test
*/
const assert = require('assert');
const ganache = require('ganache-cli');
const options = { gasLimit: 8000000 };
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
const ctrtData = require('../ethereum/contracts/build/NFTokenSPLC.json');
//const { interface, bytecode } = require('../compile');//dot dot for one level up

if (ctrtData === undefined){console.log('[Error] ctrtData is NOT defined');
} else {console.log('[Good] ctrtData is defined; ctrtData:');
    //console.log(ctrtData);
}

//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let accounts;
let instCtrtData; let addrCtrtData;
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

    // console.log('\nacc0, from addr, owner, or accounts[0]');
    // console.log('acc1, to addr, or accounts[1]');
    // console.log('acc2, accounts[2]');

    //"NCCU site No.1(2018)", "NCCU1801", 300, 800, 17000, "NTD", 470, "01312038"
    const _nftName = "NCCU site No.1(2018)"; const _nftSymbol = "NCCU1801";
    const _siteSizeInKW = 300; const _maxTotalSupply = 800; 
    const _initialAssetPricing = 17000; const _pricingCurrency = "NTD";
    const _IRR20yrx100 = 470; const _validDate = "01312038";

    if (ctrtData.abi === undefined){console.log('[Error] ctrtData.abi is NOT defined');
    } else {console.log('[Good] ctrtData.abi is defined; ctrtData.abi:');
        //console.log(ctrtData.abi);
    }
    if (ctrtData.bytecode === undefined){console.log('[Error] ctrtData.bytecode is NOT defined');
    } else {console.log('[Good] ctrtData.bytecode is defined; ctrtData.bytecode:');
        //console.log(ctrtData.bytecode);
    }

    //https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    const args = [
        _nftName, _nftSymbol, _siteSizeInKW, _maxTotalSupply, 
        _initialAssetPricing, _pricingCurrency, _IRR20yrx100, _validDate
    ]
    instCtrtData = await new web3.eth.Contract(ctrtData.abi)
      .deploy({ data: ctrtData.bytecode, arguments: args
    })
    .send({ from: acc0, gas: '7000000', gasPrice: '9000000000' });
    /**
    instCtrtData = await new web3.eth.Contract(JSON.parse(ctrtData.interface))

    Error: Invalid number of parameters for "undefined". Got 0 expected 8!
    value: '0', from: acc0, gas: '1000000', gasPrice: '9000000000'
    value: web3.utils.toWei('10','ether')
     */
    //5940682 gas
  if (instCtrtData === undefined){console.log('[Error] instCtrtData is NOT defined');
    } else {console.log('[Good] instCtrtData is defined');}
  instCtrtData.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!

});

describe('ERC721_Functional_Test', () => {
  it('check ctrtData and ERC721 deployment test', async () => {
    assert.ok(instCtrtData.options.address);
    //test if the instanceCtrt has a property options, which has a property of address
    //test if such value exists or is not undefined
    addrCtrtData = instCtrtData.options.address;
    console.log('addrCtrtData', addrCtrtData);

    //console.log(instanceCtrt);
    //console.log(accounts);
  });


  it('ERC721_SPLC_H_Token read functions test', async () => {
    addrCtrtData = instCtrtData.options.address;//!!!!!!!!! different EVERY it()!!!
    console.log('addrCtrtData', addrCtrtData);

    let givenAssetName = "NCCU site No.1(2018)";
    let givenAssetSymbol = "NCCU1801";

    // await instCtrtData.methods.set_admin(acc1, acc0).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//set_tokenDump(address _tokenDump, address vendor)

    let owner = await instCtrtData.methods.owner().call();
    let ownerNew = await instCtrtData.methods.ownerNew().call();
    let manager = await instCtrtData.methods.manager().call();
    let admin = await instCtrtData.methods.admin().call();
    let chairman = await instCtrtData.methods.chairman().call();
    let director = await instCtrtData.methods.director().call();
    assert.equal(owner, acc0);
    assert.equal(ownerNew, addr0);
    assert.equal(manager, acc0);
    assert.equal(admin, acc0);
    assert.equal(chairman, acc0);
    assert.equal(director, acc0);

    let name = await instCtrtData.methods.name().call();
    let symbol = await instCtrtData.methods.symbol().call();
    let initialAssetPricing = await instCtrtData.methods.initialAssetPricing().call();
    let IRR20yrx100 = await instCtrtData.methods.IRR20yrx100().call();
    let isPreDelivery = await instCtrtData.methods.isPreDelivery().call();
    let maxTotalSupply = await instCtrtData.methods.maxTotalSupply().call();
    let pricingCurrency = await instCtrtData.methods.pricingCurrency().call();
    let SafeVault = await instCtrtData.methods.SafeVault().call();
    let SafeVaultNew = await instCtrtData.methods.SafeVaultNew().call();
    let siteSizeInKW = await instCtrtData.methods.siteSizeInKW().call();
    let nextTokenId = await instCtrtData.methods.nextTokenId().call();
    let ValidDate = await instCtrtData.methods.ValidDate().call();
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

    let supportsInterface0x80ac58cd = await instCtrtData.methods.supportsInterface("0x80ac58cd").call();
    assert.equal(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instCtrtData.methods.supportsInterface("0x5b5e139f").call();
    assert.equal(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instCtrtData.methods.supportsInterface("0x780e9d63").call();
    assert.equal(supportsInterface0x780e9d63, true);

    //-------------==set NewOwner to acc4
    await instCtrtData.methods.addNewOwner(acc4).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    ownerNew = await instCtrtData.methods.ownerNew().call();
    assert.equal(ownerNew, acc4);
    await instCtrtData.methods.transferOwnership().send({
      value: '0', from: acc4, gas: '1000000'
    });//
    owner = await instCtrtData.methods.owner().call();
    assert.equal(owner, acc4);

  });

  it('mintSerialNFT -> safeTransferFrom & transferFrom initiated by owner', async () => {
    addrCtrtData = instCtrtData.options.address;
    console.log('addrCtrtData', addrCtrtData);

    //-------------==balances
    const balance0A = await instCtrtData.methods.balanceOf(acc0).call();
    assert.equal(balance0A, 0);
    const balance1A = await instCtrtData.methods.balanceOf(acc1).call();
    assert.equal(balance1A, 0);
    const balance3A = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balance3A, 0);
    // assert(balance3B > 1000);

    //-------------==set SafeVault to acc1
    await instCtrtData.methods.addNewSafeVault(acc1).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    let SafeVaultNew = await instCtrtData.methods.SafeVaultNew().call();
    assert.equal(SafeVaultNew, acc1);

    await instCtrtData.methods.setNewSafeVault().send({
      value: '0', from: acc1, gas: '1000000'
    });//
    let SafeVault = await instCtrtData.methods.SafeVault().call();
    assert.equal(SafeVault, acc1);

    //-------------==
    nextTokenId = await instCtrtData.methods.nextTokenId().call();
    assert.equal(nextTokenId, 1);

    const URI_tokenId01 = "nccu01";
    await instCtrtData.methods.mintSerialNFT(URI_tokenId01).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    nextTokenId = await instCtrtData.methods.nextTokenId().call();
    assert.equal(nextTokenId, 2);

    let asset1 = await instCtrtData.methods.getNFT(1).call();
    console.log('asset1', asset1);

    let givenAssetName = "NCCU site No.1(2018)";
    let givenAssetSymbol = "NCCU1801";
    assert.equal(asset1[0], givenAssetName);
    assert.equal(asset1[1], givenAssetSymbol);
    assert.equal(asset1[2], "NTD");
    assert.equal(asset1[3], URI_tokenId01);
    assert.equal(asset1[4], 17000);

    let tokenURI = await instCtrtData.methods.tokenURI(1).call();
    assert.equal(tokenURI, URI_tokenId01);
    let tokenOwner = await instCtrtData.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc1);
    let balanceOf1B = await instCtrtData.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1B, 1);

    //-------------==Lockup for token transfers
    let LockUpPeriod = await instCtrtData.methods.LockUpPeriod().call();
    assert.equal(LockUpPeriod, 300);
    let tokenMintTime = await instCtrtData.methods.tokenMintTime().call();
    assert.equal(tokenMintTime, 1);
    const lockupUntil = await instCtrtData.methods.get_lockupUntil().call();
    assert.equal(lockupUntil, 301);
    console.log("lockupUntil = ", lockupUntil);
    const nowTime = await instCtrtData.methods.get_now().call();
    console.log("nowTime = ", nowTime);//now =  1542250964
    assert(parseInt(nowTime) > parseInt(lockupUntil));

    await instCtrtData.methods.setTokenMintTime(parseInt(nowTime)).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    tokenMintTime = await instCtrtData.methods.tokenMintTime().call();
    assert.equal(tokenMintTime, parseInt(nowTime));

    let _LockUpPeriod_inMins = 1; let _LockUpPeriod_inWeeks = 1;//1wk: 604800
    await instCtrtData.methods.setLockUpPeriod(_LockUpPeriod_inMins, _LockUpPeriod_inWeeks).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    let lockupperiod = _LockUpPeriod_inMins * 60 + _LockUpPeriod_inWeeks * 60 * 60 * 24 * 7;
    LockUpPeriod = await instCtrtData.methods.LockUpPeriod().call();
    assert.equal(LockUpPeriod, lockupperiod);

    console.log("after changing lockup time");
    // assert(balance3B > 1000);
    // assert(true);
    // console.log(typeof nowTime);


    await instCtrtData.methods.setTokenMintTime(1).send({
      value: '0', from: acc0, gas: '1000000'
    });//

    //-------------==isAfterLockup: Open Lockup for token transfers
    // let isAfterLockup = await instCtrtData.methods.isAfterLockup().call();
    // assert.equal(isAfterLockup, false);
    // await instCtrtData.methods.set_isAfterLockup().send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//
    // isAfterLockup = await instCtrtData.methods.isAfterLockup().call();
    // assert.equal(isAfterLockup, true);

    //-------------==safeTransferFrom by owner
    console.log("safeTransferFrom by owner1");
    let _from = acc1; let _to = acc2; let _tokenId = 1;
    await instCtrtData.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc1, gas: '1000000'
    });//
    tokenOwner = await instCtrtData.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc2);

    let balanceOf1C = await instCtrtData.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1C, 0);
    let balanceOf2C = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2C, 1);

    //-------------==transferFrom by owner
    console.log("transferFrom by owner");
    let balanceOf3C = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3C, 0);
    _from = acc2; _to = acc3; _tokenId = 1;

    console.log("transferFrom by owner2");
    await instCtrtData.methods.transferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    balanceOf2C = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2C, 0);
    console.log("transferFrom by owner3");
    let balanceOf3D = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3D, 1);

    //-------------==owner approves, then the approved transfers via safeTransferFrom
    console.log("owner approves. the approved transfers via safeTransferFrom");
    const _approved = acc2; _tokenId = 1;
    await instCtrtData.methods.approve(_approved, _tokenId).send({
      value: '0', from: acc3, gas: '1000000'
    });// 
    let isApproved = await instCtrtData.methods.getApproved(_tokenId).call();
    assert.equal(isApproved, acc2);

    //safeTransferFrom by the approved
    _from = acc3; _to = acc2; _tokenId = 1;
    await instCtrtData.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    tokenOwner = await instCtrtData.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc2);
    let balanceOf3E = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3E, 0);
    let balanceOf2E = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2E, 1);


    //-------------==acc3 to set acc4 as operator
    console.log("operator transfers");
    let _owner = acc2; let _operator = acc4;
    isApproved = await instCtrtData.methods.isApprovedForAll(_owner, _operator).call();
    assert.equal(isApproved, false);

    await instCtrtData.methods.setApprovalForAll(_operator, true).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    isApproved = await instCtrtData.methods.isApprovedForAll(_owner, _operator).call();
    assert.equal(isApproved, true);
    
    //safeTransferFrom by the operator
    _from = acc2; _to = acc1; _tokenId = 1;
    await instCtrtData.methods.safeTransferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc4, gas: '1000000'
    });//
    tokenOwner = await instCtrtData.methods.ownerOf(1).call();
    assert.equal(tokenOwner, acc1);
    let balanceOf2F = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2F, 0);
    let balanceOf1E = await instCtrtData.methods.balanceOf(acc1).call();
    assert.equal(balanceOf1E, 1); 

    //-------------==burn()
    _owner = acc1; _tokenId = 1;
    await instCtrtData.methods.burnNFT(_owner, _tokenId).send({
      value: '0', from: acc0, gas: '1000000'
    });//
    console.log("after burnNFT");
    if (1===2){//The code below will fail ... but that is what we want to see, because
      //burned tokens will have owner == 0x0, which is not allowed!
      tokenOwner = await instCtrtData.methods.ownerOf(1).call();
      assert.equal(tokenOwner, addr0);
    }
    let balanceOf2G = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2G, 0);
    let balanceOf1G = await instCtrtData.methods.balanceOf(acc1).call();
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