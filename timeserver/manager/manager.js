const os = require('os');
const net = require("net");
const path = require('path');
const fs = require('fs');

const mysql = require('../lib/mysql.js');
const contract = require('../lib/contractAPI.js');

require('dotenv').config()

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

Number.prototype.add3Day = function () {
    let year = parseInt(this.toString().slice(0, 4));
    let month = parseInt(this.toString().slice(4, 6));
    let day = parseInt(this.toString().slice(6, 8));
    let hour = parseInt(this.toString().slice(8, 10));
    let minute = parseInt(this.toString().slice(10, 12));
    return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}

function print(s) {
    console.log('[timeserver] ' + s)
}