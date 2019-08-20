/**
chain: 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,
*/
/** deployed contracts
yarn run deploy -c 1 -s 1 -cName cf
cName = addia
*/
const Web3 = require('web3');
const PrivateKeyProvider = require("truffle-privatekey-provider");

const { blockchainURL, gasLimitValue, gasPriceValue, isTimeserverON } = require('../../timeserver/envVariables');

const {addSmartContractRow, addProductRow, addUsersIntoDB, addOrdersIntoDB, addIncomeArrangementRowsIntoDB } = require('../../timeserver/mysql.js');

const { getTime, asyncForEach } = require('../../timeserver/utilities');

const { addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray,  symNum, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid, CFSD, CFED, argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManagement
} = require('./zTestParameters');

const { TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManagement, ProductManager
} = require('./zsetupData');

//to be overwritten as we are deploying new contracts
//let {} = require('./zsetupData');

let provider, web3, web3deploy, prefix = '';
console.log('process.argv', process.argv);
if (process.argv.length < 8) {
  console.log('not enough arguments. Make it like: yarn run deploy -n 1 --chain 1 --cName contractName');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log('cName = helium, addproduct, addorder, im, addctrt, addPS, pm');
  process.exit(1);
}
// chain    symNum   ctrtName
//const symNum = parseInt(process.argv[5]);
let chain, ctrtName, result, backendAddr, backendAddrpkRaw;



const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;

const ethAddrChoice = 1;//0 API dev, 1 Blockchain dev, 2 Backend dev, 3 .., 4 timeserver
if(ethAddrChoice === 0){//reserved to API developer
  backendAddr = admin;
  backendAddrpkRaw = adminpkRaw;

} else if(ethAddrChoice === 1){//reserved to Blockchain developer
  backendAddr = AssetOwner1;
  backendAddrpkRaw = AssetOwner1pkRaw;

} else if(ethAddrChoice === 2){//reserved to Backend developer
  backendAddr = AssetOwner2;
  backendAddrpkRaw = AssetOwner2pkRaw;

} else if(ethAddrChoice === 3){//
  backendAddr = AssetOwner3;
  backendAddrpkRaw = AssetOwner3pkRaw;

} else if(ethAddrChoice === 4){//reserved tp the timeserver
  backendAddr = AssetOwner4;
  backendAddrpkRaw = AssetOwner4pkRaw;
}
console.log('from backendAddr:', backendAddr);

console.log('process.argv', process.argv);
const arguLen = process.argv.length;
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run deploy -c C --f F -a A -b b');
  console.log("\x1b[32m", 'C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log("\x1b[32m", '...');
  console.log("\x1b[32m", 'a, b, ... are arguments used in above functions ...');
  process.exit(0);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 4) {
  console.log('not enough arguments. --h for help');
  chain = 1;
} else {
  //Number.isInteger(process.argv[3])
  chain = parseInt(process.argv[3]);
  if (chain < 0) {
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
      ctrtName = process.argv[7]
    }

  }
}
console.log('chain = ', chain, ', ctrtName =', ctrtName);


//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
// gasLimitValue = 9000000;//intrinsic gas too low
// gasPriceValue = 0;//insufficient fund for gas * gasPrice + value

if (chain === 1) {//POA private chain
  backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
  console.log('web3.version', web3deploy.version);
  prefix = '0x';

} else if (chain === 2) {//2: POW private chain
  
  backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
  //provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);

  //web3.setProvider(ganache.provider());

  //Exceeds block gas limit
  //https://github.com/trufflesuite/ganache-cli
  const ganache = require("ganache-cli");
  //9140000000000000000 => 7ED7CD92FF120000
  const options = { gasLimit: gasLimitValue, accounts: [{balance: 9140000000000000000, secretKey: pkey}] };
  //const server = ganache.server(options);
  provider = ganache.provider(options);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
  
} else if (chain === 3) {
  const options = { gasLimit: gasLimitValue };
  provider = ganache.provider(options);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

} else {
  console.log('chain is out of range. chain =', chain);
  process.exit(1);
}
console.log(`-------------------==connecting to chain: ${chain}
gasLimit: ${gasLimitValue}, gasPrice: ${gasPriceValue}`);

const gasLimitValueStr = gasLimitValue+'';
const gasPriceValueStr = gasPriceValue+'';

//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let instRegistry, instHCAT721, instIncomeManager, instProductManager;
let balance0, balance1, balance2;
let argsAssetBookN, argsAssetBook1, argsAssetBook2, argsAssetBook3, argsAssetBook4;
let instAssetBookN, instAssetBook1, instAssetBook2, instAssetBook3, instAssetBook4; 

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

//--------------------==
console.log('\n---------------==Load contract json file compiled from sol file');
//const { interface, bytecode } = require('../compile');//dot dot for one level up



//-----------------------------==Functions
checkTrue = (item) => item;


//-----------------------------==
const deploy = async () => {
    console.log('\n--------==To deploy');

    // console.log('AssetOwner1', AssetOwner1);
    // console.log('AssetOwner2', AssetOwner2);
    // console.log('AssetOwner3', AssetOwner3);
    // console.log('AssetOwner4', AssetOwner4);

    if (2===1) {
        balance0 = await web3deploy.eth.getBalance(admin);//returns strings!
        balance1 = await web3deploy.eth.getBalance(AssetOwner1);//returns strings!
        balance2 = await web3deploy.eth.getBalance(AssetOwner2);//returns strings!
        console.log('admin',  admin, balance0);//100,00000000,0000000000
        console.log('AssetOwner1',  AssetOwner1, balance1);
        console.log('AssetOwner2',  AssetOwner2, balance2);
    }

    console.log('\nDeploying contracts...');
    //JSON.parse() is not needed because the abi and bytecode are already objects

    //yarn run deploy -c 1 -s 1 -cName helium
    if (ctrtName === 'helium') {
      //Deploying Helium contract...



      //yarn run deploy -c 1 -s 1 -cName testctrt
    } else if (ctrtName === 'testctrt') {
      console.log('\nDeploying testCtrt contracts...');
      const HCAT721SerialNumber = 2020;
      const argsTestCtrt = [HCAT721SerialNumber, addrHelium];
      instTestCtrt =  await new web3deploy.eth.Contract(TestCtrt.abi)
      .deploy({ data: prefix+TestCtrt.bytecode, arguments: argsTestCtrt })
      .send({ from: backendAddr, gas: gasLimitValueStr, gasPrice: gasPriceValueStr })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('TestCtrt has been deployed');
      if (instTestCtrt === undefined) {
        console.log('[Error] instTestCtrt is NOT defined');
        } else {console.log('[Good] instTestCtrt is defined');}
      instTestCtrt.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      console.log(`addrTestCtrt = ${instTestCtrt.options.address}`);
      process.exit(0);


    } else if (ctrtName === 'multisig') {
      const argsMultiSig1 = [AssetOwner1, addrHelium];
      const argsMultiSig2 = [AssetOwner2, addrHelium];

      console.log('\nDeploying multiSig contracts...');
      instMultiSig1 =  await new web3deploy.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig1 })
      .send({ from: backendAddr, gas: gasLimitValueStr, gasPrice: gasPriceValueStr })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('MultiSig1 has been deployed');
      if (instMultiSig1 === undefined) {
        console.log('[Error] instMultiSig1 is NOT defined');
        } else {console.log('[Good] instMultiSig1 is defined');}
      instMultiSig1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig1 = instMultiSig1.options.address;
      console.log('addrMultiSig1:', addrMultiSig1);
      console.log('\nwaiting for addrMultiSig2...');

      instMultiSig2 =  await new web3deploy.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig2 })
      .send({ from: backendAddr, gas: gasLimitValueStr, gasPrice: gasPriceValueStr })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('MultiSig2 has been deployed');
      if (instMultiSig2 === undefined) {
        console.log('[Error] instMultiSig2 is NOT defined');
        } else {console.log('[Good] instMultiSig2 is defined');}
      instMultiSig2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig2 = instMultiSig2.options.address;

      console.log('addrMultiSig1:', addrMultiSig1);
      console.log('addrMultiSig2:', addrMultiSig2);
      process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName assetbook
  } else if (ctrtName === 'assetbook') {

  //yarn run deploy -c 1 -s 1 -cName assetbookGroupB
  } else if (ctrtName === 'assetbookGroupB') {

  //yarn run deploy -c 1 -s 1 -cName assetbookx
  } else if (ctrtName === 'assetbookx'){


  //yarn run deploy -c 1 -s 1 -cName registry
  } else if (ctrtName === 'registry') {


  //yarn run deploy -c 1 -n 0 -cName cf
  } else if (ctrtName === 'cf') {


  //yarn run deploy -c 1 -s 1 -cName tokc
  } else if (ctrtName === 'tokc') {


  //yarn run deploy -c 1 -s 1 -cName hcat/hcattest
  } else if (ctrtName === 'hcat' || ctrtName === 'hcattest') {

    //yarn run deploy -c 1 -s 1 -cName im
  } else if (ctrtName === 'im') {


  } else if (ctrtName === 'check1'){


  } else if (ctrtName === 'adduser'){//adduser
  
  
  } else if (ctrtName === 'addctrt'){//addSmartContractRowAPI


  } else if (ctrtName === 'addproduct'){//addproduct


  } else if (ctrtName === 'addorder'){//addorder


  } else if (ctrtName === 'addia'){

  } else if (ctrtName === 'initCtrt'){

  } else if (ctrtName === 'pm') {

  } else if (ctrtName === 'db2'){

  } else {
    console.log('ctrtName is not found');
    process.exit(0);
  }


}

//---------------------------==
//---------------------------==
/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: 9000000,
                  gasPrice: 0,
                  //gasPrice: web3js.utils.toHex(20 * 1e9),
                  //gasLimit: web3.utils.toHex(3400000),
                  to: contractAddr,
                  value: 0,
                  data: encodedData
              }

              let tx = new Tx(txParams);
              tx.sign(userPrivateKey);
              const serializedTx = tx.serialize();
              const rawTx = '0x' + serializedTx.toString('hex');

              //console.log('☆ RAW TX ☆\n', rawTx);

              web3.eth.sendSignedTransaction(rawTx)
                  .on('transactionHash', hash => {
                      //console.log(hash);
                  })
                  .on('confirmation', (confirmationNumber, receipt) => {
                      // //console.log('confirmation', confirmationNumber);
                  })
                  .on('receipt', function (receipt) {
                      //console.log(receipt);
                      resolve(receipt)
                  })
                  .on('error', function (err) {
                      //console.log(err);
                      reject(err);
                  });
          });

  });
}


deploy();
