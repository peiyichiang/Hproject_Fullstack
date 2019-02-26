var mysql = require("mysql");

var pool = mysql.createPool({
    host: "140.119.101.130",//outside: 140.119.101.130, else 192.168.0.4 or localhost
    user: "root",
    password: "bchub",
    database: "htoken"
});

function getCrowdfundingContractAddress(cb) {
    pool.query('SELECT sc_crowdsaleaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            console.log(err);
        }
        cb(rows);
    })
}

function getRentContractAddress(cb) {
    pool.query('SELECT sc_rentContractaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            console.log(err);
        }
        cb(rows);
    })
}

function getOrderDate(cb) {
    pool.query('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, rows) {
        if (err) {
            console.log(err);
        }
        cb(rows);
    })
}

function getERC721ControllerContractAddress(cb) {
    pool.query('SELECT sc_erc721Controller FROM smart_contracts', function (err, rows) {
        if (err) {
            console.log(err);
        }
        cb(rows);
    })
}
module.exports = {
    getCrowdfundingContractAddress,
    getRentContractAddress,
    getOrderDate,
    getERC721ControllerContractAddress,
}