const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const moment = require('moment');
const chalk = require('chalk');
const log = console.log;
const PrivateKeyProvider = require("truffle-privatekey-provider");

console.log('--------------------== blockchain.js...');
const { checkEq, getTimeServerTime, isEmpty, checkTrue, isAllTrueBool, asyncForEach, asyncForEachTsMain, asyncForEachMint, asyncForEachMint2, asyncForEachCFC, asyncForEachAbCFC, asyncForEachAbCFC2, asyncForEachAbCFC3, asyncForEachOrderExpiry, checkTargetAmounts, breakdownArrays, breakdownArray, isInt, isIntAboveOne, checkBoolTrueArray } = require('./utilities');

const { addrHelium, addrRegistry, addrProductManager, blockchainURL, admin, adminpkRaw, gasLimitValue, gasPriceValue, isTimeserverON, operationMode, backendAddrChoice} = require('./envVariables');
//0 API dev, 1 Blockchain dev, 2 Backend dev, 3 .., 4 timeserver

const { assetOwnerArray, assetOwnerpkRawArray } = require('../test_CI/zTestParameters');

const { Helium, Registry, AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager, ProductManager, wlogger, excludedSymbols, excludedSymbolsIA } = require('../ethereum/contracts/zsetupData');

const { addActualPaymentTime, mysqlPoolQueryB, setFundingStateDB, getFundingStateDB, setTokenStateDB, getTokenStateDB, addProductRow, addAssetRecordRowArray, getCtrtAddr, getForecastedSchedulesFromDB,getAllSmartContractAddrs, updateIAassetRecordStatus } = require('./mysql.js');

const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateExpiredOrders = 1000;
const prefix = '0x';
/*
const userIdArray = [];
const investorLevelArray = [];
const assetbookArray = [];
;*/

const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

if(backendAddrChoice === 0){//reserved to API developer
  backendAddr = admin;
  backendAddrpkRaw = adminpkRaw;

} else if(backendAddrChoice === 1){//reserved to Blockchain developer
  backendAddr = assetOwnerArray[1];
  backendAddrpkRaw = assetOwnerpkRawArray[1];

} else if(backendAddrChoice === 2){//reserved to Backend developer
  backendAddr = assetOwnerArray[2];
  backendAddrpkRaw = assetOwnerpkRawArray[2];

} else if(backendAddrChoice === 3){//
  backendAddr = assetOwnerArray[3];
  backendAddrpkRaw = assetOwnerpkRawArray[3];

} else if(backendAddrChoice === 4){//reserved tp the timeserver
  backendAddr = assetOwnerArray[4];
  backendAddrpkRaw = assetOwnerpkRawArray[4];
}
console.log(`using backendAddr: ${backendAddr}`);


//-------------------==Helium Contract
const addPlatformSupervisor = async(platformSupervisorNew, addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    //console.log('--------------==adding additional PlatformSupervisor...');
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumContract);
    const encodedData= instHelium.methods.addPlatformSupervisor(platformSupervisorNew).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrHeliumContract, encodedData).catch((err) => {
      reject('[Error @ signTx() addPlatformSupervisor()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
    resolve(result);
  });
}

const addCustomerService = async(platformSupervisorNew, addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumContract);
    const encodedData= instHelium.methods.addCustomerService(platformSupervisorNew).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrHeliumContract, encodedData).catch((err) => {
      reject('[Error @ signTx() addCustomerService()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    let result = await instHelium.methods.checkPlatformSupervisor(platformSupervisorNew).call();
    resolve(result);
  });
}

const checkPlatformSupervisor = async(eoa, addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumContract);
    const result= await instHelium.methods.checkPlatformSupervisor(eoa).call();
    resolve(result);
  });
}

const checkCustomerService = async(eoa, addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumContract);
    const result= await instHelium.methods.checkCustomerService(eoa).call();
    resolve(result);
  });
}


//----------------------==Helium Contract
const checkArgumentsHelium = async(argsHelium) => {
  return new Promise(async (resolve, reject) => {
    const [managementTeam] = argsHelium;
    const distinctArray = [...new Set(managementTeam)];
    let mesg = '';
    if(managementTeam.length < 5){
      mesg += ', managementTeam length has to be >= 5';
    }
    if(distinctArray.length < 5){
      mesg += ', duplicated EOA is found';
    }

    if(mesg.substring(0,2) === ', '){
      mesg = mesg.substring(2);
    }
    console.log('\n==>>>mesg:', mesg);
    if(mesg.length > 0){
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

const checkHeliumCtrt = async(addrHeliumContract, managementTeam) => {
  return new Promise( async ( resolve, reject ) => {

      console.log('\n-----------==inside checkHeliumCtrt()...');
      const instHelium = new web3.eth.Contract(Helium.abi, addrHeliumContract);
      const HeliumDetails = await instHelium.methods.getHeliumDetails().call();
      console.log('HeliumDetails:', HeliumDetails);
      const distinctArray = [...new Set(managementTeam)];

      const [isGood0, mesg0] = checkEq(HeliumDetails[0], managementTeam[0]);
      const [isGood1, mesg1] = checkEq(HeliumDetails[1], managementTeam[1]);
      const [isGood2, mesg2] = checkEq(HeliumDetails[2], managementTeam[2]);
      const [isGood3, mesg3] = checkEq(HeliumDetails[3], managementTeam[3]);
      const [isGood4, mesg4] = checkEq(HeliumDetails[4], managementTeam[4]);

      if(distinctArray.length < 5){
        console.log('[Error] duplicated EOA is found');
        resolve(false);

      } else if(isGood0 && isGood1 && isGood2 && isGood3 && isGood4){
        console.log('[Good] All managementTeam members are unique, and are all confirmed to be the expected addresses');
        resolve(true);

      } else {
        console.log('[WARNING] management teams are not the expected ones');
        resolve(false);
      }
  });
}

const deployHeliumContract = async(managementTeam) => {
  return new Promise(async (resolve, reject) => {
    console.log(`\n----------------== inside deployHeliumContract() \nbackendAddr: ${backendAddr} \nblockchainURL: ${blockchainURL}`);
    //  \nbackendAddrpkRaw: ${backendAddrpkRaw} 
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    const argsHelium = [managementTeam];
    const isGoodArgument = await checkArgumentsHelium(argsHelium);

    if(isGoodArgument){
      console.log('\nDeploying Helium contract...');
      let instHelium;
      try{
        instHelium =  await new web3deploy.eth.Contract(Helium.abi)
        .deploy({ data: prefix+Helium.bytecode, arguments: argsHelium })
        .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
        .on('receipt', function (receipt) {
          console.log('receipt:', receipt);
        })
        .on('error', function (error) {
            reject('error:', error.toString());
            return false;
        });
      } catch(err){
        console.log('err:', err);
      }
  
      console.log('Helium.sol has been deployed');
      if (instHelium === undefined) {
        reject('[Error] instHelium is NOT defined');
        return false;
      } else {
        console.log('[Good] instHelium is defined');
  
        instHelium.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
        const addrHeliumContract = instHelium.options.address;
        console.log(`\nconst addrHelium= ${addrHeliumContract}`);

        const deploymentConditions = await instHelium.methods.checkDeploymentConditions().call();
        console.log('deploymentConditions:', deploymentConditions);
        const isAnyErrorAtDeployment = deploymentConditions['2'].includes(true);
        if(isAnyErrorAtDeployment){
          console.log('[Warning] duplicated management team member is found');
          resolve({isGood: false, addrHeliumContract});
        } else {
          const isGood= await checkHeliumCtrt(addrHeliumContract, managementTeam);
          console.log('checkHeliumCtrt result:', isGood);
          resolve({isGood, addrHeliumContract});
        }
      }
    } else {
      console.log('isGoodArgument is false');
      resolve({isGood: false, addrHeliumContract: undefined});
    }
  });
}

//----------------------==Registry Contract
const deployRegistryContract = async(addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    console.log('\n----------------== deployRegistryContract()');
    const argsRegistry = [addrHeliumContract];
    let instRegistry;
    try{
      instRegistry =  await new web3deploy.eth.Contract(Registry.abi)
      .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }

    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined) {
      reject('[Error] instRegistry is NOT defined');
      return false;
    } else {console.log('[Good] instRegistry is defined');}

    instRegistry.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    const addrRegistryCtrt = instRegistry.options.address;
    console.log(`const addrRegistryCtrt = ${addrRegistryCtrt}`);
    const isGood = true;
    resolve({isGood, addrRegistryCtrt});
  });
}

const deployProductManagerContract = async(addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    console.log('\n----------------== deployProductManagerContract()');
    const argsProductManager =[addrHeliumContract];
    console.log(argsProductManager)

    let instProductManager;
    try{
      instProductManager = await new web3deploy.eth.Contract(ProductManager.abi)
      .deploy({ data: prefix+ProductManager.bytecode, arguments: argsProductManager })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }

    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      reject('[Error] instProductManager is NOT defined');
      return false;

    } else {
      console.log('[Good] instProductManager is defined');
      instProductManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      const addrProductManager = instProductManager.options.address
      console.log(`\nconst addrProductManager = ${addrProductManager}`);
      const isGood = true;
      resolve({isGood, addrProductManager});
    }
  });
}


//Set compliance regulatory rules
const setRestrictions = async(registryContractAddr, authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate) => {
  return new Promise(async (resolve, reject) => {
    //console.log('--------------==setRestrictions()');
    const instHelium = new web3.eth.Contract(Helium.abi, registryContractAddr);
    const encodedData= instHelium.methods.setRestrictions(authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, registryContractAddr, encodedData).catch((err) => {
      reject('[Error @ signTx() setRestrictions()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(result);
  });
}

//-------------------==
const deployTesttract = async(HeliumCtrtAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log('\nDeploying testCtrt contracts...');
    const HCAT721SerialNumber = 2020;
    const argsTestCtrt = [HCAT721SerialNumber, HeliumCtrtAddr];
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
  });
}


//-------------------==Assetbook Contracts
const deployAssetbooks = async(eoaArray, addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    console.log('\nDeploying AssetBook contracts from eoaArray...');

    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    const addrAssetBookArray = [];
    await asyncForEach(eoaArray, async (item, idx) => {
      const argsAssetBookN = [item, addrHeliumContract];
      const instAssetBookN =  await new web3deploy.eth.Contract(AssetBook.abi)
      .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookN })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          addrAssetBookArray.push(error);
          reject(error.toString());
          return false;
        });
      if (instAssetBookN === undefined) {
        const mesg = `[Error] instAssetBook${idx} is NOT defined`;
        addrAssetBookArray.push(mesg);
        reject(mesg);
        return false;
      } else {
        console.log(`[Good] instAssetBook${idx} is defined`);
        console.log(`AssetBook${idx} has been deployed`);
        const addrAssetBook = instAssetBookN.options.address;
        console.log(`addrAssetBook${idx}: ${addrAssetBook}`);
        addrAssetBookArray.push(addrAssetBook);
        console.log(`Finished deploying AssetBook${idx}...`);
      }
    });

    addrAssetBookArray.forEach((item, idx) => {
      console.log(`addrAssetBook${idx} = "${item}"`);
    });

    let isGood;
    const checkResult = await checkAssetbookArray(addrAssetBookArray).catch(async(err) => {
      console.log(`checkAssetbookArray() result: ${err}, checkAssetbookArray() failed(). \naddressArray: ${addressArray}`);
      isGood = false;
    });
    if(checkResult.includes(false)){
      console.log(`\ncheckResult has at least one error item. \n\naddressArray: ${addressArray} \n\ncheckAssetbookArray() Result: ${checkResult}`);
      isGood = false;
    } else {
      console.log(`all input addresses has been checked good by checkAssetbookArray \ncheckResult: ${checkResult} `);
      isGood = true;
    }
    resolve({isGood, addrAssetBookArray});
  });
}



//-------------------==Crowdfunding
//yarn run testmt -f 61
const deployCrowdfundingContract = async(argsCrowdFunding) => {
  return new Promise(async (resolve, reject) => {

    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    let instCrowdFunding;
    try{
      instCrowdFunding = await new web3deploy.eth.Contract(CrowdFunding.abi)
      .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }
    console.log('CrowdFunding.sol has been deployed');
  
    if (instCrowdFunding === undefined) {
      reject('[Error] instCrowdFunding is NOT defined');
      return false;

    } else {
      console.log('[Good] instCrowdFunding is defined');
      instCrowdFunding.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      const crowdFundingAddr = instCrowdFunding.options.address;
      console.log(`\nconst addrCrowdFunding= ${crowdFundingAddr}`);
      const isGood = await checkDeploymentCFC(crowdFundingAddr, argsCrowdFunding);
      console.log('isGood:', isGood);
      resolve({isGood, crowdFundingAddr});
    }
  });
}

const checkArgumentsCFC = async(argsCrowdFunding) => {
  return new Promise(async (resolve, reject) => {
    const [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, acCFSD, acCFED, acTimeOfDeployment_CF, addrHelium] = argsCrowdFunding;
    let mesg = '';
    if(initialAssetPricing <= 0){
      mesg += ', [0] initialAssetPricing has to be > 0';
    } 
    if(maxTotalSupply < quantityGoal){
      mesg += ', [1] maxTotalSupply has to be >= quantityGoal';
    } 
    if(acTimeOfDeployment_CF <= 201905281400){
      mesg += ', [2] TimeOfDeployment should be > 201905281400';
    } 
    if(acCFSD <= acTimeOfDeployment_CF){
      mesg += ', [3] CFSD should be > TimeOfDeployment';
    } 
    if(acCFED <= acCFSD){
      mesg += ', [4] CFED should be > CFSD';
    } 
    if(nftSymbol.length < 8 || nftSymbol.length > 32){
      mesg += ', [5] nftSymbol should be between 8 and 32';
    } 
    if(pricingCurrency.length < 3 || pricingCurrency.length > 32){
      mesg += ', [6] pricingCurrency should be between 3 and 32';
    }

    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const Helium_Admin = await instHelium.methods.Helium_Admin().call();
    if(Helium_Admin.length === 0){
      mesg += ', [7] addrHelium should have Helium Contract';
    }
    if(mesg.substring(0,2) === ', '){
      mesg = mesg.substring(2);
    }
    console.log('\n==>>>mesg:', mesg);
    if(mesg.length > 0){
      resolve(false);
    } else {
      resolve(true);
    }
  });
}


const checkCrowdfundingCtrt = async(crowdFundingAddr) => {
  return new Promise( async ( resolve, reject ) => {
    try{
      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const cfcDetails = await instCrowdFunding.methods.getCrowdfundingDetails().call();
      const uintArray = cfcDetails[0];
      const TimeOfDeployment = uintArray[0];
      const maxTokenQtyForEachInvestmentFund = uintArray[1];
      const initialAssetPricing = uintArray[2];
      const maxTotalSupply = uintArray[3];
      const quantityGoal = uintArray[4];
      const quantitySold = uintArray[5];
      const CFSD = uintArray[6];
      const CFED = uintArray[7];
      const fundingCindex = uintArray[8];

      const tokenSymbol = cfcDetails[1];
      const pricingCurrency = cfcDetails[2];
      const stateDescription = cfcDetails[3];

      const fundingState = cfcDetails[4];
      const addrHelium = cfcDetails[5];

      console.log(`\n------------==checkCrowdfundingCtrt()... 
TimeOfDeployment: ${TimeOfDeployment}, maxTokenQtyForEachInvestmentFund: ${maxTokenQtyForEachInvestmentFund}, tokenSymbol: ${tokenSymbol}, pricingCurrency: ${pricingCurrency}
initialAssetPricing: ${initialAssetPricing}, maxTotalSupply: ${maxTotalSupply},quantityGoal: ${quantityGoal}, quantitySold: ${quantitySold}, CFSD: ${CFSD}, CFED: ${CFED}, fundingCindex: ${fundingCindex}
fundingState: ${fundingState}, stateDescription: ${stateDescription}
addrHelium: ${addrHelium}`);
      resolve([true, TimeOfDeployment, maxTokenQtyForEachInvestmentFund, tokenSymbol, pricingCurrency, initialAssetPricing, maxTotalSupply, quantityGoal, quantitySold, CFSD, CFED, fundingCindex, fundingState, stateDescription, addrHelium]);
    } catch(err) {
      console.log(`[Error] checkCrowdfundingCtrt() failed at crowdFundingAddr: ${crowdFundingAddr} <===================================`);
      resolve([false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
    }
  });
}

const checkDeploymentCFC = async(crowdFundingAddr, argsCrowdFunding) => {
  return new Promise(async (resolve, reject) => {
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

    const [is_checkCrowdfunding, TimeOfDeployment, maxTokenQtyForEachInvestmentFund, tokenSymbol, pricingCurrency, initialAssetPricing, maxTotalSupply, quantityGoal, quantitySold, CFSD, CFED, fundingCindex, fundingState, stateDescription, addrHelium] = await checkCrowdfundingCtrt(crowdFundingAddr).catch((err) => {
      console.log(`${err} \ncheckCrowdfundingCtrt() failed...`);
      reject(false);
      return false;
    });

    if(is_checkCrowdfunding){
      console.log(`\ncheckCrowdfundingCtrt() returns true...`);

      const boolArray = await instCrowdFunding.methods.checkDeploymentConditions(...argsCrowdFunding).call();
      console.log('checkDeploymentConditions():', boolArray);

      if(boolArray.includes(false)){
        console.log('[Failed] Some/one check(s) have/has failed checkDeploymentConditions()');

        if(boolArray.length !== 8){
          console.error('checkDeploymentConditions boolArray.length is not valid');
          reject(false);
          return false;
        }
 
        let mesg = '';
        if(!boolArray[0]){
          mesg += ', [0] initialAssetPricing has to be > 0';
        } 
        if(!boolArray[1]){
          mesg += ', [1] maxTotalSupply has to be >= quantityGoal';
        } 
        if(!boolArray[2]){
          mesg += ', [2] TimeOfDeployment should be > 201905281400';
        } 
        if(!boolArray[3]){
          mesg += ', [3] CFSD should be > TimeOfDeployment';
        } 
        if(!boolArray[4]){
          mesg += ', [4] CFED should be > CFSD';
        } 
        if(!boolArray[5]){
          mesg += ', [5] tokenSymbol should be between 8 and 32';
        } 
        if(!boolArray[6]){
          mesg += ', [6] pricingCurrency should be between 3 and 32';
        } 
        if(!boolArray[7]){
          mesg += ', [7] addrHelium should have a contract';
        }
        if(mesg.substring(0,2) === ', '){
          mesg = mesg.substring(2);
        }
        console.log(`\n[Error message] ${mesg}`);
        resolve(false);
  
      } else {
        console.log('[Success] all checks have passed checkDeploymentConditions()');
        resolve(true);
      }
    }
  });
}

//-------------------==TokenController
const checkArgumentsTCC = async(argsTokenController) => {
  return new Promise(async (resolve, reject) => {
    const [acTimeOfDeployment_TokCtrl, acTimeTokenUnlock, acTimeTokenValid, addrHelium ] = argsTokenController;
    let mesg = '';
    if(acTimeOfDeployment_TokCtrl <= 201905281400){
      mesg += ', [2] TimeOfDeployment should be > 201905281400';
    } 
    if(acTimeTokenUnlock <= acTimeOfDeployment_TokCtrl){
      mesg += ', [3] acTimeTokenUnlock should be > acTimeOfDeployment_TokCtrl';
    } 
    if(acTimeTokenValid <= acTimeTokenUnlock){
      mesg += ', [4] acTimeTokenValid should be > acTimeTokenUnlock';
    } 
    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const Helium_Admin = await instHelium.methods.Helium_Admin().call();
    if(Helium_Admin.length === 0){
      mesg += ', [7] addrHelium should have Helium Contract';
    }
    if(mesg.substring(0,2) === ', '){
      mesg = mesg.substring(2);
    }
    console.log('\n==>>>mesg:', mesg);
    if(mesg.length > 0){
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

//yarn run testmt -f 62
const deployTokenControllerContract = async(argsTokenController) => {
  return new Promise(async (resolve, reject) => {
    if(operationMode === 9){
      const [acTimeOfDeployment_TokCtrl, acTimeTokenUnlock, acTimeTokenValid, addrHelium ] = argsTokenController;

      if(acTimeOfDeployment_TokCtrl > acTimeTokenUnlock) {
        reject('[Error] acTimeOfDeployment_TokCtrl > acTimeTokenUnlock');
        return false;
      }
      if(acTimeTokenUnlock <= CFED) {
        reject('[Error] acTimeTokenUnlock <= CFED');
        return false;
      }
      if(acTimeTokenValid <= acTimeTokenUnlock) {
        reject('[Error] acTimeTokenValid <= acTimeTokenUnlock');
        return false;
      }

    }
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    let instTokenController;
    try{
      instTokenController = await new web3deploy.eth.Contract(TokenController.abi)
      .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }
    console.log('TokenController.sol has been deployed');

    if (instTokenController === undefined) {
      reject('[Error] instTokenController is NOT defined');
      return false;
    } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    const tokenControllerAddr = instTokenController.options.address;
    console.log(`\nconst addrTokenController = ${tokenControllerAddr}`);

    const isGood = await checkDeploymentTCC(tokenControllerAddr, argsTokenController);
    console.log('isGood:', isGood);
    resolve({isGood, tokenControllerAddr});
  });
}

//yarn run testmt -f 621
const checkTokenControllerCtrt = async(tokenControllerCtrtAddr) => {
  return new Promise( async ( resolve, reject ) => {
    try{
      const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerCtrtAddr);
      const TimeUnlock = await instTokenController.methods.TimeUnlock().call();
      const TimeValid = await instTokenController.methods.TimeValid().call();
      const TokenState = await instTokenController.methods.tokenState().call();
      const TimeOfDeployment = await instTokenController.methods.TimeOfDeployment().call();
      console.log(`\n--------==checkTokenControllerCtrt()... TimeUnlock: ${TimeUnlock}, TimeValid: ${TimeValid}, TokenState: ${TokenState}, TimeOfDeployment: ${TimeOfDeployment}`);
      resolve([true, TimeUnlock, TimeValid, TokenState, TimeOfDeployment]);
    } catch(err){
      console.log(`[Error] checkTokenControllerCtrt() failed at tokenControllerCtrtAddr: ${tokenControllerCtrtAddr} <===================================`);
      resolve([false, undefined, undefined, undefined, undefined]);
    }
  });
}

const checkDeploymentTCC = async(tokenControllerAddr, argsTokenController) => {
  return new Promise(async (resolve, reject) => {
    const [is_checkTokenControllerCtrt, TimeUnlock, TimeValid, TokenState, TimeOfDeployment] = await checkTokenControllerCtrt(tokenControllerAddr).catch(async(err) => {
      console.log(`${err} \ncheckTokenControllerCtrt() failed...`);
      reject(false);
      return false;
    });

    if(is_checkTokenControllerCtrt){
      console.log(`\ncheckTokenControllerCtrt() returns true...`);

      const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
      const boolArray = await instTokenController.methods.checkDeploymentConditions(...argsTokenController).call();
      console.log('checkDeploymentConditions():', boolArray);``

      if(boolArray.includes(false)){
        console.log('[Failed] Some/one check(s) have/has failed checkDeploymentConditions()');

        console.log(`\n===>>> TimeUnlock: ${TimeUnlock}, TimeValid: ${TimeValid}, TokenState: ${TokenState}, TimeOfDeployment: ${TimeOfDeployment}`);

        if(boolArray.length !== 4){
          console.error('checkDeploymentConditions boolArray.length is not valid');
          reject(false);
          return false;
        }
  
        let mesg = '';
        if(!boolArray[0]){
          mesg += ', [0] TimeOfDeployment should be > 201905281400';
        } 
        if(!boolArray[1]){
          mesg += ', [1] TimeUnlock should be > TimeOfDeployment';
        } 
        if(!boolArray[2]){
          mesg += ', [2] TimeValid should be > TimeUnlock';
        } 
        if(!boolArray[3]){
          mesg += ', [3] addrHelium should have a contract';
        } 
        if(mesg.substring(0,2) === ', '){
          mesg = mesg.substring(2);
        }
        console.error(`\n[Error message] ${mesg}`);
        resolve(false);
  
      } else {
        console.log('[Success] all checks have passed checkDeploymentConditions()');
        resolve(true);
      }
    }
  });
}


//-------------------==HCAT
//yarn run testmt -f 6x
const checkArgumentsHCAT = async(argsHCAT721) => {
  return new Promise(async (resolve, reject) => {
    const [nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
      initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
      addrRegistry, addrProductManager, addrTokenController, tokenURI_bytes32, addrHelium,acTimeOfDeployment_HCAT] = argsHCAT721;
    let mesg = '';
    console.log(`\ninside checkArgumentsHCAT: \nnftSymbol_bytes32: ${nftSymbol_bytes32}, nftName_bytes32: ${nftName_bytes32}, tokenURI_bytes32: ${tokenURI_bytes32}`);
    if(nftSymbol_bytes32.substring(0, 3) === '0x0'){
      mesg += ', [0] nftSymbol_bytes32 should not be empty';
    } 
    if(nftName_bytes32.substring(0, 3) === '0x0'){
      mesg += ', [1] nftName_bytes32 should not be empty';
    } 
    if(siteSizeInKW <= 0){
      mesg += ', [2] siteSizeInKW should be > 0';
    } 
    if(maxTotalSupply <= 0){
      mesg += ', [3] maxTotalSupply should be > 0';
    } 
    if(initialAssetPricing <= 0){
      mesg += ', [4] initialAssetPricing should be > 0';
    } 
    if(pricingCurrency_bytes32.substring(0, 3) === '0x0'){
      mesg += ', [5] pricingCurrency_bytes32 should not be empty';
    } 
    if(IRR20yrx100 <= 1){
      mesg += ', [6] IRR20yrx100 should be > 1';
    } 

    const instRegistry = new web3.eth.Contract(Registry.abi, addrRegistry);
    const HeliumCtrtAddr= await instRegistry.methods.addrHelium().call();
    if(HeliumCtrtAddr.length === 0){
      mesg += ', [7] HeliumCtrtAddr from Registry should not be empty';
    }

    const instTokenController = new web3.eth.Contract(TokenController.abi, addrTokenController);
    const tokenState = await instTokenController.methods.tokenState().call();
    if(tokenState > 2){
      mesg += ', [8] tokenState should be < 3';
    }

    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const Helium_Admin = await instHelium.methods.Helium_Admin().call();
    if(Helium_Admin.length === 0){
      mesg += ', [9] addrHelium should have Helium Contract';
    }

    if(tokenURI_bytes32.substring(0, 3) === '0x0'){
      mesg += ', [10] tokenURI_bytes32 should not be empty';
    } 
    if(acTimeOfDeployment_HCAT <= 201905281400){
      mesg += ', [11] TimeOfDeployment should be > 201905281400';
    } 

    if(mesg.substring(0,2) === ', '){
      mesg = mesg.substring(2);
    }
    console.log('\n==>>>mesg:', mesg);
    if(mesg.length > 0){
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

const fromAsciiToBytes32 = async(asciiString) => {
  return new Promise(async (resolve, reject) => {
    const result = web3.utils.fromAscii(asciiString);
    resolve(result);
  });
}
const fromBytes32ToAscii = async(bytes32String) => {
  return new Promise(async (resolve, reject) => {
    const result = web3.utils.toAscii(bytes32String);
    resolve(result);
  });
}

// -f 67
const deployHCATContract = async(argsHCAT721) => {
  return new Promise(async (resolve, reject) => {
    /**https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    */
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    console.log('\nDeploying HCAT721 contract...');
    console.log('check1 hcat');
    let instHCAT721;
    try{
      instHCAT721 = await new web3deploy.eth.Contract(HCAT721.abi)
      .deploy({ data: prefix+HCAT721.bytecode, arguments: argsHCAT721 })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      }).on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }
    console.log('HCAT721.sol has been deployed');
    //.send({ from: backendAddr, gas: 9000000, gasPrice: '0' })
  
    if (instHCAT721 === undefined) {
      reject('[Error] instHCAT721 is NOT defined');
      return false;

    } else {
      console.log('[Good] instHCAT721 is defined');
      instHCAT721.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      const HCAT_Addr = instHCAT721.options.address;
      console.log(`\nconst addrHCAT721 = "${HCAT_Addr}"`);
  
      const isGood = await checkDeploymentHCAT(HCAT_Addr, argsHCAT721);
      console.log('isGood:', isGood);
      resolve({isGood, HCAT_Addr});
    }
  });
}

const checkDeploymentHCAT = async(tokenCtrtAddr, argsHCAT721) => {
  return new Promise(async (resolve, reject) => {
    const [is_checkHCATTokenCtrt, nftsymbol, maxTotalSupply, initialAssetPricing, TimeOfDeployment, tokenId, isPlatformSupervisor] = await checkHCATTokenCtrt(tokenCtrtAddr).catch(async(err) => {
      console.log(`${err} \ncheckHCAT_Ctrt() failed...`);
      reject(false);
      return false;
    });

    if(is_checkHCATTokenCtrt){
      console.log(`\ncheckHCAT_Ctrt() returns true...`);

      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      console.log('check21');
      const boolArray = await instHCAT721.methods.checkDeploymentConditions(...argsHCAT721).call();
      console.log('checkDeploymentConditions():', boolArray);

      if(boolArray.includes(false)){
        console.log('[Failed] Some/one check(s) have/has failed checkDeploymentConditions()');

        console.log(`\n===>>> TimeUnlock: ${TimeUnlock}, TimeValid: ${TimeValid}, TokenState: ${TokenState}, TimeOfDeployment: ${TimeOfDeployment}`);

        if(boolArray.length !== 12){
          console.error('checkDeploymentConditions boolArray.length is not valid');
          reject(false);
          return false;
        }
  
        let mesg = '';
        if(!boolArray[0]){
          mesg += ', [0] tokenName should not be empty';
        } 
        if(!boolArray[1]){
          mesg += ', [1] tokenSymbol should not be empty';
        } 
        if(!boolArray[2]){
          mesg += ', [2] siteSizeInKW should be > 0';
        } 
        if(!boolArray[3]){
          mesg += ', [3] maxTotalSupply should be > 0';
        } 
        if(!boolArray[4]){
          mesg += ', [4] initialAssetPricing should be > 0';
        } 
        if(!boolArray[5]){
          mesg += ', [5] pricingCurrency should not be empty';
        } 
        if(!boolArray[6]){
          mesg += ', [6] IRR20yrx100 should be > 1';
        } 

        if(!boolArray[7]){
          mesg += ', [7] addrRegistry should have a contract';
        } 
        if(!boolArray[8]){
          mesg += ', [8] addrProductManager should have a contract';
        } 
        if(!boolArray[9]){
          mesg += ', [9] addrTokenController should have a contract';
        } 
        if(!boolArray[10]){
          mesg += ', [10] addrHelium should have a contract';
        } 

        if(!boolArray[11]){
          mesg += ', [11] tokenURI should not be empty';
        } 
        if(!boolArray[12]){
          mesg += ', [12] TimeOfDeployment should be > 201905281400';
        } 
        if(mesg.substring(0,2) === ', '){
          mesg = mesg.substring(2);
        }

        console.log(`\n[Error message] ${mesg}`);
        resolve(false);
  
      } else {
        console.log('[Success] all checks have passed checkDeploymentConditions()');
        resolve(true);
      }
    }
  });
}

const checkHCATTokenCtrt = async(tokenCtrtAddr) => {
  return new Promise( async ( resolve, reject ) => {
    try{
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      console.log('check1');
      const nftsymbolM_b32 = await instHCAT721.methods.symbol().call();
      const nftsymbol = web3.utils.toAscii(nftsymbolM_b32);
      const maxTotalSupply = await instHCAT721.methods.maxTotalSupply().call();
      const initialAssetPricing = await instHCAT721.methods.initialAssetPricing().call();
      console.log('check2');

      const TimeOfDeployment = await instHCAT721.methods.TimeOfDeployment().call();

      const tokenId = await instHCAT721.methods.tokenId().call();
      const isPlatformSupervisor = await instHCAT721.methods.isPlatformSupervisor().call({from: backendAddr});
      console.log(`checkHCATTokenCtrt()... nftsymbol: ${nftsymbol}, maxTotalSupply: ${maxTotalSupply}, initialAssetPricing: ${initialAssetPricing}, TimeOfDeployment: ${TimeOfDeployment}, tokenId: ${tokenId}, isPlatformSupervisor: ${isPlatformSupervisor}`);
      /**
  checkEq(initialAssetPricingM, '' + initialAssetPricing);
  checkEq(IRR20yrx100M, '' + IRR20yrx100);
  checkEq(maxTotalSupplyM, '' + maxTotalSupply);
  //checkEq(pricingCurrencyM, ''+pricingCurrency);
  checkEq(siteSizeInKWM, '' + siteSizeInKW);
  checkEq(tokenIdM_init, 0);
  console.log('nftNameM', web3.utils.toAscii(nftNameM), 'nftsymbolM', web3.utils.toAscii(nftsymbolM), 'maxTotalSupplyM', maxTotalSupplyM, 'tokenURI', web3.utils.toAscii(tokenURI_M), 'pricingCurrencyM', web3.utils.toAscii(pricingCurrencyM));
  //checkEq(web3.utils.toAscii(tokenURI_M).toString(), tokenURI);

  console.log("\x1b[33m", '\nConfirm tokenId = ', tokenIdM, ', tokenIdM_init', tokenIdM_init);
  console.log('setup has been completed');
      */
      resolve([true, nftsymbol, maxTotalSupply, initialAssetPricing, TimeOfDeployment, tokenId, isPlatformSupervisor]);
    } catch(err){
      console.log(`[Error] checkHCATTokenCtrt() failed at tokenCtrtAddr: ${tokenCtrtAddr} <=================================== \n${err}`);
      resolve([false, undefined, undefined, undefined, undefined, undefined, undefined]);
    }
  });
}


const getTokenContractDetails = async(tokenCtrtAddr) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('\n--------==inside getTokenContractDetails()');
    try{
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      const boolArray = await instHCAT721.methods.getTokenContractDetails().call();
      console.log('tokenContractDetails:', boolArray);
      // if(boolArray.length !== 10){
      //   console.error(`getTokenContractDetails boolArray.length ${boolArray.length} is not valid`);
      //   reject(false);
      //   return false;
      // }
      const tokenId = boolArray[0];
      const siteSizeInKW = boolArray[1];
      const maxTotalSupply = boolArray[2];
      const totalSupply = boolArray[3];
      const initialAssetPricing = boolArray[4];
      const pricingCurrency = web3.utils.toAscii(boolArray[5]);
      const IRR20yrx100 = boolArray[6];
      const name = web3.utils.toAscii(boolArray[7]);
      const tokenSymbol = web3.utils.toAscii(boolArray[8]);
      const tokenURI = web3.utils.toAscii(boolArray[9]);

      console.log(`getTokenContractDetails()... tokenSymbol: ${tokenSymbol}, siteSizeInKW: ${siteSizeInKW}, maxTotalSupply: ${maxTotalSupply}, pricingCurrency: ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}`);
      resolve([tokenSymbol, siteSizeInKW, maxTotalSupply, pricingCurrency, IRR20yrx100]);
    } catch(err){
      console.log(`err: ${err} \n[Error] getTokenContractDetails() failed at tokenCtrtAddr: ${tokenCtrtAddr} <===================================`);
      resolve([undefined, undefined, undefined, undefined, undefined]);
    }
  });
}


const checkDeployedContracts = async(symbol) => {
  //console.log('---------------------== checkDeployedContracts');
  let result;

  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerCtrtAddr);
  result = await instTokenController.methods.checkDeploymentConditions(...argsTokenController).call();
  console.log('\nTokenController checkDeploymentConditions():', result);
  if(result.every(checkBoolTrueArray)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
  result = await instHCAT721.methods.getTokenContractDetails().call();
  console.log('\ngetTokenContractDetails', result);

  result = await instHCAT721.methods.checkDeploymentConditions(...argsHCAT721).call();
  console.log('\nHCAT721 checkDeploymentConditions():', result);
  if(result.every(checkBoolTrueArray)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }

  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  result = await instCrowdFunding.methods.checkDeploymentConditions(...argsCrowdFunding).call();
  console.log('\nCrowdFunding checkDeploymentConditions():', result);
  if(result.every(checkBoolTrueArray)){
    console.log('[Success] all checks have passed');
  } else {
    console.log('[Failed] Some/one check(s) have/has failed');
  }
}

const setTokenController = async(tokenControllerCtrtAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log(`---------------==\nsetTokenController()`);
    const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerCtrtAddr);
    boolArray = await instTokenController.methods.getHTokenControllerDetails().call();
    console.log('boolArray:', boolArray);
    // if(boolArray.length !== 5){
    //   console.error('getHTokenControllerDetails boolArray.length is not valid');
    //   reject(false);
    //   return false;
    // }

    timeAtDeployment = boolArray[0];
    TimeUnlockM = boolArray[1];
    TimeValidM = boolArray[2];
    isLockedForRelease = boolArray[3];
    isTokenApproved = boolArray[4];
    console.log('\ntimeAtDeployment:', timeAtDeployment, ', TimeUnlockM:', TimeUnlockM, ', TimeValidM:', TimeValidM, ', isLockedForRelease:', isLockedForRelease, ', isTokenApproved:', isTokenApproved);
    console.log('\ntokenControllerDetail:', boolArray);

    console.log('tokenControllerCtrtAddr:', tokenControllerCtrtAddr);
    let isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
    console.log('isTokenApprovedOperational():', isTokenApprovedOperational);
    //checkEq(isTokenApprovedOperational, false);

    const isPlatformSupervisor = await instTokenController.methods.checkPlatformSupervisorFromTCC().call({from: backendAddr}); 
    console.log('isPlatformSupervisor()', isPlatformSupervisor);

    if(!isPlatformSupervisor){
      console.log('backendAddr should be a platformSupervisor!!');
      resolve(false);
    }
    if (!isTokenApprovedOperational) {
      console.log('Setting serverTime to TimeTokenUnlock+1 ...');
      serverTime = parseInt(TimeUnlockM)+1;
      const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenControllerCtrtAddr, encodedData);
      console.log('\nTxResult', TxResult);
      isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
      console.log('\nisTokenApprovedOperational():', isTokenApprovedOperational);
    }
    console.log('setTokenController() is completed');
    resolve(true);
  });
}




//-------------------==
const addProductRowFromSymbol = async(tokenSymbol, tokenName, location, duration, fundingType, pricingCurrency, fundmanagerIn, TimeReleaseDateIn) => {
  return new Promise(async (resolve, reject) => {
    console.log(`---------------==\naddProductRowFromSymbol()`);


    const [crowdFundingAddr, tokenControllerAddr, hcatAddr, incomeManagerAddr] = await getAllSmartContractAddrs(tokenSymbol);
    console.log(`--------==returned values from getAllSmartContractAddrs():\ncrowdFundingAddr: ${crowdFundingAddr}, tokenControllerAddr: ${tokenControllerAddr}, hcatAddr: ${hcatAddr}, incomeManagerAddr: ${incomeManagerAddr}`);

    const [initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSDM, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM] = await getDetailsCFC(crowdFundingAddr);
    console.log(`--------==returned values from getDetailsCFC(): \ninitialAssetPricingM: ${initialAssetPricingM}, maxTotalSupplyM: ${maxTotalSupplyM}, quantityGoalM: ${quantityGoalM}, CFSDM: ${CFSDM}, CFEDM: ${CFEDM}, stateDescriptionM: ${stateDescriptionM}, fundingStateM: ${fundingStateM}, remainingTokenQtyM: ${remainingTokenQtyM}, quantitySoldM: ${quantitySoldM}`);
  
    const [tokenSymbolM, siteSizeInKWM, maxTotalSupplyMH, pricingCurrencyM, IRR20yrx100M] = await getTokenContractDetails(hcatAddr).catch(async(err) => {
      console.log(`${err} \ngetTokenContractDetails() failed...`);
      return false;
    });
    console.log(`\n--------==returned values from getTokenContractDetails(): \ntokenSymbolM: ${tokenSymbolM}, siteSizeInKWM: ${siteSizeInKWM}, maxTotalSupplyMH: ${maxTotalSupplyMH}, pricingCurrencyM: ${pricingCurrencyM}, IRR20yrx100M: ${IRR20yrx100M}`);
  
    const [isGood, TimeTokenUnlockM, TimeTokenValidM, TokenState, TimeOfDeployment] = await checkTokenControllerCtrt(tokenControllerAddr);
    console.log(`\n TimeTokenUnlockM: ${TimeTokenUnlockM}, TimeTokenValidM: ${TimeTokenValidM}`);

    console.log(`\nlocation: ${location}, duration: ${duration}, fundingType: ${fundingType}, pricingCurrency: ${pricingCurrency}, fundmanagerIn: ${fundmanagerIn}`);

    const TimeReleaseDate = parseInt(TimeReleaseDateIn);
    if(operationMode === 9){
      if(TimeReleaseDate > parseInt(CFEDM) && TimeReleaseDate < parseInt(TimeTokenUnlockM)){
        console.log(`\n--------==TimeReleaseDate is a valid date under operationMode: ${operationMode}`);

      } else {
        console.log(`\n--------==TimeReleaseDate: ${TimeReleaseDate} is out of allowed range`);
        resolve(false);
      }
    }
    console.log(`\n--------==TimeReleaseDate: ${TimeReleaseDate}`);
    const result = await addProductRow(tokenSymbol, tokenName, location, initialAssetPricingM, duration, pricingCurrency, IRR20yrx100M, TimeReleaseDate, TimeTokenValidM, siteSizeInKWM, maxTotalSupplyMH, fundmanagerIn, CFSDM, CFEDM, quantityGoalM, TimeTokenUnlockM, fundingType, fundingStateM).catch((err) => {
      console.log('\n[Error @ addProductRow()]'+ err);
    });
    resolve(result);
  });
}


//-------------------==IncomeManager
//yarn run testmt -f 6x
const checkArgumentsIncomeManager = async(argsIncomeManager) => {
  return new Promise(async (resolve, reject) => {
    const [addrHCAT721, addrHelium, acTimeOfDeployment_IM] = argsIncomeManager;
    let mesg = '';
    console.log(`addrHCAT721: ${addrHCAT721}, addrHelium: ${addrHelium}, acTimeOfDeployment_IM: ${acTimeOfDeployment_IM}`);

    const [is_checkHCATTokenCtrt, nftsymbolM, maxTotalSupplyM, initialAssetPricingM, TimeOfDeploymentM, tokenIdM, isPlatformSupervisorM] = await checkHCATTokenCtrt(addrHCAT721).catch(async(err) => {
      console.log(`${err} \ncheckHCATTokenCtrt() failed...`);
      return false;
    });
    if(!is_checkHCATTokenCtrt){
      console.log(`\ncheckHCATTokenCtrt() returned false...`);
      mesg += ', [0] addrHCAT721 should have a HCAT Contract';
    }

    const instHelium = new web3.eth.Contract(Helium.abi, addrHelium);
    const Helium_Admin = await instHelium.methods.Helium_Admin().call();
    if(Helium_Admin.length === 0){
      mesg += ', [1] addrHelium should have Helium Contract';
    }

    if(acTimeOfDeployment_IM <= 0){
      mesg += ', [2] acTimeOfDeployment_IM should be > 0';
    }

    if(mesg.substring(0,2) === ', '){
      mesg = mesg.substring(2);
    }
    console.log('\n==>>>mesg:', mesg);
    if(mesg.length > 0){
      resolve(false);
    } else {
      resolve(true);
    }
  });
}

const deployIncomeManagerContract = async(argsIncomeManager) => {
  return new Promise(async (resolve, reject) => {

    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    let instIncomeManager;
    try{
      instIncomeManager = await new web3deploy.eth.Contract(IncomeManager.abi)
      .deploy({ data: prefix+IncomeManager.bytecode, arguments: argsIncomeManager })
      .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
          reject(error.toString());
          return false;
      });
    } catch(err){
      console.log('err:', err);
    }

    console.log('IncomeManager.sol has been deployed');
    if (instIncomeManager === undefined) {
      reject('[Error] instIncomeManager is NOT defined');
      return false;
    } else {
      console.log('[Good] instIncomeManager is defined');
      instIncomeManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      const IncomeManager_Addr = instIncomeManager.options.address
      console.log(`const addrIncomeManager = ${IncomeManager_Addr}`);
  
      const boolArray = await instIncomeManager.methods.checkDeploymentConditions(...argsIncomeManager).call();
      console.log('checkDeploymentConditions():', boolArray);
      if(boolArray.length !== 3){
        console.error('checkDeploymentConditions boolArray.length is not valid');
        reject({isGood: undefined, IncomeManager_Addr: undefined});
        return false;
      }
      const isGood = !(boolArray.includes(false));
      if(isGood){
        console.log('[Success] all checks have passed');
      } else {
        console.log('[Failed] Some/one check(s) have/has failed');
      }
      resolve({isGood, IncomeManager_Addr});
    }
  });
}


const checkDeploymentIncomeManager = async(IncomeManager_Addr, argsIncomeManager) => {
  return new Promise(async (resolve, reject) => {
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, IncomeManager_Addr);
    const result = await instIncomeManager.methods.checkDeploymentConditions(...argsIncomeManager).call();
    console.log('checkDeploymentConditions():', result);

    if(result.includes(false)){
      console.log('[Failed] Some/one check(s) have/has failed');
      resolve(false);
    } else {
      console.log('[Success] all checks have passed');
      resolve(true);
    }
  });
}

//----------------------------==
const getFundingStateCFC = async (crowdFundingAddr) => {
  console.log('[getFundingStateCFC] crowdFundingAddr...');
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let fundingState = await instCrowdFunding.methods.fundingState().call();
  let fundingStateAlphabets;
  if(fundingState === '0'){
    fundingStateAlphabets = 'initial';
  } else if(fundingState === '1'){
    fundingStateAlphabets = 'funding';
  } else if(fundingState === '2'){
    fundingStateAlphabets = 'fundingPaused';
  } else if(fundingState === '3'){
    fundingStateAlphabets = 'fundingGoalReached';
  } else if(fundingState === '4'){
    fundingStateAlphabets = 'fundingClosed';
  } else if(fundingState === '5'){
    fundingStateAlphabets = 'fundingNotClosed';
  } else if(fundingState === '6'){
    fundingStateAlphabets = 'terminated';
  } else {
    fundingStateAlphabets = 'out of range';
  }
  console.log('fundingState', fundingState, ', fundingStateAlphabets:', fundingStateAlphabets, ', crowdFundingAddr:', crowdFundingAddr);
}

const getHeliumAddrCFC = async (crowdFundingAddr) => {
  console.log('[getHeliumAddrCFC] crowdFundingAddr...');
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let HeliumCtrtAddr = await instCrowdFunding.methods.addrHelium().call();
  console.log('HeliumCtrtAddr', HeliumCtrtAddr, ', crowdFundingAddr:', crowdFundingAddr);
}

const updateFundingStateCFC = async (crowdFundingAddr, serverTime, symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n[updateFundingStateCFC] crowdFundingAddr', crowdFundingAddr, 'serverTime', serverTime);
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

    let stateDescription = await instCrowdFunding.methods.stateDescription().call();
    //const symbol = await instCrowdFunding.methods.tokenSymbol().call();
    let fundingState = await instCrowdFunding.methods.fundingState().call();
    console.log(`\nsymbol: ${symbol}, fundingState: ${fundingState}`);

    if(parseInt(fundingState) < 4){
      console.log(`the CF contract of ${symbol} is ready to be updated...`);
      const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
      console.log('about to execute updateState() in the CFC...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData).catch( async(err) => {
        const TimeOfDeployment = await instCrowdFunding.methods.TimeOfDeployment().call();
        const checkupdateState = serverTime > TimeOfDeployment;
        stateDescription = await instCrowdFunding.methods.stateDescription().call();
        const checkPlatformSupervisorFromCFC_M = await instCrowdFunding.methods.checkPlatformSupervisor().call({from: backendAddr});
        let HeliumCtrtAddr = await instCrowdFunding.methods.addrHelium().call();

        console.log('\n[Error @ signTx() updateState(serverTime)], checkupdateState:'+checkupdateState)
        console.log(`symbol: ${symbol}, fundingState: ${fundingState}, stateDescription: ${stateDescription}, TimeOfDeployment: ${TimeOfDeployment}, serverTime: ${serverTime}, checkPlatformSupervisorFromCFC_M: ${checkPlatformSupervisorFromCFC_M}, HeliumCtrtAddr: ${HeliumCtrtAddr}`);
        reject('err:'+err);
        return undefined;
      });
      console.log('\nTxResult', TxResult);
  
      fundingState = await instCrowdFunding.methods.fundingState().call();
      console.log('\nnew fundingState:', fundingState, ', stateDescription:', stateDescription, '\ncrowdFundingAddr', crowdFundingAddr);
      resolve(fundingState);

    } else {
      //    enum FundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, terminated}
      let fundingStateAlphabets;
      if(fundingState === '0'){
        fundingStateAlphabets = 'initial';
      } else if(fundingState === '1'){
        fundingStateAlphabets = 'funding';
      } else if(fundingState === '2'){
        fundingStateAlphabets = 'fundingPaused';
      } else if(fundingState === '3'){
        fundingStateAlphabets = 'fundingGoalReached';
      } else if(fundingState === '4'){
        fundingStateAlphabets = 'fundingClosed';
      } else if(fundingState === '5'){
        fundingStateAlphabets = 'fundingNotClosed';
      } else if(fundingState === '6'){
        fundingStateAlphabets = 'terminated';
      } else {
        fundingStateAlphabets = 'out of range';
      }
      console.warn('[Warning] the CF contract should not be updated... DB p_state should be updated with ', fundingStateAlphabets, ', fundingState=', fundingState, ', stateDescription:', stateDescription);
      resolve(fundingState);
    }
  });
}


//-----------------==TokenController
const getTokenStateTCC = async (tokenControllerAddr) => {
  console.log('[getFundingStateCFC] tokenControllerAddr', tokenControllerAddr);
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
  let fundingStateAlphabets;
  if(fundingState === '0'){
    fundingStateAlphabets = 'lockup';
  } else if(fundingState === '1'){
    fundingStateAlphabets = 'normal';
  } else if(fundingState === '2'){
    fundingStateAlphabets = 'expired';
  } else {
    fundingStateAlphabets = 'out of range';
  }
  console.log('tokenState:', tokenState, ', fundingStateAlphabets:', fundingStateAlphabets, ', tokenControllerAddr:', tokenControllerAddr);
}
const getHeliumAddrTCC = async (tokenControllerAddr) => {
  console.log('[getHeliumAddrTCC] tokenControllerAddr...');
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let HeliumCtrtAddr = await instTokenController.methods.addrHelium().call();
  console.log('HeliumCtrtAddr', HeliumCtrtAddr, ', tokenControllerAddr:', tokenControllerAddr);
}

const updateTokenStateTCC = async (tokenControllerAddr, serverTime, symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n[updateTokenStateTCC] tokenControllerAddr:', tokenControllerAddr, ', serverTime:', serverTime);
    const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);

    let tokenState = await instTokenController.methods.tokenState().call();
    console.log(`\nsymbol: ${symbol}, tokenState: ${tokenState}`);

    if(parseInt(tokenState) < 2){
      console.log(`the CF contract of ${symbol} is ready to be updated...`);
      const encodedData = instTokenController.methods.updateState(serverTime).encodeABI();
      console.log('about to execute updateState() in the TCC...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenControllerAddr, encodedData).catch( async(err) => {
        const checkPlatformSupervisorFromTCC_M = await instTokenController.methods.checkPlatformSupervisorFromTCC().call({from: backendAddr});
        let HeliumCtrtAddr = await instTokenController.methods.addrHelium().call();

        console.log(`[Error @ signTx() updateState(serverTime) in TCC] \nsymbol: ${symbol}, tokenState: ${tokenState}, serverTime: ${serverTime}, checkPlatformSupervisorFromTCC_M: ${checkPlatformSupervisorFromTCC_M}, HeliumCtrtAddr: ${HeliumCtrtAddr}`);
        reject('err:'+ err);
        return undefined;
      });
      console.log('\nTxResult', TxResult);
      tokenState = await instTokenController.methods.tokenState().call();
      console.log('\nnew tokenState:', tokenState, '\ntokenControllerAddr', tokenControllerAddr);
      tokenUnlock = await instTokenController.methods.TimeUnlock().call();
      console.log(`tokenUnlock : ${tokenUnlock}`)
      tokenValid = await instTokenController.methods.TimeValid().call();
      console.log(`tokenValid : ${tokenValid}`)
      resolve(tokenState);

    } else {
      //enum TokenState{lockup, normal, expired}
      let tokenStateAlphabets;
      if(tokenState === '0'){
        tokenStateAlphabets = 'lockup';
      } else if(tokenState === '1'){
        tokenStateAlphabets = 'normal';
      } else if(tokenState === '2'){
        tokenStateAlphabets = 'expired';
      } else {
        tokenStateAlphabets = 'out of range';
      }
      console.warn('[Warning] the TC contract should not be updated... DB p_tokenState should be updated with', tokenStateAlphabets, ' tokenState=', tokenState);
      resolve(tokenState);
    }
  });
}

const getCFC_Balances = async(crowdFundingAddr, assetbooks) => {
  return new Promise(async (resolve, reject) => {
    console.log(`---------------==\ngetCFC_Balances()`);
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

    const cfQuantities = [];
    await asyncForEach(assetbooks, async (assetbook, idx) => {
      console.log(`\n--------==AssetOwner${idx+1}: AssetBook${idx+1} and HCAT721...`);
      const qty = await instCrowdFunding.methods.ownerToQty(assetbook).call();
      cfQuantities.push(parseInt(qty));
    });
    console.log('cfQuantities', cfQuantities);
    console.log('cfQuantities() has been completed');
    resolve(cfQuantities);
  });
}

const getTokenBalances = async(tokenCtrtAddr, assetbooks) => {
  return new Promise(async (resolve, reject) => {
    console.log(`---------------==\ngetTokenBalances()`);
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    const assetbookBalances = [];
    await asyncForEach(assetbooks, async (assetbook, idx) => {
      console.log(`\n--------==AssetOwner${idx+1}: AssetBook${idx+1} and HCAT721...`);
      balanceXM = await instHCAT721.methods.balanceOf(assetbook).call();
      assetbookBalances.push(parseInt(balanceXM));
    });
    console.log('assetbookBalances', assetbookBalances);
    console.log('assetbookBalances() has been completed');
    resolve(assetbookBalances);
  });
}

const showAssetBookBalance_TokenId = async () => {
  await asyncForEach(assetbookArray, async (assetbook, idx) => {
    console.log(`\n--------==AssetOwner${idx+1}: AssetBook${idx+1} and HCAT721...`);
    tokenIds = await instHCAT721.methods.getAccountIds(assetbook, 0, 0).call();
    balanceXM = await instHCAT721.methods.balanceOf(assetbook).call();
    console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
    accountM = await instHCAT721.methods.getAccount(assetbook).call();
    console.log('HCAT getAccount():', accountM);

    const instAssetBookX = new web3.eth.Contract(AssetBook.abi, assetbook);
    assetbookXM = await instAssetBookX.methods.getAsset(0, addrHCAT721).call();
    console.log(`AssetBook${idx}: ${assetbookXM}`);
  });
  console.log('showAssetBookBalance_TokenId() has been completed');
  process.exit(0);
}

//disable promises so we dont wait for it
const sequentialCheckBalances = async (addressArray, tokenCtrtAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n------==inside sequentialCheckBalances()');
    //console.log(`addressArray= ${addressArray}, amountArray= ${amountArray}`);
    const balanceArrayBefore = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    await asyncForEachMint(addressArray, async (toAddress) => {
      console.log(`--------------==balance of ${toAddress}`);
      const balB4Minting = await instHCAT721.methods.balanceOf(toAddress).call();
      balanceArrayBefore.push(parseInt(balB4Minting));
    });

    console.log('\n--------------==Done sequentialCheckBalances()');
    console.log('[Completed] All of the investor list has been cycled through');
    resolve(balanceArrayBefore);
  });
}


const sequentialCheckBalancesAfter = async (addressArray, amountArray, tokenCtrtAddr, balanceArrayBefore, isToMax) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n---------------==inside sequentialCheckBalancesAfter()');
    //console.log(`addressArray= ${addressArray}, amountArray= ${amountArray}`);
    if(!amountArray.every(isInt)){
      reject('[error @ sequentialCheckBalancesAfter()] amountArray has non integer item');
      return false;
    }
    if(!balanceArrayBefore.every(isInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] balanceArrayBefore has non integer item. \nbalanceArrayBefore:', balanceArrayBefore);
      reject('[error @ sequentialCheckBalancesAfter()] balanceArrayBefore has non integer item.');
      return false;
    }

    const isCorrectAmountArray = [];
    const balanceArrayAfter = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    
    if(addressArray.length !== amountArray.length){
      reject('addressArray and amountArray must be of the same length');
      return false;
    }
    await asyncForEachMint(addressArray, async (toAddress, idx) => {
      const amount = amountArray[idx];
      const balanceBefore = balanceArrayBefore[idx];
      const tokenBalanceAfterMinting_ = await instHCAT721.methods.balanceOf(toAddress).call();
      const tokenBalanceAfterMinting = parseInt(tokenBalanceAfterMinting_);
      const increase = tokenBalanceAfterMinting - balanceBefore;
      let isCorrect;
      if(isToMax){
        isCorrect = (amount === tokenBalanceAfterMinting);
      } else {
        isCorrect = (parseInt(amount) === increase);
      }
      isCorrectAmountArray.push(isCorrect);
      console.log(`
      balance: expected increase: ${amount} ... actual increase: ${increase} = ${tokenBalanceAfterMinting} - ${balanceBefore}
      typeof amount ${typeof amount} ...  typeof tokenBalanceAfterMinting ${typeof tokenBalanceAfterMinting}, typeof balanceBefore ${typeof balanceBefore}, isCorrect: ${isCorrect}`);
      balanceArrayAfter.push(tokenBalanceAfterMinting);
    });

    console.log('\n--------------==Done sequentialCheckBalancesAfter()');
    console.log('[Completed] All of the investor list has been cycled through');
    resolve([isCorrectAmountArray, balanceArrayAfter]);
  });
}


const checkMint = async(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const isAssetbookGood = await tokenReceiver(toAddress).catch(async(err) => {
      console.log(`${err} \ncheckAssetbook() failed...`);
      reject(false);
      return false;
    });
    if(isAssetbookGood){
      console.log('checkMint_isAssetbookGood is true');
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      const result = await instHCAT721.methods.checkMintSerialNFT(toAddress, amount, price, fundingType, serverTime).call({from: backendAddr});
      console.log('\nresult', result);
      const uintArray = result[1];
      const boolArray = result[0];

      if(boolArray.length !== 11){
        console.error('[Error] checkMintSerialNFT boolArray.length is not valid');
        reject(false);
        return false;
      }

      let mesg = '';
      if(boolArray.every(checkBoolTrueArray)){
        mesg = '[Success] all checks have passed';
        console.log(mesg);
        resolve(mesg);

      } else {
        if(!boolArray[0]){
          mesg += ', [0] toAddress has no contract';
        } 
        if(!boolArray[1]){
          mesg += ', [1] toAddress has no tokenReceiver()';
        } 
        if(!boolArray[2]){
          mesg += ', [2] amount <= 0';
        } 
        if(!boolArray[3]){
          mesg += ', [3] price <= 0';
        } 
        if(!boolArray[4]){
          mesg += ', [4] fundingType <= 0';
        } 
        if(!boolArray[5]){
          mesg += ', [5] serverTime <= TimeOfDeployment';
        } 
        if(!boolArray[6]){
          mesg += ', [6] tokenId + amount > maxTotalSupply';
        } 
        if(!boolArray[7]){
          mesg += ', [7] Caller is not approved by HeliumCtrt.checkPlatformSupervisor()';
        } 
        if(!boolArray[8]){
          mesg += ', [8] Registry.isFundingApproved() ... buyAmount > maxBuyAmount';
        } 
        if(!boolArray[9]){
          mesg += ', [9] Registry.isFundingApproved() ... balance + buyAmount > maxBalance';
        }
        if(!boolArray[10]){
          mesg += ', [10] Registry.isAssetbookApproved false';
        }
        if(mesg.substring(0,2) === ', '){
          mesg = mesg.substring(2);
        }
        let fundingTypeDescription;
        if(fundingType === '1' || fundingType === 'PO'){
          fundingTypeDescription = 'Public Offering';
        } else if(fundingType === '2' || fundingType === 'PP'){
          fundingTypeDescription = 'Private Placement';
        } else {
          fundingTypeDescription = 'Error in funding type';
        }//PO: 1, PP: 2
        console.log(`\n[Error message] ${mesg} \n===>>> fundingType: ${fundingType} ${fundingTypeDescription} \nauthLevel: ${uintArray[0]}, maxBuyAmount: ${uintArray[1]}, maxBalance: ${uintArray[2]}`);
        resolve(true);
      }
    }
  });
}


const sequentialMintToAdd = async(addressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n----------------------==sequentialMintToAdd()');
    console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, serverTime: ${serverTime}`);
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    if(addressArray.length !== amountArray.length){
      reject('addressArray and amountArray must be of the same length');
      return false;
    }

    await asyncForEachMint(addressArray, async (toAddress, idxMint) => {
      const amountForThisAddr = amountArray[idxMint];
      const [addressArrayOut, amountArrayOut] = breakdownArray(toAddress, amountForThisAddr, maxMintAmountPerRun);
      console.log(`addressArray: ${addressArray}, amountArray: ${amountArray}
  addressArrayOut: ${addressArrayOut}, amountArrayOut: ${amountArrayOut}`);
      console.log(`\n---------------==next: mint to ${toAddress} ${amountForThisAddr} tokens`);

      const balB4MintingStr1 = await instHCAT721.methods.balanceOf(toAddress).call();
      const balB4Minting1 = parseInt(balB4MintingStr1);
      const balMaxForThisAddr = balB4Minting1 + amountForThisAddr;
      console.log(`pre mint balance for this address: ${balB4MintingStr1}
      plus our minting amount ${amountForThisAddr}
      => max allowed balance for this addr: ${balMaxForThisAddr}`);

      const idxMintMax = addressArray.length -1;
      await asyncForEachMint2(addressArrayOut, idxMint, idxMintMax, async (toAddress, idxMintSub) => {
        let amountSub = amountArrayOut[idxMintSub];
        console.log(`\n    minting ${amountSub} tokens`);

        const balB4MintingStr2 = await instHCAT721.methods.balanceOf(toAddress).call();
        const balB4Minting2 = parseInt(balB4MintingStr2);
        const remainingAmount = balMaxForThisAddr - balB4Minting2;
        if(remainingAmount >= maxMintAmountPerRun && amountSub !== maxMintAmountPerRun){
          reject('[Error] amountSub is not enough!');
          return false;
        } else if(remainingAmount < maxMintAmountPerRun && amountSub !== remainingAmount){
          reject('[Error] amountSub is not correct!');
          return false;
        }

        if(balB4Minting2 < balMaxForThisAddr){
          console.log(`balance before sub mint: ${balB4Minting2} < max allowed balance for this addr: ${balMaxForThisAddr}`);
          const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amountSub, price, fundingType, serverTime).encodeABI();
          const TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch(async(err) => {
            console.log('\n[Error @ signTx() mintSerialNFT()]'+ err);
            await checkMint(tokenCtrtAddr, toAddress, amountSub, price, fundingType, serverTime);
          });
          console.log('TxResult', TxResult);
        } else {
          console.log('\nbalance for this address has been reached. Minting skipped');
        }
      });
    });
    console.log('\n--------------==Done sequentialMintToAdd()');
    console.log('[Completed] All of the investor list has been cycled through');
    resolve(true);
  });
}


const sequentialMintToMax = async(addressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n----------------------==sequentialMintToMax()');
    console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, serverTime: ${serverTime}`);
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    if(addressArray.length !== amountArray.length){
      reject('addressArray and amountArray must be of the same length');
      return false;
    }

    await asyncForEachMint(addressArray, async (toAddress, idxMint) => {
      const balMaxForThisAddr = amountArray[idxMint];
      const balB4MintingStr1 = await instHCAT721.methods.balanceOf(toAddress).call();
      const balB4Minting1 = parseInt(balB4MintingStr1);
      const [addressArrayOut, amountArrayOut] = breakdownArray(toAddress, balMaxForThisAddr-balB4Minting1, maxMintAmountPerRun);
      console.log(`addressArray: ${addressArray}, amountArray: ${amountArray}
  addressArrayOut: ${addressArrayOut}, amountArrayOut: ${amountArrayOut}`);
      console.log(`\n---------------==next: mint to ${toAddress} ${balMaxForThisAddr} tokens`);

      const idxMintMax = addressArray.length -1;
      await asyncForEachMint2(addressArrayOut, idxMint, idxMintMax, async (toAddress, idxMintSub) => {
        let amountSub = amountArrayOut[idxMintSub];
        console.log(`    minting ${amountSub} tokens`);

        const balB4MintingStr2 = await instHCAT721.methods.balanceOf(toAddress).call();
        const balB4Minting2 = parseInt(balB4MintingStr2);
        const remainingAmount = balMaxForThisAddr - balB4Minting2;
        if(remainingAmount >= maxMintAmountPerRun){
          amountSub = maxMintAmountPerRun;
        } else {
          amountSub = remainingAmount;
        }
        if(amountSub > 0){
          const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amountSub, price, fundingType, serverTime).encodeABI();
          const TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch(async(err) => {
            console.log('\n[Error @ signTx() mintSerialNFT()]'+ err);
            await checkMint(tokenCtrtAddr, toAddress, amountSub, price, fundingType, serverTime);
          });

          const maxTotalSupply = await instHCAT721.methods.maxTotalSupply().call();
          const totalSupply = await instHCAT721.methods.totalSupply().call();
      
          console.log(`    fundingType: ${fundingType}, blockNumber: ${TxResult.blockNumber}, Status: ${TxResult.status},
  remainingQuantityForMinting: ${maxTotalSupply-totalSupply}`);
          //console.log('TxResult', TxResult);
        } else {
          console.log('skipping minting 0 token');
        }
      });
    });
    console.log('\n--------------==Done sequentialMintToMax()');
    console.log('[Completed] All of the investor list has been cycled through');
    resolve(true);
  });
}




//yarn run testmt -f 40
const preMint = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside preMint()');
    let mesg = '';//PO: 1, PP: 2

    const queryStr1 = 'SELECT sc_crowdsaleaddress, sc_erc721address, sc_erc721Controller FROM smart_contracts WHERE sc_symbol = ?';
    const result1 = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
      mesg = '[Error @ preMint() > mysqlPoolQueryB(queryStr1)] '+ err;
      console.log(`\n${mesg}`);
      reject(mesg);
      return false;
    });
    console.log('result1:', result1);
    if(isEmpty(result1)){
      reject('no contract address is found for that symbol');
      return false;
    }

    const queryStr2 = 'SELECT p_pricing, p_fundingType from product where p_SYMBOL = ?';
    const result2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
      mesg = '[Error @ preMint() > mysqlPoolQueryB(queryStr2)], '+ err;
      console.log(`\n${mesg}`);
      reject(mesg);
      return false;
    });
    console.log('result2:', result2);
    if(isEmpty(result2)){
      reject('no pricing and fundingType is found for that symbol');
      return false;
    }

    const pricing = parseInt(result2[0].p_pricing);
    const fundingType = result2[0].p_fundingType;
    console.log('pricing:', pricing, 'fundingType:', fundingType);

    if(result1 && result2){
      crowdFundingAddr = result1[0].sc_crowdsaleaddress;
      tokenCtrtAddr = result1[0].sc_erc721address;
      tokenControllerAddr = result1[0].sc_erc721Controller;
      console.log(`crowdFundingAddr: ${crowdFundingAddr}
tokenCtrtAddr: ${tokenCtrtAddr}
tokenControllerAddr: ${tokenControllerAddr}`); 

      const [investorAssetBooks, investedTokenQtyArray] = await getInvestorsFromCFC(crowdFundingAddr);
      console.log(`symbol: ${symbol}, tokenCtrtAddr: ${tokenCtrtAddr}
      investorAssetBooks: ${investorAssetBooks} \ninvestedTokenQtyArray: ${investedTokenQtyArray}`);

      if (investorAssetBooks.length === 0 || investedTokenQtyArray.length === 0 || isEmpty(tokenCtrtAddr) || isEmpty(pricing) || isEmpty(fundingType)) {
        console.log(`[Error] preMint() returns invalid values, investorAssetBooks length: ${investorAssetBooks.length},investedTokenQtyArray length: ${investedTokenQtyArray.length},tokenCtrtAddr: ${tokenCtrtAddr}`);
        resolve([false, 'preMint() returns invalid values', investorAssetBooks, investedTokenQtyArray, tokenCtrtAddr, fundingType, pricing]);

      } else {
        resolve([true, 'successfully done @ preMint()', investorAssetBooks, investedTokenQtyArray, tokenCtrtAddr, fundingType, pricing]);
      }

    } else {
      mesg = 'no contract address and/or no p_pricing, p_fundingType is found for that symbol';
      console.log(`${mesg}. result1: ${result1} \nresult2: ${result2}`);
      reject(mesg);
      return false;
    }
  });
}



const mintSequentialPerContract = async(symbol, serverTime, maxMintAmountPerRun) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n---------------------==mintSequentialPerContract()...');
    let mesg= '';
    const [is_preMint, mesg_preMint, addressArray, amountArray, tokenCtrtAddr, fundingType, pricing] = await preMint(symbol).catch((err) => {
      mesg = `[Error] failed @ preMint(). err: ${err}`;
      console.error(mesg);
      reject(mesg);
      return false;
    });
    console.log(`--------------==Returned values from preMint(): \nis_preMint: ${is_preMint}, mesg_preMint: ${mesg_preMint}
  \naddressArray: ${addressArray} \namountArray: ${amountArray} \ntokenCtrtAddr: ${tokenCtrtAddr}, \npricing: ${pricing}, fundingType: ${fundingType}`);
  
    //process.exit(0);
    if(is_preMint){
      //----------------==doAssetRecords
      const [is_doAssetRecords, mesg_doAssetRecords, emailArrayError, amountArrayError, is_addActualPaymentTime, is_setFundingStateDB] = await doAssetRecords(addressArray, amountArray, serverTime, symbol, pricing).catch((err) => {
        mesg = `[Error @ doAssetRecords]: ${err}`;
        console.error(mesg);
        reject(mesg);
        return false;
      });
      console.log(`\nreturned values from doAssetRecords(): is_doAssetRecords: ${is_doAssetRecords}, mesg_doAssetRecords: ${mesg_doAssetRecords}, \nemailArrayError: ${emailArrayError}, \namountArrayError: ${amountArrayError}, \nis_addActualPaymentTime: ${is_addActualPaymentTime}, \nis_setFundingStateDB: ${is_setFundingStateDB}`);
  
      const result = await updateIAassetRecordStatus(symbol).catch((err) => {
        mesg = `[Error @ updateIAassetRecordStatus]: ${err}`;
        console.error(mesg);
        reject(mesg);
        return false;
      });
      console.log(`\nupdateIAassetRecordStatus_API result: ${result}`)

      //process.exit(0);
      //----------------==mint tokens
      const [is_sequentialMintSuper, isCorrectAmountArray, mesg_sequentialMintSuper] = await sequentialMintSuper(addressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime).catch((err) => {
        mesg = `[Error @ sequentialMintSuper] ${err}`;
        console.error(mesg);
        reject(mesg);
        return false;
      });
      console.log(`\n--------------== \nreturned values from sequentialMintSuper() \nis_sequentialMintSuper: ${is_sequentialMintSuper}, \nisCorrectAmountArray: ${isCorrectAmountArray}, \nmesg_sequentialMintSuper: ${mesg_sequentialMintSuper}`);
      resolve([is_preMint, is_doAssetRecords, is_addActualPaymentTime, is_setFundingStateDB, is_sequentialMintSuper]);

    } else {
      console.log(`isPreMint() failed ...`);
      resolve([is_preMint, undefined, undefined, undefined, undefined]);
    }
  });
}


//to be called from API and zlivechain.js, etc...
const sequentialMintSuper = async (addressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n----------------------==inside sequentialMintSuper()...');
    let mesg;
    //console.log(`addressArray= ${addressArray}, amountArray= ${amountArray}`);
    if(!amountArray.every(isIntAboveOne)){
      mesg = 'failed at amountArray.every(isIntAboveOne)';
      console.log('amountArray has non integer or zero element');
      resolve([false, [], mesg]);
      return false;
    }
    const checkResult = await checkAssetbookArray(addressArray).catch(async(err) => {
      mesg = 'failed at checkAssetbookArray()';
      console.log(`checkAssetbookArray() result: ${err}, checkAssetbookArray() failed inside asyncForEachAbCFC(). addressArray: ${addressArray}`);
      resolve([false, [], mesg]);
      return false;
    });
    if(checkResult.includes(false)){
      mesg = 'failed at checkResult.includes(false)';
      console.log(`\naddressArray has at least one invalid item. \n\naddressArray: ${addressArray} \n\ncheckAssetbookArray() Result: ${checkResult}`);
      resolve([false, [], mesg]);
      return false;
    } else {
      console.log(`all input addresses has been checked good by checkAssetbookArray \ncheckResult: ${checkResult} `);
    }

    const [is_checkHCATTokenCtrt, nftsymbolM, maxTotalSupplyM, initialAssetPricingM, TimeOfDeploymentM, tokenIdM, isPlatformSupervisorM] = await checkHCATTokenCtrt(tokenCtrtAddr).catch(async(err) => {
      console.log(`${err} \ncheckHCATTokenCtrt() failed...`);
      mesg = 'failed at checkHCATTokenCtrt()';
      resolve([false, [], mesg]);
      return false;
    });
    if(!is_checkHCATTokenCtrt){
      mesg = 'failed at is_checkHCATTokenCtrt';
      console.log(`\n${mesg}`);
      resolve([false, [], mesg]);
      return false;
    }

    console.log('\n--------------==before minting tokens, check balances now...');
    const balanceArrayBefore = await sequentialCheckBalances(addressArray, tokenCtrtAddr).catch(async(err) => {
      console.log(`${err} \nsequentialCheckBalances() failed...`);
      mesg = 'failed at sequentialCheckBalances()';
      resolve([false, [], mesg]);
      return false;
    });
    console.log('balanceArrayBefore', balanceArrayBefore, '\ntarget amountArray:', amountArray);

    const [isGoodAmountArray, isAllGood] = checkTargetAmounts(balanceArrayBefore, amountArray);
    console.log('isGoodAmountArray:', isGoodAmountArray, ', isAllGood:', isAllGood);
    if(!isAllGood){
      mesg = '[Error] at least one target mint amount is lesser than its existing balance';
      console.log(mesg);
      resolve([false, [], mesg]);
      return false;
    }

    console.log('\n--------------==Minting tokens via sequentialMintToMax()...');
    await sequentialMintToMax(addressArray, amountArray, maxMintAmountPerRun, fundingType, pricing, tokenCtrtAddr, serverTime).catch((err) => {
      console.log('[Error @ sequentialMintToMax]'+ err);
      mesg = 'failed at sequentialMintToMax';
      resolve([false, [], mesg]);
      return false;
    });
    // console.log('\n--------------==Minting tokens via sequentialMintToAdd()...');
    // await sequentialMintToAdd(addressArray, amountArray, maxMintAmountPerRun, fundingType, pricing, tokenCtrtAddr, serverTime).catch((err) => {
    //   console.log('[Error @ sequentialMintToAdd]'+ err);
    //   return false;
    // });

    const isToMax = true;
    console.log('\n--------------==after minting tokens, check balances now...');
    const [isCorrectAmountArray, balanceArrayAfter] = await sequentialCheckBalancesAfter(addressArray, amountArray, tokenCtrtAddr, balanceArrayBefore, isToMax).catch((err) => {
      console.log('[Error @ sequentialCheckBalancesAfter]'+ err);
      mesg = 'failed at sequentialCheckBalancesAfter';
      resolve([false, [], mesg]);
      return false;
    });

    console.log('\n--------------==Done sequentialCheckBalancesAfter()');
    console.log('\nbalanceArrayBefore', balanceArrayBefore, '\nbalanceArrayAfter', balanceArrayAfter);

    const is_sequentialMintSuper = !(isCorrectAmountArray.includes(false));
    if (is_sequentialMintSuper) {
      mesg = '[Success] All token minting has been completed successfully';
    } else {
      mesg = `[Failed] Some/All minting actions have failed. Check isCorrectAmountArray!`;
    }
    console.log(`\n[sequentialMintSuper] is_sequentialMintSuper: ${is_sequentialMintSuper}, \nisCorrectAmountArray: ${isCorrectAmountArray}, \nmesg: ${mesg}`);
    resolve([is_sequentialMintSuper, isCorrectAmountArray, mesg]);
  });
}


//-----------------------------==
const sequentialRunTsMain = async (mainInputArray, waitTime, serverTime, extraInputArray) => {
  console.log('\n----------==inside sequentialRunTsMain()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, serverTime= ${serverTime}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime is not an integer. serverTime:', serverTime);
    return false;
  }
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return false;
  }

  const actionType = extraInputArray[0];
  if(waitTime < 7000 && actionType !== 'updateExpiredOrders'){
    //give DB a list of todos, no async/await ... make orders expired
    console.log('[Warning] waitTime is < min 5000, which is determined by the blockchain block interval time');
    return false;
  }
  //console.log('actionType:', actionType);

  await asyncForEachTsMain(mainInputArray, async (item) => {
    let symbol;
    if(item.hasOwnProperty('p_SYMBOL')){
      symbol = item.p_SYMBOL;

    } else if(item.hasOwnProperty('ia_SYMBOL')){
      symbol = item.ia_SYMBOL;

    } else if(actionType === 'mintTokenToEachBatch' && Number.isInteger(item) && extraInputArray.length === 5){
      symbol = 'Backend_mintToken_each_batch';
      console.log('item is an integer => mintTokenToEachBatch mode');

    } else if(actionType === 'updateExpiredOrders'){
      symbol = 'sym_updateExpiredOrders';
    }

    console.log('\n--------------==next symbol:', symbol);
    if (symbol === undefined || symbol === null || symbol.length < 8){
      console.log(`[Error] symbol not valid. actionType: ${actionType}, symbol: ${symbol}`);

    } else {

      if(actionType === 'mintTokenToEachBatch') {
        const amountToMint = item;
        const tokenCtrtAddr = extraInputArray[1];
        let toAddress = extraInputArray[2];
        let fundingType = extraInputArray[3];
        let price = extraInputArray[4];
        console.log(`to call mintToken(): amountToMint: ${amountToMint}, tokenCtrtAddr: ${tokenCtrtAddr}, toAddress: ${toAddress}, fundingType: ${fundingType}, price: ${price}`);
        await mintToken(amountToMint, tokenCtrtAddr, toAddress, fundingType, price);
        // see the above function defined below...

      } else if(actionType === 'updateExpiredOrders'){
        const oid = item.o_id;
        const oPurchaseDate = item.o_purchaseDate;
        if(oPurchaseDate.length < 12 || oPurchaseDate.length > 12){
          console.log('[Error] oPurchaseDate length is not of 12', oPurchaseDate);
          return false;
        }
        const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
        const serverTimeM = moment(serverTime, ['YYYYMMDD']);
        //console.log('serverTimeM', serverTimeM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
        if (serverTimeM >= oPurchaseDateM.add(3, 'days')) {
          console.log(`oid ${oid} is found serverTime >= oPurchaseDate ... write to DB`);
          const queryStr1 = 'UPDATE order_list SET o_paymentStatus = "expired" WHERE o_id = ?';
          const results = await mysqlPoolQueryB(queryStr1, [oid]).catch((err) => {
            console.log('[Error @ mysqlPoolQueryB(queryStr1)]: setting o_paymentStatus to expired; oid: '+oid+ ', err: '+ err);
          });
          console.log(`[Success] have written status of oid ${oid} as expired.`);
        }

      } else {
        //send time to contracts to see the result of determined state: e.g. fundingState, tokenState, ...
        const [isGood, targetAddr, resultMesg] = await getCtrtAddr(symbol, actionType).catch((err) => {
          console.log('[Error @getCtrtAddr]:'+ err);
          return false;
        });
        console.log(`\n${resultMesg}. actionType: ${actionType}`);
        if(isGood){
          await writeToBlockchainAndDatabase(targetAddr, serverTime, symbol, actionType);
          console.log('[Success] writingToBlockchainAndDatabase() is completed');
        } else {
          console.error(`[Error] at blockchain.js 1486`);
        }
      }
    }
  });
  console.log('\n--------------==Done');
  console.log('sequentialRunTsMain() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  return new Promise(async (resolve, reject) => {
    console.log('inside mintToken()');
    await getTimeServerTime().then(async function (serverTime) {
      console.log('acquired serverTime', serverTime);
      const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
      let encodedData = instHCAT721.methods.mintSerialNFT(to, amountToMint, price, fundingType, serverTime).encodeABI();
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, tokenCtrtAddr, encodedData).catch((err) => {
        reject('[Error @ signTx() mintSerialNFT(serverTime)]'+ err);
        return false;
      });
      //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
      console.log('TxResult', TxResult);
      resolve(true);
    });
  });
}




const doAssetRecords = async(addressArray, amountArray, serverTime, symbol, pricing) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n--------------==inside doAssetRecords()');
    let mesg, isAllGood = false;
    const ar_time = serverTime;
    const singleActualIncomePayment = 0;// after minting tokens

    const asset_valuation = 13000;
    const holding_amount_changed = 0;
    const holding_costChanged = 0;
    const moving_ave_holding_cost = 13000;

    const acquiredCostArray = amountArray.map((element) => {
      return element * pricing;
    });
    console.log('acquiredCostArray:', acquiredCostArray);

    const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(addressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost).catch((err) => {
      mesg = '[Error @ addAssetRecordRowArray] '+ err;
      console.error(mesg);
      reject(mesg);
      return false;
    });
    console.log('\n--------------== after addAssetRecordRowArray \nemailArrayError:', emailArrayError, '\namountArrayError:', amountArrayError);

    const actualPaymentTime = serverTime;
    const payablePeriodEnd = 0;
    const is_addActualPaymentTime = await addActualPaymentTime(actualPaymentTime, symbol, payablePeriodEnd).catch((err) => {
      mesg = '[Error @ addActualPaymentTime] '+ err;
      console.error(mesg);
      reject(mesg);
      return false;
    });
    console.log(`\n--------------== after addActualPaymentTime() \nis_addActualPaymentTime: ${is_addActualPaymentTime}`);

    const is_setFundingStateDB = await setFundingStateDB(symbol, 'ONM', 'na', 'na').catch((err) => {
      mesg = '[Error @ setFundingStateDB()] '+ err;
      console.error(mesg);
      reject(mesg);
      return false;
    });
    console.log('\n--------------== after setFundingStateDB()');

    console.log(`emailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError} \nis_addActualPaymentTime: ${is_addActualPaymentTime} \nis_setFundingStateDB: ${is_setFundingStateDB}`);
  
    if (emailArrayError.length > 0 || amountArrayError.length > 0) {
        mesg += ', addAssetRecordRowArray() went through but some entries failed. See emailArrayError and/or amountArrayError.';
    }
    if (!is_addActualPaymentTime) {
        mesg += ', addActualPaymentTime() Failed';
    }
    if (!is_setFundingStateDB) {
        mesg += ', setFundingStateDB() Failed';
    }

    if(isEmpty(mesg)) {
        isAllGood = true;
        mesg = 'Success @ addAssetRecordRowArray(), addActualPaymentTime(), setFundingStateDB()';
    }
    const is_doAssetRecords = true;
    resolve([is_doAssetRecords, mesg, emailArrayError, amountArrayError, is_addActualPaymentTime, is_setFundingStateDB]);
  });
}



// HHtoekn12222  Htoken001  Htoken0030
//-------------------------------==DB + BC
//-------------------==Crowdfunding
//From DB check if product:fundingState needs to be updated
const updateFundingStateFromDB = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateFundingStateFromDB(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }
    const queryStr2 = 'SELECT p_SYMBOL FROM product WHERE (p_state = "initial" AND p_CFSD <= '+serverTime+') OR (p_state = "funding" AND p_CFED <= '+serverTime+') OR (p_state = "fundingGoalReached" AND p_CFED <= '+serverTime+')';
    const symbolObjArray = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
      reject('[Error @ updateFundingStateFromDB: mysqlPoolQueryB(queryStr2)]: '+ err);
      return false;
    });

    const symbolObjArrayLen = symbolObjArray.length;
    console.log('\nsymbolObjArray length @ updateFundingStateFromDB:', symbolObjArrayLen, ', symbolObjArray:', symbolObjArray);

    if (symbolObjArrayLen === 0) {
      console.log('[updateFundingStateFromDB] no symbol was found for updating its crowdfunding contract');

    } else if (symbolObjArrayLen > 0) {
      const symbolArray = [];
      for (let i = 0; i < symbolObjArrayLen; i++) {
        if(!excludedSymbols.includes(symbolObjArray[i].p_SYMBOL)){
          symbolArray.push(symbolObjArray[i].p_SYMBOL)
        }
      }
      await sequentialRunTsMain(symbolArray, timeIntervalOfNewBlocks, serverTime, ['crowdfunding']);
    }
    resolve(true);
  });
}


//yarn run testts -a 2 -c 2
//find still funding symbols that have passed CDED2 -> expire all orders of that symbol
const makeOrdersExpiredCFED = async (serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\ninside makeOrdersExpiredCFED(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      reject('[Error] serverTime should be an integer');
      return false;
    }

    const queryStr1 = 'SELECT p_SYMBOL FROM product WHERE p_CFED <= ? AND (p_state = "initial" OR p_state = "funding" OR p_state = "fundingGoalReached")';
    const symbolObjArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)] '+ err);
      return false;
    });
    const symbolObjArrayLen = symbolObjArray.length;
    console.log('\nArray length @ makeOrdersExpiredCFED:', symbolObjArrayLen);
    //console.log('symbols:', symbolObjArray);

    if (symbolObjArrayLen === 0) {
      console.log('[makeOrdersExpiredCFED] no symbol was found');
      resolve(true);

    } else if (symbolObjArrayLen > 0) {
      console.log('[makeOrdersExpiredCFED] symbol(s) found');

      const symbolArray = [];
      for (let i = 0; i < symbolObjArrayLen; i++) {
        if(!excludedSymbols.includes(symbolObjArray[i].p_SYMBOL)){
          symbolArray.push(symbolObjArray[i].p_SYMBOL)
        }
      }
  
      //const queryStr = 'UPDATE product SET p_state = ? WHERE p_SYMBOL = ?';
      const queryStr3 = 'UPDATE order_list SET o_paymentStatus = "expired" WHERE o_symbol = ? AND o_paymentStatus = "waiting"';
      await asyncForEachOrderExpiry(symbolArray, async (symbol, index) => {
        /*
        //------------== auto determines the crowdfunding results -> write it into DB
        const crowdFundingAddr = await getCtrtAddr(symbol,'crowdfunding').catch((err) => {
          console.error('[Error @getCtrtAddr]:'+ err);
          continue;
        });
        const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    
        const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
        let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData);
        console.log('\nTxResult', TxResult);
      
        let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
        console.log('\nfundingState:', fundingState);

        let p_state;
        if(fundingState === '4'){
          p_state = 'fundingClosed';
        } else if(fundingState === '5'){
          p_state = 'fundingNotClosed';
        } else if(fundingState === '6'){
          p_state = 'terminated';
        }
        const results2 = await mysqlPoolQueryB(queryStr, [p_state, symbol]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr)]'+ err);
        });
        console.log('\nUpdated product of', symbol, results2);
        */

        //------------== 
        const results3 = await mysqlPoolQueryB(queryStr3, [symbol]).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr3)] '+ err);
          return false;
        });
        console.log('-------==[Success] updated orders to expired for symbol', symbol);
        resolve(true);
      });
    }
  });
  //process.exit(0);
}


//----------------------------------==
const addUsersToRegistryCtrt = async (registryCtrtAddr, userIDs, assetbooks, authLevels) => {
  return new Promise(async(resolve, reject) => {
    console.log(`\n------------==inside addUsersToRegistryCtrt \nregistryCtrtAddr: ${registryCtrtAddr} \nuserIDs: ${userIDs}, \nassetbooks: ${assetbooks}, \nauthLevels: ${authLevels}`);
    const results = []; let isGood;

    if(userIDs.length !== assetbooks.length) {
      reject('userIDs and assetbooks have different length');
      return false;
    } else if(userIDs.length !== authLevels.length) {
      reject('userIDs and authLevels have different length');
      return false;
    }
    const instRegistry = new web3.eth.Contract(Registry.abi, registryCtrtAddr);

    await asyncForEach(userIDs, async (userId, idx) => {
      const assetbookX = assetbooks[idx];
      console.log(`\n--------==Check: ${userId} ${typeof userId} ${authLevels[idx]} ${typeof authLevels[idx]} \n${assetbookX} ${typeof assetbookX}`);
      const boolArray = await instRegistry.methods.checkAddSetUser(userId, assetbookX, authLevels[idx]).call({from: backendAddr});
      /**
          boolArray[0] = HeliumITF_Reg(HeliumCtrtAddr).checkCustomerService(msg.sender);
          //ckUidLength(uid)
          boolArray[1] = bytes(uid).length > 0;
          boolArray[2] = bytes(uid).length <= 32;//compatible to bytes32 format, too
  
          //ckAssetbookValid(assetbookAddr)
          boolArray[3] = assetbookAddr != address(0);
          boolArray[4] = assetbookAddr.isContract();
          boolArray[5] = uidToAssetbook[uid] == address(0);
          boolArray[6] = authLevel > 0 && authLevel < 10;
       */
      console.log('boolArray:', boolArray);
      if(boolArray.length !== 7){
        console.error('checkAddSetUser boolArray.length is not valid');
        reject(false);
        return false;
      }
      if(boolArray[0] && boolArray[1] && boolArray[2] && boolArray[3] && boolArray[4] && boolArray[6]){
        if(boolArray[5]){
          console.log(`\n--------==this userId has not been added into RegistryCtrt yet... \n--------==AddUser(): idx: ${idx}, userId: ${userId}, assetBookAddr: ${assetbookX}, authLevel: ${authLevels[idx]}`);
          const encodedData = instRegistry.methods.addUser(userId, assetbookX, authLevels[idx]).encodeABI();
          let TxResult = await signTx(backendAddr, backendAddrpkRaw, registryCtrtAddr, encodedData);
          //console.log('\nTxResult', TxResult);
          console.log(`after addUser() on userId: ${userId}...`);
      
          userM = await instRegistry.methods.getUserFromUid(userId).call();
          console.log('userM', userM);
          if (userM[0] === assetbookX && userM[1] === authLevels[idx].toString()) {
            console.log(`\nChecked good: this uid ${userId} has already been added.`);
            results.push(true);
          } else {
            results.push(false);
          }
        } else {
          console.log(`this uid ${userId} has already been added. 
Skipping this uid...`)
        }
      } else if(!boolArray[4]){
        const isAssetbookGood = await tokenReceiver(assetbookX).catch(async(err) => {
          console.log(`${err} \ncheckAssetbook() failed...`);
          reject(false);
          return false;
        });
        console.log('\nisAssetbookGood:', isAssetbookGood);

      } else {
        reject('Error @ checkAddSetUser(): userId: '+userId);
        return {isGood: false, results: [undefined]};
      }
    });
    if(results.includes(false)){
      isGood = false;
    } else {
      isGood = true;
    }
    resolve({isGood, results});
  });
}


// yarn run testts -a 2 -c 1
// after order status change: waiting -> paid -> write into crowdfunding contract
const addAssetbooksIntoCFC = async (serverTime, paymentStatus = "paid") => {
  // check if serverTime > CFSD for each symbol...
  console.log('\n--------------==inside addAssetbooksIntoCFC() \nserverTime:',serverTime);
  //const {mysqlPoolQueryB } = require('./mysql.js');
  const queryStr1 = 'SELECT DISTINCT o_symbol FROM order_list WHERE o_paymentStatus = ?';
  const results1 = await mysqlPoolQueryB(queryStr1, [paymentStatus]).catch((err) => {
    console.log('\n[Error @ addAssetbooksIntoCFC > mysqlPoolQueryB(queryStr1)]'+ err);
    return false;
  });

  const foundSymbolArray = [];
  const symbolArray = [];

  if(results1.length === 0){
    log(chalk.green('>>[Success @ addAssetbooksIntoCFC()] No paid order is found'));
    return true;
  } else {
    for(let i = 0; i < results1.length; i++) {
      if(typeof results1[i] === 'object' && results1[i] !== null){
        foundSymbolArray.push(results1[i].o_symbol);
        if(!excludedSymbols.includes(results1[i].o_symbol)){
          symbolArray.push(results1[i].o_symbol)}
      } else {
        symbolArray.push(results1[i]);
      }
    }
  }
  console.log('foundSymbolArray', foundSymbolArray);
  console.log('symbolArray of paid orders:', symbolArray);
  if(symbolArray.length === 0){
    log(chalk.green('>>[Success @ addAssetbooksIntoCFC()] paid orders are found but are all excluded'));
    return true;
  }

  let checkOK = true;

  await asyncForEachAbCFC(symbolArray, async (symbol, index) => {
    const [isGood, crowdFundingAddr, resultMesg] = await getCtrtAddr(symbol, 'crowdfunding').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      checkOK = false;
      return undefined;
    });
    console.log(`\n${resultMesg}`);
    if(isGood){
      console.log(`\n------==[Good] Found crowdfunding addresses \nsymbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr}`);
    } else {
      console.error(`[Error] at blockchain.js -> asyncForEachAbCFC: \nsymbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr} \nresultMesg: ${resultMesg}`);
      checkOK = false;
      return false;
    }

    // Gives arrays of assetbooks, emails, and tokencounts for symbol x and payment status of y
    const queryStr3 = `SELECT User.u_assetbookContractAddress, OrderList.o_email, OrderList.o_tokenCount, OrderList.o_id FROM user User, order_list OrderList WHERE User.u_email = OrderList.o_email AND OrderList.o_paymentStatus = "${paymentStatus}" AND OrderList.o_symbol = ?`;
    //const queryStr3 = 'SELECT o_email, o_tokenCount, o_id FROM order_list WHERE o_symbol = ? AND o_paymentStatus = "paid"';

    const results3 = await mysqlPoolQueryB(queryStr3, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]'+ err);
      checkOK = false;
    });
    console.log('results3', results3);
    if(results3.length === 0){
      console.error('[Error] Got no paid order where symbol', symbol, 'result3', results3);
      checkOK = false;
      return false;
    } else {
      console.log(`\n--------------==[Good] Found a list of email, tokenCount, and o_id for ${symbol}`);
      const assetbookCtrtArray = [];
      const assetbookCtrtArrayError = [];
      const emailArray = [];
      const emailArrayError = [];
      const tokenCountArray = [];
      const tokenCountArrayError = [];
      const orderIdArray = [];
      const orderIdArrayError = [];
      const txnHashArray = [];
      const isInvestSuccessArray = [];

      if(typeof results3[0] === 'object' && results3[0] !== null){
        results3.forEach((item)=>{
          if(!Number.isInteger(item.o_tokenCount) && parseInt(item.o_tokenCount) > 0 && isEmpty(item.o_email) || isEmpty(item.u_assetbookContractAddress) || isEmpty(item.o_id)){
            emailArrayError.push(item.o_email);
            tokenCountArrayError.push(parseInt(item.o_tokenCount));
            orderIdArrayError.push(item.o_id);
            assetbookCtrtArrayError.push(item.u_assetbookContractAddress);
          } else {
            emailArray.push(item.o_email);
            tokenCountArray.push(parseInt(item.o_tokenCount));
            orderIdArray.push(item.o_id);
            assetbookCtrtArray.push(item.u_assetbookContractAddress);
          }
        });
      }
      console.log(`\nemailArray: ${emailArray} \ntokenCountArray: ${tokenCountArray} \norderIdArray: ${orderIdArray} \nemailArrayError: ${emailArrayError} \ntokenCountArrayError: ${tokenCountArrayError} \norderIdArrayError: ${orderIdArrayError}`);


      console.log(`\n----------------==assetbookCtrtArray \n${assetbookCtrtArray}`);
      if(assetbookCtrtArray.length !== emailArray.length){
        console.log('[Error] assetbookCtrtArray and emailArray have different length')
        checkOK = false;
        return false;//process.exit(0);
      }
      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const investorListBf = await instCrowdFunding.methods.getInvestors(0, 0).call();
      console.log(`\nBefore calling investTokens for each investors: \nassetbookArrayBf: ${investorListBf[0]} \ninvestedTokenQtyArrayBf: ${investorListBf[1]}`);

      const checkResult = await checkAssetbookArray(assetbookCtrtArray).catch(async(err) => {
        console.log(`checkAssetbookArray() \nresult: ${err} \ncheckAssetbookArray() failed inside asyncForEachAbCFC(). \nassetbookCtrtArray: ${assetbookCtrtArray}`);
        checkOK = false;
        return false;
      });
      if(checkResult.includes(false)){
        console.log(`\naddressArray has at least one invalid item. \n\naddressArray: ${assetbookCtrtArray} \n\ncheckAssetbookArray() Result: ${checkResult}`);
        checkOK = false;
        return false;
      } else {
        console.log(`all input addresses has been checked good by checkAssetbookArray \ncheckResult: ${checkResult} `);
      }

      const queryStr5 = 'UPDATE order_list SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';

      await asyncForEachAbCFC2(assetbookCtrtArray, async (addrAssetbook, index) => {
        const amountToInvest = parseInt(tokenCountArray[index]);
        console.log(`\n----==[Good] For ${addrAssetbook} \nfound its amountToInvest: ${amountToInvest}`);

        console.log(`\n[Good] About to write the assetbook address into the crowdfunding contract
amountToInvest: ${amountToInvest}, serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

        const [isInvestSuccess, txnHash] = await investTokens(crowdFundingAddr, addrAssetbook, amountToInvest, serverTime, 'asyncForEachAbCFC2').catch(async(err) => { 
          const result = await checkInvest(crowdFundingAddr, addrAssetbook, amountToInvest, serverTime);
          console.log('\ncheckInvest result:', result);
          console.log('\n[Error @ investTokens]', err);
          checkOK = false;
          return [false, null];
        });
        console.log(`\nisInvestSuccess: ${isInvestSuccess} \ntxnHash: ${txnHash}`);

        isInvestSuccessArray.push(isInvestSuccess);
        txnHashArray.push(txnHash);

        //----------==
        const orderId = orderIdArray[index];
        const email = emailArray[index];
        const results5 = await mysqlPoolQueryB(queryStr5, [txnHash, orderId ]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr5)]'+ err);
          checkOK = false;
        });
        //console.log('\nresults5', results5);
        log(chalk.green(`\n>>Success @ investTokens() & writing "txnFinished" into DB for email: ${email}, orderId: ${orderId}, amountToInvest: ${amountToInvest} \naddrAssetbook: ${addrAssetbook} `));
      });

      console.log(`\nisInvestSuccessArray: ${isInvestSuccessArray}
txnHashArray: ${txnHashArray}`);

      const investorListAf = await instCrowdFunding.methods.getInvestors(0, 0).call();
      console.log(`\nAfter calling investTokens() for \nassetbookArrayAf: ${investorListAf[0]}, \ninvestedTokenQtyArrayAf: ${investorListAf[1]}`);

      /*
      if(orderIdArray.length === txnHashArray.length){
        const queryStr5 = 'UPDATE order_list SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';
        await asyncForEachAbCFC3(orderIdArray, async (orderId, index) => {
          const results5 = await mysqlPoolQueryB(queryStr5, [txnHashArray[index], orderId]).catch((err) => {
            console.log('\n[Error @ mysqlPoolQueryB(queryStr5)]'+ err);
            checkOK = false;
          });
          //console.log('\nresults5', results5);
        });
        log(chalk.green('\n>>[Success @ addAssetbooksIntoCFC()];'));
      } else {
        log(chalk.red(`\n>>[Error @ addAssetbooksIntoCFC] orderIdArray and txnHashArray have different length
        orderIdArray: ${orderIdArray} \ntxnHashArray: ${txnHashArray}`));
        checkOK = false;
      }*/

    }
  //process.exit(0);
  });

  return checkOK;
}

const investTokens = async (crowdFundingAddr, addrAssetbookX, amountToInvestStr, serverTimeStr, invokedBy = '') => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==investTokens()...');
    const amountToInvest = parseInt(amountToInvestStr);
    const serverTime = parseInt(serverTimeStr);

    console.log("amountToInvest:",amountToInvest,', serverTime:', serverTime, "\naddrAssetbookX:",addrAssetbookX,'\ncrowdFundingAddr:',crowdFundingAddr);
  
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    console.log('investTokens1');
    const balanceB4Investing = await instCrowdFunding.methods.ownerToQty(addrAssetbookX).call();
    const quantitySoldMB4 = await instCrowdFunding.methods.quantitySold().call();

    console.log(`balanceB4Investing: ${balanceB4Investing}, quantitySoldMB4: ${quantitySoldMB4}`);

    const encodedData = await instCrowdFunding.methods.invest(addrAssetbookX, amountToInvest, serverTime).encodeABI();
    console.log('investTokens3');
    const TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData).catch(async(err) => {
      console.log(`\n[Error @ invest() invoked by ${invokedBy}] \nerr: ${err}`);
      reject(false);
      return false;
    });
    //console.log('TxResult', TxResult);
    const balanceAfterInvesting = await instCrowdFunding.methods.ownerToQty(addrAssetbookX).call();
    const quantitySoldMAf = await instCrowdFunding.methods.quantitySold().call();
    const isInvestingSuccessful = (balanceAfterInvesting-balanceB4Investing) === amountToInvest;
    console.log(`balanceAfterInvesting: ${balanceAfterInvesting}, quantitySoldMAf: ${quantitySoldMAf} \nisInvestingSuccessful: ${isInvestingSuccessful}`);

    const remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('remainingTokenQtyM:', remainingTokenQtyM);
  
    resolve([isInvestingSuccessful, TxResult.transactionHash]);
  });
}


const tokenReceiver = async(addrAssetbookX) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('-----------==inside tokenReceiver()');
    try{
      const instAssetbook = new web3.eth.Contract(AssetBook.abi, addrAssetbookX);
      const assetOwnerM = await instAssetbook.methods.assetOwner().call();
      const lastLoginTimeM = await instAssetbook.methods.lastLoginTime().call();
      const assetCindexM = await instAssetbook.methods.assetCindex().call();
      /**
  assetbook1M = await instAssetBook1.methods.getAsset(0, addrHCAT721).call();
  console.log('\nassetbook1M:', assetbook1M);
  const amountInitAB1 = parseInt(assetbook1M[2]);
  tokenIds = await instHCAT721.methods.getAccountIds(addrAssetBook1, 0, 0).call();
  balanceXM = await instHCAT721.methods.balanceOf(addrAssetBook1).call();
  console.log('tokenIds from HCAT721 =', tokenIds, ', balanceXM =', balanceXM);
       */
      console.log(`tokenReceiver()... \nassetOwnerM: ${assetOwnerM}
lastLoginTimeM: ${lastLoginTimeM}, assetCindexM: ${assetCindexM}`);
      resolve([true, assetOwnerM, lastLoginTimeM, assetCindexM]);
    } catch(err) {
      console.log(`[Error] tokenReceiver() failed at addrAssetbookX: ${err} ${addrAssetbookX} <===================================`);
      resolve([false, undefined, undefined, undefined]);
    }
  });
}
const checkAssetbookArray = async(addrAssetbookArray) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('-----------==inside checkAssetbookArray()');
    const checkResult = [];
    await asyncForEach(addrAssetbookArray, async(addrAssetbookX,index) => {
      const [isGood, assetOwnerM, lastLoginTimeM, assetCindexM] = await tokenReceiver(addrAssetbookX).catch(async(err) => {
        console.log(`tokenReceiver result: ${err}, checkAssetbookArray() > tokenReceiver() failed at addrAssetbookX: ${addrAssetbookX}`);
      });
      if(isGood){
        checkResult.push(isGood)
      } else {
        checkResult.push(false)
      }
    });
    resolve(checkResult);
  });
}


const checkInvest = async(crowdFundingAddr, addrAssetbook, amountToInvestStr, serverTimeStr) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('-----------==inside checkInvest()');
    const amountToInvest = parseInt(amountToInvestStr);
    const serverTime = parseInt(serverTimeStr);

    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    console.log('checkInvest1');
    const [is_checkCrowdfunding, TimeOfDeployment, maxTokenQtyForEachInvestmentFund, tokenSymbol, pricingCurrency, initialAssetPricing, maxTotalSupply, quantityGoal, quantitySold, CFSD, CFED, fundingCindex, fundingState, stateDescription, addrHelium] = await checkCrowdfundingCtrt(crowdFundingAddr).catch(async(err) => {
      console.log(`${err} \ncheckCrowdfundingCtrt() failed...`);
      reject(false);
      return false;
    });
    if(!is_checkCrowdfunding){
      resolve(false);
      return false;
    }
    console.log('Please manually check if above data is correct according to the actual crowdfunding data.\nIf yes, then the crowdfunding contract is good');
    
    console.log('\ncheckInvest2');
    const isAssetbookGood = await tokenReceiver(addrAssetbook).catch(async(err) => {
      console.log(`${err} \ncheckAssetbook() failed...`);
      reject(false);
      return false;
    });
    if(isAssetbookGood){
      console.log(`\n-----------==assetbook is checked good \ntokenSymbol: ${tokenSymbol}, initialAssetPricing: ${initialAssetPricing}, maxTotalSupply: ${maxTotalSupply}, CFSD: ${CFSD}, CFED: ${CFED}, stateDescription: ${stateDescription}`);
      console.log(`${addrAssetbook}:${ typeof addrAssetbook}, ${amountToInvest} : ${typeof amountToInvest}, ${serverTime} : ${typeof serverTime}`);

      const boolArray = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, amountToInvest, serverTime).call({ from: backendAddr }).catch((err) =>{
        console.error(err);
      });
      console.log('\ncheckInvestFunction boolArray:', boolArray);

      if(boolArray.length !== 9){
        console.error('checkInvest boolArray.length is not valid');
        reject(false);
        return false;
      }
      let mesg = 'found error: ', CFSD_M, CFED_M;
      if(boolArray.includes(false)){
        if(!boolArray[0]){
          mesg += ', [0] serverTime '+serverTime+' should be >= CFSD '+CFSD;
        }
        if(!boolArray[1]){
          mesg += ', [1] serverTime '+serverTime+' should be < CFED '+CFED;
        }
        if(!boolArray[2]){
          mesg += ', [2] sender should be a PlatformSupervisor';
        }
        if(!boolArray[3]){
          mesg += ', [3] addrAssetbook should be a contract';
        }
        if(!boolArray[4]){
          mesg += ', [4] addrAssetbook should pass tokenReceiver()';
        }
        if(!boolArray[5]){
          mesg += ', [5] quantityToInvest should be > 0';
        }
        if(!boolArray[6]){
          mesg += ', [6] quantityToInvest + quantitySold should be <= maxTotalSupply';
        }
        if(!boolArray[7]){
          mesg += ', [7] serverTime should be > TimeOfDeployment';
        }
        if(!boolArray[8]){
          mesg += ', [8] fundingState should be either initial, funding, or fundingGoalReached';
        }
        if(mesg.substring(0,2) === ', '){
          mesg = mesg.substring(2);
        }
        console.log('\n[Error message] '+mesg);
        resolve(false);
  
      } else {
        mesg = '[Success] all checks have passed via checkInvestFunction()';
        console.log(mesg);
        resolve(true);
      }
    } else {
      console.log(`tokenReceiver() returned false`);
      resolve(false);
    }
  });
}

const investTokensInBatch = async (crowdFundingAddr, addrAssetbookArray, amountToInvestArray, serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==investTokensInBatch()...');
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    const encodedData = await instCrowdFunding.methods.investInBatch(addrAssetbookArray, amountToInvestArray, serverTime).encodeABI();

    const TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData).catch(async(err) => { 
      await asyncForEachCFC(addrAssetbookArray, async(addrAssetbookX,index) => {
        const result = await checkInvest(crowdFundingAddr, addrAssetbookX, amountToInvestArray[index], serverTime);
        console.log('checkInvest result:', result);
      });
      console.log('\n[Error @ signTx() investInBatch()]'+ err);
      reject(false);
      return false;
    });
    //console.log('TxResult', TxResult);
    resolve(true);
  });
}

const getDetailsCFC = async(crowdFundingAddr) => {
  return new Promise(async(resolve, reject) => {
    console.log('----------------==getDetailsCFC \ncrowdFundingAddr:', crowdFundingAddr);
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    tokenSymbolM = await instCrowdFunding.methods.tokenSymbol().call();
    console.log('tokenSymbolM:', tokenSymbolM);

    initialAssetPricingM = await instCrowdFunding.methods.initialAssetPricing().call();
    console.log('initialAssetPricingM:', initialAssetPricingM);

    maxTotalSupplyM = await instCrowdFunding.methods.maxTotalSupply().call();
    console.log('maxTotalSupplyM:', maxTotalSupplyM);

    quantityGoalM = await instCrowdFunding.methods.quantityGoal().call();
    console.log('quantityGoalM:', quantityGoalM);

    CFSDM = await instCrowdFunding.methods.CFSD().call();
    console.log('CFSDM:', CFSDM);

    CFEDM = await instCrowdFunding.methods.CFED().call();
    console.log('CFEDM:', CFEDM);

    stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('\nstateDescriptionM:', stateDescriptionM);

    fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('fundingStateM:', fundingStateM);

    remainingTokenQtyM = await instCrowdFunding.methods.getRemainingTokenQty().call();
    console.log('remainingTokenQtyM:', remainingTokenQtyM);

    quantitySoldM = await instCrowdFunding.methods.quantitySold().call();
    console.log('quantitySoldM:', quantitySoldM);

    const [investorAssetBooks, investedTokenQtyArray] = await getInvestorsFromCFC(crowdFundingAddr);
    console.log(`investorAssetBooks: ${investorAssetBooks}
\ninvestedTokenQtyArray: ${investedTokenQtyArray}`);
    resolve([initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSDM, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM]);
  });
}

//to get all the list: set inputs to both zeros
const getInvestorsFromCFC = async (crowdFundingAddr, indexStartStr = 0, tokenCountStr = 0) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==getInvestorsFromCFC()...');
    if(!Number.isInteger(indexStartStr) || !Number.isInteger(tokenCountStr)){
      console.log(`[Error] Non integer is found: indexStartStr: ${indexStartStr}, tokenCountStr: ${tokenCountStr}`);
      reject('index or tokenCount is not valid');
      return false;
    }
    console.log(`...`);
    const indexStart = parseInt(indexStartStr);
    const tokenCount = parseInt(tokenCountStr);
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    const result = await instCrowdFunding.methods.getInvestors(indexStart, tokenCount).call();
    //console.log('result', result);
    const investorAssetBooks = result[0];
    const investedTokenQtyArray = result[1].map((item) => {
      return parseInt(item, 10);
    });
    resolve([investorAssetBooks, investedTokenQtyArray]);
  });
}

const setTimeCFC = async (crowdFundingAddr, serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\n--------------==setTimeCFC()...');
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    encodedData = await instCrowdFunding.methods.updateState(serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, crowdFundingAddr, encodedData);
    console.log('updateState TxResult', TxResult);

    let stateDescriptionM = await instCrowdFunding.methods.stateDescription().call();
    console.log('\nstateDescriptionM:', stateDescriptionM);

    let fundingStateM = await instCrowdFunding.methods.fundingState().call();
    console.log('\nFundingState{initial, funding, fundingPaused, fundingGoalReached, fundingClosed, fundingNotClosed, aborted}');
    console.log('fundingStateM:', fundingStateM);
    resolve(fundingStateM);
  });
}

//-------------------==Token Controller
//From DB check if product:tokenState needs to be updated
const updateTokenStateFromDB = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateTokenStateFromDB(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }

    const str = 'SELECT p_SYMBOL FROM product WHERE (p_tokenState = "lockup" AND p_lockuptime <= ?) OR (p_tokenState = "normal" AND p_validdate <= ?)';
    const symbolObjArray = await mysqlPoolQueryB(str, [serverTime, serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(str)] '+ err);
      return false;
    });
    const symbolObjArrayLen = symbolObjArray.length;
    console.log('\nsymbolObjArray length @ updateTokenStateFromDB:', symbolObjArrayLen, ', symbolObjArray:', symbolObjArray);

    if (symbolObjArrayLen === 0) {
      console.log('[updateTokenStateFromDB] no symbol was found');
    } else if (symbolObjArrayLen > 0) {
      const symbolArray = [];
      for (let i = 0; i < symbolObjArrayLen; i++) {
        if(!excludedSymbols.includes(symbolObjArray[i].p_SYMBOL)){
          symbolArray.push(symbolObjArray[i].p_SYMBOL)
        }
      }
      await sequentialRunTsMain(symbolArray, timeIntervalOfNewBlocks, serverTime, ['tokencontroller']);
    }
    resolve(true);
  });
}

const writeToBlockchainAndDatabase = async (targetAddr, serverTime, symbol, actionType) => {
  if(actionType === 'crowdfunding'){
    const fundingStateStr = await updateFundingStateCFC(targetAddr, serverTime, symbol);
    console.log('fundingState', fundingStateStr, 'typeof', typeof fundingStateStr);
    const fundingState = parseInt(fundingStateStr);
    /* 0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 
       4 fundingClosed, 5 fundingNotClosed, 6 terminated}*/
    switch(fundingState) {
      case 0:
        await setFundingStateDB(symbol, 'initial', undefined, undefined);
        break;
      case 1:
        await setFundingStateDB(symbol, 'funding', undefined, undefined);
        break;
      case 2:
        await setFundingStateDB(symbol, 'fundingPaused', undefined, undefined);
        break;
      case 3:
        await setFundingStateDB(symbol, 'fundingGoalReached', undefined, undefined);
        break;
      case 4:
        //diasabled for manual setting on funding state
        //await setFundingStateDB(symbol, 'fundingClosed', undefined, undefined);
        break;
      case 5:
        //diasabled for manual setting on funding state
        //await setFundingStateDB(symbol, 'fundingNotClosed', undefined, undefined);
        break;
      case 6:
        await setFundingStateDB(symbol, 'terminated', undefined, undefined);
        break;
      default:
        await setFundingStateDB(symbol, 'undefined', undefined, undefined);
    }

  } else if(actionType === 'tokencontroller'){
    console.log('\n-----------------=inside writeToBlockchainAndDatabase(), actionType: tokencontroller');
    const tokenStateStr = await updateTokenStateTCC(targetAddr, serverTime, symbol);
    console.log('tokenState', tokenStateStr, 'typeof', typeof tokenStateStr);
    const tokenState = parseInt(tokenStateStr);
    // lockupPeriod, normal, expired
    switch(tokenState) {
      case 0:
        await setTokenStateDB(symbol, 'lockupPeriod', undefined, undefined);
        break;
      case 1:
        await setTokenStateDB(symbol, 'normal', undefined, undefined);
        break;
      case 2:
        await setTokenStateDB(symbol, 'expired', undefined, undefined);
        break;
      default:
        await setTokenStateDB(symbol, 'undefined', undefined, undefined);
    }

  } else if(actionType === 'incomemanager'){
    console.log('inside incomemanager timeserver... not active');
    // const isScheduleGoodForRelease = await checkIMC_isSchGoodForRelease(targetAddr, serverTime);
    // console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);
    if(false){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, targetAddr);

      //for loop for each token owner(bankResult) => {}
      const actualPaymentTime = 0;//bankResult.paymentDateTime
      const actualPaymentAmount = 0;//bankResult.paymentAmount
      const errorCode = 0;//bankResult.paymentError

      //write bank's confirmation into IncomeManager.sol
      let encodedData = instIncomeManager.methods.setPaymentReleaseResults(serverTime, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, targetAddr, encodedData).catch((err) => {
        console.log('\n[Error @ signTx() updateState(serverTime)]'+ err);
        return undefined;
      });
      console.log('TxResult', TxResult);

      //const scheduleDetails = await instIncomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
      //console.log('[Success @ updateIncomeManager(serverTime)] scheduleDetails:', scheduleDetails);

    } else {

    }
  }
  console.log('end of writeToBlockchainAndDatabase() for', symbol, 'actionType:', actionType);
}



//---------------------------==Income Manager contract 
//---------------------------==
const getIncomeManagerDetails = async(addrIncomeManager) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('\n-------==getIncomeManagerDetails()');
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    const boolArray = await instIncomeManager.methods.getIncomeManagerDetails().call();

    if(boolArray.length !== 5){
      console.error('getIncomeManagerDetails boolArray.length is not valid');
      reject([undefined, undefined, undefined, undefined, undefined]);
      return false;
    }
    //console.log('getIncomeManagerDetails:', getIncomeManagerDetails);
    const addrTokenCtrt = result[0];
    const addrHelium = result[1];
    const TimeOfDeployment = result[2];
    const schCindex = result[3];
    const paymentCount = result[4];

    console.log(`getIncomeManagerDetails()... addrTokenCtrt: ${addrTokenCtrt}, addrHelium: ${addrHelium}, TimeOfDeployment: ${TimeOfDeployment}, schCindex: ${schCindex}, paymentCount: ${paymentCount}`);
    resolve([addrTokenCtrt, addrHelium, TimeOfDeployment, schCindex, paymentCount]);
  });
}


const get_schCindex = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_schCindex()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

      const result = await instIncomeManager.methods.schCindex().call();
      //console.log('\nschCindex:', result);//assert.equal(result, 0);
      resolve(result);
  
    } else {
      resolve(undefined);
    }
  });
}

const tokenCtrt = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside tokenCtrt()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

      const result = await instIncomeManager.methods.tokenCtrt().call();
      //console.log('\ntokenCtrt:', result);//assert.equal(result, 0);
      resolve(result);
  
    } else {
      resolve(undefined);
    }
  });
}

const get_paymentCount = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_paymentCount()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      const result = await instIncomeManager.methods.paymentCount().call();
      //console.log('\npaymentCount:', result);//assert.equal(result, 0);
      resolve(result);
    } else {
      resolve(undefined);
    }
  });
}

const get_TimeOfDeployment = async(symbol) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside get_TimeOfDeployment()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      const result = await instIncomeManager.methods.TimeOfDeployment().call();
      //console.log('\nTimeOfDeployment:', result);//assert.equal(result, 0);
      resolve(result);
    } else {
      resolve(undefined);
    }
  });
}


//yarn run testmt -f 12
const getIncomeSchedule = async(symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside getIncomeSchedule()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      //const result = await instIncomeManager.methods.schCindex().call();
      //console.log('\nschCindex:', result);//assert.equal(result, 0);
    
      const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
      console.log(`\n-------------==getIncomeSchedule(${schIndex}): \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nerrorCode: ${result2[4]}\nisErrorResolved: ${result2[5]}`);
      resolve(result2);
    } else {
      resolve(undefined);
    }
  });
}

//yarn run testmt -f 13
const getIncomeScheduleList = async(symbol, indexStart = 0, amount = 0) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside getIncomeScheduleList()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      const scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
      console.log('\nscheduleList', scheduleList);
      // const schCindexM = await instIncomeManager.methods.schCindex().call();
      // console.log('schCindex:', schCindexM);//assert.equal(result, 0);
      resolve(scheduleList);
    } else {
      resolve(undefined);
    }
  });
}


//yarn run testmt -f 14
const checkAddForecastedScheduleBatch1 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside checkAddForecastedScheduleBatch1()');
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      console.log('forecastedPayableTimes has length zero');
      return false;
    }

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      
      const result = await instIncomeManager.methods.checkAddForecastedScheduleBatch1(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
      //assuming that backendAddr account is set to PlatformSupervisor in Helium contract 
      resolve(result);
    } else {
      resolve(undefined);
    }
  });
}

// yarn run testmt -f 15
const checkAddForecastedScheduleBatch2 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-------------==inside checkAddForecastedScheduleBatch2()');
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      console.log('forecastedPayableTimes has length zero');
      return false;
    }

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      
      const result = await instIncomeManager.methods.checkAddForecastedScheduleBatch2(forecastedPayableTimes).call({ from: backendAddr });
      resolve(result);//assert.equal(result, 0);
    } else {
      resolve(undefined);
    }
  });
}


// yarn run testmt -f 16
const checkAddForecastedScheduleBatch = async (symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-----------------==inside checkAddForecastedScheduleBatch()');
    //console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      reject('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      reject('forecastedPayableTimes has length zero');
      return false;
    }

    if(!forecastedPayableTimes.every(isInt) || !forecastedPayableAmounts.every(isInt)){
      console.log('None number has been detected. \nforecastedPayableTimes:', forecastedPayableTimes, '\nforecastedPayableAmounts:', forecastedPayableAmounts);
      reject('None number has been detected');
      return false;
    }

    for(let idx = 1; idx < length; idx++) {
      if(forecastedPayableTimes[idx] <= forecastedPayableTimes[idx - 1]){
        reject(`[Error] idx = ${idx}, forecastedPayableTimes[idx] ${forecastedPayableTimes[idx]} <= forecastedPayableTimes[idx - 1] ${forecastedPayableTimes[idx - 1]}
        forecastedPayableTime[idx] should be > forecastedPayableTime[idx-1]`);
        return false;
      }
    }

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

      const isPS = await instIncomeManager.methods.checkPlatformSupervisor().call({ from: backendAddr }); console.log('\nisPS:', isPS);
  
      const schCindexM = await instIncomeManager.methods.schCindex().call();
      console.log('schCindex:', schCindexM);//assert.equal(result, 0);
    
      const result2 = await instIncomeManager.methods.getIncomeSchedule(schCindexM).call(); 
      console.log(`\n-------------==getIncomeSchedule(${schCindexM}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nerrorCode: ${result2[4]}\nisErrorResolved: ${result2[5]}`);
  
      const first_forecastedPayableTime = parseInt(forecastedPayableTimes[0]);
      const last_forecastedPayableTime = parseInt(result2[0]);
      if(last_forecastedPayableTime >= first_forecastedPayableTime){
        reject(`last_forecastedPayableTime ${last_forecastedPayableTime} should be < first_forecastedPayableTime ${first_forecastedPayableTime}`);
        return false;
      }
      const results = await instIncomeManager.methods.checkAddForecastedScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
      console.log('results', results);
        resolve(results);
    } else {
      resolve(undefined);
    }
  });
}


//yarn run testmt -f 17
const addForecastedScheduleBatch = async (symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    //console.log('\n-----------------==inside addForecastedScheduleBatch()');
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      console.log('addrIncomeManager', addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);

      const length1 = forecastedPayableTimes.length;
      if(length1 !== forecastedPayableAmounts.length){
        reject('[Error] forecastedPayableTimes and forecastedPayableAmounts from DB should have the same length');
        //console.log(mesg);
        return false;
      }
    
      // const ischeckAddForecastedScheduleBatch = await checkAddForecastedScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
      //   reject('[Error @checkAddForecastedScheduleBatch]: '+ err);
      //   return false;
      // });
      // console.log('\nischeckAddForecastedScheduleBatch:', ischeckAddForecastedScheduleBatch);

      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      //console.log(`getIncomeSchedule(${schCindexM}):\n${result2[0]}\n${result2[1]}\n${result2[2]}\n${result2[3]}\n${result2[4]}\n${result2[5]}\n${result2[6]}`);// all should be 0 and false before adding a new schedule
      let encodedData = instIncomeManager.methods.addForecastedScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).encodeABI();
      console.log('about to execute addForecastedScheduleBatch()...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
        reject('[Error @ signTx() addForecastedScheduleBatch()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);
      resolve(true);
    } else {
      resolve(undefined);
    }
  });
}


const addForecastedScheduleBatchFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {

    const [forecastedPayableTimes, forecastedPayableAmounts, forecastedPayableTimesError, forecastedPayableAmountsError] = await getForecastedSchedulesFromDB(symbol);
    console.log(`forecastedPayableTimes: ${forecastedPayableTimes} 
  forecastedPayableAmounts: ${forecastedPayableAmounts}
  forecastedPayableTimesError: ${forecastedPayableTimesError}
  forecastedPayableAmountsError: ${forecastedPayableAmountsError}`);
  
    if(forecastedPayableTimesError.length === 0 && forecastedPayableAmountsError.length === 0){
      const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
        reject('[Error @getCtrtAddr]: '+ err);
        return undefined;
      });
      console.log(`\n${resultMesg}.`);
      if(isGood){
        const results2 = await addForecastedScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts);
        if(results2){
          resolve(true);
        } else {
          reject(false);
          return false;
        }
      } else {
        console.log(`Some values are found invalid. Check forecastedPayableTimesError and forecastedPayableAmountsError`);
        reject(false);
        return false;
      }
    } else {
      resolve(undefined);
    }
  });
}

//yarn run testmt -f 19
const editActualSchedule = async (symbol, schIndex, actualPaymentTime, actualPaymentAmount) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside editActualSchedule()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      let encodedData = instIncomeManager.methods.editActualSchedule(schIndex, actualPaymentTime, actualPaymentAmount).encodeABI();
      console.log('about to execute editActualSchedule()...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
        reject('[Error @ signTx() editActualSchedule()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);
      resolve(true);
    } else {
      resolve(undefined);
    }
  });
}

//yarn run testmt -f 20
const addPaymentCount = async (symbol) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside addPaymentCount()');
    console.log('symbol', symbol);

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      let encodedData = instIncomeManager.methods.addPaymentCount().encodeABI();
      console.log('about to execute addPaymentCount()...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
        reject('[Error @ signTx() addPaymentCount()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);
      resolve(true);
    } else {
      resolve(undefined);
    }
  });
}



//yarn run testmt -f 21
const setErrResolution = async (symbol, schIndex, isErrorResolved, errorCode) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside setErrResolution()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @getCtrtAddr]: '+ err);
      return undefined;
    });
    console.log(`\n${resultMesg}.`);
    if(isGood){
      if(typeof isErrorResolved === "boolean"){
        reject('[Error @isErrorResolved not boolean]:'+ err);
        return false;

      } else if(typeof errorCode !== "number" || errorCode < 0 || errorCode > 255){
        reject('[Error @errorCode]:'+ err);
        return false;
      }
      console.log('check001');

      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
      let encodedData = instIncomeManager.methods.setErrResolution(schIndex, isErrorResolved, errorCode).encodeABI();
      console.log('about to execute setErrResolution()...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData).catch((err) => {
        reject('[Error @ signTx() setErrResolution()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);
      resolve(true);
    } else {
      resolve(undefined);
    }
  });
}






//------------------------------------==
//------------------------------------==
// orderDate+3 => expired orders
// yarn run testts -a 2 -c 19
const updateExpiredOrders = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateExpiredOrders(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }

    const queryStr ='SELECT o_id, o_purchaseDate FROM order_list WHERE o_paymentStatus = "waiting"';
    const results = await mysqlPoolQueryB(queryStr, []).catch((err) => {
      reject('[Error @ updateExpiredOrders: mysqlPoolQueryB(queryStr)]: '+ err);
      return false;
    });

    const resultsLen = results.length;
    console.log('\nArray length @ updateExpiredOrders:', resultsLen, ', order_id and purchaseDate:', results);

    // const oidArray = [], purchaseDateArray = [];
    // for (let i = 0; i < results.length; i++) {
    //   oidArray.push(results[i].o_id);
    //   purchaseDateArray.push(results[i].o_purchaseDate);
    // }
  
    if (resultsLen === 0) {
      console.log('[updateExpiredOrders] no waiting order was found');
    } else if (resultsLen > 0) {
      await sequentialRunTsMain(results, timeIntervalUpdateExpiredOrders, serverTime, ['updateExpiredOrders']);
    }
    resolve(true);
  });
}



//---------------------------==Assetbook Contract / Assetbooks
//---------------------------==
const get_assetOwner = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==assetOwner()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.assetOwner().call();
    resolve(result);
  });
}

const get_lastLoginTime = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==lastLoginTime()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.lastLoginTime().call();
    resolve(result);
  });
}

const checkIsContract = async(addrAssetBook, assetAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==checkIsContract()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.checkIsContract(assetAddr).call();
    resolve(result);
  });
}


const getAssetbookDetails = async(addrAssetBook) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('\n-------==getAssetbookDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const boolArray = await instAssetBook.methods.getAssetbookDetails().call();
    if(boolArray.length !== 10){
      console.error('checkInvest boolArray.length is not valid');
      reject([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
      return false;
    }
    //console.log('getAssetbookDetails:', getAssetbookDetails);
    const assetOwner = result[0];
    const addrHeliumContract = result[1];
    const lastLoginTime = result[2];
    const antiPlatformOverrideDays = result[3];
    const assetOwner_flag = result[4];
    const HeliumContract_flag = result[5];
    const endorsers_flag = result[6];
    const endorserCount = result[7];
    const calculateVotes = result[8];
    const isAblePlatformOverride = result[9];

    console.log(`getAssetbookDetails()... assetOwner: ${assetOwner}, addrHeliumContract: ${addrHeliumContract}, lastLoginTime: ${lastLoginTime}, antiPlatformOverrideDays: ${antiPlatformOverrideDays}, assetOwner_flag: ${assetOwner_flag}, HeliumContract_flag: ${HeliumContract_flag}, endorsers_flag: ${endorsers_flag}, endorserCount: ${endorserCount}, calculateVotes: ${calculateVotes}, isAblePlatformOverride: ${isAblePlatformOverride}`);
    resolve([assetOwner, addrHeliumContract, lastLoginTime, antiPlatformOverrideDays, assetOwner_flag, HeliumContract_flag, endorsers_flag, endorserCount, calculateVotes, isAblePlatformOverride]);
  });
}

const endorsers = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==endorsers()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0];
    result[0] = await instAssetBook.methods.endorsers(1).call();
    result[1] = await instAssetBook.methods.endorsers(2).call();
    result[2] = await instAssetBook.methods.endorsers(3).call();
    console.log('\nresult:', result);
    resolve(result);
  });
}



const setHeliumAddr = async(addrAssetBook, _addrHeliumContract) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==setHeliumAddr()');
    console.log(`serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.setHeliumAddr(_addrHeliumContract).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() setHeliumAddr()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);

    const addrHeliumContract = await instAssetBook.methods.addrHeliumContract().call();
    console.log('\naddrHeliumContract:', addrHeliumContract);
    if(addrHeliumContract === _addrHeliumContract){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}

const HeliumContractVote = async(addrAssetBook, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==HeliumContractVote()');
    console.log(`serverTime: ${serverTime}`);

    //const HeliumContract_flag_Before = await instAssetBook.methods.HeliumContract_flag().call();
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() HeliumContractVote(serverTime)]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);

    const HeliumContract_flag_After = await instAssetBook.methods.HeliumContract_flag().call();
    console.log('\nHeliumContract_flag_after:', HeliumContract_flag_After);

    if(HeliumContract_flag_After === '1'){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}


const resetVoteStatus = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==resetVoteStatus()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.resetVoteStatus().encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() resetVoteStatus()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);

    const assetOwner_flag = await instAssetBook.methods.assetOwner_flag().call();
    const HeliumContract_flag = await instAssetBook.methods.HeliumContract_flag().call();
    const endorserCtrts_flag = await instAssetBook.methods.endorserCtrts_flag().call();
    console.log('\assetOwner:', result);
    if(assetOwner_flag === '0' && HeliumContract_flag === '0' && endorserCtrts_flag === '0'){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}


const changeAssetOwner = async(addrAssetBook, _assetOwnerNew, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==changeAssetOwner()');
    console.log(`serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.changeAssetOwner(_assetOwnerNew, serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() changeAssetOwner()]'+ err);
      return false;
    });
    console.log('\nTxResult', TxResult);

    const result = await instAssetBook.methods.assetOwner().call();
    console.log('\assetOwner:', result);
    if(result === _assetOwnerNew){
      resolve(true);
    } else {
      reject('not successful');
      return false;
    }
  });
}
/* const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
 const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
 let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() updateState(serverTime)]'+ err);
      return undefined;
    });
console.log('\nTxResult', TxResult);
*/


//----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
const checkSafeTransferFromBatchFunction = async(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime) => {
  return new Promise( async ( resolve, reject ) => {

    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);

    const result = await instAssetBookFrom.methods.checkSafeTransferFromBatch(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).call({from: _fromAssetOwner});
    console.log('\ncheckSafeTransferFromBatch result', result);

    const boolArray = result[0];
    if(boolArray.length !== 12){
      console.error('checkSafeTransferFromBatchFunction boolArray.length is not valid');
      reject(false);
      return false;
    }
    let mesg = '';
    if(boolArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', fromAddr has no contract';
      } else if(!boolArray[1]){
        mesg += ', toAddr has no contract';
      } else if(!boolArray[2]){
        mesg += ', toAddr has no tokenReceiver()';
      } else if(!boolArray[3]){
        mesg += ', amount =< 0';
      } else if(!boolArray[4]){
        mesg += ', price =< 0';
      } else if(!boolArray[5]){
        mesg += ', fromAddr is the same as toAddr';
      } else if(!boolArray[6]){
        mesg += ', serverTime <= TimeOfDeployment';
      } else if(!boolArray[7]){
        mesg += ', TokenController not approved/not operational';
      } else if(!boolArray[8]){
        mesg += ', Registry has not approved toAddr';
      } else if(!boolArray[9]){
        mesg += ', Registry has not approved fromAddr';
      } else if(!boolArray[10]){
        mesg += ', balance of fromAddr is not enough to send tokens';
      } else if(!boolArray[11]){
        mesg += ', msg.sender is not tokenOwner or allowed amount given to msg.sender is not enough';
      } else if(!result[1]){
        mesg += ', assetAddr does not have contract';
      } else if(!result[2]){
        mesg += ', caller is not the assetOwner';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log('\n[Error message] '+mesg);
      resolve(mesg);
    }
  });
}


/**
 * Frontend makes API calls at '/HCAT721_AssetTokenContract/:nftSymbol' to get symbol XYZ's contract addresses
 * 
 * @param {*} addrHCAT721  the address of the HCAT721 smart contract
 * @param {*} fromAssetbook  the assetbook contract address from which the transfer deduct amount
 * @param {*} toAssetbook  the assetbook contract address to which the transfer will add amount
 * @param {*} amountStr  amount of this transfer
 * @param {*} priceStr  price associated with this transfer
 * @param {*} _fromAssetOwner  EOA that controls the assetbook
 * @param {*} _fromAssetOwnerpkRaw  EOA private key of the above EOA
 */
const transferTokens = async (addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, _fromAssetOwner, _fromAssetOwnerpkRaw ) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('entering transferTokens()');

    let mesg = '';
    const serverTimeStr = 201905281400;// only used for emitting events in the blockchain
    const addrZero = "0x0000000000000000000000000000000000000000";

    // const _fromAssetOwner = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    // const _fromAssetOwnerpkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
    const amount = parseInt(amountStr);
    const price = parseInt(priceStr);
    const serverTime = parseInt(serverTimeStr);

    if (isNaN(amount) || isNaN(price) || isNaN(serverTime)){
      mesg = 'input values should be integers';
      console.log(`mesg, amount: ${amountStr}, price: ${priceStr}, serverTime: ${serverTimeStr}`);
      reject(mesg);
      return false;
    }

    if(amount < 1 || price < 1 || serverTime < 201905281000){
      mesg = 'input values should be > 0 or 201905281000';
      console.log(`mesg, amount: ${amount}, price: ${price}, serverTime: ${serverTime}`);
      reject(mesg);
      return false;
    }
    console.log('after checking amount and price values');

    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);
    console.log('after contract instances');

    console.log('fromAssetbook', fromAssetbook);
    const balanceFromB4Str = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToB4Str = await instHCAT721.methods.balanceOf(toAssetbook).call();
    const balanceFromB4 = parseInt(balanceFromB4Str);
    const balanceToB4 = parseInt(balanceToB4Str);
    console.log(`\nbalanceFromB4: ${balanceFromB4}, balanceToB4: ${balanceToB4}`);

    if(balanceFromB4 < amount){
      mesg = `balanceFromB4: ${balanceFromB4} is not enough! amount: ${amount}`;
      reject(mesg);
      return false;
    }

    //----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
    console.log('\nsending tokens via safeTransferFromBatch()...');
    try {
      const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).encodeABI();

      let TxResult = await signTx(_fromAssetOwner, _fromAssetOwnerpkRaw, fromAssetbook, encodedData).catch((err) => {
        reject('[Error @ signTx() safeTransferFromBatch()]'+ err);
        return false;
      });
      console.log('TxResult', TxResult);

    } catch (error) {
      console.log("error:" + error);
      const result = await checkSafeTransferFromBatchFunction(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime);
      //assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime
      reject(result);
      return false;
    }

    const balanceFromAfterStr = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToAfterStr = await instHCAT721.methods.balanceOf(toAssetbook).call();
    const balanceFromAfter = parseInt(balanceFromAfterStr);
    const balanceToAfter = parseInt(balanceToAfterStr);

    const change_of_accountFrom = balanceFromAfter - balanceFromB4;
    const change_of_accountTo = balanceToAfter - balanceToB4;

    console.log(`\n-----------==Transaction has been finished
    balanceFromB4: ${balanceFromB4}
    balanceFromAfter: ${balanceFromAfter}

    balanceToB4: ${balanceToB4}
    balanceToAfter:   ${balanceToAfter}

    change_of_accountFrom: ${change_of_accountFrom}
    change of accountTo: ${change_of_accountTo}
    `);

    if(change_of_accountFrom * -1 === amount && change_of_accountTo === amount) {
      resolve(true);
    } else {
      resolve(false);
    }
    //call /HCAT721_AssetTokenContract/safeTransferFromBatch API to record txn info
  });
}



//--------------------------==
//message queue producer(sender)
const rabbitMQSender = async (functionName, symbol, price) => {
  console.log(`\n------------------==rabbitMQSender`);
  const amqp = require('amqplib/callback_api');

  console.log(`functionName: ${functionName}, symbol: ${symbol}, price: ${price}`);
  const response = rabbitMQReceiver(functionName, symbol, price);
  console.log(`received response: ${response}`);

  amqp.connect('amqp://localhost', (error0, conn) => {
    if (error0) {
      console.log('error0', error0);
      throw error0;
    }
    conn.createChannel((error1, channel) => {
      if (error1) {
        console.log('error1', error1);
        throw error1;
      }
      const boxName = 'amqpTest2';
      channel.assertQueue(boxName, { durable: false });
      console.log(' [*] Waiting for result in: %s. To exit press CTRL+C', boxName);
      channel.consume(boxName, msg => {
          console.log(' [x] Received result: %s', msg.content);  
          conn.close();            
      }, { noAck: true
      });
    });
  })
}

//message queue consumer (receiver) 
const rabbitMQReceiver = async (functionName, symbol, price) => {
  console.log(`\n------------------==rabbitMQReceiver`);
  amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((error0, channel) => {
      if (error0) {
        console.log('error0', error0);
        throw error0;
      }
      const boxName = 'amqpTest2';
      channel.assertQueue(boxName, {durable: false});
      // I suppose the process will take about 5 seconds to finish
      setTimeout(() => {
        let result = 'xyz0001';
        channel.sendToQueue(boxName, new Buffer.from(result));
        console.log(` [X] Send: ${result}`);
      }, 5000)                       
    });
    // The connection will close in 10 seconds
    setTimeout(() => {
     conn.close();
    }, 10000);
   });
}

//--------------------------==
/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: gasLimitValue,//9000000,
                  gasPrice: gasPriceValue,//0,
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



module.exports = {
  addPlatformSupervisor, checkPlatformSupervisor, addCustomerService, checkCustomerService, setRestrictions, deployAssetbooks, addUsersToRegistryCtrt, updateExpiredOrders, getDetailsCFC, getTokenBalances, sequentialRunTsMain, sequentialMintToAdd, sequentialMintToMax, sequentialCheckBalancesAfter, sequentialCheckBalances, doAssetRecords, sequentialMintSuper, preMint, mintSequentialPerContract, getFundingStateCFC, getHeliumAddrCFC, updateFundingStateFromDB, updateFundingStateCFC, investTokensInBatch, addAssetbooksIntoCFC, getInvestorsFromCFC, setTimeCFC, investTokens, checkInvest, getTokenStateTCC, getHeliumAddrTCC, updateTokenStateTCC, updateTokenStateFromDB, makeOrdersExpiredCFED, 
  get_schCindex, tokenCtrt, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule, addPaymentCount, addForecastedScheduleBatchFromDB, setErrResolution, resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr, endorsers, rabbitMQSender, rabbitMQReceiver, fromAsciiToBytes32, deployCrowdfundingContract, deployTokenControllerContract, checkArgumentsTCC, checkDeploymentTCC, checkArgumentsHCAT, checkDeploymentHCAT, deployHCATContract, deployIncomeManagerContract, checkArgumentsIncomeManager, checkDeploymentIncomeManager, checkDeploymentCFC, checkArgumentsCFC, tokenReceiver, checkAssetbookArray, deployRegistryContract, deployHeliumContract, deployProductManagerContract, getTokenContractDetails, addProductRowFromSymbol, setTokenController, getCFC_Balances, checkSafeTransferFromBatchFunction, transferTokens
}
