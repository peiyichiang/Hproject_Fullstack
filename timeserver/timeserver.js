const schedule = require('node-schedule');
const os = require('os');

const net = require("net");
const path = require('path');

// 每20秒發送一次time
schedule.scheduleJob('*/5 * * * * *', function () {
    let date = new Date().myFormat()
    sendTime(date)
});

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g,'-').replace(/(\.(.*)Z)/g,'').split('-').join('').slice(0,12);
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