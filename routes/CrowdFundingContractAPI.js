const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var router = express.Router();

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/*registry contract address*/
const contract = require('../ethereum/contracts/build/CrowdFunding.json');

//deploy crowdFunding contract
router.post('/deploy', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let management = ["0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"];
    let tokenSymbol = req.body.tokenSymbol;;
    let tokenPrice = req.body.tokenPrice;
    let currency= req.body.currency;
    let quantityMax = req.body.quantityMax;
    let goalInPercentage = Math.floor(req.body.fundingGoal / quantityMax * 100);
    let CFSD2 = parseInt(req.body.CFSD2);
    let CFED2 = parseInt(req.body.CFED2);
    let serverTime = 201902250001;

    /*let assetOwner = req.body.assetOwner;
    let platform = req.body.platform;
    let time = req.body.time;*/
    let crowdFundingContract = new web3deploy.eth.Contract(contract.abi);

    console.log(typeof(goalInPercentage));
    console.log(goalInPercentage);
    console.log(req.body.fundingGoal);
    console.log(quantityMax);

    crowdFundingContract.deploy({
        data: contract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, goalInPercentage, CFSD2, CFED2, serverTime, management]
        //arguments: [assetOwner, platform, time]
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
            res.send(error.toString());
        })
});

/**給server多的時間*/
router.post('/addServerTime', async function (req, res, next) {
    let contractAddr = req.body.address;
    let additionalTime = req.body.additionalTime;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.addServerTime(additionalTime).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**設定新的server時間*/
router.patch('/setServerTime', async function (req, res, next) {
    let contractAddr = req.body.address;
    let serverTime = req.body.serverTime;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.setServerTime(serverTime).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});


/**updateState*/
router.post('/updateState', async function (req, res, next) {
    let contractAddr = req.body.address;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.updateState().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**startFunding*/
router.post('/startFunding', async function (req, res, next) {
    let contractAddr = req.body.address;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.startFunding().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**pauseFunding*/
router.post('/pauseFunding', async function (req, res, next) {
    let contractAddr = req.body.address;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.pauseFunding().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**resumeFunding*/
router.post('/resumeFunding', async function (req, res, next) {
    let contractAddr = req.body.address;
    let CFED2 = req.body.CFED2;
    let quantityMax = req.body.quantityMax;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.resumeFunding(CFED2, quantityMax).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**forceTerminated*/
router.post('/forceTerminated', async function (req, res, next) {
    let contractAddr = req.body.address;
    let reason = req.body.reason;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.forceTerminated(reason).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**invest*/
router.post('/invest', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetBookAddr = req.body.assetBookAddr;
    let quantityToInvest = req.body.quantityToInvest;
    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = crowdFundingContract.methods.invest(assetBookAddr, quantityToInvest).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*salestate */
router.get('/salestate', async function (req, res, next) {
    let contractAddr = req.query.address;

    let crowdFundingContract = new web3.eth.Contract(contract.abi, contractAddr);
    let salestate = await crowdFundingContract.methods.salestate().call({ from: backendAddr })

    res.send({
        salestate: salestate
    })
});

/*將合約資訊更新至資料庫 */
router.post('/updateUser', function (req, res, next) {

    var mysqlPoolQuery = req.pool;
    let tokenSymbol = req.body.tokenSymbol;
    let contractAddress = req.body.contractAddress;
    let quantityMax = req.body.quantityMax;

    //console.log(element)
    mysqlPoolQuery("INSERT INTO htoken.smart_contracts (sc_symbol, sc_crowdsaleaddress, sc_totalsupply, sc_remaining) VALUES (?,?,?,?)", [tokenSymbol, contractAddress, quantityMax, quantityMax], function (err, rows) {
        if (err) {
            console.log(err);
            res.send({
                status: "fail",
            });
        }
        else{
            res.send({
                status: "success",
                p_SYMBOL: req.body.tokenSymbol,
                crowdingFundingContractAddr: req.body.contractAddress,
                quantityMax: quantityMax,
                remaining: quantityMax
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
                    gas: 300000,
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

/*deploy contract with tx*/
/*
router.post('/POST/deploy', async function (req, res, next) {
    let assetOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let platform = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let endorsers = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";

    let assetContract = new web3.eth.Contract(contract.abi);

    web3.eth.getTransactionCount(backendAddr)
        .then(nonce => {

            let deploy = assetContract.deploy({
                data: contract.bytecode,
                arguments: [assetOwner, platform, endorsers]
            }).encodeABI();

            let txParams = {
                from: backendAddr,
                nonce: web3.utils.toHex(nonce),
                gas: 4700000,
                gasPrice: 0,
                //gasPrice: web3.utils.toHex(40 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                data: deploy
            }

            let tx = new Tx(txParams);
            tx.sign(backendPrivateKey);
            const serializedTx = tx.serialize();
            const rawTx = '0x' + serializedTx.toString('hex');

            console.log('☆ RAW TX ☆\n', rawTx);

            web3.eth.sendSignedTransaction(rawTx)
                .on('transactionHash', hash => {
                    console.log(hash);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    //console.log('confirmation', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log(receipt);
                    res.send({
                        receipt: receipt
                    })
                })
                .on('error', function (err) {
                    console.log(err);
                    res.send({
                        err: err.toString()
                    })
                })

        })

});
*/

module.exports = router;


