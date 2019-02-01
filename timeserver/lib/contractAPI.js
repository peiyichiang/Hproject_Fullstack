const web3 = require('./web3.js');

const IncomeManagementAbi = require('../../contract/IncomeManagement.json');
const CrowdfundingAbi = require('../../contract/Crowdfunding.json');

function sendTimeToRentContract(addr, time) {
    let contract = new web3.eth.Contract(IncomeManagementAbi, addr);
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
    web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(CrowdfundingAbi, addr);
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


module.exports = {
    sendTimeToRentContract,
    sendTimeToCrowdfundingContract,
}
