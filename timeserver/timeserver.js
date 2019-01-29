const schedule = require('node-schedule');
const os = require('os');

const net = require("net");
const path = require('path');

// 每20秒發送一次time
schedule.scheduleJob('*/5 * * * * *', function () {
    let date = new Date().myFormat()
    console.log('年:', date.slice(0, 4),'\n月:', date.slice(4, 6),'\n日:', date.slice(6, 8),'\n時:', date.slice(8, 10),'\n分:', date.slice(10, 12))
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