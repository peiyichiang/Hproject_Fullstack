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

/*contract info*/
const contract = require('../ethereum/contracts/build/Registry.json');
let contractAddr = "0xFB86A8045ff376e658109A9F4CE45D9A986117C1";


/*deploy registryContract*/
router.post('/deploy', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let management = req.body.management;
    let registryContract = new web3deploy.eth.Contract(contract.abi);

    registryContract.deploy({
        data: contract.bytecode,
        arguments: [management]
    })
        .send({
            from: backendAddr,
            gas: 8000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});


/*get 會員數量 */
router.get('/userAmount', async function (req, res, next) {
    //let contractAddr = req.query.address;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let count = await registryContract.methods.getUserCount().call({ from: backendAddr })

    res.send({
        count: count
    })
});

/*get 會員資訊 */
router.get('/userInfo', async function (req, res, next) {
    let u_id = req.query.u_id;
    //let contractAddr = req.query.address;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let userInfo = await registryContract.methods.getUser(u_id).call({ from: backendAddr });

    res.send({
        userInfo: userInfo
    })
});

/*get uid by assetCtrAddr */
router.get('/userID', async function (req, res, next) {
    let assetCtAddr = req.query.assetCtAddr;
    //let contractAddr = req.query.address;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let userInfo = await registryContract.methods.getUidFromAssetCtAddr(assetCtAddr).call({ from: backendAddr });

    res.send({
        userInfo: userInfo
    })
});

/*註冊新會員 */
router.post('/addUser', async function (req, res, next) {
    //let contractAddr = req.body.address;
    let u_id = req.body.u_id;
    let assetAddr = req.body.assetAddr;
    let ethAddr = req.body.ethAddr;
    let time = req.body.time;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = registryContract.methods.addUser(u_id, assetAddr, ethAddr, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員info */
router.patch('/setUser', async function (req, res, next) {
    //let contractAddr = req.body.address;
    let u_id = req.body.u_id;
    let assetCtAddr = req.body.assetCtAddr;
    let ethAddr = req.body.ethAddr;
    let status = req.body.status;
    let time = req.body.time;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = registryContract.methods.setUser(u_id, assetCtAddr, ethAddr, status, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員狀態 */
router.patch('/setUserStatus', async function (req, res, next) {
    //let contractAddr = req.body.address;
    let u_id = req.body.u_id;
    let accountStatus = req.body.accountStatus;
    let time = req.body.time;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = registryContract.methods.setUserStatus(u_id, accountStatus, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員eth address */
router.patch('/setUserEthAddr', async function (req, res, next) {
    //let contractAddr = req.body.address;
    let u_id = req.body.u_id;
    let ethAddr = req.body.ethAddr;
    let time = req.body.time;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = registryContract.methods.setExtoAddr(u_id, ethAddr, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員assetCtr address */
router.patch('/setUserAssetCtAddr', async function (req, res, next) {
    //let contractAddr = req.body.address;
    let u_id = req.body.u_id;
    let assetCtAddr = req.body.assetCtAddr;
    let time = req.body.time;

    var registryContract = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = registryContract.methods.setAssetCtAddr(u_id, assetCtAddr, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*將註冊新會員資訊更新至資料庫 */
router.post('/updateUser', function (req, res, next) {

    var u_email = req.body.email;
    var mysqlPoolQuery = req.pool;
    var sql = {
        u_assetbookContractAddress: req.body.assetContractAddr,
        u_multisigContractAddress: req.body.multiSigContractAddr,
        u_verify_status: req.body.status,
        u_eth_add: req.body.ethAddr
    };


    //console.log(element)
    mysqlPoolQuery('UPDATE htoken.user SET ? WHERE u_email = ?', [sql, u_email], function (err, rows) {
        if (err) {
            console.log(err);
            res.send({
                status: "fail",
            });
        }
        else {
            res.send({
                status: "success",
                u_email: req.body.email,
                assetContractAddr: req.body.assetContractAddr,
                ethAddr: req.body.ethAddr,
                multiSigContractAddr: req.body.multiSigContractAddr,
                u_verify_status: req.body.status
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


module.exports = router;


