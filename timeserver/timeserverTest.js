const timer = require('./lib/api.js');
const { setFundingStateDB, getFundingStateDB, getTokenStateDB, setTokenStateDB, addProductRow, addSmartContractRow } = require('./lib/mysql.js');

const { checkTimeOfOrder, getCFC_Details,
  getCFC_fundingState, updateCrowdFunding, updateCFC_fundingState,
  getTCC_tokenState, updateTokenController, updateTCC_tokenState,
  checkIncomeManager } = require('./lib/blockchain.js');

let choice = 2, crowdFundingAddr, arg0, arg1, arg2, time, tokenState;

const symArray = [ 'AKOS1901', 'ARRR1901', 'ATTT1901' ] ;
const crowdFundingAddrArray = [ '0x2ca5B13A94AAb64b2302F53bB6d15DAE31D26E8D',
  '0xfC03EBedc573DB572DeF77E3638c6042a5Ed3481',
  '0x9e8035e07767fE7de84adF5D362d8ccB53559960' ] ;
const tokenControllerAddrArray = [ '0x62092A989e72e61467F2DD52de6675F5B052C899',
  '0x66cd2bb2B13C31BAbA299DFf07Bd0912C6Ae466E',
  '0x0BBd1A47ff1a2E9946803a66eAda4f235BaC2C23' ] ;

const timeCurrent = 201905170000;
const CFSD2 = timeCurrent+1;
const CFED2 = timeCurrent+7;
const TimeReleaseDate = timeCurrent+10;
const TimeTokenUnlock = timeCurrent+20; 
const TimeTokenValid =  timeCurrent+90;
const fundmanager = 'Company_FundManagerN';
const pricingCurrency = "NTD";

 /**
 * to deploy crowdfunding contract
 * POST: http://localhost:3000/Contracts/crowdFundingContract/RAAY1903
 * 
 * to deploy tokencontroller contract
 * POST: http://localhost:3000/Contracts/tokenControllerContract
 * TimeAtDeployment, TimeUnlock, TimeValid, Management: 5 addrs
 * 
 */
//symbolIndex= 0, 

/**
  Set both DB and CrowdFunding contract state to initial
  Get the CFSD2 and CFED2 from CrowdFunding Contract => put the values above

  Enter time to see it the automation function can find the symbol and update its state in both DB and smart contract!

  yarn run testts -z Z -a arg0 -b arg1 -c arg2
  enum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}
  */
// 0: getCFC_fundingState(ctrtAddr), 1: choice 0 x all ctrtAddrs, 2: updateCFC_fundingState(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs, 10: reset funding states in DB, 11: updateCrowdFunding(time = CFSD2), 12: updateCrowdFunding(time = CFED2);

const arguLen = process.argv.length;
console.log('arguLen', arguLen, 'process.argv', process.argv);
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run testts --c C');
  console.log("\x1b[32m", '0: getCFC_fundingState(ctrtAddr), 1: choice 0 x all ctrtAddrs,');
  console.log("\x1b[32m", '2: updateCFC_fundingState(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs');
  console.log("\x1b[32m", '10: reset CFC funding states in DB');
  console.log("\x1b[32m", '11: updateCrowdFunding(time = CFSD2)');
  console.log("\x1b[32m", '12: updateCrowdFunding(time = CFED2)');
  process.exit(1);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 6) {
  console.log('not enough arguments. --h for help');
  process.exit(1);
} else {
  //Number.isInteger(process.argv[3])
  choice = parseInt(process.argv[5]);
  if (choice < 0 || choice > 50){
    console.log('choice value is out of range. choice: ', choice);
    process.exit(1);
  }
  if (arguLen < 6) {
    arg0 = 0;
  } else {
    arg0 = parseInt(process.argv[3]);
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

/**------------------==
Options according to test flow:

0: choice 0 x all ctrtAddrs, 
10: reset DB CFC funding states, 
21: updateCrowdFunding(time == CFSD2);
22: updateCrowdFunding(time == CFED2);

2: reset CFC to initial: updateCFC_fundingState(ctrt_ndex), 
//3: reset CFC all to initial... choice 2 x all ctrtAddrs, 
11: reset DB to CFSD2, 

1: getCFC_fundingState(ctrtAddr), 
12: updateCrowdFunding(time = CFED2);

const crowdFundingAddrArray= ['0x777684806c132bb919fA3612B80e04aDf71aF8b6', '0x68FDC10CFAE1f27CFf55eE04D37A0abA92De006A', '0x50268032D63986E89C3Ea462F2859983C7A69b48'];
*/
if(choice === 0){

} else if(choice === 1){
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  getCFC_Details(crowdFundingAddr);

//------------==Crowdfunding
} else if(choice === 10) {
  crowdFundingAddrArray.forEach( cfAddr => {
    getCFC_fundingState(cfAddr);
  });
  console.log(crowdFundingAddrArray);

} else if(choice === 11){
  symArray.forEach( sym => {
    getFundingStateDB(sym);
  });

} else if(choice === 12){
  console.log('choice === 22. time: CFSD2', CFSD2);
  updateCrowdFunding(CFSD2);

} else if(choice === 13){
  console.log('choice === 23. time: CFED2', CFED2);
  updateCrowdFunding(CFED2);


} else if(choice === 16){
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 16 ', 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  getCFC_fundingState(crowdFundingAddrArray[arg0]);

} else if(choice === 17){
  time = CFSD2-1;
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 17, time= CFSD2-1:', time, 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  updateCFC_fundingState(crowdFundingAddr, time);

} else if(choice === 18){
  time = CFED-1;
  console.log('inside choice === 18, time= CFED-1', time);
  crowdFundingAddrArray.forEach( cfAddr => {
    updateCFC_fundingState(cfAddr, time);
  });

} else if(choice === 19){
  const pstate = "initial"; let CFSD_NEW, CFED_NEW;
  CFSD_NEW = CFSD2;
  CFED_NEW = CFED2;
  symArray.forEach( sym => {
    console.log('symbol', sym, 'pstate', pstate, 'CFSD_NEW', CFSD_NEW, 'CFED_NEW', CFED_NEW);
    setFundingStateDB(sym, pstate, CFSD_NEW, CFED_NEW);
  });
  // for(let i = 0; i < symArray.length; i++){
  //   //CFSD_NEW = CFSD2 + i*10;
  //   //CFED_NEW = CFED2 + i*10;
  //   console.log('symbol', symArray[i], 'pstate', pstate, 'CFSD_NEW', CFSD_NEW, 'CFED_NEW', CFED_NEW);
  //   setFundingStateDB(symArray[i], pstate, CFSD_NEW, CFED_NEW);
  // }


//--------------------==TokenController tokenState
} else if(choice === 20){
  console.log('choice == 20. check tokenController tokenStates...');
  tokenControllerAddrArray.forEach( tcAddr => {
    getTCC_tokenState(tcAddr);
  });
  console.log('tokenControllerAddrArray', tokenControllerAddrArray);

} else if (choice === 21){
  console.log('choice === 21');
  symArray.forEach( sym => {
    getTokenStateDB(sym);
  });

} else if(choice === 22){
  console.log('choice === 22. time: TimeTokenUnlock', TimeTokenUnlock);
  updateTokenController(TimeTokenUnlock);

} else if(choice === 23){
  console.log('choice === 23. time: TimeTokenValid', TimeTokenValid);
  updateTokenController(TimeTokenValid);

} else if(choice === 25){
  tokencontrollerAddr = tokenControllerAddrArray[arg0];
  console.log('inside choice === 25 ', 'TCC index', arg0, 'tokencontrollerAddr', tokencontrollerAddr);
  getTCC_tokenState(tokenControllerAddrArray[arg0]);

} else if(choice === 26){
  time = TimeTokenUnlock-1;
  tokencontrollerAddr = tokenControllerAddrArray[arg0];
  console.log('inside choice === 26, time= TimeTokenUnlock:', time, 'TCC index', arg0, 'tokencontrollerAddr', tokencontrollerAddr);
  updateTCC_tokenState(tokencontrollerAddr, time);

} else if(choice === 27){//NOT WORKING => NEEDS SEQUENTIAL RUN!!!
  if(arg0 === 0){ time = TimeTokenUnlock-1;
  } else if(arg0 === 1){ time = TimeTokenUnlock+1;
  } else if(arg0 === 2){ time = TimeTokenValid;
  }
  console.log(`inside choice === 27, arg0= ${arg0} time= ${time}`);
  tokenControllerAddrArray.forEach( cfAddr => {
    updateTCC_tokenState(cfAddr, time);
  });

} else if(choice === 28){
  if(arg0 === 0){ tokenState = "lockupperiod";
  } else if(arg0 === 1){ tokenState = "normal";
  } else if(arg0 === 2){ tokenState = "expired";
  }
  let timeUnlockup, timeValid;
  if(arg0 < 3){
    timeUnlockup = undefined;
    timeValid = undefined;
  } else {
    timeUnlockup = TimeTokenUnlock;
    timeValid = TimeTokenValid;
  }
  console.log('arg0', arg0, 'tokenState', tokenState, 'timeUnlockup', timeUnlockup, 'timeValid', timeValid);
  symArray.forEach( sym => {
    console.log('symbol', sym, 'arg0', arg0, 'tokenState', tokenState, 'timeUnlockup', timeUnlockup, 'timeValid', timeValid);
    setTokenStateDB(sym, tokenState, timeUnlockup, timeValid);
  });


} else if (choice === 72){
  console.log('choice === 72');
    
} else {
  console.log('choice is out of range');
}

console.log('\nenum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}');

console.log('\n0: choice 0 x all ctrtAddrs, 1: getCFC_fundingState(ctrtAddr), 2: updateCFC_fundingState(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs, 10: get funding states in DB, 11: set funding states in DB, 21: updateCrowdFunding(time = CFSD2), 22: updateCrowdFunding(time = CFED2);');
