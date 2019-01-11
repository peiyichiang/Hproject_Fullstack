const express = require('express');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');
var router = express.Router();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));

var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var contractAddr = '0x391dace017a97273e1231c7072f6cd9dcd05e798';

const contract = require('../contract/registry.json');
var registryContract = new web3js.eth.Contract(contract.abi, contractAddr);


router.get('/', function (req, res, next) {
    res.render('registryContractAPI');
});

router.get('/GET/getOwner', async function (req, res, next) {
    let owner = await bank.methods.getCoinBalance().call({ from: userAddr })

    res.send({
        owner: owner
    })
});




module.exports = router;


