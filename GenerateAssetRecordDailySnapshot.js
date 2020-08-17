// DataBase
const { mysqlPoolQuery } = require('./timeserver/mysql.js');
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
            process.exit();
        });
    }
});
