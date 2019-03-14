/**
$ yarn global add mocha
$ yarn run test
*/
//const ganache = require('ganache-cli');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");

let provider, web3, gasLimitValue, gasPriceValue, prefix = '', chain;
console.log('process.argv', process.argv);
if (process.argv.length < 4) {
  console.log('not enough arguments. Make it like: yarn run deploy --chain 1');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  //console.log('ctrtName = platform, multisig, assetbook, registry,    erc721splc, crowdfunding');
  chain = 1;
} else {
  chain = parseInt(process.argv[3]);;
}
let timeCurrent = 201903081040; let txnNum = 1;
console.log('chain = ', chain, ', txnNum =', txnNum, ', timeCurrent =', timeCurrent);

let acc0; let acc1; let acc2; let acc3; let acc4;
let backendAddr; let AssetOwner1; let AssetOwner2;
let addrPlatformContract, addrMultiSig1, addrMultiSig2, addrAssetBook1, addrAssetBook2, addrRegistry, addrTokenController, addrERC721SPLC, addrCrowdFunding;
let backendPrivateKey, backendRawPrivateKey;
//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain
  console.log('inside chain === 1');
  addrPlatformContract = "0x9AC39FFC9de438F52DD3232ee07e95c5CDeDd4F9";
  addrMultiSig1 = "0xAF5065cD6A1cCe522D8ce712A5C7C52682740565";
  addrMultiSig2 = "0xc993fD11a829d96015Cea876D46ac67B5aADCAF1";
  
  addrAssetBook1 = "0x666da33635327eDC3Ddb620Ed9fa93fd06962575";
  addrAssetBook2 = "0x8e58F2253d68e681C0295599aec7576f3BCb5C4d";
  
  addrRegistry = "0x7192FCdDE5A7ad37E4F316fEca7EbE98b1634956";
  addrTokenController = "0xcc3903eb32b16C6Fd646BE9D2cda035F28e2BB3e";
  addrERC721SPLC = "0x303139caFBDAce44feE8B48Af16b276c02CE7De1";
  addrCrowdFunding = "0xa08BC0262dD868dFa7d33552612fA6C1539F389B";

  acc0 = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
  backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
  backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

  //acc0 = "0xe19082253bF60037EA79d2F530585629dB23A5c5";
  acc1 = "0xc808643EaafF6bfeAC44A809003B6Db816Bf9c5b";
  acc2 = "0x669Bc3d51f4920baef0B78899e98150Dcd013B50";
  acc3 = "0x4fF6a6E7E052aa3f046050028842d2D7704C7fB9";
  acc4 = "0xF0F7C2Bbfb931a9CD1788E9540e51B70014ad643";
  backendAddr = acc0;
  AssetOwner1 = acc1; AssetOwner2 = acc2;

  gasLimitValue = '7000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
  console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

  Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
  const nodeUrl = "http://140.119.101.130:8545";
  provider = new PrivateKeyProvider(backendPrivateKey, nodeUrl);
  web3 = new Web3(provider);
  prefix = '0x';
  console.log('leaving chain === 1');

} else if (chain === 2) {
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


console.log('\n---------------==Make contract instances from deployment');
//const addr1 = web3.utils.toChecksumAddress(addrPlatformContract);
const instPlatform = new web3.eth.Contract(Platform.abi, addrPlatformContract);
const instMultiSig1 = new web3.eth.Contract(MultiSig.abi,addrMultiSig1);
const instMultiSig2 = new web3.eth.Contract(MultiSig.abi,addrMultiSig2);
const instAssetBook1 = new web3.eth.Contract(AssetBook.abi,addrAssetBook1);
const instAssetBook2 = new web3.eth.Contract(AssetBook.abi,addrAssetBook2);

const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
const instERC721SPLC = new web3.eth.Contract(ERC721SPLC.abi, addrERC721SPLC);
// const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addrCrowdFunding);
// const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManagement);
// const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);

console.log('more variables...');
let management;
let balance0; let balance1; let balance2;
let platformCtAdmin;

let balance0A; let balance0B;
let balance1A; let balance1B;
let balance2A; let balance2B;

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
let uid1, uid2, extoAddr1; let extoAddr2;

let tokenId; let to; let _from; let uriStr; let uriBytes32; let uriStrB; let tokenOwner; let tokenOwnerM;
let tokenControllerDetail; let timeCurrentM;
let TimeTokenLaunchM; let TimeTokenUnlockM; let TimeTokenValidM; let isLaunchedM;
let bool1; let bool2;

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

const testDeployedCtrt = async () => {
    console.log('\n--------==Start tests...');
    management = [acc0, acc1, acc2, acc3, acc4];
    console.log('acc0', acc0);
    console.log('acc1', acc1);
    console.log('acc2', acc2);
    console.log('acc3', acc3);
    console.log('acc4', acc4);
    console.log('management', management);

    if (2===1) {
        balance0 = await web3.eth.getBalance(acc0);//returns strings!
        balance1 = await web3.eth.getBalance(acc1);//returns strings!
        balance2 = await web3.eth.getBalance(acc2);//returns strings!
        console.log('acc0',  acc0, balance0);//100,00000000,0000000000
        console.log('acc1',  acc1, balance1);
        console.log('acc2',  acc2, balance2);
    }


    console.log('Deployment Check: Good');

    //----------------==Check MultiSig & AssetBook contracts
    console.log('\n------------==Check MultiSig contract 1 & 2');
    console.log('addrMultiSig1', addrMultiSig1);
    console.log('addrMultiSig2', addrMultiSig2);
    let assetOwnerM1 = await instMultiSig1.methods.getAssetOwner().call();
    checkEq(assetOwnerM1, AssetOwner1);
    let assetOwnerM2 = await instMultiSig2.methods.getAssetOwner().call();
    checkEq(assetOwnerM2, AssetOwner2);

    console.log('\nCheck getPlatformContractAddr()');
    let platformM1 = await instMultiSig1.methods.getPlatformContractAddr().call();
    checkEq(platformM1, addrPlatformContract);
    let platformM2 = await instMultiSig2.methods.getPlatformContractAddr().call();
    checkEq(platformM2, addrPlatformContract);

    console.log('\n------------==Check AssetBook contract 1 & 2');
    console.log('addrAssetBook1', addrAssetBook1);
    console.log('addrAssetBook2', addrAssetBook2);

    let assetAddr = addrERC721SPLC;
    let assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    let assetsMeasured2 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('assetsMeasured1', assetsMeasured1);
    console.log('assetsMeasured2', assetsMeasured2);
    const amountInitAB1 = parseInt(assetsMeasured1[2]);
    const amountInitAB2 = parseInt(assetsMeasured2[2]);

    // return (AssetBook.assetSymbol, AssetBook.assetAddrIndex, 
    //   AssetBook.assetAmount, AssetBook.timeIndexStart, 
    //   AssetBook.timeIndexEnd, AssetBook.isInitialized);


    //----------------==Registry contract
    console.log('\n------------==Registry contract: add AssetBook contracts 1 & 2');
    let fromAddr, ctrtAddr, privateKey, encodedData;
    console.log('addrRegistry', addrRegistry);

    uid1 = "A500000001"; assetCtAddr = addrAssetBook1; extoAddr = acc1;
    console.log('uid1', uid1, 'assetCtAddr', assetCtAddr, 'extoAddr', extoAddr, 'timeCurrent', timeCurrent);

    fromAddr = backendAddr, ctrtAddr = addrRegistry;
    privateKey = backendPrivateKey;
    encodedData = instRegistry.methods.addUser(uid1, assetCtAddr, extoAddr, timeCurrent).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    console.log('\nafter addUser() on acc1:');
    let user1M = await instRegistry.methods.getUser(uid1).call();
    console.log('user1M', user1M);
    checkEq(user1M[0], uid1);
    checkEq(user1M[1], assetCtAddr);
    checkEq(user1M[2], extoAddr);
    checkEq(user1M[3], '0');


    uid2 = "A500000002"; assetCtAddr = addrAssetBook2; extoAddr = acc2;
    fromAddr = backendAddr, ctrtAddr = addrRegistry;
    privateKey = backendPrivateKey;
    encodedData = instRegistry.methods.addUser(uid2, assetCtAddr, extoAddr, timeCurrent).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    console.log('\nafter addUser() on acc2:');
    let user2M = await instRegistry.methods.getUser(uid2).call();
    checkEq(user2M[0], uid2);
    checkEq(user2M[1], assetCtAddr);
    checkEq(user2M[2], extoAddr);
    checkEq(user2M[3], '0');
    console.log('user2M', user2M);



    //----------------==
    console.log('\n------------==Check ERC721SPLC parameters');
    console.log('addrERC721SPLC', addrERC721SPLC);

    let nameM = await instERC721SPLC.methods.name().call();
    let symbolM = await instERC721SPLC.methods.symbol().call();
    let initialAssetPricingM = await instERC721SPLC.methods.initialAssetPricing().call();
    let IRR20yrx100M = await instERC721SPLC.methods.IRR20yrx100().call();
    let maxTotalSupplyM = await instERC721SPLC.methods.maxTotalSupply().call();
    let pricingCurrencyM = await instERC721SPLC.methods.pricingCurrency().call();
    let siteSizeInKWM = await instERC721SPLC.methods.siteSizeInKW().call();
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(nameM, nftName);
    checkEq(symbolM, nftSymbol);
    checkEq(initialAssetPricingM, ''+initialAssetPricing);
    checkEq(IRR20yrx100M, ''+IRR20yrx100);
    checkEq(maxTotalSupplyM, ''+maxTotalSupply);
    checkEq(pricingCurrencyM, ''+pricingCurrency);
    checkEq(siteSizeInKWM, ''+siteSizeInKW);

    let tokenIdX = parseInt(tokenIdM);
    checkEq(tokenIdM, tokenIdX.toString());
    const tokenIdXInit = tokenIdX;
    console.log("\x1b[33m", '\nConfirm tokenId = ', tokenIdM, 'tokenIdXInit', tokenIdXInit);

    let isUnlockedValid = await instTokenController.methods.isUnlockedValid().call();
    checkEq(isUnlockedValid, false);


    let supportsInterface0x80ac58cd = await instERC721SPLC.methods.supportsInterface("0x80ac58cd").call();
    checkEq(supportsInterface0x80ac58cd, true);
    let supportsInterface0x5b5e139f = await instERC721SPLC.methods.supportsInterface("0x5b5e139f").call();
    checkEq(supportsInterface0x5b5e139f, true);
    let supportsInterface0x780e9d63 = await instERC721SPLC.methods.supportsInterface("0x780e9d63").call();
    checkEq(supportsInterface0x780e9d63, true);

    //----------------==Mint Token One
    console.log('\n------------==Mint token: new tokenId =', tokenIdX+1);
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(tokenIdM, tokenIdX.toString());

    const uriBase = "nccu0".trim();
    //https://heliumcryptic.com/nccu011 is OVER bytes32!!! Error!!!
    uriStr = uriBase+(tokenIdX+1);
    console.log('uriStr', uriStr);

    uriBytes32 = web3.utils.fromAscii(uriStr);
    console.log('uriBytes32', uriBytes32);

    uriStrB = web3.utils.toAscii(uriBytes32);
    console.log('uriStrB', uriStrB);
    checkEq(uriStrB, uriStr);

    //let assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    //addrPlatformContract
    console.log('from Platform contract to ');
    // await instAssetBook1.methods.updateAssetOwner()
    // .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });

    await instPlatform.methods.setAssetCtrtApproval(addrAssetBook1, addrERC721SPLC, true)
    .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('check1');
    // await instAssetBook2.methods.updateAssetOwner()
    // .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });

    await instPlatform.methods.setAssetCtrtApproval(addrAssetBook2, addrERC721SPLC, true)
    .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nstart minting tokenId ', tokenIdX+1, '...');
    await instERC721SPLC.methods.mintSerialNFT(addrAssetBook1, uriBytes32).send({
      value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });

    tokenIdX += 1;
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(tokenIdM, tokenIdX.toString());

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX).call();
    checkEq(tokenOwnerM, addrAssetBook1);

    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX).call();
    console.log('tokenInfo from ERC721SPLC tokenId = ', tokenIdX, tokenInfo);
    /**
    const nftName = "NCCU site No.1(2018)";
    const nftSymbol = "NCCU1801";
    const siteSizeInKW = 300; const maxTotalSupply = 800; 
    const initialAssetPricing = 17000; const pricingCurrency = "NTD";
    const IRR20yrx100 = 470;
     */
    console.log('Here601');
    checkEq(tokenInfo[0], nftName);
    checkEq(tokenInfo[1], nftSymbol);
    checkEq(tokenInfo[2], pricingCurrency);
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), uriStr);
    checkEq(tokenInfo[4], initialAssetPricing.toString());

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
    console.log('\n------------==Mint Token in Batch: tokenId =', tokenIdX+1, tokenIdX+2, tokenIdX+3, ' to AssetBook1');
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(tokenIdM, tokenIdX.toString());

    addrAssetBookX = addrAssetBook1;
    let _tos = [addrAssetBookX, addrAssetBookX, addrAssetBookX];
    let _uriStrs = [uriBase+(tokenIdX+1), uriBase+(tokenIdX+2), uriBase+(tokenIdX+3)];
    const strToBytes32 = str => web3.utils.fromAscii(str);
    let _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    console.log('before mintSerialNFTBatch()');
    await instERC721SPLC.methods.mintSerialNFTBatch(_tos, _uriBytes32s).send({
      value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)
    tokenIdX += 3;
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(tokenIdM, tokenIdX.toString());

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX-2).call();
    checkEq(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX-1).call();
    checkEq(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX).call();
    checkEq(tokenOwnerM, addrAssetBookX);

    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX-2).call();
    console.log('\ntokenInfo from ERC721SPLC id = :', tokenIdX-2, tokenInfo);
    /**
    const nftName = "NCCU site No.1(2018)";
    const nftSymbol = "NCCU1801";
    const siteSizeInKW = 300; const maxTotalSupply = 800; 
    const initialAssetPricing = 17000; const pricingCurrency = "NTD";
    const IRR20yrx100 = 470;
     */
    checkEq(tokenInfo[0], nftName);
    checkEq(tokenInfo[1], nftSymbol);
    checkEq(tokenInfo[2], pricingCurrency);
    checkEq(tokenInfo[4], initialAssetPricing.toString());

    console.log('\ncheck uri of Id ', tokenIdX-2, tokenIdX-1, tokenIdX);
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), _uriStrs[0]);
    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX-1).call();
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), _uriStrs[1]);
    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX).call();
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), _uriStrs[2]);

    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    console.log('\ngetAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[0], 'NCCU1801');
    checkEq(assetsMeasured1[1], '1');//assetAddrIndex
    checkEq(assetsMeasured1[2], (amountInitAB1+4).toString());//amount
    //checkEq(assetsMeasured1[3], '0');//timeIndexStart
    //checkEq(assetsMeasured1[4], '3');//timeIndexEnd
    checkEq(assetsMeasured1[5], true);//isInitialized
    console.log("\x1b[33m", 'CHECK timeIndex start and end');
    //assetTimeIndexedTokenIdsM1 = await instAssetBook1.methods.getAssetTimeIndexedTokenIds(assetAddr).call();
    //console.log('assetTimeIndexedTokenIdsM1', assetTimeIndexedTokenIdsM1);
    // assetIdsM1 = await instAssetBook1.methods.getAssetIds(assetAddr).call();
    // console.log('assetIdsM1', assetIdsM1);

    //-----------------==Mint Token Batch
    console.log('\n------------==Mint Token in Batch: tokenId = ', tokenIdX+1, tokenIdX+2, tokenIdX+3, 'to AssetBook2');
    addrAssetBookX = addrAssetBook2;
    _tos = [addrAssetBookX, addrAssetBookX, addrAssetBookX];
    _uriStrs = [uriBase+(tokenIdX+1), uriBase+(tokenIdX+2), uriBase+(tokenIdX+3)];
    _uriBytes32s = _uriStrs.map(strToBytes32);
    console.log('_uriStrs', _uriStrs);
    console.log('_uriBytes32s', _uriBytes32s);

    await instERC721SPLC.methods.mintSerialNFTBatch(_tos, _uriBytes32s).send({
      value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });//function mintSerialNFTBatch(address[] calldata _tos, bytes32[] calldata _uris)

    tokenIdX += 3;
    tokenIdM = await instERC721SPLC.methods.tokenId().call();
    checkEq(tokenIdM, tokenIdX.toString());

    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX-2).call();
    checkEq(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX-1).call();
    checkEq(tokenOwnerM, addrAssetBookX);
    tokenOwnerM = await instERC721SPLC.methods.ownerOf(tokenIdX).call();
    checkEq(tokenOwnerM, addrAssetBookX);

    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX-2).call();
    console.log('tokenInfo from ERC721SPLC id = ', tokenIdX-2, tokenInfo);

    console.log('check uri of Id', tokenIdX-2, tokenIdX-1, tokenIdX);
    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX-1).call();
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), _uriStrs[1]);
    tokenInfo = await instERC721SPLC.methods.getNFT(tokenIdX).call();
    //checkEq(web3.utils.toAscii(tokenInfo[3]).trim(), _uriStrs[2]);

    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    console.log('\ngetAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[0], 'NCCU1801');
    checkEq(assetsMeasured1[1], '1');//assetAddrIndex
    checkEq(assetsMeasured1[2], (amountInitAB2+3).toString());//amount
    //checkEq(assetsMeasured1[3], '0');//timeIndexStart
    //checkEq(assetsMeasured1[4], '2');//timeIndexEnd
    checkEq(assetsMeasured1[5], true);//isInitialized
    console.log("\x1b[33m", 'CHECK timeIndex start and end');

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

    checkEq(owner, acc4);
    checkEq(chairman, acc3);
    checkEq(director, acc2);
    checkEq(manager, acc1);
    checkEq(admin, acc0);

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

    //----------------==Send tokens before Unlock Time
    console.log('\n------------==Send tokens before Unlock Time');
    timeCurrent = TimeTokenUnlock;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    checkEq(bool1, false);

    let _assetAddr = addrERC721SPLC; let amount = 1; 
    let _to = addrAssetBook1;
    tokenId = 1; _from = addrAssetBook1; to = addrAssetBook2;
    fromAddr = AssetOwner2, ctrtAddr = addrAssetBook2;
    privateKey = backendPrivateKey;
    let error = false;
    try {
      if (txnNum===1) {
        encodedData = instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
        signTxn(fromAddr, ctrtAddr, encodedData, privateKey);
    
      } else {
        await instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to)
        .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
        error = true;
      }
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt1 to assetCtrt2 failed because of not meeting the condition: timeCurrent < TimeTokenUnlock', timeCurrent, TimeTokenUnlock);
      //assert(err);
    }
    if (error) {
      console.log("\x1b[31m", '[Error] Why did not this fail???', error);
      process.exit(1);
    }


    //-------------------------==Send tokens
    //-----------------==Send Token One
    console.log('\n------------==Send token by one: amount = 1 from AssetBook2 to AssetBook1');
    timeCurrent = TimeTokenUnlock+1;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    checkEq(bool1, true);

    console.log('sending tokens via transferAssetBatch()...');

    if (txnNum===1) {
      fromAddr = AssetOwner2, ctrtAddr = addrAssetBook2;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to)
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)
    }

    console.log('transferAssetBatch is finished');
    //ERROR: Unknown address - unable to sign transaction for AssetOwner2!

    //Part of the transferAssetBatch code makes this function too big to run/compile!!! So fixTimeIndexedIds() must be run after calling transferAssetBatch()!!!
    if (txnNum===1) {
      fromAddr = AssetOwner2, ctrtAddr = addrAssetBook2;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook2.methods.fixTimeIndexedIds(_assetAddr, amount).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook2.methods.fixTimeIndexedIds(_assetAddr, amount)
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });//transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)
    }

    console.log('Check AssetBook2 after txn...');
    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[2], (amountInitAB2+2).toString());//amount
    //checkEq(assetsMeasured1[3], 1);//timeIndexStart
    //checkEq(assetsMeasured1[4], 2);//timeIndexEnd
    console.log("\x1b[33m", 'CHECK timeIndex start and end');

    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    //   asset.ids, erc721.get_ownerToIds(address(this)));

    console.log('AssetBook1 to receive tokens...');
    if (txnNum===1) {
      fromAddr = AssetOwner1, ctrtAddr = addrAssetBook1;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook1.methods.updateReceivedAsset(assetAddr).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook1.methods.updateReceivedAsset(assetAddr) 
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    }
    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[2], ''+(amountInitAB1+5));//amount
    //checkEq(assetsMeasured1[3], 0);//timeIndexStart
    //checkEq(assetsMeasured1[4], 4);//timeIndexEnd
    console.log("\x1b[33m", 'CHECK timeIndex start and end');


    //-----------------==Send Tokens in batch
    console.log('\n------------==Send tokens in batch: amount = 3 from AssetBook1 to AssetBook2');
    console.log('sending tokens via transferAssetBatch()...');
    amount = 3; _to = addrAssetBook2;

    if (txnNum===1) {
      fromAddr = AssetOwner1, ctrtAddr = addrAssetBook1;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook1.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook1.methods.transferAssetBatch(_assetAddr, amount, _to)
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    //transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)
    }
    console.log('transferAssetBatch is finished');

    if (txnNum===1) {
      fromAddr = AssetOwner1, ctrtAddr = addrAssetBook1;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook1.methods.fixTimeIndexedIds(_assetAddr, amount).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook1.methods.fixTimeIndexedIds(_assetAddr, amount)
      .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      //transferAssetBatch(_assetAddr, amount, _to, _timeCurrent)
    }
    console.log('Check AssetBook1 after txn...');
    assetsMeasured1 = await instAssetBook1.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[2], (amountInitAB1+2).toString());//amount
    //checkEq(assetsMeasured1[3], '3');//timeIndexStart
    //checkEq(assetsMeasured1[4], '4');//timeIndexEnd
    console.log("\x1b[33m", 'CHECK timeIndex start and end');

    // return (asset.assetSymbol, asset.assetAddrIndex, 
    //   asset.assetAmount, asset.timeIndexStart, 
    //   asset.timeIndexEnd, asset.isInitialized);
    //   asset.ids, erc721.get_ownerToIds(address(this)));

    console.log('AssetBook2 to receive tokens...');
    if (txnNum===1) {
      fromAddr = AssetOwner2, ctrtAddr = addrAssetBook2;
      privateKey = backendPrivateKey;
      encodedData = instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else {
      await instAssetBook2.methods.updateReceivedAsset(assetAddr) 
      .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
    }
    assetsMeasured1 = await instAssetBook2.methods.getAsset(assetAddr).call();
    console.log('getAsset(assetAddr):', assetsMeasured1);
    checkEq(assetsMeasured1[2], (amountInitAB2+5).toString());//amount
    //checkEq(assetsMeasured1[3], '1');//timeIndexStart
    //checkEq(assetsMeasured1[4], '4');//timeIndexEnd
    console.log("\x1b[33m", 'CHECK timeIndex start and end');


    //----------------==Send tokens after valid time
    console.log('\n------------==Send tokens after valid date');
    timeCurrent = TimeTokenValid;
    await instTokenController.methods.setTimeCurrent(timeCurrent)
    .send({ value: '0', from: acc0, gas: gasLimitValue, gasPrice: gasPriceValue });
    bool1 = await instTokenController.methods.isUnlockedValid().call(); 
    checkEq(bool1, false);

    amount = 1; to = addrAssetBook1;
    error = false;
    try {
      if (txnNum===1) {
        fromAddr = AssetOwner2, ctrtAddr = addrAssetBook2;
        privateKey = backendPrivateKey;
        encodedData = instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to).encodeABI();
        signTxn(fromAddr, ctrtAddr, encodedData, privateKey);
  
      } else {
        await instAssetBook2.methods.transferAssetBatch(_assetAddr, amount, _to)
        .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
        error = true;
      }
    } catch (err) {
      console.log('[Success] sending tokenId 1 from assetCtrt2 to assetCtrt1 failed because of not meeting the condition: timeCurrent > TimeTokenValid', timeCurrent, TimeTokenValid);
      //assert(err);
    }
    if (error) {
      console.log("\x1b[31m", '[Error] Why did not this fail???', error);
      process.exit(1);
    }

};
testDeployedCtrt();

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
