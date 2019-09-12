const fs = require('fs');
const path = require('path');

const { excludedSymbols } = require('../ethereum/contracts/zsetupData');
console.log('--------------------== utilities.js');
//----------------------------==Log
let IS_LOG_ON;
// try{
//   IS_LOG_ON = process.env.IS_LOG_ON;
// } catch(err){
//   console.log(`${err}`);
// };
if(process.env.IS_LOG_ON){
  console.log(`process.env.IS_LOG_ON: ${process.env.IS_LOG_ON}=> true`);
} else{
  console.log(`process.env.IS_LOG_ON: ${process.env.IS_LOG_ON}=>false`);
}
const sLog = str => {
  if(process.env.IS_LOG_ON){
    console.log(str);
  }
}

const checkEq = (value1, value2) => {
  if (value1 === value2) {
    console.log('checked ok');
  } else {
    console.log("\x1b[31m", '[Error] _' + value1 + '<vs>' + value2 + '_', typeof value1, typeof value2);
    const err = Error('checkEq failed');
    //process.exit(1);
  }
}
//----------------------------==
const isEmpty = value => 
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0) || (typeof value === 'string' && value === 'undefined');

const isNoneInteger = value => 
    value === undefined ||
    value === null ||
    (typeof value === 'object') ||
    (typeof value === 'string' && isNaN(parseInt(value)));

const isAllTruthy = myObj => myObj.every(function(i) { return i; });

const isAllTrueBool = myObj => Object.keys(myObj).every(function(k){ return myObj[k] === true });//If you really want to check for true rather than just a truthy value


const getTimeServerTime = () => {
  return new Promise(function (resolve, reject) {
    try {
      let time = fs.readFileSync(path.resolve(__dirname, "..", "time.txt"), "utf8").toString();
      resolve(time);
    } catch (error) {
      console.log(`cannot find timeserver time. Use local time instead`);
      let time = new Date().myFormat();
      resolve(time);
    }
  });
}

const getLocalTime = () => parseInt(new Date().myFormat());

Date.prototype.myFormat = function () {
  return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};


const checkBoolTrueArray = (item) => item;
const checkInt =(item) => Number.isInteger(item);
const checkIntFromOne =(item) =>  Number.isInteger(item) && Number(item) > 0;

const arraySum = arr => arr.reduce((a,b) => a + b, 0);

const sumIndexedValues = (indexes, values) => indexes.map(i => values[i]).reduce((accumulator,currentValue) => accumulator + currentValue);

const getAllIndexes = (arr, val) => {
  var indexes = [], i;
  for(i = 0; i < arr.length; i++){
      if (arr[i] === val) indexes.push(i);
  }
  return indexes;
}

const reduceArrays = (toAddressArray, amountArray) => {
  const toAddressArrayOut = [...new Set(toAddressArray)];
  console.log('toAddressArrayOut', toAddressArrayOut);

  const amountArrayOut = [];
  for(let i = 0; i < toAddressArrayOut.length; i++){
    indexes = getAllIndexes(toAddressArray, toAddressArrayOut[i]);
    console.log('indexes', indexes);
    sum = sumIndexedValues(indexes, amountArray);
    amountArrayOut.push(sum);
  }
  console.log('amountArrayOut', amountArrayOut);
  return [toAddressArrayOut, amountArrayOut];
}

const arraysSortedEqual = (array1, array2) => {
  if (array1 === array2) return true;
  if (array1 == null || array2 == null) return false;
  if (array1.length != array2.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  let array1out = array1.sort((a, b) => a - b); // For ascending sort
  let array2out = array2.sort((a, b) => a - b); // For ascending sort
  //numArray.sort((array1, array2) => array2 - array1); // For descending sort

  for (let i = 0; i < array1out.length; ++i) {
    if (array1out[i] !== array2out[i]) return false;
  }
  return true;
}

const getRndIntegerBothEnd = ((min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
});
const getUsrIdx = () => getRndIntegerBothEnd(1, 10);// 1 ~ 10

const getInvestQty = () => getRndIntegerBothEnd(500,1000);

const getInputArrays = (arraylength = 3, totalAmountToInvest) => {
  if(typeof arraylength !== 'number'){
    console.error('[Error] arraylength should be typeof number');
    process.exit(1);
  } else if(arraylength > 10 || arraylength < 1) {
    console.error('[Error] arraylength should be <= 10 and >= 1');
    process.exit(1);
  }
  //const totalAmountToInvest = 750 * arraylength;
  console.log(`totalAmountToInvest: ${totalAmountToInvest}`)
  const userIndexArray = [];
  const tokenCountArray = [];
  let usrIdx;
  for (let idx = 0; idx < arraylength; idx++) {
    do{
      usrIdx = getUsrIdx();
    }while(userIndexArray.includes(usrIdx))

    const remainingQty = totalAmountToInvest-arraySum(tokenCountArray);

    if(idx === arraylength-1 && remainingQty > 0){
      userIndexArray.push(usrIdx);
      tokenCountArray.push(remainingQty);
      
    } else {
      let tokenCountHold = getRndIntegerBothEnd(1, remainingQty)
      if(tokenCountHold < 1 || remainingQty < 1 ){
        continue
      }
      tokenCountArray.push(tokenCountHold);
      userIndexArray.push(usrIdx);
    } 
  }
  const tokenCountTotal = arraySum(tokenCountArray);
  console.log('tokenCountTotal:', tokenCountTotal);
  return [userIndexArray, tokenCountArray];
};


async function asyncForEach(array, callback) {
  console.log('\n------------------==asyncForEach:', array);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    console.log(`\n--------------==next in asyncForEach
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        console.log('Skipping symbol:', item.o_symbol);
        continue;
      } else {
        await callback(item, idx).catch((err) => {
          console.log('\n[Error@asyncForEach > callback1]', err);
        });
      }
    } else {
      await callback(item, idx).catch((err) => {
        console.log('\n[Error@asyncForEach > callback2]', err);
      });
    }
  }
}

async function asyncForEachTsMain(array, callback) {
  console.log("\n--------------==asyncForEachTsMain:", array);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    console.log(`--------------==next in asyncForEachTsMain()
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        console.log('Skipping symbol:', item.o_symbol);
        continue;
      } else {
        await callback(item, idx, array).catch((err) => {
          console.log('\n[Error@asyncForEachTsMain > callback1]', err);
        });
      }
    } else {
      await callback(item, idx, array).catch((err) => {
        console.log('\n[Error@asyncForEachTsMain > callback2]', err);
      });
    }
  }
}

async function asyncForEachMint(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachMint');
  const idxMintMax = toAddrArray.length -1;
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachMint
    idxMint: ${idxMint} out of ${idxMintMax}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachMint > callback]', err);
      });
  }
}
async function asyncForEachMint2(toAddrArray, idxMint, idxMintMax, callback) {
  console.log('\n------------------==asyncForEachMint2');
  const idxMintSubMax = toAddrArray.length -1;
  for (let idxMintSub = 0; idxMintSub < toAddrArray.length; idxMintSub++) {
    const toAddr = toAddrArray[idxMintSub];
    console.log(`\n--------------==next in asyncForEachMint2
    idxMintSub: ${idxMintSub} out of ${idxMintSubMax}
    idxMint: ${idxMint} out of ${idxMintMax}
    toAddress: ${toAddr}`);
    await callback(toAddr, idxMintSub).catch((err) => {
      console.log('\n[Error@asyncForEachMint2 > callback]', err);
    });
  }
}


async function asyncForEachCFC(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachCFC');
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachCFC
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachCFC > callback]', err);
      });
  }
}

async function asyncForEachAbCFC(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachAbCFC');
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachAbCFC
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachAbCFC > callback]', err);
      });
  }
}

async function asyncForEachAbCFC2(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachAbCFC2');
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachAbCFC2
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachAbCFC2 > callback]', err);
      });
  }
}

async function asyncForEachAbCFC3(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachAbCFC3');
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachAbCFC3
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachAbCFC3 > callback]', err);
      });
  }
}

async function asyncForEachOrderExpiry(toAddrArray, callback) {
  console.log('\n------------------==asyncForEachOrderExpiry');
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    console.log(`\n--------------==next in asyncForEachOrderExpiry
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachOrderExpiry > callback]', err);
      });
  }
}

async function asyncForEachAssetRecordRowArray(inputArray, callback) {
  console.log('\n------------------==asyncForEachAssetRecordRowArray');
  for (let idxMint = 0; idxMint < inputArray.length; idxMint++) {
    const toAddr = inputArray[idxMint];
    console.log(`\n--------------==next in asyncForEachAssetRecordRowArray
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachAssetRecordRowArray > callback]', err);
      });
  }
}

async function asyncForEachAssetRecordRowArray2(inputArray, callback) {
  console.log('\n------------------==asyncForEachAssetRecordRowArray2');
  for (let idxMint = 0; idxMint < inputArray.length; idxMint++) {
    const toAddr = inputArray[idxMint];
    console.log(`\n--------------==next in asyncForEachAssetRecordRowArray2
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        console.log('\n[Error@asyncForEachAssetRecordRowArray2 > callback]', err);
      });
  }
}


const checkTargetAmounts = (existingBalances, targetAmounts) => {
  let mesg = '', isAllGood;
  const isGoodArray = [];

  if(isEmpty(existingBalances) || isEmpty(targetAmounts)){
    mesg = 'existingBalances or targetAmounts is emtpy!';
    //throw new Error(mesg);
    console.log(mesg);
    return [isGoodArray, false];
  }
  if(existingBalances.length !== targetAmounts.length){
    mesg = 'existingBalances and targetAmounts are of different length';
    //throw new Error(mesg);
    console.log(mesg);
    return [isGoodArray, false];
  }

  existingBalances.forEach((item,idx) => {
    const boolValue = item <= targetAmounts[idx];
    isGoodArray.push(boolValue);
  });
  if(isGoodArray.includes(false)){
    isAllGood = false
  } else {
    isAllGood = true;
  }
  return [isGoodArray, isAllGood];
}

const breakdownArray = (toAddress, amount, maxMintAmountPerRun) => {
  console.log('\n-----------------==\ninside breakdownArray: amount', amount, '\ntoAddress', toAddress);
  let mesg = '';
  if(isEmpty(toAddress) || isEmpty(amount) || isEmpty(maxMintAmountPerRun)){
    mesg = 'toAddress, amount, or maxMintAmountPerRun is not valid!';
    console.log(mesg);
    //throw new Error();
    return [undefined, undefined];
  }
  const toAddressOut = [];
  const amountOut = [];

  if(amount > maxMintAmountPerRun){
    const quotient = Math.floor(amount / maxMintAmountPerRun);
    const remainder = amount - maxMintAmountPerRun * quotient;
    const subamount = Array(quotient).fill(maxMintAmountPerRun);
    if(remainder > 0){ subamount.push(remainder); }
    amountOut.push(...subamount);

    const subToAddressArray = Array(subamount.length).fill(toAddress);
    toAddressOut.push(...subToAddressArray);
  } else {
    toAddressOut.push(toAddress);
    amountOut.push(amount);
  }
  console.log(`toAddressOut: ${toAddressOut}, amountOut: ${amountOut}`);
  return [toAddressOut, amountOut];
}

const breakdownArrays = (toAddressArray, amountArray, maxMintAmountPerRun) => {
  console.log('\n-----------------==\ninside breakdownArrays: amountArray', amountArray, '\ntoAddressArray', toAddressArray);

  if(toAddressArray.length !== amountArray.length){
    console.log('amountArray and toAddressArray should have the same length!');
    return [undefined, undefined];
  }

  console.log('for loop...');
  const amountArrayOut = [];
  const toAddressArrayOut = [];
  for (let idx = 0; idx < amountArray.length; idx++) {
    const amount = parseInt(amountArray[idx]);
    console.log('idx', idx, ', amount', amount);

    if(amount > maxMintAmountPerRun){
      const quotient = Math.floor(amount / maxMintAmountPerRun);
      const remainder = amount - maxMintAmountPerRun * quotient;
      const subAmountArray = Array(quotient).fill(maxMintAmountPerRun);
      if(remainder > 0){ subAmountArray.push(remainder); }
      amountArrayOut.push(...subAmountArray);

      const subToAddressArray = Array(subAmountArray.length).fill(toAddressArray[idx]);
      toAddressArrayOut.push(...subToAddressArray);
      //amountArrayOut.splice(amountArrayOut.length, 0, ...subAmountArray);
    } else {
      amountArrayOut.push(amount);
      toAddressArrayOut.push(toAddressArray[idx]);
    }
    console.log('amountArrayOut', amountArrayOut);
    console.log('toAddressArrayOut', toAddressArrayOut);
  }
  return [toAddressArrayOut, amountArrayOut];
}


const validateEmail =(email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  reduceArrays, checkEq, sLog, isEmpty, isNoneInteger, isAllTrueBool, getTimeServerTime, getLocalTime, validateEmail, asyncForEach, asyncForEachTsMain, asyncForEachMint, asyncForEachMint2, asyncForEachCFC, asyncForEachAbCFC, asyncForEachAbCFC2, asyncForEachAbCFC3, asyncForEachOrderExpiry, asyncForEachAssetRecordRowArray, asyncForEachAssetRecordRowArray2, checkTargetAmounts, breakdownArray, breakdownArrays, checkInt, checkIntFromOne, checkBoolTrueArray, arraySum, getRndIntegerBothEnd, getInputArrays
}