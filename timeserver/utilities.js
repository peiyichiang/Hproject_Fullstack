const fs = require('fs');
const path = require('path');

const { excludedSymbols } = require('../ethereum/contracts/zsetupData');

const isEmpty = value => 
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

const getTime = () => {
  return new Promise(function (resolve, reject) {
      try {
          let time = fs.readFileSync(path.resolve(__dirname, "..", "time.txt"), "utf8").toString()
          resolve(time)
      } catch (error) {
          console.log(`cannot find timeserver time. Use local time instead`);
          let time = new Date().myFormat()
          resolve(time)
      }
  })
}
Date.prototype.myFormat = function () {
  return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};


const checkInt =(item) => Number.isInteger(item);
const checkIntFromOne =(item) =>  Number.isInteger(item) && Number(item) > 0;
const checkBoolTrueArray = (item) => item;


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


const breakdownArray = (toAddress, amount, maxMintAmountPerRun) => {
  console.log('\n-----------------==\ninside breakdownArray: amount', amount, '\ntoAddress', toAddress);

  if(isEmpty(toAddress) || isEmpty(amount) || isEmpty(maxMintAmountPerRun)){
    console.log('toAddress, amount, or maxMintAmountPerRun is not valid!');
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

const validateEmail =(email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  reduceArrays, isEmpty, getTime, validateEmail, asyncForEach, asyncForEachTsMain, asyncForEachMint, asyncForEachMint2, asyncForEachAbCFC, asyncForEachAbCFC2, asyncForEachAbCFC3, asyncForEachOrderExpiry, asyncForEachAssetRecordRowArray, asyncForEachAssetRecordRowArray2, breakdownArray, breakdownArrays, checkInt, checkIntFromOne, checkBoolTrueArray
}