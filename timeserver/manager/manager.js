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
            sendTimeToCrowdfunding(data.toString())
            sendTimeToRent(data.toString())
            sendTimeToOrder(data.toString())
            sendTimeToERC721SPLC(data.toString())
        });

        c.on("end", () => {
            print("");
        });
        c.pipe(c);

    });

    server.on('error', (err) => {
        throw err;
    });
    server.listen(7010, () => {
        print(`server bound`);
    });
}

function sendTimeToCrowdfunding(data) {
    mysql.getCrowdfundingContractAddress(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].sc_crowdsaleaddress !== 'undefined' && result[i].sc_crowdsaleaddress != null) {
                    contract.sendTimeToCrowdfundingContract(result[i].sc_crowdsaleaddress, data.toString()).then(print)
                }
            }
        }
    })
}

function sendTimeToRent(data) {
    mysql.getRentContractAddress(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].sc_rentContractaddress !== 'undefined' && result[i].sc_rentContractaddress != null) {
                    contract.sendTimeToRentContract(result[i].sc_rentContractaddress, data.toString()).then(print)
                }
            }
        }
    })
}

function sendTimeToOrder(data) {
    mysql.getOrderDate(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].o_purchaseDate !== 'undefined') {
                    if (data.toString() >= result[i].o_purchaseDate.add3Day()) {
                        mysql.setOrderExpired(result[i].o_id, function () {
                            print(result[i].o_id, "已修改");
                        })
                    }
                }
            }
        }
    })
}

function sendTimeToERC721SPLC(data) {
    mysql.getERC721ControllerContractAddress(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].sc_erc721Controller !== 'undefined' && result[i].sc_erc721Controller != null) {
                    contract.sendTimeToTokenController(result[i].sc_erc721Controller, data.toString()).then(print)
                }
            }
        }
    })
}

function print(s) {
    console.log('[timeserver]' + s)
}