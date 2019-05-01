const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const sequentialRun = async (arrayInput, waitTime) => {
  await asyncForEach(arrayInput, async (num) => {
    console.log(num**2);
    console.log('after executing');
    await waitFor(waitTime);
  });
  console.log('Done');
}

const arrayInput = [1, 2, 3];
sequentialRun(arrayInput, 1000);

const value = 201907070000;
// console.log('string', isInt('gbwserher'));
// console.log('string', isInt('201907070000'));
// console.log('integer', isInt(value));
console.log('typeof 201907070000', typeof value);
console.log('Number.isInteger()', Number.isInteger(value));
console.log('Number.isInteger()', Number.isInteger(value.toString()));
console.log('Number.isInteger()', Number.isInteger('vfsegve'));
console.log('Number.isInteger()', Number.isInteger(undefined));
console.log('Number.isInteger()', Number.isInteger(null));

