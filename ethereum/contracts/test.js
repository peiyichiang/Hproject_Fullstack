var faker = require('faker');
var _ = require('lodash');
let output = '';

console.log(faker.random.word(1) + faker.random.number(999999999))
var originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    output += chunk;
  }

  return originalStderrWrite(chunk, encoding, callback);
};
console.error("err");

process.stderr.write = originalStderrWrite;
console.log(output);
//console.log(hold)
//process.exit(1)