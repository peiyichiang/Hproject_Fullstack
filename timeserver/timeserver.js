const schedule = require('node-schedule');
const os = require('os');

const net = require("net");
const path = require('path');

// 每20秒發送一次time
schedule.scheduleJob('*/20 * * * * *', function () {
    let date = new Date().myFormat()
    sendTime(date)
});

Date.prototype.myFormat = function () {
    let d = this.toLocaleDateString().split('-')
    let t = this.toLocaleTimeString().split(':')
    return [d[0],
    (d[1] > 9 ? '' : '0') + d[1],
    (d[2] > 9 ? '' : '0') + d[2],
    t[0],
    t[1]
    ].join('')
};

function sendTime(date) {

    if (os.platform() == 'win32') {
        var client = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), 'manager'));
        client.on("error", err => {
            console.log('連結錯誤')
        });
    }
    else {
        var client = net.createConnection("./manager.ipc");
        client.on("error", err => {
            console.log('連結錯誤')
        });
    }

    client.write(date)
    client.end();
}