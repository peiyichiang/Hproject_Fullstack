const { incomeFromHoldingDays } = require('./income.js');
const moment = require('moment');
const BigNumber = require('bignumber.js');

let calculatedIncome, moment1, moment2, daysPassed;
let holdingDays, period, periodIncome, prevTokenAmount, soldAmount;

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

console.log('\n----------------------==');
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

console.log('\n----------------------==');
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

//console.log(0.3 - 0.1);// 0.19999999999999998
x = new BigNumber(0.3);
console.log(x.minus(0.1));// "0.2"

x = new BigNumber(14);
console.log(x.times(300).dividedBy(15));// 14/15*300 => 280

x = new BigNumber(377);
console.log(x.times(11).times(9).dividedBy(3));// 12441


//(120÷90×0.7+4)×300 => 1480
//const incomeFromHoldingDays = (args, period, periodIncome, prevTokenAmount) => {
const args = ["0x123", "HTOK2019"];
incomeBN_out = incomeFromHoldingDays(args, period, periodIncome, prevTokenAmount );
console.log('incomeBN_out', incomeBN_out);


