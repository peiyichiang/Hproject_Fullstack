var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const { getTimeServerTime } = require('../../../timeserver/utilities');

router.get('/LaunchedProductList', function (req, res) {
    console.log('------------------------==\n@Product/LaunchedProductList');
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery(
        /*`SELECT 
        p_irr AS IRR,
        p_name AS name,
        p_location AS location,
        p_SYMBOL AS symbol,
        p_pricing AS pricing,
        p_currency AS currency,
        p_totalrelease AS maxProductQuantity,
        p_icon AS iconURL,
        ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
        SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
        SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
        SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
        SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
        SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
        p_size AS size,
        p_duration AS durationInYear,
        p_FRP AS duration,
        p_RPT AS RPT,
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
        p_pvSiteintro AS copyWritingText,
        p_ForecastedAnnualIncomePerModule as forecastedAnnualIncomePerMudule
        FROM product AS T1
        LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                    FROM order_list
                    WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                    GROUP BY o_symbol) AS T2
        ON T1.p_SYMBOL = T2.o_symbol
        LEFT JOIN ( SELECT o_symbol , COUNT(DISTINCT o_email) AS purchasedNumberOfPeople
                    FROM order_list
                    GROUP BY o_symbol) AS T3
        ON T1.p_SYMBOL = T3.o_symbol
        LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                    FROM income_arrangement 
                    GROUP BY ia_SYMBOL) AS T4
        ON T1.p_SYMBOL = T4.ia_SYMBOL
        WHERE p_state = \'funding\';`*/
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
        p_RPT AS RPT,
        SUBSTRING(p_CFED, 1, 4) AS deadlineYear,
        SUBSTRING(p_CFED, 5, 2) AS deadlineMonth,
        SUBSTRING(p_CFED, 7, 2) AS deadlineDate,
        SUBSTRING(p_CFED, 9, 2) AS deadlineHour,
        SUBSTRING(p_CFED, 11, 2) AS deadlineMinute,
        
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
        p_pvSiteintro AS copyWritingText,
        p_ForecastedAnnualIncomePerModule as forecastedAnnualIncomePerMudule
        FROM product AS T1
        LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                    FROM order_list
                    WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                    GROUP BY o_symbol) AS T2
        ON T1.p_SYMBOL = T2.o_symbol
        LEFT JOIN ( SELECT o_symbol , COUNT(DISTINCT o_email) AS purchasedNumberOfPeople
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
                "message": "????????????????????????:\n" + err
            })
        }
        else {
            /* ?????????????????? */
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
            /* ?????????????????? CFED ????????? */
            productArray = productArray.filter(function (item, index, array) {
                return timeNow < item.CFED;
            });
            if (productArray.length > 0) {
                res.status(200).json({
                    "message": "????????????????????????",
                    "result": productArray
                });
            } else {
                res.status(404).send('????????????????????????');
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
            res.status(401).send('????????????????????????????????????????????????????????????');
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
                    res.status(400).send({ "message": "????????????????????????:\n" + err })
                }
                else {
                    res.status(200).json({
                        "message": "???????????????????????????",
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
            res.status(401).send('????????????????????????????????????????????????????????????');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT pd_Image1 AS ImageURL1,
                        pd_Image2 AS ImageURL2,
                        pd_Image3 AS ImageURL3,
                        pd_Image4 AS ImageURL4,
                        pd_Image5 AS ImageURL5,
                        pd_Image6 AS ImageURL6,
                        pd_Image7 AS ImageURL7,
                        pd_Image8 AS ImageURL8,
                        pd_Image9 AS ImageURL9,
                        pd_Image10 AS ImageURL10
                 FROM   product_doc
                 WHERE  pd_SYMBOL = ? `, symbol, function (err, imageURLObjectArray) {

                let imageURLObject = imageURLObjectArray[0]
                let imageURLArray = Object.values(imageURLObject)
                // imageURLArray = imageURLArray.map(imageURL => {
                //     imageURLObject = { imageURL: imageURL.replace("public/", "") }
                //     return imageURLObject
                // });

                if (err) {
                    res.status(400).send({
                        "message": "????????????????????????:\n" + err
                    })
                }
                else {
                    res.status(200).json({
                        "message": "???????????????????????????",
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
            res.status(401).send('????????????????????????????????????????????????????????????');
            console.error(err);
        }
        else {
            mysqlPoolQuery(qstr1, [symbol], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] ??????symbol not found ????????????:\n" + err
                    });
                } else {
                    res.status(200);
                    res.json({
                        "message": "[Success] ??????symbol found ???????????????",
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
                "message": "[Error] ??????symbol not found ????????????:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] ??????symbol found ???????????????",
                "result": result
            });
        }
    });
});

//?????????????????????????????????token
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
            res.status(401).send('????????????????????????????????????????????????????????????');
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
                    res.status(400).send("????????????????????????:" + err);
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
                        res.status(200).json({ "message": "?????????token", });
                    }
                    else {
                        if (!!isServerTimeLargerThanCFSD) {
                            res.status(400).send("?????????????????????????????????");
                            console.error('assetbook address is not found : ', decoded.u_email);
                        } else {
                            res.status(400).send("?????????????????????");
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
                "message": "[Success] image & icon ????????????",
                "result": URL
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] image & icon ????????????:\n" + err
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
            res.status(401).send('????????????????????????????????????????????????????????????');
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
                p_icon AS iconURL,
                ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
                SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
                SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
                SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
                SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
                SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
                p_size AS size,
                p_duration AS durationInYear,
                p_FRP AS duration,
                p_RPT AS RPT,
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
                p_pvSiteintro AS copyWritingText,
                p_ForecastedAnnualIncomePerModule as forecastedAnnualIncomePerMudule,
                p_NotarizedRentalContract AS notarizedRentalContract,
                p_OnGridAuditedLetter AS onGridAuditedLetter,
                p_BOEApprovedLetter AS BOEApprovedLetter,
                p_PowerPurchaseAgreement AS powerPurchaseAgreement,
                p_OnGridTryrunLetter AS onGridTryrunLetter,
                p_PowerPlantEquipmentRegisteredLetter AS powerPlantEquipmentRegisteredLetter,
                p_PowerPlantInsurancePolicy AS powerPlantInsurancePolicy
                FROM product AS T1
                LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                            FROM order_list
                            WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                            GROUP BY o_symbol) AS T2
                ON T1.p_SYMBOL = T2.o_symbol
                LEFT JOIN ( SELECT o_symbol , COUNT(DISTINCT o_email) AS purchasedNumberOfPeople
                            FROM order_list
                            GROUP BY o_symbol) AS T3
                ON T1.p_SYMBOL = T3.o_symbol
                LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                            FROM income_arrangement 
                            GROUP BY ia_SYMBOL) AS T4
                ON T1.p_SYMBOL = T4.ia_SYMBOL
                WHERE p_SYMBOL = ?;`, symbol, function (err, productArray) {
                if (err) { res.status(400).send({ "message": "????????????????????????:\n" + err }) }
                else {
                    if (productArray.length > 0) {
                        res.status(200).json({
                            "message": "????????????????????????",
                            "result": productArray[0]
                        });
                    } else {
                        res.status(404).send({ "message": `???????????????: ${symbol}` });
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
            res.status(401).send('????????????????????????????????????????????????????????????');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT p_NotarizedRentalContract AS notarizedRentalContract,
                        p_OnGridAuditedLetter AS onGridAuditedLetter,
                        p_BOEApprovedLetter AS BOEApprovedLetter,
                        p_PowerPurchaseAgreement AS powerPurchaseAgreement,
                        p_OnGridTryrunLetter AS onGridTryrunLetter,
                        p_PowerPlantEquipmentRegisteredLetter AS powerPlantEquipmentRegisteredLetter,
                        p_PowerPlantInsurancePolicy AS powerPlantInsurancePolicy
                FROM product
                WHERE p_SYMBOL = ?`, symbol, function (err, docAddresses) {
                if (err) { res.status(400).send({ "message": "????????????????????????:\n" + err }) }
                else {
                    res.status(200).json({
                        "message": "????????????????????????",
                        "result": docAddresses[0]
                    });
                }
            });
        }
    })
});

router.get('/IconURL', function (req, res) {
    console.log('------------------------==\n@Product/IconURL');
    let mysqlPoolQuery = req.pool;
    const JWT = req.query.JWT;
    const symbol = req.query.symbol;
    jwt.verify(JWT, process.env.JWT_PRIVATEKEY, async (err, decoded) => {
        if (err) {
            res.status(401).send('????????????????????????????????????????????????????????????');
            console.error(err);
        }
        else {
            mysqlPoolQuery(
                `SELECT p_icon AS iconURL
                 FROM product
                 WHERE p_SYMBOL = ?`, symbol, function (err, iconURLArray) {
                if (err) { res.status(400).send({ "message": "icon ??????????????????:\n" + err }) }
                else {
                    res.status(200).json({
                        "message": "icon ??????????????????",
                        "result": iconURLArray[0].iconURL
                    });
                }
            });
        }
    })
});

module.exports = router;