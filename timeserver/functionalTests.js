const { incomeFromHoldingDays } = require('./income.js');
const moment = require('moment');
const BigNumber = require('bignumber.js');

const { mysqlPoolQuery, addTxnInfoRow, addTxnInfoRowFromObj } = require('./mysql');

let choice, txnInfoRow, txnInfoObj;
// yarn run testfn -c C
const arguLen = process.argv.length;
console.log('arguLen', arguLen, 'process.argv', process.argv);
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run testfn -c C');
  console.log("\x1b[32m", 'C = 1: incomeFromHoldingDaysSection()');
  console.log("\x1b[32m", 'C = 2: addTxnInfoRowSection()');
  process.exit(0);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 4) {
  console.log('not enough arguments. --h for help');
  process.exit(0);
} else {
  choice = parseInt(process.argv[3]);
  if (choice < 0 || choice > 50){
    console.log('choice value is out of range. choice: ', choice);
    process.exit(0);
  }
  // if (arguLen < 6) {
  //   arg0 = 0;
  // } else {
  //   arg0 = parseInt(process.argv[3]);
  //   if (arguLen < 8) {
  //     arg1 = 0;
  //   } else {
  //     arg1 = parseInt(process.argv[7]);
  //     if (arguLen < 10) {
  //       arg2 = 0;
  //     } else {
  //       arg2 = parseInt(process.argv[9]);
  //     }  
  //   }  
  // }  
}


let calculatedIncome, moment1, moment2, daysPassed;
let period, periodIncome, prevTokenAmount, soldAmount;
let txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook;

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}



moment1 = moment().format();
console.log('moment1', moment1);

const TimeInitial = 201901010000;
//const PayablePeriodEnd = 0;//as array index
const PrincipalCalledback = 100132.5;
let BookValue =  8010600;
// const ForecastedAnnualIncome = 0;
// const ForecastedPayableIncomeInThePeriod = 0;
// const AccumulatedIncome = 0;
// const IncomeRecievable = 0;
// const TheoryValue = 0;

const maxArrayLength = 8;//80;
const PayablePeriodEndArray = [];
const TimeArray = [];
const BookValueArray = [];
const DaysPassedArray = [];

moment1 = moment(TimeInitial.toString(), ['YYYYMMDDHHmm']);
console.log('moment1', moment1.format('YYYYMMDDHHmm'));

for (let i = 1; i <= maxArrayLength; i++) {
  PayablePeriodEndArray.push(i);

  moment2 = moment1.add(3,'months');
  TimeArray.push(moment2.format('YYYYMMDDHHmm'));
  BookValueArray.push(BookValue-i*PrincipalCalledback);

  //daysPassed = moment2.from(moment1);
  //DaysPassedArray.push(daysPassed);

}
console.log('PayablePeriodEndArray', PayablePeriodEndArray);
console.log('TimeArray', TimeArray);
console.log('BookValueArray', BookValueArray);
console.log('DaysPassedArray', DaysPassedArray);

console.log('\n----------------------==\nTest adding 3 days');
let oPurchaseDate='20190509';
let oPurchaseDateM = moment(oPurchaseDate, ['YYYYMMDD']);
console.log('oPurchaseDateM', oPurchaseDateM.format('YYYYMMDDHHmm'));
console.log('oPurchaseDateM', oPurchaseDateM.format('YYYYMMDD'));

let timeCurrent = '20190513';
let timeCurrentM = moment(timeCurrent, ['YYYYMMDD']);
console.log('timeCurrentM', timeCurrentM.format('YYYYMMDD'));
if (timeCurrentM >= oPurchaseDateM.add(3, 'days')) {
  console.log('yes');
} else {
  console.log('no');
}

addr1= '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
console.log('isNumber()', Number.isInteger(addr1));

console.log('\n----------------------==\nTest bignumber.js calculation and rounding');
//console.log(0.3 - 0.1);// 0.19999999999999998
x = new BigNumber(0.3);
console.log(x.minus(0.1));// "0.2"

x = new BigNumber(14);
console.log(x.times(300).dividedBy(15));// 14/15*300 => 280

x = new BigNumber(377);
console.log(x.times(11).times(9).dividedBy(3));// 12441

console.log('\nrounding test???');


console.log('\n----------------==Test every()');
checkItem =(item) =>  Number.isInteger(item);
const amountArray = [1, 2, 3, 323, 679, 'dsd'];
if(!amountArray.every(checkItem)){
  console.log('amountArray has string');
  //return;
} else {
  console.log('amountArray has all integers');
}

const amountArray2 = [1, 2, 3, 323, 679];
if(!amountArray2.every(checkItem)){
  console.log('amountArray has string');
  //return;
} else {
  console.log('amountArray has all integers');
}

console.log('\n----------------==\nTest incomeFromHolidays calculation');
period = 90; 
periodIncome = 300; 

holdingDays = [0, 30, 60, 89, 90];
prevTokenAmount = 5; 
calculatedIncome = incomeFromHoldingDays(holdingDays, period, periodIncome, prevTokenAmount);
//627.666666666666666666

holdingDays = [0, 30, 60, 89, 90, 120];
prevTokenAmount = 6; 
calculatedIncome = incomeFromHoldingDays(holdingDays, period, periodIncome, prevTokenAmount);
//907.666666666666666668

holdingDays = [0, 30, 60, 89, 90, 120];
prevTokenAmount = 7; 
calculatedIncome = incomeFromHoldingDays(holdingDays, period, periodIncome, prevTokenAmount);
//1207.666666666666666668

//(120÷90×0.7+4)×300 => 1480


const incomeFromHoldingDaysSection = async (args, period, periodIncome, prevTokenAmount) => {
  console.log('\n----------------==\ninside incomeFromHoldingDaysSection()...');

  const incomeBN_out = await incomeFromHoldingDays(args, period, periodIncome, prevTokenAmount).catch((err) => console.log('[Error @ incomeFromHoldingDays()]', err));
  console.log('incomeBN_out', incomeBN_out);

  process.exit(0);
}


function MakeTxnInfoRow(txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook) {
  console.log('MakeTxnInfoRow()');
  this.txid = txid;
  this.tokenSymbol = tokenSymbol;
  this.fromAssetbook = fromAssetbook;
  this.toAssetbook = toAssetbook;
  this.tokenId = tokenId;
  this.txCount = txCount;
  this.holdingDays = holdingDays;
  this.txTime = txTime;
  this.balanceOffromassetbook = balanceOffromassetbook;
}



const txnInfoObjArray=[];
const addTxnInfoRowSection = (symbolArray, assetbookArray, holdingDaysArray, txTimeArray) => {
  console.log('\n\n\n----------------==inside addTxnInfoRowSection()');
  const waitTime = 1000;
  /**the value of previous period token balance ... investor_assetRecord table ar_holding_amount_in_the_end_of_period
  */
  balanceOffromassetbook = 0;
  // tokenSymbol = 'AAAB1901'; fromAssetbook = '0xUser001'; holdingDays = 10; 
  // txid = tokenSymbol+'001'; toAssetbook = ''; 
  // tokenId = 1; txCount = 1; txTime = 201905100505;
  // balanceOffromassetbook = 7;//=> find the one with the biggest txTime => currentAmount

  toAssetbook = ''; period = 7; tokenId = 0; txCount = 1;
  for (let symbolIdx = 0; symbolIdx < symbolArray.length; symbolIdx++) {
    for (let userIdx = 0; userIdx < assetbookArray.length; userIdx++) {
      console.log('inside for loops x2. tokenId:', tokenId);

      for (let holdingDaysIdx = 0; holdingDaysIdx < holdingDaysArray.length; holdingDaysIdx++) {
                                      //txid = symbol +period + tokenId + txCount
        txnInfoObj = new MakeTxnInfoRow(symbolArray[symbolIdx]+period+tokenId+txCount, symbolArray[symbolIdx], assetbookArray[userIdx], toAssetbook, tokenId, txCount, holdingDaysArray[holdingDaysIdx], txTimeArray[holdingDaysIdx], balanceOffromassetbook);
        //txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook
        txnInfoObjArray.push(txnInfoObj);
        tokenId += 1;
      }
    }
  }
  console.log('\n----------------==txnInfoObjArray\n', txnInfoObjArray);

  sequentialRun(txnInfoObjArray, waitTime);
}

const sequentialRun = async (arrayInput, waitTime) => {
  console.log('sequentialRun()');
  await asyncForEach(arrayInput, async (item) => {
    console.log('inside asyncForEach()', item);
    addTxnInfoRowFromObj(item).catch((err) => console.log('[Error @ addTxnInfoRowFromObj()]', err));
    console.log('\nmain tread is paused for waiting', waitTime, 'miliseconds');
    await waitFor(waitTime);
  });
  console.log('--------------==Done');
  console.log('SequentialRun() has been completed.\nAll input array elements have been cycled through');
  process.exit(0);
}


//-----------------------------==
const symbolArray= ['AAAB1902', 'AAAC1903'];
const assetbookArray  = ['0xassetbook001', '0xassetbook002'];
const holdingDaysArray = [1, 30, 60, 89]; 
const txTimeArray = [201905050505, 201905050506, 201905050507, 201905050508];


if(holdingDaysArray.length !== txTimeArray.length){
  console.log('[Error] holdingDaysArray.length should === txTimeArray.length');
  return;
}
if(choice < 9){
  //args = ["nonArray", symbol, addrAssetbook ];
  console.log('\n---------------------==\nto calculate income: symbol=', symbolArray[choice], ', assetbook=', assetbookArray[choice]);
  const args = ["nonArray", symbolArray[choice], assetbookArray[choice]];
  const period = 90;
  const periodIncome = 300;
  const prevTokenAmount = 7;
  incomeFromHoldingDaysSection(args, period, periodIncome, prevTokenAmount);

} else if(choice === 9){
  addTxnInfoRowSection(symbolArray, assetbookArray, holdingDaysArray, txTimeArray);
  /*
  txid= ; tokenSymbol= ; fromAssetbook= ; 
  toAssetbook= ; tokenId= ; txCount= ; 
  holdingDays= ; txTime= ; balanceOffromassetbook= ;
  await addTxnInfoRowSection(txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook);
  */

}

/*=> make income tables
  Symbol, user, hold token amount, hold days, payable amount
*/

