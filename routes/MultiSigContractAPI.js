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

const multiSigContract = require('../ethereum/contracts/build/MultiSig.json');


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
    let multiSig = new web3deploy.eth.Contract(multiSigContract.abi);

    multiSig.deploy({
        data: multiSigContract.bytecode,
        arguments: [assetOwner, platform]
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


/*用戶簽名 */
router.post('/assetOwnerVote', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let ownerPrivateKey = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";

    let encodedData = multiSig.methods.assetOwnerVote(time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*背書人簽名（Ａ是Ｂ的背書人=> 由Ｂ的multiSig去簽Ａ */
router.post('/voteAssetBookContract', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let assetsContractToBeSigned = req.body.assetsContractToBeSigned;

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = multiSig.methods.voteAssetContract(assetsContractToBeSigned, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});


/*更換用戶address */
router.patch('/changeAssetOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);

    let newOwner = req.body.newOwner;

    let encodedData = multiSig.methods.changeAssetOwner(newOwner, time).encodeABI();

    /**由後端送出交易 */
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/**新增背書人multiSigAddr*/
router.post('/addEndorser', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let newEndorser = req.body.newEndorser;
    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = multiSig.methods.addEndorser(newEndorser, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*更換背書人multiSigAdd*/
router.patch('/changeEndorser', async function (req, res, next) {
    let contractAddr = req.body.address;
    let time = req.body.time;
    let oldEndorser = req.body.oldEndorser;
    let newEndorser = req.body.newEndorser;
    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = multiSig.methods.changeEndorser(oldEndorser, newEndorser, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })

});

/*取得用戶address */
router.get('/ownerEthAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let assetsOwner = await multiSig.methods.getAssetOwner().call({ from: backendAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

/*取得平台方address */
router.get('/platformContractAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let platform = await multiSig.methods.getPlatformContractAddr().call({ from: backendAddr })

    res.send({
        platform: platform
    })
});


/*取得背書人address */
router.get('/endorsersContractAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let endorsers = await multiSig.methods.getEndorsers().call({ from: backendAddr })

    res.send({
        endorsers: endorsers
    })
});


/*取得用戶簽名 */
router.get('/assetOwner_flag', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let assetsOwnerSign = await multiSig.methods.assetOwner_flag().call({ from: backendAddr })

    res.send({
        assetsOwnerSign: assetsOwnerSign
    })
});

/*取得平台方簽名 */
router.get('/platform_flag', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let platformSign = await multiSig.methods.platform_flag().call({ from: backendAddr })

    res.send({
        platformSign: platformSign
    })
});

/*取得背書人簽名 */
router.get('/endorsers_flag', async function (req, res, next) {
    let contractAddr = req.query.address;

    let multiSig = new web3.eth.Contract(multiSigContract.abi, contractAddr);
    let endorsersSign = await multiSig.methods.endorsers_flag().call({ from: backendAddr })

    res.send({
        endorsersSign: endorsersSign
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
