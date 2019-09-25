const express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')

/* getIncomeHistoryBySymbol */
router.get('/AssetHistoryListBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    let keys = [req.query.symbol, req.query.userEmailAddress];
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

    let queryString = `
    SELECT  ar_personal_income AS income, 
            ar_User_Acquired_Cost AS acquiredCost,
            SUBSTRING(ar_Time, 1, 4) AS periodYear,
            SUBSTRING(ar_Time, 5, 2) AS periodMonth,
            SUBSTRING(ar_Time, 7, 2) AS periodDate,
            ia_Payable_Period_End AS payablePeriodEnd 
    FROM    investor_assetRecord  AS T1
    INNER JOIN income_arrangement AS T2
          ON T1.ar_Time = T2.ia_actualPaymentTime
          AND T1.ar_tokenSYMBOL = T2.ia_SYMBOL 
    WHERE ar_tokenSYMBOL = ? && ar_investorEmail = ?
    `;

    query(queryString, keys)
        .then((incomeHistoryList) => {
            let initArray = []
            initArray.push(incomeHistoryList[0])

            /* 計算各期累積收益 */
            incomeHistoryList.reduce(
                (array, nextElement) => {
                    const index = array.length - 1
                    if (index > 0) {
                        nextElement.income = nextElement.income + array[index].income
                    } else {
                        nextElement.income = nextElement.income
                    }
                    return array.concat(nextElement);
                }, initArray)

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

router.get('/LatestAssetHistory', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    const JWT = req.query.JWT;
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

    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            let queryString1 = `
            SELECT ar_tokenSYMBOL AS symbol,
                ar_Holding_Amount_in_the_end_of_Period AS holdingAmount, 
                ar_User_Acquired_Cost AS acquiredCostTotal,
                ar_investorEmail AS ar_investorEmail,
                ar_Time AS time,
                ar_personal_income AS personalIncome,
                ia_Payable_Period_End AS payablePeriodEnd,
                p_name AS name,
                p_Image1 AS imageURL,
                p_icon AS iconURL,
                payablePeriodTotal
                
            FROM (
            SELECT ar_investorEmail AS userEmailAddress,
                ar_tokenSYMBOL AS symbol,
                MAX(ar_Time) AS time
            FROM investor_assetRecord
            GROUP BY userEmailAddress,
                    symbol
            ) AS T1
            
            INNER JOIN investor_assetRecord AS T2
            ON T1.userEmailAddress = T2.ar_investorEmail AND 
            T1.symbol = T2.ar_tokenSYMBOL AND
            T1.time = T2.ar_Time

            INNER JOIN income_arrangement AS T3
            ON T1.symbol = T3.ia_SYMBOL AND
            T1.time = T3.ia_actualPaymentTime

            INNER JOIN product AS T4
            ON T1.symbol = T3.ia_SYMBOL AND
            T1.symbol = T4.p_SYMBOL

            INNER JOIN
            (SELECT ia_SYMBOL ,COUNT(*) -1 AS payablePeriodTotal
            FROM income_arrangement 
            GROUP BY ia_SYMBOL
            ) AS T5
            ON T1.symbol = T5.ia_SYMBOL
            
            WHERE ar_investorEmail = ?
            ;`

            let queryString2 = `
            SELECT  ar_tokenSYMBOL AS symbol,
                    SUM(ar_personal_income) AS income
            FROM    investor_assetRecord
            WHERE   ar_investorEmail = ?
            GROUP   BY ar_investorEmail , symbol
            `

            try {
                let latestAssetHistoryArray = await query(queryString1, decoded.u_email);
                
                latestAssetHistoryArray.map(
                    latestAssetHistoryByToken => {
                        // latestAssetHistoryByToken.acquiredCostTotal = returnNumberWithCommas(latestAssetHistoryByToken.acquiredCostTotal)
                        // latestAssetHistoryByToken.personalIncome = returnNumberWithCommas(latestAssetHistoryByToken.personalIncome)
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

                let incomeArray = await query(queryString2, decoded.u_email);
                latestAssetHistoryArray.map(
                    latestAssetHistoryByToken => {
                        console.log(latestAssetHistoryByToken)
                        incomeArray.map((incomeObject) => {
                            console.log(incomeObject)
                            if (latestAssetHistoryByToken.symbol == incomeObject.symbol)
                                latestAssetHistoryByToken.incomeTotal = incomeObject.income;
                        });
                    });

                if (latestAssetHistoryArray.length > 0) {
                    res.status(200).json({
                        "message": "我的資產取得成功",
                        "result": latestAssetHistoryArray
                    });
                } else {
                    res.status(404).send('找不到資產我的資產');
                }
            } catch (err) {
                res.status(400).send('我的資產取得失敗');
                console.error(err);
            }
        }
    })
});

module.exports = router;