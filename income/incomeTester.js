const { income } = require('./income.js');
const moment = require('moment');

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
period = 90; 
periodIncome = 300; 

holdingDays = [0, 30, 60, 89, 90];
prevTokenAmount = 5; 
calculatedIncome = income(holdingDays, period, periodIncome, prevTokenAmount);
console.log('calculatedIncome:', calculatedIncome);//627.666666666666666666

holdingDays = [0, 30, 60, 89, 90, 120];
prevTokenAmount = 6; 
calculatedIncome = income(holdingDays, period, periodIncome, prevTokenAmount);
console.log('calculatedIncome:', calculatedIncome);//907.666666666666666668

holdingDays = [0, 30, 60, 89, 90, 120];
prevTokenAmount = 7; 
calculatedIncome = income(holdingDays, period, periodIncome, prevTokenAmount);
console.log('calculatedIncome:', calculatedIncome);//1207.666666666666666668

