var mysql = require("mysql");

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

function getCrowdfundingContractAddress(cb) {
    pool.query('SELECT sc_crowdsaleaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getRentContractAddress(cb) {
    pool.query('SELECT sc_rentContractaddress FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getOrderDate(cb) {
    pool.query('SELECT o_id, o_purchaseDate FROM htoken.order WHERE o_paymentStatus = "waiting"', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function getERC721ControllerContractAddress(cb) {
    pool.query('SELECT sc_erc721Controller FROM smart_contracts', function (err, rows) {
        if (err) {
            print(err);
        }
        cb(rows);
    })
}

function setOrderExpired(o_id, cb) {
    pool.query('UPDATE htoken.order SET o_paymentStatus = "expired" WHERE o_id = ?', [[[o_id]]], function (err, result) {
        if (err) {
            print(err);
        }
        cb(result)
    })
}

function print(s) {
    console.log('[timeserver]' + s)
}

module.exports = {
    getCrowdfundingContractAddress,
    getRentContractAddress,
    getOrderDate,
    getERC721ControllerContractAddress,
    setOrderExpired
}