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

/**後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/**contracts info*/
const heliumContract = require('../ethereum/contracts/build/Platform.json');
const tokenControllerContract = require('../ethereum/contracts/build/TokenController.json');
const crowdFundingContract = require('../ethereum/contracts/build/CrowdFunding.json');
const assetBookContract = require('../ethereum/contracts/build/AssetBook.json');
const registryContract = require('../ethereum/contracts/build/Registry.json');
const multiSigContract = require('../ethereum/contracts/build/MultiSig.json');
const ERC721SPLCContract = require('../ethereum/contracts/build/ERC721SPLC_HToken.json');


let heliumContractAddr = "0xAC5Fe5Cbebe5dE436481358e83fc05A49c0D45C8";
let registryContractAddr = "0x6cf33150c68983D5a7523111CAF35B745a4e394A";

/**time server*/
var timestamp = 201903230000;

/**management address */
let management = ["0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"];






/**@dev Helium*/
/**deploy helium contract*/
router.post('/heliumContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let heliumContractAdmin = req.body.heliumContractAdmin;
    let helium = new web3deploy.eth.Contract(heliumContract.abi);

    helium.deploy({
        data: heliumContract.bytecode,
        arguments: [heliumContractAdmin, management]
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


/**@dev Registry */
/*deploy registry contract*/
router.post('/registryContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let registry = new web3deploy.eth.Contract(registryContract.abi);

    registry.deploy({
        data: registryContract.bytecode,
        arguments: [management]
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

/**@todo
 *error return
 *transaction func改良
*/
/*註冊新會員 */
router.post('/registryContract/users/:u_id', async function (req, res, next) {
    let userID = req.params.u_id;
    let assetBookAddr = req.body.assetBookAddress;
    let ethAddr = req.body.ethAddr;
    let time = timestamp;

    var registry = new web3.eth.Contract(registryContract.abi, registryContractAddr);

    let encodedData = registry.methods.addUser(userID, assetBookAddr, ethAddr, time).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, registryContractAddr, encodedData);

    res.send({
        result: result
    })
});

/*get會員資訊 */
router.get('/registryContract/users/:u_id', async function (req, res, next) {
    let u_id = req.params.u_id;

    var registry = new web3.eth.Contract(registryContract.abi, registryContractAddr);

    let userInfo = await registry.methods.getUser(u_id).call({ from: backendAddr });

    res.send({
        userInfo: userInfo
    })
});


/**@dev MultiSig */
/*deploy multiSig contract*/
router.post('/multiSigContract', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let assetBookOwner = req.body.assetBookOwner;
    let multiSig = new web3deploy.eth.Contract(multiSigContract.abi);

    multiSig.deploy({
        data: multiSigContract.bytecode,
        arguments: [assetBookOwner, heliumContractAddr]
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


/**@dev AssetBook */
/*deploy assetbook contract*/
router.post('/assetbookContract', async function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let assetBookOwner = req.body.assetBookOwner;
    let multiSigContractAddr = req.body.multiSigContractAddr;
    let time = timestamp;
    let assetBook = new web3deploy.eth.Contract(assetBookContract.abi);


    assetBook.deploy({
        data: assetBookContract.bytecode,
        arguments: [assetBookOwner, multiSigContractAddr, heliumContractAddr, time]
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


/**@dev CrowdFunding */
/*deploy crowdFunding contract*/
router.post('/crowdFundingContract', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let tokenSymbol = req.body.tokenSymbol;;
    let tokenPrice = req.body.tokenPrice;
    let currency= req.body.currency;
    let quantityMax = req.body.quantityMax;
    let goalInPercentage = Math.floor(req.body.fundingGoal / quantityMax * 100);
    let CFSD2 = parseInt(req.body.CFSD2);
    let CFED2 = parseInt(req.body.CFED2);
    let serverTime = timestamp;

    let crowdFunding = new web3deploy.eth.Contract(crowdFundingContract.abi);

    crowdFunding.deploy({
        data: crowdFundingContract.bytecode,
        arguments: [tokenSymbol, tokenPrice, currency, quantityMax, goalInPercentage, CFSD2, CFED2, serverTime, management]
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


/**@dev TokenController */
/*deploy tokenController contract*/
router.post('/tokenControllerContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let timeCurrent = timestamp;
    let TimeTokenLaunch = req.body.TimeTokenLaunch;
    let TimeTokenUnlock = req.body.TimeTokenUnlock;
    let TimeTokenValid = req.body.TimeTokenValid;

    let tokenController = new web3deploy.eth.Contract(tokenControllerContract.abi);

    tokenController.deploy({
        data: tokenControllerContract.bytecode,
        arguments: [timeCurrent, TimeTokenLaunch, TimeTokenUnlock, TimeTokenValid, management]
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


/**@dev ERC721SPLC */
/*deploy ERC721SPLC contract*/
router.post('/ERC721SPLCContract', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
    const web3deploy = new Web3(provider);

    let nftName = req.body.nftName;
    let nftSymbol = req.body.nftSymbol;
    let siteSizeInKW = req.body.siteSizeInKW;
    let maxTotalSupply = req.body.maxTotalSupply;
    let initialAssetPricing = req.body.initialAssetPricing;
    let pricingCurrency = req.body.pricingCurrency;
    let IRR20yrx100 = req.body.IRR20yrx100;
    let addrERC721SPLC_ControllerITF = req.body.ERC721SPLC_ControllerITFaddr;
    let tokenURI = req.body.tokenURI;

    let ERC721SPLC = new web3deploy.eth.Contract(ERC721SPLCContract.abi);


    ERC721SPLC.deploy({
        data: ERC721SPLCContract.bytecode,
        arguments: [nftName, nftSymbol, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrency, IRR20yrx100, registryContractAddr, addrERC721SPLC_ControllerITF, tokenURI]
    })
        .send({
            from: backendAddr,
            gas: 9000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
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
                    gas: 3000000,
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