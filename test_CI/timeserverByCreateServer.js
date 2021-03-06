const path = require('path');
const fs = require('fs');
const net = require("net");
// const Web3 = require('web3');
//const { mysqlPoolQuery } = require('./lib/mysql.js');
const { checkTimeOfOrder, updateCrowdFunding, updateTokenController, checkIncomeManager } = require('./blockchain.js');

const portForIncomingTime = 7010;
let currentCount = 0;
const maxCount = 10;// time period in minutes

//createServer();//disabled => copied to timeserverSource directly

function createServer() {
    const server = net.createServer(c => {
        console.log('\ninside net.createServer');

        c.on("data", (timeCurrent) => {
            fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), timeCurrent, function (err) {
                if (err) console.error(`[Error @manager.js] failed to write time into time.txt`);
            })
            print(timeCurrent);
            checkTimeOfOrder(timeCurrent.toString());
            updateCrowdFunding(parseInt(timeCurrent.toString()));
            //updateTokenController(parseInt(timeCurrent.toString()));
            //checkIncomeManager(parseInt(timeCurrent.toString()));
        });

        c.on("end", () => {
            print("end");
        });
        c.pipe(c);

    });

    server.on('error', (err) => {
        throw err;
    });
    server.listen(portForIncomingTime, () => {
        print(`server bound`);
      });
}



Object.prototype.add3Day = function () {
    let year = parseInt(this.toString().slice(0, 4));
    let month = parseInt(this.toString().slice(4, 6));
    let day = parseInt(this.toString().slice(6, 8));
    let hour = parseInt(this.toString().slice(8, 10));
    let minute = parseInt(this.toString().slice(10, 12));
    return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}


function print(s) {
    console.log('[timeserver/manager.js] ' + s)
}