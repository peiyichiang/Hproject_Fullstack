//const web3 = require('../lib/web3.js')
const os = require('os');

const net = require("net");
const path = require('path');

const fs = require('fs');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            // 接收時間後的動作
            console.log(data.toString());
        });

        c.on("end", () => {
            console.log("");
        });
        c.pipe(c);

    });

    server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            var clientSocket = new net.Socket();
            clientSocket.on('error', function(e) {
                if (e.code == 'ECONNREFUSED') {
                    fs.unlinkSync('./crowdfunding.ipc');
                    server.listen('./crowdfunding.ipc', function() {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({path: './crowdfunding.ipc'}, function() { 
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
