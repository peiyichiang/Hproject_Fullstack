
var schedule = require('node-schedule');
var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');

const {
    DB_host,
    DB_user,
    DB_password,
    DB_name,
    DB_port,
    blockchainURL,
    assetbookAmount
} = require('../timeserver/envVariables');

const DatabaseCredential = {
    host: DB_host,
    user: DB_user,
    password: DB_password,
    database: DB_name,
    port: DB_port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
var pool = mysql.createPool(DatabaseCredential);
const mysqlPoolQuery = async (sql, options, callback) => {
    debugSQL(sql, options, callback);
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    pool.getConnection(async function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, options, async function (err, result, fields) {
                // callback
                callback(err, result, fields);
                //wlogger.debug(`[connection sussessful @ mysql.js] `);
                // http://localhost:${serverPort}/Product/ProductList
            });
            // release connection。
            // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
            conn.release();
        }
    });
};

var j = schedule.scheduleJob('59 23 * * *', function(){
    var qur = mysqlPoolQuery('SELECT ar_tokenSYMBOL,ar_investorEmail,ar_Holding_Amount_in_the_end_of_Period FROM ' + process.env.DB_NAME + '.investor_assetRecord;', async function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            // console.log(JSON.stringify(rows));
            // console.log(new Date().toString());
            var Year_=new Date().getFullYear().toString();
            var Month_=new Date().getMonth() + 1;
            Month_=Month_.toString();
            if(Month_.length==1){
                Month_="0" + Month_;
            }
            var Date_=new Date().getDate().toString();
            if(Date_.length==1){
                Date_="0" + Date_;
            }
            var DateStr = Year_ + "/" + Month_ + "/" + Date_;
    
            var sql = {
                DateTime:DateStr ,
                Content:JSON.stringify(rows)
            };
            var qur1 = mysqlPoolQuery('INSERT INTO  AseetRecordDailySnapshot SET ?',sql, async function (err, rows) {
                if (err) {
                    console.log(err);
                    console.log("寫入AssetRecordDailySnapshot失敗");
                } else {
                    console.log("寫入AssetRecordDailySnapshot成功");
                }
            });
        }
    });
});

