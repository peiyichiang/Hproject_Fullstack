const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const router = express.Router();

const { getTime } = require('../timeserver/utilities');
const { sequentialMintSuper, schCindex, addScheduleBatch, checkAddScheduleBatch, getIncomeSchedule, getIncomeScheduleList, checkAddScheduleBatch1, checkAddScheduleBatch2, removeIncomeSchedule, imApprove, setPaymentReleaseResults, addScheduleBatchFromDB } = require('../timeserver/blockchain.js');
const { findCtrtAddr, mysqlPoolQueryB } = require('../timeserver/mysql.js');

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/**contracts info*/
const heliumContract = require('../ethereum/contracts/build/Helium.json');
const tokenControllerContract = require('../ethereum/contracts/build/TokenController.json');
const crowdFundingContract = require('../ethereum/contracts/build/CrowdFunding.json');
const assetBookContract = require('../ethereum/contracts/build/AssetBook.json');
const registryContract = require('../ethereum/contracts/build/Registry.json');
const HCAT721_AssetTokenContract = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
const incomeManagerContract = require('../ethereum/contracts/build/IncomeManagerCtrt.json');
const productManagerContract = require('../ethereum/contracts/build/ProductManager.json');


const heliumContractAddr = "0x0Ad4cBba5Ee2b377DF6c56eaeBeED4e89fcc4CAf";
const registryContractAddr = "0x6E2548A83283921136FE322E0333B03551F7f0C8";
const productManagerContractAddr = "0x2a8dc29BF3C44Cb2Be3C62D1a968894B2635E7b9";
const supervisorAddr = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
const management = ["0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"];

const addrZero = "0x0000000000000000000000000000000000000000";
/**time server*/
getTime().then(function (time) {
    console.log(`[Routes/Contract.js] current time: ${time}`)
})




/**@dev Helium ------------------------------------------------------------------------------------- */
/**deploy helium contract*/
router.post('/heliumContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    const helium = new web3deploy.eth.Contract(heliumContract.abi);

    helium.deploy({
        data: heliumContract.bytecode,
        arguments: [management]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
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


/**@dev Registry ------------------------------------------------------------------------------------- */
/*deploy registry contract*/
router.post('/registryContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    const registry = new web3deploy.eth.Contract(registryContract.abi);

    registry.deploy({
        data: registryContract.bytecode,
        arguments: [heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: 9000000,
            gasPrice: '0'
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
        mysqlPoolQuery('UPDATE htoken.user SET ? WHERE u_email = ?', [sql, u_email], async function (err, rows) {
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
    })
});


/**@dev AssetBook ------------------------------------------------------------------------------------- */
/*deploy assetbook contract*/
router.post('/assetbookContract', async function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let assetBookOwner = req.body.assetBookOwner;
    const assetBook = new web3deploy.eth.Contract(assetBookContract.abi);


    assetBook.deploy({
        data: assetBookContract.bytecode,
        arguments: [assetBookOwner, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});


/**@dev CrowdFunding ------------------------------------------------------------------------------------- */
/*deploy crowdFunding contract*/
router.post('/crowdFundingContract/:tokenSymbol', async function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let tokenSymbol = req.params.tokenSymbol;;
    let tokenPrice = req.body.tokenPrice;
    let currency = req.body.currency;
    let quantityMax = req.body.quantityMax;
    let fundingGoal = req.body.fundingGoal;
    let CFSD2 = parseInt(req.body.CFSD2);
    let CFED2 = parseInt(req.body.CFED2);
    let currentTime = 201906010000;
    console.log(`current time: ${currentTime}`);

    const crowdFunding = new web3deploy.eth.Contract(crowdFundingContract.abi);

    crowdFunding.deploy({
        data: crowdFundingContract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, fundingGoal, CFSD2, CFED2, currentTime, heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            console.log(receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            let contractAddress = receipt.contractAddress;

            mysqlPoolQuery("INSERT INTO htoken.smart_contracts (sc_symbol, sc_crowdsaleaddress, sc_totalsupply, sc_remaining) VALUES (?,?,?,?)", [tokenSymbol, contractAddress, quantityMax, quantityMax], function (err, rows) {
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
    let currentTime = 201906120000;
    console.log(`current time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBGetResult, rows) {
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

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
    let currentTime = 201906120000;

    // await getTime().then(function (time) {
    //     currentTime = time;
    // })
    console.log(`current time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
    let currentTime = 201906120000;
    // await getTime().then(function (time) {
    //     currentTime = time;
    // })
    console.log(`current time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
    let currentTime = 2019061200000;
    // await getTime().then(function (time) {
    //     currentTime = time;
    // })
    console.log(`current time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
            let CFSD2 = await crowdFunding.methods.CFSD2().call({ from: backendAddr })
            let CFED2 = await crowdFunding.methods.CFED2().call({ from: backendAddr })

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
    /*
        await getTime().then(function(time) {
            currentTime = time;
        })
    */
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_crowdsaleaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
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
    let currentTime = 201906200000;
    // await getTime().then(function (time) {
    //     currentTime = time;
    // });
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
            gas: 6500000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            tokenControllerAddr = receipt.contractAddress;
        })
        .on('error', function (error) {
            res.send(error.toString());
        })

    await HCAT721.deploy({
        data: HCAT721_AssetTokenContract.bytecode,
        arguments: [nftNameBytes32, nftSymbolBytes32, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrencyBytes32, IRR20yrx100, registryContractAddr, tokenControllerAddr, tokenURIBytes32, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: 9000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            HCAT721Addr = receipt.contractAddress;
        })
        .on('error', function (error) {
            res.send(error.toString());
        })

    await incomeManager.deploy({
        data: incomeManagerContract.bytecode,
        arguments: [HCAT721Addr, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            incomeManagerAddr = receipt.contractAddress;
        })
        .on('error', function (error) {
            res.send(error.toString());
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
        mysqlPoolQuery('UPDATE htoken.smart_contracts SET ? WHERE sc_symbol = ?', [updateContractsAddrsql, nftSymbol], function (err, rows) {
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
                mysqlPoolQuery('UPDATE htoken.product SET ? WHERE p_SYMBOL = ?', [updateCrowdFubdingStatesql, nftSymbol], function (err, rows) {
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

/**@dev TokenController ------------------------------------------------------------------------------------- */
/*deploy tokenController contract*/
router.post('/tokenControllerContract', async function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
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
            gas: 6500000,
            gasPrice: '0'
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
    //let currentTime = 2019052100000;
    /*
        await getTime().then(function(time) {
            currentTime = time;
        })
    */
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_erc721Controller FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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

    mysqlPoolQuery('SELECT sc_erc721Controller FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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


/**@dev HCAT721_AssetToken ------------------------------------------------------------------------------------- */
/*deploy HCAT721_AssetToken contract*/
router.post('/HCAT721_AssetTokenContract/:nftSymbol', async function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
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
    let currentTime = 201906120000;
    // await getTime().then(function (time) {
    //     currentTime = time;
    // });
    console.log(`current time: ${currentTime}`);


    const ERC721SPLC = new web3deploy.eth.Contract(HCAT721_AssetTokenContract.abi);

    ERC721SPLC.deploy({
        data: HCAT721_AssetTokenContract.bytecode,
        arguments: [nftNameBytes32, nftSymbolBytes32, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrencyBytes32, IRR20yrx100, registryContractAddr, addrERC721SPLC_ControllerITF, tokenURIBytes32, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: 9000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            console.log("ERC721:" + receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            var sql = {
                sc_erc721address: receipt.contractAddress,
                sc_erc721Controller: addrERC721SPLC_ControllerITF
            };


            console.log(nftSymbol)
            mysqlPoolQuery('UPDATE htoken.smart_contracts SET ? WHERE sc_symbol = ?', [sql, nftSymbol], function (err, rows) {
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

    mysqlPoolQuery('SELECT sc_crowdsaleaddress, sc_erc721address, sc_erc721Controller FROM htoken.smart_contracts WHERE sc_symbol = ?;', [nftSymbol], function (err, result) {
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


//for sequential minting tokens ... if mint amount > maxMintAmountPerRun, we need to wait for it to finished before minting some more tokens
// http://localhost:3030/Contracts/HCAT721_AssetTokenContract/Htoken05/mintSequentialPerCtrt
router.post('/HCAT721_AssetTokenContract/:nftSymbol/mintSequentialPerCtrt', async function (req, res, next) {
    console.log(`\n---------------------==\nAPI mintSequentialPerCtrt...`);
    const toAddressArray = req.body.toAddressArray.split(",");
    const amountArray = req.body.amountArray.split(",").map(function (item) {
        return parseInt(item, 10);
    });
    const tokenCtrtAddr = req.body.erc721address;
    const fundingType = req.body.fundingType;//PO: 1, PP: 2
    const price = req.body.price;
    const nftSymbol = req.params.nftSymbol;

    console.log(`nftSymbol: ${nftSymbol}, tokenCtrtAddr: ${tokenCtrtAddr}, fundingType: ${fundingType}, price: ${price}
    toAddressArray: ${toAddressArray} \namountArray: ${amountArray}`);

    const maxMintAmountPerRun = 180;
    // const [toAddressArrayOut, amountArrayOut] = reduceArrays(toAddressArray, amountArray);//reduce order arrays from the same duplicated accounts
    // console.log('toAddressArrayOut', toAddressArrayOut, 'amountArrayOut', amountArrayOut);

    // No while loop! We need human inspections done before automatically minting more tokens
    // defined in /timeserver/blockchain.js
    // to mint tokens in different batches of numbers, to each assetbook
    const serverTime = 201906130000;// await getTime();//297
    const [isFailed, isCorrectAmountArray, emailArrayError, amountArrayError] = await sequentialMintSuper(toAddressArray, amountArray, tokenCtrtAddr, fundingType, price, maxMintAmountPerRun, serverTime).catch((err) => {
        console.log('[Error @ sequentialMintSuper]', err);
        res.send({
            success: false,
            result: '[Failed @ sequentialRunSuper()], err:' + err,
        });
    });
    console.log(`[Outtermost] isFailed: ${isFailed}, isCorrectAmountArray: ${isCorrectAmountArray}`);

    if (isFailed || isFailed === undefined || isFailed === null) {
        console.log('\n[Failed] Some/All minting actions have failed. Check balances!');
        res.send({
            success: false,
            result: '[Failed] Check isCorrectAmountArray',
            array1: isCorrectAmountArray,
        });

    } else {
        console.log('\n[Success] All minting actions have been completed successfully');

        if (emailArrayError.length === 0 && amountArrayError.length === 0) {
            console.log(`\n[Success] Both token minting and addAssetRecordsIntoDB are successful.\nemailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`);

            /**@todo 更改資料庫狀態 */

            res.send({
                success: true,
                result: '[Success] All balances are correct',
            });

        } else {
            console.log(`\n[Minting Successful but addAssetRecordsIntoDB Failed]
          emailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`);


            res.send({
                success: false,
                result: '[Minting Successful but addAssetRecordsIntoDB Failed]',
                array1: emailArrayError,
                array2: amountArrayError
            });

        }

    }
});

/**get tokenId  */
router.get('/HCAT721_AssetTokenContract/:tokenSymbol/:assetBookAddr', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let assetBookAddr = req.params.assetBookAddr;
    let mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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

    mysqlPoolQuery('SELECT sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let nftSymbol = req.params.nftSymbol;
    let erc721address = req.body.erc721address;
    let currentTime = 201906120000;
    // await getTime().then(function (time) {
    //     currentTime = time;
    // });
    console.log(`current time: ${currentTime}`);


    const incomeManager = new web3deploy.eth.Contract(incomeManagerContract.abi);

    incomeManager.deploy({
        data: incomeManagerContract.bytecode,
        arguments: [erc721address, heliumContractAddr, currentTime]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            console.log("incomeManager:" + receipt.contractAddress);
            var mysqlPoolQuery = req.pool;
            var sql = {
                sc_incomeManagementaddress: receipt.contractAddress
            };

            console.log(nftSymbol)
            mysqlPoolQuery('UPDATE htoken.smart_contracts SET ? WHERE sc_symbol = ?', [sql, nftSymbol], function (err, rows) {
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

    const incomeMgrAddr = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
        console.log('[Error @findCtrtAddr]:', err);
        res.send({
            err: err,
            status: false
        });
    });

    const [array1, array2] = await checkAddScheduleBatch(incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
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
});



router.post('/incomeManagerContract/:tokenSymbol/addScheduleBatchFromDB', async function (req, res, next) {
    const symbol = req.params.tokenSymbol;
    // const forecastedPayableTimes = req.params.forecastedPayableTimes;
    // const forecastedPayableAmounts = req.params.forecastedPayableAmounts;
    const incomeMgrAddr = await findCtrtAddr(symbol, 'incomemanager').catch((err) => {
        console.log('[Error @findCtrtAddr]:', err);
        res.send({
            err: err,
            status: false,
        });
        return;
    });

    const result = await addScheduleBatchFromDB(symbol).catch((err) => {
        console.log('[Error @addScheduleBatchFromDB]:', err);
        res.send({
            err: err,
            status: false,
        });
        return;
    });

    if (result) {
        res.send({ status: true });

    } else {
        const results = await checkAddScheduleBatch(incomeMgrAddr, forecastedPayableTimes, forecastedPayableAmounts).catch((err) => {
            console.log('[Error @checkAddScheduleBatch]:', err);
            res.send({
                err: err,
                status: false
            });
        });
        console.log(results);
        res.send({ status: false });
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

    mysqlPoolQuery('SELECT sc_incomeManagementaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [symbol], async function (err, DBresult, rows) {
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


/**@dev productMAnager ------------------------------------------------------------------------------------- */
/**deploy productManager contract*/
router.post('/productManagerContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    const productManager = new web3deploy.eth.Contract(productManagerContract.abi);

    productManager.deploy({
        data: productManagerContract.bytecode,
        arguments: [heliumContractAddr]
    })
        .send({
            from: backendAddr,
            gas: 6500000,
            gasPrice: '0'
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
                    gas: 9000000,
                    gasPrice: 0,
                    //gasPrice: web3js.utils.toHex(20 * 1e9),
                    //gasLimit: web3.utils.toHex(3400000),
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