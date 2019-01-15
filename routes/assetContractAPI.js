const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var router = express.Router();

//Infura HttpProvider Endpoint
web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));

//平台方公私鑰
var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

const contract = require('../contract/asset.json');

router.get('/', function (req, res, next) {
    res.render('assetContractAPI');
});


//deploy asset contract
router.post('/POST/deploy', function (req, res, next) {
    const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    const web3deploy = new Web3(provider);

    let assetOwner = req.body.assetOwner;
    let platform = req.body.platform;
    let thirdparty = req.body.thirdparty;
    let assetContract = new web3deploy.eth.Contract(contract.abi);

    assetContract.deploy({
        data: contract.bytecode,
        arguments: [assetOwner, platform, thirdparty]
    })
        .send({
            from: userAddr,
            gas: 3400000
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/*
//deploy contract with tx
router.post('/POST/deploy', async function (req, res, next) {
    let assetOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let platform = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let thirdparty = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";

    let assetContract = new web3.eth.Contract(contract.abi);

    web3.eth.getTransactionCount(userAddr)
        .then(nonce => {

            let deploy = assetContract.deploy({
                data: contract.bytecode,
                arguments: [assetOwner, platform, thirdparty]
            }).encodeABI();

            let txParams = {
                from: userAddr,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(40 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                data: deploy
            }

            let tx = new Tx(txParams);
            tx.sign(privateKey);
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

router.get('/GET/getAssetsOwner', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

router.get('/GET/getPlatform', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr })

    res.send({
        platform: platform
    })
});

router.get('/GET/getThirdparty', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr })

    res.send({
        thirdparty: thirdparty
    })
});

router.get('/GET/getOwnerSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let ownerSign = await assetContract.methods.getOwnerSign().call({ from: userAddr })

    res.send({
        ownerSign: ownerSign
    })
});

router.get('/GET/getPlatformSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformSign = await assetContract.methods.getPlatformSign().call({ from: userAddr })

    res.send({
        platformSign: platformSign
    })
});

router.get('/GET/getThirdpartySign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdpartySign = await assetContract.methods.getThirdpartySign().call({ from: userAddr })

    res.send({
        thirdpartySign: thirdpartySign
    })
});


router.post('/POST/ownerSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr });
    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

    web3.eth.getTransactionCount(assetsOwner)
        .then(nonce => {

            let txParams = {
                from: assetsOwner,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.ownerSign().encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(ownerPrivateKey);
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

router.post('/POST/platformSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr })
    /*privatekey 到時候會去底層keycahin sign*/
    let platformPrivateKey = Buffer.from('87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18', 'hex');

    web3.eth.getTransactionCount(platform)
        .then(nonce => {

            let txParams = {
                from: platform,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3000000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.platformSign().encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(platformPrivateKey);
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
                    reject(err);
                })

        })

});

router.get('/POST/thirdpartySign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr })
    /*privatekey 到時候會去底層keycahin sign*/
    let thirdpartyPrivateKey = Buffer.from('9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7', 'hex');

    web3.eth.getTransactionCount(thirdparty)
        .then(nonce => {

            let txParams = {
                from: thirdparty,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3000000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.thirdpartySign().encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(thirdpartyPrivateKey);
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
                    reject(err);
                })

        })

});

router.post('/POST/changeAssetOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr });
    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
    let newOwner = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    web3.eth.getTransactionCount(assetsOwner)
        .then(nonce => {

            let txParams = {
                from: assetsOwner,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.changeAssetOwner(newOwner).encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(ownerPrivateKey);
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

router.post('/POST/changePlatform', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr })
    /*privatekey 到時候會去底層keycahin sign*/
    let platformPrivateKey = Buffer.from('87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18', 'hex');
    let newPlatform = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    web3.eth.getTransactionCount(platform)
        .then(nonce => {

            let txParams = {
                from: platform,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.changePlatform(newPlatform).encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(platformPrivateKey);
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

router.post('/POST/changeThirdparty', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr })
    /*privatekey 到時候會去底層keycahin sign*/
    let thirdpartyPrivateKey = Buffer.from('9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7', 'hex');
    let newThirdparty = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    web3.eth.getTransactionCount(thirdparty)
        .then(nonce => {

            let txParams = {
                from: thirdparty,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                to: contractAddr,
                value: 0,
                data: assetContract.methods.changeThirdparty(newThirdparty).encodeABI()
            }

            let tx = new Tx(txParams);
            tx.sign(thirdpartyPrivateKey);
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

module.exports = router;


