const express = require('express');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');
var router = express.Router();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));

var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

const contract = require('../contract/asset.json');
var assetContract = new web3js.eth.Contract(contract.abi);


router.get('/', function (req, res, next) {
    res.render('assetContractAPI');
});

module.exports = router;


