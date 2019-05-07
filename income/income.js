import BigNumber from "./bignumber.mjs"
//https://github.com/MikeMcl/bignumber.js/
/** 
 * http://mikemcl.github.io/bignumber.js/#decimal-places
 * Default value: 20
 * ROUNDING_MODE
    number: integer, 0 to 8 inclusive
    Default value: 4 (ROUND_HALF_UP)  rounds away from zero 

    https://mathjs.org/docs/datatypes/bignumbers.html
    https://floating-point-gui.de/formats/exact/
*/

//each holdingDays element has one tokenId
const income = (holdingDays, period, periodIncome, prevTokenAmount, soldAmount) => {
  if(holdingDays.length === 0){
    console.log('[Warning] holdingDays has length of zero! holdingDays:', holdingDays);
  }
  if(period < 1){
    console.log('[Error] period < 1. period:', period);
    return -1;
  } else if(!Number.isInteger(period)){
    console.log('[Error] period is not an integer! period:', period);
    return -1;
  }

  if(periodIncome < 0){
    console.log('[Error] periodIncome < 0');
    return -1;
  }

  if(!Number.isInteger(prevTokenAmount)){
    console.log('[Error] prevTokenAmount is not an integer. prevTokenAmount:', prevTokenAmount);
    return -1;
  } else if(prevTokenAmount < 0){
    console.log('[Error] prevTokenAmount < 0. prevTokenAmount:', prevTokenAmount);
    return -1;
  }

  if(!Number.isInteger(soldAmount)){
    console.log('[Error] soldAmount is not an integer. soldAmount:', soldAmount);
    return -1;
  } else if(soldAmount < 0){
    console.log('[Error] soldAmount < 0. soldAmount:', soldAmount);
    return -1;
  }

  //const holdingDaysB = new BigNumber(holdingDays);
  const holdingDaysB = new BigNumber(holdingDays);
  const holdingDaysB = new BigNumber(holdingDays);
  const holdingDaysB = new BigNumber(holdingDays);
  const holdingDaysB = new BigNumber(holdingDays);

  const totalDays = arrSum(holdingDaysB);
  const income = (totalDays * periodIncome * 0.7 / period)
    + ((prevTokenAmount - soldAmount) * periodIncome);
  return income;
}

const arrMin = arr => Math.min(...arr);
//Finding the Minimum value in an Array.

const arrMax = arr => Math.min(...arr);
//Finding the Maximum value in an Array.

const arrSum = arr => arr.reduce((a,b) => a + b, 0)
/*Finding the Sum of all values in an Array.
  a is our accumulator, b is the current value being processed.
  The second parameter of the reduce method is the initial value we wish to use
*/

const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
//Finding the Average value of an Array.


module.exports = {arrMin, arrMax, arrSum, arrAvg, income};
//const { income } = require('./income.js');