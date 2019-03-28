const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');
require('dotenv').config()

const mysql = require('../lib/mysql.js');
const contract = require('../lib/contractAPI.js');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            // 接收時間後的動作
            mysql.getCrowdfundingContractAddress(function (result) {
                if (result.length == 0) {
                    console.log('nothing')
                } else {
                    for (let i in result) {
                        if (typeof result[i].sc_crowdsaleaddress !== 'undefined' && result[i].sc_crowdsaleaddress != null) {
                            contract.sendTimeToCrowdfundingContract(result[i].sc_crowdsaleaddress, data.toString())
                                .then(function (receipt) {
                                    if (receipt.status) {
                                        console.log(`成功：發送時間給智能合約${receipt.to}`)
                                    }
                                    else {
                                        console.error(`失敗：發送時間給智能合約${result[i].sc_crowdsaleaddress}`)
                                    }
                                })
                                .catch(function (error) {
                                    console.error(`失敗：發送時間給智能合約${result[i].sc_crowdsaleaddress}`)
                                })
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
                    fs.unlinkSync('./crowdfunding.ipc');
                    server.listen('./crowdfunding.ipc', function () {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({ path: './crowdfunding.ipc' }, function () {
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });

    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'crowdfunding'), () => {
            console.log("server bound");
        });
    }
    else {
        server.listen("./crowdfunding.ipc", () => {
            console.log("server bound");
        });
    }

    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        }
        else {
            fs.unlinkSync("./crowdfunding.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}
