const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');
var router = express.Router();

// const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/v3/b789f67c3ef041a8ade1433c4b33de0f"));
//const web3js = new Web3("http://localhost:8545");
//const web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//In some functions at web3 you need websocket provider for web3 so you need to change the line 8 with this line when needed.
//web3 = new web3(new web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));

var fromAddr = '0xF694dCbec7f434dE9F892cfACF0449DB8661334D';
var privateKey = Buffer.from('4876D3D70D277FCC92E2E6A095CDBE1F9D56BD9C7092911398524D3C866DA780', 'hex');
var ctrtAddr ="0x844F88dd745c5f4069184C7EEA40Cae44Dd9826d";


//contract abi is the array that you can get from the ethereum wallet or etherscan
var contractABI = [{"constant":true,"inputs":[{"name":"_interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"_name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCtrtDetails","outputs":[{"name":"","type":"bool"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_approved","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"addNewOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"IRR20yrx100","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxTotalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"LockUpPeriod","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"get_lockupUntil","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"burnNFT","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newDirector","type":"address"}],"name":"setNewDirector","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ValidDate","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"getNFT","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"director","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupplyValidToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"_owner","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pricingCurrency","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nextTokenId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"get_ownerToIds","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chairman","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"siteSizeInKW","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newAdmin","type":"address"}],"name":"setNewAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get_now","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"_symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_uri","type":"string"}],"name":"mintSerialNFT","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newChairman","type":"address"}],"name":"setNewChairman","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenMintTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialAssetPricing","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"SafeVaultNew","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newMgr","type":"address"}],"name":"setNewManager","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isPreDelivery","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"get_idToOwnerIndexPlus1","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"SafeVault","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerNew","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_nftName","type":"string"},{"name":"_nftSymbol","type":"string"},{"name":"_siteSizeInKW","type":"uint256"},{"name":"_maxTotalSupply","type":"uint256"},{"name":"_initialAssetPricing","type":"uint256"},{"name":"_pricingCurrency","type":"string"},{"name":"_IRR20yrx100","type":"uint256"},{"name":"_validDate","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"nftName","type":"string"},{"indexed":false,"name":"nftSymbol","type":"string"},{"indexed":false,"name":"pricingCurrency","type":"string"},{"indexed":false,"name":"uri","type":"string"},{"indexed":false,"name":"initialAssetPricing","type":"uint256"}],"name":"MintSerialNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"},{"indexed":false,"name":"msgsender","type":"address"}],"name":"BurnNFT","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_operator","type":"address"},{"indexed":false,"name":"_approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];
//https://rinkeby.etherscan.io/address/0x844f88dd745c5f4069184c7eea40cae44dd9826d#code
var ctrtInst = new web3js.eth.Contract(contractABI,ctrtAddr);


router.get('/name',function(req,res){
  //instance.methods.name().call({from:fromAddr},...
  ctrtInst.methods.name().call(function(err, result) {
      console.log("check read function: name()");
      if(err) {
          console.log(err);
      } else {
          console.log("name:", result);
      }//result.toNumber()
  });
});

router.get('/symbol',function(req,res){
  ctrtInst.methods.symbol().call(function(err, result) {
      console.log("check read function: symbol()");
      if(err) {
          console.log(err);
      } else {
          console.log("symbol:", result);
      }//result.toNumber()
  });
});

// http://localhost:3000/balanceOf?addrTarget=0x3f032hf0s...
router.get('/balanceOf',function(req,res){
  var addrTarget = req.query.addrTarget;
  ctrtInst.methods.balanceOf(addrTarget).call(function(err, result) {
      console.log("check read function: balanceOf(fromAddr)");
      if(err) {
          console.log(err);
      } else {
          console.log("balanceOf(fromAddr):", result);
      }//result.toNumber()
  });
});

router.get('/nextTokenId',function(req,res){
  ctrtInst.methods.nextTokenId().call(function(err, result) {
      console.log("check read function: nextTokenId()");
      if(err) {
          console.log(err);
      } else {
          console.log("nextTokenId:", result);
      }//result.toNumber()
  });
});

router.get('/siteSizeInKW',function(req,res){
  ctrtInst.methods.siteSizeInKW().call(function(err, result) {
      console.log("check read function: siteSizeInKW()");
      if(err) {
          console.log(err);
      } else {
          console.log("siteSizeInKW:", result);
      }//result.toNumber()
  });
});

//-----------------------==
// http://localhost:3000/getnft?tokenId=8
router.get('/getnft',function(req,res){
  var tokenId = req.query.tokenId;//8;
  ctrtInst.methods.getNFT(tokenId).call(function(err, result) {
    console.log("check read function: getNFT(tokenId)");
    if(err) {
        console.log(err);
    } else {
        console.log("tokenDetail:", result);
    }//result.toNumber()
  });
});


// http://localhost:3000/getownerToIds?addrTarget=0xF694dCbec7f434dE9F892cfACF0449DB8661334D
var addr1 = '0x8dB3DD13fce6D4aAE90301412D8707651f8e7A76';
//var _owner = addr1;
//var _owner = fromAddr;
router.get('/getownerToIds',function(req,res){
  var _owner = req.query.addrTarget;
  console.log('addrTarget', _owner);
  ctrtInst.methods.get_ownerToIds(_owner).call(function(err, result) {
    console.log("check read function: get_ownerToIds(_owner)");
    if(err) {
        console.log(err);
    } else {
        console.log("get_ownerToIds:", result);
    }//result.toNumber()
  });
});


//-------------------------
//https://rinkeby.etherscan.io/address/0x844f88dd745c5f4069184c7eea40cae44dd9826d#code
// http://localhost:3000/mintserialnft?tokenURI=Kaohsiung11
router.get('/mintserialnft',function(req,res){
  var count;
  var tokenURI = req.query.tokenURI;//"Kaohsiung08";
  console.log('tokenURI', tokenURI);
  // get transaction count, later will used as nonce
  web3js.eth.getTransactionCount(fromAddr).then(function(v){
      console.log("Count: "+v);
      count = v;
      //var amount = web3js.utils.toHex(1e16);
      var rawTransaction = {
        "from":fromAddr, 
        "gasPrice":web3js.utils.toHex(20*1e9),
        "gasLimit":web3js.utils.toHex(3000000),//3000000
        "to":ctrtAddr,
        "value":"0x0",
        "data":ctrtInst.methods.mintSerialNFT(tokenURI).encodeABI(),
        "nonce":web3js.utils.toHex(count)
      }
      /**
      value: web3js.utils.toHex(web3js.toBigNumber(web3js.eth.getBalance(address))
      .minus(web3js.toBigNumber(21000).times(20000000000)))
      */
      console.log(rawTransaction);

      var transaction = new Tx(rawTransaction);//make new txn via ethereumjs-tx
      transaction.sign(privateKey);//signing transaction with private key

      //https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-sendsignedtransaction
      web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
      .on('transactionHash',console.log)
      .on('receipt', console.log)
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmationNumber', confirmationNumber, 'receipt',receipt);
      })
      .on('error', console.error);
      // If a out of gas error, the second parameter is the receipt.
  })
});

// http://localhost:3000/safeTransferFrom?tokenId=8
router.get('/safeTransferFrom',function(req,res){
  var count;
  var _from = fromAddr;
  var _to = addr1;
  var _tokenId = req.query.tokenId;
  console.log('tokenId', _tokenId);
  web3js.eth.getTransactionCount(fromAddr).then(function(v){
      console.log("Count: "+v);
      count = v;
      var rawTransaction = {
        "from":fromAddr, 
        "gasPrice":web3js.utils.toHex(20*1e9),
        "gasLimit":web3js.utils.toHex(3000000),//3000000
        "to":ctrtAddr,
        "value":"0x0",
        "data":ctrtInst.methods.safeTransferFrom(_from,_to,_tokenId).encodeABI(),
        "nonce":web3js.utils.toHex(count)
      }
      console.log(rawTransaction);

      var transaction = new Tx(rawTransaction);//make new txn via ethereumjs-tx
      transaction.sign(privateKey);//signing transaction with private key

      //https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-sendsignedtransaction
      web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
      .on('transactionHash',console.log)
      .on('receipt', console.log)
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmationNumber', confirmationNumber, 'receipt',receipt);
      })
      .on('error', console.error);
      // If a out of gas error, the second parameter is the receipt.
  })
});



//--------------------------
var Users = {
  'David': {
    age: 52,
    occupation: 'Professor',
    hobby: 'Swimming'
  },
  'Robert': {
    age: 34,
    occupation: 'Engineer',
    hobby: 'Running'
  },
  'Jane': {
    age: 28,
    occupation: 'Nurse',
    hobby: 'Chess'
  },
}
//http://localhost:3000/api/users?name=David&id=4&token=sdfa3&geo=us
router.get('/api/users', function(req, res) {
  var userName = Users[req.query.name];
  var info = (userName) ? userName : 'User does not exist...';
  console.log(userName, info);

  var user_id = req.query.id;
  var token = req.query.token;
  var geo = req.query.geo;  
  console.log('user_id:', user_id + ', token:' + token + ', geo:' + geo);
  res.send(info, user_id, token, geo);
});

// http://localhost:3000/api/1
router.get('/api/:version', function(req, res) {
  console.log('req.params.version',req.params.version);
  res.send(req.params.version);
});

// parameter middleware that will run before the next routes
router.param('name', function(req, res, next, name) {
  // check if the user with that name exists
  // do some validations
  // add -dude to the name
  var modified = name + '-dude';

  // save name to the request
  req.name = modified;

  next();
});


/**
 * //to deploy smart contract
var rawTx = {
    nonce: web3.toHex(web3.eth.getTransactionCount(fromAddr)),
    gasLimit: web3.toHex(800000),
    gasPrice: web3.toHex(20000000000),
    data: '0x' + bytecode + '0000000000000000000000000000000000000000000000000000000000000005'
};
sendRaw(rawTx);

//--------------------==
ctrtInst.deploy({
    data: "0x" + bytecode,
  })
  .send({from: fromAddr, gas: 4700000})
  .then((instance) => {
    console.log(`Address: ${instance.options.address}`);
  })
  .catch(console.log);
)};
*/
//-------------------==Deploy
router.get('/ethbalance',function(req,res){
  //guaranteed for cross platform path from current dir to inboc dir
  var ctrtName = 'NFTokenSPLC';
  const compiledCtrt1 = require('./build/'+ctrtName+'.json');
  const fs = require('fs');

  console.log('Attempting to deploy from account', fromAddr);
  const interface1 = compiledCtrt1.contracts[':'+ctrtName].interface;
  //const interface1 = compiledCtrt1.interface;
  console.log('interface1', interface1);

  const bytecode1  = compiledCtrt1.contracts[':'+ctrtName].bytecode;
  //const bytecode1  = compiledCtrt1.bytecode;
  console.log('bytecode1',bytecode1);

  const result = new web3.eth.Contract(JSON.parse(interface1))
    .deploy({ data: bytecode1 })
    .send({ gas: '1000000', from: fromAddr });
    // .catch(function() {
    //   console.log('Promise Rejected!!! Check interface and bytecode...')
    // });
//  .deploy({ data: bytecode, arguments:['Hi there!']})
/**
 UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'send' of null
  */

  const contractAddr = result.options.address;
  console.log('');
  console.log('ABI Interface =',interface1);
  console.log('');
  console.log('Contract deployed to', contractAddr);

  const deploymentInfo = `
  Contract deployed ...
  From account: ${fromAddr}
  To: ${contractAddr}
  ABI Interface=
  ${interface1}
  `;
  fs.writeFile('contractDeploymentInfo.txt', deploymentInfo, (err) => {
  if (err) throw err;
  console.log('Contract deployment info file has been saved.')
  });
  //After successful deployment, you should find a new file in the /ethereum  folder 
  //named contractDeploymentInfo.txt   that contains the address for the deployed contract. 
});

//--------------------------
router.get('/ethbalance',function(req,res){
  var ethbalance = web3js.eth.getBalance(fromAddr);
  console.log("ethbalance", ethbalance);
});

//var port = process.env.PORT || 3000;
// app.listen(3000, () => console.log('Example app listening on port 3000! http://localhost:3000/functionName'))

module.exports = router;