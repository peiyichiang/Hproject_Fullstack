var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const { getTimeServerTime } = require('../../../timeserver/utilities');

router.get('/LaunchedProductList', function (req, res) {
    console.log('------------------------==\n@Product/LaunchedProductList');
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery(
        `SELECT 
        p_irr AS IRR,
        p_name AS name,
        p_location AS location,
        p_SYMBOL AS symbol,
        p_pricing AS pricing,
        p_currency AS currency,
        p_totalrelease AS maxProductQuantity,
        ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
        SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
        SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
        SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
        SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
        SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
        p_size AS size,
        p_duration AS durationInYear,
        p_FRP AS duration,
        SUBSTRING(p_CFED, 1, 4) AS deadlineYear,
        SUBSTRING(p_CFED, 5, 2) AS deadlineMonth,
        SUBSTRING(p_CFED, 7, 2) AS deadlineDate,
        SUBSTRING(p_CFED, 9, 2) AS deadlineHour,
        SUBSTRING(p_CFED, 11, 2) AS deadlineMinute,
        p_Image1 AS imageURL,
        p_TaiPowerApprovalDate AS taiPowerApprovalDate,
        p_CFSD AS CFSD,
        p_BOEApprovalDate AS BOEApprovalDate,
        p_CFED AS CFED,
        p_PVTrialOperationDate AS PVTrialOperationDate,
        p_ContractOut AS contractOut,
        p_CaseConstruction AS caseConstruction,
        p_ElectricityBilling AS electricityBilling,
        p_fundingType AS fundingType,
        p_totalrelease - IFNULL(reservedTokenCount, 0 ) AS remainTokenCount,
        IFNULL(purchasedNumberOfPeople , 0) AS purchasedNumberOfPeople,
        IFNULL(payablePeriodTotal, 0) AS payablePeriodTotal,
        p_Copywriting AS copyWritingText
        FROM product AS T1
        LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                    FROM order_list
                    WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                    GROUP BY o_symbol) AS T2
        ON T1.p_SYMBOL = T2.o_symbol
        LEFT JOIN ( SELECT o_symbol , COUNT(o_email) AS purchasedNumberOfPeople
                    FROM order_list
                    GROUP BY o_symbol) AS T3
        ON T1.p_SYMBOL = T3.o_symbol
        LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                    FROM income_arrangement 
                    GROUP BY ia_SYMBOL) AS T4
        ON T1.p_SYMBOL = T4.ia_SYMBOL
        WHERE p_state = \'funding\';`, function (err, productArray) {
        if (err) {
            res.status(400)
            res.json({
                "message": "產品列表取得失敗:\n" + err
            })
        }
        else {
            /* 取得現在時間 */
            let timeNow = new Date();
            const minuteAndHour = timeNow.toLocaleTimeString('en-US', {
                hour12: false,
                hour: "numeric",
                minute: "numeric"
            });
            let year = timeNow.getFullYear();
            let month = String(timeNow.getMonth() + 1).padStart(2, '0'); //January is 0!
            let day = String(timeNow.getDate()).padStart(2, '0');
            let hour = minuteAndHour.substring(0, 2);
            let minute = minuteAndHour.substring(3, 5);
            timeNow = year + month + day + hour + minute;
            /* 回傳還沒超過 CFED 的專案 */
            productArray = productArray.filter(function (item, index, array) {
                return timeNow < item.CFED;
            });
            if (productArray.length > 0) {
                res.status(200).json({
                    "message": "產品列表取得成功",
                    "result": productArray
                });
            } else {
                res.status(404).send('找不到已上架產品');
            }
        }
    });
});

router.get('/ForcastIncomeBySymbol', function (req, res) {
    console.log('------------------------==\n@Product/ForcastIncomeBySymbol');
    const mysqlPoolQuery = req.pool;
    const JWT = req.query.JWT;
    const symbol = req.query.symbol;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT ia_Annual_End AS year, 
                        ia_single_Forecasted_Annual_Income AS incomeOfThePeriod
                 FROM   income_arrangement
                 WHERE  ia_SYMBOL = ? 
                 AND    ia_single_Forecasted_Annual_Income > 0
                `, symbol, function (err, forcastIncomeArray) {

                let initArray = []
                initArray.push(forcastIncomeArray[0])

                forcastIncomeArray.reduce(
                    function (array, nextElement) {
                        const index = array.length - 1
                        if (index > 0) {
                            nextElement.accumulatedIncome = nextElement.incomeOfThePeriod + array[index].accumulatedIncome
                        } else {
                            nextElement.accumulatedIncome = nextElement.incomeOfThePeriod
                        }
                        return array.concat(nextElement);
                    }, initArray
                );

                if (err) {
                    res.status(400).send({ "message": "預估收益取得失敗:\n" + err })
                }
                else {
                    res.status(200).json({
                        "message": "預估收益取得成功！",
                        "result": forcastIncomeArray
                    });
                }
            });
        }
    })

});

router.get('/CaseImageURLByCaseSymbol', function (req, res) {
    console.log('------------------------==\n@Product/CaseImageURLByCaseSymbol');
    const mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol;
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT p_Image1 AS ImageURL1,
                        p_Image2 AS ImageURL2,
                        p_Image3 AS ImageURL3,
                        p_Image4 AS ImageURL4,
                        p_Image5 AS ImageURL5,
                        p_Image6 AS ImageURL6,
                        p_Image7 AS ImageURL7,
                        p_Image8 AS ImageURL8,
                        p_Image9 AS ImageURL9,
                        p_Image10 AS ImageURL10
                 FROM   product
                 WHERE  p_SYMBOL = ? `, symbol, function (err, imageURLObjectArray) {

                let imageURLObject = imageURLObjectArray[0]
                let imageURLArray = Object.values(imageURLObject)
                // imageURLArray = imageURLArray.map(imageURL => {
                //     imageURLObject = { imageURL: imageURL.replace("public/", "") }
                //     return imageURLObject
                // });

                if (err) {
                    res.status(400).send({
                        "message": "照片路徑取得失敗:\n" + err
                    })
                }
                else {
                    res.status(200).json({
                        "message": "照片路徑取得成功！",
                        "result": imageURLArray
                    });
                }
            });
        }
    })
});

//Ray ...   omitted
router.get('/ProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log('------------------------==\n@Product/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    const JWT = req.query.JWT;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(qstr1, [symbol], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] 產品symbol not found 取得失敗:\n" + err
                    });
                } else {
                    res.status(200);
                    res.json({
                        "message": "[Success] 產品symbol found 取得成功！",
                        "result": result
                    });
                }
            });
        }
    })
});

router.get('/LaunchedProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log('------------------------==\n@Product/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    mysqlPoolQuery(qstr1, [symbol], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] 產品symbol found 取得成功！",
                "result": result
            });
        }
    });
});

//回傳該使用者是否可購買token
router.get('/canBuyToken', async function (req, res) {
    const symbol = req.query.symbol;
    const JWT = req.query.JWT;
    let mysqlPoolQuery = req.pool;
    let isServerTimeLargerThanCFSD;
    let isAssetbookContractAddressExist;
    let canBuyToken;
    const serverTime = await getTimeServerTime();
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            const keys = [symbol, decoded.u_email];
            mysqlPoolQuery(
                `SELECT p_CFSD AS CFSD, 
                        p_CFED AS CFED,
                        u_assetbookContractAddress AS assetbookContractAddress
                 FROM product , user
                 WHERE p_SYMBOL = ? AND u_email = ?
                 `, keys, function (err, result) {
                if (err) {
                    res.status(400).send("專案狀態取得失敗:" + err);
                }
                else {
                    serverTime >= Number(result[0].CFSD) && serverTime <= Number(result[0].CFED) ?
                        isServerTimeLargerThanCFSD = true :
                        isServerTimeLargerThanCFSD = false;

                    result[0].assetbookContractAddress ?
                        isAssetbookContractAddressExist = true :
                        isAssetbookContractAddressExist = false;

                    isServerTimeLargerThanCFSD && isAssetbookContractAddressExist ?
                        canBuyToken = true :
                        canBuyToken = false;

                    // console.log(isServerTimeLargerThanCFSD)
                    // console.log(isAssetbookContractAddressExist)
                    // console.log(canBuyToken)

                    if (!!canBuyToken) {
                        res.status(200).json({ "message": "可購買token", });
                    }
                    else {
                        if (!!isServerTimeLargerThanCFSD) {
                            res.status(400).send("使用者尚未通過身份驗證");
                            console.error('assetbook address is not found : ', decoded.u_email);
                        } else {
                            res.status(400).send("非專案開賣時間");
                            console.error('product is not funding : ', symbol);
                            console.error('check product CFED & CFSD , also check that server time is on');
                        }
                    }
                }
            });
        }
    })
});

/* getIncomeHistoryBySymbol */
router.get('/AssetImageURLAndIconURL', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol
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
    SELECT  p_Image1 AS imageURL,
            p_icon AS iconURL
    FROM    product
    WHERE   p_SYMBOL = ?
    `;

    query(queryString, symbol)
        .then((URL) => {
            res.status(200);
            res.json({
                "message": "[Success] image & icon 取得成功",
                "result": URL
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] image & icon 取得失敗:\n" + err
            });
        })
});

router.get('/ProductDataBySymbol', function (req, res) {
    console.log('------------------------==\n@Product/ProductDataBySymbol');
    let mysqlPoolQuery = req.pool;
    const JWT = req.query.JWT;
    const symbol = req.query.symbol;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT 
                p_irr AS IRR,
                p_name AS name,
                p_location AS location,
                p_pricing AS pricing,
                p_currency AS currency,
                p_totalrelease AS maxProductQuantity,
                ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
                SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
                SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
                SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
                SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
                SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
                p_size AS size,
                p_duration AS durationInYear,
                SUBSTRING(p_CFED, 1, 4) AS deadlineYear,
                SUBSTRING(p_CFED, 5, 2) AS deadlineMonth,
                SUBSTRING(p_CFED, 7, 2) AS deadlineDate,
                SUBSTRING(p_CFED, 9, 2) AS deadlineHour,
                SUBSTRING(p_CFED, 11, 2) AS deadlineMinute,
                p_Image1 AS imageURL,
                p_TaiPowerApprovalDate AS taiPowerApprovalDate,
                p_CFSD AS CFSD,
                p_BOEApprovalDate AS BOEApprovalDate,
                p_CFED AS CFED,
                p_PVTrialOperationDate AS PVTrialOperationDate,
                p_ContractOut AS contractOut,
                p_CaseConstruction AS caseConstruction,
                p_ElectricityBilling AS electricityBilling,
                p_fundingType AS fundingType,
                p_totalrelease - IFNULL(reservedTokenCount, 0 ) AS remainTokenCount,
                IFNULL(purchasedNumberOfPeople , 0) AS purchasedNumberOfPeople,
                IFNULL(payablePeriodTotal, 0) AS payablePeriodTotal,
                p_Copywriting AS copyWritingText
                FROM product AS T1
                LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                            FROM order_list
                            WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                            GROUP BY o_symbol) AS T2
                ON T1.p_SYMBOL = T2.o_symbol
                LEFT JOIN ( SELECT o_symbol , COUNT(o_email) AS purchasedNumberOfPeople
                            FROM order_list
                            GROUP BY o_symbol) AS T3
                ON T1.p_SYMBOL = T3.o_symbol
                LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                            FROM income_arrangement 
                            GROUP BY ia_SYMBOL) AS T4
                ON T1.p_SYMBOL = T4.ia_SYMBOL
                WHERE p_SYMBOL = ?;`, symbol, function (err, productArray) {
                if (err) { res.status(400).send({ "message": "產品資訊取得失敗:\n" + err }) }
                else {
                    if (productArray.length > 0) {
                        res.status(200).json({
                            "message": "產品資訊取得成功",
                            "result": productArray[0]
                        });
                    } else {
                        res.status(404).send({ "message": `找不到產品: ${symbol}` });
                    }
                }
            });
        }
    })
});

router.get('/AssetDocs', function (req, res) {
    console.log('------------------------==\n@Product/AssetDocs');
    let mysqlPoolQuery = req.pool;
    const JWT = req.query.JWT;
    const symbol = req.query.symbol;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('執行失敗，登入資料無效或過期，請重新登入');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT p_NotarizedRentalContract,
                        p_OnGridAuditedLetter
                FROM product
                WHERE p_SYMBOL = ?`, symbol, function (err, docAddresses) {
                if (err) { res.status(400).send({ "message": "文件連結取得失敗:\n" + err }) }
                else {
                    console.log(docAddresses)
                    res.status(200).json({
                        "message": "文件連結取得成功",
                        "result": docAddresses[0]
                    });
                }
            });
        }
    })
});

module.exports = router;