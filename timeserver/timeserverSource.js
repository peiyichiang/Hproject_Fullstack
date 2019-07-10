const schedule = require('node-schedule');
// const os = require('os');
// const net = require("net");
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const log = console.log;

const { getTime } = require('./utilities');
const { whichTimeServerArray } = require('../ethereum/contracts/zsetupData');
const { calculatePeriodicProfit } = require('../timeserver/mysql');
const { updateExpiredOrders, updateFundingStateFromDB, updateTokenStateFromDB, addAssetbooksIntoCFC, makeOrdersExpiredCFED2 } = require('./blockchain.js');
/**
"time": "concurrently -n timeserver,manager,rent,crowdfunding,order,tokencontroller \"npm run timeserver\" \"npm run manager\" \"npm run rent\" \"npm run crowdfunding\" \"npm run order\" \"npm run tokencontroller\"",
*/
const mode = 1;
const timeInverval = 60;//a minimum limit of about 20 seconds for every 3 new orders that have just been paid. Any value smaller than that will overwhelm the blockchain ..
const atTheNsecond = 1;
let modeStr;
if(mode === 1){
  modeStr = '*/'+timeInverval;
} else if(mode === 2){
  modeStr = ''+atTheNsecond;
}
// '*/5 * * * * *' ... for every 5 seconds
// '10 * * * * *'  ... for every 10th seconds
// '59 * * * * *'  ... for every 59th seconds
schedule.scheduleJob(modeStr+' * * * * *', async function () {
    getTime().then(function (time) {
      console.log(`----------------==[timeserverSource.js] current time: ${time}`);
    });
    let date = new Date().myFormat();
    //console.log('--------------==\n',date.slice(0, 4), 'year', date.slice(4, 6), 'month', date.slice(6, 8), 'day', date.slice(8, 10), 'hour', date.slice(10, 12), 'minute');

    fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), date, function (err) {
        if (err) console.error(`[Error @ timeserverSource] failed at writing to date.txt`);
    });

    let serverTime;
    try {
      serverTime = parseInt(date.toString());
    } catch(err) {
      console.log('[Error] serverTime is not an integer', date.toString());
      process.exit(0);
    }
    console.log('[timeserverSource.js] serverTime:', serverTime);
  
    if(whichTimeServerArray.length < 6){
      console.log('\n[Error] whichTimeServerArray length is < 6 ... bypassing services...');
    } else {
      if(whichTimeServerArray[0] > 0){
        addAssetbooksIntoCFC(serverTime);//blockchain.js
        // after order status change: waiting -> paid -> write into crowdfunding contract
      };
      if(whichTimeServerArray[1] > 0){
        const result = await makeOrdersExpiredCFED2(serverTime).catch((err) => {
          reject('[Failed @ timeserver: makeOrdersExpiredCFED2]: '+ err);
        });;//blockchain.js
        if(result){
          log(chalk.green('>> [Success@ timeserver] makeOrdersExpiredCFED2();'));
        } else {
          log(chalk.red('>> [Fail@ timeserver] makeOrdersExpiredCFED2() returns false;'));
        };//blockchain.js

        // after orders pass CFED2, we make such orders expired
      };
      if(whichTimeServerArray[2] > 0){
        const result = await updateExpiredOrders(serverTime).catch((err) => {
          reject('[Failed @ timeserver: updateExpiredOrders]: '+ err);
        });
        if(result){
          log(chalk.green('>> [Success@ timeserver] updateExpiredOrders();'));
        } else {
          log(chalk.red('>> [Fail@ timeserver] updateExpiredOrders() returns false;'));
        };//blockchain.js
        //find still funding symbols that have passed CDED2 -> expire all orders of that symbol
      };
      if(whichTimeServerArray[3] > 0){
        const result = await updateFundingStateFromDB(serverTime).catch((err) => {
          reject('[Failed @ timeserver: updateFundingStateFromDB]: '+ err);
        });
        if(result){
          log(chalk.green('>> [Success@ timeserver] updateFundingStateFromDB();'));
        } else {
          log(chalk.red('>> [Fail@ timeserver] updateFundingStateFromDB() returns false;'));
        };//blockchain.js
        //From DB check if product:fundingState needs to be updated, except fundingClosed/notClosed
      };
      if(whichTimeServerArray[4] > 0){
        const result = await updateTokenStateFromDB(serverTime).catch((err) => {
          reject('[Failed @ timeserver: updateTokenStateFromDB]: '+ err);
        });
        if(result){
          log(chalk.green('>> [Success@ timeserver] updateTokenStateFromDB();'));
        } else {
          log(chalk.red('>> [Fail@ timeserver] updateTokenStateFromDB() returns false;'));
        };//blockchain.js
        //From DB check if product:tokenState needs to be updated
      };
      if(whichTimeServerArray[5] > 0){
        //calculatePeriodicProfit(serverTime);//blockchain.js
      }
  
    }
    // fs.readFile(path.resolve(__dirname, '..', 'data', 'target.json'), function (err, data) {
    //     if (err) console.error(`[Error @ timeserverSource] failed at reading date.txt`);
    //     else {
    //         let targets = JSON.parse(data.toString());
    //         // for(let i = 0; i < targets.length; i++) {
    //         //     sendTime(date, targets[i].host, targets[i].port)
    //         // }
    //     }
    // })
});

// function sendTime(date, host, port) {

//     var client = net.createConnection({ host, port });
//     client.on("error", err => {
//         console.log(`${host}:${port} 連結失敗`)
//     });

//     client.write(date)
//     client.end();
// }


//if (serverTime >= oPurchaseDate.add3Day()) {
// Date.prototype.myFormat = function () {
//     return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
// };

// Object.prototype.add3Day = function () {
//   let year = parseInt(this.toString().slice(0, 4));
//   let month = parseInt(this.toString().slice(4, 6));
//   let day = parseInt(this.toString().slice(6, 8));
//   let hour = parseInt(this.toString().slice(8, 10));
//   let minute = parseInt(this.toString().slice(10, 12));
//   return new Date(year, month - 1, day + 3, hour, minute).myFormat();
// }
