const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');

//const contract = require('../lib/contractAPI.js')

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            // 接收時間後的動作
            /*let addr = "";
            contract.sendTimeToRentContract(addr, data.toString());
            */
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
                    fs.unlinkSync('./rent.ipc');
                    server.listen('./rent.ipc', function() {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({path: './rent.ipc'}, function() { 
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });
    
    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'rent'), () => {
            console.log("server bound");
        });
    }
    else {
        server.listen("./rent.ipc", () => {
            console.log("server bound");
        });
    }

    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        }
        else {
            fs.unlinkSync("./rent.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}
