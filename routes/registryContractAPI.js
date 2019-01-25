const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var router = express.Router();

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));

/*平台方公私鑰*/
var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/*registry contract address*/
//var contractAddr = '0x806e5435281eb8f03959edefbf02b802dcadfa16';//ropsten
var contractAddr = '0x2B208eAcEfDcE78983d29C115CB10291C6095bba';//POA

/*contract info*/
const contract = require('../contract/Registry.json');
var registryContract = new web3.eth.Contract(contract.abi, contractAddr);





router.get('/', function (req, res, next) {
    res.render('registryContractAPI');
});

/*deploy registryContract*/
router.post('/POST/deploy', function (req, res, next) {
    var privateKeyDeploy = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    const provider = new PrivateKeyProvider(privateKeyDeploy, 'http://140.119.101.130:8545');
    const web3deploy = new Web3(provider);

    let registryContractDeploy = new web3deploy.eth.Contract(contract.abi);

    registryContractDeploy.deploy({
        data: contract.bytecode
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

/*get registryContract owner*/
router.get('/GET/getOwner', async function (req, res, next) {
    let owner = await registryContract.methods.getOwner().call({ from: userAddr })

    res.send({
        owner: owner
    })
});

/*get 會員數量 */
router.get('/GET/getUserCount', async function (req, res, next) {
    let count = await registryContract.methods.getUserCount().call({ from: userAddr })

    res.send({
        count: count
    })
});

/*get 會員資訊 */
router.get('/GET/getUserInfo', async function (req, res, next) {
    let u_id = req.query.u_id;
    let userInfo = await registryContract.methods.getUserInfo(u_id).call({ from: userAddr });

    res.send({
        userInfo: userInfo
    })
});

/*註冊新會員 */
router.post('/POST/registerUser', async function (req, res, next) {
    let u_id = req.body.u_id;
    let assetAddr = req.body.assetAddr;
    let ethAddr = req.body.ethAddr;

    let encodedData = registryContract.methods.registerUser(u_id, assetAddr, ethAddr).encodeABI();

    let result = await signTx(userAddr, privateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員狀態 */
router.post('/POST/setAccountStatus', async function (req, res, next) {
    let u_id = "A123";
    let AccountStatus = 1;

    let encodedData = registryContract.methods.setAccountStatus(u_id, AccountStatus).encodeABI();

    let result = await signTx(userAddr, privateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*設定會員eth address */
router.post('/POST/setEthAddr', async function (req, res, next) {
    let u_id = "A123";
    let EthAddr = "0xca35b7d915458ef540ade6068dfe2f44e8fa733c";

    let encodedData = registryContract.methods.setEthAddr(u_id, EthAddr).encodeABI();

    let result = await signTx(userAddr, privateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*將註冊新會員資訊更新至資料庫 */
router.post('/POST/updateUserDB', function (req, res, next) {

    var u_email = req.body.email;
    var mysqlPoolQuery = req.pool;
    var sql = {
        u_address: req.body.assetContractAddr,
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
    });

    res.send({
        status: "success",
        u_email: req.body.email,
        u_address: req.body.assetContractAddr,
        u_verify_status: req.body.status
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


