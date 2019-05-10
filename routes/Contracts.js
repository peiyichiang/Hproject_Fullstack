const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const timer = require('../timeserver/api.js')
const router = express.Router();
const { sequentialRun } = require('../timeserver/blockchain.js');

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
const heliumContract = require('../ethereum/contracts/build/Platform.json');
const tokenControllerContract = require('../ethereum/contracts/build/TokenController.json');
const crowdFundingContract = require('../ethereum/contracts/build/CrowdFunding.json');
const assetBookContract = require('../ethereum/contracts/build/AssetBook.json');
const registryContract = require('../ethereum/contracts/build/Registry.json');
const HCAT721_AssetTokenContract = require('../ethereum/contracts/build/HCAT721_AssetToken.json');
const incomeManagerContract = require('../ethereum/contracts/build/IncomeManagerCtrt.json');
const productManagerContract = require('../ethereum/contracts/build/ProductManager.json');


const heliumContractAddr = "0x7E5b6677C937e05db8b80ee878014766b4B86e05";
const registryContractAddr = "0xcaFCE4eE56DBC9d0b5b044292D3DcaD3952731d8";
const productManagerContractAddr = "0x96191257D876A4a9509D9F86093faF75B7cCAc31";

/**time server*/
timer.getTime().then(function (time) {
    console.log(`[Routes/Contract.js] current time: ${time}`)
})

/**management address */
const management = ["0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"];






/**@dev Helium ------------------------------------------------------------------------------------- */
/**deploy helium contract*/
router.post('/heliumContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let heliumContractAdmin = req.body.heliumContractAdmin;
    const helium = new web3deploy.eth.Contract(heliumContract.abi);

    helium.deploy({
        data: heliumContract.bytecode,
        arguments: [heliumContractAdmin, management]
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
        arguments: [management]
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

    let contractResult = await signTx(backendAddr, backendRawPrivateKey, registryContractAddr, encodedData);
    //console.log(contractResult);

    /**寫入DataBase */
    let u_email = req.body.email;
    let mysqlPoolQuery = req.pool;
    let sql = {
        u_assetbookContractAddress: assetBookAddr,
        u_verify_status: 0,
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
    let currentTime = 201904090000;
    /*await timer.getTime().then(function (time) {
        currentTime = time;
    });*/
    console.log(`current time: ${currentTime}`);

    const crowdFunding = new web3deploy.eth.Contract(crowdFundingContract.abi);

    crowdFunding.deploy({
        data: crowdFundingContract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, fundingGoal, CFSD2, CFED2, currentTime, management]
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
            res.send(error.toString());
        })
});

/**invest*/
router.post('/crowdFundingContract/:tokenSymbol/investors/:assetBookAddr', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = 2019052100000;
    /*
        await timer.getTime().then(function(time) {
            currentTime = time;
        })
    */
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
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
    let currentTime;
    await timer.getTime().then(function (time) {
        currentTime = time;
    })
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);

            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
        }
    });

});

/**funding resume*/
router.post('/crowdFundingContract/:tokenSymbol/resume', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = 2019052100000;
    /*
        await timer.getTime().then(function(time) {
            currentTime = time;
        })
    */
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);

            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
        }
    });

});

/**funding terminate*/
router.post('/crowdFundingContract/:tokenSymbol/terminate', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = 2019052100000;
    /*
        await timer.getTime().then(function(time) {
            currentTime = time;
        })
    */
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);

            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
        }
    });

});

/**get status（timeserver用） */
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
                CFED2: CFED2
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
        await timer.getTime().then(function(time) {
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);

            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
        }
    });

});

/**@dev TokenController ------------------------------------------------------------------------------------- */
/*deploy tokenController contract*/
router.post('/tokenControllerContract', async function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let TimeTokenLaunch = req.body.TimeTokenLaunch;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;

    const tokenController = new web3deploy.eth.Contract(tokenControllerContract.abi);

    tokenController.deploy({
        data: tokenControllerContract.bytecode,
        arguments: [TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, management]
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
        await timer.getTime().then(function(time) {
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
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, tokenControllerAddr, encodedData);

            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
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
router.post('/HCAT721_AssetTokenContract/:nftSymbol', function (req, res, next) {
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
    nftNameBytes32 = web3.utils.fromAscii(nftName);
    nftSymbolBytes32 = web3.utils.fromAscii(nftSymbol);
    pricingCurrencyBytes32 = web3.utils.fromAscii(pricingCurrency);


    const ERC721SPLC = new web3deploy.eth.Contract(HCAT721_AssetTokenContract.abi);

    ERC721SPLC.deploy({
        data: HCAT721_AssetTokenContract.bytecode,
        arguments: [nftNameBytes32, nftSymbolBytes32, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrencyBytes32, IRR20yrx100, registryContractAddr, addrERC721SPLC_ControllerITF, tokenURI]
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

/**mint token */
router.post('/HCAT721_AssetTokenContract/:nftSymbol/mint', async function (req, res, next) {
    let contractAddr = req.body.erc721address;
    let to = req.body.assetBookAddr;
    let amount = req.body.amount;
    let fundingType = req.body.fundingType;
    let price = req.body.price;



    let HCAT721_AssetToken = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, contractAddr);
    let currentTime;
    await timer.getTime().then(function (time) {
        currentTime = time;
    })
    console.log(`current time: ${currentTime}`)
    console.log(to);
    console.log(amount);


    let encodedData = HCAT721_AssetToken.methods.mintSerialNFT(to, amount, price, fundingType, currentTime).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});


//for sequential minting tokens ... if mint amount > max 120 to the same target address, the blockchain minting can only accept 120 at one time, so we need to wait for it to finished before minting some more tokens
router.post('/HCAT721_AssetTokenContract/:nftSymbol/mintSequential', async function (req, res, next) {
  let contractAddr = req.body.erc721address;
  let to = req.body.assetBookAddr;
  let amount = req.body.amount;
  let fundingType = req.body.fundingType;
  let price = req.body.price;

  const inst_HCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, contractAddr);
  let tokenBalanceBeforeMinting = await inst_HCAT721.methods.balanceOf(to).call();

  const maxMintAmount = 120;
  const timeIntervalOfNewBlocks = 13000;
  const timeCurrent = 201905300000;
  let quotient = Math.floor(amount/maxMintAmount);
  let remainder = amount - maxMintAmount * quotient;

  const inputArray = Array(quotient).fill(maxMintAmount);
  inputArray.push(remainder);
  console.log('inputArray', inputArray);

  // No while loop! We need human inspections done before automatically minting more tokens

  // defined in /timeserver/lib/blockchain.js
  // to mint tokens in different batches of numbers, which is recorded in inputArray
  await sequentialRun(inputArray, timeIntervalOfNewBlocks, timeCurrent, ['mintToken', contractAddr, to, fundingType, price]);

  //Check success of minting by checking the total token balance of the target address
  console.log('after sequentialRun() is completed...');
  let tokenBalanceAfterMinting = await inst_HCAT721.methods.balanceOf(to).call();
  let gainedAmount = tokenBalanceAfterMinting - tokenBalanceBeforeMinting;
  let shortageAmount = amount - gainedAmount;
  if(gainedAmount === amount){
    res.send({
      result: '[Success] All token minting have been processed successfully. Now the new target address has gained the expected token amount of '+amount,
      success: true,
      shortageAmount: shortageAmount
    });
  } else {
    res.send({
      result: '[Failed] Now the new target address has only gained '+gainedAmount+' new tokens, which needs additional '+shortageAmount+' tokens to fulfill the order. Please double check results before minting more.',
      success: false,
      shortageAmount: shortageAmount
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

    const incomeManager = new web3deploy.eth.Contract(incomeManagerContract.abi);

    incomeManager.deploy({
        data: incomeManagerContract.bytecode,
        arguments: [erc721address, heliumContractAddr, management]
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

/**get isScheduleGoodForRelease（timeserver用） */
router.get('/incomeManagerContract/:tokenSymbol/isScheduleGoodForRelease', async function (req, res, next) {
    let tokenSymbol = req.params.tokenSymbol;
    let mysqlPoolQuery = req.pool;
    let currentTime = req.body.time;
    console.log(`entered time: ${currentTime}`)

    mysqlPoolQuery('SELECT sc_incomeManagementaddress FROM htoken.smart_contracts WHERE sc_symbol = ?', [tokenSymbol], async function (err, DBresult, rows) {
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

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
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
                        console.log(receipt);
                        resolve(receipt)
                    })
                    .on('error', function (err) {
                        console.log(err);
                        reject(err);
                    })
            })

    })
}


module.exports = router;