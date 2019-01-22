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
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

/*registry contract address*/
const contract = require('../contract/asset.json');




router.get('/', function (req, res, next) {
    res.render('assetContractAPI');
});


//deploy asset contract
router.post('/POST/deploy', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    const provider = new PrivateKeyProvider(privateKey, 'http://140.119.101.130:8545');
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
                gas: 4700000,
                gasPrice: 0,
                //gasPrice: web3.utils.toHex(40 * 1e9),
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

/*取得用戶address */
router.get('/GET/getAssetsOwner', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

/*取得平台方address */
router.get('/GET/getPlatform', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr })

    res.send({
        platform: platform
    })
});

/*取得第三方address */
router.get('/GET/getThirdparty', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr })

    res.send({
        thirdparty: thirdparty
    })
});

/*取得用戶簽名 */
router.get('/GET/getOwnerSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let ownerSign = await assetContract.methods.getOwnerSign().call({ from: userAddr })

    res.send({
        ownerSign: ownerSign
    })
});

/*取得平台方簽名 */
router.get('/GET/getPlatformSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformSign = await assetContract.methods.getPlatformSign().call({ from: userAddr })

    res.send({
        platformSign: platformSign
    })
});

/*取得第三方簽名 */
router.get('/GET/getThirdpartySign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdpartySign = await assetContract.methods.getThirdpartySign().call({ from: userAddr })

    res.send({
        thirdpartySign: thirdpartySign
    })
});

/*用戶簽名 */
router.post('/POST/ownerSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr });

    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';
    let encodedData = assetContract.methods.ownerSign().encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*平台方簽名 */
router.post('/POST/platformSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr });
    console.log(platform);

    /*privatekey 到時候會去底層keycahin sign*/
    let platformPrivateKey = '0x87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18';
    let encodedData = assetContract.methods.platformSign().encodeABI();
    let result = await signTx(platform, platformPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*第三方簽名 */
router.post('/POST/thirdpartySign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr });

    /*privatekey 到時候會去底層keycahin sign*/
    let thirdpartyPrivateKey = '0x9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7';
    let encodedData = assetContract.methods.thirdpartySign().encodeABI();
    let result = await signTx(thirdparty, thirdpartyPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換用戶address */
router.post('/POST/changeOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*平台方資訊*/
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr });
    /*privatekey 到時候會去底層keycahin sign*/
    let platformPrivateKey = '0x87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18'

    let newOwner = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    let encodedData = assetContract.methods.changePlatform(newOwner).encodeABI();

    /**由平台方送出交易 */
    let result = await signTx(platform, platformPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換平台方address */
router.post('/POST/changePlatform', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*第三方資訊*/
    let thirdparty = await assetContract.methods.getThirdparty().call({ from: userAddr });
    /*privatekey 到時候會去底層keycahin sign*/
    let thirdpartyPrivateKey = '0x9B1A94F6A12261E5F4B9A446680A297ADBA95FA5C4CD72B1AF1E58A1208E3DE7';

    let newPlatform = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    let encodedData = assetContract.methods.changePlatform(newPlatform).encodeABI();

    let result = await signTx(thirdparty, thirdpartyPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換第三方address */
router.post('/POST/changeThirdparty', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*平台方資訊*/
    let platform = await assetContract.methods.getPlatform().call({ from: userAddr });
    /*privatekey 到時候會去底層keycahin sign*/
    let platformPrivateKey = '0x87AC7D120EADA31D3EF487451A373D49CB4E206678B9DDE79BD78132EEA7EF18'

    let newThirdparty = '0xadD8E8884f935E6Dbdaace2506001Cb7D163c19C';

    let encodedData = assetContract.methods.changeThirdparty(newThirdparty).encodeABI();

    /**由平台方送出交易 */
    let result = await signTx(platform, platformPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*新增資產到assetContract（由erc721Contract Trigger!）*/
router.post('/POST/addAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr });
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
    let asset = await assetContract.methods.getAsset(req.query.ERC721Addr).call({ from: userAddr });

    res.send({
        asset: asset
    })
});

/*取得有幾種erc721token */
router.get('/GET/getAssetCount', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetCount = await assetContract.methods.getAssetCount().call({ from: userAddr });

    res.send({
        assetCount: assetCount
    })
});

/*取得assetContract所擁有的所有erc721token address */
router.get('/GET/getAssetIndex', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetIndex = await assetContract.methods.getAssetIndex().call({ from: userAddr });

    res.send({
        assetIndex: assetIndex
    })

});

/*轉移token */
router.post('/POST/transferAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: userAddr });
    let encodedData = assetContract.methods.transferAsset(req.body.ERC721Addr, req.body.token_id, req.body.to).encodeABI()

    /*privatekey 到時候會去底層keycahin sign*/
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

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


