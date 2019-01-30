var mysql = require("mysql");

var pool = mysql.createPool({
    host: "140.119.101.130",//outside: 140.119.101.130, else 192.168.0.4 or localhost
    user: "root",
    password: "bchub",
    database: "htoken"
});

module.exports = pool