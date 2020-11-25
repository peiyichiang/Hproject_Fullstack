
const {getTimeServerTime} = require('../../../timeserver/utilities')
/**
 * 
 */
 const Web3 = require('web3');
 const Tx = require('ethereumjs-tx');
 //const ethereumjs = require('ethereumjs-tx');
 //const ethereumNodeURL = "http://140.119.101.130:8545";
 //const web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeURL));
 //const {blockchainURL} = require('../../../timeserver/envVariables');
 //const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));
 //正式IP:203.66.73.79
 //const ethereumNodeURL = "http://203.66.73.79:8545";
 const ethereumNodeURL = "http://203.66.68.70:8545";
 const web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeURL));
 /*
console.log('web3.defaultAccount', web3.defaultAccount);
console.log(web3.version);
console.log(web3.currentProvider);

console.log('typeof ethereumjs:',               (typeof ethereumjs))
console.log('Object.keys(ethereumjs):',         Object.keys(ethereumjs))
console.log('typeof ethereumjs.Tx:',            (typeof ethereumjs.Tx))
*/
const AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
const AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
const AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
const AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
const AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
const AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a451";
//const AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
const AssetOwner4 = "0x076CEeEfEeAb5aFcB25A06ceeD321A779525AF32";
const AssetOwner4pkRaw = "0x4AD782774E82F31A2FBB4F3D7CF05898DD02913C89E4C19D73804554D5A4C11F";


const addrHCAT721 = "0x50f4C3aFBD8e5d97d4dd4817f897388f77011b6b";
const fromAssetbook = "0xdEc799A5912Ce621497BFD1Fe2C19f8e23307dbc";//addrAssetBook1
const toAssetbook = "0xDDFd2a061429D8c48Bc39E01bB815d4C4CA7Ab11";//addrAssetBook2
const amountStr = 3;
const priceStr = 10000;

let addrTo, addrFrom, addrToPk, addrFromPk;
let choiceFrom = 3, choiceTo = 2;

//get EOA credentials from platforms/browser/www/plugins/cordova-plugin-securekeystore/www/securekeystore.js

if(choiceFrom === 1){
  addrFrom = AssetOwner1;
  addrFromPk = AssetOwner1pkRaw;

} else if(choiceFrom === 2){
  addrFrom = AssetOwner2;
  addrFromPk = AssetOwner2pkRaw;

} else if(choiceFrom === 3){
  addrFrom = AssetOwner3;
  addrFromPk = AssetOwner3pkRaw;
}
else if(choiceFrom === 4){
  addrFrom = AssetOwner4;
  addrFromPk = AssetOwner4pkRaw;
}

if(choiceTo === 1){
  addrTo = AssetOwner1;
  addrToPk = AssetOwner1pkRaw;

} else if(choiceTo === 2){
  addrTo = AssetOwner2;
  addrToPk = AssetOwner2pkRaw;

} else if(choiceTo === 3){
  addrTo = AssetOwner3;
  addrToPk = AssetOwner3pkRaw;
}
else if(choiceTo === 4){
  addrTo = AssetOwner4;
  addrToPk = AssetOwner4pkRaw;
}

const checkBoolTrueArray = (item) => item;

//-------------------------------==
//-------------------------------==
const Helium = require('../../contracts/build/Helium.json');
if (Helium === undefined){
  console.log('[Error] Helium is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Helium is defined');
  if (Helium.abi === undefined){
    console.log('[Error] Helium.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.abi is defined');
      //console.log('Helium.abi:', Helium.abi);
  }
  if (Helium.bytecode === undefined || Helium.bytecode.length < 10){
    console.log('[Error] Helium.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Helium.bytecode is defined');
      //console.log('Helium.bytecode:', Helium.bytecode);
  }
  //console.log(Helium);
}

const AssetBook = require('../../contracts/build/AssetBook.json');
if (AssetBook === undefined){
  console.log('[Error] AssetBook is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] AssetBook is defined');
  if (AssetBook.abi === undefined){
    console.log('[Error] AssetBook.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] AssetBook.abi is defined');
      //console.log('AssetBook.abi:', AssetBook.abi);
  }
  if (AssetBook.bytecode === undefined || AssetBook.bytecode.length < 10){
    console.log('[Error] AssetBook.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] AssetBook.bytecode is defined');
      //console.log('AssetBook.bytecode:', AssetBook.bytecode);
  }
  //console.log(AssetBook);
}


const Registry = require('../../contracts/build/Registry.json');
if (Registry === undefined){
  console.log('[Error] Registry is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Registry is defined');
  if (Registry.abi === undefined){
    console.log('[Error] Registry.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Registry.abi is defined');
      //console.log('Registry.abi:', Registry.abi);
  }
  if (Registry.bytecode === undefined || Registry.bytecode.length < 10){
    console.log('[Error] Registry.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Registry.bytecode is defined');
      //console.log('Registry.bytecode:', Registry.bytecode);
  }
  //console.log(Registry);
}

const TokenController = require('../../contracts/build/TokenController.json');
if (TokenController === undefined){
  console.log('[Error] TokenController is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] TokenController is defined');
  if (TokenController.abi === undefined){
    console.log('[Error] TokenController.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TokenController.abi is defined');
      //console.log('TokenController.abi:', TokenController.abi);
  }
  if (TokenController.bytecode === undefined || TokenController.bytecode.length < 10){
    console.log('[Error] TokenController.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TokenController.bytecode is defined');
      //console.log('TokenController.bytecode:', TokenController.bytecode);
  }
  //console.log(TokenController);
}

const HCAT721 = require('../../contracts/build/HCAT721_AssetToken.json');
if (HCAT721 === undefined){
  console.log('[Error] HCAT721 is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] HCAT721 is defined');
  if (HCAT721.abi === undefined){
    console.log('[Error] HCAT721.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.abi is defined');
      //console.log('HCAT721.abi:', HCAT721.abi);
  }
  if (HCAT721.bytecode === undefined || HCAT721.bytecode.length < 10){
    console.log('[Error] HCAT721.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721.bytecode is defined');
      //console.log('HCAT721.bytecode:', HCAT721.bytecode);
  }
  //console.log(HCAT721);
}

const HCAT721_Test = '';
/*
const HCAT721_Test = require('./build/HCAT721_AssetToken_Test.json');
if (HCAT721_Test === undefined) {
  console.log('[Error] HCAT721_Test is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] HCAT721_Test is defined');
  if (HCAT721_Test.abi === undefined) {
    console.log('[Error] HCAT721_Test.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721_Test.abi is defined');
    //console.log('HCAT721_Test.abi:', HCAT721_Test.abi);
  }
  if (HCAT721_Test.bytecode === undefined || HCAT721_Test.bytecode.length < 10) {
    console.log('[Error] HCAT721_Test.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] HCAT721_Test.bytecode is defined');
    //console.log('HCAT721_Test.bytecode:', HCAT721_Test.bytecode);
  }
  //console.log(HCAT721_Test);
}*/

const CrowdFunding = require('../../contracts/build/CrowdFunding.json');
if (CrowdFunding === undefined){
  console.log('[Error] CrowdFunding is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] CrowdFunding is defined');
  if (CrowdFunding.abi === undefined){
    console.log('[Error] CrowdFunding.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] CrowdFunding.abi is defined');
      //console.log('CrowdFunding.abi:', CrowdFunding.abi);
  }
  if (CrowdFunding.bytecode === undefined || CrowdFunding.bytecode.length < 10){
    console.log('[Error] CrowdFunding.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] CrowdFunding.bytecode is defined');
      //console.log('CrowdFunding.bytecode:', CrowdFunding.bytecode);
  }
  //console.log(CrowdFunding);
}

const IncomeManager = require('../../contracts/build/IncomeManagerCtrt.json');
if (IncomeManager === undefined){
  console.log('[Error] IncomeManager is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] IncomeManager is defined');
  if (IncomeManager.abi === undefined){
    console.log('[Error] IncomeManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManager.abi is defined');
      //console.log('IncomeManager.abi:', IncomeManager.abi);
  }
  if (IncomeManager.bytecode === undefined || IncomeManager.bytecode.length < 10){
    console.log('[Error] IncomeManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManager.bytecode is defined');
      //console.log('IncomeManager.bytecode:', IncomeManager.bytecode);
  }
  //console.log(IncomeManager);
}

const ProductManager = require('../../contracts/build/ProductManager.json');
if (ProductManager === undefined){
  console.log('[Error] ProductManager is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] ProductManager is defined');
  if (ProductManager.abi === undefined){
    console.log('[Error] ProductManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ProductManager.abi is defined');
      //console.log('ProductManager.abi:', ProductManager.abi);
  }
  if (ProductManager.bytecode === undefined || ProductManager.bytecode.length < 10){
    console.log('[Error] ProductManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] ProductManager.bytecode is defined');
      //console.log('ProductManager.bytecode:', ProductManager.bytecode);
  }
  //console.log(ProductManager);
}

/*const TestCtrt = require('../../contracts/build/TestCtrt.json');
if (TestCtrt === undefined){
  console.log('[Error] TestCtrt is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] TestCtrt is defined');
  if (TestCtrt.abi === undefined){
    console.log('[Error] TestCtrt.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TestCtrt.abi is defined');
      //console.log('TestCtrt.abi:', TestCtrt.abi);
  }
  if (TestCtrt.bytecode === undefined || TestCtrt.bytecode.length < 10){
    console.log('[Error] TestCtrt.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] TestCtrt.bytecode is defined');
      //console.log('TestCtrt.bytecode:', TestCtrt.bytecode);
  }
  //console.log(TestCtrt);
}*/

/**
 * get the function names for getting acctAddr and accPrivatekey
 */

const getAccounts = () => {
  return new Promise( async ( resolve, reject ) => {
    const accounts = await web3.eth.getAccounts();//console.log
    console.log('web3.eth.getAccount', accounts);
    resolve(accounts);
  });
}
getAccounts();

//----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
const checkSafeTransferFromBatch = async(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime) => {
  return new Promise( async ( resolve, reject ) => {

    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);

    const result = await instAssetBookFrom.methods.checkSafeTransferFromBatch(assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).call({from: addrFrom});
    console.log('\ncheckSafeTransferFromBatch result', result);

    const boolArray = result[0];
    let mesg;
    if(boolArray.every(checkBoolTrueArray)){
      mesg = '[Success] all checks have passed';
      console.log(mesg);
      resolve(mesg);

    } else {
      if(!boolArray[0]){
        mesg += ', fromAddr has no contract';
      } else if(!boolArray[1]){
        mesg += ', toAddr has no contract';
      } else if(!boolArray[2]){
        mesg += ', toAddr has no onERC721Received()';
      } else if(!boolArray[3]){
        mesg += ', amount =< 0';
      } else if(!boolArray[4]){
        mesg += ', price =< 0';
      } else if(!boolArray[5]){
        mesg += ', fromAddr is the same as toAddr';
      } else if(!boolArray[6]){
        mesg += ', serverTime <= TimeOfDeployment';
      } else if(!boolArray[7]){
        mesg += ', TokenController not approved/not operational';
      } else if(!boolArray[8]){
        mesg += ', Registry approved toAddr';
      } else if(!boolArray[9]){
        mesg += ', Registry approved fromAddr';
      } else if(!boolArray[10]){
        mesg += ', balance of fromAddr < amount';
      } else if(!boolArray[11]){
        mesg += ', allowed amount from _from to caller';
      } else if(!result[1]){
        mesg += ', assetAddr does not have contract';
      } else if(!result[2]){
        mesg += ', caller is not the assetOwner';
      }
      if(mesg.substring(0,2) === ', '){
        mesg = mesg.substring(2);
      }
      console.log(mesg);
      resolve(mesg);
    }
  });
}


/**
 * Frontend makes API calls at '/HCAT721_AssetTokenContract/:nftSymbol' to get symbol XYZ's contract addresses
 * 
 * @param {*} addrHCAT721  the address of the HCAT721 smart contract
 * @param {*} fromAssetbook  the assetbook contract address from which the transfer deduct amount
 * @param {*} toAssetbook  the assetbook contract address to which the transfer will add amount
 * @param {*} amountStr  amount of this transfer
 * @param {*} priceStr  price associated with this transfer
 * @param {*} addrFrom  EOA that controls the assetbook
 * @param {*} addrFromPk  EOA private key of the above EOA
 */
const transferTokens = async (addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, addrFrom, addrFromPk ) => {
  return new Promise( async ( resolve, reject ) => {
    console.log('entering transferTokens()');

    let mesg;
    const serverTimeStr = await getTimeServerTime();;// only used for emitting events in the blockchain
    const addrZero = "0x0000000000000000000000000000000000000000";

    // const addrFrom = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
    // const addrFromPk = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";


    if (!Number.isInteger(amountStr) || !Number.isInteger(priceStr) || !Number.isInteger(serverTimeStr)){
      mesg = 'input values should be integers';
      console.log(`mesg, amount: ${amountStr}, price: ${priceStr}, serverTime: ${serverTimeStr}`);
      reject(mesg);
      return;
    }

    const amount = parseInt(amountStr);
    const price = parseInt(priceStr);
    const serverTime = parseInt(serverTimeStr);
    if(amountStr < 1 || price < 1 || serverTime < 201905281000){
      mesg = 'input values should be > 0 or 201905281000';
      console.log(`mesg, amount: ${amount}, price: ${price}, serverTime: ${serverTime}`);
      reject(mesg);
      return;
    }
    console.log('after checking amount and price values');

    const instHCAT721 = new web3.eth.Contract(HCAT721.abi, addrHCAT721);
    const instAssetBookFrom = new web3.eth.Contract(AssetBook.abi, fromAssetbook);
    console.log('after contract instances');


    console.log('fromAssetbook', fromAssetbook);
    const balanceFromB4Str = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToB4Str = await instHCAT721.methods.balanceOf(toAssetbook).call();
    const balanceFromB4 = parseInt(balanceFromB4Str);
    const balanceToB4 = parseInt(balanceToB4Str);
    console.log('balanceFromB4', balanceFromB4, 'balanceToB4', balanceToB4);

    //----------==assetOwner to call his Assetbook contract. Not HCAT721 contract directly!!!
    try {
      const encodedData = instAssetBookFrom.methods.safeTransferFromBatch(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime).encodeABI();

      let TxResult = await signTx(addrFrom, addrFromPk, fromAssetbook, encodedData);
      console.log('TxResult', TxResult);

    } catch (error) {
      console.log("error:" + error);
      const result = checkSafeTransferFromBatch(0, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime);
      reject(result);
      return;
    }

    const balanceFromAfter = await instHCAT721.methods.balanceOf(fromAssetbook).call();
    const balanceToAfter = await instHCAT721.methods.balanceOf(toAssetbook).call();
    console.log(`balanceFromB4: ${balanceFromB4}
    balanceFromAfter: ${balanceFromAfter}

    balanceToB4: ${balanceToB4}
    balanceToAfter:   ${balanceToAfter}
    `);

    resolve(true);
    //call /HCAT721_AssetTokenContract/safeTransferFromBatch API to record txn info
  });
}


//----------------------------==Assetbook contract
const get_assetOwner = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==assetOwner()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.assetOwner().call();
    resolve(result);
  });
}

const get_lastLoginTime = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==lastLoginTime()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.lastLoginTime().call();
    resolve(result);
  });
}

const checkIsContract = async(addrAssetBook, assetAddr) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==checkIsContract()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = await instAssetBook.methods.checkIsContract(assetAddr).call();
    resolve(result);
  });
}

const addLoginTime = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==addLoginTime()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.addLoginTime().encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() addLoginTime()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}


const assetOwnerVote = async(addrAssetBook, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==assetOwnerVote()');
    console.log(`serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.assetOwnerVote(serverTime).encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() assetOwnerVote()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}

const endorserVote = async(addrAssetBook, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==endorserVote()');
    console.log(`addrAssetBook: ${addrAssetBook}, serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.endorserVote(serverTime).encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() endorserVote()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}

const setAntiPlatformOverrideDays = async(addrAssetBook, _antiSystemOverrideDays) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==setAntiPlatformOverrideDays()');
    console.log(`addrAssetBook: ${addrAssetBook}, _antiSystemOverrideDays: ${_antiSystemOverrideDays}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.setAntiPlatformOverrideDays(_antiSystemOverrideDays).encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() setAntiPlatformOverrideDays()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}


const resetVoteStatus = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==resetVoteStatus()');
    console.log(`addrAssetBook: ${addrAssetBook}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.resetVoteStatus().encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData);
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}

const addEndorser = async(addrAssetBook, newEndorser, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==addEndorser()');
    console.log(`newEndorser: ${newEndorser}, serverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.addEndorser( newEndorser, serverTime).encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() addEndorser()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}

const changeEndorser = async(addrAssetBook, oldEndorser, newEndorser, serverTime) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==changeEndorser()');
    console.log(`oldEndorser: ${oldEndorser} \nnewEndorser: ${newEndorser} \nserverTime: ${serverTime}`);
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const encodedData = instAssetBook.methods.changeEndorser(oldEndorser, newEndorser, serverTime).encodeABI();
    let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData).catch((err) => {
      reject('[Error @ signTx() changeEndorser()]', err);
      return false;
    });
    console.log('\nTxResult', TxResult);
    resolve(true);
  });
}

const changeAssetOwner = async(addrAssetBook,  _assetOwnerNew, serverTime) => {
  return new Promise(async (resolve, reject) => {
    try{
      console.log('\n-------==changeAssetOwner()');
      console.log(`serverTime: ${serverTime}`);
      //web3.eth.getBlockNumber().then(console.log);
      const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
      const encodedData = instAssetBook.methods.changeAssetOwner( _assetOwnerNew, serverTime).encodeABI();
      let TxResult = await signTx(addrFrom, addrFromPk, addrAssetBook, encodedData);
      console.log('\nTxResult', TxResult);
      resolve(true);
    } catch (err) {
      console.log('changeAssetOwner error =====>', err)
    }
  }).catch(err => console.log(err));
}


const getAssetbookDetails = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==getAssetbookDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = await instAssetBook.methods.assetOwner().call();
    result[1] = await instAssetBook.methods.addrHeliumContract().call();
    result[2] = await instAssetBook.methods.lastLoginTime().call();
    result[3] = await instAssetBook.methods.antiPlatformOverrideDays().call();
    result[4] = await instAssetBook.methods.checkAssetOwner().call();
    result[5] = await instAssetBook.methods.checkCustomerService().call();

    result[6] = await instAssetBook.methods.assetOwner_flag().call();
    result[7] = await instAssetBook.methods.HeliumContract_flag().call();
    result[8] = await instAssetBook.methods.endorsers_flag().call();
    result[9] = await instAssetBook.methods.calculateVotes().call();
    result[10] = await instAssetBook.methods.endorserCount().call();
    console.log('\nresult:', result);
    resolve(result);
  });
}


const getVotingDetails = async(addrAssetBook) => {
  return new Promise(async (resolve, reject) => {
    console.log('\n-------==getVotingDetails()');
    const instAssetBook = new web3.eth.Contract(AssetBook.abi, addrAssetBook);
    const result = [0, 0, 0, 0, 0, 0, 0, 0];
    result[0] = await instAssetBook.methods.assetOwner_flag().call();
    result[1] = await instAssetBook.methods.HeliumContract_flag().call();
    result[2] = await instAssetBook.methods.endorsers_flag().call();
    result[3] = await instAssetBook.methods.calculateVotes().call();
    result[4] = await instAssetBook.methods.lastLoginTime().call();
    result[5] = await instAssetBook.methods.antiPlatformOverrideDays().call();
    result[6] = await instAssetBook.methods.checkNowTime().call();
    result[7] = await instAssetBook.methods.isAblePlatformOverride().call();
    resolve(result);
  });
}


//---------------------------------==
/**
 * @param {*} userEthAddr 
 * @param {*} userRawPrivateKey 
 * @param {*} contractAddr 
 * @param {*} encodedData 
 */
/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              console.log(userPrivateKey);
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: 9000000,
                  gasPrice: 0,
                  //gasPrice: web3js.utils.toHex(20 * 1e9),
                  //gasLimit: web3.utils.toHex(3400000),
                  to: contractAddr,
                  value: 0,
                  data: encodedData
              }

              //let tx = new ethereumjs.Tx(txParams);//with min version
              //let tx = new Tx(txParams);//with require()
              let tx = new Tx(txParams);//with require()
              tx.sign(userPrivateKey);
              const serializedTx = tx.serialize();
              const rawTx = '0x' + serializedTx.toString('hex');

              //console.log('☆ RAW TX ☆\n', rawTx);

              web3.eth.sendSignedTransaction(rawTx)
                  .on('transactionHash', hash => {
                      console.log(hash);
                  })
                  .on('confirmation', (confirmationNumber, receipt) => {
                      console.log('confirmation', confirmationNumber);
                  })
                  .on('receipt', function (receipt) {
                      console.log(receipt);
                      resolve(receipt)
                  })
                  .on('error', function (err) {
                      console.log(err);
                      reject(err);
                  })
          })

  })
}

module.exports = { transferTokens, checkSafeTransferFromBatch, addLoginTime, checkIsContract, assetOwnerVote, endorserVote, setAntiPlatformOverrideDays, resetVoteStatus, changeAssetOwner, getAssetbookDetails, addEndorser, changeEndorser, getVotingDetails, get_assetOwner, get_lastLoginTime };

// console.log('here @ zFrontend.js');
//   if (typeof web3 !== 'undefined') {
//       console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
//       web3 = new Web3(web3.currentProvider);
//   } else {
//       console.log('No Web3 Detected... using HTTP Provider');
//       web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
//       //window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/<APIKEY>"));
//   }


// window.addEventListener('load', function () {
//   if (typeof web3 !== 'undefined') {
//       console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
//       window.web3 = new Web3(web3.currentProvider);
//   } else {
//       console.log('No Web3 Detected... using HTTP Provider')
//       window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/<APIKEY>"));
//   }
// });

//const { securekeystore } = require('../../plugins/cordova-plugin-securekeystore/www/securekeystore');
// securekeystore.createKey(keyName, password, (err, account)=>{
//   console.log('err', err, 'account', account);
// });
// securekeystore.getKey(keyName, password, callback);

/*
const account = web3.eth.accounts.create();
console.log('account', account);
const accAddr = account.address;
const accPrivateKey = account.privateKey;
//process.exit(0);
*/
