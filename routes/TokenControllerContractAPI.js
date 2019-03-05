const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var router = express.Router();

/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/*platform contract address*/
const contract = require('../ethereum/contracts/build/TokenController.json');


//deploy asset contract
router.post('/deploy', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let ERC721SPLC_Controller = new web3deploy.eth.Contract(contract.abi);
    let timeCurrent = req.body.timeCurrent;
    let TimeTokenLaunch = req.body.TimeTokenLaunch;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;


    ERC721SPLC_Controller.deploy({
        data: contract.bytecode,
        arguments: [timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid]
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

router.get('/isUnlockedValid', async function (req, res, next) {
    let contractAddr = req.query.address;

    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_Controller.methods.isUnlockedValid().call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/HTokenControllerDetails', async function (req, res, next) {
    let contractAddr = req.query.address;

    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_Controller.methods.getHTokenControllerDetails().call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/admin', async function (req, res, next) {
    let contractAddr = req.query.address;

    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_Controller.methods.admin().call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/owner', async function (req, res, next) {
    let contractAddr = req.query.address;

    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_Controller.methods.owner().call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.post('/setTimeCurrent', async function (req, res, next) {
    let contractAddr = req.body.address;
    let timeCurrent = req.body.timeCurrent;
    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_Controller.methods.setTimeCurrent(timeCurrent).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

router.post('/setTimeTokenValid', async function (req, res, next) {
    let contractAddr = req.body.address;
    let TimeTokenValid = req.body.TimeTokenValid;
    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_Controller.methods.setTimeTokenValid(TimeTokenValid).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

router.post('/setTimeTokenUnlock', async function (req, res, next) {
    let contractAddr = req.body.address;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_Controller.methods.setTimeTokenUnlock(TimeTokenUnlock).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

router.post('/setLaunchTime', async function (req, res, next) {
    let contractAddr = req.body.address;
    let TimeTokenLaunch = req.body.TimeTokenLaunch;
    let ERC721SPLC_Controller = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_Controller.methods.setLaunchTime(TimeTokenLaunch).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
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


module.exports = router;
