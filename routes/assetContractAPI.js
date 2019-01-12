const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
var router = express.Router();

//Infura HttpProvider Endpoint
web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));

var userAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

const contract = require('../contract/asset.json');

router.get('/', function (req, res, next) {
    res.render('assetContractAPI');
});


router.post('/POST/deploy', async function (req, res, next) {
    let assetOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let platform = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let thirdparty = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";

    let assetContract = new web3.eth.Contract(contract.abi);

    web3.eth.getTransactionCount(userAddr)
        .then(nonce => {

            let deploy = assetContract.deploy({
                data: contract.bytecode,
                arguments: [assetOwner,platform,thirdparty]
            }).encodeABI();

            let txParams = {
                from: userAddr,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(20 * 1e9),
                gasLimit: web3.utils.toHex(3000000),
                value: 0,
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


module.exports = router;


