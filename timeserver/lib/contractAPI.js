const web3 = require('./web3.js');

const IncomeManagement = require('../../ethereum/contracts/build/IncomeManagement.json');
const CrowdFunding = require('../../ethereum/contracts/build/CrowdFunding.json');
const TokenController = require('../../ethereum/contracts/build/TokenController.json');

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');

function sendTimeToRentContract(addr, time) {
    let contract = new web3.eth.Contract(IncomeManagement.abi, addr);
    return contract.methods.getIncomePaymentSchedule(time)
        .call()
        .then(function (result) {
            return result
        })
        .catch(function (error) {
            return error
        })
}

async function sendTimeToCrowdfundingContract(addr, time) {
    /*use admin EOA to sign transaction*/
    let CrowdFundingContract = new web3.eth.Contract(CrowdFunding.abi, addr);
    let encodedData = CrowdFundingContract.methods.setServerTime(time).encodeABI();

    let result = await signTx(backendAddr, backendPrivateKey, addr, encodedData);
    
    return result;
    /*
    return web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(CrowdFunding.abi, addr);
            return contract.methods.setServerTime(time)
                .send({
                    from: accounts[0],
                    gasPrice: 0
                })
        })
        .then(function (result) {
            return result
        })
        .catch(function (error) {
            return error
        })
    */
}

function sendTimeToTokenController(addr, time) {
    return web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(TokenController.abi, addr);
            return contract.methods.setTimeCurrent(time)
                .send({
                    from: accounts[0],
                    gasPrice: 0
                })
        })
        .then(function (result) {
            return result
        })
        .catch(function (error) {
            return error
        })
}
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


module.exports = {
    sendTimeToRentContract,
    sendTimeToCrowdfundingContract,
    sendTimeToTokenController,
}
