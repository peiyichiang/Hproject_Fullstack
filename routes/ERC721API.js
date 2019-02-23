const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
var router = express.Router();

/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

/*platform contract address*/
const contract = require('../ethereum/contracts/build/ERC721SPLC_HToken.json');


//deploy asset contract
router.post('/POST/deploy', function (req, res, next) {
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    const web3deploy = new Web3(provider);

    let ERC721SPLC_HToken = new web3deploy.eth.Contract(contract.abi);
    let nftName = req.body.nftName;
    let nftSymbol = req.body.nftSymbol;
    let siteSizeInKW = req.body.siteSizeInKW;
    let maxTotalSupply = req.body.maxTotalSupply;
    let initialAssetPricing = req.body.initialAssetPricing;
    let pricingCurrency = req.body.pricingCurrency;
    let IRR20yrx100 = req.body.IRR20yrx100;
    let IRR20yrx100Addr= req.body.IRR20yrx100Addr;
    let addrERC721SPLC_ControllerITF = req.body.addrERC721SPLC_ControllerITF;


    ERC721SPLC_HToken.deploy({
        data: contract.bytecode,
        arguments: [assetOwner, platform, time]
    })
        .send({
            from: backendAddr,
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});