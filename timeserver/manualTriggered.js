const axios = require('axios');
const path = require('path');
const fs = require('fs');

//--------------------==
const { addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, symNum, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid, 
   } = require('../ethereum/contracts/zTestParameters');

const { isTimeserverON } = require('./envVariables');

const { AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager,  checkCompliance } = require('../ethereum/contracts/zsetupData');

const { mysqlPoolQueryB, setFundingStateDB, getForecastedSchedulesFromDB, calculateLastPeriodProfit, getProfitSymbolAddresses, addAssetRecordRowArray, addActualPaymentTime, addIncomeArrangementRow, setAssetRecordStatus, getMaxActualPaymentTime, getPastScheduleTimes, addUsersIntoDB, deleteTxnInfoRows, deleteProductRows, deleteSmartContractRows, deleteOrderRows, findSymbolFromCtrtAddr, deleteIncomeArrangementRows, deleteAssetRecordRows } = require('./mysql.js');

const { addPlatformSupervisor, checkPlatformSupervisor, addCustomerService, checkCustomerService, get_schCindex, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, preMint, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule, getTokenBalances, addForecastedScheduleBatchFromDB, addPaymentCount, setErrResolution, getDetailsCFC, getInvestorsFromCFC, investTokensInBatch, investTokens, checkInvest, setTimeCFC, deployAssetbooks, deployCrowdfundingContract, deployTokenControllerContract, checkArgumentsTCC, checkDeploymentTCC, checkArgumentsHCAT, deployHCATContract, checkDeploymentHCAT, deployIncomeManagerContract, checkDeploymentCFC, checkArgumentsCFC, fromAsciiToBytes32, checkAssetbookArray } = require('./blockchain.js');

const { checkTargetAmounts, breakdownArray, breakdownArrays, arraySum, getLocalTime } = require('./utilities');

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;

let func, arg1, arg2, arg3;

const userIdArray = [];
const investorLevelArray = [];
const assetbookArray = [];
userArray.forEach((user, idx) => {
  if (idx !== 0 ){
    userIdArray.push(user.identityNumber);
    investorLevelArray.push(user.investorLevel);
    assetbookArray.push(user.addrAssetBook);
  }
});

const timeChoice = 1;

// yarn run testmt -f F
// yarn run testmt -f F -a1 arg2 -a2 arg3 -a3 arg3
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
  func = parseInt(process.argv[3]);
  if (func < 0 || func > 999){
    console.log('func value is out of range. func: ', func);
    process.exit(0);
  }
  if (arguLen >= 6) {
    arg1 = parseInt(process.argv[5]);
    if (arguLen >= 8) {
      arg2 = parseInt(process.argv[7]);
      if (arguLen >= 10) {
        arg3 = parseInt(process.argv[9]);
      }  
    }  
  }
}
//console.log(arg1, arg2, arg3);

// yarn run testmt -f F
// yarn run testmt -f F -a arg2 -b arg3 -c arg3

// yarn run testmt -f 0
const newplatformSupervisor = AssetOwner1;
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

//yarn run testmt -f 4
const getProfitSymbolAddresses_API = async () => {
  const resultsAPI = await getProfitSymbolAddresses();
  console.log('resultsAPI', resultsAPI);
  process.exit(0);
}

// yarn run testmt -f 5
const calculateLastPeriodProfit_API = async () => {
  console.log('\n------------------==inside calculateLastPeriodProfit_API()...');
  const symbol = 'NCCU1704';
  const result = await calculateLastPeriodProfit(symbol).catch((err) => {
    console.log('[Error @ calculateLastPeriodProfit]', err);
  });
  console.log(`result: ${result}`);
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



// yarn run testmt -f 9
const addXYZ_API = async () => {
  console.log('\n--------------==About to call addXYZ()');

  process.exit(0);
}

// yarn run testmt -f 10
const sequentialMintSuperP2_API = async () => {
  console.log('\n--------------==About to call addAssetRecordRowArray()');
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

//yarn run testmt -f 25
const setAssetRecordStatus_API = async () => {
  console.log('\n---------------------==setAssetRecordStatus_API()');
  const assetRecordStatus = '1';
  const symbol = 'AVEN1902';
  const actualPaymentTime = 201905281441+10;
  const result = await setAssetRecordStatus(assetRecordStatus, symbol, actualPaymentTime);
  console.log('result', result);
  process.exit(0);
}

//yarn run testmt -f 26
const getMaxActualPaymentTime_API = async () => {
  console.log('\n---------------------==getMaxActualPaymentTime_API()');
  const symbol = 'ACHM6666';
  const serverTime = 201906271235;
  const result = await getMaxActualPaymentTime(symbol, serverTime);
  let resultBoolean;
  if(result){
    resultBoolean = true;
  } else {
    resultBoolean = false;
  }
  console.log('result:', result, ', resultBoolean:', resultBoolean);
  process.exit(0);
}

//yarn run testmt -f 40
const preMint_API = async () => {
  console.log('\n---------------------==preMint_API()');
  //const nftSymbol = 'AVEN1902';//'NCCU0723';
  let toAddressArray, amountArray, tokenCtrtAddr;
  [toAddressArray, amountArray, tokenCtrtAddr] = await preMint(nftSymbol).catch((err) => { console.log('preMint() failed. err:'+ err);
  });
  const isNumberArray = amountArray.map((item) => {
    return typeof item === 'number';
  });
  console.log(`Returned values from preMint():
toAddressArray: ${toAddressArray} \namountArray: ${amountArray} isNumberArray: ${isNumberArray} \ntokenCtrtAddr: ${tokenCtrtAddr}`);
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

//yarn run testmt -f 42
const callTestAPI = async () => {
  console.log('\n---------------------==callTestAPI()');
  //const util = require('util');
  const nftSymbol = 'AVEN1902';//'NCCU0723';
  const config={
    proxy: {
      host: 'localhost',
      port: 3000,
    },
  }
  const url1="/Contracts/HCAT721_AssetTokenContract/"+nftSymbol;
  const response1 = await axios.get(url1, config).catch(err => { console.log('err:',err); });
  const data1 = response1.data;
  console.log(`status: ${data1.status}, result: ${JSON.stringify(data1.result)}`);
  //util.inspect(response1)

  const url2="/Contracts/HCAT721_AssetTokenContract/test1/"+nftSymbol;
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
  await getDetailsCFC(addrCrowdFunding);
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
const getTokenBalances_API = async () => {
  console.log('\n---------------------==getTokenBalances_API()');
  const existingBalances = await getTokenBalances(assetbookArray, addrHCAT721);
  console.log('existingBalances:', existingBalances);
  //process.exit(0);
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



//1158,1247,1427,1619,1572,1322,1762,1888,1997,2019
//yarn run testmt -f 49
const mintSequentialPerCtrt_API = async () => {
  console.log('\n---------------------==mintSequentialPerCtrt_API()');
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
  const url2='/Contracts/HCAT721_AssetTokenContract/'+nftSymbol+'/mintSequentialPerCtrt';
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
//yarn run testmt -f 60
const checkArgumentsCFC_API = async () => {
  console.log('\n---------------------==checkArgumentsCFC_API()');
  const result_checkArguments = await checkArgumentsCFC(argsCrowdFunding);
  console.log(`result_checkArguments: ${result_checkArguments}`);
}

//yarn run testmt -f 61
const deployCrowdfundingContract_API = async () => {
  console.log('\n---------------------==deployCrowdfundingContract_API()');
  let acCFSD, acCFED, acTimeOfDeployment_CF;
  const isToDeploy = 1;
  if(timeChoice === 1){
    acTimeOfDeployment_CF = getLocalTime();
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

  if(result_checkArguments){
    console.log('result_checkArguments: true');
    if(isToDeploy === 1){
      const result_deployment = await deployCrowdfundingContract(argsCrowdFunding);
      console.log(`result: ${result_deployment}`);
    } else {
      const crowdFundingAddr = '0xF811f727da052379D8cbfBF1188E290B32ff9f99';
      const result = await checkDeploymentCFC(crowdFundingAddr, argsCrowdFunding);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}



//yarn run testmt -f 64
const deployTokenControllerContract_API = async () => {
  console.log('\n---------------------==deployTokenControllerContract_API()');
  let acTimeTokenUnlock, acTimeTokenValid, TimeOfDeployment_TokCtrl;

  const isToDeploy = 1;
  if(timeChoice === 1){
    acTimeOfDeployment_TokCtrl = getLocalTime();
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
    if(isToDeploy === 1){
      const result_deployment = await deployTokenControllerContract(argsTokenController);
    console.log(`result: ${result_deployment}`);
    } else {
      const tokenControllerAddr = '0x9812d0eBcd89d8491Bca80000c147f739B9Cef73';
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

  const isToDeploy = 2;
  if(timeChoice === 1){
    acTimeOfDeployment_HCAT = getLocalTime();
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
  addrRegistry, addrTokenController, tokenURI_bytes32, addrHelium,acTimeOfDeployment_HCAT];
  console.log(`nftName: ${nftName}, nftSymbol: ${nftSymbol}, siteSizeInKW: ${siteSizeInKW}, maxTotalSupply: ${maxTotalSupply} \ninitialAssetPricing: ${initialAssetPricing}, pricingCurrency: ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}, tokenURI: ${tokenURI}`);

  const result_checkArguments = await checkArgumentsHCAT(argsHCAT721);
  console.log(`result_checkArguments: ${result_checkArguments}`);

  if(result_checkArguments){
    console.log('result_checkArguments: true');
    //process.exit(0);
    if(isToDeploy === 1){
      const result_deployment = await deployHCATContract(argsHCAT721);
      console.log(`result: ${result_deployment}`);
    
    } else {
      const HCAT_Addr = '0x57B7c9837cFc7fC2f0510d16cc52D2F0Dc10276A';
      const result = await checkDeploymentHCAT(HCAT_Addr, argsHCAT721);
      console.log(`result: ${result}`);
    }
  } else {
    console.log(`not to deploy due to incorrect argument values`);
  }
  process.exit(0);
}

//yarn run testmt -f 70
const deployIncomeManagerContract_API = async () => {
  console.log('\n---------------------==deployIncomeManagerContract_API()');
  let TimeOfDeployment_IM;
  if(timeChoice === 1){
    acTimeOfDeployment_IM = getLocalTime();
  } else {
    acTimeOfDeployment_IM = TimeOfDeployment_IM;
  }
  const argsIncomeManager =[addrHCAT721, addrHelium, TimeOfDeployment_IM];
  console.log(`TimeOfDeployment_IM: ${TimeOfDeployment_IM}`);

  const result = await deployIncomeManagerContract(argsIncomeManager);
  console.log(`result: ${result}`);
  process.exit(0);
}


//yarn run testmt -f 95
const checkAssetbookArray_API = async() => {
  console.log('\n---------------------==checkAssetbookArray_API()');
  const addressArray = [...assetbookArray, '0x5Fd93F8a4B023D837f0b04bb2836Daf535BfeFBF'];
  const checkResult = await checkAssetbookArray(addressArray).catch(async(err) => {
    console.log(`checkAssetbookArray() result: ${err}, checkAssetbookArray() failed(). addressArray: ${addressArray}`);
    return false;
  });
  if(checkResult.includes(false)){
    console.log(`\naddressArray has at least one invalid item. \n\naddressArray: ${addressArray} \n\ncheckAssetbookArray() Result: ${checkResult}`);
    return false;
  } else {
    console.log(`all input addresses has been checked good by checkAssetbookArray \ncheckResult: ${checkResult} `);
  }
}

//----------------------------==
//yarn run testmt -f 55
const addUsersIntoDB_API = async () => {
  console.log('\n-------------==inside addUsersIntoDB_API');
  const result = await addUsersIntoDB(userArray);
  console.log('result', result);
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
const checkTargetAmounts_API = async () => {
  const balanceArrayBefore = [ 2212, 2424, 2868, 2992, 2741, 2349, 2889, 3115, 3324, 3446 ]; 
  const targetAmounts = [ 2527, 2716, 2796, 2498, 2551, 2349, 2889, 3115, 3324, 3446 ]
  const [result, isAllGood] = checkTargetAmounts(balanceArrayBefore, targetAmounts);
  console.log('balanceArrayBefore:', balanceArrayBefore, ', targetAmounts:', targetAmounts, ', result:', result, ', isAllGood:', isAllGood);
}

//yarn run testmt -f 102
const deployAssetbooks_API = async () => {
  console.log('\n---------------------==deployAssetbooks_API()');
  const eoaArray = [''];
  const addrHeliumContract = '';
  const result = await deployAssetbooks(eoaArray, addrHeliumContract);
  console.log('result:', result);
}

//yarn run testmt -f 103
const findSymbolFromCtrtAddr_API = async() => {
  console.log('\n---------------------==findSymbolFromCtrtAddr_API()');
  const ctrtAddr = '0xD24272DBF4642a2550e852BF2f802E446c919Ba0';
  const ctrtType = 'crowdfunding';
  const [isGood, symbol, resultMesg] = await findSymbolFromCtrtAddr(ctrtAddr, ctrtType);
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


//------------------------==
// yarn run testmt -f 0
if(func === 0){
  addPlatformSupervisor_API();

//yarn run testmt -f 1
} else if (func === 1) {
  checkPlatformSupervisor_API();

//yarn run testmt -f 2
} else if (func === 2) {
  addCustomerService_API();

//yarn run testmt -f 3
} else if (func === 3) {
  checkCustomerService_API();

//yarn run testmt -f 4
} else if (func === 4) {
  getProfitSymbolAddresses_API();

//yarn run testmt -f 5
} else if (func === 5) {
  calculateLastPeriodProfit_API();

//yarn run testmt -f 6
} else if (func === 6) {
  checkCompliance_API();

//yarn run testmt -f 7
} else if (func === 7) {
  orderBalanceTotal_API();

//yarn run testmt -f 8
} else if (func === 8) {
  addIncomeArrangementRow_API();

//yarn run testmt -f 9
} else if (func === 9) {
  

//yarn run testmt -f 10
} else if (func === 10) {
  sequentialMintSuperP2_API();


//yarn run testmt -f 11
} else if (func === 11) {
  incomeManagerCtrt_API();

//yarn run testmt -f 12
} else if (func === 12) {
  getIncomeSchedule_API();

//yarn run testmt -f 13
} else if (func === 13) {
  getIncomeScheduleList_API();

//yarn run testmt -f 14
} else if (func === 14) {
  checkAddForecastedScheduleBatch1_API();

//yarn run testmt -f 15
} else if (func === 15) {
  checkAddForecastedScheduleBatch2_API();

//yarn run testmt -f 16
} else if (func === 16) {
  checkAddForecastedScheduleBatch_API();

//yarn run testmt -f 17
} else if (func === 17) {
  addForecastedScheduleBatch_API();

//yarn run testmt -f 18
} else if (func === 18) {
  addForecastedScheduleBatchFromDB_API();

//yarn run testmt -f 19
} else if (func === 19) {
  editActualSchedule_API();

//yarn run testmt -f 20
} else if (func === 20) {
  addPaymentCount_API();

//yarn run testmt -f 21
} else if (func === 21) {
  setErrResolution_API();

//yarn run testmt -f 22
} else if (func === 22) {
  getForecastedSchedulesFromDB_API();


//------------------==Income_arrangement
//yarn run testmt -f 25
} else if (func === 25) {
  setAssetRecordStatus_API();

//yarn run testmt -f 26
} else if (func === 26) {
  getMaxActualPaymentTime_API();

//------------------==Assetbook
//resetVoteStatus, changeAssetOwner, getAssetbookDetails, HeliumContractVote, setHeliumAddr
//yarn run testmt -f 30
} else if (func === 30) {
  getAssetbookDetails_API();

//yarn run testmt -f 31
} else if (func === 31) {
  setHeliumAddr_API();

//yarn run testmt -f 32
} else if (func === 32) {
  HeliumContractVote_API();

//yarn run testmt -f 33
} else if (func === 33) {
  resetVoteStatus_API();

//yarn run testmt -f 34
} else if (func === 34) {
  changeAssetOwner_API();

//yarn run testmt -f 39
} else if (func === 39) {
  getDetailsCFC_API();

//yarn run testmt -f 40
} else if (func === 40) {
  preMint_API();

//yarn run testmt -f 41
} else if (func === 41) {
  getCrowdfundingInvestors_API();

//yarn run testmt -f 42
} else if (func === 42) {
  getTokenBalances_API();

//yarn run testmt -f 43
} else if (func === 43) {
  investTokens_API();

//yarn run testmt -f 44
} else if (func === 44) {
  checkInvestTokens_API();

//yarn run testmt -f 45
} else if (func === 45) {
  setOpenFundingCFC_API();

//yarn run testmt -f 46
} else if (func === 46) {
  setCloseFundingCFC_API();

//yarn run testmt -f 47
} else if (func === 47) {
  investTokensInBatch_API();

//yarn run testmt -f 49
} else if (func === 49) {
  mintSequentialPerCtrt_API();

//yarn run testmt -f 50
} else if (func === 50) {
  resetAfterMintToken_API();

//yarn run testmt -f 51
} else if (func === 51) {
  writeFileToTxtFile_API();

//yarn run testmt -f 52
} else if (func === 52) {
  writeStreamToTxtFile_API();

//yarn run testmt -f 55
} else if (func === 55) {
  addUsersIntoDB_API();

//----------------------==
//yarn run testmt -f 61
} else if (func === 61) {
  deployCrowdfundingContract_API();

//yarn run testmt -f 611
} else if (func === 611) {
  checkDeploymentCFC_API();

//yarn run testmt -f 64
} else if (func === 64) {
  deployTokenControllerContract_API();

//yarn run testmt -f 67
} else if (func === 67) {
  deployHCATContract_API();

//yarn run testmt -f 70
} else if (func === 70) {
  deployIncomeManagerContract_API();

//yarn run testmt -f 81
} else if (func === 81) {
  getPastScheduleTimes_API();


//yarn run testmt -f 91
} else if (func === 91) {
  testRabbitMQ_sender();

//yarn run testmt -f 92
} else if (func === 92) {
  callTestAPI();

//yarn run testmt -f 93
} else if (func === 93) {
  breakdownArray_API();

//yarn run testmt -f 94
} else if (func === 94) {
  checkTargetAmounts_API();

//yarn run testmt -f 95
} else if (func === 95) {
  checkAssetbookArray_API();

//yarn run testmt -f 102
} else if (func === 102) {
  deployAssetbooks_API();

//yarn run testmt -f 103
} else if (func === 103) {
  findSymbolFromCtrtAddr_API();

//yarn run testmt -f 141
} else if (func === 141) {
  deleteProductRows_API();
//yarn run testmt -f 142
} else if (func === 142) {
  deleteOrderRows_API();
//yarn run testmt -f 143
} else if (func === 143) {
  deleteTxnInfoRows_API();
//yarn run testmt -f 144
} else if (func === 144) {
  deleteSmartContractRows_API();
//yarn run testmt -f 145
} else if (func === 145) {
  deleteIncomeArrangementRows_API();
//yarn run testmt -f 146
} else if (func === 146) {
  deleteAssetRecordRows_API();

}