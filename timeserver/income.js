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
 * @param {*} args = array of integers as holdingDays OR ["nonArray", addrAssetbook, symbol]
 * @param {*} period = period of the period income below
 * @param {*} periodIncome = ... see above
 * @param {*} prevTokenAmount = token amount at the end of the last period
 */
const incomeFromHoldingDays = (args, period, periodIncome, prevTokenAmount) => {
  return new Promise((resolve, reject) => {
    const incomeDiscountRatio = 0.7;
    
    if(period < 1){
      reject('[Error] period < 1. period:', period);
    } else if(!Number.isInteger(period)){
      reject('[Error] period is not an integer! period:', period);
    }

    //the only input value that may have rounding error
    if(periodIncome < 0){
      reject('[Error] periodIncome < 0');
    }

    if(!Number.isInteger(prevTokenAmount)){
      reject('[Error] prevTokenAmount is not an integer. prevTokenAmount:', prevTokenAmount);
    } else if(prevTokenAmount < 0){
      reject('[Error] prevTokenAmount < 0. prevTokenAmount:', prevTokenAmount);
    }

    //check if args are an array of holdingDays OR
    if(Number.isInteger(args[0])){
      //each args is a holdingDays number that has one tokenId
      const soldAmount = args.length;
      if( soldAmount === 0){
        reject('[Error] holdingDays has length of zero! holdingDays:', args);
      }
      if(!Number.isInteger(soldAmount)){
        reject('[Error] soldAmount is not an integer. soldAmount:', soldAmount);
      } else if(soldAmount < 0){
        reject('[Error] soldAmount < 0. soldAmount:', soldAmount);
      }
    
      if(prevTokenAmount < soldAmount){
        reject('prevTokenAmount should be >= soldAmount');
      }
    
      const totalDays = arrSum(args);
      const totalDaysB = new BigNumber(totalDays);
      const prevTokenAmountB = new BigNumber(prevTokenAmount);
      const soldAmountB = new BigNumber(soldAmount);

      const incomeBN = (totalDaysB.times(incomeDiscountRatio).times(periodIncome).dividedBy(period)).plus((prevTokenAmountB.minus(soldAmountB)).times(periodIncome));
      console.log('\nincome in BN:', incomeBN, 'totalDays', totalDays);
      resolve(incomeBN);
    
    //check if args are an array of string, symbol, addrAssetbook
    } else if(args.length === 3) {
      const symbol = args[1];
      const addrAssetbook = args[2];

      mysqlPoolQuery('SELECT COUNT(t_holdingDays), SUM(t_holdingDays) FROM transaction_info where t_txCount = 1 AND t_tokenSYMBOL = ? AND t_fromAssetbook = ?', [symbol, addrAssetbook], function (err, result) {
        if (err) {
          reject(`\n[Error] Failed at getting sum of holdingDays. symbol: ${symbol}, addrAssetbook: ${addrAssetbook}, err: ${err}`);
        } else {
          console.log('\n[Success] Count and Sum of holdingDays:', result, result[0]['COUNT(t_holdingDays)'], result[0]['SUM(t_holdingDays)']);

          const soldAmountB = new BigNumber(result[0]['COUNT(t_holdingDays)']);
          const totalDaysB = new BigNumber(result[0]['SUM(t_holdingDays)']);
          //const periodB = new BigNumber(period);
          const prevTokenAmountB = new BigNumber(prevTokenAmount);

          const incomeBN = (totalDaysB.times(incomeDiscountRatio).times(periodIncome).dividedBy(period)).plus((prevTokenAmountB.minus(soldAmountB)).times(periodIncome));
          console.log('\nincome in BN:', incomeBN, ', soldAmount:', soldAmountB, ', totalDays:', totalDaysB);
          resolve(incomeBN);
        }
      });
    }
  });
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
