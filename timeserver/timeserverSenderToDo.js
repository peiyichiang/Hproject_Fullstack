const schedule = require('node-schedule');
const os = require('os');

const net = require("net");
const path = require('path');
const fs = require('fs');

// 每分鐘發送一次time
schedule.scheduleJob('*/10 * * * * *', function () {
    let date = new Date().myFormat()
    console.log(date.slice(0, 4), '年', date.slice(4, 6), '月', date.slice(6, 8$

    fs.writeFile(path.resolve(__dirname, '..', 'data', 'date.txt'), date, funct$
        if (err) console.error(`寫入時間失敗`)
    })
    fs.readFile(path.resolve(__dirname, '..', 'data', 'target.json'), function $
        if (err) console.error(`讀取檔案失敗`)
        else {
            let targets = JSON.parse(data.toString())
            for(let i = 0; i < targets.length; i++) {
                sendTime(date, targets[i].host, targets[i].port)
            }
        }
    })
});


function sendTime(date, host, port) {
    var client = net.createConnection({ host, port });
    client.on("error", err => {
        console.log(`${host}:${port} 連結失敗`)
    });

    client.write(date)
    client.end();
}

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g$
};
  
  
  