const bcrypt = require('bcrypt');

const saltRounds = 10;//DON"T SET THIS TOO BIG!!!

const myPlaintextPassword = '1111';

//
bcrypt
  .hash(myPlaintextPassword, saltRounds)
  .then(hash => {
    console.log(`Hash1: ${hash}`);

    // Store hash in your password DB.
  })
  .catch(err => console.error(err.message));

//Generate a salt and hash on separate function calls.
//each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
bcrypt
  .genSalt(saltRounds)
  .then(salt => {
    console.log(`Salt: ${salt}`);

    return bcrypt.hash(myPlaintextPassword, salt);
  })
  .then(hash => {
    console.log(`Hash2: ${hash}`);

    // Store hash in your password DB.
  })
  .catch(err => console.error(err.message));

// async function bcryptHash (pw, sr) {
//   console.log('inside bcryptHash', pw, sr);
//   bcrypt.hash(pw, sr).then(function(hash) {
//     console.log('hash', hash);
//     return hash;
  // bcrypt.hash(pw, sr, function(err, hash) {
  //   if (err) console.log('err', err)
  //   else {
  //     console.log('hash successful', hash);
  //     // Store hash in your password DB.
  //     return hash;
  //   }
//  });
  // bcrypt.hash(pw, sr).then(function(hash) {
  //   // Store hash in your password DB.
  // });
//};
//hash $2b$10$ouVr6Q2aBSPd7PD0TXhew.YwVkiR8I2j4ys2LR.PYZoJzNN1JC4/u
// const hash1 = bcryptHash(myPlaintextPassword, saltRounds);
//  console.log('returned hash1', hash1);

//bcryptHash(someOtherPlaintextPassword, saltRounds);

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