const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");

const { addrHelium, addrRegistry, addrProductManager, blockchainURL, admin, adminpkRaw, gasLimitValue, gasPriceValue, isTimeserverON, operationMode, backendAddrChoice} = require('../timeserver/envVariables');

const prefix = '0x';
const addrTest1 = '0xe538922EcF3c35e18DE5fF0EB1A753A1c14C5155';

const web3 = new Web3(new Web3.providers.HttpProvider(blockchainURL));

console.log('--------------------== miniblockchain.js...');

const eoa1 = '0x19ab366e28a53db44bda156a3cbf055c4a807244';
const eoa1pk = '0xef33e5ae9441ad643fe0194e0e96505fa66646aefe25be8dbca208df800ea701';
const eoa2 = '0x82f1063f316bd260b222764b8b3ccb74cb59b6eb';
const eoa2pk = '0xc038bd499de1d5ca13390ce4573cfade55cdd79e835b091190f26decaa03d813';
const eoa3 = '0xbb257ad047b2ee2544ca56b1a7915e2ae218c997';
const eoa3pk = '0x81b93a442e5f03011d7baa8a8641ec8deb8d188e442d76f980c7e9c6ad2180de';
const eoa4 = '0x92832a12a6526de8663988569aecd9d6071b4306';
const eoa4pk = '0x7bfd108fab791991e9848dd1f3305f460d6063cef9c0d7097deb2fee117bd38e';
const eoaArray = [eoa1, eoa2, eoa3, eoa4];
const eoapkArray = [eoa1pk, eoa2pk, eoa3pk, eoa4pk];



//----------------------==
const Test1 = require('../ethereum/contracts/build/Test1.json');
if (Test1 === undefined){
  console.log('[Error] Test1 is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] Test1 is defined');
  if (Test1.abi === undefined){
    console.log('[Error] Test1.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Test1.abi is defined');
      //console.log('Test1.abi:', Test1.abi);
  }
  if (Test1.bytecode === undefined || Test1.bytecode.length < 10){
    console.log('[Error] Test1.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] Test1.bytecode is defined');
      //console.log('Test1.bytecode:', Test1.bytecode);
  }
  //console.log(Test1);
}

//yarn run testmt -f 204
const deployCtrt1 = async() => {
  return new Promise(async (resolve, reject) => {
    console.log(`\n----------------== inside deployTest1() \nbackendAddr: ${backendAddr} \nblockchainURL: ${blockchainURL}`);
    const backendAddrpkBuffer = Buffer.from(backendAddrpkRaw.substr(2), 'hex');
    const provider = new PrivateKeyProvider(backendAddrpkBuffer, blockchainURL);
    const web3deploy = new Web3(provider);
    console.log('web3deploy.version:', web3deploy.version);

    const argsTest1 = '';
    const isGoodArgument = true;
    if(isGoodArgument){
      console.log('\nDeploying Test1 contract...');
      let instTest1;
      try{
        instTest1 =  await new web3deploy.eth.Contract(Test1.abi)
        .deploy({ data: prefix+Test1.bytecode, arguments: argsTest1 })
        .send({ from: backendAddr, gas: gasLimitValue, gasPrice: gasPriceValue })
        .on('receipt', function (receipt) {
          console.log('receipt:', receipt);
        })
        .on('error', function (error) {
            reject('error:', error.toString());
            return false;
        });
      } catch(err){
        console.log('err:', err);
      }
  
      console.log('Test1.sol has been deployed');
      if (instTest1 === undefined) {
        reject('[Error] instTest1 is NOT defined');
        return false;
      } else {
        console.log('[Good] instTest1 is defined');
  
        instTest1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
        const addrTest1Contract = instTest1.options.address;
        console.log(`\nconst addrTest1= ${addrTest1Contract}`);
        resolve({isGood: true, addrTest1Contract });

      }
    } else {
      console.log('isGoodArgument is false');
      resolve({isGood: false, addrTest1Contract: undefined});
    }
  });
}
//yarn run testmt -f 205
const Test1ReadValues = async() => {
  return new Promise(async (resolve, reject) => {
    const instTest1 = new web3.eth.Contract(Test1.abi, addrTest1);
    const assetOwner= await instTest1.methods.assetOwner().call();
    const userCount= await instTest1.methods.userCount().call();
    console.log('assetOwner:',assetOwner, ', userCount:', userCount);
    resolve({assetOwner, userCount});
  });
}
//yarn run testmt -f 206
const Test1GetAccountDetail = async() => {
  return new Promise(async (resolve, reject) => {
    const userIndex = 3;

    const backendAddr = eoaArray[userIndex];
    const backendAddrpkRaw = eoapkArray[userIndex];
    
    const instTest1 = new web3.eth.Contract(Test1.abi, addrTest1);

    const accountDetail1= await instTest1.methods.accounts(backendAddr).call();
    console.log('\nuserIndex:', userIndex, '\nbackendAddr:', backendAddr, '\naccountDetail1:', accountDetail1);

    const encodedData = instTest1.methods.addUser(backendAddr).encodeABI();
    let TxResult = await signTx(backendAddr, backendAddrpkRaw, addrTest1, encodedData);
    console.log('\nTxResult', TxResult);

    const accountDetail2 = await instTest1.methods.accounts(backendAddr).call();
    console.log('\naccountDetail2:', accountDetail2);
    resolve({accountDetail2});
  });
}


//--------------------------==
/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
  return new Promise((resolve, reject) => {

      web3.eth.getTransactionCount(userEthAddr, 'pending')
          .then(nonce => {

              let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
              let txParams = {
                  nonce: web3.utils.toHex(nonce),
                  gas: gasLimitValue,//9000000,
                  gasPrice: gasPriceValue,//0,
                  //gasPrice: web3js.utils.toHex(20 * 1e9),
                  //gasLimit: web3.utils.toHex(3400000),
                  to: contractAddr,
                  value: 0,
                  data: encodedData
              }

              let tx = new Tx(txParams);
              tx.sign(userPrivateKey);
              const serializedTx = tx.serialize();
              const rawTx = '0x' + serializedTx.toString('hex');

              //console.log('☆ RAW TX ☆\n', rawTx);

              web3.eth.sendSignedTransaction(rawTx)
                  .on('transactionHash', hash => {
                      //console.log(hash);
                  })
                  .on('confirmation', (confirmationNumber, receipt) => {
                      // //console.log('confirmation', confirmationNumber);
                  })
                  .on('receipt', function (receipt) {
                      //console.log(receipt);
                      resolve(receipt)
                  })
                  .on('error', function (err) {
                      //console.log(err);
                      reject(err);
                  });
          });

  });
}


module.exports = { deployCtrt1, Test1ReadValues, Test1GetAccountDetail }