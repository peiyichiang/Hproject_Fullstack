//--------------------==
const { AssetBook, TokenController, HCAT721, CrowdFunding, IncomeManager, excludedSymbols, excludedSymbolsIA, assetOwnerArray, assetOwnerpkRawArray, productObjArray, symbolArray, crowdFundingAddrArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftSymbol } = require('../ethereum/contracts/zsetupData');

const { mysqlPoolQueryB, setFundingStateDB, findCtrtAddr, getForecastedSchedulesFromDB } = require('./mysql.js');

const { addPlatformSupervisor, get_schCindex, tokenCtrt, get_paymentCount, get_TimeOfDeployment, addForecastedScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddForecastedScheduleBatch1, checkAddForecastedScheduleBatch2, checkAddForecastedScheduleBatch, editActualSchedule,  addForecastedScheduleBatchFromDB, setErrResolution } = require('./blockchain.js');
//const {  } = require('./utilities');

const [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10] = assetOwnerArray;
const [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw] = assetOwnerpkRawArray;

const backendAddr = AssetOwner5;
const backendAddrpkRaw = AssetOwner5pkRaw;

let func, arg1, arg2, arg3;

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
  if (func < 0 || func > 50){
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
const addPlatformSupervisor_API = async () => {
  console.log('\n------------------==inside addPlatformSupervisor_API()...');
  const newplatformSupervisor = AssetOwner5;
  const result = await addPlatformSupervisor(newplatformSupervisor).catch((err) => {
    console.log('[Error @ addPlatformSupervisor]', err);
  });
  console.log(`result: ${result}`);
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
  //     const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From htoken.income_arrangement where ia_SYMBOL = ?';

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
  const results1 = await getAssetbookDetails(addrAssetBook);
  console.log('results1', results1);
  process.exit(0);
}

//yarn run testmt -f 31
const setHeliumAddr_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const results1 = await setHeliumAddr(addrAssetBook, _addrHeliumContract);
  console.log('results1', results1);
  process.exit(0);
}

//yarn run testmt -f 32
const HeliumContractVote_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const results1 = await HeliumContractVote(addrAssetBook, serverTime);
  console.log('results1', results1);
  process.exit(0);
}

//yarn run testmt -f 33
const resetVoteStatus_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const results1 = await resetVoteStatus(addrAssetBook);
  console.log('results1', results1);
  process.exit(0);
}

//yarn run testmt -f 34
const changeAssetOwner_API = async () => {
  const addrAssetBook = addrAssetBook1;
  const _assetOwnerNew = ''
  const serverTime = 20190626;
  const results1 = await changeAssetOwner(addrAssetBook, _assetOwnerNew, serverTime);
  console.log('results1', results1);
  process.exit(0);
}


//------------------------==
// yarn run testmt -f 0
if(func === 0){
  addPlatformSupervisor_API();

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
  imApprove_API();

//yarn run testmt -f 21
} else if (func === 21) {
  setErrResolution_API();

//yarn run testmt -f 22
} else if (func === 22) {
  getForecastedSchedulesFromDB_API();

//------------------==Assetbook from Backend
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
}