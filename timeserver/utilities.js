const fs = require('fs');
const path = require('path');

const { excludedSymbols } = require('../ethereum/contracts/zsetupData');


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
  console.log('----------------==asyncForEach: array', array);
  for (let idx = 0; idx < array.length; idx++) {
    const item = array[idx];
    console.log(`\n--------------==next in asyncForEach
    idx: ${idx}, ${item}`);
    if(excludedSymbols.includes(item.o_symbol)){
      console.log('Skipping symbol:', item.o_symbol);
      continue;
    } else {
      await callback(item, idx, array);
    }
  }
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

const isEmpty = value => 
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

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
  reduceArrays, isEmpty, getTime, validateEmail, asyncForEach, checkInt, checkIntFromOne, checkBoolTrueArray
}