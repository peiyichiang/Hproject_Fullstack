const web3 = require('./web3.js');
const Tx = require('ethereumjs-tx');

const IncomeManagement = require('../../ethereum/contracts/build/IncomeManagement.json');
const CrowdFunding = require('../../ethereum/contracts/build/CrowdFunding.json');
const TokenController = require('../../ethereum/contracts/build/TokenController.json');

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

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

    let result = await signTx(backendAddr, backendRawPrivateKey, addr, encodedData);
    
    return result;
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

        web3.eth.getTransactionCount(userEthAddr, "pending")
            .then(nonce => {

                let userPrivateKey = Buffer.from(userRowPrivateKey.slice(2), 'hex');
                let txParams = {
                    nonce: web3.utils.toHex(nonce),
                    gas: 7000000,
                    gasPrice: 0,
                    gasLimit: web3.utils.toHex(3400000),
                    to: contractAddr,
                    value: 0,
                    data: encodedData
                }

                let tx = new Tx(txParams);
                tx.sign(userPrivateKey);
                const serializedTx = tx.serialize();
                const rawTx = '0x' + serializedTx.toString('hex');

                web3.eth.sendSignedTransaction(rawTx)
                    .on('receipt', function (receipt) {
                        resolve(receipt)
                    })
                    .on('error', function (err) {
                        reject(err);
                    })
                    .catch(function (error) {
                        return error
                    })
            })
    })
}


module.exports = {
    sendTimeToRentContract,
    sendTimeToCrowdfundingContract,
    sendTimeToTokenController,
}
