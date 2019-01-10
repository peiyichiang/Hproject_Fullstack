const bcrypt = require('bcrypt');

const saltRounds = 10;//DON"T SET THIS TOO BIG!!!

const myPlaintextPassword = 'gJ()@*#HG3i2';
const myPlaintextPassword2 = '1111';

const hash1 = "$2b$10$Jpzhv7x1B8kZpta1K8ZUie/wU5OY78nrJm3Qu6kcfrrEoBg5Gu9vO";
const hash2 = "$2b$10$aa9rnLhywticzUfH.t4v.uw3fytejK27.zsdJOrpDdcGv2wH43Ar6";

bcrypt
  .compare(myPlaintextPassword2, hash1)
  .then(res => {
    console.log(res);
  })
  .catch(err => console.error(err.message));

// bcrypt.compare(myPlaintextPassword, hash1).then(function(res) {
//   console.log('res', res);
//   // res == true
// }).catch(err => {console.log(err)});
// bcrypt.compare(someOtherPlaintextPassword, hash1).then(function(res) {
//   console.log('res', res);
//   // res == false
// }).catch(err => {console.log(err)});

// async function checkUser(username, password) {
//   //... fetch user from a db etc.

//   const match = await bcrypt.compare(password, user.passwordHash);

//   if(match) {
//       //login
//   }

//   //...
// }