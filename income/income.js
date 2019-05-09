const BigNumber = require('bignumber.js');
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
const income = (holdingDays, period, periodIncome, prevTokenAmount) => {
  SQL = 'SELECT SUM(t_holdingDays) FROM htoken.transaction_info where t_txCount = 1 AND t_fromAssetbook = "0x123" AND t_tokenSYMBOL = "HTOK2019"'
  const soldAmount = holdingDays.length;
  if( soldAmount === 0){
    console.log('[Error] holdingDays has length of zero! holdingDays:', holdingDays);
    return -1;
  }
  if(period < 1){
    console.log('[Error] period < 1. period:', period);
    return -1;
  } else if(!Number.isInteger(period)){
    console.log('[Error] period is not an integer! period:', period);
    return -1;
  }

  //the only input value that may have rounding error
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

  if(prevTokenAmount < soldAmount){
    console.log('prevTokenAmount should be >= soldAmount')
    return -1;
  }

  //const holdingDaysB = new BigNumber(holdingDays);
  const totalDays = arrSum(holdingDays);
  const totalDaysB = new BigNumber(totalDays);

  const incomeBN = new BigNumber(((totalDaysB.times(0.7).dividedBy(period)).plus(prevTokenAmount - soldAmount)).times(periodIncome));
  console.log('\nincome in BN:', incomeBN, 'totalDays', totalDays);
  return incomeBN;
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