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
const contract = require('../ethereum/contracts/build/ERC721SPLC_HToken.json');


//deploy asset contract
router.post('/deploy', function (req, res, next) {
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let ERC721SPLC_HToken = new web3deploy.eth.Contract(contract.abi);
    let nftName = req.body.nftName;
    let nftSymbol = req.body.nftSymbol;
    let siteSizeInKW = req.body.siteSizeInKW;
    let maxTotalSupply = req.body.maxTotalSupply;
    let initialAssetPricing = req.body.initialAssetPricing;
    let pricingCurrency = req.body.pricingCurrency;
    let IRR20yrx100 = req.body.IRR20yrx100;
    let addrRegistryITF = req.body.addrRegistryITF;
    let addrERC721SPLC_ControllerITF = req.body.addrERC721SPLC_ControllerITF;


    ERC721SPLC_HToken.deploy({
        data: contract.bytecode,
        arguments: [nftName, nftSymbol, siteSizeInKW, maxTotalSupply, initialAssetPricing, pricingCurrency, IRR20yrx100, addrRegistryITF, addrERC721SPLC_ControllerITF]
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

router.post('/name', async function (req, res, next) {
    let contractAddr = req.body.address;
    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_HToken.methods.name().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

router.post('/symbol', async function (req, res, next) {
    let contractAddr = req.body.address;
    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_HToken.methods.symbol().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**mint token */
router.post('/mintSerialNFT', async function (req, res, next) {
    let contractAddr = req.body.address;
    let to = req.body.to;
    let uri = req.body.uri;
    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_HToken.methods.mintSerialNFT(to, uri).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**mint token batch*/
router.post('/mintSerialNFTBatch', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tos = req.body.tos;
    let uris = req.body.uris;
    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let encodedData = ERC721SPLC_HToken.methods.mintSerialNFTBatch(tos, uris).encodeABI();

    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*取得721token資訊*/
router.get('/token/NFTInfo', async function (req, res, next) {
    let contractAddr = req.query.address;
    let id = req.query.id;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.getNFT(id).call({ from: backendAddr })

    res.send({
        result: result
    })
});

/*查看用戶有哪些721token*/
router.get('/owner/IDs', async function (req, res, next) {
    let contractAddr = req.query.address;
    let owner = req.query.owner;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.get_ownerToIds(owner).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/owner/ownerIndex', async function (req, res, next) {
    let contractAddr = req.query.address;
    let tokenId = req.query.tokenId;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.get_idToOwnerIndexPlus1(tokenId).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/token/tokenOwner', async function (req, res, next) {
    let contractAddr = req.query.address;
    let idStart = req.query.idStart;
    let idCount = req.query.idCount;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.getTokenOwners(idStart, idCount).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/token/tokenURI', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenId = req.body.tokenId;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.tokenURI(tokenId).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/owner/balanceOf', async function (req, res, next) {
    let contractAddr = req.query.address;
    let owner = req.query.owner;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.balanceOf(owner).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/token/ownerOf', async function (req, res, next) {
    let contractAddr = req.query.address;
    let tokenId = req.query.tokenId;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.ownerOf(tokenId).call({ from: backendAddr })

    res.send({
        result: result
    })
});

router.get('/token/isApproved', async function (req, res, next) {
    let contractAddr = req.query.address;
    let tokenId = req.query.tokenId;

    let ERC721SPLC_HToken = new web3.eth.Contract(contract.abi, contractAddr);

    let result = await ERC721SPLC_HToken.methods.getApproved(tokenId).call({ from: backendAddr })

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
