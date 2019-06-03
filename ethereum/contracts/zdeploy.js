/**
chain: 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,
*/
/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName cf
    cName = helium, assetbook, registry, cf, tokc, hcat, addsc, addproduct, addorder, im, pm, db2
*/
//const timer = require('./api.js');
const Web3 = require('web3');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const {addSmartContractRow, addProductRow, addUserRow, addOrderRow} = require('../../timeserver/mysql.js');

let provider, web3, web3deploy, gasLimitValue, gasPriceValue, prefix = '';
console.log('process.argv', process.argv);
if (process.argv.length < 8) {
  console.log('not enough arguments. Make it like: yarn run deploy -n 1 --chain 1 --cName contractName');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log('cName = helium, assetbook, registry, cf, tokc, hcat, db');
  process.exit(1);
}
// chain    symNum   ctrtName
//const symNum = parseInt(process.argv[5]);
let chain, ctrtName, result;
const { userIDs, authLevels, productObjArray, symbolArray, userArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, assetOwnerArray, assetOwnerpkRawArray, managementTeam, symNum,
  TimeOfDeployment_HCAT, TimeTokenUnlock, TimeTokenValid, CFSD2, CFED2, fundmanager, argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManagement,
  TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManagement, ProductManager,
  email, password, identityNumber, eth_add, cellphone, name, addrAssetBook,investorLevel
} = require('./zsetupData');

let {addrHelium, addrRegistry, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager} = require('./zsetupData');

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5]= assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw] = assetOwnerpkRawArray;
  

console.log('process.argv', process.argv);
const arguLen = process.argv.length;
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run livechain -c C --f F -a A -b b');
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
  // addrProductManager = "";  

  gasLimitValue = '7000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
  console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

  const nodeUrl = "http://140.119.101.130:8545";//POA

  adminpk = Buffer.from(adminpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(adminpk, nodeUrl);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  console.log('web3.version', web3deploy.version);
  prefix = '0x';

} else if (chain === 2) {//2: POW private chain
  const options = { gasLimit: 9000000 };
  gasLimitValue = '5000000';// for POW private chain
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "http://140.119.101.130:8540";
  provider = new PrivateKeyProvider(adminpk, nodeUrl);//ganache
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else if (chain === 3) {
  const options = { gasLimit: 7000000 };
  gasLimitValue = '5000000';// for POW Infura Rinkeby chain
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "https://rinkeby.infura.io/v3/b789f67c3ef041a8ade1433c4b33de0f";
  //const noeeUrl = "https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else {
  console.log('chain is out of range. chain =', chain);
  process.exit(1);
}


//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let instRegistry, instTokenController, instHCAT721, instCrowdFunding,  instIncomeManager, instProductManager;
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

//  await asyncForEachBasic(mainInputArray, async (item) => {
async function asyncForEachBasic(arrayBasic, callback) {
  console.log("arrayBasic:"+arrayBasic);
  for (let idxBasic = 0; idxBasic < arrayBasic.length; idxBasic++) {
    console.log("idxBasic:"+idxBasic, arrayBasic[idxBasic]);
    await callback(arrayBasic[idxBasic], idxBasic, arrayBasic);
  }
}


//-----------------------------==
const deploy = async () => {
    console.log('\n--------==To deploy');

    console.log('admin', admin);
    console.log('AssetOwner1', AssetOwner1);
    console.log('AssetOwner2', AssetOwner2);
    console.log('AssetOwner3', AssetOwner3);
    console.log('AssetOwner4', AssetOwner4);

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

    if (ctrtName === 'helium') {
      //Deploying Helium contract...
      const argsHelium = [managementTeam];
      console.log('\nDeploying Helium contract...');
      instHelium =  await new web3deploy.eth.Contract(Helium.abi)
      .deploy({ data: prefix+Helium.bytecode, arguments: argsHelium })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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


      //yarn run deploy -c 1 -s 1 -cName db
    } else if (ctrtName === 'testctrt') {
      console.log('\nDeploying testCtrt contracts...');
      const HCAT721SerialNumber = 2020;
      const argsTestCtrt = [HCAT721SerialNumber, addrHelium];
      instTestCtrt =  await new web3deploy.eth.Contract(TestCtrt.abi)
      .deploy({ data: prefix+TestCtrt.bytecode, arguments: argsTestCtrt })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    console.log('\nDeploying AssetBook contracts...');
    const mainInputArray = [AssetOwner1, AssetOwner2, AssetOwner3];
    await asyncForEachBasic(mainInputArray, async (item, idx) => {
      argsAssetBookN = [item, addrHelium];
      instAssetBookN =  await new web3deploy.eth.Contract(AssetBook.abi)
      .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookN })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    console.log(`\nFinished deploying assetbook 1, 2, 3:
    const addrAssetBook1 = "${addrAssetBookArray[0]}";
    const addrAssetBook2 = "${addrAssetBookArray[1]}";
    const addrAssetBook3 = "${addrAssetBookArray[2]}";`);
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
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
  console.log('\nDeploying CrowdFunding contract...');
  console.log('argsCrowdFunding', argsCrowdFunding);

  instCrowdFunding = await new web3deploy.eth.Contract(CrowdFunding.abi)
   .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
   .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
   .on('receipt', function (receipt) {
     console.log('receipt:', receipt);
   })
   .on('error', function (error) {
       console.log('error:', error.toString());
   });

   console.log('CrowdFunding.sol has been deployed');
   console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

   if (instCrowdFunding === undefined) {
     console.log('[Error] instCrowdFunding is NOT defined');
   } else {console.log('[Good] instCrowdFunding is defined');}
   
   instCrowdFunding.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
   console.log(`\nconst addrCrowdFunding= ${instCrowdFunding.options.address}`);

   result = await instCrowdFunding.methods.checkDeploymentConditions(...argsCrowdFunding).call();
   console.log('checkDeploymentConditions():', result);
   if(result.every(checkTrue)){
     console.log('[Success] all checks have passed checkSafeTransferFromBatch()');
   } else {
     console.log('[Failed] Some/one check(s) have/has failed checkSafeTransferFromBatch()');
   }
   process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName tokc
  } else if (ctrtName === 'tokc') {
    //Deploying TokenController contract...
    console.log('\nDeploying TokenController contract...');
    instTokenController = await new web3deploy.eth.Contract(TokenController.abi)
    .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('TokenController.sol has been deployed');
    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    console.log(`\nconst addrTokenController = ${instTokenController.options.address}`);

    result = await instTokenController.methods.checkDeploymentConditions(...argsTokenController).call();
    console.log('checkDeploymentConditions():', result);
    if(result.every(checkTrue)){
      console.log('[Success] all checks have passed checkSafeTransferFromBatch()');
    } else {
      console.log('[Failed] Some/one check(s) have/has failed checkSafeTransferFromBatch()');
    }
    // const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
    // let instHCAT721;
    // if(choiceOfHCAT721===1){
    //   console.log('use HCAT721_Test!!!');
    //   instHCAT721 = new web3.eth.Contract(HCAT721_Test.abi, addrHCAT721);
    // } else if(choiceOfHCAT721===2){
    //   console.log('use HCAT721');
    //   instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
    // }

    process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName hcat/hcattest
  } else if (ctrtName === 'hcat' || ctrtName === 'hcattest') {
    console.log('\nDeploying HCAT721 contract... initial');
    /**https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    */
    console.log('\nDeploying HCAT721 contract... .deploy()');
    if (ctrtName === 'hcat'){
      console.log('check1 hcat');
      instHCAT721 = await new web3deploy.eth.Contract(HCAT721.abi)
      .deploy({ data: prefix+HCAT721.bytecode, arguments: argsHCAT721 })
      .send({ from: admin, gas: 9000000, gasPrice: '0' })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      }).on('error', function (error) {
          console.log('error:', error.toString());
      });
      console.log('HCAT721.sol has been deployed');
  
    } else if(ctrtName === 'hcattest'){
      console.log('check1 hcattest');

      instHCAT721 = await new web3deploy.eth.Contract(HCAT721_Test.abi)
      .deploy({ data: prefix+HCAT721_Test.bytecode, arguments: argsHCAT721 })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });
      console.log('HCAT721_Test.sol has been deployed');
    }
    // instTokenController = await new web3deploy.eth.Contract(TokenController.abi)
    // .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    // .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    // .on('receipt', function (receipt) {
    //   console.log('receipt:', receipt);
    // })
    // .on('error', function (error) {
    //     console.log('error:', error.toString());
    // });


    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

    if (instHCAT721 === undefined) {
      console.log('[Error] instHCAT721 is NOT defined');
      } else {console.log('[Good] instHCAT721 is defined');}
    instHCAT721.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    console.log(`\nctrtName = ${ctrtName}; const addrHCAT721 = ${instHCAT721.options.address}`);

    result = await instHCAT721.methods.checkDeploymentConditions(...argsHCAT721).call();
    console.log('checkDeploymentConditions():', result);
    if(result.every(checkTrue)){
      console.log('[Success] all checks have passed checkSafeTransferFromBatch()');
    } else {
      console.log('[Failed] Some/one check(s) have/has failed checkSafeTransferFromBatch()');
    }
    /**
    value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue
    value: web3deploy.utils.toWei('10','ether')
    */
    //-------------------==
    /*
    console.log('\nto add product row into DB');
    addProductRow(nftSymbol, nftSymbol, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, CFSD2, CFED2, quantityGoal, TimeTokenUnlock);
    
    console.log('\nto add smart contract row into DB');
    addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController);
 
    console.log('\naddrCrowdFunding:', addrCrowdFunding);
    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);
    */
    process.exit(0);


  } else if (ctrtName === 'check1'){
    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
    // const instIncomeManagement = new web3.eth.Contract(IncomeManagement.abi, addrIncomeManagement);
    // const instProductManager = new web3.eth.Contract(ProductManager.abi, addrProductManager);


  
  //yarn run deploy -c 1 -n 0 -cName addsc
  } else if (ctrtName === 'addsc'){
    addSmartContractRowAPI();

  //yarn run deploy -c 1 -n 0 -cName addproduct
  } else if (ctrtName === 'addproduct'){
    addProductRowAPI();

  //yarn run deploy -c 1 -n 0 -cName adduser
  } else if (ctrtName === 'adduser'){
    addUserRowAPI();

  //yarn run deploy -c 1 -n 0 -cName addorder
  } else if (ctrtName === 'addorder'){
    addOrderRowAPI();


  } else if (ctrtName === 'im') {
    instIncomeManager = await new web3deploy.eth.Contract(IncomeManagement.abi)
    .deploy({ data: IncomeManagement.bytecode, arguments: argsIncomeManagement })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('IncomeManagement.sol has been deployed');
    if (instIncomeManager === undefined) {
      console.log('[Error] instIncomeManager is NOT defined');
      } else {console.log('[Good] instIncomeManager is defined');}
    instIncomeManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    console.log(`const addrIncomeManagement = ${instIncomeManager.options.address}`);


  } else if (ctrtName === 'pm') {
    const argsProductManager =[addrHCAT721, addrHeliumCtrt];

    instProductManager = await new web3deploy.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode, arguments: argsProductManager })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
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
//yarn run deploy -c 1 -n 0 -cName addsc
const addSmartContractRowAPI = async () => {
  console.log('\n-------------==inside addSmartContractRowAPI');
  console.log(`nftSymbol ${nftSymbol}, addrCrowdFunding: ${addrCrowdFunding}, addrHCAT721: ${addrHCAT721}, maxTotalSupply: ${maxTotalSupply}, addrIncomeManager: ${addrIncomeManager}, addrTokenController: ${addrTokenController}`);

  await addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController)
  process.exit(0);
}


//yarn run deploy -c 1 -n 0 -cName addproduct
const addProductRowAPI = async () => {
  console.log('\n-------------==inside addProductRowAPI');
  const TimeReleaseDate = TimeOfDeployment_HCAT;
  console.log(`\nsymNum: ${symNum}, nftSymbol: ${nftSymbol}, maxTotalSupply: ${maxTotalSupply}, initialAssetPricing: ${initialAssetPricing}, siteSizeInKW: ${siteSizeInKW}, TimeReleaseDate: ${TimeReleaseDate}`);

  await addProductRow(nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, CFSD2, CFED2, quantityGoal, TimeTokenUnlock);
  process.exit(0);
}


//yarn run deploy -c 1 -n 0 -cName adduser
const addUserRowAPI = async () => {
  console.log('\n-------------==inside addUserRowAPI');
  console.log(`symNum: ${symNum}, email: ${email}, identityNumber: ${identityNumber}, eth_add: ${eth_add}, cellphone: ${cellphone}, name: ${name}, addrAssetbook: ${addrAssetBook}, investorLevel: ${investorLevel}`);

  await addUserRow(email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel).catch(err => console.error('addUserRow() failed:', err));
  process.exit(0);
}  


//yarn run deploy -c 1 -n 0 -cName addorder
const addOrderRowAPI = async () => {
  console.log('\n-------------------==inside addOrderAPI');
  const tokenCount = 10;
  const fundCount = 180000;
  const paymentStatus = 'paid';

  console.log(`symNum: ${symNum}, identityNumber: ${identityNumber}, nftSymbol: ${nftSymbol}, tokenCount: ${tokenCount}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);

  await addOrderRow(identityNumber, nftSymbol, tokenCount, fundCount, paymentStatus);
  process.exit(0);
}


deploy();
