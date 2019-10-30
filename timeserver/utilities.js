const fs = require('fs');
const path = require('path');

const { excludedSymbols, wlogger, COMPLIANCE_LEVELS } = require('../ethereum/contracts/zsetupData');
const { isLivetimeOn, fakeServertime, crowdfundingScenario } = require('./envVariables');

wlogger.info(`--------------------== utilities.js`);

const checkEq = (value1, value2) => {
  if (value1 === value2) {
    wlogger.debug(`checked ok`);
    return [true, ''];
  } else {
    wlogger.debug(`\x1b[31m [Error] _${value1} <vs> ${value2}_ ${typeof value1}, ${typeof value2}`);
    const err = Error('checkEq failed');
    return [false, err];
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

const isInvalidArray = value => 
    !Array.isArray(value) || value.length === 0;


const isAllTruthy = myObj => myObj.every(function(i) { return i; });

const isAllTrueBool = myObj => Object.keys(myObj).every(function(k){ return myObj[k] === true });//If you really want to check for true rather than just a truthy value

const getLocalTime = () => parseInt(new Date().myFormat());

const getTimeServerTime = () => {
  return new Promise(function (resolve, reject) {
    if(isLivetimeOn){
      resolve(getLocalTime());
    } else {
      resolve(fakeServertime);
    }

    // try {
    //   let time = fs.readFileSync(path.resolve(__dirname, "..", "time.txt"), "utf8").toString();
    //   resolve(time);
    // } catch (error) {
    //   wlogger.debug(`cannot find timeserver time. Use local time instead`);
    //   let time = new Date().myFormat();
    //   resolve(time);
    // }
  });
}

Date.prototype.myFormat = function () {
  return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

const testInputTime = (inputTime) => {
  // 201910220801
  console.log('inputTime:'+ inputTime+'<<');
  const inputTimeStr = inputTime + '';
    //const inputTime = parseInt(inputTime);

  if(inputTimeStr){
    if(inputTimeStr.match(/\D/g)){//  /\D/g   /[^$,.\d]/ 
      return [false, undefined, 'invalid character was found'];
    }
    const int_length = inputTimeStr.length;
    if(int_length !== 12){
      return [false, undefined, 'length is invalid: '+int_length];
    }
    const isIntBoolean = Number.isInteger(inputTime);
    if(isIntBoolean){
      const inputTimeNum = Number(inputTime);

      if(inputTimeNum < getLocalTime()-1){
        return [false, undefined, 'inputTime should not be in the past'];
      } else {
        return [true, inputTimeNum, 'inputTime is valid'];
      }

    } else {
      return [false, undefined, 'inputTime is not an integer'];
    }

  } else {
    return [false, undefined, 'inputTime is invalid'];
  }
}

const checkBoolTrueArray = (item) => item;
const isInt =(item) => Number.isInteger(item);
const isIntAboveZero =(item) =>  Number.isInteger(item) && Number(item) > 0;

const arraySum = arr => arr.reduce((a,b) => a + b, 0);
const makeIndexArray = (_length) => Array.from({length: _length}, (v, i) => i);
const sumIndexedValues = (indexes, values) => indexes.map(i => values[i]).reduce((accumulator,currentValue) => accumulator + currentValue);
const makeFakeTxHash = () => Math.random().toString(36).substring(2, 15);

const getAllIndexes = (arr, val) => {
  var indexes = [], i;
  for(i = 0; i < arr.length; i++){
      if (arr[i] === val) indexes.push(i);
  }
  return indexes;
}

const getArraysFromCSV = (eoaPath, itemNumberPerLine) => {
  const array = fs.readFileSync(eoaPath)
      .toString() // convert Buffer to string
      .split('\n') // split string to lines
      .map(e => e.trim()) // remove white spaces for each line
      .map(e => e.split(',').map(e => e.trim())); // split each line to array
 
  // wlogger.debug(`array[-3]:: ${array[array.length-3]);
  // wlogger.debug(`array[-2]:: ${array[array.length-2]);
  // wlogger.debug(`array[-1]:: ${array[array.length-1]);

  const good = [], bad = [];
  array.forEach((item, index)=> {
    if(item.length === itemNumberPerLine) {
      good.push(item);
    } else {
      if(item.length > 1){
        wlogger.debug(`item.length: ${item.length} =|${item}|=`);
        bad.push(item);
      }
    }
  });
  // const filtered = array.filter((el) => {
  //   return el.length === 4;
  // });
  // wlogger.debug(`filtered[-3]:: ${filtered[filtered.length-3]);
  // wlogger.debug(`filtered[-2]:: ${filtered[filtered.length-2]);
  // wlogger.debug(`filtered[-1]:: ${filtered[filtered.length-1]);

  //wlogger.debug(`as JSON:: ${JSON.stringify(data, '', 2)); // as json
//   data.forEach((item, index)=> {
//     //wlogger.debug(`\nitem: ${item}`);
//     wlogger.debug(`\n------------==index: ${index}
// EOA: ${item[1]} ${typeof item[1]}
// pkey: ${item[3]} ${typeof item[3]}`);
//   });
  return [good, bad];
}

const getOneAddrPerLineFromCSV = (eoaPath) => {
  const array = fs.readFileSync(eoaPath)
      .toString() // convert Buffer to string
      .split('\n') // split string to lines
      .map(e => e.trim()); // remove white spaces for each line
 
  //wlogger.debug(`array:: ${array);
  const good = [], bad = [];
  array.forEach((item, index)=> {
    if(item.substring(0,2) === '0x' && item.length === 42) {
      wlogger.debug(`${index} ${item} ${typeof item}`);
      good.push(item);
    } else {
      if(item.length > 1){
        wlogger.debug(`item.length: ${item.length} =|${item}|=`);
        bad.push(item);
      }
    }
  });

  return [good, bad];
}

//-------------------------==




const reduceArrays = (toAddressArray, amountArray) => {
  const toAddressArrayOut = [...new Set(toAddressArray)];
  wlogger.debug(`toAddressArrayOut: ${toAddressArrayOut}`);

  const amountArrayOut = [];
  for(let i = 0; i < toAddressArrayOut.length; i++){
    indexes = getAllIndexes(toAddressArray, toAddressArrayOut[i]);
    wlogger.debug(`indexes: ${indexes}`);
    sum = sumIndexedValues(indexes, amountArray);
    amountArrayOut.push(sum);
  }
  wlogger.debug(`amountArrayOut: ${amountArrayOut}`);
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

const getInvestQty = () => getRndIntegerBothEnd(500,1000);

const getUserIndexArray = (arraylength = 3) => {
  for (let idx = 0; idx < arraylength; idx++) {
    do{
      usrIdx = getRndIntegerBothEnd(0, 9);
    } while(userIndexArray.includes(usrIdx))
  }
}

const getBuyAmountArray = (totalAmount, price, fundingType) => {
  let maxAmountToBuy, remainder;
  const maxAmountPublic = COMPLIANCE_LEVELS['5'].maxOrderPaymentPublic;
  const maxBalancePublic = COMPLIANCE_LEVELS['5'].maxBalancePublic;

  if(fundingType === 1){//PO
    maxAmountToBuy = Math.floor(maxAmountPublic / price);
    remainder = maxAmountPublic - price * maxAmountToBuy;
    wlogger('fundingType: '+ fundingType+' Public with Regulations');
  } else {
    maxAmountToBuy = 20;
  }

  wlogger.debug(`maxAmountPublic: ${maxAmountPublic} ${typeof maxAmountPublic}, maxBalancePublic: ${maxBalancePublic} ${typeof maxBalancePublic}
totalAmount: ${totalAmount}, price: ${price}, maxAmountToBuy: ${maxAmountToBuy}, remainder: ${remainder}`);

  const amountArray = [];
  let remainingQty = totalAmount, isGood, mesg = '';
  do{
    //wlogger.debug(`remainingQty: ${remainingQty}`);
    let amount = getRndIntegerBothEnd(1, maxAmountToBuy);

    if(amount > remainingQty){
      amount = remainingQty;
    }
    amountArray.push(amount);
    remainingQty = remainingQty - amount;
    
  } while(remainingQty > 0);

  const amountSumOut = arraySum(amountArray);
  if(amountSumOut === totalAmount){
    isGood = true;
  } else {
    isGood = false;
  }
  wlogger.info(`\namountSumOut: ${amountSumOut} \nconst amountArray = [${amountArray}]; length: ${amountArray.length} \nisGood: ${isGood}, mesg: ${mesg}`);
  return [isGood, amountArray, mesg];
};


const getInputArrays = (arraylength = 3, totalTokenAmount) => {
  if(typeof arraylength !== 'number'){
    wlogger.error(`[Error] arraylength should be typeof number`);
    process.exit(1);
  } else if(arraylength > 10 || arraylength < 1) {
    wlogger.error(`[Error] arraylength should be <= 10 and >= 1`);
    process.exit(1);
  }
  //const totalTokenAmount = 750 * arraylength;
  wlogger.debug(`totalTokenAmount: ${totalTokenAmount}`)
  const userIndexArray = [];
  const tokenCountArray = [];
  let usrIdx;
  for (let idx = 0; idx < arraylength; idx++) {
    do{
      usrIdx = getRndIntegerBothEnd(0, 9);
    }while(userIndexArray.includes(usrIdx))
    //wlogger.debug(`usrIdx:: ${usrIdx);
    const remainingQty = totalTokenAmount-arraySum(tokenCountArray);

    if(idx === arraylength-1 && remainingQty > 0){
      userIndexArray.push(usrIdx);
      tokenCountArray.push(remainingQty);
      
    } else {
      let amountToInvest = getRndIntegerBothEnd(1, remainingQty * 0.5);
      if(amountToInvest < 1 || remainingQty < 1 ){
        continue;
      }
      tokenCountArray.push(amountToInvest);
      userIndexArray.push(usrIdx);
    } 
  }
  const tokenCountTotal = arraySum(tokenCountArray);
  wlogger.debug(`tokenCountTotal: ${tokenCountTotal}`);

  if(tokenCountTotal === totalTokenAmount && tokenCountArray.length === arraylength && userIndexArray.length === arraylength){
    wlogger.debug(`Tested Good: tokenCountTotal, tokenCountArray length, and userIndexArray length are all correct`);
    return [userIndexArray, tokenCountArray];
  } else {
    return [undefined, undefined];
  }
};


const makeCorrectAmountArray = (_amountArray, goal, maxTotal) => {
  console.log('\n------==inside makeCorrectAmountArray()');
  let userIndexArray, mesg = '', amountArrayOut = [..._amountArray], amountArrayOutSum, previousItem;
  if(crowdfundingScenario === 1){
    console.log('crowdfundingScenario:', crowdfundingScenario, ', ended with sold out');
    userIndexArray = makeIndexArray(amountArrayOut.length);

    amountArrayOutSum = arraySum(amountArrayOut);
    if(amountArrayOutSum === maxTotal){
      isGoodAmountArrayOutSum = true;
      console.error('[Good] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum)
    } else {
      isGoodAmountArrayOutSum = false;
      console.error('[Error] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum);
    }
  
  } else if(crowdfundingScenario === 2){
    console.log('crowdfundingScenario:', crowdfundingScenario, ', funding ended with goal reached');
    do {
      previousItem = amountArrayOut.pop();
      amountArrayOutSum = arraySum(amountArrayOut);
    } while( amountArrayOutSum >= goal && amountArrayOutSum < maxTotal);
    amountArrayOut.push(previousItem);
    amountArrayOutSum = arraySum(amountArrayOut);
    userIndexArray = makeIndexArray(amountArrayOut.length);

    if(goal <= amountArrayOutSum && amountArrayOutSum < maxTotal){
      isGoodAmountArrayOutSum = true;
      console.error('[Good] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum)
    } else {
      isGoodAmountArrayOutSum = false;
      console.error('[Error] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum);
    }

  } else if(crowdfundingScenario === 3){
    console.log('crowdfundingScenario:', crowdfundingScenario, ', funding failed');
    do {
      amountArrayOut.pop();
      amountArrayOutSum = arraySum(amountArrayOut);
    } while( amountArrayOutSum >= goal);
    userIndexArray = makeIndexArray(amountArrayOut.length);

    if(goal > amountArrayOutSum){
      isGoodAmountArrayOutSum = true;
      console.error('[Good] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum)
    } else {
      isGoodAmountArrayOutSum = false;
      console.error('[Error] isGoodAmountArrayOutSum:',isGoodAmountArrayOutSum);
    }
  }
  return [isGoodAmountArrayOutSum, amountArrayOut, userIndexArray, mesg];
}

//-----------------------------==
async function asyncForEach(array, callback) {
  wlogger.debug(`\n------------------==asyncForEach:\n ${array}`);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    wlogger.debug(`\n--------------==next in asyncForEach
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        wlogger.debug(`Skipping symbol: ${item.o_symbol}`);
        continue;
      } else {
        await callback(item, idx).catch((err) => {
          wlogger.debug(`\n[Error@asyncForEach > callback1] ${err}`);
        });
      }
    } else {
      await callback(item, idx).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEach > callback2] ${err}`);
      });
    }
  }
}

async function asyncForEachTsMain(array, callback) {
  wlogger.debug(`\n--------------==asyncForEachTsMain:\n${array}`);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    wlogger.debug(`\n--------------==next in asyncForEachTsMain()
    idx: ${idx}, ${item}`);
    if(typeof item === 'object' && item !== null){
      if(excludedSymbols.includes(item.o_symbol)){
        wlogger.debug(`Skipping symbol: ${item.o_symbol}`);
        continue;
      } else {
        await callback(item, idx, array).catch((err) => {
          wlogger.debug(`\n[Error@asyncForEachTsMain > callback1] ${err}`);
        });
      }
    } else {
      await callback(item, idx, array).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachTsMain > callback2] ${err}`);
      });
    }
  }
}

async function asyncForEachMint(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachMint`);
  const idxMintMax = toAddrArray.length -1;
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachMint
    idxMint: ${idxMint} out of ${idxMintMax}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachMint > callback] ${err}`);
      });
  }
}
async function asyncForEachMint2(toAddrArray, idxMint, idxMintMax, callback) {
  wlogger.debug(`\n------------------==asyncForEachMint2`);
  const idxMintSubMax = toAddrArray.length -1;
  for (let idxMintSub = 0; idxMintSub < toAddrArray.length; idxMintSub++) {
    const toAddr = toAddrArray[idxMintSub];
    wlogger.debug(`\n--------------==next in asyncForEachMint2
    idxMintSub: ${idxMintSub} out of ${idxMintSubMax}
    idxMint: ${idxMint} out of ${idxMintMax}
    toAddress: ${toAddr}`);
    await callback(toAddr, idxMintSub).catch((err) => {
      wlogger.debug(`\n[Error@asyncForEachMint2 > callback] ${err}`);
    });
  }
}


async function asyncForEachCFC(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachCFC`);
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachCFC
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachCFC > callback] ${err}`);
      });
  }
}

async function asyncForEachAbCFC(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachAbCFC`);
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachAbCFC
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachAbCFC > callback] ${err}`);
      });
  }
}

async function asyncForEachAbCFC2(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachAbCFC2`);
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachAbCFC2
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachAbCFC2 > callback] ${err}`);
      });
  }
}

async function asyncForEachAbCFC3(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachAbCFC3`);
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachAbCFC3
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachAbCFC3 > callback] ${err}`);
      });
  }
}

async function asyncForEachOrderExpiry(toAddrArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachOrderExpiry`);
  for (let idxMint = 0; idxMint < toAddrArray.length; idxMint++) {
    const toAddr = toAddrArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachOrderExpiry
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachOrderExpiry > callback] ${err}`);
      });
  }
}

async function asyncForEachAssetRecordRowArray(inputArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachAssetRecordRowArray`);
  for (let idxMint = 0; idxMint < inputArray.length; idxMint++) {
    const toAddr = inputArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachAssetRecordRowArray
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachAssetRecordRowArray > callback] ${err}`);
      });
  }
}

async function asyncForEachAssetRecordRowArray2(inputArray, callback) {
  wlogger.debug(`\n------------------==asyncForEachAssetRecordRowArray2`);
  for (let idxMint = 0; idxMint < inputArray.length; idxMint++) {
    const toAddr = inputArray[idxMint];
    wlogger.debug(`\n--------------==next in asyncForEachAssetRecordRowArray2
    idxMint: ${idxMint}, ${toAddr}`);
      await callback(toAddr, idxMint).catch((err) => {
        wlogger.debug(`\n[Error@asyncForEachAssetRecordRowArray2 > callback] ${err}`);
      });
  }
}


const checkTargetAmounts = (existingBalances, targetAmounts) => {
  let mesg = '', isAllGood;
  const isGoodArray = [];

  if(isEmpty(existingBalances) || isEmpty(targetAmounts)){
    mesg = 'existingBalances or targetAmounts is emtpy!';
    //throw new Error(mesg);
    wlogger.warn(`${mesg}`);
    return [isGoodArray, false];
  }
  if(existingBalances.length !== targetAmounts.length){
    mesg = 'existingBalances and targetAmounts are of different length';
    //throw new Error(mesg);
    wlogger.warn(`${mesg}`);
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
  wlogger.debug(`\n-----------------==\ninside breakdownArray: amount: ${amount} \ntoAddress: ${toAddress}`);
  let mesg = '';
  if(isEmpty(toAddress) || isEmpty(amount) || isEmpty(maxMintAmountPerRun)){
    mesg = 'toAddress, amount, or maxMintAmountPerRun is not valid!';
    wlogger.debug(`${mesg}`);
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
  wlogger.debug(`toAddressOut: ${toAddressOut}, amountOut: ${amountOut}`);
  return [toAddressOut, amountOut];
}

const breakdownArrays = (toAddressArray, amountArray, maxMintAmountPerRun) => {
  wlogger.debug(`\n-----------------==\ninside breakdownArrays: amountArray: ${amountArray}  \ntoAddressArray: ${toAddressArray}`);

  if(toAddressArray.length !== amountArray.length){
    wlogger.debug(`amountArray and toAddressArray should have the same length!`);
    return [undefined, undefined];
  }

  wlogger.debug(`for loop...`);
  const amountArrayOut = [];
  const toAddressArrayOut = [];
  for (let idx = 0; idx < amountArray.length; idx++) {
    const amount = parseInt(amountArray[idx]);
    wlogger.debug(`idx: ${idx}, amount: ${amount}`);

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
    wlogger.debug(`amountArrayOut: ${amountArrayOut}`);
    wlogger.debug(`toAddressArrayOut: ${toAddressArrayOut}`);
  }
  return [toAddressArrayOut, amountArrayOut];
}


const validateEmail =(email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  reduceArrays, checkEq, isEmpty, isNoneInteger, isAllTrueBool, getTimeServerTime, getLocalTime, testInputTime, getArraysFromCSV, getOneAddrPerLineFromCSV, validateEmail, asyncForEach, asyncForEachTsMain, asyncForEachMint, asyncForEachMint2, asyncForEachCFC, asyncForEachAbCFC, asyncForEachAbCFC2, asyncForEachAbCFC3, asyncForEachOrderExpiry, asyncForEachAssetRecordRowArray, asyncForEachAssetRecordRowArray2, checkTargetAmounts, breakdownArray, breakdownArrays, isInt, isIntAboveZero, checkBoolTrueArray, arraySum, getRndIntegerBothEnd, getBuyAmountArray, getInputArrays, makeFakeTxHash, makeIndexArray, makeCorrectAmountArray
}