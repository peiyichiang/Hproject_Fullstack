const os = require('os');

const net = require("net");
const path = require('path');

const fs = require('fs');
const mysql = require('../lib/mysql.js');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            mysql.getOrderDate(function (result) {
                if (result.length == 0) {
                    console.log('nothing')
                }
                else {
                    for (let i in result) {
                        console.log(data.toString(), result[i].o_id, result[i].o_purchaseDate);
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
            clientSocket.connect({ path: './order.ipc' }, function () {
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });

    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'order'), () => {
            console.log("server bound");
        });
    }
    else {
        server.listen("./order.ipc", () => {
            console.log("server bound");
        });
    }

    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        }
        else {
            fs.unlinkSync("./order.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}
