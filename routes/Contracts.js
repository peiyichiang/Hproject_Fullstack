const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const router = express.Router();

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

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
const ERC721SPLCContract = require('../ethereum/contracts/build/ERC721SPLC_HToken.json');


const heliumContractAddr = "0xAC5Fe5Cbebe5dE436481358e83fc05A49c0D45C8";
const registryContractAddr = "0xd8C4482D1e2a497D315e934d977ab40F30c0ce22";

/**time server*/
let timestamp = 201903230000;

/**management address */
const management = ["0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"];






/**@dev Helium*/
/**deploy helium contract*/
router.post('/heliumContract', function (req, res, next) {
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
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


/**@dev Registry */
/*deploy registry contract*/
router.post('/registryContract', function (req, res, next) {
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    const registry = new web3deploy.eth.Contract(registryContract.abi);

    registry.deploy({
        data: registryContract.bytecode,
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

/*get registryContractAddr*/
router.get('/registryContract', function (req, res, next) {
    res.send(registryContractAddr);
});

/**@todo
 *error return
 *transaction func改良
*/
/*註冊新會員 */
router.post('/registryContract/users/:u_id', async function (req, res, next) {
    /**寫入BlockChain */
    let userID = req.params.u_id;
    let assetBookAddr = req.body.assetBookAddress;
    let ethAddr = req.body.ethAddr;
    let time = timestamp;

    const registry = new web3.eth.Contract(registryContract.abi, registryContractAddr);

    let encodedData = registry.methods.addUser(userID, assetBookAddr, ethAddr, time).encodeABI();

    let contractResult = await signTx(backendAddr, backendRawPrivateKey, registryContractAddr, encodedData);
    console.log(contractResult);

    /**寫入DataBase */
    let u_email = req.body.email;
    let mysqlPoolQuery = req.pool;
    let sql = {
        u_assetbookContractAddress: assetBookAddr,
        u_verify_status: 0,
        u_eth_add: ethAddr
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


/**@dev AssetBook */
/*deploy assetbook contract*/
router.post('/assetbookContract', async function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

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


/**@dev CrowdFunding */
/*deploy crowdFunding contract*/
router.post('/crowdFundingContract/:tokenSymbol', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let tokenSymbol = req.params.tokenSymbol;;
    let tokenPrice = req.body.tokenPrice;
    let currency = req.body.currency;
    let quantityMax = req.body.quantityMax;
    let goalInPercentage = Math.floor(req.body.fundingGoal / quantityMax * 100);
    let CFSD2 = parseInt(req.body.CFSD2);
    let CFED2 = parseInt(req.body.CFED2);
    let serverTime = timestamp;

    const crowdFunding = new web3deploy.eth.Contract(crowdFundingContract.abi);

    crowdFunding.deploy({
        data: crowdFundingContract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, goalInPercentage, CFSD2, CFED2, serverTime, management]
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
router.post('/crowdFundingContract/:tokenSymbol/investors/:assetBookAddr', function (req, res, next) {
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
            let assetBookAddr = req.params.assetBookAddr;
            let quantityToInvest = req.body.quantityToInvest;
            let crowdFunding = new web3.eth.Contract(crowdFundingContract.abi, crowdFundingAddr);

            /*用後台公私鑰sign*/
            let encodedData = crowdFunding.methods.invest(assetBookAddr, quantityToInvest).encodeABI();
            let TxResult = await signTx(backendAddr, backendRawPrivateKey, crowdFundingAddr, encodedData);
            res.send({
                DBresult: DBresult,
                TxResult: TxResult
            })
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
            let investors = await crowdFunding.methods.getInvestors(1,1).call({ from: backendAddr })

            res.send(investors);
        }
    });
});

/**@todo 串接募資退回 */
/**從資料庫刪除crowdFundingContract */
router.delete('/crowdFundingContract/:tokenSymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    let tokenSymbol = req.params.tokenSymbol;


    mysqlPoolQuery("DELETE FROM htoken.smart_contracts WHERE (sc_symbol) VALUES (?)", [tokenSymbol], function (err, rows) {
        if (err) {
            console.log(err);
            res.send({
                status: false
            });
        }
        else {
            res.send({
                status: true
            });
        }
    });
});

/**@dev TokenController */
/**@todo 從DB抓arguments */
/*deploy tokenController contract*/
router.post('/tokenControllerContract', function (req, res, next) {
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let timeCurrent = timestamp;
    let TimeTokenLaunch = req.body.TimeTokenLaunch;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;

    const tokenController = new web3deploy.eth.Contract(tokenControllerContract.abi);

    tokenController.deploy({
        data: tokenControllerContract.bytecode,
        arguments: [timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, management]
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


/**@dev ERC721SPLC */
/**@todo 抓tokenURI */
/*deploy ERC721SPLC contract*/
router.post('/ERC721SPLCContract/:nftSymbol', function (req, res, next) {
    /**POA */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
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

    const ERC721SPLC = new web3deploy.eth.Contract(ERC721SPLCContract.abi);


    ERC721SPLC.deploy({
        data: ERC721SPLCContract.bytecode,
        arguments: [nftName, nftSymbol, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrency, IRR20yrx100, registryContractAddr, addrERC721SPLC_ControllerITF, tokenURI]
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

/*get ERC721ContractAddr and CrowdFundingContractAddr by tokenSymble*/
router.get('/ERC721SPLCContract/:nftSymbol', function (req, res, next) {
    var nftSymbol = req.params.nftSymbol;
    var mysqlPoolQuery = req.pool;
    console.log(nftSymbol);

    mysqlPoolQuery('SELECT sc_crowdsaleaddress, sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?;', [nftSymbol], function (err, result) {
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





/*sign rawtx*/
function signTx(userEthAddr, userRowPrivateKey, contractAddr, encodedData) {
    return new Promise((resolve, reject) => {

        web3.eth.getTransactionCount(userEthAddr)
            .then(nonce => {

                let userPrivateKey = Buffer.from(userRowPrivateKey.slice(2), 'hex');
                console.log(userPrivateKey);
                let txParams = {
                    nonce: web3.utils.toHex(nonce),
                    gas: 3000000,
                    gasPrice: 0,
                    //gasPrice: web3js.utils.toHex(20 * 1e9),
                    gasLimit: web3.utils.toHex(3400000),
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