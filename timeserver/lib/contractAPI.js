const web3 = require('./web3.js');

const IncomeManagementAbi = require('../../contract/IncomeManagement.json').abi;    // not correct now
const CrowdfundingAbi = require('../../contract/Crowdfunding.json').abi;            // not exist now

function sendTimeToRentContract(addr, time) {
    web3.eth.getAccounts()
        .then(function (accounts) {
            let contract = new web3.eth.Contract(IncomeManagementAbi, addr);
            return contract.methods.getIncomePaymentSchedule(time)
                .call()
        })
        .then(function(result) {
            return result
        })
        .catch(function(error){
            return error
        })
}
