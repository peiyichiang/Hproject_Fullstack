const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const router = express.Router();
const amqp = require('amqplib/callback_api');

const { blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, isTimeserverON, wlogger } = require('../timeserver/envVariables');

const { getTimeServerTime, isEmpty, checkIntFromOne } = require('../timeserver/utilities');

const { preMint, mintSequentialPerContract, schCindex,  checkAddScheduleBatch, getIncomeSchedule, getIncomeScheduleList,  removeIncomeSchedule, imApprove, setPaymentReleaseResults, addScheduleBatchFromDB, rabbitMQSender } = require('../timeserver/blockchain.js');

const { getCtrtAddr, findSymbolFromCtrtAddr, getAssetbookFromEmail, mysqlPoolQueryB, setFundingStateDB, setTokenStateDB, calculateLastPeriodProfit, getAssetbookFromIdentityNumber } = require('../timeserver/mysql.js');

const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

/**後台公私鑰*/
const backendAddr = process.env.HELIUM_ADMIN;//admin;
const backendRawPrivateKey = process.env.HELIUM_ADMIN_PRIVATEKEY;//adminpkRaw;
const backendPrivateKey = Buffer.from(backendRawPrivateKey.substr(2), 'hex');

/**contracts info*/
const heliumContract = require('../ethereum/contracts/build/Helium.json');
const tokenControllerContract = require('../ethereum/contracts/build/TokenController.json');
const crowdFundingContract = require('../ethereum/contracts/build/CrowdFunding.json');
const assetBookContract = require('../ethereum/contracts/build/AssetBook.json');
const registryContract = require('../ethereum/contracts/build/Registry.json');
const HCAT721_AssetTokenContract = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
const incomeManagerContract = require('../ethereum/contracts/build/IncomeManagerCtrt.json');
const productManagerContract = require('../ethereum/contracts/build/ProductManager.json');


const heliumContractAddr = process.env.HELIUMCONTRACTADDR;//"0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf";
const registryContractAddr = process.env.REGISTRYCONTRACTADDR;//"0x6E2548A83283921136FE322E0333B03551F7f0C8";
const productManagerContractAddr = process.env.PRODUCTMANAGERCONTRACTADDR;//"0x2a8dc29BF3C44Cb2Be3C62D1a968894B2635E7b9";
const management = [process.env.HELIUM_ADMIN, process.env.HELIUM_CHAIRMAN, process.env.HELIUM_DIRECTOR, process.env.HELIUM_MANAGER, process.env.HELIUM_OWNER];

const addrZero = "0x0000000000000000000000000000000000000000";
/**time server*/
getTimeServerTime().then(function (time) {
    console.log(`[Contracts.js] server time: ${time}`)
})


/**@dev Helium ------------------------------------------------------------------------------------- */
/**deploy helium contract*/
router.post('/heliumContract', function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    const helium = new web3deploy.eth.Contract(heliumContract.abi);

    helium.deploy({
        data: heliumContract.bytecode,
        arguments: [management]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/*get heliumcontractAddr*/
router.get('/heliumContract', function (req, res, next) {
    res.send(heliumContractAddr);
});

router.post('/heliumContract/isAfterDeployment', async function (req, res, next) {
  const addrHelium = req.body.addrHelium;
  console.log('inside isAfterDeployment', addrHelium);
  const instHelium = new web3.eth.Contract(heliumContract.abi, addrHelium);
  const result = await instHelium.methods.isAfterDeployment().call();
  res.send({ result });
});

router.post('/heliumContract/PermissionList', async function (req, res, next) {
  const addrHelium = req.body.addrHelium;
  const addrInput = req.body.addrInput;
  console.log(`inside PermissionList... \naddrHelium: ${addrHelium}\naddrInput: ${addrInput}`);
  const instHelium = new web3.eth.Contract(heliumContract.abi, addrHelium);
  const result = await instHelium.methods.PermissionList(addrInput).call();
  res.send({ result });
});




/**@dev Registry ------------------------------------------------------------------------------------- */
/*deploy registry contract*/
router.post('/registryContract', function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    const registry = new web3deploy.eth.Contract(registryContract.abi);

    registry.deploy({
        data: registryContract.bytecode,
        arguments: [heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//9000000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.status(500).send(error.toString());
        })
});

/*get registryContractAddr*/
router.get('/registryContract', function (req, res, next) {
    res.send(registryContractAddr);
});

/*註冊新會員 */
router.post('/registryContract/users/:u_id', async function (req, res, next) {
    /**寫入BlockChain */
    let userID = req.params.u_id;
    let assetBookAddr = req.body.assetBookAddress;
    let ethAddr = req.body.ethAddr;

    const registry = new web3.eth.Contract(registryContract.abi, registryContractAddr);

    let encodedData = registry.methods.addUser(userID, assetBookAddr, 1).encodeABI();

    try {
        let contractResult = await signTx(backendAddr, backendRawPrivateKey, registryContractAddr, encodedData);
        /**寫入DataBase */
        let u_email = req.body.email;
        let mysqlPoolQuery = req.pool;
        let sql = {
            u_assetbookContractAddress: assetBookAddr,
            u_eth_add: ethAddr,
            u_investorLevel: 1
        };

        //console.log(element)
        mysqlPoolQuery('UPDATE user SET ? WHERE u_email = ?', [sql, u_email], async function (err, rows) {
            if (err) {
                console.log(err);
                let databaseResult = err;
                res.send({
                    contractResult: contractResult,
                    databaseResult: databaseResult
                })
            }
            else {
                let databaseResult = {
                    status: "success",
                    email: u_email,
                    assetBookAddr: assetBookAddr,
                    ethAddr: ethAddr,
                    status: 0
                };
                res.send({
                    status: true,
                    contractResult: contractResult,
                    databaseResult: databaseResult
                })
            }
        });

    } catch (error) {
        console.log("error:" + error);
        res.status(500);
        res.send(error.toString());
    }

});

/*get會員資訊 */
router.get('/registryContract/users/:u_id', async function (req, res, next) {
    let u_id = req.params.u_id;

    const registry = new web3.eth.Contract(registryContract.abi, registryContractAddr);

    let userInfo = await registry.methods.getUser(u_id).call({ from: backendAddr });

    res.send({
        userInfo: userInfo
    });
});

router.post('/registryContract/getUserFromUid/:uid', async function (req, res, next) {
  const uid = req.body.uid;
  const registryCtrtAddr = req.body.registryCtrtAddr;
  console.log(`\nuid: ${uid}, registryCtrtAddr: ${registryCtrtAddr}`);
  if(isEmpty(uid)){
    res.send({
      err: 'uid is invalid. '+uid,
      status: false
    });
    return false;
  }
  const instAssetbook = new web3.eth.Contract(registryContract.abi, assetbookAddr);
  const isContract = await instAssetbook.methods.getUserFromUid(uid).call();

  res.send({ isContract });
});







/**@dev AssetBook ------------------------------------------------------------------------------------- */
/*deploy assetbook contract*/
router.post('/assetbookContract', async function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let assetBookOwner = req.body.assetBookOwner;
    const assetBook = new web3deploy.eth.Contract(assetBookContract.abi);


    assetBook.deploy({
        data: assetBookContract.bytecode,
        arguments: [assetBookOwner, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

// http://localhost:3030/Contracts/assetbook/getAssetbookDetails
router.get('/assetbook/getAssetbookDetails/:ctrtAddr', async function (req, res, next) {
  console.log(`inside getAssetbookDetails...`)
  const assetbookCtrtAddr = req.params.ctrtAddr;
  console.log(`\nassetbookCtrtAddr: ${assetbookCtrtAddr} ${typeof {assetbookCtrtAddr}}`);
  if(isEmpty(assetbookCtrtAddr)){
    res.send({
      err: 'assetbookCtrtAddr is invalid. '+assetbookCtrtAddr,
      status: false
    });
    return false;
  }
  const instAssetbook = new web3.eth.Contract(assetBookContract.abi, assetbookCtrtAddr);
  const assetOwner = await instAssetbook.methods.assetOwner().call();
  const endorserCount = await instAssetbook.methods.endorserCount().call();
  const lastLoginTime = await instAssetbook.methods.lastLoginTime().call();
  const antiPlatformOverrideDaysDefault = await instAssetbook.methods.antiPlatformOverrideDaysDefault().call();
  const antiPlatformOverrideDays = await instAssetbook.methods.antiPlatformOverrideDays().call();
  const assetOwner_flag = await instAssetbook.methods.assetOwner_flag().call();
  const HeliumContract_flag = await instAssetbook.methods.HeliumContract_flag().call();
  const endorsers_flag = await instAssetbook.methods.endorsers_flag().call();
  const checkAssetOwner = await instAssetbook.methods.checkAssetOwner().call();
  const checkCustomerService = await instAssetbook.methods.checkCustomerService().call();
  const isAblePlatformOverride = await instAssetbook.methods.isAblePlatformOverride().call();
  const assetCindex = await instAssetbook.methods.assetCindex().call();
  const calculateVotes = await instAssetbook.methods.calculateVotes().call();

  res.send({ assetOwner, endorserCount, lastLoginTime, antiPlatformOverrideDaysDefault, antiPlatformOverrideDays, assetOwner_flag, HeliumContract_flag, endorsers_flag, checkAssetOwner, checkCustomerService, isAblePlatformOverride, assetCindex, calculateVotes
  });
});

router.post('/assetbook/endorsers', async function (req, res, next) {
  const assetbookAddr = req.body.assetbookAddr;
  const endorserIndex = req.body.endorserIndex;
  console.log(`\nendorserIndex: ${endorserIndex}`);
  if(isEmpty(endorserIndex)){
    res.send({
      err: 'endorserIndex is invalid',
      status: false
    });
    return false;
  }
  const instAssetbook = new web3.eth.Contract(assetBookContract.abi, assetbookAddr);
  const endorserAddr = await instAssetbook.methods.endorsers(endorserIndex).call();

  res.send({ endorserAddr });
});

router.post('/assetbook/checkIsContract', async function (req, res, next) {
  const assetbookAddr = req.body.assetbookAddr;
  const targetAddress = req.body.targetAddress;
  console.log(`\ntargetAddress: ${targetAddress}`);
  if(isEmpty(targetAddress)){
    res.send({
      err: 'targetAddress is invalid. '+targetAddress,
      status: false
    });
    return false;
  }
  const instAssetbook = new web3.eth.Contract(assetBookContract.abi, assetbookAddr);
  const isContract = await instAssetbook.methods.checkIsContract(targetAddress).call();

  res.send({ isContract });
});

router.post('/assetbook/getAsset', async function (req, res, next) {
  const assetbookAddr = req.body.assetbookAddr;
  const assetIndex = req.body.assetIndex;
  const tokenAddress = req.body.tokenAddress;
  console.log(`\nassetbookAddr: ${assetbookAddr}, \nassetIndex: ${assetIndex}, tokenAddress: ${tokenAddress}`);
  if(isEmpty(tokenAddress || isEmpty(assetIndex))){
    res.send({
      err: 'assetIndex or/and tokenAddress is/are invalid',
      status: false
    });
    return false;
  }
  const instAssetbook = new web3.eth.Contract(assetBookContract.abi, assetbookAddr);
  const assetInfo = await instAssetbook.methods.getAsset(assetIndex, tokenAddress).call();
  const symbolStr = web3.utils.toAscii(assetInfo.symbol);
  //console.log('>>', assetInfo.symbol, );
  res.send({ status: true, assetInfo, symbolStr });
});

/**@dev CrowdFunding ------------------------------------------------------------------------------------- */
/*deploy crowdFunding contract*/
router.post('/crowdFundingContract/:tokenSymbol', async function (req, res, next) {

    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let tokenSymbol = req.params.tokenSymbol;;
    let tokenPrice = req.body.tokenPrice;
    let currency = req.body.currency;
    let quantityMax = req.body.quantityMax;
    let fundingGoal = req.body.fundingGoal;
    let CFSD2 = parseInt(req.body.CFSD2);
    let CFED2 = parseInt(req.body.CFED2);
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);

    const crowdFunding = new web3deploy.eth.Contract(crowdFundingContract.abi);

    crowdFunding.deploy({
        data: crowdFundingContract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, fundingGoal, CFSD2, CFED2, currentTime, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            console.log(receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            let contractAddress = receipt.contractAddress;

            mysqlPoolQuery("INSERT INTO smart_contracts (sc_symbol, sc_crowdsaleaddress, sc_totalsupply, sc_remaining) VALUES (?,?,?,?)", [tokenSymbol, contractAddress, quantityMax, quantityMax], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send({
                        deployResult: receipt,
                        status: false
                    });
                }
                else {
                    res.send({
                        deployResult: receipt,
                        status: true,
                        p_SYMBOL: req.body.tokenSymbol,
                        crowdingFundingContractAddr: req.body.contractAddress,
                        quantityMax: quantityMax,
                        remaining: quantityMax
                    });
                }
            });
        })
        .on('error', function (error) {
            console.log("error:" + error);
            res.status(500);
            res.send(error.toString());
        })
});

/**invest*/
router.post('/crowdFundingContract/:tokenSymbol/investors/:assetBookAddr', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let assetBookAddr = req.params.assetBookAddr;
            let quantityToInvest = req.body.quantityToInvest;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);
            console.log("assetBookAddr:" + assetBookAddr + "\nquantityToInvest:" + quantityToInvest + "\n" + "currentTime:" + currentTime);
            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.invest(assetBookAddr, quantityToInvest, currentTime).encodeABI();
            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                let revertReason = await crowdFunding.methods.checkInvestFunction(assetBookAddr, quantityToInvest, currentTime).call({ from: backendAddr })
                console.log("revertReason:" + revertReason);
                res.status(500);
                res.send({ error: error.toString(), revertReason: revertReason });
            }

        }
    });

});

/**更新剩餘數量 in DB */
router.post('/crowdFundingContract/:tokenSymbol/remaining', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBGetResult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBGetResult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBGetResult[0].sc_crowdsaleaddress;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let quantitySold = await crowdFunding.methods.quantitySold().call({ from: backendAddr });
            let maxTotalSupply = await crowdFunding.methods.maxTotalSupply().call({ from: backendAddr });

            console.log("maxTotalSupply:" + maxTotalSupply);
            console.log("quantitySold:" + quantitySold);
            let remaining = maxTotalSupply - quantitySold;
            mysqlPoolQuery('UPDATE `htoken`.`smart_contracts` SET `sc_remaining` = ? WHERE (`sc_symbol` = ?)', [remaining, tokenSymbol], async function (err, DBUpdateResult, rows) {
                if (err) {
                    res.send({
                        DBGetResult: DBGetResult,
                        remaining: remaining,
                        err: err,
                        status: false
                    })
                }
                else {
                    res.send({
                        DBGetResult: DBGetResult,
                        DBUpdateResult: DBUpdateResult,
                        remaining: remaining
                    })
                }
            });
        }
    });

});

/**get investors */
router.get('/crowdFundingContract/:tokenSymbol/investors', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);
            let investors = await crowdFunding.methods.getInvestors(1, 100).call({ from: backendAddr })

            res.send(investors);
        }
    });
});

/**funding pause*/
router.post('/crowdFundingContract/:tokenSymbol/pause', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.pauseFunding(currentTime).encodeABI();

            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                res.status(500);
                res.send(error.toString());
            }
        }
    });

});

/**funding resume*/
router.post('/crowdFundingContract/:tokenSymbol/resume', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let CFED2 = req.body.CFED2;
            let quantityMax = req.body.quantityMax;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.resumeFunding(CFED2, quantityMax, currentTime).encodeABI();

            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                let revertReason = await crowdFunding.methods.checkResumeFunding(CFED2, quantityMax, currentTime).call({ from: backendAddr })
                console.log("revertReason:" + revertReason);
                res.status(500);
                res.send({ error: error.toString(), revertReason: revertReason });
            }
        }
    });

});

/**funding terminate*/
router.post('/crowdFundingContract/:tokenSymbol/terminate', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let reason = req.body.reason;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.terminate(reason, currentTime).encodeABI();

            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                res.status(500);
                res.send(error.toString());
            }
        }
    });

});

/**get status */
router.get('/crowdFundingContract/:tokenSymbol/status', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log()
            console.log(tokenSymbol);
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);
            let fundingState = await crowdFunding.methods.fundingState().call({ from: backendAddr })
            let stateDescription = await crowdFunding.methods.stateDescription().call({ from: backendAddr })
            let quantityGoal = await crowdFunding.methods.quantityGoal().call({ from: backendAddr })
            let maxTotalSupply = await crowdFunding.methods.maxTotalSupply().call({ from: backendAddr })
            let quantitySold = await crowdFunding.methods.quantitySold().call({ from: backendAddr })
            let CFSD2 = await crowdFunding.methods.CFSD().call({ from: backendAddr })
            let CFED2 = await crowdFunding.methods.CFED().call({ from: backendAddr })

            res.send({
                fundingState: fundingState,
                stateDescription: stateDescription,
                quantityGoal: quantityGoal,
                maxTotalSupply: maxTotalSupply,
                quantitySold: quantitySold,
                CFSD2: CFSD2,
                CFED2: CFED2,
                crowdFundingAddr: crowdFundingAddr
            });
        }

    });
});

/**funding updateState （timeserver用）*/
router.post('/crowdFundingContract/:tokenSymbol/updateState', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = req.body.time;
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_crowdsaleaddress);
            let crowdFundingAddr = DBresult[0].sc_crowdsaleaddress;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.updateState(currentTime).encodeABI();

            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                res.status(500);
                res.send(error.toString());
            }
        }
    });

});

/**close funding*/
router.post('/crowdFundingContract/:tokenSymbol/closeFunding', async function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let tokenControllerAddr;
    let HCAT721Addr;
    let incomeManagerAddr;
    //combine 4 contracts PARAM
    let crowdFundingCtrtAddr = req.body.crowdFundingCtrtAddr;
    //tokenController PARAM
    let TimeOfDeployment = req.body.TimeOfDeployment;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;
    //HCAT721 PARAM
    let nftName = req.body.nftName;
    let nftSymbol = req.params.tokenSymbol;
    let siteSizeInKW = req.body.siteSizeInKW;
    let maxTotalSupply = req.body.maxTotalSupply;
    let initialAssetPricing = req.body.initialAssetPricing;
    let pricingCurrency = req.body.pricingCurrency;
    let IRR20yrx100 = req.body.IRR20yrx100;
    let addrERC721SPLC_ControllerITF = req.body.addrERC721SPLC_ControllerITF;
    let tokenURI = req.body.tokenURI;
    tokenURIBytes32 = web3.utils.fromAscii(tokenURI);
    nftNameBytes32 = web3.utils.fromAscii(nftName);
    nftSymbolBytes32 = web3.utils.fromAscii(nftSymbol);
    pricingCurrencyBytes32 = web3.utils.fromAscii(pricingCurrency);
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);
    console.log(nftSymbol);

    const tokenController = new web3deploy.eth.Contract(tokenControllerContract.abi);
    const HCAT721 = new web3deploy.eth.Contract(HCAT721_AssetTokenContract.abi);
    const incomeManager = new web3deploy.eth.Contract(incomeManagerContract.abi);
    const productManager = new web3.eth.Contract(productManagerContract.abi, productManagerContractAddr);


    await tokenController.deploy({
        data: tokenControllerContract.bytecode,
        arguments: [TimeOfDeployment, TimeTokenUnlock, TimeTokenValid, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//9000000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            tokenControllerAddr = receipt.contractAddress;
        })
        .on('error', function (error) {
            console.log("tokenController deploy failed");
            res.status(500);
            res.send({ Title: "tokenController deploy failed", Reason: error.toString() });
        })

    await HCAT721.deploy({
        data: HCAT721_AssetTokenContract.bytecode,
        arguments: [nftNameBytes32, nftSymbolBytes32, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrencyBytes32, IRR20yrx100, registryContractAddr, productManagerContractAddr, tokenControllerAddr, tokenURIBytes32, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//10000000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            HCAT721Addr = receipt.contractAddress;
        })
        .on('error', function (error) {
            console.log("HCAT721 deploy failed");
            res.status(500);
            res.send({ Title: "HCAT721 deploy failed", Reason: error.toString() });
        })

    await incomeManager.deploy({
        data: incomeManagerContract.bytecode,
        arguments: [HCAT721Addr, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//9000000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            incomeManagerAddr = receipt.contractAddress;
        })
        .on('error', function (error) {
            console.log("incomeManager deploy failed");
            res.status(500);
            res.send({ Title: "incomeManager deploy failed", Reason: error.toString() });
        })

    let encodedData = productManager.methods.addNewCtrtGroup(nftSymbolBytes32, crowdFundingCtrtAddr, tokenControllerAddr, HCAT721Addr, incomeManagerAddr).encodeABI();
    try {
        let combineContractResult = await signTx(backendAddr, backendRawPrivateKey, productManagerContractAddr, encodedData);
        let mysqlPoolQuery = req.pool;
        let updateContractsAddrsql = {
            sc_erc721address: HCAT721Addr,
            sc_erc721Controller: tokenControllerAddr,
            sc_incomeManagementaddress: incomeManagerAddr
        };
        console.log(nftSymbol)
        mysqlPoolQuery('UPDATE smart_contracts SET ? WHERE sc_symbol = ?', [updateContractsAddrsql, nftSymbol], function (err, rows) {
            if (err) {
                console.log(err);
                res.send({
                    deployResult: err,
                    status: false
                });
            }
            else {
                var updateCrowdFubdingStatesql = {
                    p_state: "FundingClosed",
                    p_PAdate: new Date().toLocaleString().toString()
                };
                mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [updateCrowdFubdingStatesql, nftSymbol], function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.send({
                            "tokenControllerAddr": tokenControllerAddr,
                            "HCAT721Addr": HCAT721Addr,
                            "incomeManagerAddr": incomeManagerAddr,
                            "combine4Contracts": combineContractResult.status,
                            "updateDB": rows
                        });
                    }

                });
            }
        });

    } catch (error) {
        console.log("error:" + error);
        res.status(500);
        res.send(error.toString());
    }

})


//-----------------------==mysql
router.post('/getTokenSymbolFromCtrtAddr', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const ctrtType = req.body.ctrtType;

  console.log(`${ctrtType} addr: ${ctrtAddr}`);
  const [isGood, symbol, resultMesg] = await findSymbolFromCtrtAddr(ctrtAddr, ctrtType);
  console.log(`\n${resultMesg}.\nisGood: ${isGood}, symbol found: ${symbol}`);
  res.send({
    isGood: isGood,
    symbol: symbol, 
    resultMesg: resultMesg
  });
});

router.post('/getCtrtAddrFromTokenSymbol', async function (req, res, next) {
  const tokenSymbol = req.body.tokenSymbol;
  const ctrtType = req.body.ctrtType;

  console.log(`tokenSymbol: ${tokenSymbol}, ctrtType: ${ctrtType}`);
  const [isGood, ctrtAddr, resultMesg] = await getCtrtAddr(tokenSymbol, ctrtType).catch((err) => {
    console.log('[Error @getCtrtAddr]:', err);
    res.send({
        err: err,
        status: false
    });
    return false;
  });
  console.log(`\n${resultMesg}.\nisGood: ${isGood}, contract address found: ${ctrtAddr}`);
  res.send({
    isGoodCtrtAddr: isGood,
    ctrtAddr: ctrtAddr, 
    resultMesg: resultMesg
  });
});

router.post('/getAssetbookFromEmail', async function (req, res, next) {
  const email = req.body.email;
  console.log(`email: ${email}`);
  const [isGoodAssetbook, assetbookX, resultMesg] = await getAssetbookFromEmail(email).catch((err) => {
    console.log('[Error @getAssetbookFromEmail]:', err);
    res.send({
        err: err,
        status: false
    });
    return false;
  });
  console.log(`----------==API isGoodAssetbook: ${isGoodAssetbook}, assetbookX: ${assetbookX}, resultMesg: ${resultMesg}`);
  res.send({
    isGoodAssetbook, assetbookX, resultMesg
  });
});

router.post('/getAssetbookFromIdentityNumber', async function (req, res, next) {
  const identityNumber = req.body.identityNumber;
  console.log(`identityNumber: ${identityNumber}`);
  const [isGoodAssetbook, assetbookX, resultMesg] = await getAssetbookFromIdentityNumber(identityNumber).catch((err) => {
    console.log('[Error @getAssetbookFromIdentityNumber]:', err);
    res.send({
        err: err,
        status: false
    });
    return false;
  });
  console.log(`----------==API isGoodAssetbook: ${isGoodAssetbook}, assetbookX: ${assetbookX}, resultMesg: ${resultMesg}`);
  res.send({
    isGoodAssetbook, assetbookX, resultMesg
  });
});

//-----------------------==
// http://localhost:3030/Contracts/crowdfunding/getCrowdfundingDetails
router.get('/crowdfunding/getCrowdfundingDetails/:ctrtAddr', async function (req, res, next) {
  const crowdfundingCtrtAddr = req.params.ctrtAddr;
  console.log(`\ncrowdfundingCtrtAddr: ${crowdfundingCtrtAddr}`);
  if(isEmpty(crowdfundingCtrtAddr)){
    res.send({
      err: 'crowdfundingCtrtAddr is invalid. '+crowdfundingCtrtAddr,
      status: false
    });
    return false;
  }
  const instCrowdfunding = new web3.eth.Contract(crowdFundingContract.abi, crowdfundingCtrtAddr);
  const cfcDetails = await instCrowdfunding.methods.getCrowdfundingDetails().call();
  console.log(`cfcDetails: ${cfcDetails}`);
  res.send({ cfcDetails });
});



// http://localhost:3030/Contracts/crowdfunding/getInvestors
router.post('/crowdfunding/getInvestors', async function (req, res, next) {
  const crowdfundingCtrtAddr = req.body.ctrtAddr;
  const indexStart = req.body.indexStart;
  const amount = req.body.amount;
  console.log(`\ncrowdfundingCtrtAddr: ${crowdfundingCtrtAddr}, indexStart: ${indexStart}, amount: ${amount}`);
  if(parseInt(indexStart) < 0 || parseInt(amount) < 0 || isEmpty(crowdfundingCtrtAddr)){
    res.send({
      err: 'indexStart or amount or contract addr is invalid',
      status: false,
    });
    return false;
  }
    const instCrowdfunding = new web3.eth.Contract(crowdFundingContract.abi, crowdfundingCtrtAddr)/*.catch((err) => {
        console.error('err:', err);
        res.send({
          err: err,
          status: false,
        });
        return false;
      });*/
    const investors = await instCrowdfunding.methods.getInvestors(indexStart, amount).call();
    console.log(`investors: ${investors}`);
    res.send({
        investors: investors
    });
});

// http://localhost:3030/Contracts/crowdfunding/emailToQty
router.post('/crowdfunding/emailToQty', async function (req, res, next) {
  const crowdfundingCtrtAddr = req.body.ctrtAddr;
  const email = req.body.email;
  console.log(`\ncrowdfundingCtrtAddr: ${crowdfundingCtrtAddr}, email: ${email}`);
    const [isGoodAssetbook, assetbookX, resultMesg] = await getAssetbookFromEmail(email).catch((err)=> {
      console.log('[Error @getAssetbookFromEmail]:', err);
    });
    console.log(`-----==API isGoodAssetbook: ${isGoodAssetbook}, assetbookX: ${assetbookX}, resultMesg: ${resultMesg}`)
    if(isGoodAssetbook){
      const instCrowdfunding = new web3.eth.Contract(crowdFundingContract.abi, crowdfundingCtrtAddr);
      const quantityOwned = await instCrowdfunding.methods.ownerToQty(assetbookX).call();
      console.log(`quantityOwned: ${quantityOwned}`);
      res.send({
          quantityOwned: quantityOwned
      });
    } else{
      res.send({
        err: 'assetbook or contract addr is invalid',
        status: false
      });
      return false;
    }
});

// http://localhost:3030/Contracts/crowdfunding/ownerToQty
router.post('/crowdfunding/ownerToQty', async function (req, res, next) {
  const crowdfundingCtrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  console.log(`\ncrowdfundingCtrtAddr: ${crowdfundingCtrtAddr}, assetbookAddr: ${assetbookAddr}`);
  if(assetbookAddr === '0x0' || isEmpty(assetbookAddr)|| isEmpty(crowdfundingCtrtAddr)){
    res.send({
      err: 'assetbookAddr or contract addr is invalid',
      status: false,
      quantityOwned: undefined
    });
    return false;
  }
  const instCrowdfunding = new web3.eth.Contract(crowdFundingContract.abi, crowdfundingCtrtAddr);
    const quantityOwned = await instCrowdfunding.methods.ownerToQty(assetbookAddr).call();
    console.log(`quantityOwned: ${quantityOwned}`);
    res.send({
        quantityOwned: quantityOwned
    });
});

// http://localhost:3030/Contracts/crowdfunding/idxToOwner
router.post('/crowdfunding/idxToOwner', async function (req, res, next) {
  const crowdfundingCtrtAddr = req.body.ctrtAddr;
  const index = parseInt(req.body.index);
  console.log(`\ncrowdfundingCtrtAddr: ${crowdfundingCtrtAddr}, index: ${index} ${typeof index}`);
  if(index < 0 || isNaN(index)|| isEmpty(crowdfundingCtrtAddr)){
    res.send({
      err: 'index or contract addr is invalid',
      status: false,
    });
    return false;
  }
  const instCrowdfunding = new web3.eth.Contract(crowdFundingContract.abi, crowdfundingCtrtAddr);
    const addrOwner = await instCrowdfunding.methods.idxToOwner(index).call();
    console.log(`addrOwner: ${addrOwner}`);
    res.send({
        addrOwner: addrOwner
    });
});


/**@dev TokenController ------------------------------------------------------------------------------------- */
/*deploy tokenController contract*/
router.post('/tokenControllerContract', async function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let TimeOfDeployment = req.body.TimeOfDeployment;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;

    const tokenController = new web3deploy.eth.Contract(tokenControllerContract.abi);

    tokenController.deploy({
        data: tokenControllerContract.bytecode,
        arguments: [TimeOfDeployment, TimeTokenUnlock, TimeTokenValid, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/**tokencontroller updateState（timeserver用）*/
router.post('/tokenControllerContract/:tokenSymbol/updateState', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = req.body.time;
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_erc721Controller FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_erc721Controller);
            let tokenControllerAddr = DBresult[0].sc_erc721Controller;
            let tokenController = new web3.eth.Contract(tokenControllerContract.abi, tokenControllerAddr);

            /*用後台公私鑰sign*/
            let encodedData = tokenController.methods.updateState(currentTime).encodeABI();

            try {
                let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);
                res.status(200);
                res.send({
                    DBresult: DBresult,
                    TxResult: TxResult
                });
            } catch (error) {
                console.log("error:" + error);
                res.status(500);
                res.send(error.toString());
            }
        }
    });

});

/**get status （timeserver用） */
router.get('/tokenControllerContract/:tokenSymbol/status', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_erc721Controller FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_erc721Controller);
            let tokenControllerAddr = DBresult[0].sc_erc721Controller;
            let tokenController = new web3.eth.Contract(tokenControllerContract.abi, tokenControllerAddr);
            let status = await tokenController.methods.tokenState().call({ from: backendAddr });

            res.send(status);
        }

    });
});

//-----------------------==
// http://localhost:3030/Contracts/tokenController/getHTokenControllerDetails
router.get('/tokenController/getHTokenControllerDetails/:ctrtAddr', async function (req, res, next) {
  const tokenControllerCtrtAddr = req.params.ctrtAddr;
  console.log(`\ntokenControllerCtrtAddr: ${tokenControllerCtrtAddr}`);
  if(isEmpty(tokenControllerCtrtAddr)){
    res.send({
      err: 'tokenControllerCtrtAddr is invalid. '+tokenControllerCtrtAddr,
      status: false
    });
    return false;
  }
    const instTokenController = new web3.eth.Contract(tokenControllerContract.abi, tokenControllerCtrtAddr);
    const getHTokenControllerDetails = await instTokenController.methods.getHTokenControllerDetails().call();
    console.log(`getHTokenControllerDetails: ${getHTokenControllerDetails}`);

    const isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();
    const tokenState = await instTokenController.methods.tokenState().call();

    res.send({
        getHTokenControllerDetails: getHTokenControllerDetails,
        details: [isTokenApprovedOperational, tokenState]
    });
});


//-----------------------== HCAT Token
// http://localhost:3030/Contracts/TokenHCAT/getTokenContractDetails
router.get('/tokenHCAT/getTokenContractDetails/:ctrtAddr', async function (req, res, next) {
  const ctrtAddr = req.params.ctrtAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const getTokenContractDetails = await instHCAT721.methods.getTokenContractDetails().call();
  const pricingCurrency = web3.utils.toAscii(getTokenContractDetails[5]);
  const name = web3.utils.toAscii(getTokenContractDetails[7]);
  const symbol = web3.utils.toAscii(getTokenContractDetails[8]);
  const tokenURI = web3.utils.toAscii(getTokenContractDetails[9]);

  const ownerCindex = await instHCAT721.methods.ownerCindex().call();
  const TimeOfDeployment = await instHCAT721.methods.TimeOfDeployment().call();
  console.log(`getTokenContractDetails: ${getTokenContractDetails}, \nownerCindex: ${ownerCindex}, TimeOfDeployment: ${TimeOfDeployment}`);
  res.send({ getTokenContractDetails, pricingCurrency, name, symbol, tokenURI, ownerCindex, TimeOfDeployment });
});

router.post('/tokenHCAT/idToAsset', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const tokenId = req.body.tokenId;
  console.log(`\ntokenId: ${tokenId}, ctrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr) || isEmpty(tokenId)){
    res.send({
      err: 'invalid inputs',
      ctrtAddr: ctrtAddr,
      tokenId: tokenId,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const idToAsset = await instHCAT721.methods.idToAsset(tokenId).call();
  console.log(`idToAsset: ${idToAsset}`);
  res.send({ idToAsset });
});

router.post('/tokenHCAT/isOwnerAdded', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const ownerAddr = req.body.ownerAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}, \nownerAddr: ${ownerAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const isOwnerAdded = await instHCAT721.methods.isOwnerAdded(ownerAddr).call();
  console.log(`isOwnerAdded: ${isOwnerAdded}`);

  res.send({ isOwnerAdded });
});

router.post('/tokenHCAT/idxToOwner', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const ownerIndex = req.body.ownerIndex;
  console.log(`\nownerIndex: ${ownerIndex}, tokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const idxToOwner = await instHCAT721.methods.idxToOwner(ownerIndex).call();
  console.log(`idxToOwner: ${idxToOwner}`);
  res.send({ idxToOwner });
});


router.post('/tokenHCAT/ownerOf', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const tokenId = req.body.tokenId;
  console.log(`\ntokenId: ${tokenId}, tokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const ownerOf = await instHCAT721.methods.ownerOf(tokenId).call();
  console.log(`ownerOf ownerAddr1: ${ownerOf}`);
  res.send({ ownerOf });
});

router.post('/tokenHCAT/getOwnersByOwnerIndex', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const startIndex = req.body.startIndex;
  const amount = req.body.amount;
  console.log(`\nstartIndex: ${startIndex}, amount: ${amount}, ctrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const getOwnersByOwnerIndex = await instHCAT721.methods.getOwnersByOwnerIndex(startIndex, amount).call();
  console.log(`getOwnersByOwnerIndex: ${getOwnersByOwnerIndex}`);
  res.send({ getOwnersByOwnerIndex });
});

router.post('/tokenHCAT/getAccount', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const getAccount = await instHCAT721.methods.getAccount(assetbookAddr).call();
  console.log(`getAccount: ${getAccount}`);
  res.send({ getAccount });
});

router.post('/tokenHCAT/balanceOf', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const balanceOf = await instHCAT721.methods.balanceOf(assetbookAddr).call();
  console.log(`balanceOf: ${balanceOf}`);
  res.send({ balanceOf });
});

router.post('/tokenHCAT/getTokenIdByIndex', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  const tokenIdAccountIndex = req.body.tokenIdAccountIndex;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const getTokenIdByIndex = await instHCAT721.methods.getTokenIdByIndex(assetbookAddr, tokenIdAccountIndex).call();
  console.log(`getTokenIdByIndex: ${getTokenIdByIndex}`);
  res.send({ getTokenIdByIndex });
});

router.post('/tokenHCAT/getAccountIds', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  const startIndex = req.body.startIndex;
  const amount = req.body.amount;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}, assetbookAddr: ${assetbookAddr}, startIndex: ${startIndex}, amount: ${amount}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const getAccountIds = await instHCAT721.methods.getAccountIds(assetbookAddr, startIndex, amount).call();
  console.log(`getAccountIds: ${getAccountIds}`);
  res.send({ getAccountIds });
});

router.post('/tokenHCAT/allowance', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const assetbookAddr = req.body.assetbookAddr;
  const operatorAddr = req.body.operatorAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}, assetbookAddr: ${assetbookAddr}, operatorAddr: ${operatorAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const allowance = await instHCAT721.methods.allowance(assetbookAddr, operatorAddr).call();
  console.log(`allowance: ${allowance}`);
  res.send({ allowance });
});

router.post('/tokenHCAT/checkTokenApprove', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const operatorAddr = req.body.operatorAddr;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const checkTokenApprove = await instHCAT721.methods.checkTokenApprove(operatorAddr).call();
  console.log(`checkTokenApprove: ${checkTokenApprove}`);
  res.send({ checkTokenApprove });
});

router.post('/tokenHCAT/tokenApprove', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const operatorAddr = req.body.operatorAddr;
  const amount = req.body.amount;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const tokenApprove = await instHCAT721.methods.tokenApprove(operatorAddr, amount).call();
  console.log(`tokenApprove: ${tokenApprove}`);
  res.send({ tokenApprove });
});

router.post('/tokenHCAT/ckStringLength', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const tokenId = req.body.tokenId;
  console.log(`\ntokenCtrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, ctrtAddr);
  const ckStringLength = await instHCAT721.methods.ckStringLength(str, minStrLen, maxStrLen).call();
  console.log(`ckStringLength: ${ckStringLength}`);
  res.send({ ckStringLength });
});


/**@dev HCAT721_AssetToken ------------------------------------------------------------------------------------- */
/*deploy HCAT721_AssetToken contract*/
router.post('/HCAT721_AssetTokenContract/:nftSymbol', async function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let nftName = req.body.nftName;
    let nftSymbol = req.params.nftSymbol;
    let siteSizeInKW = req.body.siteSizeInKW;
    let maxTotalSupply = req.body.maxTotalSupply;
    let initialAssetPricing = req.body.initialAssetPricing;
    let pricingCurrency = req.body.pricingCurrency;
    let IRR20yrx100 = req.body.IRR20yrx100;
    let addrERC721SPLC_ControllerITF = req.body.addrERC721SPLC_ControllerITF;
    let tokenURI = req.body.tokenURI;
    tokenURIBytes32 = web3.utils.fromAscii(tokenURI);
    nftNameBytes32 = web3.utils.fromAscii(nftName);
    nftSymbolBytes32 = web3.utils.fromAscii(nftSymbol);
    pricingCurrencyBytes32 = web3.utils.fromAscii(pricingCurrency);
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);


    const ERC721SPLC = new web3deploy.eth.Contract(HCAT721_AssetTokenContract.abi);

    ERC721SPLC.deploy({
        data: HCAT721_AssetTokenContract.bytecode,
        arguments: [nftNameBytes32, nftSymbolBytes32, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrencyBytes32, IRR20yrx100, registryContractAddr, productManagerContractAddr, addrERC721SPLC_ControllerITF, tokenURIBytes32, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//9000000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            console.log("ERC721:" + receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            var sql = {
                sc_erc721address: receipt.contractAddress,
                sc_erc721Controller: addrERC721SPLC_ControllerITF
            };


            console.log(nftSymbol)
            mysqlPoolQuery('UPDATE smart_contracts SET ? WHERE sc_symbol = ?', [sql, nftSymbol], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send({
                        deployResult: receipt,
                        status: false
                    });
                }
                else {
                    res.send({
                        deployResult: receipt,
                        status: true,
                        nftSymbol: nftSymbol
                    });
                }
            });

        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/*get HCAT721_AssetTokenContractAddr and CrowdFundingContractAddr by tokenSymble from DB*/
router.get('/HCAT721_AssetTokenContract/:nftSymbol', function (req, res, next) {
    var nftSymbol = req.params.nftSymbol;
    var mysqlPoolQuery = req.pool;
    console.log(nftSymbol);

    mysqlPoolQuery('SELECT sc_crowdsaleaddress, sc_erc721address, sc_erc721Controller FROM smart_contracts WHERE sc_symbol = ?;', [nftSymbol], function (err, result) {
        //console.log(result);
        if (err) {
            //console.log(err);
            res.send({
                status: "fail"
            });
        }
        else {
            res.send({
                status: "success",
                result: result[0]
            });
        }
    });

});




//-----------------------------== message queue relay API
// http://localhost:3000/Contracts/amqpRelay
router.post('/amqpRelay', async function (req, res, next) {
    console.log(`\n------------------==amqpRelay`);
    const nftSymbol = req.body.nftSymbol;
    const price = req.body.price;
    const functionName = req.body.functionName;
    //const nftSymbol = req.params.nftSymbol;

    res.send({
        status: true,
        success: undefined,
        result: 'The request is being processed!'
    });
    rabbitMQSender(functionName, nftSymbol, price);
});

//message queue consumer (receiver) 
// http://localhost:3000/Contracts/amqpTest1receiver
router.post('/amqpTest1receiver', async function (req, res, next) {
    console.log(`\n------------------==testrabbitmq...`);
    amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((error0, channel) => {
            if (error0) {
                console.log('error0', error0);
                throw error0;
            }
            const boxName = 'amqpTest1';
            channel.assertQueue(boxName, { durable: false });
            // I suppose the process will take about 5 seconds to finish
            setTimeout(() => {
                let result = 'xyz0001';
                channel.sendToQueue(boxName, new Buffer.from(result));
                console.log(` [X] Send: ${result}`);
            }, 5000)
        });
        // The connection will close in 10 seconds
        setTimeout(() => {
            conn.close();
        }, 10000);
    });
    res.send('The POST request is being processed!');
});


//-----------------------------==

router.post('/doAssetRecordsCaller/:symbol/', async function (req, res, next) {
  console.log(`\n--------------==Calling doAssetRecords API...`);
  const symbol = req.params.symbol;
  const toAddressArray = req.body.toAddressArray;
  const amountArray = req.body.amountArray;
  const tokenCtrtAddr = req.body.tokenCtrtAddr;
  const pricing = req.body.pricing;
  const fundingType = req.body.fundingType;

  let isSuccess = false, mesg = '';//PO: 1, PP: 2
  const [is_addAssetRecordRowArray, emailArrayError, amountArrayError, is_addActualPaymentTime, is_setFundingStateDB] = await doAssetRecordsCaller(toAddressArray, amountArray, symbol, pricing);

  console.log(`\nSuccess: ${isSuccess} \n${mesg}`);

  res.send({
      status: true,
      success: isSuccess,
      is_addAssetRecordRowArray: is_addAssetRecordRowArray,
      emailArrayError: emailArrayError,
      amountArrayError: amountArrayError,
      is_addActualPaymentTime: is_addActualPaymentTime,
      is_setFundingStateDB: is_setFundingStateDB,
      result: 'successfully done at doAssetRecords()'
  });
});


router.post('/HCAT721_AssetTokenContract/:symbol/preMint', async function (req, res, next) {
  console.log(`\n---------------------==API preMint...`);
  const symbol = req.params.symbol;
  let mesg= '';
  const [is_preMint, mesg_preMint, addressArray, amountArray, tokenCtrtAddr, fundingType, pricing] = await preMint(symbol).catch((err) => {
    mesg = `[Error] failed @ preMint(). err: ${err}`;
    console.error(mesg);
    return false;
  });
  console.log(`--------------==Returned values from preMint(): \nis_preMint: ${is_preMint}, mesg_preMint: ${mesg_preMint}
  \naddressArray: ${addressArray} \namountArray: ${amountArray} \ntokenCtrtAddr: ${tokenCtrtAddr}, \npricing: ${pricing}, fundingType: ${fundingType}`);

  const isNumberArray = amountArray.map((item) => {
    return typeof item === 'number';
  });
  console.log(`isNumberArray: ${isNumberArray}`);

  res.send({
    is_preMint: is_preMint, mesg_preMint: mesg_preMint,
    addressArray: addressArray, amountArray: amountArray, tokenCtrtAddr: tokenCtrtAddr, fundingType: fundingType, pricing: pricing
  });
});

//for sequential minting tokens ... if mint amount > maxMintAmountPerRun, we need to wait for it to finished before minting some more tokens
// http://localhost:3030/Contracts/HCAT721_AssetTokenContract/Htoken05/mintSequentialPerContract
router.post('/HCAT721_AssetTokenContract/:symbol/mintSequentialPerContract', async function (req, res, next) {
    console.log(`\n---------------------==API mintSequentialPerContract...`);
    const symbol = req.params.symbol;
    const maxMintAmountPerRun = 190;
    const serverTime = await getTimeServerTime();
    console.log('serverTime:', serverTime);

    res.send({
      success: 'in process...',
    });
  
    const [is_preMint, is_doAssetRecords, is_addActualPaymentTime, is_setFundingStateDB, is_sequentialMintSuper] = await mintSequentialPerContract(symbol, serverTime, maxMintAmountPerRun);
    console.log(`is_preMint: ${is_preMint}, is_doAssetRecords: ${is_doAssetRecords}, is_addActualPaymentTime: ${is_addActualPaymentTime}, is_setFundingStateDB: ${is_setFundingStateDB}, is_sequentialMintSuper: ${is_sequentialMintSuper}`);
});


/** calculateLastPeriodProfit */
router.post('/HCAT721_AssetRecord/:tokenSymbol', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    const result = await calculateLastPeriodProfit(tokenSymbol).catch((err) => {
        console.log('[Error @ calculateLastPeriodProfit]', err);
        res.send({
            err: err,
            status: false
        });
    });
    console.log(`result: ${result}`);
    if (result) {
        if (result[0] === null || result[1] === null) {
            res.send({
                result0: result[0],
                result1: result[1],
                status: false
            });
        } else if (Array.isArray(result[0])) {
            res.send({
                status: true,
                emailArrayError: result[0],
                amountArrayError: result[1]
            });
        } else {
            res.send({
                status: false,
                result0: result[0],
                result1: result[1],
            });
        }
    } else {
        res.send({
            status: false,
            result0: result[0],
            result1: result[1],
        });
    }
});


/**get tokenId  */
router.get('/HCAT721_AssetTokenContract/:tokenSymbol/:assetBookAddr', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let assetBookAddr = req.params.assetBookAddr;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_erc721address);
            let contractAddr = DBresult[0].sc_erc721address;
            let HCAT721_AssetToken = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, contractAddr);
            let tokenId = await HCAT721_AssetToken.methods.balanceOf(assetBookAddr).call({ from: backendAddr });

            res.send(tokenId);
        }

    });
});


/**get tokenId  */
router.get('/HCAT721_AssetTokenContract/:tokenSymbol/tokenId', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_erc721address);
            let contractAddr = DBresult[0].sc_erc721address;
            let HCAT721_AssetToken = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, contractAddr);
            let tokenId = await HCAT721_AssetToken.methods.tokenId().call({ from: backendAddr });

            res.send(tokenId);
        }

    });
});


router.post('/HCAT721_AssetTokenContract/safeTransferFromBatch', async function (req, res, next) {
    const contractAddr = req.body.erc721address;
    const fromAssetbook = req.body.from;
    const toAssetbook = req.body.assetBookAddr;
    const amount = req.body.amount;
    const price = req.body.price;
    const serverTime = req.body.serverTime;

    const tokenSymbol = req.body.tokenSymbol;

    //const inst_HCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, contractAddr);
    const instAssetBookFrom = new web3.eth.Contract(assetBookContract.abi, fromAssetbook);

    const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, contractAddr, addrZero, toAssetbook, amount, price, serverTime).encodeABI();
    //safeTransferFromBatch(address _from, address _to, uint amount, uint price, uint serverTime)
    const _fromAssetOwner = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    const _fromAssetOwnerpkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";

    try {
        let TxResult = await signTx(_fromAssetOwner, _fromAssetOwnerpkRaw, fromAssetbook, encodedData);
        res.status(200);
        res.send({
            DBresult: DBresult,
            TxResult: TxResult
        });
    } catch (error) {
        console.log("error:" + error);
        const revertReason = await instAssetBookFrom.methods.checkSafeTransferFromBatch(0, contractAddr, addrZero, toAssetbook, amount, price, serverTime).call({ from: _fromAssetOwner });
        console.log("revertReason:" + revertReason);
        res.status(500);
        res.send({ error: error.toString(), revertReason: revertReason });
    }

    console.log('after safeTransferFromBatch() is completed...');
    const txid = tokenSymbol + period + tokenId + txCount
    const tokenId = tokenId;
    const txCount = txCount;
    const holdingDays = holdingDays;
    const txTime = txTime;
    const balanceOffromassetbook = balanceOffromassetbook;

    let success = true;
    await addTxnInfoRow(txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook).catch((err) => {
        console.log('\n[Error @ addTxnInfoRow()]', err)
        success = false;
    });
    if (success) {
        res.send({
            status: "success"
        });
    } else {
        res.send({
            status: "fail"
        });
    }
});


/**@dev incomeManager ------------------------------------------------------------------------------------- */
/*deploy incomeManager contract*/
router.post('/incomeManagerContract/:nftSymbol', async function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    let nftSymbol = req.params.nftSymbol;
    let erc721address = req.body.erc721address;
    let currentTime;
    await getTimeServerTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`);


    const incomeManager = new web3deploy.eth.Contract(incomeManagerContract.abi);

    incomeManager.deploy({
        data: incomeManagerContract.bytecode,
        arguments: [erc721address, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            console.log("incomeManager:" + receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            var sql = {
                sc_incomeManagementaddress: receipt.contractAddress
            };

            console.log(nftSymbol)
            mysqlPoolQuery('UPDATE smart_contracts SET ? WHERE sc_symbol = ?', [sql, nftSymbol], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send({
                        deployResult: receipt,
                        status: false
                    });
                }
                else {
                    res.send({
                        deployResult: receipt,
                        status: true,
                        nftSymbol: nftSymbol
                    });
                }
            });

        })
        .on('error', function (error) {
            res.send(error.toString());
        })

});



//---------------------------==Income Manager
//---------------------------==
router.get('/incomeManagerContract/:tokenSymbol/schCindex', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const schIndex = req.params.schIndex;
    const result = await schCindex(symbol, schIndex).catch((err) => {
        console.log('[Error @schCindex]:', err);
        res.send({
            err: err,
            status: false
        });
    });
    if (result) {
        res.send({
            status: true,
            result: result
        });
    } else {
        res.send({ status: false });
    }
});

router.get('/incomeManagerContract/:tokenSymbol/getIncomeSchedule', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const schIndex = req.params.schIndex;
    const result = await getIncomeSchedule(symbol, schIndex).catch((err) => {
        console.log('[Error @getIncomeSchedule]:', err);
        res.send({
            err: err,
            status: false
        });
    });
    if (result) {
        res.send({
            status: true,
            nforecastedPayableTime: result[0],
            forecastedPayableAmount: result[1],
            actualPaymentTime: result[2],
            actualPaymentAmount: result[3],
            isApproved: result[4],
            errorCode: result[5],
            isErrorResolved: result[6]
        });
    } else {
        res.send({ status: false });
    }
});

router.get('/incomeManagerContract/:tokenSymbol/getIncomeScheduleList', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const forecastedPayableTime = req.params.forecastedPayableTime;
    const scheduleList = await getIncomeScheduleList(symbol, forecastedPayableTime).catch((err) => {
        console.log('[Error @getIncomeScheduleList]:', err);
        res.send({
            err: err,
            status: false
        });
    });
    if (scheduleList) {
        res.send({
            status: true,
            scheduleList: scheduleList
        });
    } else {
        res.send({ status: false });
    }
});


router.get('/incomeManagerContract/:tokenSymbol/checkAddScheduleBatch', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const forecastedPayableTimes = req.params.forecastedPayableTimes;
    const forecastedPayableAmounts = req.params.forecastedPayableAmounts;

    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      res.send({
        err: err,
        status: false
      });
    });
    console.log(`\n${resultMesg}. \naddrIncomeManager: ${addrIncomeManager}`);
    if(isGood){
      const [array1, array2] = await checkAddScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
          console.log('[Error @checkAddScheduleBatch]:', err);
          res.send({
              err: err,
              status: false
          });
      });
      if (array1.length > 0 && array2.length > 0) {
          res.send({
              err: err,
              status: false,
              array1: array1,
              array2: array2
          });
      } else {
          res.send({
              err: result,
              status: false
          });
      }
    } else {
      res.send({
        err: resultMesg,
        status: false
      });
    }
});



router.post('/incomeManagerContract/:tokenSymbol/addScheduleBatchFromDB', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    // const forecastedPayableTimes = req.params.forecastedPayableTimes;
    // const forecastedPayableAmounts = req.params.forecastedPayableAmounts;
    const [isGood, addrIncomeManager, resultMesg] = await getCtrtAddr(symbol,'incomemanager').catch((err) => {
      res.send({
        err: err,
        status: false,
      });
    });
    console.log(`\n${resultMesg}. \naddrIncomeManager: ${addrIncomeManager}`);
    if(isGood){
      const result = await addScheduleBatchFromDB(symbol).catch((err) => {
        console.log('[Error @addScheduleBatchFromDB]:', err);
        res.send({
            err: err,
            status: false,
        });
        return undefined;
      });

      if (result) {
          res.send({ status: true });
      } else {
          const results = await checkAddScheduleBatch(addrIncomeManager, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
              console.log('[Error @checkAddScheduleBatch]:', err);
              res.send({
                  err: err,
                  status: false
              });
          });
          console.log(results);
          res.send({ status: false });
      }
    } else {
      res.send({
        err: resultMesg,
        status: false,
    });
  }
});


//-------------------==
router.get('/incomeManagerContract/:tokenSymbol/removeIncomeSchedule', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const schIndex = req.params.schIndex;

    const result = await removeIncomeSchedule(symbol, schIndex).catch((err) => {
        console.log('[Error @removeIncomeSchedule]:', err);
        res.send({
            err: err,
            status: false
        });
        if (result) {
            res.send({ status: true });
        } else {
            res.send({ status: false });
        }
    });
});

//-------------------==
router.get('/incomeManagerContract/:tokenSymbol/imApprove', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const schIndex = req.params.schIndex;
    const boolValue = req.params.boolValue;

    const result = await imApprove(symbol, schIndex, boolValue).catch((err) => {
        console.log('[Error @imApprove]:', err);
        res.send({
            err: err,
            status: false
        });
        if (result) {
            res.send({ status: true });
        } else {
            res.send({ status: false });
        }
    });
});

//-------------------==
router.get('/incomeManagerContract/:tokenSymbol/setPaymentReleaseResults', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    const schIndex = req.params.schIndex;
    const actualPaymentTime = req.params.actualPaymentTime;
    const actualPaymentAmount = req.params.actualPaymentAmount;
    const errorCode = req.params.errorCode;

    const result = await setPaymentReleaseResults(symbol, schIndex, actualPaymentTime, actualPaymentAmount, errorCode).catch((err) => {
        console.log('[Error @setPaymentReleaseResults]:', err);
        res.send({
            err: err,
            status: false
        });
        if (result) {
            res.send({ status: true });
        } else {
            res.send({ status: false });
        }
    });
});

/**get isScheduleGoodForRelease（timeserver用） */
router.get('/incomeManagerContract/:tokenSymbol/isScheduleGoodForRelease', async function (req, res, next) {
    let symbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = req.body.time;
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_incomeManagementaddress FROM smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
        if (err) {
            //console.log(err);
            res.send({
                err: err,
                status: false
            });
        }
        else {
            console.log(DBresult[0].sc_incomeManagementaddress);
            let incomeManagerAddr = DBresult[0].sc_incomeManagementaddress;
            let incomeManager = new web3.eth.Contract(incomeManagerContract.abi, incomeManagerAddr);
            let isScheduleGoodForRelease = await incomeManager.methods.isScheduleGoodForRelease(currentTime).call({ from: backendAddr });

            res.send(isScheduleGoodForRelease);
        }

    });
});

//-------------== version 2
router.get('/incomeManagerCtrt/getContractDetails/:ctrtAddr', async function (req, res, next) {
  const ctrtAddr = req.params.ctrtAddr;
  console.log(`\nctrtAddr: ${ctrtAddr}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instIncomeManager = new web3.eth.Contract(incomeManagerContract.abi, ctrtAddr);
  const schCindex = await instIncomeManager.methods.schCindex().call();
  const TimeOfDeployment = await instIncomeManager.methods.TimeOfDeployment().call();
  const paymentCount = await instIncomeManager.methods.paymentCount().call();
  console.log(`schCindex: ${schCindex}, TimeOfDeployment: ${TimeOfDeployment}, paymentCount: ${paymentCount}`);
  res.send({ schCindex, TimeOfDeployment, paymentCount });
});

router.post('/incomeManagerCtrt/dateToIdx', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const schDateTime = req.body.schDateTime;
  console.log(`\nctrtAddr: ${ctrtAddr}, schDateTime: ${schDateTime}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instIncomeManager = new web3.eth.Contract(incomeManagerContract.abi, ctrtAddr);
  const dateToIdx = await instIncomeManager.methods.dateToIdx(schDateTime).call();
  console.log(`dateToIdx: ${dateToIdx}`);
  res.send({ dateToIdx });
});

router.post('/incomeManagerCtrt/idxToSchedule', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const scheduleIndex = req.body.scheduleIndex;
  console.log(`\nctrtAddr: ${ctrtAddr}, scheduleIndex: ${scheduleIndex}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instIncomeManager = new web3.eth.Contract(incomeManagerContract.abi, ctrtAddr);
  const idxToSchedule = await instIncomeManager.methods.idxToSchedule(scheduleIndex).call();
  console.log(`idxToSchedule: ${JSON.stringify(idxToSchedule)}`);
  res.send({ idxToSchedule });
});

router.post('/incomeManagerCtrt/getIncomeSchedule', async function (req, res, next) {
  const ctrtAddr = req.body.ctrtAddr;
  const input = req.body.input;
  console.log(`\nctrtAddr: ${ctrtAddr}, input: ${input}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instIncomeManager = new web3.eth.Contract(incomeManagerContract.abi, ctrtAddr);
  const getIncomeSchedule = await instIncomeManager.methods.getIncomeSchedule(input).call();
  console.log(`getIncomeSchedule: ${JSON.stringify(getIncomeSchedule)}`);
  res.send({ getIncomeSchedule });
});

router.post('/incomeManagerCtrt/getIncomeScheduleList', async function (req, res, next) {
  //const ctrtAddr = req.body.ctrtAddr;
  //const input = req.body.input;
  const {ctrtAddr, input, amount } = req.body;
  console.log(`\nctrtAddr: ${ctrtAddr}, input: ${input}, amount: ${amount}`);
  if(isEmpty(ctrtAddr)){
    res.send({
      err: 'ctrtAddr is invalid. '+ctrtAddr,
      status: false
    });
    return false;
  }
  const instIncomeManager = new web3.eth.Contract(incomeManagerContract.abi, ctrtAddr);
  const getIncomeScheduleList = await instIncomeManager.methods.getIncomeScheduleList(input, amount).call();
  console.log(`getIncomeScheduleList: ${JSON.stringify(getIncomeScheduleList)}`);
  res.send({ getIncomeScheduleList });
});

/**@dev productMAnager ------------------------------------------------------------------------------------- */
/**deploy productManager contract*/
router.post('/productManagerContract', function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, blockchainURL);
    const web3deploy = new Web3(provider);

    const productManager = new web3deploy.eth.Contract(productManagerContract.abi);

    productManager.deploy({
        data: productManagerContract.bytecode,
        arguments: [heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: gasLimitValue,//6500000,
            gasPrice: gasPriceValue//'0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/**把四個合約綁定在product manager */
router.post('/productManagerContract/:nftSymbol', async function (req, res, next) {
    let contractAddr = productManagerContractAddr;
    let nftSymbol = req.params.nftSymbol;
    nftSymbolBytes32 = web3.utils.fromAscii(nftSymbol);
    let crowdFundingCtrtAddr = req.body.crowdFundingCtrtAddr;
    let tokenControllerCtrtAddr = req.body.tokenControllerCtrtAddr;
    let erc721address = req.body.erc721address;
    let incomeManagementCtrtAddr = req.body.incomeManagementCtrtAddr;
    console.log(nftSymbolBytes32);


    let productManager = new web3.eth.Contract(productManagerContract.abi, contractAddr);


    let encodedData = productManager.methods.addNewCtrtGroup(nftSymbolBytes32, crowdFundingCtrtAddr, tokenControllerCtrtAddr, erc721address, incomeManagementCtrtAddr).encodeABI();


    try {
        let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);
        res.status(200);
        res.send({
            result: result
        })
    } catch (error) {
        console.log("error:" + error);
        res.status(500);
        res.send(error.toString());
    }
});

/*get綁定的組合（開發用） */
router.get('/productManagerContract/:nftSymbol', async function (req, res, next) {
    let nftSymbol = req.params.nftSymbol;
    nftSymbolBytes32 = web3.utils.fromAscii(nftSymbol);
    console.log(nftSymbolBytes32);

    const productManager = new web3.eth.Contract(productManagerContract.abi, productManagerContractAddr);

    let result = await productManager.methods.getCtrtGroup(nftSymbolBytes32).call({ from: backendAddr });

    res.send({
        result: result
    })
});




/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
    return new Promise((resolve, reject) => {

        web3.eth.getTransactionCount(userEthAddr)
            .then(nonce => {

                let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
                console.log(userPrivateKey);
                let txParams = {
                    nonce: web3.utils.toHex(nonce),
                    gas: gasLimitValue,//9000000,
                    gasPrice: gasPriceValue,//0,
                    to: contractAddr,
                    value: 0,
                    data: encodedData
                }

                let tx = new Tx(txParams);
                tx.sign(userPrivateKey);
                const serializedTx = tx.serialize();
                const rawTx = '0x' + serializedTx.toString('hex');

                console.log('☆ RAW TX ☆\n', rawTx);

                web3.eth.sendSignedTransaction(rawTx)
                    .on('transactionHash', hash => {
                        console.log(hash);
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        // console.log('confirmation', confirmationNumber);
                    })
                    .on('receipt', function (receipt) {
                        console.log("receipt:\n" + receipt);
                        resolve(receipt)
                    })
                    .on('error', function (err) {
                        console.log("err:\n" + err);
                        reject(err);
                    })
            })

    })
};


module.exports = router;