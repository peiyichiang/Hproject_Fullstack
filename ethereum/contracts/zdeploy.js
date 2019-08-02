/**
chain: 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,
*/
/** deployed contracts
yarn run deploy -c 1 -s 1 -cName cf
cName = helium, assetbook, registry, adduser, cf, tokc, hcat, addproduct, addorder, im, addctrt, addia, pm
*/
const Web3 = require('web3');
const PrivateKeyProvider = require("truffle-privatekey-provider");

const {addSmartContractRow, addProductRow, addUsersIntoDB, addOrdersIntoDB, addIncomeArrangementRowsIntoDB } = require('../../timeserver/mysql.js');

const { getTime, asyncForEach } = require('../../timeserver/utilities');

const { isTimeserverON, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, assetOwnerArray, assetOwnerpkRawArray, symNum, blockchainURL, TimeOfDeployment_HCAT, TimeTokenUnlock, TimeTokenValid, CFSD, CFED, fundmanager, argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManager, TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManager, ProductManager, userArray, incomeArrangementArray
} = require('./zsetupData');

//to be overwritten as we are deploying new contracts
let {addrHelium, addrRegistry, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager} = require('./zsetupData');

let provider, web3, web3deploy, gasLimitValue, gasPriceValue, prefix = '';
console.log('process.argv', process.argv);
if (process.argv.length < 8) {
  console.log('not enough arguments. Make it like: yarn run deploy -n 1 --chain 1 --cName contractName');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log('cName = helium, assetbook, registry, cf, tokc, hcat, addproduct, addorder, im, addctrt, addPS, pm');
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
if (chain === 1) {//POA private chain
  gasLimitValue = '7000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value

  backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
  console.log('web3.version', web3deploy.version);
  prefix = '0x';

} else if (chain === 2) {//2: POW private chain
  gasLimitValue = '7000000';// for POW private chain
  gasPriceValue = '20000000000';//100000000000000000
  
  backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
  //provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);

  //web3.setProvider(ganache.provider());

  //Exceeds block gas limit
  //https://github.com/trufflesuite/ganache-cli
  const ganache = require("ganache-cli");
  //9140000000000000000 => 7ED7CD92FF120000
  const options = { gasLimit: 8000000, accounts: [{balance: 9140000000000000000, secretKey: pkey}] };
  //const server = ganache.server(options);
  provider = ganache.provider(options);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
  
} else if (chain === 3) {
  const options = { gasLimit: 7000000 };
  gasLimitValue = '5000000';// for POW Infura Rinkeby chain
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

} else {
  console.log('chain is out of range. chain =', chain);
  process.exit(1);
}
console.log(`-------------------==connecting to chain: ${chain}
gasLimit: ${gasLimitValue}, gasPrice: ${gasPriceValue}`);


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
      const argsHelium = [[admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4]];
      console.log('\nDeploying Helium contract...');
      instHelium =  await new web3deploy.eth.Contract(Helium.abi)
      .deploy({ data: prefix+Helium.bytecode, arguments: argsHelium })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('Helium.sol has been deployed');
      if (instHelium === undefined) {
        console.log('[Error] instHelium is NOT defined');
        } else {console.log('[Good] instHelium is defined');}
      instHelium.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      console.log(`const addrHelium = ${instHelium.options.address}`);
      process.exit(0);


      //yarn run deploy -c 1 -s 1 -cName testctrt
    } else if (ctrtName === 'testctrt') {
      console.log('\nDeploying testCtrt contracts...');
      const HCAT721SerialNumber = 2020;
      const argsTestCtrt = [HCAT721SerialNumber, addrHelium];
      instTestCtrt =  await new web3deploy.eth.Contract(TestCtrt.abi)
      .deploy({ data: prefix+TestCtrt.bytecode, arguments: argsTestCtrt })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
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
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
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
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    const addrAssetBookArray = [];
    console.log('\nDeploying AssetBook contracts to assetOwnerArray...');
    await asyncForEach(assetOwnerArray, async (item, idx) => {
      argsAssetBookN = [item, addrHelium];
      instAssetBookN =  await new web3deploy.eth.Contract(AssetBook.abi)
      .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookN })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });
      if (instAssetBookN === undefined) {
        console.log(`\n[Error] instAssetBook${idx+1} is NOT defined`);
        } else {console.log(`[Good] instAssetBook${idx+1} is defined`);}
    
      console.log(`AssetBook${idx} has been deployed`);
      console.log(`addrAssetBook${idx}: ${instAssetBookN.options.address}`);
      addrAssetBookArray.push(instAssetBookN.options.address);
      console.log(`Finished deploying AssetBook${idx}...`);
    });

    addrAssetBookArray.forEach((item, idx) => {
      console.log(`addrAssetBook${idx} = "${item}";`);
    });
    process.exit(0);

  //yarn run deploy -c 1 -s 1 -cName assetbook2
  } else if (ctrtName === 'assetbook2') {
    const addrAssetBookArray = [];
    console.log('\nDeploying AssetBook contracts 0 ~ 6,10...');
    await asyncForEach(assetbookOwnersx, async (item, idx) => {
      argsAssetBookN = [item, addrHelium];
      instAssetBookN =  await new web3deploy.eth.Contract(AssetBook.abi)
      .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookN })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });
      if (instAssetBookN === undefined) {
        console.log(`\n[Error] instAssetBook${idx+1} is NOT defined`);
        } else {console.log(`[Good] instAssetBook${idx+1} is defined`);}
    
      console.log(`AssetBook${idx+1} has been deployed`);
      console.log(`addrAssetBook${idx+1}: ${instAssetBookN.options.address}`);
      addrAssetBookArray.push(instAssetBookN.options.address);
      console.log(`Finished deploying AssetBook${idx+1}...`);
    });
    //const assetbookOwnersx = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner10];
    console.log(`\nFinished deploying assetbooksx:
  addrAssetBook0 = "${addrAssetBookArray[0]}";
  addrAssetBook1 = "${addrAssetBookArray[1]}";
  addrAssetBook2 = "${addrAssetBookArray[2]}";
  addrAssetBook3 = "${addrAssetBookArray[3]}";
  addrAssetBook4 = "${addrAssetBookArray[4]}";
  addrAssetBook5 = "${addrAssetBookArray[5]}";
  addrAssetBook6 = "${addrAssetBookArray[6]}";
  addrAssetBook10 = "${addrAssetBookArray[7]}";`);
    process.exit(0);

  //yarn run deploy -c 1 -s 1 -cName assetbookx
  } else if (ctrtName === 'assetbookx'){
    console.log('\nDeploying AssetBook contract x1...');
    const assetowner = "";

    if(assetowner.trim().length === 0) {
      console.log('assetowner cannot be empty');
      process.exit(0);
    }
    const argsAssetBookx = [assetowner, addrHelium];
    instAssetBookx =  await new web3deploy.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookx })
    .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('Another assetbook has been deployed');
    if (instAssetBookx === undefined) {
      console.log('\n[Error] instAssetBook is NOT defined');
      } else {console.log('[Good] instAssetBook is defined');}
    console.log(`const addrAssetBookx = ${instAssetBookx.options.address}`);
    process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName registry
  } else if (ctrtName === 'registry') {
    console.log('\nDeploying Registry contract...');
    const argsRegistry = [addrHelium];
    instRegistry =  await new web3deploy.eth.Contract(Registry.abi)
    .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
    .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    console.log(`const addrRegistry = ${instRegistry.options.address}`);
    process.exit(0);


  //yarn run deploy -c 1 -n 0 -cName cf
  } else if (ctrtName === 'cf') {

    process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName tokc
  } else if (ctrtName === 'tokc') {


    process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName hcat/hcattest
  } else if (ctrtName === 'hcat' || ctrtName === 'hcattest') {

    process.exit(0);



    //yarn run deploy -c 1 -s 1 -cName im
  } else if (ctrtName === 'im') {

    process.exit(0);


  } else if (ctrtName === 'check1'){
    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
    // const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManager);
    // const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);


  //yarn run testmt -f 55
  //yarn run deploy -c 1 -n 0 -cName adduser
  } else if (ctrtName === 'adduser'){//adduser
    console.log('\n-------------==inside addUserRowAPI');
    const result = await addUsersIntoDB(userArray).catch((err) => {
      console.log('\n[Error @ addUsersIntoDB()]'+ err);
    });
    console.log('result', result);
    //process.exit(0);
  
  
  //yarn run deploy -c 1 -n 0 -cName addctrt
  } else if (ctrtName === 'addctrt'){//addSmartContractRowAPI
    console.log('\n-------------==inside addSmartContractRowAPI');
    console.log(`nftSymbol ${nftSymbol}, addrCrowdFunding: ${addrCrowdFunding}, addrHCAT721: ${addrHCAT721}, maxTotalSupply: ${maxTotalSupply}, addrIncomeManager: ${addrIncomeManager}, addrTokenController: ${addrTokenController}`);
  
    await addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController).catch((err) => {
      console.log('\n[Error @ addSmartContractRow()]'+ err);
    });
    process.exit(0);


  //yarn run deploy -c 1 -n 0 -cName addproduct
  } else if (ctrtName === 'addproduct'){//addproduct
    console.log('\n-------------==inside addProductRow section');
    const state = 'FundingClosed';
    let TimeReleaseDate;
    if(isTimeserverON){
      TimeReleaseDate = getTime();
    } else {
      TimeReleaseDate = TimeOfDeployment_HCAT;
    }
    console.log(`\nTimeReleaseDate: ${TimeReleaseDate}`);
    console.log(`\nsymNum: ${symNum}, nftSymbol: ${nftSymbol}, maxTotalSupply: ${maxTotalSupply}, initialAssetPricing: ${initialAssetPricing}, siteSizeInKW: ${siteSizeInKW}, fundingType: ${fundingType}, state: ${state}`);
    await addProductRow(nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, CFSD, CFED, quantityGoal, TimeTokenUnlock, fundingType, state).catch((err) => {
      console.log('\n[Error @ addProductRow()]'+ err);
    });
    process.exit(0);


  //yarn run deploy -c 1 -n 0 -cName addorder
  } else if (ctrtName === 'addorder'){//addorder
    console.log('\n-------------------==inside addOrderAPI');
    const fundCount = 150000;
    const paymentStatus = 'waiting';
    const result = await addOrdersIntoDB(userArray, fundCount, paymentStatus, nftSymbol).catch((err) => {
      console.log('\n[Error @ addOrdersIntoDB()]'+ err);
    });
    console.log('result', result);
    process.exit(0);


  //yarn run deploy -c 1 -n 0 -cName addia
  } else if (ctrtName === 'addia'){
    console.log('-----------------== add Income Arrangement rows from objects...');
    const result = await addIncomeArrangementRowsIntoDB(incomeArrangementArray).catch((err) => {
      console.log('\n[Error @ addIncomeArrangementRowsIntoDB()]'+ err);
    });
    console.log('result', result);


  //yarn run deploy -c 1 -n 0 -cName initCtrt
  } else if (ctrtName === 'initCtrt'){
    console.log('run zlivechain.js steps...');

 

  } else if (ctrtName === 'pm') {
    console.log('-----------------== pm');
    const argsProductManager =[addrHCAT721, addrHeliumCtrt];

    instProductManager = await new web3deploy.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode, arguments: argsProductManager })
    .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    console.log(`\nconst addrProductManager = ${instProductManager.options.address}`);


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
