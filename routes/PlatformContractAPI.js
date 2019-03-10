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
const contract = require('../ethereum/contracts/build/Platform.json');

router.get('/', function (req, res, next) {
    res.render('platformContractAPI');
});

//deploy asset contract
router.post('/deploy', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let platformCtAdmin = req.body.platformCtAdmin;
    let platformContract = new web3deploy.eth.Contract(contract.abi);

    platformContract.deploy({
        data: contract.bytecode,
        arguments: [platformCtAdmin]
        })
        .send({
            from: backendAddr,
            gas: 4700000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/** 更改平台方權限者Addr*/
router.patch('/setPlatformContractAdmin', async function (req, res, next) {
    let contractAddr = req.body.address;
    let platformCtAdmin = req.body.platformCtAdmin;

    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = platformContract.methods.setPlatformCtAdmin(platformCtAdmin).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

router.patch('/setAssetCtrtApproval', async function (req, res, next) {
    let contractAddr = req.body.address;
    let addrAssetBook = req.body.addrAssetBook;
    let assetAddr = req.body.assetAddr;
    let isApprovedToWrite = req.body.isApprovedToWrite;

    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = platformContract.methods.setAssetCtrtApproval(addrAssetBook, assetAddr, isApprovedToWrite).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**新增平台方管理員Addr*/
router.post('/addPlatformManager', async function (req, res, next) {
    let contractAddr = req.body.address;
    let newManagerAddr = req.body.newManagerAddr;
    let id = req.body.id;
    let time = req.body.time;
    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = platformContract.methods.addPlatformManager(newManagerAddr, id, time).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/** 更改平台方管理員Addr*/
router.patch('/changePlatformManagerAddr', async function (req, res, next) {
    let contractAddr = req.body.address;
    let newManagerAddr = req.body.newManagerAddr;
    let id = req.body.id;
    let time = req.body.time;
    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = platformContract.methods.changePlatformManager(newManagerAddr, id, time).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/** 刪除平台方管理員*/
router.delete('/deletePlatformManager', async function (req, res, next) {
    let contractAddr = req.body.address;
    let id = req.body.id;
    let time = req.body.time;
    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = platformContract.methods.deletePlatformManager(id, time).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*get平台方管理員資訊 */
router.get('/platformManagerInfo', async function (req, res, next) {
    let contractAddr = req.query.address;
    let id = req.query.id;

    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformManager = await platformContract.methods.getPlatformManagerInfo(id).call({ from: backendAddr })

    res.send({
        platformManager: platformManager
    })
});

/*get平台方管理員數量 */
router.get('/platformManagerAmount', async function (req, res, next) {
    let contractAddr = req.query.address;

    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformManagerNumber = await platformContract.methods.getPlatformManagerAmount().call({ from: backendAddr })

    res.send({
        platformManagerNumber: platformManagerNumber
    })
});


/*平台方簽名（Ａ是Ｂ的平台方=> 由Ｂ的assetContract去簽Ａ */
router.post('/platformVote', async function (req, res, next) {
    let contractAddr = req.body.platformContract;
    let time = req.body.time;
    let id = req.body.id;
    let assetsContractToBeSigned = req.body.assetsContractToBeSigned;
    let platformContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓管理員公私鑰*/
    let platformManager = '0xDe9c22ef1fd3132024B63Ed570ead5d35fF3d590';
    let platformManagerPrivateKey = '0x9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7';

    let encodedData = platformContract.methods.platformVote(assetsContractToBeSigned, id, time).encodeABI();
    let result = await signTx(platformManager, platformManagerPrivateKey, contractAddr, encodedData);

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
