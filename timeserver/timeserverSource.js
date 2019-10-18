const schedule = require('node-schedule');
// const path = require('path');
// const fs = require('fs');

const { wlogger } = require('../ethereum/contracts/zsetupData');
const { getTimeServerTime } = require('./utilities');
const { timeserverMode, timeserverTimeInverval, is_addAssetbooksIntoCFC, is_makeOrdersExpiredCFED, is_updateExpiredOrders, is_updateFundingStateFromDB, is_updateTokenStateFromDB, is_calculateLastPeriodProfit } = require('./envVariables');
const { calculateLastPeriodProfit } = require('../timeserver/mysql');
const { updateExpiredOrders, updateFundingStateFromDB, updateTokenStateFromDB, addAssetbooksIntoCFC, makeOrdersExpiredCFED } = require('./blockchain.js');
/**
"time": "concurrently -n timeserver,manager,rent,crowdfunding,order,tokencontroller \"npm run timeserver\" \"npm run manager\" \"npm run rent\" \"npm run crowdfunding\" \"npm run order\" \"npm run tokencontroller\"",
*/
//const timeserverMode = 1;
//const timeserverTimeInverval = 20;//a minimum limit of about 20 seconds for every 3 new orders that have just been paid. Any value smaller than that will overwhelm the blockchain ..
const atTheNsecond = 1;
let timeserverModeStr;
if(timeserverMode === 1){
  timeserverModeStr = '*/'+timeserverTimeInverval;
} else if(timeserverMode === 2){
  timeserverModeStr = ''+atTheNsecond;
}
// '*/5 * * * * *' ... for every 5 seconds
// '10 * * * * *'  ... for every 10th seconds
// '59 * * * * *'  ... for every 59th seconds
schedule.scheduleJob(timeserverModeStr+' * * * * *', async function () {
    const time = await getTimeServerTime();
    wlogger.info(`----------------==[timeserverSource.js] ${time}`);
    
//     getTimeServerTime().then(function (time) {
//       wlogger.info(`----------------==[timeserverSource.js]
// time from new Date(): ${time}`);
//     });
    //let time = new Date().myFormat();
    //wlogger.info('--------------==\n',time.slice(0, 4), 'year', time.slice(4, 6), 'month', time.slice(6, 8), 'day', time.slice(8, 10), 'hour', time.slice(10, 12), 'minute');

    // fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), time, function (err) {
    //     if (err) wlogger.error(`[Error @ timeserverSource] failed at writing to time.txt`);
    // });

    let serverTime;
    try {
      serverTime = parseInt(time.toString());
    } catch(err) {
      wlogger.error(`[Error] serverTime is not an integer: ${time.toString()}`);
      process.exit(1);
    }
    //wlogger.info(`[timeserverSource.js] serverTime: ${serverTime}`);
  

    if(is_addAssetbooksIntoCFC){
      addAssetbooksIntoCFC(serverTime).catch((err) => {
        wlogger.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
      });//blockchain.js
      // after order status change: waiting -> paid -> write into crowdfunding contract
    };

    if(is_makeOrdersExpiredCFED){
      const result = await makeOrdersExpiredCFED(serverTime).catch((err) => {
        wlogger.error(`[Error @ timeserver: makeOrdersExpiredCFED]: ${err}`);
      });//blockchain.js
      if(result){
        wlogger.info('>> [Success@ timeserver] makeOrdersExpiredCFED()');
      } else {
        wlogger.error('>> [Error @ timeserver] makeOrdersExpiredCFED() returns false;');
      };//blockchain.js

      // after orders pass CFED, we make such orders expired
    };

    //orderDate+3 => expired orders
    if(is_updateExpiredOrders){
      const result = await updateExpiredOrders(serverTime).catch((err) => {
        wlogger.error(`[Error @ timeserver: updateExpiredOrders]: ${err}`);
      });
      if(result){
        wlogger.info('>> [Success@ timeserver] updateExpiredOrders();');
      } else {
        wlogger.error('>> [Error @ timeserver] updateExpiredOrders() returns false;');
      };//blockchain.js
      //find still funding symbols that have passed CDED2 -> expire all orders of that symbol
    };

    // partical crowdfunding actions can be triggered by timeserver
    if(is_updateFundingStateFromDB){
      const result = await updateFundingStateFromDB(serverTime).catch((err) => {
        wlogger.error(`[Error @ timeserver: updateFundingStateFromDB]: ${err}`);
      });
      if(result){
        wlogger.info('>> [Success@ timeserver] updateFundingStateFromDB();');
      } else {
        wlogger.error('>> [Error @ timeserver] updateFundingStateFromDB() returns false;');
      };//blockchain.js
      //From DB check if product:fundingState needs to be updated, except fundingClosed/notClosed
    };

    //From DB check if product:tokenState needs to be updated
    if(is_updateTokenStateFromDB){
      const result = await updateTokenStateFromDB(serverTime).catch((err) => {
        wlogger.error(`[Error @ timeserver: updateTokenStateFromDB]: ${err}`);
      });
      if(result){
        wlogger.info('>> [Success@ timeserver] updateTokenStateFromDB();');
      } else {
        wlogger.error('>> [Error @ timeserver] updateTokenStateFromDB() returns false;');
      };//blockchain.js
      //From DB check if product:tokenState needs to be updated
    };

    if(is_calculateLastPeriodProfit){
      const result = await calculateLastPeriodProfit(serverTime).catch((err) => {
        wlogger.error(`[Error @ timeserver: calculateLastPeriodProfit]: ${err}`);
      });
      wlogger.debug(result);
      if(result){
        wlogger.info('>> [Success@ timeserver] calculateLastPeriodProfit();');
      } else {
        wlogger.error('>> [Error @ timeserver] calculateLastPeriodProfit() returns false;');
      };//mysql.js
    }
  

    // fs.readFile(path.resolve(__dirname, '..', 'data', 'target.json'), function (err, data) {
    //     if (err) wlogger.err(`[Error @ timeserverSource] failed at reading time.txt`);
    //     else {
    //         let targets = JSON.parse(data.toString());
    //         // for(let i = 0; i < targets.length; i++) {
    //         //     sendTime(time, targets[i].host, targets[i].port)
    //         // }
    //     }
    // })
});

// function sendTime(date, host, port) {

//     var client = net.createConnection({ host, port });
//     client.on("error", err => {
//         wlogger.error(`${host}:${port} 連結失敗`)
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
