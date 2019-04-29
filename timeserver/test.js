const timer = require('./lib/api.js');
const { mysqlPoolQuery } = require('./lib/mysql.js');
const { checkTimeOfOrder, updateCrowdFunding, updateTokenController, checkIncomeManager, setCrowdfundingDBState } = require('./lib/blockchain.js');

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

//-----------------==Copied from routes/Contracts.js
/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/**後台公私鑰*/
const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

const tokenControllerContract = require('../../ethereum/contracts/build/TokenController.json');
const CrowdFunding = require('../../ethereum/contracts/build/CrowdFunding.json');
const HCAT721_AssetTokenContract = require('../../ethereum/contracts/build/HCAT721_AssetToken.json');
const incomeManagerContract = require('../../ethereum/contracts/build/IncomeManagerCtrt.json');

const heliumContractAddr = "0x7E5b6677C937e05db8b80ee878014766b4B86e05";
const registryContractAddr = "0xcaFCE4eE56DBC9d0b5b044292D3DcaD3952731d8";
const productManagerContractAddr = "0x96191257D876A4a9509D9F86093faF75B7cCAc31";
const addrCrowdFunding = '';

//-----------------==


timer.getTime().then(function(time) {
    console.log(`last recorded time via lib/api.js: ${time}`)
});

const choice = 2;
const CFSD= 201905200000; const CFED= 201906200000;
if(choice==1){
  const pstate = "initial";
  let symbol1 = "HHtoekn12222", symbol2 = "Htoken001", symbol3 = "Htoken0030";
  setCrowdfundingDBState(symbol1, pstate);
  setCrowdfundingDBState(symbol2, pstate);
  setCrowdfundingDBState(symbol3, pstate);

} else if(choice === 2) {
  getCFC_fundingState();

} else if(choice === 3) {
  const timeCurrent = CFSD;
  console.log('timeCurrent @ ts:test.js', timeCurrent);
  updateCrowdFunding(timeCurrent);

}

const getCFC_fundingState = async () => {
  const instCrowdFunding = new web3.eth.Contract(CrowdFunding.abi, addrCrowdFunding);
  let fundingState = await instCrowdFunding.methods.fundingState().call({ from: backendAddr });
  console.log('fundingState', fundingState);
}
