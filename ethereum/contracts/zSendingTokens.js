const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const transferTokens = async (addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, _fromAssetOwner, _fromAssetOwnerpkRaw ) => {

  // const _fromAssetOwner = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
  // const _fromAssetOwnerpkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";

  let mesg;
  const serverTimeStr = 201905281400;// should be acquired from backend

  if (!Number.isInteger(amountStr) || !Number.isInteger(priceStr) || !Number.isInteger(serverTimeStr)){
    mesg = 'input values should be integers';
    console.log(`mesg, amount: ${amountStr}, price: ${priceStr}, serverTime: ${serverTimeStr}`);
  }

  const amount = parseInt(amountStr);
  const price = parseInt(priceStr);
  const serverTime = parseInt(serverTimeStr);
  if(amountStr < 1 || price < 1 || serverTime < 201905281000){
    mesg = 'input values should be > 0 or 201905281000';
    console.log(`mesg, amount: ${amount}, price: ${price}, serverTime: ${serverTime}`);
  }


  //const instTokenController = new web3.eth.Contract(tokenControllerContract.abi, tokenControllerAddr);
  //    isTokenApprovedOperational = await instTokenController.methods.isTokenApprovedOperational().call();

  const instHCAT721 = new web3.eth.Contract(HCAT721_AssetTokenContract.abi, addrHCAT721);
  const instAssetBookFrom = new web3.eth.Contract(assetBookContract.abi, fromAssetbook);

  const balanceFromB4Str = await instHCAT721.methods.balanceOf(fromAssetbook).call();
  const balanceToB4Str = await instHCAT721.methods.balanceOf(toAssetbook).call();
  const balanceFromB4 = parseInt(balanceFromB4Str);
  const balanceToB4 = parseInt(balanceToB4Str);

  const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, addrHCAT721, addrZero, toAssetbook, amount, price, serverTime).encodeABI();
  //safeTransferFromBatch(address fromAssetbook, address toAssetbook, uint amount, uint price, uint serverTime) ... 

  try {
      let TxResult = await signTx(_fromAssetOwner, _fromAssetOwnerpkRaw, fromAssetbook, encodedData);

    } catch (error) {
      console.log("error:" + error);
      const revertReason = await instAssetBookFrom.methods.checkSafeTransferFromBatch(0, addrHCAT721, addrZero, toAssetbook, amount, price, serverTime).call({from: _fromAssetOwner});
      console.log('\ncheckSafeTransferFromBatch result', revertReason);
  }
  const balanceFromAfter = await instHCAT721.methods.balanceOf(fromAssetbook).call();
  const balanceToAfter = await instHCAT721.methods.balanceOf(toAssetbook).call();
  console.log(`balanceFromB4: ${balanceFromB4}
  balanceFromAfter: ${balanceFromAfter}

  balanceToB4: ${balanceToB4}
  balanceToAfter:   ${balanceToAfter}
  `);

  //call /HCAT721_AssetTokenContract/safeTransferFromBatch API to record txn info
}