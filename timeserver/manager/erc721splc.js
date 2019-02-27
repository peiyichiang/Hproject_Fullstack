const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');

const mysql = require('../lib/mysql.js');
const contract = require('../lib/contractAPI.js');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            // 接收時間後的動作
            mysql.getERC721ControllerContractAddress(function (result) {
                if (result.length == 0) {
                    console.log('nothing')
                } else {
                    console.log("現在時間", data.toString());
                    for (let i in result) {
                        if (typeof result[i].sc_erc721Controller !== 'undefined') {
                            console.log(result[i].sc_erc721Controller, data.toString());
                            contract.sendTimeToERC721SPLC(result[i].sc_erc721Controller, data.toString());
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
                    fs.unlinkSync('./erc721splc.ipc');
                    server.listen('./erc721splc.ipc', function () {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({ path: './erc721splc.ipc' }, function () {
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });

    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'erc721splc'), () => {
            console.log("server bound");
        });
    }
    else {
        server.listen("./erc721splc.ipc", () => {
            console.log("server bound");
        });
    }

    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        }
        else {
            fs.unlinkSync("./erc721splc.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}
