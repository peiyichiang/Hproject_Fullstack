const web3 = require('./web3.js');

const IncomeManagement = require('../../ethereum/contracts/build/IncomeManagement.json');
const CrowdFunding = require('../../ethereum/contracts/build/CrowdFunding.json');
const TokenController = require('../../ethereum/contracts/build/TokenController.json');

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

function sendTimeToCrowdfundingContract(addr, time) {
    return web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(CrowdFunding.abi, addr);
            return contract.methods.updateState(time)
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

module.exports = {
    sendTimeToRentContract,
    sendTimeToCrowdfundingContract,
    sendTimeToTokenController,
}
