const timer = require('./api.js');
const { mysqlPoolQuery, setFundingStateDB, getFundingStateDB, getTokenStateDB, setTokenStateDB, addProductRow, addSmartContractRow, isIMScheduleGoodDB, addOrders } = require('./mysql.js');

const { checkTimeOfOrder, getDetailsCFC,
  getFundingStateCFC, updateFundingStateCFC, updateCFC, 
  addInvestorAssebooksIntoCFC, getInvestorsFromCFC,
  getTokenStateTCC, updateTokenStateTCC, updateTCC, 
  isScheduleGoodIMC } = require('./blockchain.js');

let choice = 2, crowdFundingAddr, arg0, arg1, arg2, time, fundingState, tokenState;

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
  Set both DB and CrowdFunding contract state to initial
  Get the CFSD2 and CFED2 from CrowdFunding Contract => put the values above

  Enter time to see it the automation function can find the symbol and update its state in both DB and smart contract!

  yarn run testts -a 2 -z 23
  enum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}
  */
// 0: getFundingStateCFC(ctrtAddr), 1: choice 0 x all ctrtAddrs, 2: updateFundingStateCFC(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs, 10: reset funding states in DB, 11: updateCFC(time = CFSD2), 12: updateCFC(time = CFED2);

const arguLen = process.argv.length;
console.log('arguLen', arguLen, 'process.argv', process.argv);
if (arguLen == 3 && process.argv[2] === '--h') {
  console.log("\x1b[32m", '$ yarn run testts --c C');
  console.log("\x1b[32m", '0: getFundingStateCFC(ctrtAddr), 1: choice 0 x all ctrtAddrs,');
  console.log("\x1b[32m", '2: updateFundingStateCFC(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs');
  console.log("\x1b[32m", '10: reset CFC funding states in DB');
  console.log("\x1b[32m", '11: updateCFC(time = CFSD2)');
  console.log("\x1b[32m", '12: updateCFC(time = CFED2)');
  process.exit(0);
  // process.on('exit', function(code) {  
  //   return console.log(`About to exit with code ${code}`);
  // });
} else if (arguLen < 6) {
  console.log('not enough arguments. --h for help');
  process.exit(0);
} else {
  //Number.isInteger(process.argv[3])
  choice = parseInt(process.argv[5]);
  if (choice < 0 || choice > 50){
    console.log('choice value is out of range. choice: ', choice);
    process.exit(0);
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
const currentTime = await timer.getTime();
console.log('currentTime', currentTime);
// timer.getTime().then(function(time) {
//     console.log(`last recorded time via lib/api.js: ${time}`)
// });

/**------------------==
Options according to test flow:

0: choice 0 x all ctrtAddrs, 
10: reset DB CFC funding states, 
21: updateCFC(time == CFSD2);
22: updateCFC(time == CFED2);

2: reset CFC to initial: updateFundingStateCFC(ctrt_ndex), 
//3: reset CFC all to initial... choice 2 x all ctrtAddrs, 
11: reset DB to CFSD2, 

1: getFundingStateCFC(ctrtAddr), 
12: updateCFC(time = CFED2);

const crowdFundingAddrArray= ['0x777684806c132bb919fA3612B80e04aDf71aF8b6', '0x68FDC10CFAE1f27CFf55eE04D37A0abA92De006A', '0x50268032D63986E89C3Ea462F2859983C7A69b48'];
*/



const addInvestorAssebooksIntoCFC_API = async () => {
  await addInvestorAssebooksIntoCFC();
}

const getInvestorsCFC_API = async () => {
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  const investorArray = await getInvestorsCFC(0,0);
  console.log('investorArray:', investorArray);
}
const writeAssetbooksIntoCFC = async () => {
  //make orders
  const nationalId = 'R555777999';
  const symbol = 'AAOS1903';
  let tokenCount = 10;
  let fundCount = 18000;
  let orderStatus = "paid";
  await addOrders(nationalId, symbol, tokenCount, fundCount, orderStatus);

  //deploy smart contracts of symbol, cf
  await addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController)

  //make userId -> assetbook
  process.exit(0);
}

//yarn run testts -a 2 -c 5
if(choice === 5){// test auto writing paid orders into crowdfunding contract
  writeAssetbooksIntoCFC();

} else if(choice === 6){
  addInvestorAssebooksIntoCFC();

} else if(choice === 1){
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  getDetailsCFC(crowdFundingAddr);

//------------==Crowdfunding
//yarn run testts -a 2 -c 20
} else if(choice === 10) {
  console.log('choice == 10. check crowdfunding fundingStates...');
  crowdFundingAddrArray.forEach( cfAddr => {
    getFundingStateCFC(cfAddr);
  });
  console.log('crowdFundingAddrArray', crowdFundingAddrArray);

} else if(choice === 11){
  console.log('choice === 11: getFundingStateDB');
  symArray.forEach( sym => {
    getFundingStateDB(sym);
  });

} else if(choice === 12){
  console.log('choice === 12. time= CFSD2', CFSD2);
  updateCFC(CFSD2);

} else if(choice === 13){
  console.log('choice === 13. time= CFED2', CFED2);
  updateCFC(CFED2);


} else if(choice === 15){
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 15 ', 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  getFundingStateCFC(crowdFundingAddrArray[arg0]);

} else if(choice === 16){
  time = CFSD2-1;
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 16, time= CFSD2-1:', time, 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  updateFundingStateCFC(crowdFundingAddr, time);

} else if(choice === 17){
  time = CFED-1;
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  console.log('inside choice === 17, time= CFSD2-1:', time, 'CFC index', arg0, 'crowdFundingAddr', crowdFundingAddr);
  updateFundingStateCFC(crowdFundingAddr, time);

//enum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}
} else if(choice === 18){
  if(arg0 === 0){ fundingState = "initial";
  } else if(arg0 === 1){ fundingState = "funding";
  } else if(arg0 === 2){ fundingState = "fundingGoalReached";
  }
  let CFSD_NEW, CFED_NEW;
  if(arg0 < 3){
    CFSD_NEW = undefined;
    CFED_NEW = undefined;
  } else {
    CFSD_NEW = CFSD2;
    CFED_NEW = CFED2;
  }
  console.log('arg0', arg0, 'fundingState', fundingState, 'CFSD_NEW', CFSD_NEW, 'timeValid', timeValid);
  symArray.forEach( sym => {
    console.log('symbol', sym, 'fundingState', fundingState, 'CFSD_NEW', CFSD_NEW, 'CFED_NEW', CFED_NEW);
    setFundingStateDB(sym, fundingState, CFSD_NEW, CFED_NEW);
  });


} else if(choice === 20){

  
} else if(choice === 20){

//--------------------==TokenController tokenState
//yarn run testts -a 2 -c 20
} else if(choice === 20){
  console.log('choice == 20. check tokenController tokenStates...');
  tokenControllerAddrArray.forEach( tcAddr => {
    getTokenStateTCC(tcAddr);
  });
  console.log('tokenControllerAddrArray', tokenControllerAddrArray);

//yarn run testts -a 2 -c 21
} else if (choice === 21){
  console.log('choice === 21: getTokenStateDB');
  symArray.forEach( sym => {
    getTokenStateDB(sym);
  });

} else if(choice === 22){
  console.log('choice === 22. time= TimeTokenUnlock', TimeTokenUnlock);
  updateTCC(TimeTokenUnlock);

// yarn run testts -a 2 -c 23
} else if(choice === 23){
  console.log('choice === 23. time= TimeTokenValid', TimeTokenValid);
  updateTCC(TimeTokenValid);

} else if(choice === 25){
  tokencontrollerAddr = tokenControllerAddrArray[arg0];
  console.log('inside choice === 25 ', 'TCC index', arg0, 'tokencontrollerAddr', tokencontrollerAddr);
  getTokenStateTCC(tokenControllerAddrArray[arg0]);

} else if(choice === 26){
  time = TimeTokenUnlock-1;
  tokencontrollerAddr = tokenControllerAddrArray[arg0];
  console.log('inside choice === 26, time= TimeTokenUnlock-1:', time, 'TCC index', arg0, 'tokencontrollerAddr', tokencontrollerAddr);
  updateTokenStateTCC(tokencontrollerAddr, time);

//NOT WORKING => NEEDS SEQUENTIAL RUN!!!
} else if(choice === 27){
  // if(arg0 === 0){ time = TimeTokenUnlock-1;
  // } else if(arg0 === 1){ time = TimeTokenUnlock+1;
  // } else if(arg0 === 2){ time = TimeTokenValid;
  // }
  //console.log(`inside choice === 27, arg0= ${arg0} time= ${time}`);
  time = TimeTokenValid-1;
  tokencontrollerAddr = tokenControllerAddrArray[arg0];
  console.log('inside choice === 27, time= TimeTokenValid-1:', time, 'TCC index', arg0, 'tokencontrollerAddr', tokencontrollerAddr);
  updateTokenStateTCC(tokencontrollerAddr, time);

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


//--------------------==IncomeManager isScheduleGoodForRelease
//yarn run testts -a 2 -c 30
} else if(choice === 30){
  console.log('choice == 30. check incomeManager IsScheduleGoodForReleases...');
  incomeManagerAddrArray.forEach( tcAddr => {
    isScheduleGoodIMC(tcAddr);
  });
  console.log('incomeManagerAddrArray', incomeManagerAddrArray);

//yarn run testts -a 2 -c 31
} else if (choice === 31){
  console.log('choice === 31: getIsScheduleGoodForReleaseDB');
  symArray.forEach( sym => {
    isIMScheduleGoodDB(sym);
  });

} else if(choice === 35){
  incomeManagerAddr = incomeManagerAddrArray[arg0];
  console.log('inside choice === 35 ', 'TCC index', arg0, 'incomeManagerAddr', incomeManagerAddr);
  isScheduleGoodIMC(incomeManagerAddrArray[arg0]);

} else if(choice === 38){
  if(arg0 === 0){ isScheduleGoodForRelease = "lockupperiod";
  } else if(arg0 === 1){ isScheduleGoodForRelease = "normal";
  } else if(arg0 === 2){ isScheduleGoodForRelease = "expired";
  }
  let timeUnlockup, timeValid;
  if(arg0 < 3){
    timeUnlockup = undefined;
    timeValid = undefined;
  } else {
    timeUnlockup = TimeTokenUnlock;
    timeValid = TimeTokenValid;
  }
  console.log('arg0', arg0, 'isScheduleGoodForRelease', isScheduleGoodForRelease, 'timeUnlockup', timeUnlockup, 'timeValid', timeValid);
  symArray.forEach( sym => {
    console.log('symbol', sym, 'arg0', arg0, 'isScheduleGoodForRelease', isScheduleGoodForRelease, 'timeUnlockup', timeUnlockup, 'timeValid', timeValid);
    setIMScheduleDB(sym, isScheduleGoodForRelease, timeUnlockup, timeValid);
  });

} else if (choice === 72){
  console.log('choice === 72');
    
} else {
  console.log('choice is out of range');
}

//console.log('\nenum FundingState{0 initial, 1 funding, 2 fundingPaused, 3 fundingGoalReached, 4 fundingClosed, 5 fundingNotClosed, 6 terminated}');

//console.log('\n0: choice 0 x all ctrtAddrs, 1: getFundingStateCFC(ctrtAddr), 2: updateFundingStateCFC(crowdFundingAddr, time), 3: choice 2 x all ctrtAddrs, 10: get funding states in DB, 11: set funding states in DB, 21: updateCFC(time = CFSD2), 22: updateCFC(time = CFED2);');
