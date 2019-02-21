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
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

/*registry contract address*/
const contract = require('../ethereum/contracts/build/AssetContract.json');




router.get('/', function (req, res, next) {
    res.render('assetContractAPI');
});


//deploy asset contract
router.post('/POST/deploy', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    const web3deploy = new Web3(provider);

    let assetOwner = req.body.assetOwner;
    let platform = req.body.platform;
    let time = 20180131;
    let assetContract = new web3deploy.eth.Contract(contract.abi);

    assetContract.deploy({
        data: contract.bytecode,
        arguments: [assetOwner, platform, time]
    })
        .send({
            from: backendAddr,
            gas: 4700000
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

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

/*取得用戶address */
router.get('/GET/getAssetsOwner', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

/*取得平台方address */
router.get('/GET/getPlatform', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: backendAddr })

    res.send({
        platform: platform
    })
});

/*取得第三方address */
router.get('/GET/getEndorsers', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let endorsers = await assetContract.methods.getEndorsers().call({ from: backendAddr })

    res.send({
        endorsers: endorsers
    })
});

/*取得用戶簽名 */
router.get('/GET/getAssetsOwnerSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwnerSign = await assetContract.methods.getAssetsOwnerSign().call({ from: backendAddr })

    res.send({
        assetsOwnerSign: assetsOwnerSign
    })
});

/*取得平台方簽名 */
router.get('/GET/getPlatformSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformSign = await assetContract.methods.getPlatformSign().call({ from: backendAddr })

    res.send({
        platformSign: platformSign
    })
});

/*取得第三方簽名 */
router.get('/GET/getEndorsersSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let endorsersSign = await assetContract.methods.getEndorsersSign().call({ from: backendAddr })

    res.send({
        endorsersSign: endorsersSign
    })
});

/*用戶簽名 */
router.post('/POST/assetsOwnerSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = 20180131;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr });
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.assetsOwnerSign(time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*平台方簽名 */
router.post('/POST/platformSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = 20180131;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let platform = await assetContract.methods.getPlatform().call({ from: backendAddr });
    let platformPrivateKey = '0x87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18';

    let encodedData = assetContract.methods.platformSign(time).encodeABI();
    let result = await signTx(platform, platformPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*第三方簽名 */
router.post('/POST/endorsersSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = 20180131;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let endorsers = await assetContract.methods.getEndorsers().call({ from: backendAddr });
    let endorsersPrivateKey = '0x9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7'

    let encodedData = assetContract.methods.endorsersSign(time).encodeABI();
    let result = await signTx(endorsers, endorsersPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換用戶address */
router.post('/POST/changeAssetOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = 20180131;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    let newOwner = req.body.newOwner;

    let encodedData = assetContract.methods.changeAssetOwner(newOwner, time).encodeABI();

    /**由後端送出交易 */
    let result = await signTx(backendAddr, backendAddrPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換第三方address */
router.post('/POST/changeEndorsers', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = 20180131;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr });
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let newEndorsers = req.body.newEndorsers;

    let encodedData = assetContract.methods.changeEndorsers(newEndorsers, time).encodeABI();

    /**由平台方送出交易 */
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**To do */
router.post('/POST/addEndorser', async function (req, res, next) {

});

/*新增資產到assetContract（由erc721Contract Trigger!）*/
router.post('/POST/addAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr });
    let encodedData = assetContract.methods.addAsset(req.body.ERC721Addr).encodeABI();

    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*輸入erc721tokenAddr，取得token相關資訊*/
router.get('/GET/getAsset', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let asset = await assetContract.methods.getAsset(req.query.ERC721Addr).call({ from: backendAddr });

    res.send({
        asset: asset
    })
});

/*取得有幾種erc721token */
router.get('/GET/getAssetCount', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetCount = await assetContract.methods.getAssetCount().call({ from: backendAddr });

    res.send({
        assetCount: assetCount
    })
});

/*取得assetContract所擁有的所有erc721token address */
router.get('/GET/getAssetIndex', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetIndex = await assetContract.methods.getAssetIndex().call({ from: backendAddr });

    res.send({
        assetIndex: assetIndex
    })

});

/*轉移token */
router.post('/POST/transferAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr });
    let encodedData = assetContract.methods.transferAsset(req.body.ERC721Addr, req.body.token_id, req.body.to).encodeABI()

    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

/**To do */
router.post('/POST/signAssetContract', async function (req, res, next) {

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


