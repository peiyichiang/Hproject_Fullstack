const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const moment = require('moment');
const chalk = require('chalk');
const log = console.log;

const { getTime, isEmpty, asyncForEach, checkInt, checkIntFromOne } = require('./utilities');
const { AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetOwnerArray, assetOwnerpkRawArray } = require('../ethereum/contracts/zsetupData');

const { addrHelium, addrRegistry, addrProductManager, blockchainURL, admin, adminpkRaw, gasLimitValue, gasPriceValue, isTimeserverON, operationMode, backendAddrChoice} = require('./envVariables');
//0 API dev, 1 Blockchain dev, 2 Backend dev, 3 .., 4 timeserver

const timeIntervalOfNewBlocks = 13000;
const timeIntervalUpdateExpiredOrders = 1000;
const prefix = '0x';
/*
const userIdArray = [];
const investorLevelArray = [];
const assetbookArray = [];
;*/

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;
//-----------------==Copied from routes/Contracts.js
/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
console.log('loading blockchain.js smart contract json files');
const backendAddr = admin;
const backendRawPrivateKey = adminpkRaw;

// const choiceOfHCAT721 = 2;
// if(choiceOfHCAT721===1){
//   console.log('use HCAT721_Test!!!');
//   HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken_Test.json');
// } else if(choiceOfHCAT721===2){
//   console.log('use HCAT721');
//   HCAT721 = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
// }

//const heliumContractAddr = "0x7E5b6677C937e05db8b80ee878014766b4B86e05";
//const registryContractAddr = "0xcaFCE4eE56DBC9d0b5b044292D3DcaD3952731d8";
//const productManagerContractAddr = "0x96191257D876A4a9509D9F86093faF75B7cCAc31";


//-------------------==Crowdfunding
const getFundingStateCFC = async (crowdFundingAddr) => {
  console.log('[getFundingStateCFC] crowdFundingAddr', crowdFundingAddr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('fundingState', fundingState, 'crowdFundingAddr', crowdFundingAddr);
  //console.log('typeof fundingState', typeof fundingState);
}

const updateFundingStateCFC = async (crowdFundingAddr, serverTime) => {
  console.log('\n[updateFundingStateCFC] crowdFundingAddr', crowdFundingAddr, 'serverTime', serverTime);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
  let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
  console.log('\nTxResult', TxResult);

  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('\nfundingState:', fundingState);
  console.log('crowdFundingAddr', crowdFundingAddr);
  return fundingState;
}


//-----------------==TokenController
const getTokenStateTCC = async (tokenControllerAddr) => {
  console.log('[getFundingStateCFC] tokenControllerAddr', tokenControllerAddr);
  const instTokenController = new web3.eth.Contract(TokenController.abi, tokenControllerAddr);
  let tokenState = await instTokenController.methods.tokenState().call({ from: backendAddr });
  console.log('tokenState', tokenState, 'tokenControllerAddr', tokenControllerAddr);
  //console.log('typeof tokenState', typeof tokenState);
}

const updateTokenStateTCC = async (tokenControllerAddr, serverTime) => {
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

const deployHeliumContract = async(eoa0, eoa1, eoa2, eoa3, eoa4) => {
  return new Promise(async (resolve, reject) => {
    console.log(`\n----------------== inside deployHeliumContract() \nbackendAddr: ${backendAddr} \nbackendAddrpkRaw: ${backendAddrpkRaw} \nblockchainURL: ${blockchainURL}`);
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    const managementTeam = [eoa0, eoa1, eoa2, eoa3, eoa4];
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

//getContractDetails()
const getDetailsCFC = async (crowdFundingAddr) => {
  console.log('[getDetailsCFC] crowdFundingAddr', crowdFundingAddr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);

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


//-------------------------==
const breakdownArrays = (toAddressArray, amountArray, maxMintAmountPerRun) => {
  console.log('\n-----------------==\ninside breakdownArrays: amountArray', amountArray, '\ntoAddressArray', toAddressArray);

//-------------------==Crowdfunding
//yarn run testmt -f 61
const deployCrowdfundingContract = async(argsCrowdFunding) => {
  return new Promise(async (resolve, reject) => {
  
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

  console.log('for loop...');
  const amountArrayOut = [];
  const toAddressArrayOut = [];
  for (let idx = 0; idx < amountArray.length; idx++) {
    const amount = parseInt(amountArray[idx]);
    console.log('idx', idx, ', amount', amount);

    if(amount > maxMintAmountPerRun){
      const quotient = Math.floor(amount / maxMintAmountPerRun);
      const remainder = amount - maxMintAmountPerRun * quotient;
      const subAmountArray = Array(quotient).fill(maxMintAmountPerRun);
      if(remainder > 0){ subAmountArray.push(remainder); }
      amountArrayOut.push(...subAmountArray);

      const subToAddressArray = Array(subAmountArray.length).fill(toAddressArray[idx]);
      toAddressArrayOut.push(...subToAddressArray);
      //amountArrayOut.splice(amountArrayOut.length, 0, ...subAmountArray);
    } else {
      amountArrayOut.push(amount);
      toAddressArrayOut.push(toAddressArray[idx]);
    }
  });
}

const checkCrowdfundingCtrt = async(crowdFundingAddr) => {
  return new Promise( async ( resolve, reject ) => {
    try{
      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const tokenSymbol = await instCrowdFunding.methods.tokenSymbol().call();
      const initialAssetPricing = await instCrowdFunding.methods.initialAssetPricing().call();
      const maxTotalSupply = await instCrowdFunding.methods.maxTotalSupply().call();
      const fundingType = await instCrowdFunding.methods.fundingType().call();
      const CFSD = await instCrowdFunding.methods.CFSD().call();
      const CFED = await instCrowdFunding.methods.CFED().call();
      const stateDescription = await instCrowdFunding.methods.stateDescription().call();

      console.log(`\ncheckCrowdfundingCtrt()... tokenSymbol: ${tokenSymbol}, maxTotalSupply: ${maxTotalSupply}, initialAssetPricing: ${initialAssetPricing}, fundingType: ${fundingType}, CFSD: ${CFSD}, CFED: ${CFED}, stateDescription: ${stateDescription}`);
      resolve([true, tokenSymbol, initialAssetPricing, maxTotalSupply, fundingType, CFSD, CFED, stateDescription]);
    } catch(err) {
      console.log(`[Error] checkCrowdfundingCtrt() failed at crowdFundingAddr: ${crowdFundingAddr} <===================================`);
      resolve([false, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
    }
  });
}

const checkDeploymentCFC = async(crowdFundingAddr, argsCrowdFunding) => {
  return new Promise(async (resolve, reject) => {
    const [is_checkCrowdfunding, tokenSymbol, initialAssetPricing, maxTotalSupply, fundingType, CFSD, CFED, stateDescription] = await checkCrowdfundingCtrt(crowdFundingAddr).catch(async(err) => {
      console.log(`${err} \ncheckCrowdfundingCtrt() failed...`);
      reject(false);
      return false;
    });

    if(is_checkCrowdfunding){
      console.log(`\ncheckCrowdfundingCtrt() returns true...`);

      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const boolArray = await instCrowdFunding.methods.checkDeploymentConditions(...argsCrowdFunding).call();
      console.log('checkDeploymentConditions():', boolArray);

      if(boolArray.includes(false)){
        console.log('[Failed] Some/one check(s) have/has failed checkDeploymentConditions()');
        const boolArray2 = await instCrowdFunding.methods.getCrowdfundingDetails().call();
        if(boolArray2.length !== 11){
          console.error('getCrowdfundingDetails boolArray2.length is not valid');
          reject(false);
          return false;
        }
        const TimeOfDeployment = boolArray2[0];
        const maxTokenQtyForEachInvestmentFund = boolArray2[1];
        const tokenSymbol = boolArray2[2];
        const pricingCurrency = boolArray2[3];
        const initialAssetPricing = boolArray2[4];
        const maxTotalSupply = boolArray2[5];
        const quantityGoal = boolArray2[6];
        const quantitySold = boolArray2[7];
        const CFSD = boolArray2[8];
        const CFED = boolArray2[9];
        const addrHelium = boolArray2[10];

        console.log(`\n===>>> TimeOfDeployment: ${TimeOfDeployment}, maxTokenQtyForEachInvestmentFund: ${maxTokenQtyForEachInvestmentFund}, tokenSymbol: ${tokenSymbol}, pricingCurrency: ${pricingCurrency}, initialAssetPricing: ${initialAssetPricing}, maxTotalSupply: ${maxTotalSupply}, quantityGoal: ${quantityGoal}, quantitySold: ${quantitySold}, CFSD: ${CFSD}, CFED: ${CFED}, addrHelium: ${addrHelium}`);

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
  return [toAddressArrayOut, amountArrayOut];
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

async function asyncForEachFilter(array, callback) {
  console.log("\n--------------==array:", array);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    console.log(`--------------==next in asyncForEachFilter()
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        console.log('Skipping symbol:', item.o_symbol);
        continue;
      } else {
        await callback(item, idx, array);
      }
    } else {
      await callback(item, idx, array);
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
}


const sequentialCheckBalances = async (toAddressArray, tokenCtrtAddr) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n------==inside sequentialCheckBalances()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);

    const balanceArrayBefore = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

    await asyncForEachFilter(toAddressArray, async (toAddress) => {
      console.log(`\n--------------==next: check the balance of ${toAddress}`);
      const tokenBalanceBeforeMinting = await instHCAT721.methods.balanceOf(toAddress).call();
      balanceArrayBefore.push(parseInt(tokenBalanceBeforeMinting));
    });

    console.log('\n--------------==Done sequentialCheckBalances()');
    console.log('[Completed] All of the investor list has been cycled through');
    return balanceArrayBefore;
    //resolve(balanceArrayBefore);
  //});
}


const sequentialCheckBalancesAfter = async (toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore) => {
  //return new Promise(async (resolve, reject) => {
    console.log('\n---------------==inside sequentialCheckBalancesAfter()');
    //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
    if(!amountArray.every(checkInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] amountArray has non integer item');
      return;
    }
    if(!balanceArrayBefore.every(checkInt)){
      console.log('[error @ sequentialCheckBalancesAfter()] balanceArrayBefore has non integer item. \nbalanceArrayBefore:', balanceArrayBefore);
      return;
    }

    const isCorrectAmountArray = [];
    const balanceArrayAfter = [];
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    const symbol_bytes32 = await instHCAT721.methods.symbol().call();
    const symbol = web3.utils.toAscii(symbol_bytes32);
    
    if(toAddressArray.length !== amountArray.length){
      console.log(`toAddressArray and amountArray must be of the same length`);
      return;
    }
    await asyncForEach(toAddressArray, async (toAddress, idx) => {
      const amount = amountArray[idx];
      const balanceBefore = balanceArrayBefore[idx];
      const tokenBalanceAfterMinting_ = await instHCAT721.methods.balanceOf(toAddress).call();
      const tokenBalanceAfterMinting = parseInt(tokenBalanceAfterMinting_);
      const increase = tokenBalanceAfterMinting - balanceBefore;
      const isCorrect = (parseInt(amount) === increase);
      isCorrectAmountArray.push(isCorrect);
      console.log(`
      balance: expected increase: ${amount} ... actual increase: ${increase} = ${tokenBalanceAfterMinting} - ${balanceBefore}
      typeof amount ${typeof amount} ...  typeof tokenBalanceAfterMinting ${typeof tokenBalanceAfterMinting}, typeof balanceBefore ${typeof balanceBefore}, isCorrect: ${isCorrect}`);
      balanceArrayAfter.push(tokenBalanceAfterMinting);
    });

    console.log('\n--------------==Done sequentialCheckBalancesAfter()');
    console.log('[Completed] All of the investor list has been cycled through');
    return [isCorrectAmountArray, balanceArrayAfter, symbol];
    //resolve(isCorrectAmountArray);
  //});
}

const checkMint = async(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const isAssetbookGood = await tokenReceiver(toAddress).catch(async(err) => {
      console.log(`${err} \ncheckAssetbook() failed...`);
      reject(false);
      return false;
    });
    if(isAssetbookGood){
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
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(mesg);
    }
  });
}


const sequentialMint = async(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr, serverTime) => {
  console.log('\n----------------------==sequentialMint()');
  console.log(`tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}, acquired serverTime: ${serverTime}`);
  const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);

  if(toAddressArrayOut.length !== amountArrayOut.length){
    console.log(`toAddressArrayOut and amountArrayOut must be of the same length`);
    return;
  }
  await asyncForEach(toAddressArrayOut, async (toAddress, idx) => {
    const amount = amountArrayOut[idx];
    console.log(`\n-----------==next: mint to ${toAddress} ${amount} tokens`);

    const encodedData = instHCAT721.methods.mintSerialNFT(toAddress, amount, price, fundingType, serverTime).encodeABI();
    const TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData).catch(async(err) => {
      console.log('\n[Error @ signTx()]', err);
      const mesg = await checkMint(tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime)
    });
    console.log('TxResult', TxResult);
  });
  console.log('\n--------------==Done sequentialMint()');
  console.log('[Completed] All of the investor list has been cycled through');
}


//to be called from API and zlivechain.js, etc...
const sequentialMintSuper = async (toAddressArray, amountArray, tokenCtrtAddr, fundingType, price, maxMintAmountPerRun, serverTime) => {
  console.log('\n----------------------==inside sequentialMintSuper()...');
  //const waitTimeSuper = 13000;
  //console.log(`toAddressArray= ${toAddressArray}, amountArray= ${amountArray}`);
  if(!amountArray.every(checkIntFromOne)){
    console.log('amountArray has non integer or zero element');
    process.exit(1);
  }

  const [toAddressArrayOut, amountArrayOut] = breakdownArrays(toAddressArray, amountArray, maxMintAmountPerRun);
  //console.log(`toAddressArray: ${toAddressArray}, amountArray: ${amountArray}
  //toAddressArrayOut: ${toAddressArrayOut}, amountArrayOut: ${amountArrayOut}`);

  console.log('\n--------------==before minting tokens, check balances now...');
  const balanceArrayBefore = await sequentialCheckBalances(toAddressArray, tokenCtrtAddr);
  console.log('balanceArrayBefore', balanceArrayBefore);

  console.log('\n--------------==Minting tokens via sequentialMint()...');
  await sequentialMint(toAddressArrayOut, amountArrayOut, fundingType, price, tokenCtrtAddr, serverTime).catch((err) => {
    console.log('[Error @ sequentialMint]', err);
    return;
  });

  console.log('\n--------------==after minting tokens, check balances now...');
  const [isCorrectAmountArray, balanceArrayAfter, symbol] = await sequentialCheckBalancesAfter(toAddressArray, amountArray, tokenCtrtAddr, balanceArrayBefore).catch((err) => {
    console.log('[Error @ sequentialCheckBalancesAfter]', err);
  });
  console.log('\n--------------==Done sequentialCheckBalancesAfter()');
  console.log('\nbalanceArrayBefore', balanceArrayBefore, '\nbalanceArrayAfter after', balanceArrayAfter);

  const isFailed = isCorrectAmountArray.includes(false);
  console.log('\nisFailed', isFailed, 'isCorrectAmountArray', isCorrectAmountArray);

  console.log('\n--------------==About to call addAssetRecordRowArray()');
  const ar_time = serverTime;
  const singleActualIncomePayment = 0;// after minting tokens

  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const acquired_cost = 13000;
  const moving_ave_holding_cost = 13000;
  const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost).catch((err) => {
    console.log('[Error @ addAssetRecordRowArray]', err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true];
  });;

  return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, false];
  //resolve(isFailed, isCorrectAmountArray);
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
const sequentialRun = async (mainInputArray, waitTime, serverTime, extraInputArray) => {
  console.log('\n----------==inside sequentialRun()...');
  //console.log(`mainInputArray= ${mainInputArray}, waitTime= ${waitTime}, serverTime= ${serverTime}, extraInputArray= ${extraInputArray}`);
  
  if(!Number.isInteger(serverTime)){
    console.log('[Error] serverTime is not an integer. serverTime:', serverTime);
    return;
  }
  if(extraInputArray.length < 1){
    console.log('[Error] extraInputArray should not be empty');
    return;
  }

  const actionType = extraInputArray[0];
  if(waitTime < 7000 && actionType !== 'updateExpiredOrders'){
    //give DB a list of todos, no async/await ... make orders expired
    console.log('[Warning] waitTime is < min 5000, which is determined by the blockchain block interval time');
    return;
  }
  //console.log('actionType:', actionType);

  await asyncForEachFilter(mainInputArray, async (item) => {
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
          return;
        }
        const oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
        const serverTimeM = moment(serverTime, ['YYYYMMDD']);
        //console.log('serverTimeM', serverTimeM.format('YYYYMMDD'), ' Vs. 3+ oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));
        if (serverTimeM >= oPurchaseDateM.add(3, 'days')) {
          console.log(`oid ${oid} is found serverTime >= oPurchaseDate ... write to DB`);
          const queryStr1 = 'UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?';
          const results = await mysqlPoolQueryB(queryStr1, [oid]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]: setting o_paymentStatus to expired; oid: '+oid+ ', err: '+ err);
          });
          console.log(`[Success] have written status of oid ${oid} as expired.`);
          resolve(true);
        }

      } else {
        //send time to contracts to see the result of determined state: e.g. fundingState, tokenState, ...
        const targetAddr = await findCtrtAddr(symbol, actionType).catch((err) => {
          console.log('[Error @findCtrtAddr]:', err);
        });
        if(isEmpty(targetAddr)){
          console.log(`\ncontract address is not found: ${actionType}, ${symbol}, ${targetAddr}`);
          return false;
        } else {
          console.log(`\ncontract address is found for ${actionType}, ${symbol}, ${targetAddr}`);
          await writeToBlockchainAndDatabase(targetAddr, serverTime, symbol, actionType);
          console.log('[Success] writingToBlockchainAndDatabase() is completed');
        }
      }
    }
  });
  console.log('\n--------------==Done');
  console.log('SequentialRun() has been completed.\nAll input array elements have been cycled through');
}

//mintToken(amountToMint, tokenCtrtAddr, to, fundingType, price);
const mintToken = async (amountToMint, tokenCtrtAddr, to, fundingType, price) => {
  console.log('inside mintToken()');
  await getTime().then(async function (serverTime) {
    console.log('acquired serverTime', serverTime);
    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenCtrtAddr);
    let encodedData = instHCAT721.methods.mintSerialNFT(to, amountToMint, price, fundingType, serverTime).encodeABI();
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenCtrtAddr, encodedData);
    //signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData)
    console.log('TxResult', TxResult);
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
    const queryStr2 = 'SELECT p_SYMBOL FROM htoken.product WHERE (p_state = "initial" AND p_CFSD <= '+serverTime+') OR (p_state = "funding" AND p_CFED <= '+serverTime+') OR (p_state = "fundingGoalReached" AND p_CFED <= '+serverTime+')';
    const symbolArray = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
      reject('[Error @ updateFundingStateFromDB: mysqlPoolQueryB(queryStr2)]: '+ err);
      return false;
    });

    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateFundingStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateFundingStateFromDB] no symbol was found for updating its crowdfunding contract');
    } else if (symbolArrayLen > 0) {
      await sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['crowdfunding']);
    }
    resolve(true);
  });
}


//yarn run testts -a 2 -c 2
//find still funding symbols that have passed CDED2 -> expire all orders of that symbol
const makeOrdersExpiredCFED2 = async (serverTime) => {
  return new Promise(async(resolve, reject) => {
    console.log('\ninside makeOrdersExpiredCFED2(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      reject('[Error] serverTime should be an integer');
      return false;
    }

    const queryStr1 = 'SELECT p_SYMBOL FROM htoken.product WHERE p_CFED <= ? AND (p_state = "initial" OR p_state = "funding" OR p_state = "fundingGoalReached")';
    const symbolArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(queryStr1)] '+ err);
      return false;
    });
    const symbolArrayLen = symbolArray.length;
    console.log('\nArray length @ makeOrdersExpiredCFED2:', symbolArrayLen, ', symbols:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[makeOrdersExpiredCFED2] no symbol was found');
      resolve(true);

    } else if (symbolArrayLen > 0) {
      console.log('[makeOrdersExpiredCFED2] symbol(s) found');

      //const queryStr = 'UPDATE htoken.product SET p_state = ? WHERE p_SYMBOL = ?';
      const queryStr3 = 'UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_symbol = ? AND o_paymentStatus = "waiting"';
      await asyncForEach(symbolArray, async (symbol, index) => {
        /*
        //------------== auto determines the crowdfunding results -> write it into DB
        const crowdFundingAddr = await findCtrtAddr(symbol.p_SYMBOL,'crowdfunding').catch((err) => {
          console.error('[Error @findCtrtAddr]:', err);
          continue;
        });
        const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    
        const encodedData = instCrowdFunding.methods.updateState(serverTime).encodeABI();
        let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
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
        const results2 = await mysqlPoolQueryB(queryStr, [p_state, symbol.p_SYMBOL]).catch((err) => {
          console.log('\n[Error @ mysqlPoolQueryB(queryStr)]', err);
        });
        console.log('\nUpdated product of', symbol.p_SYMBOL, results2);
        */

        //------------== 
        const results3 = await mysqlPoolQueryB(queryStr3, [symbol.p_SYMBOL]).catch((err) => {
          reject('[Error @ mysqlPoolQueryB(queryStr3)] '+ err);
        });
        console.log('-------==[Success] updated orders to expired for symbol', symbol.p_SYMBOL);
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
const addAssetbooksIntoCFC = async (serverTime) => {
  // check if serverTime > CFSD2 for each symbol...
  console.log('\ninside addAssetbooksIntoCFC()... serverTime:',serverTime);
  const queryStr1 = 'SELECT DISTINCT o_symbol FROM htoken.order WHERE o_paymentStatus = "paid"';// AND o_symbol ="AOOS1902"
  const results1 = await mysqlPoolQueryB(queryStr1, []).catch((err) => {
    console.log('\n[Error @ mysqlPoolQueryB(queryStr1)]', err);
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
  //console.log('foundSymbolArray', foundSymbolArray);
  console.log('symbolArray of paid orders:', symbolArray);
  if(symbolArray.length === 0){
    log(chalk.green('>>[Success @ addAssetbooksIntoCFC()] paid orders are found but are all excluded'));
    return true;
  }

  await asyncForEach(symbolArray, async (symbol, index) => {

    const crowdFundingAddr = await findCtrtAddr(symbol, 'crowdfunding');
    console.error(`\n------==[Good] Found crowdsaleaddresses from symbol: ${symbol}, crowdFundingAddr: ${crowdFundingAddr}`);

    // Gives arrays of assetbooks, emails, and tokencounts for symbol x and payment status of y
    const queryStr3 = 'SELECT User.u_assetbookContractAddress, OrderList.o_email, OrderList.o_tokenCount, OrderList.o_id FROM htoken.user User, htoken.order OrderList WHERE User.u_email = OrderList.o_email AND OrderList.o_paymentStatus = "paid" AND OrderList.o_symbol = ?';
    //const queryStr3 = 'SELECT o_email, o_tokenCount, o_id FROM htoken.order WHERE o_symbol = ? AND o_paymentStatus = "paid"';
    const results3 = await mysqlPoolQueryB(queryStr3, [symbol]).catch((err) => {
      console.log('\n[Error @ mysqlPoolQueryB(queryStr3)]', err);
    });
    console.log('results3', results3);
    if(results3.length === 0){
      console.error('[Error] Got no paid order where symbol', symbol, 'result3', results3);
    } else {
      console.log(`\n--------------==[Good] Found a list of email, tokenCount, and o_id for ${symbol}`);
      const assetbookArray = [];
      const assetbookArrayError = [];
      const emailArray = [];
      const emailArrayError = [];
      const tokenCountArray = [];
      const tokenCountArrayError = [];
      const orderIdArray = [];
      const orderIdArrayError = [];
      const txnHashArray = [];

      if(typeof results3[0] === 'object' && results3[0] !== null){
        results3.forEach((item)=>{
          if(!Number.isInteger(item.o_tokenCount) && parseInt(item.o_tokenCount) > 0 && isEmpty(item.o_email) || isEmpty(item.u_assetbookContractAddress) || isEmpty(item.o_id)){
            emailArrayError.push(item.o_email);
            tokenCountArrayError.push(parseInt(item.o_tokenCount));
            orderIdArrayError.push(item.o_id);
            assetbookArrayError.push(item.u_assetbookContractAddress);
          } else {
            emailArray.push(item.o_email);
            tokenCountArray.push(parseInt(item.o_tokenCount));
            orderIdArray.push(item.o_id);
            assetbookArray.push(item.u_assetbookContractAddress);
          }
        });
      }
      console.log(`\nemailArray: ${emailArray} \ntokenCountArray: ${tokenCountArray} \norderIdArray: ${orderIdArray} \nemailArrayError: ${emailArrayError} \ntokenCountArrayError: ${tokenCountArrayError} \norderIdArrayError: ${orderIdArrayError}`);


      console.log('\n----------------==assetbookArray', assetbookArray);
      if(assetbookArray.length !== emailArray.length){
        console.log('[Error] assetbookArray and emailArray have different length')
        return;//process.exit(0);
      }
      const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
      const investorListBf = await instCrowdFunding.methods.getInvestors(0, 0).call();
      console.log(`\nassetbookArrayBf: ${investorListBf[0]}, \ninvestedTokenQtyArrayBf: ${investorListBf[1]}`);

      await asyncForEach(assetbookArray, async (addrAssetbook, index) => {
        const tokenCount = parseInt(tokenCountArray[index]);
        console.log(`\n----==[Good] For ${addrAssetbook}, found its tokenCount ${tokenCount}`);

        console.log(`\n[Good] About to write the assetbook address into the crowdfunding contract
tokenCount: ${tokenCount}, serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

        const fundingState = await instCrowdFunding.methods.fundingState().call();
        console.log('\nfundingState:', fundingState);

        const isGoodToInvest = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });
        console.log('\nisGoodToInvest:', isGoodToInvest);

        //const investorList = await instCrowdFunding.methods.getInvestors(0, 0).call();
        //console.log('\ninvestList', investorList);
        //console.log(`\nassetbookArrayBf: ${investorList[0]}, \ninvestedTokenQtyArrayBf: ${investorList[1]}`);
        
        const encodedData = instCrowdFunding.methods.invest(addrAssetbook, tokenCount, serverTime).encodeABI();
        //invest(_assetbook, _quantityToInvest, serverTime)
        //OR...  investInBatch( _assetbookArr, _quantityToInvestArr, serverTime)
        
        ///*
        let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
        const txnHash = TxResult.transactionHash;
        txnHashArray.push(txnHash);
        console.log(`\nTxResult: ${TxResult} \ntxnHash: ${txnHash}`);

        const investorListAf = await instCrowdFunding.methods.getInvestors(0, 0).call();
        console.log(`\nassetbookArrayAf: ${investorListAf[0]}, \ninvestedTokenQtyArrayAf: ${investorListAf[1]}`);
          
      });

      console.log(`\ntxnHashArray: ${txnHashArray}`)
      if(orderIdArray.length === txnHashArray.length){
        const queryStr5 = 'UPDATE htoken.order SET o_paymentStatus = "txnFinished", o_txHash = ? WHERE o_id = ?';
        await asyncForEach(orderIdArray, async (orderId, index) => {
          const results5 = await mysqlPoolQueryB(queryStr5, [txnHashArray[index], orderId]).catch((err) => {
            console.log('\n[Error @ mysqlPoolQueryB(queryStr5)]', err);
          });
          //console.log('\nresults5', results5);
        });
        log(chalk.green('\n>>[Success @ addAssetbooksIntoCFC()];'));
      } else {
        log(chalk.red(`\n>>[Error @ addAssetbooksIntoCFC] orderIdArray and txnHashArray have different length
        orderIdArray: ${orderIdArray} \ntxnHashArray: ${txnHashArray}`));

      }

    }
  //process.exit(0);
  });
}

const checkInvest = async(crowdFundingAddr, addrAssetbook, tokenCount, serverTime) => {
  return new Promise( async ( resolve, reject ) => {
    const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
    const result = await instCrowdFunding.methods.checkInvestFunction(addrAssetbook, tokenCount, serverTime).call({ from: backendAddr });
    console.log('\nresult', result);
    const boolArray = result[0];
    let mesg;
    if(amountArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

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
    const [is_checkCrowdfunding, tokenSymbol, initialAssetPricing, maxTotalSupply, fundingType, CFSD, CFED, stateDescription] = await checkCrowdfundingCtrt(crowdFundingAddr).catch(async(err) => {
      console.log(`${err} \ncheckCrowdfundingCtrt() failed...`);
      reject(false);
      return false;
    });
    if(!is_checkCrowdfunding){
      resolve(false);
      return false;
    }
    console.log('Please manually check if above data is correct.\nIf yes, then the crowdfunding contract is good');
    
    console.log('\ncheckInvest2');
    const isAssetbookGood = await tokenReceiver(addrAssetbook).catch(async(err) => {
      console.log(`${err} \ncheckAssetbook() failed...`);
      reject(false);
      return false;
    });
    if(isAssetbookGood){
      console.log(`\n-----------==assetbook is checked good \ntokenSymbol: ${tokenSymbol}, initialAssetPricing: ${initialAssetPricing}, maxTotalSupply: ${maxTotalSupply}, fundingType: ${fundingType}, CFSD: ${CFSD}, CFED: ${CFED}, stateDescription: ${stateDescription}`);
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
          mesg += ', [6] quantityToInvest should be <= maxTotalSupply';
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


const getInvestorsFromCFC_Check = async(serverTime) => {
  //check if serverTime > CFSD2
  const addrAssetbook = '0xdEc799A5912Ce621497BFD1Fe2C19f8e23307dbc';
  console.log(`\ngetInvestorsFromCFC_Check
serverTime: ${serverTime}
addrAssetbook: ${addrAssetbook}
crowdFundingAddr: ${crowdFundingAddr}`);

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
const getInvestorsFromCFC = async (indexStart, tokenCountStr) => {
  console.log('\ngetInvestorsFromCFC()...');
  if(!Number.isInteger(indexStart) || !Number.isInteger(tokenCountStr)){
    console.log(`[Error] Non integer is found: indexStart: ${indexStart}, tokenCountStr: ${tokenCountStr}`);
    return [[-1],[-1]];
  }
  tokenCount = parseInt(tokenCountStr);
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, crowdFundingAddr);
  const [assetbookArray, investedTokenQtyArray] = await instCrowdFunding.methods.getInvestors(indexStart, tokenCount).call();  //getInvestors(uint indexStart, uint tokenCount) external view returns(address[] memory assetbookArray, uint[] memory investedTokenQtyArray)
  console.log(`\nassetbookArray: ${assetbookArray}\ninvestedTokenQtyArray: ${investedTokenQtyArray}`);
  return [assetbookArray, investedTokenQtyArray];
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

    const str = 'SELECT p_SYMBOL FROM htoken.product WHERE p_lockuptime <= ? OR p_validdate <= ?';
    const symbolArray = await mysqlPoolQueryB(str, [serverTime, serverTime]).catch((err) => {
      reject('[Error @ mysqlPoolQueryB(str)] '+ err);
      return false;
    });
    const symbolArrayLen = symbolArray.length;
    console.log('\nsymbolArray length @ updateTokenStateFromDB:', symbolArrayLen, ', symbolArray:', symbolArray);

    if (symbolArrayLen === 0) {
      console.log('[updateTokenStateFromDB] no symbol was found for time >= lockuptime or time >= validdate');
    } else if (symbolArrayLen > 0) {
      await sequentialRun(symbolArray, timeIntervalOfNewBlocks, serverTime, ['tokencontroller']);
    }
    resolve(true);
  });
}

const writeToBlockchainAndDatabase = async (targetAddr, serverTime, symbol, actionType) => {
  if(actionType === 'crowdfunding'){
    const fundingStateStr = await updateFundingStateCFC(targetAddr, serverTime);
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
    const tokenStateStr = await updateTokenStateTCC(targetAddr, serverTime);
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
    const isScheduleGoodForRelease = await checkIMC_isSchGoodForRelease(targetAddr, serverTime);
    console.log('isScheduleGoodForRelease', isScheduleGoodForRelease);
    if(isScheduleGoodForRelease){
      /**
       * Call bank to release income to customers
       * Get banks' results: actualPaymentTime, actualPaymentAmount or error code 
       * NOT FOR for each token owner... one result for each schedule index!
       * Write that result into DB: 
       * too long name: ia_single_Forecasted_Payable_Income_in_the_Period, ia_single_Actual_Income_Payment_in_the_Period... actualPaymentTime?
       * Write that result into BC below...
       */
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, targetAddr);

      //for loop for each token owner(bankResult) => {}
      const actualPaymentTime = 0;//bankResult.paymentDateTime
      const actualPaymentAmount = 0;//bankResult.paymentAmount
      const errorCode = 0;//bankResult.paymentError

      //write bank's confirmation into IncomeManager.sol
      let encodedData = instIncomeManager.methods.setPaymentReleaseResults(serverTime, actualPaymentTime, actualPaymentAmount, errorCode).encodeABI();
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, targetAddr, encodedData);
      console.log('TxResult', TxResult);

      //const scheduleDetails = await instIncomeManager.methods.getIncomeSchedule(schIndex).call({ from: backendAddr });
      //console.log('[Success @ updateIncomeManager(serverTime)] scheduleDetails:', scheduleDetails);

    } else {
      console.log('[Error] date is found as an incomeManager date in DB but not such in IncomeManager.sol!!! isScheduleGoodForRelease:', isScheduleGoodForRelease);
    }
  }
  console.log('end of writeToBlockchainAndDatabase() for', symbol, 'actionType:', actionType);
}


//---------------------------==Assetbook
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
    console.log('\n-------==getAssetbookDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = await instAssetBook.methods.assetOwner().call();
    result[1] = await instAssetBook.methods.addrHeliumContract().call();
    result[2] = await instAssetBook.methods.assetOwner_flag().call();
    result[3] = await instAssetBook.methods.HeliumContract_flag().call();
    result[4] = await instAssetBook.methods.endorserCtrts_flag().call();
    result[5] = await instAssetBook.methods.calculateVotes().call();

    const endorserCtrts = await instAssetBook.methods.endorserCtrts().call();
    result[6] = endorserCtrts[0];
    result[7] = endorserCtrts[1];
    result[8] = endorserCtrts[2];
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
    let TxResult = await signTx(AssetOwner1, AssetOwner1pkRaw, addrAssetBook, encodedData);
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
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
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
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
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
    let TxResult = await signTx(admin, adminpkRaw, addrAssetBook, encodedData);
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
// const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
// const encodedData = instAssetBook.methods.HeliumContractVote(serverTime).encodeABI();
// let TxResult = await signTx(backendAddr, backendRawPrivateKey, addrAssetBook, encodedData);
// console.log('\nTxResult', TxResult);

//---------------------------==Income Manager
//---------------------------==
const schCindex = async(symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside getIncomeSchedule()');
    const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);

    const result = await instIncomeManager.methods.schCindex().call();
    console.log('\nschCindex:', result);//assert.equal(result, 0);
    resolve(result);
  });
}

//yarn run livechain -c 1 --f 12
const getIncomeSchedule = async(symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside getIncomeSchedule()');
    const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
    //const result = await instIncomeManager.methods.schCindex().call();
    //console.log('\nschCindex:', result);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);
    resolve(result2);
  });
}

//yarn run livechain -c 1 --f 13
const getIncomeScheduleList = async(symbol, forecastedPayableTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------------==inside getIncomeScheduleList()');
    const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
    // const result = await instIncomeManager.methods.schCindex().call();
    // console.log('\nschCindex:', result);//assert.equal(result, 0);

    // const bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    // console.log('\nisScheduleGoodForRelease('+forecastedPayableTime+'):', bool1);

    const indexStart = 0; const amount = 0;
    const scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    resolve(scheduleList)
  });
}


//yarn run livechain -c 1 --f 14
const checkAddScheduleBatch1 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  console.log('\n-------------==inside checkAddScheduleBatch1()');
  const length = forecastedPayableTimes.length;
  if(length !== forecastedPayableAmounts.length){
    console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
    return;
  } else if(length === 0){
    console.log('forecastedPayableTimes has length zero');
    return;
  }

  const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
    console.log('[Error @findCtrtAddr]:', err);
  });
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
  
  const result = await instIncomeManager.methods.checkAddScheduleBatch1(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
  console.log('\nschCindex:', result);//assert.equal(result, 0);
  process.exit(0);
}

// yarn run livechain -c 1 --f 15
const checkAddScheduleBatch2 = async(symbol, forecastedPayableTimes, forecastedPayableAmounts) => {
  console.log('\n-------------==inside checkAddScheduleBatch1()');
  const length = forecastedPayableTimes.length;
  if(length !== forecastedPayableAmounts.length){
    console.log('forecastedPayableTimes and forecastedPayableAmounts are of different length');
    return;
  } else if(length === 0){
    console.log('forecastedPayableTimes has length zero');
    return;
  }

  const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
    console.log('[Error @findCtrtAddr]:', err);
  });
  const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
  
  const result = await instIncomeManager.methods.checkAddScheduleBatch2(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
  console.log('\nschCindex:', result);//assert.equal(result, 0);
  process.exit(0);
}


// yarn run livechain -c 1 --f 16
const checkAddScheduleBatch = async (incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside checkAddScheduleBatch()');
    console.log('incomeMgrAddr', incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts);
    const length = forecastedPayableTimes.length;
    if(length !== forecastedPayableAmounts.length){
      reject('forecastedPayableTimes and forecastedPayableAmounts are of different length');
      return false;
    } else if(length === 0){
      reject('forecastedPayableTimes has length zero');
      return false;
    }

    if(!forecastedPayableTimes.every(checkInt) || !forecastedPayableAmounts.every(checkInt)){
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

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);

    const isPS = await instIncomeManager.methods.checkPlatformSupervisor().call({ from: backendAddr }); console.log('\nisPS', isPS);

    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
  
    const result2 = await instIncomeManager.methods.getIncomeSchedule(schCindexM).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schCindexM}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    const first_forecastedPayableTime = parseInt(forecastedPayableTimes[0]);
    const last_forecastedPayableTime = parseInt(result2[0]);
    if(last_forecastedPayableTime >= first_forecastedPayableTime){
      reject(`last_forecastedPayableTime ${last_forecastedPayableTime} should be < first_forecastedPayableTime ${first_forecastedPayableTime}`);
      return false;
    }
    const results = await instIncomeManager.methods.checkAddScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).call({ from: backendAddr });
    console.log('results', results);

    resolve(results);
  });
}



const addScheduleBatchFromDB = async (symbol) => {
  return new Promise(async (resolve, reject) => {

    const results1 = await getForecastedSchedulesFromDB(symbol);
    //console.log('results1', results1);
    const forecastedPayableTimes = [];
    const forecastedPayableAmounts = [];
    for(let i = 0; i < results1.length; i++) {
      if(typeof results1[i] === 'object' && results1[i] !== null && results1[i] !== undefined){
        forecastedPayableTimes.push(results1[i].ia_time);
        forecastedPayableAmounts.push(results1[i].ia_single_Forecasted_Payable_Income_in_the_Period);
      }
    }
    console.log(`forecastedPayableTimes: ${forecastedPayableTimes} 
  forecastedPayableAmounts: ${forecastedPayableAmounts}`);

    const results2 = await addScheduleBatch(incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts);
    if(results2){
      resolve(true);
    } else {
      reject(false);
    }
  });
}

//yarn run livechain -c 1 --f 17
const addScheduleBatch = async (incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside addScheduleBatch()');
    console.log('incomeMgrAddr', incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts);

    const length1 = forecastedPayableTimes.length;
    if(length1 !== forecastedPayableAmounts.length){
      const mesg = '[Error] forecastedPayableTimes and forecastedPayableAmounts from DB should have the same length';
      console.log(mesg);
      return;
    }
  
    const isCheckAddScheduleBatch = await checkAddScheduleBatch(incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
      reject('[Error @checkAddScheduleBatch]: '+ err);
      return false;
    });
    console.log('\nisCheckAddScheduleBatch:', isCheckAddScheduleBatch);

    if(isCheckAddScheduleBatch){
      const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
      //console.log(`getIncomeSchedule(${schCindexM}):\n${result2[0]}\n${result2[1]}\n${result2[2]}\n${result2[3]}\n${result2[4]}\n${result2[5]}\n${result2[6]}`);// all should be 0 and false before adding a new schedule
      let encodedData = instIncomeManager.methods.addScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts).encodeABI();
      console.log('about to execute signTx()...');
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, incomeMgrAddr, encodedData);
      console.log('TxResult', TxResult);

      const indexStart = 0; const amount = 0;
      let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
      console.log('\nscheduleList', scheduleList);
      const schCindexM = await instIncomeManager.methods.schCindex().call();
      console.log('schCindex:', schCindexM);//assert.equal(result, 0);
      resolve(true);

    } else {
      reject('[Error] isCheckAddScheduleBatch: '+ isCheckAddScheduleBatch);
      return false;
    }
  });
}


//yarn run livechain -c 1 --f 18
const removeIncomeSchedule = async (symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside removeIncomeSchedule()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);
    let encodedData = instIncomeManager.methods.removeIncomeSchedule(schIndex).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, incomeMgrAddr, encodedData);
    console.log('TxResult', TxResult);

    const indexStart = 0; const amount = 0;
    let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
    resolve(true);
  });
}


//yarn run livechain -c 1 --f 19
const imApprove = async (symbol, schIndex, boolValue) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside imApprove()');
    console.log('schIndex', schIndex, 'boolValue', boolValue);

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
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    if(result2[4] === boolValue){
      console.log('the desired status has already been set so');
      resolve(true);

    } else {
      let encodedData = instIncomeManager.methods.imApprove(schIndex, true).encodeABI();
      console.log('about to execute signTx()...');
      let TxResult = await signTx(backendAddr, backendRawPrivateKey, incomeMgrAddr, encodedData);
      console.log('TxResult', TxResult);
  
      const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
      console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);
      resolve(true);
    }
  });
}

//yarn run livechain -c 1 --f 20
const setPaymentReleaseResults = async (symbol, schIndex, actualPaymentTime, actualPaymentAmount,  errorCode) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside setPaymentReleaseResults()');
    console.log('schIndex', schIndex, 'actualPaymentTime', actualPaymentTime, 'actualPaymentAmount', actualPaymentAmount, 'errorCode', errorCode);

    const incomeMgrAddr = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, incomeMgrAddr);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    let encodedData = instIncomeManager.methods.setPaymentReleaseResults(schIndex, actualPaymentTime, actualPaymentAmount,  errorCode).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendRawPrivateKey, incomeMgrAddr, encodedData);
    console.log('TxResult', TxResult);

    const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);

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




const isScheduleGoodIMC = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside isScheduleGoodIMC(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }
    //let payableTime = ia_time; 
    //let payableAmount = ia_Payable_Period_End;
    //'SELECT htoken.income_arrangement.ia_SYMBOL,htoken.income_arrangement.ia_time , htoken.income_arrangement.ia_Payable_Period_End From htoken.income_arrangement where income_arrangement.ia_time = ?'

    const queryStr1 = 'SELECT htoken.income_arrangement.ia_SYMBOL From htoken.income_arrangement where income_arrangement.ia_time <= ?';
    const symbolArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ isScheduleGoodIMC: mysqlPoolQueryB(queryStr1)]: '+ err);
      return false;
    });
    const resultsLen = results.length;
    console.log('symbolArray length @ isScheduleGoodIMC', resultsLen);
    if (resultsLen > 0) {
      await sequentialRun(resultsLen, timeIntervalOfNewBlocks, serverTime, ['incomemanager']);
    }
  });
}



//-----------------------==
// orderDate+3 => expired orders
// yarn run testts -a 2 -c 19
const updateExpiredOrders = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside updateExpiredOrders(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return;
    }

    const queryStr ='SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"';
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
      await sequentialRun(results, timeIntervalUpdateExpiredOrders, serverTime, ['updateExpiredOrders']);
    }
    resolve(true);
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


//------------------------==
async function sendTimeCFctrt(addr, time) {
    /*use admin EOA to sign transaction*/
    let CrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addr);
    let encodedData = CrowdFunding.methods.setServerTime(time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, addr, encodedData);

    return result;
}

function print(s) {
  console.log('[timeserver/lib/blockchain.js] ' + s)
}

module.exports = {
  addPlatformSupervisor, checkPlatformSupervisor, addCustomerService, checkCustomerService, setRestrictions, deployAssetbooks, addUsersToRegistryCtrt, updateExpiredOrders, getDetailsCFC, getTokenBalances, sequentialRunTsMain, sequentialMintToAdd, sequentialMintToMax, sequentialCheckBalancesAfter, sequentialCheckBalances, doAssetRecords, sequentialMintSuper, preMint, mintSequentialPerContract, getFundingStateCFC, getHeliumAddrCFC, updateFundingStateFromDB, updateFundingStateCFC, investTokensInBatch, addAssetbooksIntoCFC, getInvestorsFromCFC, setTimeCFC, investTokens, checkInvest, getTokenStateTCC, getHeliumAddrTCC, updateTokenStateTCC, updateTokenStateFromDB, makeOrdersExpiredCFED, 
  get_schCindex, tokenCtrt, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule, addPaymentCount, addForecastedScheduleBatchFromDB, setErrResolution, resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr, endorsers, rabbitMQSender, rabbitMQReceiver, fromAsciiToBytes32, deployCrowdfundingContract, deployTokenControllerContract, checkArgumentsTCC, checkDeploymentTCC, checkArgumentsHCAT, checkDeploymentHCAT, deployHCATContract, deployIncomeManagerContract, checkArgumentsIncomeManager, checkDeploymentIncomeManager, checkDeploymentCFC, checkArgumentsCFC, tokenReceiver, checkAssetbookArray, deployRegistryContract, deployHeliumContract, deployProductManagerContract, getTokenContractDetails, addProductRowFromSymbol, setTokenController, getCFC_Balances, checkSafeTransferFromBatchFunction, transferTokens
}
