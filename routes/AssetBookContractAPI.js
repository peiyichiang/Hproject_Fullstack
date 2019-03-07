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
const contract = require('../ethereum/contracts/build/AssetBook.json');


//deploy asset contract
router.post('/deploy', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let assetOwner = req.body.assetOwner;
    let platform = req.body.platform;
    let time = req.body.time;
    let assetContract = new web3deploy.eth.Contract(contract.abi);

    assetContract.deploy({
        data: contract.bytecode,
        arguments: [assetOwner, platform, time]
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

/*取得用戶address */
router.get('/assetBook/OwnerEthAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwner = await assetContract.methods.getAssetsOwner().call({ from: backendAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

/*取得平台方address */
router.get('/assetBook/PlatformContractAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platform = await assetContract.methods.getPlatformContractAddr().call({ from: backendAddr })

    res.send({
        platform: platform
    })
});

/*取得背書人address */
router.get('/assetBook/endorsersContractAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let endorsers = await assetContract.methods.getEndorsers().call({ from: backendAddr })

    res.send({
        endorsers: endorsers
    })
});

/*取得用戶簽名 */
router.get('/assetBook/multiSig/isOwnerSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsOwnerSign = await assetContract.methods.getAssetsOwnerSign().call({ from: backendAddr })

    res.send({
        assetsOwnerSign: assetsOwnerSign
    })
});

/*取得平台方簽名 */
router.get('/assetBook/multiSig/isPlatformSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let platformSign = await assetContract.methods.getPlatformSign().call({ from: backendAddr })

    res.send({
        platformSign: platformSign
    })
});

/*取得背書人簽名 */
router.get('/assetBook/multiSig/isEndorsersSign', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let endorsersSign = await assetContract.methods.getEndorsersSign().call({ from: backendAddr })

    res.send({
        endorsersSign: endorsersSign
    })
});

/*用戶簽名 */
router.post('/assetBook/multiSig/ownerSign', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let ownerPrivateKey = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";

    let encodedData = assetContract.methods.assetsOwnerSign(time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*背書人簽名（Ａ是Ｂ的背書人=> 由Ｂ的assetContract去簽Ａ */
router.post('/assetBook/multiSig/signAssetBook', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetsContractToBeSigned = req.body.assetsContractToBeSigned;

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.signAssetContract(assetsContractToBeSigned, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*更換用戶address */
router.patch('/assetBook/changeOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    let newOwner = req.body.newOwner;

    let encodedData = assetContract.methods.changeAssetOwner(newOwner, time).encodeABI();

    /**由後端送出交易 */
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換背書人assetContractAdd*/
router.patch('/assetBook/changeEndorser', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let oldEndorser = req.body.oldEndorser;
    let newEndorser = req.body.newEndorser;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.changeEndorsers(oldEndorser, newEndorser, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**新增背書人assetContractAddr*/
router.post('/assetBook/addEndorser', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let newEndorser = req.body.newEndorser;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.addEndorser(newEndorser, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*新增資產到assetContract（由erc721Contract Trigger!）*/
router.post('/assetBook/asset/addAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let ERC721Addr = req.body.ERC721Addr
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetContract.methods.addAsset(ERC721Addr, time).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*輸入erc721tokenAddr，取得token相關資訊*/
router.get('/assetBook/asset/assetInfo', async function (req, res, next) {
    let contractAddr = req.query.address;
    let ERC721Addr = req.query.ERC721Addr
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    let asset = await assetContract.methods.getAsset(ERC721Addr).call({ from: backendAddr });

    res.send({
        asset: asset
    })
});

/*取得有幾種erc721token */
router.get('/assetBook/asset/assetAmount', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetCount = await assetContract.methods.getAssetCount().call({ from: backendAddr });

    res.send({
        assetCount: assetCount
    })
});

/*取得assetContract所擁有的所有erc721token address */
router.get('/assetBook/asset/assetIndex', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);
    let assetIndex = await assetContract.methods.getAssetIndex().call({ from: backendAddr });

    res.send({
        assetIndex: assetIndex
    })

});

/**approve token被移轉 */
router.post('/assetBook/asset/approve', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenAddr = req.body.tokenAddr;
    let approved = req.body.approved;
    let tokenId = req.body.tokenId;
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.approve(tokenAddr, approved, tokenId, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

/*轉移token */
router.post('/assetBook/asset/transfer', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenAddr = req.body.tokenAddr;
    let to = req.body.to;
    let tokenId = req.body.tokenId;
    let time = req.body.time;
    let assetContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetContract.methods.transferAsset(tokenAddr, to, tokenId, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

/**approve token */

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

