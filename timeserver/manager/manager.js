const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');

createServer()

function createServer() {
    const server = net.createServer(c => {

        c.on("data", (data) => {
            sendTimeToCrowdfunding(data.toString())
            sendTimeToRent(data.toString())
            sendTimeToOrder(data.toString())
            sendTimeToERC721SPLC(data.toString())
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
                    fs.unlinkSync('./manager.ipc');
                    server.listen('./manager.ipc', function() {
                        console.log('server recovered');
                    });
                }
            });
            clientSocket.connect({path: './manager.ipc'}, function() { 
                console.log('Server running, giving up...');
                process.exit();
            });
        }
    });

    if (os.platform() == 'win32') {
        server.listen(path.join('\\\\?\\pipe', process.cwd(), 'manager'), () => {
            console.log("server bound");
        });
    }
    else {
        server.listen("./manager.ipc", () => {
            console.log("server bound");
        });
    }
    
    process.on('SIGINT', function () {
        console.log("關閉中");

        if (os.platform() == 'win32') {
            process.exit();
        }
        else {
            fs.unlinkSync("./manager.ipc")
            console.log("檔案刪除");
            process.exit();
        }
    });
}

function sendTimeToCrowdfunding(data) {

    if (os.platform() == 'win32') {
        var client = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), 'crowdfunding'));
        client.on("error", err => {
            console.log('crowdfunding 連結錯誤')
        });
    }
    else {
        var client = net.createConnection("./crowdfunding.ipc");
        client.on("error", err => {
            console.log('crowdfunding 連結錯誤')
        });
    }

    client.write(data)
    client.end()
}

function sendTimeToRent(data) {

    if (os.platform() == 'win32') {
        var client = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), 'rent'));
        client.on("error", err => {
            console.log('rent 連結錯誤')
        });
    }
    else {
        var client = net.createConnection("./rent.ipc");
        client.on("error", err => {
            console.log('rent 連結錯誤')
        });
    }

    client.write(data)
    client.end()
}

function sendTimeToOrder(data) {

    if (os.platform() == 'win32') {
        var client = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), 'order'));
        client.on("error", err => {
            console.log('order 連結錯誤')
        });
    }
    else {
        var client = net.createConnection("./order.ipc");
        client.on("error", err => {
            console.log('order 連結錯誤')
        });
    }

    client.write(data)
    client.end()
}

function sendTimeToERC721SPLC(data) {

    if (os.platform() == 'win32') {
        var client = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), 'erc721splc'));
        client.on("error", err => {
            console.log('erc721splc 連結錯誤')
        });
    }
    else {
        var client = net.createConnection("./erc721splc.ipc");
        client.on("error", err => {
            console.log('erc721splc 連結錯誤')
        });
    }

    client.write(data)
    client.end()
}