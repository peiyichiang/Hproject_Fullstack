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
const contract = require('../ethereum/contracts/build/IncomeManagement.json');

//deploy crowdFunding contract
router.post('/deploy', function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let TimeAnchor = req.body.TimeAnchor;
    let tokenCtrt = req.body.tokenCtrt;
    let PA_Ctrt= req.body.PA_Ctrt;
    let FMXA_Ctrt = req.body.FMXA_Ctrt;
    let platformCtrt = req.body.platformCtrt;

    let IncomeManagementContract = new web3deploy.eth.Contract(contract.abi);

    IncomeManagementContract.deploy({
        data: contract.bytecode,
        arguments: [TimeAnchor, tokenCtrt, PA_Ctrt, FMXA_Ctrt, platformCtrt]
    })
        .send({
            from: backendAddr,
            gas: 7000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});

/**makeIncomeSchedule*/
router.post('/makeIncomeSchedule', async function (req, res, next) {
    let contractAddr = req.body.address;
    let paymentDate = req.body.paymentDate;
    let paymentAmount = req.body.paymentAmount;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.makeIncomeSchedule(paymentDate, paymentAmount).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**setPaymentReleaseResults*/
router.post('/setPaymentReleaseResults', async function (req, res, next) {
    let contractAddr = req.body.address;
    let paymentDate = req.body.paymentDate;
    let boolValue = req.body.boolValue;
    let errorCode = req.body.errorCode;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.setPaymentReleaseResults(paymentDate, boolValue, errorCode).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**setErrResolution*/
router.post('/setErrResolution', async function (req, res, next) {
    let contractAddr = req.body.address;
    let paymentDate = req.body.paymentDate;
    let boolValue = req.body.boolValue;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.setErrResolution(paymentDate, boolValue).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**editIncomeSchedule*/
router.patch('/editIncomeSchedule', async function (req, res, next) {
    let contractAddr = req.body.address;
    let index = req.body.index;
    let paymentDate = req.body.paymentDate;
    let paymentAmount = req.body.paymentAmount;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.editIncomeSchedule(index, paymentDate, paymentAmount).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/**removeIncomeSchedule*/
router.delete('/removeIncomeSchedule', async function (req, res, next) {
    let contractAddr = req.body.address;
    let index = req.body.index;
    let paymentDate = req.body.paymentDate;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.removeIncomeSchedule(index, paymentDate).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*isIncomeReadyForRelease */
router.get('/isIncomeReadyForRelease', async function (req, res, next) {
    let contractAddr = req.query.address;
    let dateToday = req.query.dateToday;

    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);
    let salestate = await IncomeManagementContract.methods.isIncomeReadyForRelease(dateToday).call({ from: backendAddr })

    res.send({
        salestate: salestate
    })
});

/**setIsApproved*/
router.patch('/setIsApproved', async function (req, res, next) {
    let contractAddr = req.body.address;
    let boolValue = req.body.boolValue;
    let paymentDate = req.body.paymentDate;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.setIsApproved(paymentDate, boolValue).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});


/**changeFMXA*/
router.patch('/changeFMXA', async function (req, res, next) {
    let contractAddr = req.body.address;
    let FMXA_new = req.body.FMXA_new;
    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = IncomeManagementContract.methods.changeFMXA(FMXA_new).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*getIncomePaymentSchedule */
router.get('/getIncomePaymentSchedule', async function (req, res, next) {
    let contractAddr = req.query.address;
    let paymentDate = req.query.paymentDate;

    let IncomeManagementContract = new web3.eth.Contract(contract.abi, contractAddr);
    let salestate = await IncomeManagementContract.methods.getIncomePaymentSchedule(paymentDate).call({ from: backendAddr })

    res.send({
        salestate: salestate
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


