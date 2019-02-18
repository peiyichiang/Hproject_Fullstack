const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');

const mysql = require('../lib/mysql.js');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            // 接收時間後的動作
            mysql.getOrderDate(function (result) {
                if (result.length == 0) {
                    console.log('nothing')
                } else {
                    console.log("現在時間", data.toString());
                    for (let i in result) {
                        if (typeof result[i].o_purchaseDate !== 'undefined') {
                            if (data.toString() >= result[i].o_purchaseDate.add3Day()) {
                                console.log(123)
                                mysql.setOrderExpired(result[i].o_id, function (result) {
                                    console.log(result[i].o_id, "已修改");
                                })
                            }
                        }
                    }
                }
            })
        });

        c.on("end", () => {
            console.log("");
        });
        c.pipe(c);

    });

    server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            var clientSocket = new net.Socket();
            clientSocket.on('error', function (e) {
                if (e.code == 'ECONNREFUSED') {
                    fs.unlinkSync('./order.ipc');
                    server.listen('./order.ipc', function () {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({
                path: './order.ipc'
            }, function () {
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });

    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'order'), () => {
            console.log("server bound");
        });
    } else {
        server.listen("./order.ipc", () => {
            console.log("server bound");
        });
    }

    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        } else {
            fs.unlinkSync("./order.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}

Number.prototype.add3Day = function () {
    let year = parseInt(this.toString().slice(0, 4));
    let month = parseInt(this.toString().slice(4, 6));
    let day = parseInt(this.toString().slice(6, 8));
    let hour = parseInt(this.toString().slice(8, 10));
    let minute = parseInt(this.toString().slice(10, 12));
    return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}

Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};