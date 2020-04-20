var mysql = require("mysql");
var debugSQL = require('debug')('dev:mysql');
const bcrypt = require('bcrypt');
const Web3 = require('web3');

const {
    DB_host,
    DB_user,
    DB_password,
    DB_name,
    DB_port,
    blockchainURL,
    assetbookAmount
} = require('./envVariables');

const {
    isEmpty,
    isNoneInteger,
    asyncForEach,
    asyncForEachAssetRecordRowArray,
    asyncForEachAssetRecordRowArray2,
    testInputTime,
    makeFakeTxHash
} = require('./utilities');

const {
    TokenController,
    HCAT721,
    CrowdFunding,
    IncomeManager,
    excludedSymbols,
    wlogger
} = require('../ethereum/contracts/zsetupData');

const {
    userArray
} = require('../test_CI/zTestParameters');
/*
const userIdentityNumberArray = [];
const investorLevelArray = [];
const assetbookArray = [];
userArray.forEach((user, idx) => {
  userIdentityNumberArray.push(user.identityNumber);
  investorLevelArray.push(user.investorLevel);
  assetbookArray.push(user.addrAssetBook);
});*/
const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

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

//callback could not wait, but good for taking object input to make new rows
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


const mysqlPoolQueryB = async (sql, options) => {
    return new Promise(async (resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                return reject(err);
            } else {
                conn.query(sql, options, function (err, result) {
                    if (err) {
                        return reject(err);
                    } else {
                        conn.release();
                        //wlogger.info(`[Success: mysqlPoolQueryB @ mysql.js] `);
                        resolve(result);
                    }
                });
            }
        });
    });
};
// frontend sql query pool
const frontendPoolQuery = (a,b) => {
    console.log("This is frontend pool query");
    const queryType = {'product': product,'asset': asset};
    var query = queryType[a];
    return new Promise(async (resolve,reject) => {
        query(b).then((result) => {
            resolve(result);
        }).catch((err => {
            reject('[Error @ mysqlPoolQueryB]' + err);
        }))
    });
}
const product = function(){
    console.log("This is product query")
    status = arguments[0][0];
    console.log(status);
    var query1 =  new Promise(async (resolve,reject) => {
        const queryStr = 
        `SELECT p.p_state AS status,
                p.p_irr AS irr,
                pd.pd_icon AS icon,
                p.p_name AS name,
                p.p_location AS location,
                p.p_SYMBOL AS symbol,
                p.p_ForecastedAnnualIncomePerModule AS forecastedAnnualIncomePerModule,
                p.p_totalrelease AS totalRelease,
                (p.p_totalrelease - o.purchasetokenNum) AS remainRelease,
                p.p_pricing AS price,
                o.purchaseNum AS purchaseNum,
                CONVERT(p.p_RPT,SIGNED) AS RPT,
                CONVERT(SUBSTRING(p.p_FRP,1,2),SIGNED) AS FRPYear,
                CONVERT(SUBSTRING(p.p_FRP,4,5),SIGNED) AS FRPMonth,
                p.p_size AS size,
                p.p_CFSD AS CFSD,
                p.p_CFED AS CFED,
                p.p_pvModuleintro AS solarIntroduction,
                p.p_pvSiteintro AS pvSiteintro,
                g.g_giftRequirement AS giftRequirement,
                g.g_image AS gift
        FROM product p
        LEFT JOIN product_doc pd ON p.p_SYMBOL = pd.pd_SYMBOL
        LEFT JOIN (SELECT o_symbol , COUNT(o_id) purchaseNum , SUM(o_tokenCount) purchasetokenNum
                   FROM order_list
                   GROUP BY o_symbol) o
        ON p.p_SYMBOL = o.o_SYMBOL
        LEFT JOIN gift g ON p.p_giftid = g.g_id
        WHERE p.p_state IN (?);`;
        const result = await mysqlPoolQueryB(queryStr, status).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        // console.log(result2);
        resolve({"main":result});

    });
    var query2 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_SYMBOL AS symbol,
                pd.pd_Image1 AS img1,
                pd.pd_Image2 AS img2,
                pd.pd_Image3 AS img3,
                pd.pd_Image4 AS img4,
                pd.pd_Image5 AS img5,
                pd.pd_Image6 AS img6,
                pd.pd_Image7 AS img7,
                pd.pd_Image8 AS img8,
                pd.pd_Image9 AS img9,
                pd.pd_Image10 AS img10
        FROM product p
        LEFT JOIN product_doc pd ON p.p_SYMBOL = pd.pd_SYMBOL
        WHERE p.p_state IN (?);`;
        const result = await mysqlPoolQueryB(queryStr, status).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        resolve({"image":result});
    });
    var query3 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_SYMBOL AS symbol,
                pd.pd_NotarizedRentalContract_mask AS notarizedRentalContract,
                pd.pd_BOEApprovedLetter AS BOEApprovedLetter,
                pd.pd_OnGridTryrunLetter AS onGridAuditedLetter,
                pd.pd_PowerPurchaseAgreement AS powerPurchaseAgreement,
                pd.pd_OnGridTryrunLetter_mask AS onGridTryrunLetter,
                pd.pd_PowerPlantEquipmentRegisteredLetter AS powerPlantEquipmentRegisteredLetter,
                pd.pd_PowerPlantInsurancePolicy AS powerPlantInsurancePolicy
        FROM product p
        LEFT JOIN product_doc pd ON p.p_SYMBOL = pd.pd_SYMBOL
        WHERE p.p_state IN (?);`;
        const result = await mysqlPoolQueryB(queryStr, status).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        resolve({"doc":result});
    });
    var query4 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_SYMBOL AS symbol,
                p.p_ContractOut AS ContractOut,
                p.p_CaseConstruction AS CaseConstruction,
                p.p_TaiPowerApprovalDate AS TaiPowerApprovalDate,
                p.p_BOEApprovalDate AS BOEApprovalDate,
                p.p_PVTrialOperationDate AS PVTrialOperationDate,
                p.p_ElectricityBilling AS ElectricityBilling,
                p.p_CFSD AS CFSD,
                p.p_CFED AS CFED
        FROM product p
        WHERE p.p_state IN (?);`;
        const result = await mysqlPoolQueryB(queryStr, status).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        resolve({"date":result});
    });
    var query5 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_SYMBOL AS symbol,
                ia.ia_single_Forecasted_Annual_Income as forecastedAnnualIncome
        FROM product p
        LEFT JOIN income_arrangement ia ON p.p_SYMBOL = ia.ia_SYMBOL
        WHERE p.p_state IN (?) AND ia.ia_single_Forecasted_Annual_Income >0;`;
        const result = await mysqlPoolQueryB(queryStr, status).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        }); 
        var string=JSON.stringify(result); 
        var data = JSON.parse(string)
        income = {}
        // acc_income = []
        for (let i = 0; i < data.length; i++) {
            var symbol = data[i].symbol;
            var value = data[i].forecastedAnnualIncome;
            if(!(symbol in income)){
                income[symbol] = [];
            }
            income[symbol].push(value)
        }
        resolve({"income":income});
    });
    return Promise.all([query1,query2,query3,query4,query5]).then();
}
const asset = function(){
    console.log("This is asset query")
    user_email = arguments[0][0];
    console.log(user_email);
    var query1 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_name AS name,
                p.p_location AS location,
                p.p_SYMBOL AS symbol,
                SUBSTRING(p.p_PVOnGridDate,1,6) AS PVOnGridDate,
                p.p_size AS size,
                p.p_totalrelease AS totalRelease,
                p.p_RPT AS RPT
        FROM  product p
        INNER JOIN investor_assetRecord ar on ar.ar_tokenSYMBOL = p.p_SYMBOL 
        WHERE ar.ar_investorEmail = (?)
        GROUP BY p.p_SYMBOL;`;
        const result = await mysqlPoolQueryB(queryStr, user_email).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        // console.log(result)
        resolve({"main":result});
    });
    var query2 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT p.p_SYMBOL AS symbol,
                rd.rd_date AS date,
                rd.rd_six AS six,
                rd.rd_seven AS seven,
                rd.rd_eight AS eight,
                rd.rd_nine AS nine,
                rd.rd_ten AS ten,
                rd.rd_eleven AS eleven,
                rd.rd_twelve AS twelve,
                rd.rd_thirteen AS thirteen,
                rd.rd_fourteen AS fourteen,
                rd.rd_fifteen AS fifteen,
                rd.rd_sixteen AS sixteen,
                rd.rd_seventeen AS seventeen
        FROM radiation_data rd
        LEFT JOIN product p on p.p_serialnumberfromvendor = rd.rd_serialnumberfromvendor
        WHERE rd.rd_serialnumberfromvendor IN 
            (SELECT p.p_serialnumberfromvendor
             FROM product p
             WHERE p.p_symbol IN
                 (SELECT ar.ar_tokenSYMBOL
                  FROM investor_assetRecord ar
                  WHERE ar.ar_investorEmail = (?))
            );`;
        const result = await mysqlPoolQueryB(queryStr, user_email).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        console.log("@",result)
        resolve({"powerGeneration":result});
    })
    // LEFT JOIN product p ON ar.ar_tokenSYMBOL = p.p_SYMBOL 
    var query3 = new Promise(async (resolve,reject) =>{
        const queryStr = 
        `SELECT ar.ar_tokenSYMBOL AS symbol,
                ar.ar_Time AS time,
                ar.ar_personal_income AS income,
                ar.ar_managementfee AS managementFee,
                ar.ar_insurancepremium AS insurance,
                ar.ar_rent AS rent
        FROM investor_assetRecord ar
        WHERE ar.ar_investorEmail = (?);`;
        const result = await mysqlPoolQueryB(queryStr, user_email).catch((err) => {
            console.log(err)
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        resolve({"assetRecord":result});
    });
    return Promise.all([query1,query2,query3]).then();
}


const addTxnInfoRow = (txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'INSERT INTO transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const result = await mysqlPoolQueryB(queryStr1, [txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        wlogger.debug(`result: ${result}`);
        resolve(true);
    });
}

const deleteTxnInfoRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM transaction_info WHERE t_tokenSYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteTxnInfoRows result: ${result}`);
        resolve(true);
    });
}
const getTxnInfoRowsBySymbol = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'SELECT * FROM transaction_info WHERE t_tokenSYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            resolve(false);
        } else {
            resolve(result);
        }
    });
}

const addTxnInfoRowFromObj = (row) => {
    //txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'INSERT INTO transaction_info (t_txid, t_tokenSYMBOL, t_fromAssetbook, t_toAssetbook,  t_tokenId, t_txCount, t_holdingDays, t_txTime, t_balanceOffromassetbook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        const result = await mysqlPoolQueryB(queryStr1, [row.txid, row.tokenSymbol, row.fromAssetbook, row.toAssetbook, row.tokenId, row.txCount, row.holdingDays, row.txTime, row.balanceOffromassetbook]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB]' + err);
        });
        wlogger.debug(`result: ${result}`);
        resolve(true);
    });
}


//yarn run testmt -f 61
const addProductRow = async (tokenSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, _CFSD, _CFED, _quantityGoal, TimeTokenUnlock, fundingType, state, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\nto add product row into DB`);
        const sql = {
            p_SYMBOL: tokenSymbol,
            p_name: nftName,
            p_location: location,
            p_pricing: initialAssetPricing,
            p_duration: duration,
            p_currency: pricingCurrency,
            p_irr: IRR20yrx100 / 100,
            p_releasedate: _CFED,
            p_validdate: _CFED,
            p_size: siteSizeInKW,
            p_totalrelease: maxTotalSupply,
            p_fundmanager: fundmanager,
            p_PAdate: "2019-8-8 00:00:00",
            p_CFSD: _CFSD,
            p_CFED: _CFED,
            p_icon: "",
            p_RPT: "9",
            p_FRP: "9",
            p_PSD: _CFSD,
            p_FMXAdate: "2019-8-8 00:00:00",
            p_state: state,
            p_Image1: img1,
            p_Image2: img2,
            p_Image3: img3,
            p_Image4: img4,
            p_Image5: img5,
            p_Image6: img6,
            p_Image7: img7,
            p_Image8: img8,
            p_Image9: img9,
            p_Image10: img10,
            p_fundingGoal: _quantityGoal,
            p_lockuptime: TimeTokenUnlock,
            p_tokenState: "lockup",
            p_fundingType: fundingType,
            p_ContractOut: _CFSD,
            p_CaseConstruction: _CFSD,
            p_ElectricityBilling: _CFSD,
            p_TaiPowerApprovalDate: _CFSD,
            p_BOEApprovalDate: _CFSD,
            p_PVTrialOperationDate: _CFSD,
            p_PVOnGridDate: _CFSD,
            p_pvSiteintro: "auto",
            p_NotarizedRentalContract: notarizedRentalContract,
            p_BOEApprovedLetter: BOEApprovedLetter,
            p_PowerPurchaseAgreement: powerPurchaseAgreement,
            p_OnGridTryrunLetter: onGridTryrunLetter,
            p_PowerPlantEquipmentRegisteredLetter: powerPlantEquipmentRegisteredLetter,
            p_PowerPlantInsurancePolicy: powerPlantInsurancePolicy,
            p_ForecastedAnnualIncomePerModule: forecastedAnnualIncomePerModule
        };
        const sqlStr = JSON.stringify(sql, null, 4);
        wlogger.debug(sqlStr);

        const queryStr1 = 'INSERT INTO product SET ?';
        const result = await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: ' + err);
        });
        wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const deleteProductRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteProductRows result: ${result}`);
        resolve(true);
    });
}
const getProductRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'SELECT * FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        if (!Array.isArray(result) || !result.length) {
            resolve(false);
        } else {
            resolve(result);
        }
    });
}

const addSmartContractRow = async (tokenSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController) => {
    wlogger.debug(`inside addSmartContractRow()...`);
    return new Promise(async (resolve, reject) => {
        const sql = {
            sc_symbol: tokenSymbol,
            sc_crowdsaleaddress: addrCrowdFunding,
            sc_erc721address: addrHCAT721,
            sc_totalsupply: maxTotalSupply,
            sc_remaining: maxTotalSupply,
            sc_incomeManagementaddress: addrIncomeManager,
            sc_erc721Controller: addrTokenController,
        };
        wlogger.debug(sql);

        const queryStr1 = 'INSERT INTO smart_contracts SET ?';
        const result = await mysqlPoolQueryB(queryStr1, sql).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: ' + err);
        });
        wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const add3SmartContractsBySymbol = async (tokenSymbol, addrHCAT721, addrIncomeManager, addrTokenController) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`inside add3SmartContractsBySymbol()...`);
        const queryStr1 = 'UPDATE smart_contracts SET sc_erc721Controller = ?, sc_erc721address = ?, sc_incomeManagementaddress = ? WHERE sc_symbol = ?';
        const result = await mysqlPoolQueryB(queryStr1, [addrTokenController, addrHCAT721, addrIncomeManager, tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]. err: ' + err);
        });
        wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const deleteSmartContractRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM smart_contracts WHERE sc_symbol = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteSmartContractRows result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const getSmartContractRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'SELECT * FROM smart_contracts WHERE sc_symbol = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        if (!Array.isArray(result) || !result.length) {
            resolve(false);
        } else {
            resolve(result);
        }
    });
}

const addUserRow = async (email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`----------==@user/addUserRow`);
        let salt;
        //const account = web3.eth.accounts.create();
        const saltRounds = 10; //DON"T SET THIS TOO BIG!!!
        //Generate a salt and hash on separate function calls.
        //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
        bcrypt
            .genSalt(saltRounds)
            .then(saltNew => {
                salt = saltNew;
                wlogger.debug(`Salt: ${salt}`);
                return bcrypt.hash(password, salt);
            })
            .then(async (hash) => {
                wlogger.debug(`Password Hash: ${hash}`);
                let userNew = {
                    u_email: email,
                    u_salt: salt,
                    u_password_hash: hash,
                    u_identityNumber: identityNumber,
                    u_imagef: '',
                    u_imageb: '',
                    u_bankBooklet: '',
                    u_eth_add: eth_add,
                    u_verify_status: 0,
                    u_cellphone: cellphone,
                    u_name: name,
                    u_assetbookContractAddress: addrAssetBook,
                    u_investorLevel: investorLevel,
                    u_imagef: imagef,
                    u_imageb: imageb,
                    u_bankBooklet: bank_booklet,
                };

                wlogger.debug(userNew);
                const queryStr2 = 'INSERT INTO user SET ?';
                const result = await mysqlPoolQueryB(queryStr2, userNew).catch((err) => {
                    reject('[Error @ mysqlPoolQueryB(queryStr2)]. err: ' + err);
                });
                wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
                resolve(true);
            });
    });
}


//-------------------==Add users
const addUsersIntoDB = async (users) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------------==inside addUsersIntoDB()`);
        const result = await asyncForEach(users, async (user, idx) => {
            const email = user.email;
            const password = user.password;
            const identityNumber = user.identityNumber;
            const eth_add = user.eth_add;
            const cellphone = user.cellphone;
            const name = user.name;
            const addrAssetBook = user.addrAssetBook;
            const investorLevel = user.investorLevel;
            const imagef = user.imagef;
            const imageb = user.imageb;
            const bank_booklet = user.bank_booklet;

            wlogger.debug(`idx: ${idx}, email: ${email}, identityNumber: ${identityNumber}, eth_add: ${eth_add}, cellphone: ${cellphone}, name: ${name}, addrAssetbook: ${addrAssetBook}, investorLevel: ${investorLevel}, imagef: ${imagef}, imageb: ${imageb}, bank_booklet: ${bank_booklet}`);

            const result = await addUserRow(email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet).catch(err => reject(`addUserRow() failed. user: ${user}, err: ${err}`));
            wlogger.debug(`result of addUserRow: ${result}`);
        });
        resolve(true);
    });
}

const getAssetbookFromEmail = async (email) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside getAssetbookFromEmail()`);
        const queryStr1 = 'SELECT u_assetbookContractAddress FROM user WHERE u_email = ?';
        const result = await mysqlPoolQueryB(queryStr1, [email]).catch((err) => {
            wlogger.error(`\n[Error @ getAssetbookFromEmail]`);
            reject(err);
            return false;
        });
        if (!Array.isArray(result) || !result.length) {
            resolve([false, '', 'no assetbook for that email is found']);

        } else if (result.length > 1) {
            resolve([false, '', 'multiple assetbook addresses are found']);

        } else {
            const assetbookX = result[0].u_assetbookContractAddress;
            if (isEmpty(assetbookX) || assetbookX.length !== 42) {
                resolve([false, assetbookX, 'assetbook address is not valid']);
            } else {
                resolve([true, assetbookX, 'success']);
            }
        }
    });
}

const getAssetbookFromIdentityNumber = async (identityNumber) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside getAssetbookFromIdentityNumber()`);
        const queryStr1 = 'SELECT u_assetbookContractAddress FROM user WHERE u_identityNumber = ?';
        const result = await mysqlPoolQueryB(queryStr1, [identityNumber]).catch((err) => {
            wlogger.error(`\n[Error @ getAssetbookFromIdentityNumber]`);
            reject(err);
            return false;
        });
        if (!Array.isArray(result) || !result.length) {
            resolve([false, '', 'no assetbook for that identityNumber is found']);

        } else if (result.length > 1) {
            resolve([false, '', 'multiple assetbook addresses are found']);

        } else {
            const assetbookX = result[0].u_assetbookContractAddress;
            if (isEmpty(assetbookX) || assetbookX.length !== 42) {
                resolve([false, assetbookX, 'assetbook address is not valid']);
            } else {
                resolve([true, assetbookX, 'success']);
            }
        }
    });
}

const deleteUsersInDB = async (users) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------------==inside deleteUsersInDB()`);
        const queryStr1 = 'DELETE FROM user WHERE u_eth_add = ?';
        const usersPartial = users.slice(0, assetbookAmount);

        await asyncForEach(usersPartial, async (user, idx) => {
            const eoa = user.eth_add;
            wlogger.debug(`id:= ${idx} eoa: ${eoa}`);
            const result = await mysqlPoolQueryB(queryStr1, [eoa]).catch((err) => {
                reject(`[Error @ mysqlPoolQueryB] ${err}`);
            });
        });
        resolve(true);
    });
}

//-------------------------------==
Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

//-----------------------------==Orders
//used in zdeploy.js
const addOrderRow = async (nationalId, email, tokenCount, symbol, fundCount, paymentStatus) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-----------==addOrderRow`);
        wlogger.debug(`inside addOrderRow. paymentStatus: ${paymentStatus}, symbol: ${symbol}`);
        const timeStamp = Date.now() / 1000 | 0; //... new Date().getTimeServerTime();
        const currentDate = new Date().myFormat(); //yyyymmddhhmm
        wlogger.debug(`currentDate: ${currentDate}, timeStamp: ${timeStamp}`);
        const nationalIdLast5 = nationalId.toString().slice(-5);
        const orderId = symbol + "_" + nationalIdLast5 + "_" + timeStamp;
        wlogger.debug(`orderId: ${orderId}, nationalId: ${nationalId}, nationalIdLast5: ${nationalIdLast5}`);

        const sqlObject = {
            o_id: orderId,
            o_symbol: symbol,
            o_email: email,
            o_txHash: makeFakeTxHash(),
            o_tokenCount: tokenCount,
            o_fundCount: fundCount,
            o_purchaseDate: currentDate,
            o_paymentStatus: paymentStatus
        }; //random() to prevent duplicate NULL entry!

        wlogger.debug(sqlObject);

        const queryStr1 = 'INSERT INTO order_list SET ?';
        const result = await mysqlPoolQueryB(queryStr1, sqlObject).catch((err) => reject('[Error @ mysqlPoolQueryB()]' + err));
        wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);

    });
}

const deleteOrderRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM order_list WHERE o_symbol = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteOrderRows result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const addUserArrayOrdersIntoDB = async (users, _price, paymentStatus, tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------------==inside addUserArrayOrdersIntoDB()`);
        await asyncForEach(users, async (user, idx) => {
            const identityNumber = user.identityNumber;
            const email = user.email;
            const tokenCount = parseInt(user.tokenOrderAmount);
            const price = parseInt(_price);
            if (isNaN(tokenCount)) {
                wlogger.debug(`tokenCount: ${tokenCount}`);
                reject('tokenCount is not valid');
                return false;
            } else if (isNaN(price)) {
                wlogger.debug(`price: ${price}`);
                reject('price is not valid');
                return false;
            }
            const fundCount = price * tokenCount;
            wlogger.debug(`userNum: ${idx}, user: ${user}
  identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
  tokenSymbol: ${tokenSymbol}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);

            const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, fundCount, paymentStatus).catch((err) => {
                reject(err);
            });
            wlogger.debug(`addOrderRow result: ${JSON.stringify(result, null, 4)}`);
        });
        resolve(true);
    });
}

const addArrayOrdersIntoDB = async (userIndexArray, amountArray, initialAssetPricing, paymentStatus, tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------------==inside addArrayOrdersIntoDB()`);
        if (userIndexArray.length !== amountArray.length) {
            wlogger.debug(`${userIndexArray} & ${amountArray}`);
            reject('userIndexArray and amountArray should have the same length');
        }
        const maxIndex = userArray.length - 1;
        userIndexArray.forEach((index, idx) => {
            if (index > maxIndex || index < 0) {
                let mesg = `index should not be > maxIndex of ${maxIndex}. index value: ${index}`;
                wlogger.debug(mesg);
                reject(mesg);
            }
        });
        wlogger.debug(`All index values have been checked good.`);

        await asyncForEach(userIndexArray, async (userIndex, idx) => {
            const user = userArray[userIndex];
            const identityNumber = user.identityNumber;
            const email = user.email;
            const tokenCount = amountArray[idx];
            wlogger.debug(`idx: ${idx}, 
identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
tokenSymbol: ${tokenSymbol}, fundCount: ${initialAssetPricing * tokenCount}, paymentStatus: ${paymentStatus}`);

            const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, initialAssetPricing * tokenCount, paymentStatus).catch((err) => {
                reject(err);
            });
            wlogger.debug(`addOrderRow result: ${result}`);
        });
        resolve(true);
    });
}

const addOrderIntoDB = async (identityNumber, email, tokenCount, fundCount, paymentStatus, tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------------==inside addOrderIntoDB()`);
        wlogger.debug(`userNum: ${idx}, user: ${user}
identityNumber: ${identityNumber}, email: ${email}, tokenCount: ${tokenCount}, 
tokenSymbol: ${tokenSymbol}, fundCount: ${fundCount}, paymentStatus: ${paymentStatus}`);

        const result = await addOrderRow(identityNumber, email, tokenCount, tokenSymbol, fundCount, paymentStatus).catch((err) => {
            reject(err);
        });
        wlogger.debug(`addOrderRow result: ${result}`);
        resolve(true);
    });
}

//-----------------------------==IncomeArrangement
const addActualPaymentTime = async (actualPaymentTime, symbol, payablePeriodEnd) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside addActualPaymentTime(), actualPaymentTime: ${actualPaymentTime}`);
        const queryStr = 'UPDATE income_arrangement SET ia_actualPaymentTime = ? WHERE ia_SYMBOL = ? AND ia_Payable_Period_End = ?';
        const result = await mysqlPoolQueryB(queryStr, [actualPaymentTime, symbol, payablePeriodEnd]).catch((err) => {
            wlogger.error(`[Error @ mysqlPoolQueryB(queryStr)]`);
            reject(err);
            return false;
        });
        wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const addIncomeArrangementRowFromObj = (iaObj) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside addIncomeArrangementRowFromObj(), iaObj: ${iaObj}`);
        const sqlObject = {
            ia_SYMBOL: iaObj.symbol,
            ia_time: iaObj.ia_time,
            ia_actualPaymentTime: iaObj.actualPaymentTime,
            ia_Payable_Period_End: iaObj.payablePeriodEnd,
            ia_Annual_End: iaObj.annualEnd,
            ia_wholecase_Principal_Called_back: iaObj.wholecasePrincipalCalledBack,
            ia_wholecase_Book_Value: iaObj.wholecaseBookValue,
            ia_wholecase_Forecasted_Annual_Income: iaObj.wholecaseForecastedAnnualIncome,
            ia_wholecase_Forecasted_Payable_Income_in_the_Period: iaObj.wholecaseForecastedPayableIncome,
            ia_wholecase_Accumulated_Income: iaObj.wholecaseAccumulatedIncome,
            ia_wholecase_Income_Recievable: iaObj.wholecaseIncomeReceivable,
            ia_wholecase_Theory_Value: iaObj.wholecaseTheoryValue,
            ia_single_Principal_Called_back: iaObj.singlePrincipalCalledBack,
            ia_single_Forecasted_Annual_Income: iaObj.singleForecastedAnnualIncome,
            ia_single_Forecasted_Payable_Income_in_the_Period: iaObj.singleForecastedPayableIncome,
            ia_single_Actual_Income_Payment_in_the_Period: iaObj.singleActualIncomePayment,
            ia_single_Accumulated_Income_Paid: iaObj.singleAccumulatedIncomePaid,
            ia_single_Token_Market_Price: iaObj.singleTokenMarketPrice,
            ia_assetRecord_status: iaObj.assetRecordStatus,
            ia_State: iaObj.ia_state,
            ia_single_Calibration_Actual_Income_Payment_in_the_Period: iaObj.singleCalibrationActualIncome,
        };
        wlogger.debug(sqlObject);

        const queryStr = 'INSERT INTO income_arrangement SET ?';
        const result = await mysqlPoolQueryB(queryStr, sqlObject).catch((err) => {
            wlogger.error(`[Error @ mysqlPoolQueryB(queryStr)] ${err}`);
            reject(err);
            return false;
        });
        wlogger.debug(`income arrangement table has been added with one new row. \nresult: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const addIncomeArrangementRow = (symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside addIncomeArrangementRow(): ${symbol}, ${ia_time}, ${actualPaymentTime}, ${payablePeriodEnd}, ${annualEnd}, ${wholecasePrincipalCalledBack}, ${wholecaseBookValue}, ${wholecaseForecastedAnnualIncome}, ${wholecaseForecastedPayableIncome}, ${wholecaseAccumulatedIncome}, ${wholecaseIncomeReceivable}, ${wholecaseTheoryValue}, ${singlePrincipalCalledBack}, ${singleForecastedAnnualIncome}, ${singleForecastedPayableIncome}, ${singleActualIncomePayment}, ${singleAccumulatedIncomePaid}, ${singleTokenMarketPrice}, ${ia_state}, ${singleCalibrationActualIncome}`);
        const sqlObject = {
            ia_SYMBOL: symbol,
            ia_time: ia_time,
            ia_actualPaymentTime: actualPaymentTime,
            ia_Payable_Period_End: payablePeriodEnd,
            ia_Annual_End: annualEnd,
            ia_wholecase_Principal_Called_back: wholecasePrincipalCalledBack,
            ia_wholecase_Book_Value: wholecaseBookValue,
            ia_wholecase_Forecasted_Annual_Income: wholecaseForecastedAnnualIncome,
            ia_wholecase_Forecasted_Payable_Income_in_the_Period: wholecaseForecastedPayableIncome,
            ia_wholecase_Accumulated_Income: wholecaseAccumulatedIncome,
            ia_wholecase_Income_Recievable: wholecaseIncomeReceivable,
            ia_wholecase_Theory_Value: wholecaseTheoryValue,
            ia_single_Principal_Called_back: singlePrincipalCalledBack,
            ia_single_Forecasted_Annual_Income: singleForecastedAnnualIncome,
            ia_single_Forecasted_Payable_Income_in_the_Period: singleForecastedPayableIncome,
            ia_single_Actual_Income_Payment_in_the_Period: singleActualIncomePayment,
            ia_single_Accumulated_Income_Paid: singleAccumulatedIncomePaid,
            ia_single_Token_Market_Price: singleTokenMarketPrice,
            ia_State: ia_state,
            ia_single_Calibration_Actual_Income_Payment_in_the_Period: singleCalibrationActualIncome,
        };
        wlogger.debug(sqlObject);

        const queryStr = 'INSERT INTO income_arrangement SET ?';
        const result = await mysqlPoolQueryB(queryStr, sqlObject).catch((err) => {
            wlogger.error(`[Error @ mysqlPoolQueryB(queryStr)] ${err}`);
            reject(err);
            return false;
        });
        wlogger.debug(`\ntransaction_info table has been added with one new row. \nresult: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const updateIAassetRecordStatus = (symbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside updateIAassetRecordStatus() \nsymbol: ${symbol}`);
        const queryStr = 'UPDATE income_arrangement SET ia_assetRecord_status = 1 WHERE ia_SYMBOL = ? AND ia_Payable_Period_End = 0';
        const result = await mysqlPoolQueryB(queryStr, [symbol]).catch((err) => {
            wlogger.error(`[Error @ mysqlPoolQueryB(queryStr)]`);
            reject(err);
            return false;
        });
        //wlogger.debug(`result: ${JSON.stringify(result, null, 4)}`);
        resolve(true);
    });
}

const deleteIncomeArrangementRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM income_arrangement WHERE ia_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteIncomeArrangementRows result: ${result}`);
        resolve(true);
    });
}

const addIncomeArrangementRows = async (incomeArrangementArray) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-----------------== addIncomeArrangementRows`);
        const resultArray = [];
        await asyncForEach(incomeArrangementArray, async (item, idx) => {
            const result = await addIncomeArrangementRowFromObj(item).catch((err) => {
                reject('[Error @ addIncomeArrangementRowFromObj]' + err);
            });
            //wlogger.debug(`result: ${result}`);
            resultArray.push(result);
        });
        resolve(resultArray);
    });
}


const getProductPricing = async (symbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside getProductPricing()`);
        const queryStr1 = 'SELECT p_pricing FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
            wlogger.error(`\n[Error @ getProductPricing]`);
            reject(err);
            return false;
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            wlogger.debug(`product is not found for this symbol ${symbol}`);
            resolve(undefined);

        } else if (result.length > 1) {
            wlogger.warn(`multiple products are found for this symbol ${symbol}`);
            resolve(undefined);

        } else {
            const pricing = result[0].p_pricing;
            if (Number.isInteger(pricing)) {
                wlogger.debug(`pricing found as an integer: ${pricing}`);
                resolve(parseInt(pricing));
            } else {
                wlogger.debug(`pricing is not an integer: ${pricing}`);
                reject(false);
            }
        }
    });
}


const getPastScheduleTimes = async (symbol, serverTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-----------==getPastScheduleTimes`);
        const queryStr1 = 'SELECT ia_time FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_time <= ?';
        const result = await mysqlPoolQueryB(queryStr1, [symbol, serverTime]).catch((err) => {
            wlogger.error(`\n[Error @ getPastScheduleTimes > mysqlPoolQueryB()]`);
            reject(err);
            return false;
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            resolve(undefined);
        } else {
            const pastSchedules = result.map((item) => {
                return item.ia_time;
            });
            resolve(pastSchedules);
        }
    });
}

const getSymbolsONM = async () => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-----------==getSymbolsONM`);
        let mesg;
        const queryStr2 = 'SELECT sc_symbol, smart_contracts.sc_erc721address FROM smart_contracts WHERE sc_symbol IN (SELECT p_SYMBOL FROM product WHERE p_state = "ONM")';
        const result = await mysqlPoolQueryB(queryStr2, []).catch((err) => {
            wlogger.error(`\n[Error @ getSymbolsONM > mysqlPoolQueryB(queryStr2)]`);
            reject(err);
            return false;
        });
        wlogger.debug(`[getSymbolsONM] result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            mesg = '[Error @ getSymbolsONM > queryStr2';
            wlogger.error(`\n${mesg}`);
            reject(mesg);
            return false;
        } else {
            const foundSymbols = [];
            const foundHCAT721Addrs = [];
            for (let i = 0; i < result.length; i++) {
                if (typeof result[i] === 'object' && result[i] !== null && !excludedSymbols.includes(result[i].sc_symbol)) {
                    foundSymbols.push(result[i].sc_symbol);
                    foundHCAT721Addrs.push(result[i].sc_erc721address);
                }
            }
            resolve([foundSymbols, foundHCAT721Addrs]);
        }
    });
}

//yarn run testmt -f 25
const checkIaAssetRecordStatus = async (symbol, actualPaymentTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-------==checkIaAssetRecordStatus`);
        const query1 = 'SELECT ia_assetRecord_status FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_actualPaymentTime = ?';
        const result = await mysqlPoolQueryB(query1, [symbol, actualPaymentTime]).catch((err) => {
            wlogger.error(`\n[Error @ checkIaAssetRecordStatus > mysqlPoolQueryB()]`);
            reject(err);
            return false;
        });
        let assetRecordStatus;
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            wlogger.debug(`assetRecordStatus was not found`);

        } else if (result.length === 1) {
            const resultb = result[0]['ia_assetRecord_status'];
            if (resultb === null) {
                assetRecordStatus = 'null';
            } else {
                assetRecordStatus = resultb;
            }

        } else {
            const resultObjStr = JSON.stringify(result);
            wlogger.debug(`multiple assetRecordStatuss are found. \n${resultObjStr}`);

        }
        wlogger.debug(`[end of checkIaAssetRecordStatus()] assetRecordStatus: ${assetRecordStatus}`);
        resolve(assetRecordStatus);
    });
}

//yarn run testmt -f 26
const getMaxActualPaymentTime = async (symbol, serverTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-------==getMaxActualPaymentTime`);
        const query1 = 'SELECT MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_assetRecord_status = 0 AND ia_actualPaymentTime <= ?';
        //SELECT MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = "ACHM6666" AND ia_actualPaymentTime <= 201906271235;

        const result = await mysqlPoolQueryB(query1, [symbol, serverTime]).catch((err) => {
            wlogger.error(`\n[Error @ getMaxActualPaymentTime > mysqlPoolQueryB()]`);
            reject(err);
            return false;
        });
        let maxActualPaymentTime;
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            wlogger.debug(`maxActualPaymentTime was not found ... either in the past or in the future...`);
            maxActualPaymentTime = 'result_len_zero';
        } else if (result.length === 1) {
            const resultb = result[0]['MAX(ia_actualPaymentTime)'];
            if (resultb === null) {
                maxActualPaymentTime = 'null';
            } else {
                maxActualPaymentTime = resultb;
                wlogger.debug(`check1.`);
            }

        } else {
            const resultObjStr = JSON.stringify(result);
            maxActualPaymentTime = 'multiple maxActualPaymentTimes';
            wlogger.debug(`multiple maxActualPaymentTimes are found. \n${resultObjStr}`);
        }
        wlogger.debug(`[end of getMaxActualPaymentTime()] maxActualPaymentTime: ${maxActualPaymentTime} ${typeof maxActualPaymentTime} \nsymbol: ${symbol}, serverTime: ${serverTime}`);
        resolve(maxActualPaymentTime);
    });
}

//yarn run testmt -f 27
const getAcPayment = async (symbol, maxActualPaymentTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-------==getAcPayment`);
        let acPayment;

        if (maxActualPaymentTime === '0') {
            acPayment = -9;
            wlogger.debug(`[end of getAcPayment()] symbol: ${symbol}, maxActualPaymentTime: ${maxActualPaymentTime}`);
            resolve(acPayment);
            return false;
        }

        const query1 = 'SELECT ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_State = "ia_state_approved" AND ia_assetRecord_status = 0 AND ia_SYMBOL = ? AND ia_actualPaymentTime = ?';
        // SELECT ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_State = "ia_state_approved" AND ia_assetRecord_status = 0 AND ia_SYMBOL = "ALLI0905" AND ia_actualPaymentTime = "201909051556";

        const result1 = await mysqlPoolQueryB(query1, [symbol, maxActualPaymentTime]).catch((err) => {
            wlogger.error(`\n[Error @ getAcPayment()]`);
            reject(err);
            return false;
        });
        wlogger.debug(`result1: ${result1}`);
        if (!Array.isArray(result1)) {
            wlogger.debug(`result1 is invalid`);
            acPayment = -9;

        } else if (result1.length === 0) {
            wlogger.debug(`acPayment was not found`);

            const query2 = 'SELECT * FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_actualPaymentTime = ?';

            const result2 = await mysqlPoolQueryB(query2, [symbol, maxActualPaymentTime]).catch((err) => {
                wlogger.error(`\n[Error @ getAcPayment(query2)]`);
                reject(err);
                return false;
            });
            wlogger.debug(`... check income arrangement record`);
            wlogger.debug(`result2: ${result2}`);
            if (!Array.isArray(result2) || !result2.length) {
                wlogger.debug(`getAcPayment result2 is invalid or empty`);
                acPayment = -11;

            } else if (result2.length === 1) {
                if (result2[0]['ia_State'] !== "ia_state_approved") {
                    wlogger.debug(`>>> ia_State is not ia_state_approved`);
                }
                if (result2[0]['ia_assetRecord_status'] !== 0) {
                    wlogger.warn(`>>> ia_assetRecord_status is not 0 => such assetRecord has already be recorded`);
                }
                acPayment = -1;
            } else {
                wlogger.debug(`getAcPayment result2 length > 1`);
                acPayment = -12;
            }

        } else if (result1.length === 1) {
            const result1b = result1[0]['ia_single_Actual_Income_Payment_in_the_Period'];
            if (result1b === null) {
                acPayment = -2;
            } else {
                acPayment = result1b;
            }

        } else {
            //const result1ObjStr = JSON.stringify(result1);
            wlogger.debug(`multiple acPayments are found. \nsymbol: ${symbol}, maxActualPaymentTime: ${maxActualPaymentTime}`);
            acPayment = -4;
        }
        wlogger.debug(`[end of getAcPayment()] acPayment: ${acPayment}`);
        resolve(acPayment);
    });
}

//yarn run testmt -f 28
const getProfitSymbolAddresses = async (serverTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`-----------==getProfitSymbolAddress \nserverTime: ${serverTime} typeof: ${typeof serverTime}`);
        const [foundSymbols, foundHCAT721Addrs] = await getSymbolsONM().catch((err) => {
            wlogger.error(`\n[Error @getSymbolsONM] err: ${err}`);
            reject(err);
            return false;
        });
        wlogger.debug(`foundSymbols: ${foundSymbols}`);
        //wlogger.debug(`foundHCAT721Addrs: ${foundHCAT721Addrs}`);

        const acPaymentArray = [];
        const maxActualPaymentTimeArray = [];
        const mesgArray = [];
        const acPaymentArrayWarn = [];
        const maxActualPaymentTimeArrayWarn = [];
        const mesgArrayWarn = [];
        const checkedSymbols = [];
        const checkedSymbolsWarn = [];
        const checkedTokenAddrs = [];

        await asyncForEach(foundSymbols, async (symbol, index) => {
            const maxActualPaymentTime = await getMaxActualPaymentTime(symbol, serverTime);

            let acPayment, mesg = '';
            if (maxActualPaymentTime === '0') {
                acPayment = -10;
                mesg += 'MAPT_0'; //maxActualPaymentTime has not been given!

            } else if (maxActualPaymentTime === 'null') {
                acPayment = -11;
                mesg += 'MAPT_null'; //maxActualPaymentTime is not found because this period has not been completed

            } else if (maxActualPaymentTime === 'result_len_zero') {
                acPayment = -12;
                mesg += 'MAPT_result_len_zero';

            } else if (isNoneInteger(maxActualPaymentTime)) {
                acPayment = -13;
                mesg += 'MAPT_not_valid'; //incorrect data...
                wlogger.warn(`[Warning] ${mesg}, symbol: ${symbol}`);

            } else {
                wlogger.info(`[Good] MAPT is valid: ${maxActualPaymentTime}`);
                //const assetRecordStatus = await checkIaAssetRecordStatus(symbol, maxActualPaymentTime);

                acPayment = await getAcPayment(symbol, maxActualPaymentTime);
                if (acPayment < 0 || acPayment === null || acPayment === undefined) {
                    if (acPayment === -1) {
                        mesg += 'assetRecord already written';
                    } else {
                        mesg += 'acPayment_invalid'; //-ve or null or undefined 
                    }
                    wlogger.warn(`[Warning] ${mesg}: ${acPayment} ${typeof acPayment}, symbol: ${symbol}`);

                } else {
                    wlogger.info(`[Good] acPayment is valid`);
                }

            }
            //wlogger.debug(`symbol: ${symbol}, serverTime: ${serverTime},maxActualPaymentTime: ${maxActualPaymentTime}, acPayment: ${acPayment}`);
            if (mesg) {
                checkedSymbolsWarn.push(symbol);
                acPaymentArrayWarn.push(acPayment);
                maxActualPaymentTimeArrayWarn.push(maxActualPaymentTime);
                mesgArrayWarn.push(mesg);

            } else {
                checkedSymbols.push(symbol);
                checkedTokenAddrs.push(foundHCAT721Addrs[index]);
                acPaymentArray.push(acPayment);
                maxActualPaymentTimeArray.push(maxActualPaymentTime);
                mesgArray.push(mesg);
            }
        });
        // const acPaymentArrayLen = acPaymentArray.length;
        // wlogger.debug(`\nArray length @ lastPeriodProfit:: ${ acPaymentArrayLen)
        wlogger.debug(`\n--------------==End of getProfitSymbolAddresses 
    \ncheckedSymbols: ${checkedSymbols}
    \nacPaymentArray: \n${acPaymentArray} 
    \nmaxActualPaymentTimeArray: \n${maxActualPaymentTimeArray} 

    \ncheckedSymbolsWarn: ${checkedSymbolsWarn}
    \nacPaymentArrayWarn: \n${acPaymentArrayWarn} 
    \nmaxActualPaymentTimeArrayWarn: \n${maxActualPaymentTimeArrayWarn} 
    \nmesgArrayWarn: \n${mesgArrayWarn} \nmesg interpretation: \nMAPT_0: maxActualPaymentTime has not been given! \nMAPT_null: maxActualPaymentTime is not found because this period has not been completed \nMAPT_not_valid: maxActualPaymentTime has incorrect data...`);
        resolve([checkedSymbols, checkedTokenAddrs, acPaymentArray, maxActualPaymentTimeArray, mesgArray]);
    }); //end of getProfitSymbolAddresses
}


//----------------------------==AssetRecord in DB
//For timeserver to trigger ... calculate periodic profit
// yarn run testmt -f 29
const calculateLastPeriodProfit = async (serverTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside calculateLastPeriodProfit()`);
        const asset_valuation = 13000;
        const holding_amount_changed = 0;
        const holding_costChanged = 0;
        const moving_ave_holding_cost = 13000;

        const [checkedSymbols, checkedTokenAddrs, acPaymentArray, maxActualPaymentTimeArray, mesgArray] = await getProfitSymbolAddresses(serverTime).catch((err) => {
            wlogger.error(`\n[Error @ getProfitSymbolAddresses] ${err}`);
            return false;
        });
        wlogger.debug(`\n----------==after getProfitSymbolAddresses()...`);
        //wlogger.debug(`[getProfitSymbolAddresses]: checkedSymbols: ${checkedSymbols}, \nfoundHCAT721Addrs: ${checkedTokenAddrs}, \nacPaymentArray: ${acPaymentArray}, \nmaxActualPaymentTimeArray: #{maxActualPaymentTimeArray}`);

        const symbolsLength = checkedSymbols.length;
        if (symbolsLength !== checkedTokenAddrs.length) {
            reject('[Error] checkedSymbols and checkedTokenAddrs are of difference length');
            return false;

        } else if (acPaymentArray.length !== checkedSymbols.length) {
            wlogger.debug(`${acPaymentArray.length},  ${checkedSymbols.length}`);
            reject('[Error] acPaymentArray and checkedSymbols are of different length');
            return false;

        } else if (symbolsLength === 0) {
            resolve('no symbol was found');
            return true;

        } else if (symbolsLength > 0) {
            wlogger.debug(`symbol(s) found`);
            await asyncForEach(checkedSymbols, async (symbol, index) => {

                if (mesgArray[index]) {
                    wlogger.warn(`[Warning] at symbol: ${symbol}, mesg: ${mesgArray[index]}`);
                    resolve([undefined, undefined, undefined]);

                } else if (acPaymentArray[index].length === 0) {
                    wlogger.warn(`[Warning] acPaymentArray is empty`);
                    resolve([undefined, undefined, undefined]);

                } else {
                    const pricing = await getProductPricing(symbol).catch((err) => {
                        wlogger.error(`\n[Error @ getProductPricing]`);
                        reject(err);
                        return false;
                    });
                    if (!pricing) {
                        wlogger.error(`\n[Error @ addAssetRecordRowArray > getProductPricing] ${pricing}`);
                        reject(false);
                        return false;
                    }

                    const ar_time = maxActualPaymentTimeArray[index];
                    const acPayment = acPaymentArray[index];
                    wlogger.debug(`symbol: ${symbol} \nar_time: ${ar_time} \nacPayment: ${acPayment}`);

                    const [toAddressArray, amountArray] = await getOwnerAddrAmountList(checkedTokenAddrs[index], 0, 0);

                    wlogger.debug(`\namountArray: ${amountArray}`);
                    const acquiredCostArray = amountArray.map((item) => {
                        return parseInt(item) * pricing;
                    });

                    const [emailArrayError, amountArrayError] = await addAssetRecordRowArray(toAddressArray, amountArray, symbol, ar_time, acPayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost).catch((err) => {
                        wlogger.error(`\n[Error @ addAssetRecordRowArray]`);
                        reject(err);
                        return false;
                    });

                    const resultsetAssetRecordStatus = await setAssetRecordStatus(1, symbol, ar_time);
                    wlogger.debug(`\n-----------------==At the end of calculateLastPeriodProfit(): emailArrayError=${emailArrayError}, amountArrayError=${amountArrayError}, resultsetAssetRecordStatus=${resultsetAssetRecordStatus}`)
                    resolve([emailArrayError, amountArrayError, resultsetAssetRecordStatus]);
                }
            });
        }
    });
}


/**
 * getOwnerAddrAmountList() should not be moved to blockchain.js
 * because of circular dependency!!!
 */
const getOwnerAddrAmountList = async (tokenAddress, indexStart, indexAmount) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------------==inside getOwnerAddrAmountList()`);
        const instHCAT721 = new web3.eth.Contract(HCAT721.abi, tokenAddress);
        const toAddressArray = await instHCAT721.methods.getOwnersByOwnerIndex(indexStart, indexAmount).call();
        const amountArray = await instHCAT721.methods.balanceOfArray(toAddressArray).call();
        wlogger.debug(`\ntoAddressArray: ${toAddressArray}, \namountArray: ${amountArray}`);
        resolve([toAddressArray, amountArray]);
    });
}

const setAssetRecordStatus = async (assetRecordStatus, symbol, actualPaymentTime) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------==setAssetRecordStatus`);
        const queryStr1 = 'UPDATE income_arrangement SET ia_assetRecord_status = ? WHERE ia_SYMBOL = ? AND ia_actualPaymentTime = ?';
        const result = await mysqlPoolQueryB(queryStr1, [assetRecordStatus, symbol, actualPaymentTime]).catch((err) => {
            const mesg = '[Error @ setAssetRecordStatus]';
            wlogger.error(`\n${mesg}`);
            reject(err);
            return false;
        });
        wlogger.debug(`\nresult: ${result}`);
        resolve(true);
    });
}

const addAssetRecordRow = async (investorEmail, symbol, ar_time, holdingAmount, AccumulatedIncomePaid, UserAssetValuation, HoldingAmountChanged, HoldingCostChanged, AcquiredCost, MovingAverageofHoldingCost) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n-------==addAssetRecordRow`);
        const sql = {
            ar_investorEmail: investorEmail,
            ar_tokenSYMBOL: symbol,
            ar_Time: ar_time,
            ar_Holding_Amount_in_the_end_of_Period: holdingAmount,
            ar_Accumulated_Income_Paid: AccumulatedIncomePaid,
            ar_User_Asset_Valuation: UserAssetValuation,
            ar_User_Holding_Amount_Changed: HoldingAmountChanged,
            ar_User_Holding_CostChanged: HoldingCostChanged,
            ar_User_Acquired_Cost: AcquiredCost,
            ar_Moving_Average_of_Holding_Cost: MovingAverageofHoldingCost
        }; //random() to prevent duplicate NULL entry!
        //wlogger.debug(sql);

        const querySql1 = 'INSERT INTO investor_assetRecord SET ?';
        const result5 = await mysqlPoolQueryB(querySql1, sql).catch((err) => {
            wlogger.error(`[Error @ adding asset row(querySql1)]`);
            reject(err);
            return (false);
        });
        wlogger.debug(`\nA new row has been added. \nresult: ${result5}`);
        resolve(true);
    });
}

const deleteAssetRecordRows = (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'DELETE FROM investor_assetRecord WHERE ar_tokenSYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [tokenSymbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB] ' + err);
        });
        wlogger.debug(`deleteAssetRecordRows \nresult: ${result}`);
        resolve(true);
    });
}

const deleteAllRecordsBySymbol = async (tokenSymbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n--------==inside deleteAllRecordsBySymbol`);
        const result1 = await deleteTxnInfoRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        const result2 = await deleteProductRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        const result3 = await deleteSmartContractRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        const result4 = await deleteOrderRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        const result5 = await deleteIncomeArrangementRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        const result6 = await deleteAssetRecordRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        wlogger.debug(`check1 ... result1: ${result1}, result2: ${result2}, result3: ${result3}, result4: ${result4}, result5: ${result5}, result6: ${result6}`);

        const result_getProductRows = await getProductRows(tokenSymbol).catch((err) => {
            reject(err);
        });
        if (result_getProductRows) {
            wlogger.debug(`\ngetProductRows: ${result}`);
        } else {
            wlogger.debug(`\ngetProductRows: nothing is found`);
        }
        wlogger.debug(`check2`);
        const result_getSmartContractRows = await getSmartContractRows(tokenSymbol).catch((err) => {
            reject(err);
        });

        if (result_getSmartContractRows) {
            wlogger.debug(`getSmartContractRows: ${result}`);
        } else {
            wlogger.debug(`getSmartContractRows: nothing is found`);
        }
        wlogger.debug(`result_getProductRows: ${result_getProductRows} \nresult_getSmartContractRows: ${result_getSmartContractRows}`);
        resolve(true);
    });
}

const deleteAllRecordsBySymbolArray = async (tokenSymbolArray) => {
    return new Promise(async (resolve, reject) => {
        tokenSymbolArray.forEach(async (symbol, idx) => {
            const result = await deleteAllRecordsBySymbol(symbol);
            wlogger.debug(`result_deleteAllRecordsBySymbol(): ${result}`);
        });
        resolve(true);
    });
}

const addAssetRecordRowArray = async (inputArray, amountArray, symbol, ar_time, acPayment, asset_valuation, holding_amount_changed, holding_costChanged, acquiredCostArray, moving_ave_holding_cost) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n----------------------==addAssetRecordRowArray`);
        let mesg = '';
        const [isGoodar_time, ar_time_, mesgar_time] = testInputTime(ar_time);
        wlogger.debug('isGoodar_time:', isGoodar_time);
        if (!isGoodar_time) {
            reject(`${mesgar_time}`);
            return [null, null];
        }

        if (typeof symbol !== "string" || isEmpty(symbol)) {
            mesg = '[Error] symbol must be a string. symbol: ' + symbol;
            reject(mesg);
            return [null, null];

        } else if (!Array.isArray(inputArray) || inputArray.length === 0) {
            mesg = '[Error] inputArray must be a non empty array';
            wlogger.debug(mesg, inputArray);
            reject(mesg);
            return [null, null];

        } else if (!Array.isArray(amountArray) || amountArray.length === 0) {
            mesg = '[Error] amountArray must be an non empty array';
            wlogger.debug(mesg, amountArray);
            reject(mesg);
            return [null, null];

        } else if (inputArray.length !== amountArray.length) {
            mesg = '[Error] inputArray and amountArray must have the same length';
            reject(mesg);
            return [null, null];
        }

        const emailArray = [];
        if (inputArray[0].includes('@')) {
            inputArray.forEach((item, idx) => emailArray.push(item));

        } else {
            wlogger.debug(`all input values are good`);
            const queryStr4 = 'SELECT u_email FROM user WHERE u_assetbookContractAddress = ?';
            await asyncForEachAssetRecordRowArray(inputArray, async (addrAssetbook, index) => {
                const emailObj = await mysqlPoolQueryB(queryStr4, [addrAssetbook]).catch((err) => {
                    wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr4)]`);
                    reject(err);
                    return [null, null];
                });
                //wlogger.debug(`\nemailObj: ${emailObj}`);
                if (!Array.isArray(emailObj)) {
                    wlogger.debug(`\n----==[Warning] email address is null or undefined for addrAssetbook: ${addrAssetbook}, emailObj: ${emailObj}`);
                    emailArray.push('email:_null_or_undefined');

                } else if (emailObj.length > 1) {
                    wlogger.error(`\n----==[Error] Got multiple email addresses from one addrAssetbook: ${addrAssetbook}, emailObj: ${emailObj}`);
                    emailArray.push('email:_multiple_emails_were_found');

                } else if (emailObj.length === 0) {
                    wlogger.error(`\n----==[Error] Got empty email address from one addrAssetbook: ${addrAssetbook}, emailObj: ${emailObj}`);
                    emailArray.push('email:not_found');

                } else {
                    const email = emailObj[0].u_email;
                    wlogger.info(`\n----==[Good] Got one email ${email} from assetbook: \n${addrAssetbook}, amount: ${amountArray[index]}`);
                    emailArray.push(email);
                }
            });
        }

        const emailArrayError = [];
        const amountArrayError = [];
        wlogger.debug(`\n--------------==addAssetRecordRowArray: emailArray:\n ${emailArray}`);
        await asyncForEachAssetRecordRowArray2(emailArray, async (email, idx) => {
            const amount = amountArray[idx];
            const acquiredCost = acquiredCostArray[idx];

            if (!email.includes('@')) {
                emailArrayError.push(email);
                amountArrayError.push(amount);
                wlogger.error(`[Error @ email] email: ${email}, amount: ${amount} ... added to emailArrayError and amountArrayError`);

            } else {
                wlogger.debug(`mysql612: email: ${email}, symbol: ${symbol}, ar_time: ${ar_time} \nacPayment(singleActualIncomePayment): ${acPayment}, amount: ${amount}, acquiredCost: ${acquiredCost}`);
                const sqlObject = {
                    ar_investorEmail: email,
                    ar_tokenSYMBOL: symbol,
                    ar_Time: ar_time,
                    ar_Holding_Amount_in_the_end_of_Period: amount,
                    ar_personal_income: acPayment * amount,
                    ar_User_Asset_Valuation: asset_valuation,
                    ar_User_Holding_Amount_Changed: holding_amount_changed,
                    ar_User_Holding_CostChanged: holding_costChanged,
                    ar_User_Acquired_Cost: acquiredCost,
                    ar_Moving_Average_of_Holding_Cost: moving_ave_holding_cost
                };
                wlogger.debug(sqlObject);

                const queryStr6 = 'INSERT INTO investor_assetRecord SET ?';
                const result6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
                    wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr6)]`);
                    reject(err);
                    return [null, null];
                });
                //wlogger.debug(`result6: ${ result6);
            }
        });
        wlogger.debug(`\n--------------==End of addAssetRecordRowArray`);
        resolve([emailArrayError, amountArrayError]);
    });
    //process.exit(0);
}




//---------------------------== FundingState and TokenState
const getFundingStateDB = (symbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`inside getFundingStateDB()... get p_state`);
        const queryStr2 = 'SELECT p_state, p_CFSD, p_CFED FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
            wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]`);
            reject(err);
            return false;
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || result.length < 3) {
            wlogger.debug(`query failed or invalid`);
            resolve(undefined);
        } else {
            wlogger.debug(`symbol: ${symbol}, pstate: ${result[0]}, CFSD: ${result[1]}, CFED: ${result[2]}`);
            resolve(true);
        }
    });
}

//-------------------------==Not to be confused with setTokenStateDB
const setFundingStateDB = (symbol, pstate, CFSD, CFED) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\ninside setFundingStateDB()... change p_state`);
        const queryStr1 = 'UPDATE product SET p_state = ?, p_CFSD = ?, p_CFED = ? WHERE p_SYMBOL = ?';
        const queryStr2 = 'UPDATE product SET p_state = ? WHERE p_SYMBOL = ?';

        const [isGoodCFSD, CFSD_, mesgCFSD] = testInputTime(CFSD);
        const [isGoodCFED, CFED_, mesgCFED] = testInputTime(CFED);
        wlogger.debug('isGoodCFSD:', isGoodCFSD, ', isGoodCFED:', isGoodCFED);

        if (isGoodCFSD && isGoodCFED) {
            const result1 = await mysqlPoolQueryB(queryStr1, [pstate, CFSD, CFED, symbol]).catch((err) => {
                wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]`);
                reject(err);
                return false;
            });
            wlogger.debug(`[setFundingStateDB] symbol: ${symbol}, pstate: ${pstate}, CFSD: ${CFSD}, CFED: ${CFED}`);
            //wlogger.debug(`result1: ${result1)`);
            resolve(true);

        } else {
            const result2 = await mysqlPoolQueryB(queryStr2, [pstate, symbol]).catch((err) => {
                wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]`);
                reject(err);
                return false;
            });
            wlogger.info(`[Success @setFundingStateDB] have set symbol: ${symbol}, to p_state = ${pstate}`);
            //wlogger.debug(`result2: ${result2}`);
            resolve(true);
        }
    });
}


//-------------------------==Not to be confused with setFundingStateDB
const setTokenStateDB = (symbol, tokenState, lockuptime, validdate) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\ninside setTokenStateDB()... change p_tokenState`);

        const queryStr1 = 'UPDATE product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
        const queryStr2 = 'UPDATE product SET p_tokenState = ? WHERE p_SYMBOL = ?';

        const [isGoodlockuptime, lockuptime_, mesglockuptime] = testInputTime(lockuptime);
        wlogger.debug('isGoodlockuptime:', isGoodlockuptime);
        const [isGoodvaliddate, validdate_, mesgvaliddate] = testInputTime(validdate);
        wlogger.debug('isGoodvaliddate:', isGoodvaliddate);


        if (isGoodlockuptime && isGoodvaliddate) {
            const result1 = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
                wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr1)]`);
                reject(err);
                return false;
            });
            wlogger.debug(`[DB] symbol: ${symbol}, tokenState: ${tokenState}, lockuptime: ${lockuptime}, validdate: ${validdate}`);
            //wlogger.debug(`result: ${result1}`);
            resolve(true);

        } else {
            const result = await mysqlPoolQueryB(queryStr2, [tokenState, symbol]).catch((err) => {
                wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]`);
                reject(err);
                return false;
            });
            wlogger.debug(`\nresult: ${result} \n[DB] symbol: ${symbol}, tokenState: ${tokenState}`);
            //wlogger.debug(`result: ${result1}`);
            resolve(true);
        }
    });
}

//yarn run testmt -f 212
const getTokenStateDB = async (symbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`inside getTokenStateDB()... get p_tokenState`);
        const queryStr2 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
            wlogger.error(`\n[Error @ setTokenStateDB: mysqlPoolQueryB(queryStr2)]`);
            reject(err);
            return false;
        });
        //wlogger.debug(`=> ${result[0].p_tokenState}`);
        const resultStr = JSON.stringify(result, null, 4);
        //wlogger.debug(`resultStr: ${resultStr}`);
        //wlogger.debug(`symbol: ${symbol}, tokenState: ${result[0].p_tokenState}, lockuptime: ${result[0].p_lockuptime}, validdate: ${result[0].p_validdate}`);
        resolve([true, result[0].p_tokenState, result[0].p_lockuptime, result[0].p_validdate]);
        // const [isGood, tokenState, lockuptime, validdate] = getTokenStateDB(symbol);
    });
}


const getAllSmartContractAddrs = async (symbol) => {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\n---------==inside getAllSmartContractAddrs`);
        const queryStr1 = 'SELECT * FROM smart_contracts WHERE sc_symbol = ?';
        const ctrtAddrResult = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
            (err) => {
                reject('[Error @ getAllSmartContractAddrs:' + err);
            });
        wlogger.debug(`ctrtAddrResult: ${ctrtAddrResult}`);
        if (!Array.isArray(ctrtAddrResult)) {
            resolve([false, undefined, `[Error] invalid contract row`]);

        } else if (ctrtAddrResult.length == 0) {
            resolve([false, undefined, `[Error] no contract row is found for ${symbol}`]);

        } else if (ctrtAddrResult.length > 1) {
            resolve([false, 'multipleAddr', `[Error] multiple contract rows are found for ${symbol}`]);

        } else {
            //wlogger.debug(`ctrtAddrResult[0]: ${ctrtAddrResult[0]}`);
            //process.exit(0);
            const ctrtAddrObj = ctrtAddrResult[0];
            resolve([ctrtAddrObj['sc_crowdsaleaddress'], ctrtAddrObj['sc_erc721Controller'], ctrtAddrObj['sc_erc721address'], ctrtAddrObj['sc_incomeManagementaddress']]);
        }
    });
}

// getCtrtAddr(symbol, 'incomemanager')
// getCtrtAddr(symbol, 'tokencontroller')
const getCtrtAddr = async (symbol, ctrtType) => {
    return new Promise(async (resolve, reject) => {
        //wlogger.debug(`\n---------==inside getCtrtAddr`);
        let scColumnName, mesg;
        if (ctrtType === 'incomemanager') {
            scColumnName = 'sc_incomeManagementaddress';
        } else if (ctrtType === 'crowdfunding') {
            scColumnName = 'sc_crowdsaleaddress';
        } else if (ctrtType === 'hcat721') {
            scColumnName = 'sc_erc721address';
        } else if (ctrtType === 'tokencontroller') {
            scColumnName = 'sc_erc721Controller';
            // } else if(ctrtType === 'helium'){
            //   scColumnName = 'sc_helium';
        } else {
            reject('contract type ' + ctrtType + ' is not found');
            return undefined;
        }
        const queryStr1 = 'SELECT ' + scColumnName + ' FROM smart_contracts WHERE sc_symbol = ?';
        const ctrtAddrResult = await mysqlPoolQueryB(queryStr1, [symbol]).catch(
            (err) => {
                reject('[Error @ getCtrtAddr:' + err);
            });
        wlogger.debug(`ctrtAddrResult: ${ctrtAddrResult}`);
        if (!Array.isArray(ctrtAddrResult)) {
            resolve([false, undefined, `[Error] invalid ${ctrtType} contract address found for ${symbol}`]);

        } else if (ctrtAddrResult.length == 0) {
            resolve([false, undefined, `[Error] no ${ctrtType} contract address is found for ${symbol}`]);

        } else if (ctrtAddrResult.length > 1) {
            resolve([false, 'multipleAddr', `[Error] multiple ${ctrtType} addresses are found for ${symbol}`]);

        } else {
            const targetAddr = ctrtAddrResult[0][scColumnName]; //.sc_incomeManagementaddress;
            if (isEmpty(targetAddr)) {
                resolve([false, '0x0', `[Error] empty ${ctrtType} contract address value is found for ${symbol}, targetAddr: ${targetAddr}`]);
            } else {
                resolve([true, targetAddr, `[Good] one ${ctrtType} address is found for ${symbol}`]);
            }
        }
    });
}

const getSymbolFromCtrtAddr = async (ctrtAddr, ctrtType) => {
    return new Promise(async (resolve, reject) => {
        //wlogger.debug(`\n---------==inside getSymbolFromCtrtAddr`);
        let scColumnName, mesg;
        if (ctrtType === 'incomemanager') {
            scColumnName = 'sc_incomeManagementaddress';
        } else if (ctrtType === 'crowdfunding') {
            scColumnName = 'sc_crowdsaleaddress';
        } else if (ctrtType === 'hcat721') {
            scColumnName = 'sc_erc721address';
        } else if (ctrtType === 'tokencontroller') {
            scColumnName = 'sc_erc721Controller';
            // } else if(ctrtType === 'helium'){
            //   scColumnName = 'sc_helium';
        } else {
            reject(ctrtType + ' is out of range');
            return undefined;
        }
        const queryStr1 = 'SELECT sc_symbol from smart_contracts where ' + scColumnName + ' = ?';
        const symbolResult = await mysqlPoolQueryB(queryStr1, [ctrtAddr]).catch((err) => {
            reject(`[Error @ getSymbolFromCtrtAddr] ${err}`);
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result)) {
            resolve([false, undefined, `[Error] invalid symbol is found for ${ctrtType} contract address$ {ctrtAddr}`]);

        } else if (symbolResult.length == 0) {
            resolve([false, undefined, `[Error] no symbol is found for ${ctrtType} contract address$ {ctrtAddr}`]);

        } else if (symbolResult.length > 1) {
            resolve([false, 'multipleSymbols', `[Error] multiple symbols are found for ${ctrtType} addresses ${ctrtAddr}`]);

        } else {
            const symbol = symbolResult[0]['sc_symbol'];
            if (isEmpty(symbol)) {
                resolve([false, '', `[Error] empty symbol value is found for ${ctrtType} contract address ${ctrtAddr}`]);
            } else {
                resolve([true, symbol, `[Good] one symbol is found for ${ctrtType} address ${ctrtAddr}`]);
            }
        }
    });
}

//------------------------==
function setIMScheduleDB(symbol, tokenState, lockuptime, validdate) {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`\ninside setIMScheduleDB()... change p_tokenState`);

        const [isGoodlockuptime, lockuptime_, mesglockuptime] = testInputTime(lockuptime);
        wlogger.debug('isGoodlockuptime:', isGoodlockuptime);
        // if(!isGoodlockuptime){
        //   reject(`${mesglockuptime}`);
        //   return false;
        // }
        const [isGoodvaliddate, validdate_, mesgvaliddate] = testInputTime(validdate);
        wlogger.debug('isGoodvaliddate:', isGoodvaliddate);
        // if(!isGoodvaliddate){
        //   reject(`${mesgvaliddate}`);
        //   return false;
        // }

        if (isGoodlockuptime && isGoodvaliddate) {
            const queryStr1 = 'UPDATE product SET p_tokenState = ?, p_lockuptime = ?, p_validdate = ? WHERE p_SYMBOL = ?';
            const result = await mysqlPoolQueryB(queryStr1, [tokenState, lockuptime, validdate, symbol]).catch((err) => {
                reject('[Error @ mysqlPoolQueryB(queryStr1)]' + err);
            });
            wlogger.debug(`[DB] symbol: ${symbol}, tokenState: ${tokenState}, lockuptime: ${lockuptime}, validdate: ${validdate}, result: ${result}`);
            resolve(true);

        } else {
            const queryStr1 = 'UPDATE product SET p_tokenState = ? WHERE p_SYMBOL = ?';
            const result = await mysqlPoolQueryB(queryStr1, [tokenState, symbol]).catch((err) => {
                reject('[Error @ mysqlPoolQueryB(queryStr1)]' + err);
            });
            wlogger.debug(`[DB] symbol: ${symbol}, tokenState: ${tokenState}, result: ${result}`);
            resolve(true);
        }
    });
}

function isIMScheduleGoodDB(symbol) {
    return new Promise(async (resolve, reject) => {
        wlogger.debug(`inside isIMScheduleGoodDB()`);
        const queryStr1 = 'SELECT p_tokenState, p_lockuptime, p_validdate FROM product WHERE p_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
            reject('[Error @ mysqlPoolQueryB(queryStr1)]' + err);
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || result.length < 3) {
            wlogger.debug(`[isIMScheduleGoodDB] returned invalid result. symbol: ${symbol}`);
            resolve([undefined, undefined]);
        } else {
            wlogger.debug(`symbol: ${symbol}, tokenState: ${result[0]}, lockuptime: ${result[1]}, validdate: ${result[2]}`);
            resolve([result[0], result[1]]);
        }
    });
}


//yarn run testts -a 2 -c 4
const addIncomePaymentPerPeriodIntoDB = async (serverTime) => {
    wlogger.debug(`inside addIncomePaymentPerPeriodIntoDB()... serverTime: ${serverTime} ${typeof serverTime}`);
    const symbolArray = [];
    const acPaymentTimeArray = [];
    const acIncomePaymentArray = [];
    const addrHCAT_Array = [];
    const abAddrArrayGroup = [];
    const abBalArrayGroup = [];
    const incomePaymentArrayGroup = [];

    const queryStr0 = 'SELECT distinct ia_SYMBOL FROM product';
    const symbolObjArray = await mysqlPoolQueryB(queryStr0, []).catch((err) => {
        wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr0)] ${err}`);
    });
    if (!Array.isArray(symbolObjArray) || !symbolObjArray.length) {
        wlogger.debug(`invalid symbolObjArray: ${symbolObjArray}`);
        return undefined;
    }

    const queryStr7 = 'SELECT ia_SYMBOL, ia_actualPaymentTime, ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_actualPaymentTime = (SELECT  MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ?)'
    await asyncForEach(symbolObjArray, async (symbolObj, index) => {
        const result = await mysqlPoolQueryB(queryStr7, [symbolObj.ia_SYMBOL]).catch((err) => {
            wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr7)] ${err}`);
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result) || !result.length) {
            wlogger.debug(`invalid query7 result: ${result}`);
            return undefined;
        } else {
            const symbolM = result[0].ia_SYMBOL;
            const acpaymentTime = parseInt(result[0]['MAX(ia_actualPaymentTime)']);
            if (serverTime >= acpaymentTime) {
                wlogger.debug(`found period: ${symbolM} ${acpaymentTime}`);
                symbolArray.push(symbolM);
                acPaymentTimeArray.push(acpaymentTime);
                const incomePayment = parseInt(result[0].ia_single_Actual_Income_Payment_in_the_Period);
                acIncomePaymentArray.push(incomePayment);
            }
        }
    });
    /*
    const queryStr1 = 'SELECT ia_SYMBOL, MAX(ia_actualPaymentTime) FROM income_arrangement WHERE ia_SYMBOL = ?';
    await asyncForEach(symbolObjArray, async (symbolObj, index) => {
      const result = await mysqlPoolQueryB(queryStr1, [symbolObj.ia_SYMBOL]).catch((err) => {
        wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr1)]'+ err);
      });
      //wlogger.debug(`result: ${ result, result[0].ia_SYMBOL, result[0]['MAX(ia_actualPaymentTime)']);
      const symbolM = result[0].ia_SYMBOL;
      const acpaymentTime = parseInt(result[0]['MAX(ia_actualPaymentTime)']);
      if(serverTime >= acpaymentTime){
        wlogger.debug(`found period: ${ symbolM, acpaymentTime);
        symbolArray.push(symbolM);
        acPaymentTimeArray.push(acpaymentTime);
      }
    });
    wlogger.debug(`\n----------------==\nsymbolArray: ${ symbolArray, '\nacPaymentTimeArray: ${ acPaymentTimeArray);

    if(symbolArray.length > 0){
      const queryStr2 = 'SELECT ia_SYMBOL, ia_single_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_SYMBOL = ?';
      await asyncForEach(symbolArray, async (symbol, index) => {
        const result = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
          wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr2)]'+ err);
        });
        const incomePayment = parseInt(result[0].ia_single_Actual_Income_Payment_in_the_Period);
        acIncomePaymentArray.push(incomePayment);
      });
  
    } else {
      wlogger.debug(`no periodSymbol is found.`);
    }
    */

    wlogger.debug(`\n----------------==\nsymbolArray: ${symbolArray} \nacPaymentTimeArray: ${acPaymentTimeArray}
  acIncomePaymentArray: ${acIncomePaymentArray}`);


    //const crowdFundingAddr = await getCtrtAddr(symbol, 'hcat721`);
    const queryStr2 = 'SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol = ?';
    await asyncForEach(symbolArray, async (symbol, index) => {
        const result2 = await mysqlPoolQueryB(queryStr2, [symbol]).catch((err) => {
            wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr2)] ${err}`);
        });
        wlogger.debug(`result2: ${result2}`);
        if (!Array.isArray(result2)) {
            wlogger.error(`[Error] erc721 contract address: invalid`);
            addrHCAT_Array.push(`invalid erc721 ctrt result`);

        } else if (result2.length === 0) {
            wlogger.error(`[Error] erc721 contract address was not found`);
            addrHCAT_Array.push(`Not on record`);

        } else if (result2.length > 1) {
            wlogger.error(`[Error] multiple erc721 contract addresses were found`);
            addrHCAT_Array.push(`multiple contract addr`);

        } else if (isEmpty(result2[0].sc_erc721address)) {
            wlogger.error(`[Error] erc21 contract addresses is null or undefined or empty string`);
            addrHCAT_Array.push(result2[0].sc_erc721address);

        } else {
            wlogger.info(`[Good] erc721 contract address: ${result2[0].sc_erc721address}`);
            addrHCAT_Array.push(result2[0].sc_erc721address);
        }
    });
    wlogger.debug(`addrHCAT_Array: ${addrHCAT_Array}`);


    await asyncForEach(addrHCAT_Array, async (tokenCtrtAddr, index) => {
        if (tokenCtrtAddr !== null || tokenCtrtAddr !== undefined || tokenCtrtAddr !== 'multiple contract addr' || tokenCtrtAddr !== 'Not on record') {

            const [abAddrArray, abBalArray] = await getOwnerAddrAmountList(tokenCtrtAddr, 0, 0);
            abAddrArrayGroup.push(abAddrArray);
            abBalArrayGroup.push(abBalArray);

            const acPayment = acIncomePaymentArray[index];
            const incomePaymentArray = abBalArray.map(function (balance) {
                return parseInt(balance) * acPayment;
            });
            incomePaymentArrayGroup.push(incomePaymentArray);
        }
    });
    wlogger.debug(`\n  symbolArray: ${symbolArray}
  acIncomePaymentArray: ${acIncomePaymentArray}
  abAddrArrayGroup: ${abAddrArrayGroup} 
  incomePaymentArrayGroup: ${incomePaymentArrayGroup}`);

    const emailArrayGroup = [];
    await asyncForEach(abAddrArrayGroup, async (abAddrArray, index) => {
        const symbol = symbolArray[index];
        const acPaymentTime = acPaymentTimeArray[index];
        const emailArray = [];
        await asyncForEach(abAddrArray, async (assetbookAddr, idx) => {
            const queryStr3 = 'SELECT u_email FROM user WHERE u_assetbookContractAddress = ?';
            const result3 = await mysqlPoolQueryB(queryStr3, [assetbookAddr]).catch((err) => {
                wlogger.error(`\n[Error @ mysqlPoolQueryB(queryStr3)] ${err}`);
            });
            wlogger.debug(`result3: ${result3}`);
            if (!Array.isArray(result3)) {
                wlogger.debug(`invalid u_email`);
                return false;
            } else if (result3.length === 0) {
                wlogger.debug(`u_email is not found`);
                return false;
            } else {
                const email = result3[0].u_email;
                emailArray.push(email);

                const personal_income = incomePaymentArrayGroup[index][idx];
                const holding_Amount = abBalArrayGroup[index][idx];
                wlogger.debug(`    email: ${email}, symbol: ${symbol}, acPaymentTime: ${acPaymentTime}, holding_Amount: ${holding_Amount}
    personal_income: ${personal_income}`);
                const sqlObject = {
                    ar_investorEmail: email,
                    ar_tokenSYMBOL: symbol,
                    ar_Time: acPaymentTime,
                    ar_Holding_Amount_in_the_end_of_Period: holding_Amount,
                    ar_personal_income: personal_income,
                };
                wlogger.debug(sqlObject);

                const queryStr6 = 'INSERT INTO investor_assetRecord SET ?';
                const result6 = await mysqlPoolQueryB(queryStr6, sqlObject).catch((err) => {
                    wlogger.error(`[Error @ mysqlPoolQueryB(queryStr6)] ${err}`);
                });
                wlogger.debug(`result6: ${result6}`);
            }
        });
        wlogger.debug(`emailArray: ${emailArray}`);
        emailArrayGroup.push(emailArray);
    });
    wlogger.debug(`\nemailArrayGroup: ${emailArrayGroup}`);


}

const addForecastedSchedulesIntoDB = async () => {
    // already done when uploading csv into DB
}

const getForecastedSchedulesFromDB = async (symbol) => {
    return new Promise(async (resolve, reject) => {
        const queryStr1 = 'SELECT ia_time, ia_single_Forecasted_Payable_Income_in_the_Period From income_arrangement where ia_SYMBOL = ?';
        const result = await mysqlPoolQueryB(queryStr1, [symbol]).catch((err) => {
            reject('[Error @ addScheduleBatch: mysqlPoolQueryB(queryStr1)]:' + err);
            return false;
        });
        wlogger.debug(`result: ${result}`);
        if (!Array.isArray(result)) {
            reject('invalid result from ia_time, ia_single_Forecasted_Payable_Income_in_the_Period');
            return false;

        } else if (result.length === 0) {
            reject('ia_time, ia_single_Forecasted_Payable_Income_in_the_Period not found');
            return false;

        } else {
            const forecastedPayableTimes = [];
            const forecastedPayableAmounts = [];
            const forecastedPayableTimesError = [];
            const forecastedPayableAmountsError = [];

            for (let i = 0; i < result.length; i++) {
                if (typeof result[i] === 'object' && result[i] !== null && result[i] !== undefined) {
                    forecastedPayableTimes.push(result[i].ia_time);
                    forecastedPayableAmounts.push(result[i].ia_single_Forecasted_Payable_Income_in_the_Period);
                } else {
                    forecastedPayableTimesError.push(result[i].ia_time);
                    forecastedPayableAmountsError.push(result[i].ia_single_Forecasted_Payable_Income_in_the_Period);
                }
            }
            resolve([forecastedPayableTimes, forecastedPayableAmounts, forecastedPayableTimesError, forecastedPayableAmountsError]);
        }
    });
}


module.exports = {
    frontendPoolQuery,
    mysqlPoolQuery,
    addOrderRow,
    addUserRow,
    addTxnInfoRow,
    addTxnInfoRowFromObj,
    getTxnInfoRowsBySymbol,
    addIncomeArrangementRowFromObj,
    addIncomeArrangementRow,
    addIncomeArrangementRows,
    setFundingStateDB,
    getFundingStateDB,
    setTokenStateDB,
    getTokenStateDB,
    addProductRow,
    addSmartContractRow,
    add3SmartContractsBySymbol,
    addUsersIntoDB,
    addUserArrayOrdersIntoDB,
    addArrayOrdersIntoDB,
    addOrderIntoDB,
    isIMScheduleGoodDB,
    setIMScheduleDB,
    getPastScheduleTimes,
    getSymbolsONM,
    addAssetRecordRow,
    addAssetRecordRowArray,
    addActualPaymentTime,
    addIncomePaymentPerPeriodIntoDB,
    getAssetbookFromEmail,
    getAssetbookFromIdentityNumber,
    mysqlPoolQueryB,
    getCtrtAddr,
    getSymbolFromCtrtAddr,
    getForecastedSchedulesFromDB,
    calculateLastPeriodProfit,
    getProfitSymbolAddresses,
    setAssetRecordStatus,
    getMaxActualPaymentTime,
    getAcPayment,
    deleteTxnInfoRows,
    deleteProductRows,
    deleteSmartContractRows,
    deleteOrderRows,
    deleteIncomeArrangementRows,
    deleteAssetRecordRows,
    getAllSmartContractAddrs,
    deleteAllRecordsBySymbol,
    checkIaAssetRecordStatus,
    deleteAllRecordsBySymbolArray,
    updateIAassetRecordStatus,
    deleteUsersInDB
}
module.exports = {
    frontendPoolQuery,
    mysqlPoolQuery,
    addOrderRow,
    addUserRow,
    addTxnInfoRow,
    addTxnInfoRowFromObj,
    getTxnInfoRowsBySymbol,
    addIncomeArrangementRowFromObj,
    addIncomeArrangementRow,
    addIncomeArrangementRows,
    setFundingStateDB,
    getFundingStateDB,
    setTokenStateDB,
    getTokenStateDB,
    addProductRow,
    addSmartContractRow,
    add3SmartContractsBySymbol,
    addUsersIntoDB,
    addUserArrayOrdersIntoDB,
    addArrayOrdersIntoDB,
    addOrderIntoDB,
    isIMScheduleGoodDB,
    setIMScheduleDB,
    getPastScheduleTimes,
    getSymbolsONM,
    addAssetRecordRow,
    addAssetRecordRowArray,
    addActualPaymentTime,
    addIncomePaymentPerPeriodIntoDB,
    getAssetbookFromEmail,
    getAssetbookFromIdentityNumber,
    mysqlPoolQueryB,
    getCtrtAddr,
    getSymbolFromCtrtAddr,
    getForecastedSchedulesFromDB,
    calculateLastPeriodProfit,
    getProfitSymbolAddresses,
    setAssetRecordStatus,
    getMaxActualPaymentTime,
    getAcPayment,
    deleteTxnInfoRows,
    deleteProductRows,
    deleteSmartContractRows,
    deleteOrderRows,
    deleteIncomeArrangementRows,
    deleteAssetRecordRows,
    getAllSmartContractAddrs,
    deleteAllRecordsBySymbol,
    checkIaAssetRecordStatus,
    deleteAllRecordsBySymbolArray,
    updateIAassetRecordStatus,
    deleteUsersInDB
}