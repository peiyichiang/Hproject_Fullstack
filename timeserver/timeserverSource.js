const schedule = require('node-schedule');
// const os = require('os');
// const net = require("net");
const path = require('path');
const fs = require('fs');

//const { mysqlPoolQuery } = require('./lib/mysql.js');
const { checkTimeOfOrder, updateCFC, updateTokenController, checkIncomeManager } = require('./lib/blockchain.js');

// '*/5 * * * * *'
// '10 * * * * *'  ... for every 10 seconds
// '59 * * * * *'  ... for every 59th minute
schedule.scheduleJob('*/10 * * * * *', function () {
    let date = new Date().myFormat()
    console.log('--------------==\n',date.slice(0, 4), 'year', date.slice(4, 6), 'month', date.slice(6, 8), 'day', date.slice(8, 10), 'hour', date.slice(10, 12), 'minute');

    fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), date, function (err) {
        if (err) console.error(`[Error @ timeserverSource] failed at writing to date.txt`);
    });

    print(date);
    checkTimeOfOrder(date.toString());//to convert from buffer to string
    updateCFC(parseInt(date.toString()));
    //updateTokenController(parseInt(date.toString()));
    //checkIncomeManager(parseInt(date.toString()));


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

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

Object.prototype.add3Day = function () {
  let year = parseInt(this.toString().slice(0, 4));
  let month = parseInt(this.toString().slice(4, 6));
  let day = parseInt(this.toString().slice(6, 8));
  let hour = parseInt(this.toString().slice(8, 10));
  let minute = parseInt(this.toString().slice(10, 12));
  return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}

function print(s) {
  console.log('[timeserver/timeserverSource.js] ' + s)
}