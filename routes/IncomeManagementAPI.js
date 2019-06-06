const express = require('express');
var router = express.Router();
var Web3 = require("web3");
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

function returnNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* getIncomeHistoryBySymbol */
router.get('/AssetHistoryListBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    let keys = [req.query.symbol, req.query.userEmailAddress];
    let queryString = `
    SELECT  ar_Accumulated_Income_Paid AS income, 
			ar_User_Acquired_Cost AS acquiredCost,
            ia_Payable_Period_End AS payablePeriodEnd 
    FROM    htoken.investor_assetRecord  AS T1
    INNER JOIN htoken.income_arrangement AS T2
          ON T1.ar_Time = T2.ia_time 
          AND T1.ar_tokenSYMBOL = T2.ia_SYMBOL 
    WHERE ar_tokenSYMBOL = ? && ar_investorEmail = ?
    `;
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };
    query(queryString, keys)
        .then((incomeHistoryList) => {
            res.status(200);
            res.json({
                "message": "[Success] 資產歷史紀錄取得成功！",
                "result": incomeHistoryList
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 資產歷史紀錄取得失敗:\n" + err
            });
        })
});

/* getLatestAssetHistory(userEmailAddress)
 * return:[latestAssetHistory]
 */
router.get('/LatestAssetHistory', async function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    let userEmailAddress = req.query.userEmailAddress
    console.log(userEmailAddress)

    let queryString = `
    SELECT ar_tokenSYMBOL AS symbol,
           ar_Holding_Amount_in_the_end_of_Period AS holdingAmount, 
           ar_Accumulated_Income_Paid AS incomeTotal, 
           ar_User_Acquired_Cost AS acquiredCostTotal,
           ar_investorEmail AS ar_investorEmail,
           ar_Time AS time,
           ia_single_Actual_Income_Payment_in_the_Period AS incomeOfLatestPeriod,
           ia_Payable_Period_End AS payablePeriodEnd,
           p_name AS name,
           p_Image1 AS imageURL,
           payablePeriodTotal
           
    FROM (
    SELECT ar_investorEmail AS userEmailAddress,
           ar_tokenSYMBOL AS symbol,
           MAX(ar_Time) AS time
    FROM htoken.investor_assetRecord
    GROUP BY userEmailAddress,
             symbol
    ) AS T1
    
    INNER JOIN htoken.investor_assetRecord AS T2
    ON T1.userEmailAddress = T2.ar_investorEmail AND 
       T1.symbol = T2.ar_tokenSYMBOL AND
       T1.time = T2.ar_Time

    INNER JOIN htoken.income_arrangement AS T3
    ON T1.symbol = T3.ia_SYMBOL AND
       T1.time = T3.ia_time

    INNER JOIN htoken.product AS T4
    ON T1.symbol = T3.ia_SYMBOL AND
       T1.symbol = T4.p_SYMBOL

    INNER JOIN
    (SELECT ia_SYMBOL ,COUNT(*) -1 AS payablePeriodTotal
    FROM htoken.income_arrangement 
    GROUP BY ia_SYMBOL
    ) AS T5
    ON T1.symbol = T5.ia_SYMBOL
    
	WHERE ar_investorEmail = ?
    ;`

    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };

    query(queryString, userEmailAddress)
        .then((latestAssetHistoryList) => {
            latestAssetHistoryList.map(
                latestAssetHistoryByToken => {
                    latestAssetHistoryByToken.incomeTotal = returnNumberWithCommas(latestAssetHistoryByToken.incomeTotal)
                    latestAssetHistoryByToken.acquiredCostTotal = returnNumberWithCommas(latestAssetHistoryByToken.acquiredCostTotal)
                    latestAssetHistoryByToken.incomeOfLatestPeriod = returnNumberWithCommas(latestAssetHistoryByToken.incomeOfLatestPeriod)
                    latestAssetHistoryByToken.periodInYear = latestAssetHistoryByToken.time.substr(0, 4)
                    latestAssetHistoryByToken.periodInMonth = latestAssetHistoryByToken.time.substr(4, 2)
                    if (latestAssetHistoryByToken.periodInMonth.substr(0, 1) == 0) {
                        latestAssetHistoryByToken.periodInMonth = latestAssetHistoryByToken.periodInMonth.substr(1, 1)
                    }
                    latestAssetHistoryByToken.periodInDate = latestAssetHistoryByToken.time.substr(6, 2)
                    if (latestAssetHistoryByToken.periodInDate.substr(0, 1) == 0) {
                        latestAssetHistoryByToken.periodInDate = latestAssetHistoryByToken.periodInDate.substr(1, 1)
                    }
                });
            res.status(200);
            if (latestAssetHistoryList.length > 0) {
                res.json({
                    "message": "[Success] 我的資產取得成功！",
                    "result": latestAssetHistoryList
                });
            } else {
                res.json({
                    "message": "[Success] 我的資產取得成功: 找不到資產"
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 我的資產取得失敗: " + err
            });
        })
});

/* 取得此帳號單一token的最新一期結算資料 */
/* TODO: 資料不完全需重寫 */
// router.get('/LatestAssetHistoryBySymbol', function (req, res, next) {
//     var mysqlPoolQuery = req.pool;
//     let keys = [req.query.symbol, req.query.assetBookAddress];
//     let latestIncomeHistory;

//     let queryString1 = `
//     SELECT ar_Holding_Amount_in_the_end_of_Period AS holdingAmount, 
//            ar_Accumulated_Income_Paid AS incomeTotal, 
//            ar_User_Acquired_Cost AS acquiredCostTotal,
//            ar_Time AS time,
//            ia_Payable_Period_End AS payablePeriodEnd,
//            ia_single_Actual_Income_Payment_in_the_Period AS incomeOfLatestPeriod
//     FROM htoken.investor_assetRecord AS AR
//     INNER JOIN htoken.income_arrangement AS IA ON AR.ar_Time = IA.ia_time
//     WHERE ar_tokenSYMBOL = ? &&
//           ar_ownerAssetbookAddr = ? &&  
//           ar_Time = (SELECT MAX(ar_Time) FROM htoken.investor_assetRecord)
//     `;
//     const query = (queryString, keys) => {
//         return new Promise((resolve, reject) => {
//             mysqlPoolQuery(
//                 queryString,
//                 keys,
//                 (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 }
//             );
//         });
//     };
//     query(queryString1, keys)
//         .then((_latestIncomeHistory) => {
//             latestIncomeHistory = Object.assign(_latestIncomeHistory[0]);
//             res.status(200);
//             res.json({
//                 "message": "[Success] 我的資產取得成功！",
//                 "result": latestIncomeHistory
//             });
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(400);
//             res.json({
//                 "message": "[Error] 我的資產取得失敗: " + err
//             });
//         })
// });

module.exports = router;