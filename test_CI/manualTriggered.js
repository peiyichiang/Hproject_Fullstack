const axios = require('axios');
const path = require('path');
const fs = require('fs');

//--------------------==
const { productObjArray, symbolArray, crowdFundingAddrArray, userArray, assetRecordArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid, nowDate, userObject, assetbookArray, incomeArrangementArray } = require('./zTestParameters');

const { admin, adminpkRaw, symbolNumber, isTimeserverON, addrHelium, addrRegistry, addrProductManager, isToDeploy, assetbookAmount } = require('../timeserver/envVariables');

const { checkCompliance } = require('../ethereum/contracts/zsetupData');

const { mysqlPoolQueryB, setFundingStateDB, getForecastedSchedulesFromDB, calculateLastPeriodProfit, getProfitSymbolAddresses, addAssetRecordRowArray, addActualPaymentTime, addIncomeArrangementRow, setAssetRecordStatus, getMaxActualPaymentTime, getAcPayment, checkIaAssetRecordStatus, getPastScheduleTimes, addUserArrayOrdersIntoDB, addArrayOrdersIntoDB, addOrderIntoDB, deleteTxnInfoRows, deleteProductRows, deleteSmartContractRows, deleteOrderRows, getSymbolFromCtrtAddr, deleteIncomeArrangementRows, deleteAssetRecordRows, addProductRow, addSmartContractRow, add3SmartContractsBySymbol, addIncomeArrangementRows, getCtrtAddr, getAllSmartContractAddrs, deleteAllRecordsBySymbol, addUsersIntoDB, deleteAllRecordsBySymbolArray, updateIAassetRecordStatus } = require('../timeserver/mysql.js');

const { addPlatformSupervisor, checkPlatformSupervisor, addCustomerService, checkCustomerService, get_schCindex, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, preMint, mintSequentialPerContract, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule, getTokenBalances, addForecastedScheduleBatchFromDB, addPaymentCount, setErrResolution, getDetailsCFC, getInvestorsFromCFC, investTokensInBatch, investTokens, checkInvest, setTimeCFC, deployAssetbooks, addUsersToRegistryCtrt, deployCrowdfundingContract, deployTokenControllerContract, checkArgumentsTCC, checkDeploymentTCC, checkArgumentsHCAT, deployHCATContract, checkDeploymentHCAT, deployIncomeManagerContract, checkArgumentsIncomeManager, checkDeploymentIncomeManager, checkDeploymentCFC, checkArgumentsCFC, fromAsciiToBytes32, checkAssetbook, checkAssetbookArray, deployRegistryContract, deployHeliumContract, deployProductManagerContract, getTokenContractDetails, addProductRowFromSymbol, setTokenController, getCFC_Balances, addAssetbooksIntoCFC, updateTokenStateTCC, checkSafeTransferFromBatchFunction, transferTokens } = require('../timeserver/blockchain.js');

const { isEmpty, isIntAboveOne, isNoneInteger, getTimeServerTime, checkTargetAmounts, getArraysFromCSV, getOneAddrPerLineFromCSV, breakdownArray, breakdownArrays, arraySum, getLocalTime, getInputArrays, getRndIntegerBothEnd, asyncForEach} = require('../timeserver/utilities');

const { deployCtrt1, Test1ReadValues, Test1GetAccountDetail } = require('./miniBlockchain');

const AssetOwner0 = assetOwnerArray[0];
const AssetOwner1 = assetOwnerArray[1];
const AssetOwner2 = assetOwnerArray[2];
const AssetOwner3 = assetOwnerArray[3];
const AssetOwner4 = assetOwnerArray[4];
const AssetOwner5 = assetOwnerArray[5];

let argv3, argv4, argv5, argv6, argv7;

const timeChoice = 1;

// yarn run testmt -f F
// yarn run testmt -f F -a1 argv5 -a2 argv6 -a3 argv6
const arguLen = process.argv.length;
console.log('arguLen', arguLen, 'process.argv', process.argv);
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run testmt -f F');
  console.log("\x1b[32m", 'F = 1: ()');
  process.exit(0);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 4) {
  console.log('not enough arguments. --h for help');
  process.exit(0);
} else {
  argv3 = parseInt(process.argv[3]);
  if (argv3 < 0 || argv3 > 999){
    console.log('argv3 value is out of range. argv3: ', argv3);
    process.exit(0);
  }
  if (arguLen >= 5) {
    argv4 = process.argv[4];
    if (arguLen >= 6) {
      argv5 = process.argv[5];
      if (arguLen >= 7) {
        argv6 = process.argv[6];
        if (arguLen >= 8) {
          argv7 = process.argv[7];
        }  
      }  
    }
  }
}
//console.log(argv4, argv5, argv6);

// yarn run testmt -f F
// yarn run testmt -f F -a argv5 -b argv6 -c argv6

// yarn run testmt -f 0
const newplatformSupervisor = AssetOwner0;
const newCustomerService = AssetOwner3;
const addPlatformSupervisor_API = async () => {
  console.log('\n------------------==inside addPlatformSupervisor_API()...');
  const addrHelium = '0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf';
  //const addrHelium = '0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf';
  const result = await addPlatformSupervisor(newplatformSupervisor, addrHelium).catch((err) => {
    console.log('[Error @ addPlatformSupervisor]', err);
  });
  console.log(`result: ${result}`);
  process.exit(0);
}

// yarn run testmt -f 1
const checkPlatformSupervisor_API = async () => {
  console.log('\n------------------==inside checkPlatformSupervisor_API()...');
  const addrHelium = '0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf';
  const result = await checkPlatformSupervisor(newplatformSupervisor, addrHelium).catch((err) => {
    console.log('[Error @ checkPlatformSupervisor]', err);
  });
  console.log(`result: ${result}, ${newplatformSupervisor}`);
  process.exit(0);
}

// yarn run testmt -f 2
const addCustomerService_API = async () => {
  console.log('\n------------------==inside addCustomerService_API()...');
  const addrHelium = '0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf';
  const result = await addCustomerService(newCustomerService, addrHelium).catch((err) => {
    console.log('[Error @ addCustomerService]', err);
  });
  console.log(`result: ${result}`);
  process.exit(0);
}

// yarn run testmt -f 3
const checkCustomerService_API = async () => {
  console.log('\n------------------==inside checkCustomerService_API()...');
  const addrHelium = '0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf';
  const result = await checkCustomerService(newCustomerService, addrHelium).catch((err) => {
    console.log('[Error @ checkCustomerService]', err);
  });
  console.log(`result: ${result}, ${newCustomerService}`);
  process.exit(0);
}


//--------------------------------==
//--------------------------------==
//yarn run testmt -f 25
const checkIaAssetRecordStatus_API = async () => {
  console.log('\n---------------------==checkIaAssetRecordStatus_API()');
  const symbol = 'ALLI0905';
  const actualPaymentTime = 201909051556;
  const assetRecordStatus = await checkIaAssetRecordStatus(symbol, actualPaymentTime);
  process.exit(0);
}

//yarn run testmt -f 110
const updateIAassetRecordStatus_API = async () => {
  console.log('\n---------------------==updateIAassetRecordStatus_API()');
  const symbol = 'KEAN0909';
  const result = await updateIAassetRecordStatus(symbol);
  console.log(`updateIAassetRecordStatus_API result: ${result}`)
  process.exit(0);
}


//yarn run testmt -f 26
const getMaxActualPaymentTime_API = async () => {
  console.log('\n---------------------==getMaxActualPaymentTime_API()');
  const symbol = 'ROSA0902';
  const serverTime = '201909091243';
  const maxActualPaymentTime = await getMaxActualPaymentTime(symbol, serverTime);
  let mesg = '';
  if(isNoneInteger(maxActualPaymentTime)){
    mesg += 'maxActualPaymentTime is not valid';
    console.log(`[Warning] ${mesg}, symbol: ${symbol}`);

  } else {
    console.log(`[Good] maxActualPaymentTime is valid: ${maxActualPaymentTime} ${typeof maxActualPaymentTime}`);
  }
  console.log('maxActualPaymentTime:', maxActualPaymentTime, ', Boolean:', Boolean(maxActualPaymentTime));
  process.exit(0);
}

//yarn run testmt -f 27
const getAcPayment_API = async() => {
  const symbol = "STEP0904";
  const maxActualPaymentTime = "201909051556";
  let mesg = '';
  const acPayment = await getAcPayment(symbol, maxActualPaymentTime);
  if(isNoneInteger(acPayment)){
    mesg += 'acPayment is not an integer';
    console.log(`[Warning] ${mesg}: ${acPayment}, symbol: ${symbol}`);
  } else {
    console.log(`[Good] acPayment is able to become an integer, symbol: ${symbol} ${typeof symbol}`);
  }
  process.exit(0);
}

//yarn run testmt -f 28
const getProfitSymbolAddresses_API = async () => {
  const time = await getLocalTime();
  const resultsAPI = await getProfitSymbolAddresses(time);
  //console.log('getProfitSymbolAddresses_API result:', resultsAPI);
  process.exit(0);
}


// yarn run testmt -f 29
const calculateLastPeriodProfit_API = async () => {
  console.log('\n------------------==inside calculateLastPeriodProfit_API()...');
  const time = await getLocalTime();
  const result = await calculateLastPeriodProfit(time).catch((err) => {
    console.log('[Error @ calculateLastPeriodProfit]', err);
  });
  console.log(`calculateLastPeriodProfit_API result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 23
const setAssetRecordStatus_API = async () => {
  console.log('\n---------------------==setAssetRecordStatus_API()');
  const assetRecordStatus = 1;
  const symbol = 'CASP0905';
  const actualPaymentTime = 201909051622;
  const result = await setAssetRecordStatus(assetRecordStatus, symbol, actualPaymentTime);
  console.log('result', result);
  process.exit(0);
}


// yarn run testmt -f 11
const incomeManagerCtrt_API = async () => {
  console.log('\n------------------==inside incomeManagerCtrt_API()...');
  console.log('nftSymbol:', nftSymbol);
  const schCindex = await get_schCindex(nftSymbol).catch((err) => {
    console.log('[Error @ schCindex]', err);
  });
  console.log(`schCindex: ${schCindex}`);

  const paymentCount = await get_paymentCount(nftSymbol).catch((err) => {
    console.log('[Error @ get_paymentCount]', err);
  });
  console.log(`paymentCount: ${paymentCount}`);

  const TimeOfDeployment = await get_TimeOfDeployment(nftSymbol).catch((err) => {
    console.log('[Error @ get_TimeOfDeployment]', err);
  });
  console.log(`TimeOfDeployment: ${TimeOfDeployment}`);
  
  const incomeSchedules = await getIncomeSchedule(nftSymbol, schCindex).catch((err) => {
    console.log('[Error @ getIncomeSchedule]', err);
  });
  console.log(`incomeSchedules: ${JSON.stringify(incomeSchedules) }`);

  process.exit(0);
}
//schCindex, tokenCtrt, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule,  addForecastedScheduleBatchFromDB, setErrResolution,

//---------------------------------==IncomeManagerCtrt
// yarn run testmt -f 12
const getIncomeSchedule_API = async() => {
  console.log('\n-------------------==getIncomeSchedule_API');
  const symbol = nftSymbol;
  const schIndex = 1;
  const incomeSchedules = await getIncomeSchedule(symbol, schIndex);
  console.log(`incomeSchedules: ${JSON.stringify(incomeSchedules) }`);
  process.exit(0);
}

// yarn run testmt -f 13
const getIncomeScheduleList_API = async() => {
  console.log('\n-------------------==getIncomeScheduleList_API');
  const symbol = nftSymbol;
  const scheduleList = await getIncomeScheduleList(symbol);
  console.log(`scheduleList: ${JSON.stringify(scheduleList) }`);
  process.exit(0);
}

// yarn run testmt -f 14
const checkAddForecastedScheduleBatch1_API = async() => {
  console.log('\n---------------------==checkAddForecastedScheduleBatch1_API');
  const symbol = nftSymbol;
  console.log('symbol', symbol);
  const forecastedPayableTimes = [201908170000, 201911210000, 202002230000];
  const forecastedPayableAmounts = [3700, 3800, 3900];
  const result = await checkAddForecastedScheduleBatch1(symbol, forecastedPayableTimes, forecastedPayableAmounts);
  console.log(`\nresult: ${JSON.stringify(result)}`);
  process.exit(0);
}

//yarn run testmt -f 15
const checkAddForecastedScheduleBatch2_API = async() => {
  console.log('\n---------------------==checkAddForecastedScheduleBatch2_API');
  const symbol = nftSymbol;
  const forecastedPayableTimes = [201908170000, 201911210000, 202002230000];
  const forecastedPayableAmounts = [3700, 3800, 3900];
  const result = await checkAddForecastedScheduleBatch2(symbol, forecastedPayableTimes, forecastedPayableAmounts);
  console.log(`\nresult: ${JSON.stringify(result)}`);
  process.exit(0);
}

//yarn run testmt -f 16
const checkAddForecastedScheduleBatch_API = async() => {
  console.log('\n---------------------==checkAddForecastedScheduleBatch_API');
  const symbol = nftSymbol;
  const forecastedPayableTimes = [202202230000, 202205230000, 202208230000];
  const forecastedPayableAmounts = [3700, 3800, 3900];

  const result = await checkAddForecastedScheduleBatch(symbol, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => console.log('[Error @checkAddForecastedScheduleBatch]:', err));
  console.log(`\nresult: ${JSON.stringify(result)}`);
  process.exit(0);
}

//yarn run testmt -f 17
const addForecastedScheduleBatch_API = async() => {
  console.log('\n---------------------==addForecastedScheduleBatch_API');
  const symbol = nftSymbol;
  let forecastedPayableTimes, forecastedPayableAmounts;

  const choice = 2;
  if(choice === 1){
    forecastedPayableTimes = [201908170000, 201911210000, 202002230000];
    forecastedPayableAmounts = [3701, 3801, 3901];

  } else if(choice === 2){
    forecastedPayableTimes = [202005230000, 202008270000, 202011290000];
    forecastedPayableAmounts = [3702, 3802, 3902];

  } else if(choice === 3){
    forecastedPayableTimes = [202105230000, 202108230000, 202111230000];
    forecastedPayableAmounts = [3703, 3803, 3903];

  }
  //forecastedPayableTimes = [202103010000];
  //forecastedPayableAmounts = [4100];

  const result = await addForecastedScheduleBatch(symbol, forecastedPayableTimes, forecastedPayableAmounts);
  console.log(`\nresult: ${JSON.stringify(result)}`);
  process.exit(0);
}

// yarn run testmt -f 13
// to run getIncomeScheduleList_API

//const addForecastedSchedulesIntoDB_API
// already done when uploading csv into DB


//yarn run testmt -f 23
const getForecastedSchedulesFromDB_API = async () => {

  const symbol = nftSymbol;//'HToken123';
  const [forecastedPayableTimes, forecastedPayableAmounts, forecastedPayableTimesError, forecastedPayableAmountsError] = await getForecastedSchedulesFromDB(symbol).catch((err) => console.log('[Error @getForecastedSchedulesFromDB()]:', err));

  console.log(`forecastedPayableTimes: ${forecastedPayableTimes} 
forecastedPayableAmounts: ${forecastedPayableAmounts}
forecastedPayableTimesError: ${forecastedPayableTimesError}
forecastedPayableAmountsError: ${forecastedPayableAmountsError}`);
  process.exit(0);
}


//yarn run testmt -f 18
const addForecastedScheduleBatchFromDB_API = async () => {
  //     const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From income_arrangement where ia_SYMBOL = ?';

  const symbol = nftSymbol;
  const result = await addForecastedScheduleBatchFromDB(symbol).catch((err) => {
    console.log('[Error @addForecastedScheduleBatchFromDB]:', err);
  });
  console.log('result', result);
}


//yarn run testmt -f 19
const editActualSchedule_API = async() => {
  console.log('\n---------------==editActualSchedule_API');
  const symbol = nftSymbol;
  const schIndex = 2;
  const actualPaymentTime = 201911210000+1;
  const actualPaymentAmount = 3801+1;
  const result = await editActualSchedule(symbol, schIndex, actualPaymentTime, actualPaymentAmount);
  console.log('result', result);
  process.exit(0);
}

// yarn run testmt -f 13
// to run getIncomeScheduleList_API


//yarn run testmt -f 20
const addPaymentCount_API = async() => {
  console.log('\n---------------==addPaymentCount_API');
  const symbol = nftSymbol;
  const result = await addPaymentCount(symbol);
  console.log('result', result);
  process.exit(0);
}


//yarn run testmt -f 20
const setErrResolution_API = async() => {
  console.log('\n---------------==setErrResolution_API');
  const symbol = nftSymbol;
  const schIndex = 1;
  const actualPaymentTime = 201908210000;
  const actualPaymentAmount = 3811;
  const errorCode = 1;
  const result = await setErrResolution(symbol, schIndex, actualPaymentTime, actualPaymentAmount, errorCode);
  //setErrResolution(uint _schIndex, uint actualPaymentTime, uint actualPaymentAmount, uint8 errorCode) external onlyPlatformSupervisor
  console.log('result', result, typeof result);
  process.exit(0);

}

//yarn run testmt -f 21
//setErrResolution(uint _schIndex, bool boolValue) external onlyPlatformSupervisor





//------------------------------==Assetbook
//yarn run testmt -f 30
const getAssetbookDetails_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const resultsAPI = await getAssetbookDetails(addrAssetBook);
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

//yarn run testmt -f 31
const setHeliumAddr_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const resultsAPI = await setHeliumAddr(addrAssetBook, _addrHeliumContract);
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

//yarn run testmt -f 32
const HeliumContractVote_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const resultsAPI = await HeliumContractVote(addrAssetBook, serverTime);
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

//yarn run testmt -f 33
const resetVoteStatus_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const resultsAPI = await resetVoteStatus(addrAssetBook);
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

//yarn run testmt -f 34
const changeAssetOwner_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const resultsAPI = await changeAssetOwner(addrAssetBook, _assetOwnerNew, serverTime);
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

//yarn run testmt -f 6
const checkCompliance_API = async () => {
  let authLevel, orderBalance, orderPayment, fundingType;//PO: 1, PP: 2

  const choice = 4;
  if(choice === 1){
    authLevel = '5'; orderBalance = 285000; orderPayment = 15000; fundingType = '1';
  } else if(choice === 2){
    authLevel = '5'; orderBalance = 285000; orderPayment = 15001; fundingType = '1';
  } else if(choice === 3){
    authLevel = '5'; orderBalance = 0; orderPayment = 300001; fundingType = '1';

  } else if(choice === 4){
    const symbol = 'MYRR1701';
    const queryStr1 = 'SELECT * FROM htoken.product WHERE p_SYMBOL = ?';
    let result = await mysqlPoolQueryB(queryStr1, [symbol]);
    const product1 = result[0];
    console.log('result', product1, typeof product1);

    const pricing = product1.p_pricing;
    authLevel = '5'; orderBalance = 0; orderPayment = 300000;
    fundingType = product1.p_fundingType;
  }
  const results1 = checkCompliance(authLevel, orderBalance, orderPayment, fundingType);
  console.log('choice:', choice, ', results1:', results1, ', typeof', typeof results1);
  process.exit(0);
}

//yarn run testmt -f 7
const orderBalanceTotal_API = async () => {
  //const symbol = 'AOOT1905';
  const symbol = 'MYRR1701';
  const email = 'aaa@gmail.com';
  let result = await mysqlPoolQueryB(
    'SELECT SUM(o_fundCount) AS total FROM order_list WHERE o_symbol = ? AND o_email = ? AND (o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished")', [symbol, email]);
  console.log('result', result[0].total, typeof result[0].total);
  process.exit(0);
}


//-----------------------------==
//yarn run testmt -f 99
const deployAllContracts_API = async() => {
  console.log('\n--------------==inside deployAllContracts_API()');

  //---------------------==
  console.log('\n--------== about to deploy Helium Contract');
  const managementTeam = [process.env.HELIUM_ADMIN, process.env.HELIUM_CHAIRMAN, process.env.HELIUM_DIRECTOR, process.env.HELIUM_MANAGER, process.env.HELIUM_OWNER];

  const {isGoodHeliumCtrt, addrHeliumContract} = await deployHeliumContract(managementTeam);
  console.log(`\nreturned isGoodHeliumCtrt: ${isGoodHeliumCtrt}, addrHeliumContract: ${addrHeliumContract}`);

  //---------------------==
  console.log('\n--------== about to deploy Registry Contract');
  const {isGoodRegistryCtrt, addrRegistryCtrt} = await deployRegistryContract(addrHeliumContract);
  console.log(`\nreturned isGoodRegistryCtrt: ${isGoodRegistryCtrt}, addrRegistryCtrt: ${addrRegistryCtrt}`);


  //---------------------==
  console.log('\n--------== about to deploy assetbooks');
  if(assetOwnerArray.length < 10) {
    console.error('not enough assetOwnerArray length!');
    process.exit(1);
  }
  const eoaArray = assetOwnerArray.slice(0, 10);
  const {isGoodAssetbookCtrts, addrAssetBookArray} = await deployAssetbooks(eoaArray,addrHeliumContract);

  console.log(`\nreturned isGoodAssetbookCtrts: ${isGoodAssetbookCtrts}, addrAssetBookArray:`);
  addrAssetBookArray.forEach((item, idx) => {
    console.log(`addrAssetBook${idx} = "${item}";`);
  });
  const isAllGood = !(addrAssetBookArray.includes(undefined));
  console.log('isAllGood:', isAllGood);


  //---------------------==
  console.log('\n--------== about to deploy Helium Contract');
  const method = 3;
  const authLevel = 5;

  const userIDs = [];
  const userAssetbooks = [addrAssetBook1,addrAssetBook2,addrAssetBook3];
  const investorLevels = [authLevel, authLevel, authLevel];

  console.log(`\nuserIDs: ${userIDs}, \nuserAssetbooks: ${userAssetbooks}
investorLevels: ${investorLevels}`);

  const {isGoodAddAssetbooksToRegistry, results} = await addUsersToRegistryCtrt(addrRegistryCtrt, userIDs, userAssetbooks, investorLevels).catch((err) => {
    console.log('\n[Error @ addUsersToRegistryCtrt()] '+ err);
  });
  console.log('isGoodAddAssetbooksToRegistry:', isGoodAddAssetbooksToRegistry, ', results:', results);
  process.exit(0);
}

//--------------------------==Deployment
//yarn run testmt -f 53
const deployHeliumContract_API = async() => {
  console.log('\n--------------==inside deployHeliumContract_API()');
  console.log(`admin:       ${admin} \nAssetOwner0: ${AssetOwner0} \nAssetOwner1: ${AssetOwner1} \nAssetOwner2: ${AssetOwner2} \nAssetOwner3: ${AssetOwner3}`)
  const managementTeam = [process.env.HELIUM_ADMIN, process.env.HELIUM_CHAIRMAN, process.env.HELIUM_DIRECTOR, process.env.HELIUM_MANAGER, process.env.HELIUM_OWNER];
  const {isGood, addrHeliumContract} = await deployHeliumContract(managementTeam);
  console.log(`\nreturned isGood: ${isGood} \naddrHeliumContract: ${addrHeliumContract}`);
  process.exit(0);
};

//yarn run testmt -f 54
const deployRegistryContract_API = async() => {
  console.log('\n--------------==inside deployRegistryContract_API()');
  const addrHeliumContract = addrHelium;
  console.log('addrHeliumContract:', addrHeliumContract);
  const {isGood, addrRegistryCtrt} = await deployRegistryContract(addrHeliumContract);
  console.log(`\nreturned isGood: ${isGood} \naddrRegistryCtrt: ${addrRegistryCtrt}`);
  process.exit(0);
};

//yarn run testmt -f 55
const deployProductManagerContract_API = async() => {
  console.log('\n--------------==inside deployProductManagerContract_API()');
  const addrHeliumContract = addrHelium;
  console.log('addrHeliumContract:', addrHeliumContract);
  const {isGood, addrProductManager} = await deployProductManagerContract(addrHeliumContract).catch((err) => {
    console.log('\n[Error]'+ err);
  });
  console.log(`result_deployment: ${isGood} \naddrProductManager: ${addrProductManager}`);
  process.exit(0);
};


//yarn run testmt -f 56
const deployAssetbookContracts_API = async() => {
  console.log('\n--------------==inside deployAssetbookContracts_API()');
  const choice = 1;//1: normal, 2 for specific addresses, 3 for just one
  let eoaArray, eoapkArray;
  const addrHeliumContract = addrHelium;

  if(assetOwnerArray.length < 10) {
    console.error('not enough assetOwnerArray length!');
    process.exit(1);
  }

  if(choice === 1){
    eoaArray = assetOwnerArray.slice(0, assetbookAmount);

  } else if(choice === 2){
    const eoa1 = '0x19ab366e28a53db44bda156a3cbf055c4a807244';
    const eoa1pk = '0xef33e5ae9441ad643fe0194e0e96505fa66646aefe25be8dbca208df800ea701';
    const eoa2 = '0x82f1063f316bd260b222764b8b3ccb74cb59b6eb';
    const eoa2pk = '0xc038bd499de1d5ca13390ce4573cfade55cdd79e835b091190f26decaa03d813';
    const eoa3 = '0xbb257ad047b2ee2544ca56b1a7915e2ae218c997';
    const eoa3pk = '0x81b93a442e5f03011d7baa8a8641ec8deb8d188e442d76f980c7e9c6ad2180de';
    const eoa4 = '0x92832a12a6526de8663988569aecd9d6071b4306';
    const eoa4pk = '0x7bfd108fab791991e9848dd1f3305f460d6063cef9c0d7097deb2fee117bd38e';
    eoaArray = [eoa1, eoa2, eoa3, eoa4];
    eoapkArray = [eoa1pk, eoa2pk, eoa3pk, eoa4pk];

  } else {
    const assetownerOne = assetOwnerArray[0];
    if(assetownerOne.trim().length === 0) {
      console.log('assetownerOne cannot be empty');
      process.exit(0);
    }
    eoaArray = [assetownerOne];
  }
  const {isGood, addrAssetBookArray} = await deployAssetbooks(eoaArray,addrHeliumContract);

  console.log(`\nreturned isGood: ${isGood}, addrAssetBookArray:`);
  addrAssetBookArray.forEach((item, idx) => {
    console.log(`EOA_${idx}: ${eoaArray[idx]} \naddrAssetBook${idx} = ${item}`);
  });
  console.log('\n');
  addrAssetBookArray.forEach((item, idx) => {
    console.log(`${item}`);
  })

  const isAllGood = !(addrAssetBookArray.includes(undefined));
  console.log('\nisAllGood:', isAllGood);

  /*
  var file = fs.createWriteStream('./test_CI/Assetbooks.csv');
  file.on('error', function(err) {
    console.log('[Error @ writing into Assetbooks.csv:', err);
  });

  addrAssetBookArray.forEach(function(v) { file.write(v + '\n'); });
  file.end();
  */
  /*fs.writeFile("./ethereum/contracts/Assetbooks.csv", JSON.stringify(addrAssetBookArray), function(err){
    if(err){
      console.error(err);
    }
    else
      console.log("success");
  });  */
  process.exit(0);
};

//yarn run testmt -f 57
const addUsersIntoDB_API = async() => {
  console.log('\n-------------==inside addUsersIntoDB_API');
  const userArrayPartial = userArray.slice(0, assetbookAmount);
  const result = await addUsersIntoDB(userArrayPartial).catch((err) => {
    console.log('\n[Error @ addUsersIntoDB()] '+ err);
  });
  console.log('result:', result);
  process.exit(0);
};

//yarn run testmt -f 58
const addUserOneIntoDB_API = async() => {
  console.log('\n-------------==inside addUserOneIntoDB_API');
  const user = {};
  const result = await addUsersIntoDB(user).catch((err) => {
    console.log('\n[Error @ addUsersIntoDB()] '+ err);
  });
  console.log('result:', result);
  process.exit(0);
};

//yarn run testmt -f 59
const addUsersToRegistryCtrt_API = async() => {
  console.log('\n-------------==inside addUsersToRegistryCtrt_API');
  let userIDs, userAssetbooks, investorLevels;

  const method = 4;
  const authLevel = 5;
  const registryContractAddr = addrRegistry;

  if(method === 1){
    const assetbookChoice = 10;
    userIDs = ["A500000010"];
    userAssetbooks = [assetbookArray[assetbookChoice]];
    investorLevels = [authLevel];

  } else if(method === 2) {
    userIDs = ["A500000003"];
    userAssetbooks = [addrAssetBook3];
    investorLevels = [authLevel];

  } else if(method === 3) {
    userIDs = ['A500000021', 'A500000022', 'A500000023'];

    userAssetbooks = [addrAssetBook1, addrAssetBook2, addrAssetBook3];
    investorLevels = [authLevel, authLevel, authLevel];

  } else if(method === 4) {
    userAssetbooks = assetbookArray.slice(0, assetbookAmount);
    //console.log('assetbookArray:', assetbookArray);
    console.log('userAssetbooks:', userAssetbooks);

    userIDs = []; investorLevels = [];
    for (let i = 0; i < assetbookAmount; i++) {
      const userId = userArray[i].identityNumber;
      const userLevel = userArray[i].investorLevel;
      const userAssetbook = userAssetbooks[i];
      userIDs.push(userId);
      investorLevels.push(userLevel);
      console.log(`${userId} ${userLevel} ${userAssetbook} ${typeof userAssetbook}`);
    }
  }
  //process.exit(0);

  const {isGood, results} = await addUsersToRegistryCtrt(registryContractAddr, userIDs, userAssetbooks, investorLevels).catch((err) => {
    console.log('\n[Error @ addUsersToRegistryCtrt()] '+ err);
  });
  console.log('isGood:', isGood, ', results:', results);
  process.exit(0);
};

//yarn run testmt -f 60
const xyz_API = async () => {

}



// yarn run testmt -f 9
const addXYZ_API = async () => {
  console.log('\n--------------==inside addXYZ()');

  process.exit(0);
}

// yarn run testmt -f 10
const sequentialMintSuperP2_API = async () => {
  console.log('\n--------------==inside sequentialMintSuperP2_API()');
  const toAddressArray = [assetbookArray[0], assetbookArray[1], assetbookArray[2]];
  const amountArray = [ 20, 37, 41 ];
  const symbol = nftSymbol;
  const serverTime = TimeTokenUnlock-1;
  const pricing = 15000;

  const ar_time = serverTime;
  const singleActualIncomePayment = 0;// after minting tokens

  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const moving_ave_holding_cost = 13000;

  const acquiredCostArray = amountArray.map((item) => {
    return item * pricing;
  });
  console.log(acquiredCostArray);

  const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, singleActualIncomePayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost).catch((err) => {
    console.log('[Error @ addAssetRecordRowArray]'+ err);
    //return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, false, false, false];
  });
  console.log('emailArrayError:', emailArrayError, ', amountArrayError:', amountArrayError);

  const actualPaymentTime = serverTime;
  const payablePeriodEnd = 0;
  const result2 = await addActualPaymentTime(actualPaymentTime, symbol, payablePeriodEnd).catch((err) => {
    console.log('[Error @ addActualPaymentTime]'+ err);
    //return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError,true,false,false];
  });

  const result3 = await setFundingStateDB(symbol, 'ONM', 'na', 'na').catch((err) => {
    console('[Error @ setFundingStateDB()', err);
    return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true, false, false];
  });
  console.log('result2', result2, 'result3', result3);
  process.exit(0);
}


// yarn run testmt -f ?
const addIncomeArrangementRow_API = async () => {
  //when FMX uploads new case,the csv will be converted into a new income arrangement row
  //but in livechain testing, there is no csv. So use this fuction to generate income arrangement row
  console.log('\n--------------==addIncomeArrangementRow_API()');
  const symbol = nftSymbol;
  const ia_time = 201907170900;
  const actualPaymentTime = 0;
  const payablePeriodEnd = 0;

  const result2 = await addIncomeArrangementRow(symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome).catch((err) => {
    console.log('[Error @ addActualPaymentTime]'+ err);
    //return [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, true, false, false];
    //is_addActualPaymentTime = false;
  });
  process.exit(0);
}


//yarn run testmt -f 41
const breakdownArray_API = async () => {
  console.log('\n---------------------==breakdownArray_API()');
  const toAddress = '0x0001';
  const amount = 757;
  const maxMintAmountPerRun = 180;
  const result = await breakdownArray(toAddress, amount, maxMintAmountPerRun);
  console.log('result', result);
  process.exit(0);
}




//yarn run testmt -f 40
const preMint_API = async () => {
  console.log('\n---------------------==preMint_API()');
  const symbol = nftSymbol;//'AVEN1902';//'NCCU0723';
  let mesg= '';
  const [is_preMint, mesg_preMint, addressArray, amountArray, tokenCtrtAddr, fundingType, pricing] = await preMint(symbol).catch((err) => {
    mesg = `[Error] failed @ preMint(). err: ${err}`;
    console.error(mesg);
    return false;
  });
  console.log(`--------------==Returned values from preMint(): \nis_preMint: ${is_preMint}, mesg_preMint: ${mesg_preMint}
  \naddressArray: ${addressArray} \namountArray: ${amountArray} \ntokenCtrtAddr: ${tokenCtrtAddr}, \npricing: ${pricing}, fundingType: ${fundingType}`);

  const isNumberArray = amountArray.map((item) => {
    return typeof item === 'number';
  });
  console.log(`isNumberArray: ${isNumberArray}`);
  process.exit(0);
}

//yarn run testmt -f 44
const getPastScheduleTimes_API = async () => {
  console.log('\n---------------------==getPastScheduleTimes_API()');
  const symbol = "ACHM0625";
  const serverTime = 201906251510;
  const pastSchedules = await getPastScheduleTimes(symbol, serverTime).catch((err) => {      console.log('getPastScheduleTimes() failed. err:'+ err);
  });
  console.log('pastSchedules:', pastSchedules);
  process.exit(0);
}

const callTestAPI = async () => {
  console.log('\n---------------------==callTestAPI()');
  //const util = require('util');
  const symbol = 'AVEN1902';//'NCCU0723';
  const config={
    proxy: {
      host: 'localhost',
      port: 3000,
    },
  }
  const url1="/Contracts/HCAT721_AssetTokenContract/"+symbol;
  const response1 = await axios.get(url1, config).catch(err => { console.log('err:',err); });
  const data1 = response1.data;
  console.log(`status: ${data1.status}, result: ${JSON.stringify(data1.result)}`);
  //util.inspect(response1)

  const url2="/Contracts/HCAT721_AssetTokenContract/test1/"+symbol;
  const body = {
    price: 15000,
    fundingType: '1'
  }
  const response2 = await axios.post(url2, body, config).catch(err => { console.log('err:',err); });
  const data2 = response2.data;
  console.log(`status: ${data2.status}, result: ${JSON.stringify(data2.result)}`);

  //process.exit(0);
}

//yarn run testmt -f 39
const getDetailsCFC_API = async() => {
  console.log('\n------------==getDetailsCFC_API');
  const [initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSDM, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM] = await getDetailsCFC(addrCrowdFunding);
  console.log(`--------------==\nreturned values: initialAssetPricingM: ${initialAssetPricingM}, maxTotalSupplyM: ${maxTotalSupplyM}, quantityGoalM: ${quantityGoalM}, CFSDM: ${CFSDM}, CFEDM: ${CFEDM}, stateDescriptionM: ${stateDescriptionM}, fundingStateM: ${fundingStateM}, remainingTokenQtyM: ${remainingTokenQtyM}, quantitySoldM: ${quantitySoldM}`);
}

//yarn run testmt -f 41
const getCrowdfundingInvestors_API = async() => {
  console.log('\n------------==getCrowdfundingInvestors_API');
  const [investorAssetBooks, investedTokenQtyArray] = await getInvestorsFromCFC(addrCrowdFunding);
  console.log(`investorAssetBooks: ${investorAssetBooks}
\ninvestedTokenQtyArray: ${investedTokenQtyArray}`);
}

/**
investedTokenQtyArray: 5072,5161,5471,5077,5223,5687,5106,5584,6111,5577
existingBalances:  4559, 4648, 4958, 4564, 5223, 5687, 5106, 5584, 6111, 5577 
*/
//yarn run testmt -f 42
const getCFC_Balances_API = async () => {
  console.log('\n---------------------==getCFC_Balances_API()');
  const symbol = nftSymbol;//'AVEN1902';
  const userAssetbooks = assetbookArray.slice(0, assetbookAmount);

  const [isGood, tokenCtrtAddr, resultMesg] = await getCtrtAddr(symbol, 'crowdfunding');
  console.log('isGood:', isGood);
  if(isGood){
    const cfQuantities = await getCFC_Balances(tokenCtrtAddr, userAssetbooks);
    console.log(`symbol: ${symbol}, cfQuantities: ${cfQuantities}`);
  }
  process.exit(0);
}

//yarn run testmt -f 43
const investTokens_API = async() => {
  console.log('\n------------==inside investTokens_API()');
  let crowdFundingAddr, tokenAddr, amountToInvest, serverTime, addrAssetbook, toAssetbookNumStr, checkPart2 = false;
  
  const inputChoice = 1;
  const functionChoice = 0;
  if(inputChoice === 0){
    crowdFundingAddr = addrCrowdFunding;
    tokenAddr = '';
    toAssetbookNumStr = 1;
    amountToInvest = 513;
    serverTime = CFSD+1;
    checkPart2 = true;

    const toAssetbookNum = parseInt(toAssetbookNumStr);
    console.log("\ntoAssetbookNum", toAssetbookNum);
    if(toAssetbookNum < 1){
      console.log('[Error] toAssetbookNumStr must be >= 1');
      reject('toAssetbookNumStr must be integer and greater than 1');
      return false;
    }
    addrAssetbook = assetbookArray[toAssetbookNum-1];

  } else if(inputChoice === 1){
    crowdFundingAddr = '0xaC7248A4672e5B99cf52C2Ade237C05EB41f9b6B';
    addrAssetbook = '0xDCAA050B47330752953875bB9363838355C07773';
    amountToInvest = 1;
    serverTime = ''+201908061426;
    tokenAddr = '';

  } else {
    crowdFundingAddr = '0x30E49ec3F04a3DAE3c111de9f5a9E38224a56d89';
    addrAssetbook = '0x78BeBa1592525403dF2B40C453054E329Ce7D5C0';
    amountToInvest = 2100;
    serverTime = ''+201908021026;
    tokenAddr = '';
  }

  if(functionChoice === 0){
    const [isInvestSuccess, txnHash] = await investTokens(crowdFundingAddr, addrAssetbook, amountToInvest, serverTime, 'manualTriggered').catch(async(err) => { 
      const result = await checkInvest(crowdFundingAddr, addrAssetbook, amountToInvest, serverTime);
      console.log('\ncheckInvest result:', result);
        console.log('\n[Error @ investTokens]', err);
        return [false, '0x0'];
    });
    console.log(`\nisInvestSuccess: ${isInvestSuccess}, txnHash: ${txnHash}`);

    if(isInvestSuccess){
      console.log(`\nGo into getInvestorsFromCFC`);
      const [investorAssetBooks, investedTokenQtyArray] = await getInvestorsFromCFC(crowdFundingAddr);
      console.log(`investorAssetBooks: ${investorAssetBooks}
investedTokenQtyArray: ${investedTokenQtyArray}`);
  
      if(checkPart2){
        const existingBalances = await getTokenBalances(assetbookArray, tokenAddr);
        console.log('existingBalances:', existingBalances);
        const [result, isAllGood] = checkTargetAmounts(existingBalances, investedTokenQtyArray);
        console.log(`result: ${result}, txnHash: ${txnHash}, isAllGood: ${isAllGood}, \ninvestorAssetBooks: ${investorAssetBooks}\ninvestedTokenQtyArray: ${investedTokenQtyArray}`);
        if(!isAllGood){
          console.log('[Warning] at least one target mint amount is lesser than its existing balance');
        }
  
      }
    } else {
      console.log('investTokens failed. isInvestSuccess:', isInvestSuccess);
    }
  } else {
    console.log(`functionChoice is out of range: ${functionChoice}`);
  }
  process.exit(0);
}

//yarn run testmt -f 44
const checkInvestTokens_API = async() => {
  console.log('\n------------==inside checkInvestTokens_API()');
  const crowdFundingAddr = addrCrowdFunding;
  const toAssetbookNum = 3;
  const amountToInvest = 513;
  const serverTime = CFSD+1;

  const addrAssetbook = assetbookArray[toAssetbookNum-1];
  const result = await checkInvest(crowdFundingAddr, addrAssetbook, amountToInvest, serverTime);
  console.log('checkInvest result', result);

}

//original:  3040,2716,3486,3388,3541,4329,3402,3628,3837,3959
//yarn run testmt -f 47
const investTokensInBatch_API = async() => {
  console.log('------------------==investTokensInBatch_API');
  const amountToInvestArray = [1015, 1216, 986, 788, 1141, 929, 1202, 1328, 1437, 1159];
  //const amountToInvestArray= [504, 716, 486, 388, 541, 429, 502, 628, 837, 459];
  const serverTime = CFSD+1;
  const totalTokensForInvestment = arraySum(amountToInvestArray);
  const [investorAssetBooksA, investedTokenQtyArrayA] = await getInvestorsFromCFC(addrCrowdFunding);
  console.log(`investorAssetBooksA: ${investorAssetBooksA}
investedTokenQtyArrayA: ${investedTokenQtyArrayA}
totalTokensForInvestment: ${totalTokensForInvestment} `);

  const result = await investTokensInBatch(addrCrowdFunding, assetbookArray, amountToInvestArray, serverTime);
  console.log('result:', result);

  const [investorAssetBooksB, investedTokenQtyArrayB] = await getInvestorsFromCFC(addrCrowdFunding);
    console.log(`\n--------==investorAssetBooksB: ${investorAssetBooksB}
investedTokenQtyArrayB: ${investedTokenQtyArrayB}`);

  if(result){
    investedTokenQtyArrayB.forEach((item,idx) => {
      console.log(`${item}, idx= ${idx}, changeInTokenQty: ${item-investedTokenQtyArrayA[idx]}`);
    });
  }
  process.exit(0);
}

//yarn run testmt -f 45
const setOpenFundingCFC_API = async() => {
  console.log('\n------------==inside setOpenFundingCFC_API()');
  const crowdFundingAddr = addrCrowdFunding;
  const serverTime = CFSD+1;
  console.log('set servertime = CFSD+1', serverTime);
  const fundingStateM = await setTimeCFC(crowdFundingAddr, serverTime);
  process.exit(0);
}

//yarn run testmt -f 46
const setCloseFundingCFC_API = async() => {
  console.log('\n------------==inside setCloseFundingCFC_API()');
  const crowdFundingAddr = addrCrowdFunding;
  const serverTime = CFED;
  console.log('set servertime = CFSD+1', serverTime);
  const fundingStateM = await setTimeCFC(crowdFundingAddr, serverTime);
  process.exit(0);
}


//yarn run testmt -f 78
const addPaidOrdersIntoDBnCFC = async() => {
  console.log('\n-------------------==inside addPaidOrdersIntoDBnCFC');
  const userIndexArray = [2, 4, 7];
  const tokenCountArray = [500, 800, 700];
  const fundCount = 150000;
  const paymentStatus = 'paid';
  const tokenSymbol =  nftSymbol;

  const result = await addArrayOrdersIntoDB(userIndexArray, tokenCountArray, fundCount, paymentStatus, tokenSymbol).catch((err) => {
    console.log('\n[Error @ addArrayOrdersIntoDB()]'+ err);
  });
  console.log('addArrayOrdersIntoDB result:', result);
  //process.exit(0);

  if(isTimeserverON){
    serverTime = await getTimeServerTime();
  } else {
    serverTime = TimeOfDeployment_HCAT;
  }
  await addAssetbooksIntoCFC(serverTime);
  process.exit(0);
}

//yarn run testmt -f 65
const investTokensToCloseCFC_API = async () => {
  console.log('\n---------------------==investTokensToCloseCFC_API()');
  const tokenSymbol =  nftSymbol;
  const totalAmountToInvest = maxTotalSupply;
  const crowdFundingAddr = addrCrowdFunding;
  const fundCount = 150000;
  const paymentStatus = 'paid';

  const [userIndexArray, tokenCountArray] = getInputArrays(10, totalAmountToInvest);
  console.log(`userIndexArray: ${userIndexArray} ... length: ${userIndexArray.length} \ntokenCountArray: ${tokenCountArray} ... length: ${tokenCountArray.length} \n`);

  let [initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSDM, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM] = await getDetailsCFC(crowdFundingAddr);
  //process.exit(0);

  const result = await addArrayOrdersIntoDB(userIndexArray, tokenCountArray, fundCount, paymentStatus, tokenSymbol).catch((err) => {
    console.log('\n[Error @ addArrayOrdersIntoDB()]'+ err);
  });
  console.log('addArrayOrdersIntoDB result:', result);

  console.log('\n-------------== add CrowdfundingCtrt');

  const isGood = await addSmartContractRow(tokenSymbol, crowdFundingAddr, '', totalAmountToInvest, '', '').catch((err) => {
    console.log('\n[Error @ addSmartContractRow()]'+ err);
  });
  console.log(`addSmartContractRow() result: isGood ${isGood}`);
  //----------------------==
  if(isTimeserverON){
    serverTime = await getTimeServerTime();
  } else {
    serverTime = TimeOfDeployment_HCAT;
  }
  console.log('isTimeserverON:', isTimeserverON, ', serverTime:', serverTime);
  //process.exit(0);
  await addAssetbooksIntoCFC(serverTime);

  [initialAssetPricingM, maxTotalSupplyM, quantityGoalM, CFSDM, CFEDM, stateDescriptionM, fundingStateM, remainingTokenQtyM, quantitySoldM] = await getDetailsCFC(crowdFundingAddr);

  console.log('end');
  process.exit(0);
  //console.log(`--------==returned values from getDetailsCFC(): \nfundingStateM: ${fundingStateM}, stateDescriptionM: ${stateDescriptionM}, remainingTokenQtyM: ${remainingTokenQtyM}, quantitySoldM: ${quantitySoldM}`);

}

//yarn run testmt -f 85
const addOrders_CFC_MintTokens_API = async () => {
  const symbol = nftSymbol;//'AVEN1902';
  const maxMintAmountPerRun = 190;
  const serverTime = await getLocalTime();
  console.log('serverTime:', serverTime);

  const [is_preMint, is_doAssetRecords, is_addActualPaymentTime, is_setFundingStateDB, is_sequentialMintSuper] = await mintSequentialPerContract(symbol, serverTime, maxMintAmountPerRun);
  console.log(`is_preMint: ${is_preMint}, is_doAssetRecords: ${is_doAssetRecords}, is_addActualPaymentTime: ${is_addActualPaymentTime}, is_setFundingStateDB: ${is_setFundingStateDB}, is_sequentialMintSuper: ${is_sequentialMintSuper}`);
  process.exit(0);
}
// console.log(`yarn run testmt -f 50 to reset symbol status`);
// process.exit(0);

//yarn run testmt -f 86
const mintSequentialPerContract_CLI_API = async () => {
  console.log('\nmintSequentialPerContract_CLI_API()');
  const symbol = nftSymbol;//'AVEN1902';
  const maxMintAmountPerRun = 190;
  const serverTime = await getLocalTime();
  console.log('serverTime:', serverTime);

  const [is_preMint, is_doAssetRecords, is_addActualPaymentTime, is_setFundingStateDB, is_sequentialMintSuper] = await mintSequentialPerContract(symbol, serverTime, maxMintAmountPerRun);
  console.log(`is_preMint: ${is_preMint}, is_doAssetRecords: ${is_doAssetRecords}, is_addActualPaymentTime: ${is_addActualPaymentTime}, is_setFundingStateDB: ${is_setFundingStateDB}, is_sequentialMintSuper: ${is_sequentialMintSuper}`);
  process.exit(0);
}


//1158,1247,1427,1619,1572,1322,1762,1888,1997,2019
//yarn run testmt -f 49
const mintSequentialPerContract_API = async () => {
  console.log('\n---------------------==mintSequentialPerContract_API()');
  //const util = require('util');
  //const nftSymbol = 'AVEN1902';//'NCCU0723';
  const config={
    proxy: {
      host: 'localhost',
      port: 3000,
    },
  }
  // const url1="/Contracts/HCAT721_AssetTokenContract/";
  // const response1 = await axios.get(url1+nftSymbol, config).catch(err => { console.log('err:',err); });
  // const data1 = response1.data;
  // console.log(`status: ${data1.status}, result: ${JSON.stringify(data1.result)}`);

  console.log('nftSymbol:', nftSymbol);
  const url2='/Contracts/HCAT721_AssetTokenContract/'+nftSymbol+'/mintSequentialPerContract';
  const body = { /* xyz: 100, price: 15000, fundingType: '2' */};
  const response2 = await axios.post(url2, body, config).catch(err => { 
    console.log('err:',err);
    process.exit(0);
  });
  const data2 = response2.data;
  console.log(`success: ${data2.success}
result: ${JSON.stringify(data2.result)}`);
  //process.exit(0);
}// to invest in CFC: see livechain.js: yarn run livechain -c 1 --f 8 -s 4 -t 1 -a 4334

const sequentialMintSuperAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperAPI()');
  let amountArray, toAddressArray;
  const choice = 7;
  if(choice === 1){
    amountArray = [20, 37, 41];//98
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];
  } else if(choice === 2){
    amountArray = [180, 370, 27];//5083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 3){
    amountArray = [1000, 1900, 2183];//5083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 4){
    amountArray = [2000, 3900, 4183];//10083
    toAddressArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];

  } else if(choice === 5){
    amountArray = [69, 77, 81, 99, 104, 113, 128, 139, 147, 156];//1169
    toAddressArray = [...assetbookArray];

  } else if(choice === 6){
    amountArray = [1231, 1776, 1974, 2025, 2038, 2386, 2731, 3132, 3416, 3612];//24321
    toAddressArray = [...assetbookArray];

  } else if(choice === 7){
                //[ 1737, 1926, 2206, 2498, 2551, 2349, 2889, 3115, 3324, 3446 ]
    amountArray = [2212, 2424, 2868, 2992,  3247, 3391, 3479, 3746, 3952, 3855 ];//24321
    toAddressArray = [...assetbookArray];

  }
  // yarn run livechain -c 1 --f 31 for balances


  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const pricing = 15000;
  const maxMintAmountPerRun = 190;

  const serverTime = TimeTokenUnlock-1;//201906271000;//297
  //from blockchain.js
  const [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError, is_addAssetRecordRowArray, is_addActualPaymentTime, is_setFundingStateDB] = await sequentialMintSuper(toAddressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime, nftSymbol).catch((err) => {
    console.log('[Error @ sequentialMintSuper]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);

  if (isFailed || isFailed === undefined || isFailed === null) {
    mesg = '[Failed] Some/All minting actions have failed. Check isCorrectAmountArray!';
    console.log('\n'+mesg);

  } else if(!is_addAssetRecordRowArray) {
    mesg = '[Token minting Successful but addAssetRecordRowArray() Failed]';
    console.log('\n'+mesg);

  } else if (emailArrayError.length > 0 || amountArrayError.length > 0) {
    mesg = `[Error] Token minting is successful, but addAssetRecordRowArray() returned emailArrayError and/or amountArrayError.\nemailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`;  
    console.log('\n'+mesg);

  } else if(!is_addActualPaymentTime) {
    mesg = '[Token minting Successful but addActualPaymentTime() Failed]';
    console.log('\n'+mesg);

  } else if(!is_setFundingStateDB) {
    mesg = '[Token minting Successful but setFundingStateDB() Failed]';
    console.log('\n'+mesg);

  } else {
    mesg = '[Success] All token minting, addAssetRecordRowArray(), addActualPaymentTime(), and setFundingStateDB() have been completed successfully';
    console.log('\n'+mesg);
  }

  /*
  ownerCindexM = await instHCAT721.methods.ownerCindex().call();
  console.log('\nownerCindexM', ownerCindexM);

  const ownerAddrArray = await instHCAT721.methods.getOwnersByOwnerIndex(0, 0).call();
  console.log('\nownerAddrArray', ownerAddrArray);

  await asyncForEach(toAddressArray, async (_to, index) => {
    isOwnerAdded = await instHCAT721.methods.isOwnerAdded(_to).call();
    console.log('\nisOwnerAdded', isOwnerAdded);
    if (isOwnerAdded === true) {
      console.log(`This assetbook has been added into ownerAddrList: ${_to}`);
    } else {
      console.log(`This assetbook has NOT been added into ownerAddrList: ${_to}`);
      process.exit(1);
    }
    // idxToOwnerM = await instHCAT721.methods.idxToOwner(1).call();
    // console.log('\nidxToOwnerM', idxToOwnerM);
    // checkeq(idxToOwnerM, _to);
  });*/

  process.exit(0);
}

const sequentialMintSuperNoMintAPI = async () => {
  console.log('\n-----------------------==sequentialMintSuperNoMintAPI()');
  const toAddressArray =[addrAssetBook1, addrAssetBook2, addrAssetBook3];
  const amountArray = [236, 312, 407];//236, 312 ... prev 250, 270, 0
  const tokenCtrtAddr = addrHCAT721;
  const fundingType = 2;//PO: 1, PP: 2
  const pricing = 20000;

  //from blockchain.js
  const [isFailed, isCorrectAmountArray] = await sequentialMintSuperNoMint(toAddressArray, amountArray, tokenCtrtAddr, fundingType, pricing).catch((err) => {
    console.log('[Error @ sequentialMintSuperNoMint]', err);
  });
  console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);
  process.exit(0);
}



//yarn run testmt -f 50
const resetAfterMintToken_API = async () => {
  console.log('-----------------== resetAfterMintToken_API()')
  const result3 = await setFundingStateDB(nftSymbol, 'FundingClosed', 'na', 'na').catch((err) => {
    mesg = '[Error @ setFundingStateDB()] '+ err;
    console(mesg);
  });
  console.log('result3', result3);
  process.exit(0);
}


//yarn run testmt -f 51
const writeFileToTxtFile_API = async () => {
  console.log('\n---------------------==writeFileToTxtFile_API()');
  let logContent;
  let date = new Date().myFormat();
  //console.log('--------------==\n',date.slice(0, 4), 'year', date.slice(4, 6), 'month', date.slice(6, 8), 'day', date.slice(8, 10), 'hour', date.slice(10, 12), 'minute');
  logContent = date+' add these data!!!';

  fs.writeFile(path.resolve(__dirname, '.', 'mintToken.txt'), logContent, function (err) {
      if (err) console.error(`[Error @ timeserverSource] failed at writing to date.txt`);
  });

  logContent = ' ... Hey, dont forget about me';
  fs.writeFile(path.resolve(__dirname, '.', 'mintToken.txt'), logContent, function (err) {
    if (err) console.error(`[Error @ timeserverSource] failed at writing to date.txt`);
  });
}

//yarn run testmt -f 52
const writeStreamToTxtFile_API = async () => {
  //Non-blocking, writing bits and pieces, not writing the whole file at once
  console.log('\n---------------------==writeStreamToTxtFile_API()');
  let logContent;
  let date = new Date().myFormat();
  const filePath = path.resolve(__dirname, '.', 'zmintToken.txt')

  var stream = fs.createWriteStream(filePath);
  stream.once('open', function(fd) {
    logContent = date+' add these data!!!\n';
    stream.write(logContent);

    logContent = ' ... Hey, dont forget about me\n';
    stream.write(logContent);

    logContent = ' ... Cool man. Super!\n';
    stream.write(logContent);

    stream.end();
  });
}

//----------------------------==Deploy contracts

//yarn run testmt -f 61
const deployCrowdfundingContract_API = async () => {
  console.log('\n---------------------==deployCrowdfundingContract_API()');
  let acCFSD, acCFED, acTimeOfDeployment_CF;
  if(timeChoice === 1){
    acTimeOfDeployment_CF = await getLocalTime();
    acCFSD = acTimeOfDeployment_CF+1;
    acCFED = acTimeOfDeployment_CF+1000000;//1 month to buy...
  } else {
    acTimeOfDeployment_CF = TimeOfDeployment_CF;
    acCFSD = CFSD;
    acCFED = CFED;
  }
  
  console.log(`nftSymbol: ${nftSymbol}, initialAssetPricing: ${initialAssetPricing}, pricingCurrency: ${pricingCurrency}, maxTotalSupply: ${maxTotalSupply} \nacTimeOfDeployment_CF: ${acTimeOfDeployment_CF}, acCFSD: ${acCFSD}, acCFED: ${acCFED}`);
  const argsCrowdFunding = [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, acCFSD, acCFED, acTimeOfDeployment_CF, addrHelium];

  const result_checkArguments = await checkArgumentsCFC(argsCrowdFunding);
  console.log(`result_checkArguments: ${result_checkArguments}`);

  //process.exit(0);
  if(result_checkArguments){
    console.log('result_checkArguments: true');
    if(isToDeploy){
      const {isGood, crowdFundingAddr} = await deployCrowdfundingContract(argsCrowdFunding).catch((err) => {
        console.log('\n[Error]'+ err);
      });
      console.log(`result_deployment: isGood: ${isGood} \ncrowdFundingAddr: ${crowdFundingAddr}`);
    } else {
      const crowdFundingAddr = addrCrowdFunding;
      const result = await checkDeploymentCFC(crowdFundingAddr, argsCrowdFunding);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}



//yarn run testmt -f 66
const deployTokenControllerContract_API = async () => {
  console.log('\n---------------------==deployTokenControllerContract_API()');
  let acTimeTokenUnlock, acTimeTokenValid, TimeOfDeployment_TokCtrl;

  if(timeChoice === 1){
    acTimeOfDeployment_TokCtrl = await getLocalTime();
    acTimeTokenUnlock = acTimeOfDeployment_TokCtrl+2;//2 sec to unlock
    acTimeTokenValid = acTimeOfDeployment_TokCtrl+2000000;//2 months to expire
  } else {
    acTimeTokenUnlock = TimeTokenUnlock;
    acTimeTokenValid = TimeTokenValid;
    acTimeOfDeployment_TokCtrl = TimeOfDeployment_TokCtrl;
  }
  const argsTokenController = [acTimeOfDeployment_TokCtrl, acTimeTokenUnlock,acTimeTokenValid, addrHelium ];
  console.log(`acTimeOfDeployment_TokCtrl: ${acTimeOfDeployment_TokCtrl}, acTimeTokenUnlock: ${acTimeTokenUnlock}, acTimeTokenValid: ${acTimeTokenValid}`);

  const result_checkArguments = await checkArgumentsTCC(argsTokenController);
  console.log(`result_checkArguments: ${result_checkArguments}`);

  if(result_checkArguments){
    console.log('result_checkArguments: true');
    //process.exit(0);
    if(isToDeploy){
      const {isGood, tokenControllerAddr} = await deployTokenControllerContract(argsTokenController).catch((err) => {
        console.log('\n[Error]'+ err);
      });
      console.log(`result_deployment: isGood: ${isGood} \ntokenControllerAddr: ${tokenControllerAddr}`);
    } else {
      const tokenControllerAddr = addrTokenController;
      const result = await checkDeploymentTCC(tokenControllerAddr, argsTokenController);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}

//yarn run testmt -f 67
const deployHCATContract_API = async () => {
  console.log('\n---------------------==deployHCATContract_API()');
  let acTimeOfDeployment_HCAT;

  if(timeChoice === 1){
    acTimeOfDeployment_HCAT = await getLocalTime();
  } else {
    acTimeOfDeployment_HCAT = TimeOfDeployment_HCAT;
  }
  const nftName_bytes32 = await fromAsciiToBytes32(nftName);
  const nftSymbol_bytes32 = await fromAsciiToBytes32(nftSymbol);
  const pricingCurrency_bytes32 = await fromAsciiToBytes32(pricingCurrency);
  const tokenURI_bytes32 = await fromAsciiToBytes32(tokenURI);
  
  const argsHCAT721 = [
  nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
  initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
  addrRegistry, addrProductManager, addrTokenController, tokenURI_bytes32, addrHelium, acTimeOfDeployment_HCAT];
  console.log(`nftName: ${nftName}, nftSymbol: ${nftSymbol}, siteSizeInKW: ${siteSizeInKW}, maxTotalSupply: ${maxTotalSupply} \ninitialAssetPricing: ${initialAssetPricing}, pricingCurrency: ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}, tokenURI: ${tokenURI}`);

  const result_checkArguments = await checkArgumentsHCAT(argsHCAT721);
  console.log(`result_checkArguments: ${result_checkArguments}`);

  if(result_checkArguments){
    console.log('result_checkArguments is true');
    //process.exit(0);
    if(isToDeploy){
      const {isGood, HCAT_Addr} = await deployHCATContract(argsHCAT721).catch((err) => { console.log('\n[Error]'+ err); });
      console.log(`result_deployment: isGood: ${isGood} \nHCAT_Addr: ${HCAT_Addr}`);
    
    } else {
      const HCAT_Addr = addrHCAT721;
      console.log('HCAT_Addr:', HCAT_Addr);
      const result = await checkDeploymentHCAT(HCAT_Addr, argsHCAT721);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}

//yarn run testmt -f 69
const deployIncomeManagerContract_API = async () => {
  console.log('\n---------------------==deployIncomeManagerContract_API()');
  let acTimeOfDeployment_IM;
  if(timeChoice === 1){
    acTimeOfDeployment_IM = await getLocalTime();
  } else {
    acTimeOfDeployment_IM = TimeOfDeployment_IM;
  }
  const argsIncomeManager =[addrHCAT721, addrHelium, acTimeOfDeployment_IM];
  console.log(`TimeOfDeployment_IM: ${acTimeOfDeployment_IM} \naddrHCAT721: ${addrHCAT721} \naddrHelium: ${addrHelium}`);

  const result_checkArguments = await checkArgumentsIncomeManager(argsIncomeManager);
  console.log(`result_checkArguments: ${result_checkArguments}`);

  if(result_checkArguments){
    console.log('result_checkArguments: true');
    //process.exit(0);
    if(isToDeploy){
      const {isGood, IncomeManager_Addr} = await deployIncomeManagerContract(argsIncomeManager).catch((err) => {
        console.log('\n[Error]'+ err);
      });
      console.log(`result_deployment: ${isGood} \nIncomeManager_Addr: ${IncomeManager_Addr}`);
      
    } else {
      const IncomeManager_Addr = addrIncomeManager;
      const result = await checkDeploymentIncomeManager(IncomeManager_Addr, argsIncomeManager);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}



//yarn run testmt -f 72
const addProductRowFromSymbol_API = async() => {
  console.log('\n-------------==inside addProductRowFromSymbol_API()');
  const tokenSymbol = nftSymbol
  const tokenName   = nftName
  const fundingType = '2';//fundingType: 1 Public, 2 Private
  const pricingCurrency = 'NTD';//pricingCurrency
  const fundmanagerIn = 'Company_FundManagerN';
  const TimeReleaseDateIn = 201910021620;// 201909141234 < x < 201908191835

  const result = await addProductRowFromSymbol(tokenSymbol, tokenName, location, duration, fundingType, pricingCurrency, fundmanagerIn, TimeReleaseDateIn);
  console.log('------------------==\nresult:', result);
  process.exit(0);
}

//yarn run testmt -f 80
const getAllSmartContractAddrs_API = async() => {
  console.log('\n-------------==inside getAllSmartContractAddrs_API()');
  const tokenSymbol = 'AVEN1902';
  const [crowdFundingAddr, tokenControllerAddr, hcatAddr, incomeManagerAddr] = await getAllSmartContractAddrs(tokenSymbol);
  console.log(`crowdFundingAddr: ${crowdFundingAddr}, tokenControllerAddr: ${tokenControllerAddr}, hcatAddr: ${hcatAddr}, incomeManagerAddr: ${incomeManagerAddr}`);

  process.exit(0);
}

//yarn run testmt -f 70
const add3SmartContractsBySymbol_API = async() => {
  console.log('\n-------------==inside add3SmartContractsBySymbol_API');
  console.log(`nftSymbol ${nftSymbol} \naddrHCAT721: ${addrHCAT721} \naddrIncomeManager: ${addrIncomeManager} \naddrTokenController: ${addrTokenController}`);

  const isGood = await add3SmartContractsBySymbol(nftSymbol, addrHCAT721, addrIncomeManager, addrTokenController).catch((err) => {
    console.log('\n[Error @ add3SmartContractsBySymbol()]'+ err);
  });
  console.log(`add3SmartContractsBySymbol() result: isGood ${isGood}`);
  process.exit(0);
}

//yarn run testmt -f 71
const addIncomeArrangementRows_API = async() => {
  const iaArray = incomeArrangementArray;
  const resultArray = await addIncomeArrangementRows(iaArray).catch((err) => {
    console.log('\n[Error @ addIncomeArrangementRows()]'+ err);
  });
  console.log('resultArray:', resultArray);
  if(resultArray.includes(false)){
    console.log(`\n[Error] Some/All addIncomeArrangementRows() failed`);
  } else {
    console.log(`\n[Success] All addIncomeArrangementRows() have succeeded`);
  }
  process.exit(0);
}

//yarn run testmt -f 75
const addUserArrayOrdersIntoDB_API = async() => {
  console.log('\n-------------------==inside addUserArrayOrdersIntoDB_API');
  const fundCount = 150000;
  const paymentStatus = 'waiting';
  const tokenSymbol =  nftSymbol;
  const result = await addUserArrayOrdersIntoDB(userArray, fundCount, paymentStatus, tokenSymbol).catch((err) => {
    console.log('\n[Error @ addUserArrayOrdersIntoDB()]'+ err);
  });
  console.log('addUserArrayOrdersIntoDB result:', result);
  process.exit(0);
}

//yarn run testmt -f 76
const addOrderIntoDB_API = async() => {
  console.log('\n-------------------==inside addOrderIntoDB_API');
  const userIndex = 1;
  const fundCount = 150000;
  const paymentStatus = 'waiting';
  const tokenSymbol =  nftSymbol;

  const user = userArray[userIndex];
  const identityNumber = user.identityNumber;
  const email = user.email;
  const tokenCount = user.tokenOrderAmount;
  const result = await addOrderIntoDB(identityNumber, email, tokenCount, fundCount, paymentStatus, tokenSymbol).catch((err) => {
    console.log('\n[Error @ addOrderIntoDB()]'+ err);
  });
  console.log('addOrderIntoDB result:', result);
  process.exit(0);
}


//yarn run testmt -f 77
const addArrayOrdersIntoDB_API = async() => {
  console.log('\n-------------------==inside addArrayOrdersIntoDB_API');
  const userIndexArray = [1, 2, 3];
  const tokenCountArray = [10, 17, 29];
  const fundCount = 150000;
  const paymentStatus = 'waiting';
  const tokenSymbol =  nftSymbol;

  const result = await addArrayOrdersIntoDB(userIndexArray, tokenCountArray, fundCount, paymentStatus, tokenSymbol).catch((err) => {
    console.log('\n[Error @ addArrayOrdersIntoDB()]'+ err);
  });
  console.log('addArrayOrdersIntoDB result:', result);
  process.exit(0);
}



//yarn run testmt -f 788
const addAssetbooksIntoCFC_API = async() => {
  console.log('\n-------------------==inside addPaidOrdersIntoDBnCFC');
  if(isTimeserverON){
    serverTime = await getTimeServerTime();
  } else {
    serverTime = TimeOfDeployment_HCAT;
  }
  await addAssetbooksIntoCFC(serverTime);
  process.exit(0);
}

//yarn run testmt -f 79
const getTokenContractDetails_API = async() => {
  console.log('\n---------------------== getTokenContractDetails_API()');
  const actionType = 'hcat721';
  const [isGood, targetAddr, resultMesg] = await getCtrtAddr(nftSymbol, actionType).catch((err) => {
    console.log('[Error @getCtrtAddr]:'+ err);
    return false;
  });
  console.log(`\n${resultMesg}. actionType: ${actionType}, targetAddr: ${targetAddr}`);
  if(isGood){
    const result = await getTokenContractDetails(targetAddr);
    console.log('returned values:', result);
  } else {
    console.log('isGood is false...');
  }
  process.exit(0);
}

//yarn run testmt -f 82
const setTokenController_API = async() => {
  console.log('\n---------------------== setTokenController_API()');
  const symbol = nftSymbol;//'AVEN1902';
  const [isGood, tokenControllerCtrtAddr, resultMesg] = await getCtrtAddr(symbol, 'tokencontroller');
  if(isGood){
    const result = await setTokenController(tokenControllerCtrtAddr);
    console.log('result:', result);
  }
  process.exit(0);
}


//yarn run testmt -f 83
const getTokenBalances_API = async () => {
  console.log('\n---------------------==getTokenBalances_API()');
  const symbol = nftSymbol;//'AVEN1902';
  const assetbooks = assetOwnerArray.slice(0, assetbookAmount);

  const [isGood, tokenCtrtAddr, resultMesg] = await getCtrtAddr(symbol, 'hcat721');
  if(isGood){
    const existingBalances = await getTokenBalances(tokenCtrtAddr, assetbooks);
    console.log('existingBalances:', existingBalances);
  }
  process.exit(0);
}


//------------------------------==
//yarn run testmt -f 120
const checkSafeTransferFromBatchFunction_API = async () => {
  console.log('\n---------------------==checkSafeTransferFromBatchFunction_API()');
  // const assetIndex
  // const result1 = await checkSafeTransferFromBatchFunction(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime);
  // console.log(result1);
  process.exit(0);
}

//yarn run testmt -f 121 3 2 12
const transferTokens_API = async () => {
  console.log('\n---------------------==transferTokens_API()');
  const addrHCAT721 = '0xAC113edBef8F2692f5870F08db8AF3546d104bd9';
  const fromAssetbookIndexStr = argv4;
  const toAssetbookIndexStr = argv5;
  const amountStr = argv6;
  const priceStr = 15000;
  console.log(`fromAssetbookIndexStr: ${argv4}, toAssetbookIndexStr: ${argv5}, amountStr: ${argv6}`);
  //process.exit(0);

  const userIdArray = [];
  const investorLevelArray = [];
  const assetbookArray = [];

  const userArrayPartial = userArray.slice(0, assetbookAmount);
  userArrayPartial.forEach((user, idx) => {
    userIdArray.push(user.identityNumber);
    investorLevelArray.push(user.investorLevel);
    assetbookArray.push(user.addrAssetBook);
  });

  const fromAssetbookIndex = parseInt(fromAssetbookIndexStr);
  const toAssetbookIndex   = parseInt(toAssetbookIndexStr);
  const amount = parseInt(amountStr);
  const price  = parseInt(priceStr);

  if (fromAssetbookIndex === undefined || toAssetbookIndex === undefined || amount === undefined || price === undefined) {
    console.log('fromAssetbookIndex, toAssetbookIndex, amount, or price is undefined');
    process.exit(1);

  } else if(fromAssetbookIndex > assetbookAmount || toAssetbookIndex > assetbookAmount){
    console.log('fromAssetbookIndex or toAssetbookIndex should not be > assetbookAmount'); process.exit(0);

  } else if (isIntAboveOne(fromAssetbookIndex) && isIntAboveOne(toAssetbookIndex) && isIntAboveOne(amount) && isIntAboveOne(price) ){
    console.log('input values check1 passed');

    const fromAssetbook = assetbookArray[fromAssetbookIndex];
    const toAssetbook = assetbookArray[toAssetbookIndex];
    const _fromAssetOwner = assetOwnerArray[fromAssetbookIndex];
    const _fromAssetOwnerpkRaw = assetOwnerpkRawArray[fromAssetbookIndex];
  
    console.log(`_fromAssetOwner: ${_fromAssetOwner}, 
    _fromAssetOwnerpkRaw: ${_fromAssetOwnerpkRaw} \naddrHCAT721: ${addrHCAT721} \namount: ${amount}, price: ${price}`);
  
    const result = await transferTokens(addrHCAT721, fromAssetbook, toAssetbook, amount, price, _fromAssetOwner, _fromAssetOwnerpkRaw).catch((err) => {
      console.log('[Error @ transferTokens()]'+ err);
      return false;
    });
    console.log(`result of transferTokens: ${result}`)
  
  }
  process.exit(0);
}



//------------------------------==
//------------------------------==
//yarn run testmt -f 99
const intergrationTestOfRegistry = async() => {
  let addrAssetbook;
  let assetOwner, userID;
  const _deployAssetbookContracts_API = async() => {
    console.log('\n--------------==inside deployAssetbookContracts_API()');
    const Web3 = require('web3');
    let web3 = new Web3()
    let eoaArray, addrHeliumContract, randomAccount;
      randomAccount = web3.eth.accounts.create()
      assetOwner = randomAccount.address;
      eoaArray = [randomAccount.address];
      addrHeliumContract = addrHelium;
   
    const {isGood, addrAssetBookArray} = await deployAssetbooks(eoaArray, addrHeliumContract).catch((err) => {
      console.log(err)
      process.exit(1)
    });
  
    console.log(`\nreturned isGood: ${isGood}, addrAssetBookArray:`);
    addrAssetbook = addrAssetBookArray[0];
    console.log(addrAssetbook);
    const isAllGood = !(addrAssetBookArray.includes(undefined));
    console.log('isAllGood:', isAllGood);
  };
  const _addUsersIntoDB_API = async() => {
    console.log('\n-------------==inside addUsersIntoDB_API');
    console.log(addrAssetbook);
    let hold = addrAssetbook;
    var faker = require('faker');
    userID = 'T' + faker.random.number(999999999)
    let user = await new userObject(faker.internet.email(), faker.random.words(), userID, assetOwner, "09" + faker.random.number(9999999), faker.name.firstName(), hold, 5, 0);

    const result = await addUsersIntoDB([user]).catch((err) => {
      console.log('\n[Error @ addUsersIntoDB()] '+ err);
      process.exit(1);
    });
    console.log('result:', result);
  };
  const _addUsersToRegistryCtrt_API = async() => {
    console.log('\n-------------==inside addUsersToRegistryCtrt_API');
    const registryContractAddr = addrRegistry;
    let userIDs = [userID];
    let userAssetbooks = [addrAssetbook];
    let investorLevels = [5];
    console.log(`\nuserIDs: ${userIDs}, \nuserAssetbooks: ${userAssetbooks}
  investorLevels: ${investorLevels}`);
  
    const {isGood, results} = await addUsersToRegistryCtrt(registryContractAddr, userIDs, userAssetbooks, investorLevels).catch((err) => {
      console.log('\n[Error @ addUsersToRegistryCtrt()] '+ err);
      process.exit(1);

    });
    console.log('isGood:', isGood, ', results:', results);
  };
  await _deployAssetbookContracts_API();
  await _addUsersIntoDB_API();
  await _addUsersToRegistryCtrt_API();
  process.exit(0)
}

//yarn run testmt -f 100
const intergrationTestOfProduct = async() => {
  function paddingLeft(str,lenght){
    if(str.length >= lenght)
      return str;
    else
      return paddingLeft("0" +str,lenght);
  }
  
  function nowDateAddMinites(min){
     nowDate.setTime(nowDate.setMinutes(nowDate.getMinutes() + min))
    return nowDate.getFullYear() + paddingLeft(String(nowDate.getMonth()+1), 2) + paddingLeft(String(nowDate.getDate()), 2) + paddingLeft(String(nowDate.getHours()), 2) + paddingLeft(String(nowDate.getMinutes()), 2)
  
  }
  let crowdFundingAddr, tokenControllerAddr, hcatAddr, incomeManagerAddr, acTimeTokenUnlock, acTimeTokenValid;
  let acCFSD, acCFED, acTimeOfDeployment_CF;
  let output = '';
  let nowTime = 201910010800;
  var originalStderrWrite = process.stderr.write.bind(process.stderr);
  
  process.stderr.write = async (chunk, encoding, callback) => {
    if (typeof chunk === 'string') {
      output += chunk;
    }
  
    return await originalStderrWrite(chunk, encoding, callback);
  };
  
  const _deployCrowdfundingContract_API = async () => {
    console.log('\n---------------------==deployCrowdfundingContract_API()');
      if(timeChoice === 1){
      acTimeOfDeployment_CF = nowTime;
      acCFSD = acTimeOfDeployment_CF+1;
      acCFED = acTimeOfDeployment_CF+1000000;//1 month to buy...
    } else {
      acTimeOfDeployment_CF = TimeOfDeployment_CF;
      acCFSD = CFSD;
      acCFED = CFED;
    }
    acTimeOfDeployment_CF = nowTime;
    acCFSD = nowTime + 1;
    acCFED = nowTime + 10;

    console.log(`nftSymbol: ${nftSymbol}, initialAssetPricing: ${initialAssetPricing}, pricingCurrency: ${pricingCurrency}, maxTotalSupply: ${maxTotalSupply} \nacTimeOfDeployment_CF: ${acTimeOfDeployment_CF}, acCFSD: ${acCFSD}, acCFED: ${acCFED}`);
    const argsCrowdFunding = [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, acCFSD, acCFED, acTimeOfDeployment_CF, addrHelium];
  
    const result_checkArguments = await checkArgumentsCFC(argsCrowdFunding);
    console.log(`result_checkArguments: ${result_checkArguments}`);

    if(result_checkArguments){
      console.log('result_checkArguments: true');
      if(isToDeploy){
        const result_deployment = await deployCrowdfundingContract(argsCrowdFunding).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result_deployment: ${result_deployment}`);
        crowdFundingAddr = result_deployment.crowdFundingAddr

      } else {
        const crowdFundingAddr = '0xF811f727da052379D8cbfBF1188E290B32ff9f99';
        const result = await checkDeploymentCFC(crowdFundingAddr, argsCrowdFunding).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result: ${result}`);

      }
    } else {
      console.error(`not to deploy due to incorrect argument values`);
      process.exit(1)
    }
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }

  const _deployTokenControllerContract_API = async () => {
    console.log('\n---------------------==deployTokenControllerContract_API()');
    let TimeOfDeployment_TokCtrl;
  
      if(timeChoice === 1){
      acTimeOfDeployment_TokCtrl = nowTime;
      //if time is YYYYMMDDHH59
      if(acTimeOfDeployment_TokCtrl % 100 == 59){
        acTimeOfDeployment_TokCtrl += 40
      }
      acTimeTokenUnlock = acTimeOfDeployment_TokCtrl+1;
      acTimeTokenValid = acTimeOfDeployment_TokCtrl+2000001;//2 months to expire
    } else {
      acTimeTokenUnlock = TimeTokenUnlock;
      acTimeTokenValid = TimeTokenValid;
      acTimeOfDeployment_TokCtrl = TimeOfDeployment_TokCtrl;
    }
    const argsTokenController = [acTimeOfDeployment_TokCtrl, acTimeTokenUnlock,acTimeTokenValid, addrHelium ];
    console.log(`acTimeOfDeployment_TokCtrl: ${acTimeOfDeployment_TokCtrl}, acTimeTokenUnlock: ${acTimeTokenUnlock}, acTimeTokenValid: ${acTimeTokenValid}`);
  
    const result_checkArguments = await checkArgumentsTCC(argsTokenController);
    console.log(`result_checkArguments: ${result_checkArguments}`);
  
    if(result_checkArguments){
      console.log('result_checkArguments: true');
      //process.exit(0);
      if(isToDeploy){
        const result_deployment = await deployTokenControllerContract(argsTokenController).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result_deployment: ${result_deployment.tokenControllerAddr}`);
        tokenControllerAddr = result_deployment.tokenControllerAddr
      } else {
        const tokenControllerAddr = '0x9812d0eBcd89d8491Bca80000c147f739B9Cef73';
        const result = await checkDeploymentTCC(tokenControllerAddr, argsTokenController).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result: ${result}`);
      }
    } else {
      console.error(`not to deploy due to incorrect argument values`);
      process.exit(1)
    }
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }

  const _deployHCATContract_API = async () => {
    console.log('\n---------------------==deployHCATContract_API()');
    let acTimeOfDeployment_HCAT;
  
    if(timeChoice === 1){
      acTimeOfDeployment_HCAT = nowTime;
    } else {
      acTimeOfDeployment_HCAT = TimeOfDeployment_HCAT;
    }
    const nftName_bytes32 = await fromAsciiToBytes32(nftName);
    const nftSymbol_bytes32 = await fromAsciiToBytes32(nftSymbol);
    const pricingCurrency_bytes32 = await fromAsciiToBytes32(pricingCurrency);
    const tokenURI_bytes32 = await fromAsciiToBytes32(tokenURI);
    
    const argsHCAT721 = [
    nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
    addrRegistry, addrProductManager, tokenControllerAddr, tokenURI_bytes32, addrHelium, acTimeOfDeployment_HCAT];
    console.log(`nftName: ${nftName}, nftSymbol: ${nftSymbol}, siteSizeInKW: ${siteSizeInKW}, maxTotalSupply: ${maxTotalSupply} \ninitialAssetPricing: ${initialAssetPricing}, pricingCurrency: ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}, tokenURI: ${tokenURI}`);
  
    const result_checkArguments = await checkArgumentsHCAT(argsHCAT721);
    console.log(`result_checkArguments: ${result_checkArguments}`);
  
    if(result_checkArguments){
      console.log('result_checkArguments is true');
      //process.exit(0);
      if(isToDeploy){
        const result_deployment = await deployHCATContract(argsHCAT721).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result_deployment: ${result_deployment.HCAT_Addr}`);
        hcatAddr = result_deployment.HCAT_Addr
      
      } else {
        const HCAT_Addr = '0x57B7c9837cFc7fC2f0510d16cc52D2F0Dc10276A';
        const result = await checkDeploymentHCAT(HCAT_Addr, argsHCAT721).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result: ${result}`);
      }
    } else {
      console.error(`not to deploy due to incorrect argument values`);
      process.exit(1)
    }
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }
  const _deployIncomeManagerContract_API = async () => {
    console.log('\n---------------------==deployIncomeManagerContract_API()');
    let acTimeOfDeployment_IM;
      if(timeChoice === 1){
      acTimeOfDeployment_IM = nowTime;
    } else {
      acTimeOfDeployment_IM = TimeOfDeployment_IM;
    }
    const argsIncomeManager =[hcatAddr, addrHelium, acTimeOfDeployment_IM];
    console.log(`TimeOfDeployment_IM: ${acTimeOfDeployment_IM} \naddrHCAT721: ${hcatAddr} \naddrHelium: ${addrHelium}`);
  
    const result_checkArguments = await checkArgumentsIncomeManager(argsIncomeManager);
    console.log(`result_checkArguments: ${result_checkArguments}`);
  
    if(result_checkArguments){
      console.log('result_checkArguments: true');
      //process.exit(0);
      if(isToDeploy){
        const result_deployment = await deployIncomeManagerContract(argsIncomeManager).catch((err) => {
          console.log(err)
          process.exit(1)
        });
        console.log(`result_deployment: ${result_deployment}`);
        incomeManagerAddr = result_deployment.IncomeManager_Addr
      } else {
        const IncomeManager_Addr = '';
        const result = await checkDeploymentIncomeManager(IncomeManager_Addr, argsIncomeManager);
        console.log(`result: ${result}`);
      }
    } else {
      console.error(`not to deploy due to incorrect argument values`);
      process.exit(1)
    }
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }
  const _addProduct = async() => {
    console.log('\n-------------==inside addProductRow section');
    const state = 'funding';
    let TimeReleaseDate;
    if(timeChoice === 1){
      TimeReleaseDate = nowTime;
    } else {
      TimeReleaseDate = TimeOfDeployment_HCAT;
    }
    console.log(`\nTimeReleaseDate: ${TimeReleaseDate}`);
    console.log(`\nsymbolNumber: ${symbolNumber}, nftSymbol: ${nftSymbol}, maxTotalSupply: ${maxTotalSupply}, initialAssetPricing: ${initialAssetPricing}, siteSizeInKW: ${siteSizeInKW}, fundingType: ${fundingType}, state: ${state}`);
    await addProductRow(nftSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, acTimeOfDeployment_TokCtrl, siteSizeInKW, maxTotalSupply, fundmanager, acCFSD, acCFED, quantityGoal, acTimeTokenUnlock, fundingType, state).catch((err) => {
      console.error('\n[Error @ addProductRow()]'+ err);
      process.exit(1)
    });
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }  

  const _addCtrt = async() => {
    console.log('\n-------------==inside addSmartContractRowAPI');
    console.log(`nftSymbol ${nftSymbol}, addrCrowdFunding: ${crowdFundingAddr}, addrHCAT721: ${hcatAddr}, maxTotalSupply: ${maxTotalSupply}, addrIncomeManager: ${incomeManagerAddr}, addrTokenController: ${tokenControllerAddr}`);
  
    await addSmartContractRow(nftSymbol, crowdFundingAddr, hcatAddr, maxTotalSupply, incomeManagerAddr, tokenControllerAddr).catch((err) => {
      console.error('\n[Error @ addSmartContractRow()]'+ err);
      process.exit(1)
    });
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  } 
  const _addIncomeArrangement = async() => {
    //time need to be fixed
    if(acTimeTokenUnlock % 100 >= 59){
      acTimeTokenUnlock += 40
    }
    const incomeArrangement1 = new incomeArrangementObject(nftSymbol, 201909100803, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);
    if(acTimeTokenUnlock % 100 >= 58){
      acTimeTokenUnlock += 40
    }
    const incomeArrangement2 = new incomeArrangementObject(nftSymbol, 201909100805, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
    if(acTimeTokenUnlock % 100 >= 58){
      acTimeTokenUnlock += 40
    }
    const incomeArrangement3 = new incomeArrangementObject(nftSymbol, 201909100807, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
    if(acTimeTokenUnlock % 100 >= 58){
      acTimeTokenUnlock += 40
    }
    const incomeArrangement4 = new incomeArrangementObject(nftSymbol, 201909100809, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
    if(acTimeTokenUnlock % 100 >= 58){
      acTimeTokenUnlock += 40
    }
    const incomeArrangement5 = new incomeArrangementObject(nftSymbol, 201909100811, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
    const incomeArrangementArray = [incomeArrangement1, incomeArrangement2, incomeArrangement3, incomeArrangement4, incomeArrangement5];
    console.log('-----------------== add Income Arrangement rows from objects...');
    const result = await addIncomeArrangementRows(incomeArrangementArray).catch((err) => {
      console.error('\n[Error @ addIncomeArrangementRows()]'+ err);
      process.exit(1)
    });
    console.log('result', result);
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }
  const _addOrders_CFC_MintTokens_API = async () => {
    const paymentStatus = 'paidTest';
    const tokenSymbol =  nftSymbol;
  
    const [userIndexArray, tokenCountArray] = getInputArrays(getRndIntegerBothEnd(1, 10), maxTotalSupply);
    console.log(`userIndexArray: ${userIndexArray}, \ntokenCountArray: ${tokenCountArray}, \n`);
  
    const result = await addArrayOrdersIntoDB(userIndexArray, tokenCountArray, initialAssetPricing, paymentStatus, tokenSymbol).catch((err) => {
      console.error('\n[Error @ addArrayOrdersIntoDB()]'+ err);
      process.exit(1);

    });
    console.log('addArrayOrdersIntoDB result:', result);
    
    let serverTime
    if(timeChoice === 1){
      serverTime = nowTime + 2;
      if(serverTime % 100 >= 60){
        serverTime += 40
      }
    } else {
      serverTime = TimeOfDeployment_HCAT;
    }
    console.log("severtime:!!!!!!!!!!!!!!!!!")
    console.log(serverTime);
    if (await addAssetbooksIntoCFC(serverTime, "paidTest") != true ){
      process.exit(1)
    }
    /*if(await addAssetbooksIntoCFC(serverTime, "paidTest") != true)
      process.exit(1)*/
    //--------------------==
    const symbol = nftSymbol;//'AVEN1902';
    const maxMintAmountPerRun = 190;
  
    const [is_preMint, is_doAssetRecords, is_addActualPaymentTime, is_setFundingStateDB, is_sequentialMintSuper] = await mintSequentialPerContract(symbol, serverTime, maxMintAmountPerRun).catch((err) => {
      console.log(err)
      process.exit(1)
    });
    console.log(`is_preMint: ${is_preMint}, is_doAssetRecords: ${is_doAssetRecords}, is_addActualPaymentTime: ${is_addActualPaymentTime}, is_setFundingStateDB: ${is_setFundingStateDB}, is_sequentialMintSuper: ${is_sequentialMintSuper}`);
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1)
    } 
  }
  const _updateTokenControllerState = async() => {
    let serverTime
    if(timeChoice === 1){
      serverTime = nowTime + 1;
      if(serverTime >= 60){
        serverTime += 40;
      }
    } else {
      serverTime = TimeOfDeployment_HCAT;
    }
    let result = await updateTokenStateTCC(tokenControllerAddr, serverTime, nftSymbol).catch(err => {
      console.error('\n[Error @ updateTokenStateTCC()]'+ err);
      process.exit(1);
    })
    process.stderr.write = originalStderrWrite;
    if(output != ''){
      process.exit(1);
    } 
  }
  const _calculateLastPeriodProfit_API = async () => {
    console.log('\n------------------==inside calculateLastPeriodProfit_API()...');
    await asyncForEach([5, 7, 9, 11], async (item, idx) => {
      
      const result0 = await addActualPaymentTime(nowTime + item, nftSymbol, idx + 1).catch((err) => {
        console.error('[Error @ addActualPaymentTime]', err);
        process.exit(1);

      })
      console.log(`result: ${result0}`);

      const result = await calculateLastPeriodProfit(nowTime + 20).catch((err) => {
        console.log('[Error @ calculateLastPeriodProfit]', err);
        process.exit(1);
      });
      console.log(`result: ${result}`);

    });
  }
  await _deployCrowdfundingContract_API();
  await _deployTokenControllerContract_API();
  await _deployHCATContract_API();
  await _deployIncomeManagerContract_API();
  await _addProduct();
  await _addCtrt();
  await _addIncomeArrangement();
  await _addOrders_CFC_MintTokens_API();
  await _updateTokenControllerState();
  await _calculateLastPeriodProfit_API();

  process.exit(0);

}



//------------------------------==
//yarn run testmt -f 91
//message queue producer(sender)
const testRabbitMQ_sender = async () => {
  const amqp = require('amqplib/callback_api');
  const request = require('request');
  request.post('http://localhost:3000/Contracts/amqpTest1', function (error, response, body) {
    if (error) {
      console.log('error', error);
      throw error;
    }
    console.log(`received response: ${response.body}
body: ${body}`);

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
        const boxName = 'amqpTest1';
        channel.assertQueue(boxName, { durable: false });
        console.log(' [*] Waiting for result in: %s. To exit press CTRL+C', boxName);
        channel.consume(boxName, msg => {
            console.log(' [x] Received result: %s', msg.content);  
            conn.close();            
        }, { noAck: true
        });
      });
    })
  });
}

//yarn run testmt -f 94
const checkTargetAmounts_API = () => {
  //const balanceArrayBefore = []; 
  const balanceArrayBefore = [ 2212, 2424, 2868, 2992, 2741, 2349, 2889, 3115, 3324, 3446 ]; 
  const targetAmounts = [ 2527, 2716, 2796, 2498, 2551, 2349, 2889, 3115, 3324, 3446 ]
  const [isGoodAmountArray, isAllGood] = checkTargetAmounts(balanceArrayBefore, targetAmounts);
  console.log('balanceArrayBefore:', balanceArrayBefore, ', targetAmounts:', targetAmounts, ', isGoodAmountArray:', isGoodAmountArray, ', isAllGood:', isAllGood);
}

//yarn run testmt -f 95
const checkAssetbookArray_API = async() => {
  console.log('\n---------------------==checkAssetbookArray_API()');
  const addressArray = [...assetbookArray, '0x5Fd93F8a4B023D837f0b04bb2836Daf535BfeFBF'];
  const checkResult = await checkAssetbookArray(addressArray).catch(async(err) => {
    console.log(`checkAssetbookArray() result: ${err}, checkAssetbookArray() failed(). \naddressArray: ${addressArray}`);
    return false;
  });
  if(checkResult.includes(false)){
    console.log(`\ncheckResult has at least one error item. \n\naddressArray: ${addressArray} \n\ncheckAssetbookArray() Result: ${checkResult}`);
    return false;
  } else {
    console.log(`all input addresses has been checked good by checkAssetbookArray \ncheckResult: ${checkResult} `);
  }
}

//yarn run testmt -f 96
const checkAssetbook_API = async() => {
  console.log('\n---------------------==checkAssetbook_API()');
  const assetbookX = '0xE902F2Ee755FAE1dB29d1Ab91eF950c7f05Ab56A';
  const checkResult = await checkAssetbook(assetbookX).catch(async(err) => {
    console.log(`checkAssetbook() failed. ${err}, assetbookX: ${assetbookX}`);
    return false;
  });

  console.log('\ncheckResult:', checkResult);
  if(checkResult.includes(false)){
    console.log(`\ncheckResult has at least one error item. \n \ncheckAssetbook() Result: ${checkResult}`);
    return false;
  } else {
    console.log(`all input addresses has been checked good by checkAssetbook \ncheckResult: ${checkResult} `);
  }
}


//yarn run testmt -f 101 MURP0904
const deleteAllRecordsBySymbolCLI_API = async() => {
  let result, tokenSymbol;
  if(argv4){
    tokenSymbol = argv4;
    console.log('tokenSymbol:', tokenSymbol);
    result = await deleteAllRecordsBySymbol(tokenSymbol);
    if(result){
      console.log(`deleteAllRecordsBySymbol result: successfully done`);
    } else {
      console.log(`deleteAllRecordsBySymbol result: not finished`);
    }
  } else {
    console.log('symbol argument is missing in the cli arguments');
  }
  process.exit(0);
}

//yarn run testmt -f 102 AVEN0829
const deleteAllRecordsBySymbol_API = async() => {
  let result, tokenSymbol;
    tokenSymbol = 'MS. 0829';
    console.log('tokenSymbol:', tokenSymbol);
    result = await deleteAllRecordsBySymbol(tokenSymbol);
    if(result){
      console.log(`deleteAllRecordsBySymbol result: successfully done`);
    } else {
      console.log(`deleteAllRecordsBySymbol result: not finished`);
    }
  process.exit(0);
}

//yarn run testmt -f 103
const deleteAllRecordsBySymbolArray_API = async() => {
    const symbolString = 'NCCU0725,NCCU0731,NCCU0805';
    const symbolArray = symbolString.split(",");
    console.log('symbolArray:', symbolArray);
    const result = await deleteAllRecordsBySymbolArray(symbolArray);
    if(result){
      console.log(`deleteAllRecordsBySymbolArray result: successfully done`);
    } else {
      console.log(`deleteAllRecordsBySymbolArray result: not finished`);
    }
  process.exit(0);
}


//yarn run testmt -f 104
const getSymbolFromCtrtAddr_API = async() => {
  console.log('\n---------------------==getSymbolFromCtrtAddr_API()');
  const ctrtAddr = '0xD24272DBF4642a2550e852BF2f802E446c919Ba0';
  const ctrtType = 'crowdfunding';
  const [isGood, symbol, resultMesg] = await getSymbolFromCtrtAddr(ctrtAddr, ctrtType);
  console.log(`\n${resultMesg}.\nisGood: ${isGood}, symbol found: ${symbol}`);
  process.exit(0);
}

//---------------------------==Delete
//yarn run testmt -f 141
const deleteProductRows_API = async () => {
  console.log('\n---------------------==deleteProductRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteProductRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 142
const deleteOrderRows_API = async () => {
  console.log('\n---------------------==deleteOrderRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteOrderRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 143
const deleteTxnInfoRows_API = async () => {
  console.log('\n---------------------==deleteTxnInfoRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteTxnInfoRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 144
const deleteSmartContractRows_API = async () => {
  console.log('\n---------------------==deleteSmartContractRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteSmartContractRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 145
const deleteIncomeArrangementRows_API = async () => {
  console.log('\n---------------------==deleteIncomeArrangementRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteIncomeArrangementRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}
//yarn run testmt -f 146
const deleteAssetRecordRows_API = async () => {
  console.log('\n---------------------==deleteAssetRecordRows_API()');
  const tokenSymbol = nftSymbol;
  const result = await deleteAssetRecordRows(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol} , result: ${result}`);
  process.exit(0);
}

//yarn run testmt -f 147
const getTxnInfoRowsBySymbol_API = async () => {
  console.log('\n---------------------==getTxnInfoRowsBySymbol_API()');
  const tokenSymbol = nftSymbol;
  const result = await getTxnInfoRowsBySymbol(tokenSymbol);
  console.log(`tokenSymbol: ${tokenSymbol}, result: ${result}`);
  process.exit(0);
}


function incomeArrangementObject(symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, assetRecordStatus, ia_state, singleCalibrationActualIncome) {
  this.symbol = symbol;
  this.ia_time = ia_time;
  this.actualPaymentTime = actualPaymentTime;
  this.payablePeriodEnd = payablePeriodEnd;
  this.annualEnd = annualEnd;
  this.wholecasePrincipalCalledBack = wholecasePrincipalCalledBack;
  this.wholecaseBookValue = wholecaseBookValue;
  this.wholecaseForecastedAnnualIncome = wholecaseForecastedAnnualIncome;
  this.wholecaseForecastedPayableIncome = wholecaseForecastedPayableIncome;
  this.wholecaseAccumulatedIncome = wholecaseAccumulatedIncome;
  this.wholecaseIncomeReceivable = wholecaseIncomeReceivable;
  this.wholecaseTheoryValue = wholecaseTheoryValue;
  this.singlePrincipalCalledBack = singlePrincipalCalledBack;
  this.singleForecastedAnnualIncome = singleForecastedAnnualIncome;
  this.singleForecastedPayableIncome = singleForecastedPayableIncome;
  this.singleActualIncomePayment = singleActualIncomePayment;
  this.singleAccumulatedIncomePaid = singleAccumulatedIncomePaid;
  this.singleTokenMarketPrice = singleTokenMarketPrice;
  this.assetRecordStatus = assetRecordStatus;
  this.ia_state = ia_state;
  this.singleCalibrationActualIncome = singleCalibrationActualIncome;
}

//yarn run testmt -f 150
const getArraysFromCSV_API = async () => {
  console.log('\n---------------------==getArraysFromCSV_API()');
  //getArraysFromCSV();
  process.exit(0);
}



//yarn run testmt -f 151
const getOneAddrPerLineFromCSV_API = async () => {
  console.log('\n---------------------==getArraysFromCSV_API()');

  const [Assetbooks, badAssetbooks ] = getOneAddrPerLineFromCSV('./ethereum/contracts/Assetbooks.csv');
  if(badAssetbooks.length > 0){
    console.warn(`good assetbooks: ${Assetbooks} \nbadAssetbooks are found: ${badAssetbooks}`);
  } else {
    console.log(`all assetbooks are complete in parts: ${Assetbooks}`);
  }
  process.exit(0);
}

const breakdownArraysAPI = () => {
  console.log('breakdownArraysAPI');
  const acc1 = "0x1"; const acc2 = "0x2";
  const acc3 = "0x3"; const acc4 = "0x4";
  const amountArray = [236, 312, 173, 1000];
  const toAddressArray =[acc1, acc2, acc3, acc4];
  console.log('\n-----------------==\namountArray', amountArray, '\ntoAddressArray', toAddressArray);

 const [amountArrayOut, toAddressArrayOut] = breakdownArrays(toAddressArray, amountArray);
 console.log('\namountArrayOut out', amountArrayOut);
 console.log('toAddressOut out', toAddressArrayOut);
}

//yarn run testmt -f 203
const extractTokenId_API = () => {

  const indexToSend = 6;//2;//7

  const array1 = [0, 0, 21, 53, 70, 14, 37, 42, 0, 0];
  console.log('array1:', array1);
  const tokenId_target = array1[indexToSend];
  let idxStart = 2;
  let idxEnd = 7;

  console.log(`array1[idxStart]: ${array1[idxStart]}
array1[idxEnd]: ${array1[idxEnd]} \ntokenId_target: ${tokenId_target}`);

  if(tokenId_target === array1[idxStart]){
    console.log('\ntokenId_target === array1[idxStart]');
    array1[idxStart] = 0;
    idxStart += 1;

  } else if(tokenId_target === array1[idxEnd]) {
    console.log('\ntokenId_target === array1[idxEnd]');
    array1[idxEnd] = 0;
    idxEnd -= 1;

  } else {
    console.log('\ntokenId_target should be in the middle');
    for (let idx = idxStart+1; idx < idxEnd; idx++) {
      if(array1[idx] === tokenId_target){
        array1[idx] = array1[idxEnd];
        array1[idxEnd] = 0;
        idxEnd -= 1;
      }
    }
  }
  console.log(`array1[idxStart]: ${array1[idxStart]}
array1[idxEnd]: ${array1[idxEnd]} \nidxStart: ${idxStart}, idxEnd: ${idxEnd} \narray1: ${array1}`);
}

//yarn run testmt -f 204
const deployTest1_API = async() => {
  console.log('\n--------------==inside deployCtrt1_API()');
  const {isGood, addrTest1} = await deployCtrt1().catch((err) => {
    console.log('\n[Error]'+ err);
  });
  console.log(`result_deployment: ${isGood} \naddrTest1: ${addrTest1}`);
  process.exit(0);
}

//yarn run testmt -f 205
const Test1ReadValues_API = async() => {
  console.log('\n--------------==inside Test1ReadValues_API()');
  const results = await Test1ReadValues().catch((err) => {
    console.log('\n[Error]'+ err);
  });
  process.exit(0);
}

//yarn run testmt -f 206
const Test1GetAccountDetail_API = async() => {
  console.log('\n--------------==inside Test1ReadValues_API()');
  const results = await Test1GetAccountDetail().catch((err) => {
    console.log('\n[Error]'+ err);
  });
  process.exit(0);
}



//------------------------==
// yarn run testmt -f 0
if(argv3 === 0){
  addPlatformSupervisor_API();

//yarn run testmt -f 1
} else if (argv3 === 1) {
  checkPlatformSupervisor_API();

//yarn run testmt -f 2
} else if (argv3 === 2) {
  addCustomerService_API();

//yarn run testmt -f 3
} else if (argv3 === 3) {
  checkCustomerService_API();

//yarn run testmt -f 4
} else if (argv3 === 4) {

//yarn run testmt -f 5
} else if (argv3 === 5) {

//yarn run testmt -f 6
} else if (argv3 === 6) {
  checkCompliance_API();

//yarn run testmt -f 7
} else if (argv3 === 7) {
  orderBalanceTotal_API();

//yarn run testmt -f 8
} else if (argv3 === 8) {
  addIncomeArrangementRow_API();

//yarn run testmt -f 9
} else if (argv3 === 9) {
  

//yarn run testmt -f 10
} else if (argv3 === 10) {
  sequentialMintSuperP2_API();


//yarn run testmt -f 11
} else if (argv3 === 11) {
  incomeManagerCtrt_API();

//yarn run testmt -f 12
} else if (argv3 === 12) {
  getIncomeSchedule_API();

//yarn run testmt -f 13
} else if (argv3 === 13) {
  getIncomeScheduleList_API();

//yarn run testmt -f 14
} else if (argv3 === 14) {
  checkAddForecastedScheduleBatch1_API();

//yarn run testmt -f 15
} else if (argv3 === 15) {
  checkAddForecastedScheduleBatch2_API();

//yarn run testmt -f 16
} else if (argv3 === 16) {
  checkAddForecastedScheduleBatch_API();

//yarn run testmt -f 17
} else if (argv3 === 17) {
  addForecastedScheduleBatch_API();

//yarn run testmt -f 18
} else if (argv3 === 18) {
  addForecastedScheduleBatchFromDB_API();

//yarn run testmt -f 19
} else if (argv3 === 19) {
  editActualSchedule_API();

//yarn run testmt -f 20
} else if (argv3 === 20) {
  addPaymentCount_API();

//yarn run testmt -f 21
} else if (argv3 === 21) {
  setErrResolution_API();

//yarn run testmt -f 22
} else if (argv3 === 22) {
  getForecastedSchedulesFromDB_API();


//------------------==Income_arrangement
//yarn run testmt -f 23
} else if (argv3 === 23) {
  setAssetRecordStatus_API();

//yarn run testmt -f 24
} else if (argv3 === 24) {
  getMaxActualPaymentTime_API();

//yarn run testmt -f 25
} else if (argv3 === 25) {
  checkIaAssetRecordStatus_API();

//yarn run testmt -f 26
} else if (argv3 === 26) {
  getMaxActualPaymentTime_API();

//yarn run testmt -f 27
} else if (argv3 === 27) {
  getAcPayment_API();

//yarn run testmt -f 28
} else if (argv3 === 28) {
  getProfitSymbolAddresses_API();

//yarn run testmt -f 29
} else if (argv3 === 29) {
  calculateLastPeriodProfit_API();


//------------------==Assetbook
//resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr
//yarn run testmt -f 30
} else if (argv3 === 30) {
  getAssetbookDetails_API();

//yarn run testmt -f 31
} else if (argv3 === 31) {
  setHeliumAddr_API();

//yarn run testmt -f 32
} else if (argv3 === 32) {
  HeliumContractVote_API();

//yarn run testmt -f 33
} else if (argv3 === 33) {
  resetVoteStatus_API();

//yarn run testmt -f 34
} else if (argv3 === 34) {
  changeAssetOwner_API();

  //---------------==
//yarn run testmt -f 39
} else if (argv3 === 39) {
  getDetailsCFC_API();

//yarn run testmt -f 40
} else if (argv3 === 40) {
  preMint_API();

//yarn run testmt -f 41
} else if (argv3 === 41) {
  getCrowdfundingInvestors_API();

//yarn run testmt -f 42
} else if (argv3 === 42) {
  getCFC_Balances_API();

//yarn run testmt -f 43
} else if (argv3 === 43) {
  investTokens_API();

//yarn run testmt -f 44
} else if (argv3 === 44) {
  checkInvestTokens_API();

//yarn run testmt -f 45
} else if (argv3 === 45) {
  setOpenFundingCFC_API();

//yarn run testmt -f 46
} else if (argv3 === 46) {
  setCloseFundingCFC_API();

//yarn run testmt -f 47
} else if (argv3 === 47) {
  investTokensInBatch_API();

//yarn run testmt -f 48
} else if (argv3 === 48) {

//yarn run testmt -f 49
} else if (argv3 === 49) {
  mintSequentialPerContract_API();

//yarn run testmt -f 50
} else if (argv3 === 50) {
  resetAfterMintToken_API();




//----------------------==Deploy System contracts
//yarn run testmt -f 53
} else if (argv3 === 53) {
  deployHeliumContract_API();

//yarn run testmt -f 54
} else if (argv3 === 54) {
  deployRegistryContract_API();

//yarn run testmt -f 55
} else if (argv3 === 55) {
  deployProductManagerContract_API();

//----------------------==Add Assetbooks
//yarn run testmt -f 56
} else if (argv3 === 56) {
  deployAssetbookContracts_API();

//yarn run testmt -f 57
} else if (argv3 === 57) {
  addUsersIntoDB_API();

//yarn run testmt -f 58
} else if (argv3 === 58) {
  addUserOneIntoDB_API();

//yarn run testmt -f 59
} else if (argv3 === 59) {
  addUsersToRegistryCtrt_API();


//yarn run testmt -f 60
} else if (argv3 === 60) {

//----------------------==
//yarn run testmt -f 61
} else if (argv3 === 61) {
  deployCrowdfundingContract_API();

//yarn run testmt -f 611
} else if (argv3 === 611) {
  checkDeploymentCFC_API();


//yarn run testmt -f 65
} else if (argv3 === 65) {
  investTokensToCloseCFC_API();

//yarn run testmt -f 66
} else if (argv3 === 66) {
  deployTokenControllerContract_API();

//yarn run testmt -f 67
} else if (argv3 === 67) {
  deployHCATContract_API();

//yarn run testmt -f 69
} else if (argv3 === 69) {
  deployIncomeManagerContract_API();

//yarn run testmt -f 70
} else if (argv3 === 70) {
  add3SmartContractsBySymbol_API();

//yarn run testmt -f 71
} else if (argv3 === 71) {
  addIncomeArrangementRows_API();

//yarn run testmt -f 72
} else if (argv3 === 72) {
  addProductRowFromSymbol_API();

//yarn run testmt -f 73
} else if (argv3 === 73) {


//yarn run testmt -f 75
} else if (argv3 === 75) {
  addUserArrayOrdersIntoDB_API();

//yarn run testmt -f 76
} else if (argv3 === 76) {
  addOrderIntoDB_API();

//yarn run testmt -f 77
} else if (argv3 === 77) {
  addArrayOrdersIntoDB_API();

//yarn run testmt -f 78
} else if (argv3 === 78) {
  addPaidOrdersIntoDBnCFC();

//yarn run testmt -f 788
} else if (argv3 === 788) {
  addAssetbooksIntoCFC_API();

//yarn run testmt -f 79
} else if (argv3 === 79) {
  getTokenContractDetails_API();

//yarn run testmt -f 80
} else if (argv3 === 80) {
  getAllSmartContractAddrs_API();

} else if (argv3 === 81) {
  getPastScheduleTimes_API();

//yarn run testmt -f 82
} else if (argv3 === 82) {
  setTokenController_API();

//yarn run testmt -f 83
} else if (argv3 === 83) {
  getTokenBalances_API();

//yarn run testmt -f 84
} else if (argv3 === 84) {


//yarn run testmt -f 85
} else if (argv3 === 85) {
  addOrders_CFC_MintTokens_API();

//yarn run testmt -f 86
} else if (argv3 === 86) {
  mintSequentialPerContract_CLI_API();

//yarn run testmt -f 87
} else if (argv3 === 87) {

//yarn run testmt -f 88
} else if (argv3 === 88) {

//yarn run testmt -f 89
} else if (argv3 === 89) {

//yarn run testmt -f 90
} else if (argv3 === 90) {


//yarn run testmt -f 91
} else if (argv3 === 91) {
  testRabbitMQ_sender();

//yarn run testmt -f 92
} else if (argv3 === 92) {
  callTestAPI();

//yarn run testmt -f 93
} else if (argv3 === 93) {
  breakdownArray_API();

//yarn run testmt -f 94
} else if (argv3 === 94) {
  checkTargetAmounts_API();

//yarn run testmt -f 95
} else if (argv3 === 95) {
  checkAssetbookArray_API();

//yarn run testmt -f 96
} else if (argv3 === 96) {
  checkAssetbook_API();

//yarn run testmt -f 98
} else if(argv3 === 98){

//yarn run testmt -f 99
} else if(argv3 === 99){
  intergrationTestOfRegistry();

//yarn run testmt -f 100
} else if(argv3 === 100){
  intergrationTestOfProduct();

//yarn run testmt -f 101
} else if(argv3 === 101){
  deleteAllRecordsBySymbolCLI_API();

//yarn run testmt -f 102
} else if(argv3 === 102){
  deleteAllRecordsBySymbol_API();

//yarn run testmt -f 103
} else if(argv3 === 103){
  deleteAllRecordsBySymbolArray_API();

} else if (argv3 === 104) {
  getSymbolFromCtrtAddr_API();

//yarn run testmt -f 110
} else if(argv3 === 110){
  updateIAassetRecordStatus_API();

//yarn run testmt -f 120
} else if(argv3 === 120){
  checkSafeTransferFromBatchFunction_API();

//yarn run testmt -f 121
} else if(argv3 === 121){
  transferTokens_API();

//yarn run testmt -f 141
} else if (argv3 === 141) {
  deleteProductRows_API();
//yarn run testmt -f 142
} else if (argv3 === 142) {
  deleteOrderRows_API();
//yarn run testmt -f 143
} else if (argv3 === 143) {
  deleteTxnInfoRows_API();
//yarn run testmt -f 144
} else if (argv3 === 144) {
  deleteSmartContractRows_API();
//yarn run testmt -f 145
} else if (argv3 === 145) {
  deleteIncomeArrangementRows_API();
//yarn run testmt -f 146
} else if (argv3 === 146) {
  deleteAssetRecordRows_API();

//yarn run testmt -f 147
} else if (argv3 === 147) {
  getTxnInfoRowsBySymbol_API();

//yarn run testmt -f 150
} else if (argv3 === 150) {
  getArraysFromCSV_API();

//yarn run testmt -f 151
} else if (argv3 === 151) {
  getOneAddrPerLineFromCSV_API();

//yarn run testmt -f 152
} else if (argv3 === 152) {
  writeFileToTxtFile_API();

//yarn run testmt -f 153
} else if (argv3 === 153) {
  writeStreamToTxtFile_API();

////yarn run testmt -c 201
} else if(argv3 === 201){
  breakdownArraysAPI();

  ////yarn run testmt -c 203
} else if(argv3 === 203){
  extractTokenId_API();

  ////yarn run testmt -c 204
} else if(argv3 === 204){
  deployTest1_API();

  ////yarn run testmt -c 205
} else if(argv3 === 205){
  Test1ReadValues_API();

  ////yarn run testmt -c 206
} else if(argv3 === 206){
  Test1GetAccountDetail_API();
}
