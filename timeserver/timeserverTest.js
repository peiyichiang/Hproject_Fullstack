const timer = require('./lib/api.js');
const { setFundingStateDB, getFundingStateDB } = require('./lib/mysql.js');
const { checkTimeOfOrder, updateCrowdFunding, updateTokenController, checkIncomeManager, updateCFC_fundingState, getCFC_fundingState, getCFC_Details } = require('./lib/blockchain.js');


let choice = 2, crowdFundingAddr, timeCurrent, arg0, arg1, arg2;
const CFSD_Base= 201905200000;
const CFED_Base= 201906200000;

const crowdFundingAddrArray= ['0x777684806c132bb919fA3612B80e04aDf71aF8b6', '0x68FDC10CFAE1f27CFf55eE04D37A0abA92De006A', '0x50268032D63986E89C3Ea462F2859983C7A69b48'];

const symbolArray = ["HHtoekn12222", "Htoken001", "Htoken0030"];

/**
  Set both DB and CrowdFunding contract state to initial
  Get the CFSD and CFED from CrowdFunding Contract => put the values above

  Enter time to see it the automation function can find the symbol and update its state in both DB and smart contract!

  yarn run testts -z Z -a arg0 -b arg1 -c arg2
  enum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}
  */
// 0: getCFC_fundingState(ctrtAddr), 1: choice 0 x all ctrtAddrs, 2: updateCFC_fundingState(crowdFundingAddr, timeCurrent), 3: choice 2 x all ctrtAddrs, 10: reset funding states in DB, 11: updateCrowdFunding(timeCurrent = CFSD_Base), 12: updateCrowdFunding(timeCurrent = CFED_Base);

const arguLen = process.argv.length;
console.log('arguLen', arguLen, 'process.argv', process.argv);
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run testts --c C');
  console.log("\x1b[32m", '0: getCFC_fundingState(ctrtAddr), 1: choice 0 x all ctrtAddrs,');
  console.log("\x1b[32m", '2: updateCFC_fundingState(crowdFundingAddr, timeCurrent), 3: choice 2 x all ctrtAddrs');
  console.log("\x1b[32m", '10: reset CFC funding states in DB');
  console.log("\x1b[32m", '11: updateCrowdFunding(timeCurrent = CFSD_Base)');
  console.log("\x1b[32m", '12: updateCrowdFunding(timeCurrent = CFED_Base)');
  process.exit(1);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 4) {
  console.log('not enough arguments. --h for help');
  process.exit(1);
} else {
  //Number.isInteger(process.argv[3])
  choice = parseInt(process.argv[3]);
  if (choice < 0 || choice > 50){
    console.log('choice value is out of range. choice: ', choice);
    process.exit(1);
  }
  if (arguLen < 6) {
    arg0 = 0;
  } else {
    arg0 = parseInt(process.argv[5]);
    if (arguLen < 8) {
      arg1 = 0;
    } else {
      arg1 = parseInt(process.argv[7]);
      if (arguLen < 10) {
        arg2 = 0;
      } else {
        arg2 = parseInt(process.argv[9]);
      }  
    }  
  }  
}

//-----------------==
timer.getTime().then(function(time) {
    console.log(`last recorded time via lib/api.js: ${time}`)
});

//------------------==
// 0: getCFC_fundingState(ctrtAddr), 1: choice 0 x all ctrtAddrs, 2: updateCFC_fundingState(t<CFSD) ctrt_ndex, 3: choice 2 x all ctrtAddrs, 10: reset DB CFC funding states, 11: updateCrowdFunding(timeCurrent = CFSD_Base), 12: updateCrowdFunding(timeCurrent = CFED_Base);
/**const crowdFundingAddrArray= ['0x777684806c132bb919fA3612B80e04aDf71aF8b6', '0x68FDC10CFAE1f27CFf55eE04D37A0abA92De006A', '0x50268032D63986E89C3Ea462F2859983C7A69b48'];
 */

 if(choice === 0){
  for(let i = 0; i < crowdFundingAddrArray.length; i++){
    getCFC_fundingState(crowdFundingAddrArray[i]);
  }
  console.log(crowdFundingAddrArray);

} else if(choice === 1){
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 1 ', 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  getCFC_fundingState(crowdFundingAddrArray[arg0]);

} else if(choice === 2){
  timeCurrent = CFSD_Base-1;
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 2, timeCurrent:', timeCurrent, 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  updateCFC_fundingState(crowdFundingAddr, timeCurrent);

} else if(choice === 3){
  timeCurrent = CFSD_Base-1;
  for(let i = 0; i < crowdFundingAddrArray.length; i++){
    updateCFC_fundingState(crowdFundingAddrArray[i], timeCurrent);
  }

} else if(choice === 10) {
  for(let i = 0; i < symbolArray.length; i++){
    getFundingStateDB(symbolArray[i]);
  }

} else if(choice === 11) {
  const pstate = "initial"; let CFSD, CFED;
  for(let i = 0; i < symbolArray.length; i++){
    CFSD = CFSD_Base + i*10;
    CFED = CFED_Base + i*10;
    console.log('symbol', symbolArray[i], 'pstate', pstate, 'CFSD', CFSD, 'CFED', CFED);
    setFundingStateDB(symbolArray[i], pstate, CFSD, CFED);
  }

} else if(choice === 12) {
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  getCFC_Details(crowdFundingAddr);


} else if(choice === 21) {
  const timeCurrent = CFSD_Base;
  console.log('choice === 21. timeCurrent === CFSD_Base', timeCurrent, CFSD_Base);
  updateCrowdFunding(timeCurrent);

} else if(choice === 22) {
  const timeCurrent = CFED_Base;
  console.log('choice === 22. timeCurrent == CFED_Base', timeCurrent, CFED_Base);
  updateCrowdFunding(timeCurrent);

} else {
  console.log('choice is out of range');
}

console.log('\nenum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}');

console.log('\n0: choice 0 x all ctrtAddrs, 1: getCFC_fundingState(ctrtAddr), 2: updateCFC_fundingState(crowdFundingAddr, timeCurrent), 3: choice 2 x all ctrtAddrs, 10: get funding states in DB, 11: set funding states in DB, 21: updateCrowdFunding(timeCurrent = CFSD_Base), 22: updateCrowdFunding(timeCurrent = CFED_Base);');
