
//--------------------------------==
//yarn run livechain -c 1 --f 19
const imApprove = async (symbol, schIndex, boolValue) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside imApprove()');
    console.log('schIndex', schIndex, 'boolValue', boolValue);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    if(result2[4] === boolValue){
      console.log('the desired status has already been set so');
      resolve(true);

    } else {
      let encodedData = instIncomeManager.methods.imApprove(schIndex, true).encodeABI();
      console.log('about to execute signTx()...');
      let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData);
      console.log('TxResult', TxResult);
  
      const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
      console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);
      resolve(true);
    }
  });
}



//yarn run livechain -c 1 --f 18
const removeIncomeSchedule = async (symbol, schIndex) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside removeIncomeSchedule()');
    console.log('symbol', symbol, 'schIndex', schIndex);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]:'+ err);
      return false;
    });
    console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);
    let encodedData = instIncomeManager.methods.removeIncomeSchedule(schIndex).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData);
    console.log('TxResult', TxResult);

    const indexStart = 0; const amount = 0;
    let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('\nscheduleList', scheduleList);
    const schCindexM = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', schCindexM);//assert.equal(result, 0);
    resolve(true);
  });
}


//yarn run livechain -c 1 --f 20
const setPaymentReleaseResults = async (symbol, schIndex, actualPaymentTime, actualPaymentAmount,  errorCode) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-----------------==inside setPaymentReleaseResults()');
    console.log('schIndex', schIndex, 'actualPaymentTime', actualPaymentTime, 'actualPaymentAmount', actualPaymentAmount, 'errorCode', errorCode);

    const addrIncomeManager = await findCtrtAddr(symbol,'incomemanager').catch((err) => {
      reject('[Error @findCtrtAddr]: '+ err);
      return false;
    });
    //console.log('check9');

    const instIncomeManager = new web3.eth.Contract(IncomeManager.abi, addrIncomeManager);

    const result2 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result2[4]} \nforecastedPayableTime: ${result2[0]}\nforecastedPayableAmount: ${result2[1]}\nactualPaymentTime: ${result2[2]} \nactualPaymentAmount: ${result2[3]}\nisApproved: ${result2[4]}\nerrorCode: ${result2[5]}\nisErrorResolved: ${result2[6]}`);

    let encodedData = instIncomeManager.methods.setPaymentReleaseResults(schIndex, actualPaymentTime, actualPaymentAmount,  errorCode).encodeABI();
    console.log('about to execute signTx()...');
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrIncomeManager, encodedData);
    console.log('TxResult', TxResult);

    const result3 = await instIncomeManager.methods.getIncomeSchedule(schIndex).call(); 
    console.log(`\n-------------==getIncomeSchedule(${schIndex}):\nThis schedule status: ${result3[4]} \nforecastedPayableTime: ${result3[0]}\nforecastedPayableAmount: ${result3[1]}\nactualPaymentTime: ${result3[2]} \nactualPaymentAmount: ${result3[3]}\nisApproved: ${result3[4]}\nerrorCode: ${result3[5]}\nisErrorResolved: ${result3[6]}`);

    resolve(true);
  });
}




const isScheduleGoodIMC = async (serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\ninside isScheduleGoodIMC(), serverTime:', serverTime, 'typeof', typeof serverTime);
    if(!Number.isInteger(serverTime)){
      console.log('[Error] serverTime should be an integer');
      return false;
    }
    //let payableTime = ia_time; 
    //let payableAmount = ia_Payable_Period_End;
    //'SELECT income_arrangement.ia_SYMBOL,income_arrangement.ia_time , income_arrangement.ia_Payable_Period_End From income_arrangement where income_arrangement.ia_time = ?'

    const queryStr1 = 'SELECT income_arrangement.ia_SYMBOL From income_arrangement where income_arrangement.ia_time <= ?';
    const symbolArray = await mysqlPoolQueryB(queryStr1, [serverTime]).catch((err) => {
      reject('[Error @ isScheduleGoodIMC: mysqlPoolQueryB(queryStr1)]: '+ err);
      return false;
    });
    const resultsLen = symbolArray.length;
    console.log('symbolArray length @ isScheduleGoodIMC', resultsLen);
    if (resultsLen > 0) {
      await sequentialRun(resultsLen, timeIntervalOfNewBlocks, serverTime, ['incomemanager']);
    }
    resolve(true);
  });
}

describe('Tests on IncomeManagerCtrt', () => {
  
  it('IncomeManagerCtrt functions test', async function() {
    this.timeout(9500);
    console.log('\n------------==Check IncomeManagerCtrt parameters');
    let forecastedPayableTime, forecastedPayableAmount, _index, forecastedPayableTimes, forecastedPayableAmounts, result, _errorCode;

    _index = 1;
    forecastedPayableTime = TimeOfDeployment_IM+1;
    forecastedPayableAmount = 3000;

    console.log('\n--------==Initial conditions');
    result = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, 0);

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule('+_index+'):', result);
    assert.equal(result[0], false);
    assert.equal(result[1], false);
    assert.equal(result[2], false);
    assert.equal(result[3], false);
    assert.equal(result[4], false);
    assert.equal(result[5], false);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease'+forecastedPayableTime+':', bool1);
    assert.equal(bool1, false);

    console.log('\n--------==Add a new pair of forecastedPayableTime, forecastedPayableAmount');
    await instIncomeManager.methods.addSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\nafter adding a new schedule...');
    result = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, 1);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, 1);

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    console.log('\n--------==imApprove()');
    await instIncomeManager.methods.imApprove(_index, true)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, true);


    console.log('\n--------==setPaymentReleaseResults');
    _paymentDate = forecastedPayableTime;
    _paymentAmount = forecastedPayableAmount;
    _errorCode = 0;
    await instIncomeManager.methods.setPaymentReleaseResults(_index, _paymentDate, _paymentAmount, _errorCode)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    //-----------------------==add 1 more pair
    _index = 2; forecastedPayableTime = 201906110000; forecastedPayableAmount = 3300;

    await instIncomeManager.methods.addSchedule(forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==after adding a new schedule...');
    result = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, _index);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex(forecastedPayableTime):', result);
    assert.equal(result, _index);

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex(forecastedPayableTime):', result);
    assert.equal(result, _index);

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('new getIncomeSchedule():', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], false);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);


    //-----------------------==add 3 more pairs
    console.log('\n--------==Add 3 more pairs of forecastedPayableTime, forecastedPayableAmount');
    //forecastedPayableTime = 201906110000;
    forecastedPayableTimes = [201908170000, 201911210000, 202002230000];
    forecastedPayableAmounts = [3700, 3800, 3900];

    result = await instIncomeManager.methods.getSchIndex(forecastedPayableTime).call();
    console.log('getSchIndex:', result);
    assert.equal(result, _index);

    result = await instIncomeManager.methods.schCindex().call();
    console.log('schCindex:', result);
    assert.equal(result, 2);


    await instIncomeManager.methods.addScheduleBatch(forecastedPayableTimes, forecastedPayableAmounts)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.schCindex().call();
    console.log('new schCindex:', result);
    assert.equal(result, 5);

    for(i = 0; i < forecastedPayableTimes.length; i++) {
      _index = i+3;
      result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
      console.log('\ngetIncomeSchedule(index='+_index+'):', result);
      forecastedPayableTime = forecastedPayableTimes[i];
      forecastedPayableAmount = forecastedPayableAmounts[i];
      assert.equal(result[0], forecastedPayableTime);
      assert.equal(result[1], forecastedPayableAmounts[i]);
      assert.equal(result[2], 0);
      assert.equal(result[3], 0);
      assert.equal(result[4], false);
      assert.equal(result[5], 0);
      assert.equal(result[6], false);
      
      bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
      console.log('isScheduleGoodForRelease:', bool1);
      assert.equal(bool1, false);
  
    }


    console.log('\n--------==imApprove()');
    await instIncomeManager.methods.imApprove(_index, true)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('getIncomeSchedule():', _index, forecastedPayableTime, forecastedPayableAmount, result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], 0);
    assert.equal(result[3], 0);
    assert.equal(result[4], true);
    assert.equal(result[5], 0);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, true);


    console.log('\n--------==setPaymentReleaseResults');
    _paymentDate = forecastedPayableTime+1;
    _paymentAmount = forecastedPayableAmount+1;
    _errorCode = 21;
    await instIncomeManager.methods.setPaymentReleaseResults(_index, _paymentDate, _paymentAmount, _errorCode)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], _errorCode);
    assert.equal(result[6], false);

    bool1 = await instIncomeManager.methods.isScheduleGoodForRelease(forecastedPayableTime).call();
    console.log('isScheduleGoodForRelease:', bool1);
    assert.equal(bool1, false);


    await instIncomeManager.methods.setErrResolution(_index, true)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    result = await instIncomeManager.methods.getIncomeSchedule(_index).call(); 
    console.log('\n--------==setErrResolution()', result);
    assert.equal(result[0], forecastedPayableTime);
    assert.equal(result[1], forecastedPayableAmount);
    assert.equal(result[2], _paymentDate);
    assert.equal(result[3], _paymentAmount);
    assert.equal(result[4], true);
    assert.equal(result[5], _errorCode);
    assert.equal(result[6], true);


    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 0; amount = 0;
    let scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);



    console.log('\n--------==editIncomeSchedule');
    _index = 2; forecastedPayableTime = 201906110222; forecastedPayableAmount = 4000;

    await instIncomeManager.methods.editIncomeSchedule(_index, forecastedPayableTime, forecastedPayableAmount)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 1; amount = 0;
    scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);


    console.log('\n--------==removeIncomeSchedule()');
    _index = 3; forecastedPayableTime = 201906110999;
    await instIncomeManager.methods.removeIncomeSchedule(_index)
    .send({ value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue });

    console.log('\n--------==getIncomeScheduleList()');
    indexStart = 1; amount = 0;
    scheduleList = await instIncomeManager.methods.getIncomeScheduleList(indexStart, amount).call(); 
    console.log('scheduleList', scheduleList);



  });
});

