  //----------------==Send tokens after valid time
  console.log('\n------------==Send tokens after valid date');
  timeCurrent = TimeTokenValid;
  await instTokenController.methods.setTimeCurrent(timeCurrent)
  .send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
  isUnlockedValid = await instTokenController.methods.isUnlockedValid().call(); 
  checkEq(isUnlockedValid, false);

  amount = 1;
  error = false;
  try {
    if (txnNum===1) {
      fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; to = addrAssetBook1;
      encodedData = instAssetBookFrom.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
      signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

    } else { to = addrAssetBook1;
      await instAssetBookFrom.methods.transferAssetBatch(assetAddr, amount, to)
      .send({ value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
      error = true;
    }
  } catch (err) {
    console.log('[Success] sending 1 token from assetCtrt2 to assetCtrt1 failed because of not meeting the condition: timeCurrent > TimeTokenValid', timeCurrent, TimeTokenValid);
    //assert(err);
  }
  if (error) {
    console.log("\x1b[31m", '[Error] Why did not this fail???', error);
    process.exit(1);
  }

//----------------------==
const  = async (a1) => {
  //-----------------==Send Tokens in batch
  console.log('\n------------==Send tokens in batch: amount = 3 from AssetBook1 to AssetBook2');
  console.log('sending tokens via transferAssetBatch()...');

  amount = 3;
  if (txnNum===1) {
    fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1; to = addrAssetBook2;
    encodedData = instAssetBook1.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

  } else { to = addrAssetBook2;
    await instAssetBook1.methods.transferAssetBatch(assetAddr, amount, to)
    .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  //transferAssetBatch(assetAddr, amount, to)
  }
  console.log('transferAssetBatch is finished');

  if (txnNum===1) {
    fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1;
    encodedData = instAssetBook1.methods.fixTimeIndexedIds(assetAddr, amount).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

  } else {
    await instAssetBook1.methods.fixTimeIndexedIds(assetAddr, amount)
    .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
    //transferAssetBatch(assetAddr, amount, to)
  }
  console.log('Check AssetBook1 after txn...');
  assetbook1M = await instAssetBook1.methods.getAsset(assetAddr).call();
  console.log('getAsset(assetbook1M):', assetbook1M);
  checkEq(assetbook1M[2], (amountInitAB1+2).toString());//amount
  //checkEq(assetbook1M[3], '3');//timeIndexStart
  //checkEq(assetbook1M[4], '4');//timeIndexEnd
  console.log("\x1b[33m", 'CHECK timeIndex start and end');

  // return (asset.assetSymbol, asset.assetAddrIndex, 
  //   asset.assetAmount, asset.timeIndexStart, 
  //   asset.timeIndexEnd, asset.isInitialized);
  //   asset.ids, erc721.get_ownerToIds(address(this)));

  console.log('AssetBook2 to receive tokens...');
  if (txnNum===1) {
    fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2;
    encodedData = instAssetBook2.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
    signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

  } else {
    await instAssetBook2.methods.updateReceivedAsset(assetAddr) 
    .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
  }
  assetbook2M = await instAssetBook2.methods.getAsset(assetAddr).call();
  console.log('getAsset(assetbook2M):', assetbook2M);
  checkEq(assetbook2M[2], (amountInitAB2+5).toString());//amount
  //checkEq(assetbook2M[3], '1');//timeIndexStart
  //checkEq(assetbook2M[4], '4');//timeIndexEnd
  console.log("\x1b[33m", 'CHECK timeIndex start and end');

}


//-------------------------==Send tokens: Sending one token
console.log('\n------------==Send tokens: sending one token: amount = 1 from AssetBook2 to AssetBook1');

console.log('Setting timeCurrent to TimeTokenUnlock+1 ...');
timeCurrent = TimeTokenUnlock+1;
await instTokenController.methods.setTimeCurrent(timeCurrent)
.send({ value: '0', from: Backend, gas: gasLimitValue, gasPrice: gasPriceValue });
bool1 = await instTokenController.methods.isUnlockedValid().call(); 
checkEq(bool1, true);
console.log('isUnlockedValid is true => ready to send tokens');

console.log('\nsending tokens via transferAssetBatch()...');
amount = 1; 
if (txnNum===1) {
  fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2; to = addrAssetBook1;
  encodedData = instAssetBook2.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else {
  await instAssetBook2.methods.transferAssetBatch(assetAddr, amount, to)
  .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });//transferAssetBatch(assetAddr, amount, to)
}
console.log('transferAssetBatch is finished');

//Part of the transferAssetBatch code makes this function too big to run/compile!!! So fixTimeIndexedIds() must be run after calling transferAssetBatch()!!!
console.log('\nCalling fixTimeIndexedIds()...');
if (txnNum===1) {
  fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2;
  encodedData = instAssetBook2.methods.fixTimeIndexedIds(assetAddr, amount).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else {
  await instAssetBook2.methods.fixTimeIndexedIds(assetAddr, amount)
  .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });//transferAssetBatch(assetAddr, amount, to)
}

console.log('Check AssetBook2 after txn...');
assetbook2M = await instAssetBook2.methods.getAsset(assetAddr).call();
console.log('getAsset(assetbook2M):', assetbook2M);
checkEq(assetbook2M[2], (amountInitAB2+2).toString());//amount
//checkEq(assetbook2M[3], 1);//timeIndexStart
//checkEq(assetbook2M[4], 2);//timeIndexEnd
console.log("\x1b[33m", 'CHECK timeIndex start and end');

// return (asset.assetSymbol, asset.assetAddrIndex, 
//   asset.assetAmount, asset.timeIndexStart, 
//   asset.timeIndexEnd, asset.isInitialized);
//   asset.ids, erc721.get_ownerToIds(address(this)));

console.log('AssetBook1 to receive tokens...');
if (txnNum===1) {
  fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1;
  encodedData = instAssetBook1.methods.updateReceivedAsset(assetAddr).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else {
  await instAssetBook1.methods.updateReceivedAsset(assetAddr) 
  .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
}
assetbook1M = await instAssetBook1.methods.getAsset(assetAddr).call();
console.log('getAsset(assetbook1M):', assetbook1M);
checkEq(assetbook1M[2], ''+(amountInitAB1+5));//amount
//checkEq(assetbook1M[3], 0);//timeIndexStart
//checkEq(assetbook1M[4], 4);//timeIndexEnd
console.log("\x1b[33m", 'CHECK timeIndex start and end');


//-----------------==Send Tokens in batch
console.log('\n------------==Send tokens in batch: amount = 3 from AssetBook1 to AssetBook2');
console.log('sending tokens via transferAssetBatch()...');

amount = 3;
if (txnNum===1) {
  fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1; to = addrAssetBook2;
  encodedData = instAssetBook1.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else { to = addrAssetBook2;
  await instAssetBook1.methods.transferAssetBatch(assetAddr, amount, to)
  .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
//transferAssetBatch(assetAddr, amount, to)
}
console.log('transferAssetBatch is finished');

if (txnNum===1) {
  fromAddr = AssetOwner1; privateKey = AssetOwner1pk; ctrtAddr = addrAssetBook1;
  encodedData = instAssetBook1.methods.fixTimeIndexedIds(assetAddr, amount).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else {
  await instAssetBook1.methods.fixTimeIndexedIds(assetAddr, amount)
  .send({value: '0', from: fromAddr, gas: gasLimitValue, gasPrice: gasPriceValue });
  //transferAssetBatch(assetAddr, amount, to)
}
console.log('Check AssetBook1 after txn...');
assetbook1M = await instAssetBook1.methods.getAsset(assetAddr).call();
console.log('getAsset(assetbook1M):', assetbook1M);
checkEq(assetbook1M[2], (amountInitAB1+2).toString());//amount
//checkEq(assetbook1M[3], '3');//timeIndexStart
//checkEq(assetbook1M[4], '4');//timeIndexEnd
console.log("\x1b[33m", 'CHECK timeIndex start and end');

// return (asset.assetSymbol, asset.assetAddrIndex, 
//   asset.assetAmount, asset.timeIndexStart, 
//   asset.timeIndexEnd, asset.isInitialized);
//   asset.ids, erc721.get_ownerToIds(address(this)));

console.log('AssetBook2 to receive tokens...');
if (txnNum===1) {
  fromAddr = AssetOwner2; privateKey = AssetOwner2pk; ctrtAddr = addrAssetBook2;
  encodedData = instAssetBook2.methods.transferAssetBatch(assetAddr, amount, to).encodeABI();
  signTxn(fromAddr, ctrtAddr, encodedData, privateKey);

} else {
  await instAssetBook2.methods.updateReceivedAsset(assetAddr) 
  .send({value: '0', from: AssetOwner2, gas: gasLimitValue, gasPrice: gasPriceValue });
}
assetbook2M = await instAssetBook2.methods.getAsset(assetAddr).call();
console.log('getAsset(assetbook2M):', assetbook2M);
checkEq(assetbook2M[2], (amountInitAB2+5).toString());//amount
//checkEq(assetbook2M[3], '1');//timeIndexStart
//checkEq(assetbook2M[4], '4');//timeIndexEnd
console.log("\x1b[33m", 'CHECK timeIndex start and end');


*/
  //-------------==
