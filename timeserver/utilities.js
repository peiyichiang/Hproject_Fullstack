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

module.exports = {
  reduceArrays,
}