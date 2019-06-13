const { getTime, asyncForEach } = require('./utilities');

const { setFundingStateDB, getFundingStateDB, getTokenStateDB, setTokenStateDB, isIMScheduleGoodDB, addAssetRecordsIntoDB, mysqlPoolQueryB } = require('./mysql.js');

const { checkTimeOfOrder, getDetailsCFC,
  getFundingStateCFC, updateFundingStateCFC, updateCFC, 
  addAssetbooksIntoCFC, getInvestorsFromCFC,
  getTokenStateTCC, updateTokenStateTCC, updateTCC, 
  isScheduleGoodIMC, addIncomePaymentPerPeriodIntoDB } = require('./blockchain.js');

let { symArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftSymbol } = require('../ethereum/contracts/zsetupData');

let choice, crowdFundingAddr, arg0, arg1, arg2, time, fundingState, tokenState;

const emailArray = [];
const assetbookArray = [];
userArray.forEach((user, idx) => {
  if (idx !== 0 ){
    //userIdArray.push(user.identityNumber);
    //investorLevelArray.push(user.investorLevel);
    emailArray.push(user.email);
    assetbookArray.push(user.addrAssetBook);
  }
});
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
console.log('choice = ', choice);
//-----------------==
// const currentTime = await getTime();
// console.log('currentTime', currentTime);

// getTime().then(function(time) {
//     console.log(`last recorded time via timeserver/api.js: ${time}`)
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



const makePseudoEthAddr = (length) => {
  let result       = '0x';
  const characters = 'ABCDEFabcdef0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


// yarn run testts -a 1 -s 1 -c 1
const addAssetbooksIntoCFC_API = async () => {
  console.log('addAssetbooksIntoCFC_API');
  await addAssetbooksIntoCFC();
  //process.exit(0);
}

//  yarn run testts -a 2 -c 7
const testmysqlPoolQueryB = async () => {
  const sql = {
    ar_investorEmail: 'jackson@gmail.com',
    ar_tokenSYMBOL: 'SuperBall',
    ar_Time: 201906131300,
    ar_Holding_Amount_in_the_end_of_Period: 17,
    ar_Accumulated_Income_Paid: 100,
    ar_User_Asset_Valuation: 13000,
    ar_User_Holding_Amount_Changed: 0,
    ar_User_Holding_CostChanged: 0,
    ar_User_Acquired_Cost: 13000,
    ar_Moving_Average_of_Holding_Cost: 13000
  };//random() to prevent duplicate NULL entry!
  console.log(sql);

  const querySQL5 = 'INSERT INTO htoken.investor_assetRecord SET ?';
  const results5 = await mysqlPoolQueryB(querySQL5, sql).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL5)]', err));
  console.log("\nA new row has been added. result:", results5);
}


//reset for addAssetbooksIntoCFC() in blockchain.js
//  yarn run testts -a 2 -c 0
const reset_addAssetbooksIntoCFC_API = async() => {
  console.log('\n---------------==inside reset_addAssetbooksIntoCFC_API()...');
  const symbolTarget = nftSymbol;
  const txHashArray = ['0x1111', '0x1112', '0x1113'];
  const tokenQtyArray = [10, 5, 15];
  const paymentStatusArray = ['paid', 'paid', 'paid'];
  console.log('emailArray', emailArray);

  const length1 = txHashArray.length;
  if(length1 !== paymentStatusArray.length || length1 !== tokenQtyArray.length  || length1 !== emailArray.length){
    console.log('txHashArray, paymentStatus, tokenQtyArray, emailArray length should be of the same length'); process.exit(1);
  }

  const querySQL1 = 'SELECT * From htoken.order WHERE o_symbol = ? AND o_email != ?';
  const results1 = await mysqlPoolQueryB(querySQL1, [symbolTarget, userArray[0].email]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL1)]', err));
  console.log('\nresults1', results1);

  if(results1.length !== paymentStatusArray.length){
    console.log('results1 and paymentStatus arrays should be of the same length'); process.exit(1);
  }

  const querySQL2 = 'UPDATE htoken.order SET o_txHash = ?, o_paymentStatus = ?, o_tokenCount = ?, o_email = ? WHERE o_id = ?';
  await asyncForEach(results1, async (row, idx) => {
    const results2 = await mysqlPoolQueryB(querySQL2, [txHashArray[idx], paymentStatusArray[idx], tokenQtyArray[idx], emailArray[idx], row.o_id]).catch((err) => console.log('\n[Error @ mysqlPoolQueryB(querySQL1)]', err));
    console.log('\nresults2', results2);
  });
  process.exit(0);
};


//  yarn run testts -a 2 -c 8
const addAssetRecordsIntoDB_API = async () => {
  console.log('-----------------==addAssetRecordsIntoDB_API');
  //const inputArray = ['0001@gmail.com', '0002@gmail.com', '0003@gmail.com'];
  const inputArray = [...assetbookArray];
  //const inputArray = [ '0xdEc799A5912Ce621497BFD1Fe2C19f8e23307dbc','0xDDFd2a061429D8c48Bc39E01bB815d4C4CA7Ab11','0xC80E77bC804a5cDe179C0C191A43b87088C5e183' ];

  const symbol = 'ABBA1850';
  const serverTime = await getTime();//201906050900;
  const amountArray = [9, 11, 13];
  const personal_income = 100;
  const asset_valuation = 13000;
  const holding_amount_changed = 0;
  const holding_costChanged = 0;
  const acquired_cost = 13000;
  const moving_ave_holding_cost = 13000;
  console.log(`inputArray: ${inputArray} \namountArray: ${amountArray}
  \nsymbol: ${symbol}, serverTime: ${serverTime}`);
  const [emailArrayError, amountArrayError] = await addAssetRecordsIntoDB(inputArray, amountArray, symbol, serverTime, personal_income, asset_valuation, holding_amount_changed, holding_costChanged, acquired_cost, moving_ave_holding_cost);
  console.log(`emailArrayError: ${emailArrayError} \namountArrayError: ${amountArrayError}`);
}


//yarn run testts -a 2 -c 4
const addIncomePaymentPerPeriodIntoDB_API = async () => {
  console.log('------------------== addIncomePaymentPerPeriodIntoDB_API');
  const serverTime = 201901010000;
  //Inside income_arrangement table, make above number >= ia_actualPaymentTime of the target symbol
  await addIncomePaymentPerPeriodIntoDB(serverTime);//in blockchain.js

}

//

const getInvestorsCFC_API = async () => {
  crowdFundingAddr = crowdFundingAddrArray[arg0];
  const investorArray = await getInvestorsCFC(0,0);
  console.log('investorArray:', investorArray);
}


//------------------------==
//  yarn run testts -a 2 -c 0
if(choice === 0){// test auto writing paid orders into crowdfunding contract
  reset_addAssetbooksIntoCFC_API();

//  yarn run testts -a 2 -c 1
} else if(choice === 1){
  addAssetbooksIntoCFC_API();

//  yarn run testts -a 2 -c 2
} else if(choice === 2){

//  yarn run testts -a 2 -c 3
} else if(choice === 3){


//  yarn run testts -a 2 -c 4
} else if(choice === 4){
  addIncomePaymentPerPeriodIntoDB_API();


//  yarn run testts -a 2 -c 5
} else if(choice === 5){
  console.log('choice = 5');

//  yarn run testts -a 2 -c 7
} else if(choice === 7){
  console.log('--------------------==testmysqlPoolQueryB');
  testmysqlPoolQueryB();

//  yarn run testts -a 2 -c 8
} else if(choice === 8){
  console.log('-------------------==addAssetRecordsIntoDB_API');
  addAssetRecordsIntoDB_API();

// yarn run testts -a 1 -c 9
} else if(choice === 9){

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
