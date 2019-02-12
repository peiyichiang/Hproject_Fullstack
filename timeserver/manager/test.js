const mysql = require('../lib/mysql.js');

mysql.getCrowdfundingContractAddress(function (result) {
    if (result.length == 0) {
        console.log('nothing')
    }
    else {
        for (let i in result) {
            console.log(result[i])
        }
    }
})
mysql.getOrderDate(function (result) {
    if (result.length == 0) {
        console.log('nothing')
    }
    else {
        for (let i in result) {
            console.log(result[i].o_id, result[i].o_purchaseDate)
        }
    }
})