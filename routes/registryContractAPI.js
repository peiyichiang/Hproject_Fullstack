const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
var router = express.Router();

//Infura HttpProvider Endpoint
web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));

var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var contractAddr = '0x806e5435281eb8f03959edefbf02b802dcadfa16';

const contract = require('../contract/registry.json');
var registryContract = new web3.eth.Contract(contract.abi, contractAddr);


router.get('/', function (req, res, next) {
    res.render('registryContractAPI');
});

router.get('/GET/getOwner', async function (req, res, next) {
    let owner = await registryContract.methods.getOwner().call({ from: userAddr })

    res.send({
        owner: owner
    })
});

router.get('/GET/getUserCount', async function (req, res, next) {
    let count = await registryContract.methods.getUserCount().call({ from: userAddr })

    res.send({
        count: count
    })
});

router.get('/GET/getUserInfo', async function (req, res, next) {
    let u_id = req.query.u_id;
    let userInfo = await registryContract.methods.getUserInfo(u_id).call({ from: userAddr });

    res.send({
        userInfo: userInfo
    })
});

router.post('/POST/registerUser', async function (req, res, next) {
    let u_id = req.body.u_id;
    let assetAddr = req.body.assetAddr;
    let ethAddr = req.body.ethAddr;

    web3.eth.getTransactionCount(userAddr)
        .then(nonce => {

            let txParams = {
                from: userAddr,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3js.utils.toHex(20 * 1e9),
                gasLimit: web3js.utils.toHex(3000000),
                to: contractAddr,
                value: 0,
                data: registryContract.methods.registerUser(u_id, assetAddr, ethAddr).encodeABI()
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
                    reject(err);
                })

        })

});

router.post('/POST/setAccountStatus', async function (req, res, next) {
    let u_id = "A123";
    let AccountStatus = 1;

    web3.eth.getTransactionCount(userAddr)
        .then(nonce => {

            let txParams = {
                from: userAddr,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3js.utils.toHex(20 * 1e9),
                gasLimit: web3js.utils.toHex(3000000),
                to: contractAddr,
                value: 0,
                data: registryContract.methods.setAccountStatus(u_id, AccountStatus).encodeABI()
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
                    reject(err);
                })

        })

});

router.post('/POST/setEthAddr', async function (req, res, next) {
    let u_id = "A123";
    let EthAddr = "0xca35b7d915458ef540ade6068dfe2f44e8fa733c";

    web3.eth.getTransactionCount(userAddr)
        .then(nonce => {

            let txParams = {
                from: userAddr,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3js.utils.toHex(20 * 1e9),
                gasLimit: web3js.utils.toHex(3000000),
                to: contractAddr,
                value: 0,
                data: registryContract.methods.setEthAddr(u_id, EthAddr).encodeABI()
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
                    reject(err);
                })

        })

});

router.post('/POST/updateUserDB', function (req, res, next) {

    var u_email = req.body.email;
    var mysqlPoolQuery = req.pool;
    var sql = {
        u_address: req.body.assetContractAddr,
        u_verify_status: req.body.status
    };


    //console.log(element)
    mysqlPoolQuery('UPDATE htoken.user SET ? WHERE u_email = ?', [sql, u_email], function (err, rows) {
        if (err) {
            console.log(err);
            res.send({
                status: "fail",
            });
        }
    });

    res.send({
        status: "success",
        u_email: req.body.email,
        u_address: req.body.assetContractAddr,
        u_verify_status: req.body.status
    });

});

module.exports = router;


