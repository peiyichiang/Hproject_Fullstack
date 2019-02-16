const schedule = require('node-schedule');
const os = require('os');

const net = require("net");
const path = require('path');

// 每分鐘發送一次time
schedule.scheduleJob('0 * * * * *', function () {
    let date = new Date().myFormat()
    console.log(date.slice(0, 4), '年', date.slice(4, 6), '月', date.slice(6, 8), '日', date.slice(8, 10), '時', date.slice(10, 12), '分')
    sendTime(date)
});

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

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};
