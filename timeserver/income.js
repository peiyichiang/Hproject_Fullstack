const BigNumber = require('bignumber.js');

const { mysqlPoolQuery } = require('./mysql');

//BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: 4 });
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

/**
 * 
 * @param {*} args = array of holdingDays OR [addrAssetbook, symbol]
 * @param {*} period = period of the period income below
 * @param {*} periodIncome = ... see above
 * @param {*} prevTokenAmount = token amount at the end of the last period
 */
const incomeFromHoldingDays = async (args, period, periodIncome, prevTokenAmount) => {
  const incomeDiscountRatio = 0.7;
  
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

  if(Number.isInteger(args[0])){
    //each args is a holdingDays number that has one tokenId
    const soldAmount = args.length;
    if( soldAmount === 0){
      console.log('[Error] holdingDays has length of zero! holdingDays:', args);
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
  
    const totalDays = arrSum(args);
    const totalDaysB = new BigNumber(totalDays);
    const prevTokenAmountB = new BigNumber(prevTokenAmount);
    const soldAmountB = new BigNumber(soldAmount);

    const incomeBN = (totalDaysB.times(incomeDiscountRatio).times(periodIncome).dividedBy(period)).plus((prevTokenAmountB.minus(soldAmountB)).times(periodIncome));
    console.log('\nincome in BN:', incomeBN, 'totalDays', totalDays);
    return incomeBN;
  
  } else {
    const addrAssetbook = args[0];
    const symbol = args[1];
    mysqlPoolQuery('SELECT COUNT(t_holdingDays), SUM(t_holdingDays) FROM htoken.transaction_info where t_txCount = 1 AND t_fromAssetbook = ? AND t_tokenSYMBOL = ?', [addrAssetbook, symbol], function (err, result) {
      if (err) {
        console.log(`\n[Error] Failed at getting sum of holdingDays. addrAssetbook: ${addrAssetbook}, symbol: ${symbol}, err: ${err}`);
        return -1;
      } else {
        console.log('\n[Success] Count and Sum of holdingDays:', result, result[0]['COUNT(t_holdingDays)'], result[0]['SUM(t_holdingDays)']);

        const soldAmountB = new BigNumber(result[0]['COUNT(t_holdingDays)']);
        const totalDaysB = new BigNumber(result[0]['SUM(t_holdingDays)']);
        //const periodB = new BigNumber(period);
        const prevTokenAmountB = new BigNumber(prevTokenAmount);

        const incomeBN = (totalDaysB.times(incomeDiscountRatio).times(periodIncome).dividedBy(period)).plus((prevTokenAmountB.minus(soldAmountB)).times(periodIncome));
        console.log('\nincome in BN:', incomeBN, ', soldAmount', soldAmountB, ', totalDays', totalDaysB);
        return incomeBN;
      }
    });
  }
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


module.exports = {arrMin, arrMax, arrSum, arrAvg, incomeFromHoldingDays};
