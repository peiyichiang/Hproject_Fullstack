const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');
var router = express.Router();

// const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
//const web3js = new Web3("http://localhost:8545");
//const web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//In some functions at web3 you need websocket provider for web3 so you need to change the line 8 with this line when needed.
//web3 = new web3(new web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));

var fromAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var privateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var ctrtAddr ="0xad3ff162e1cecdc1d8eb8a1f9dee903fc6189b8d";
const contract = require('../contract/ERC721_SPLC5.json');

//https://rinkeby.etherscan.io/address/0x844f88dd745c5f4069184c7eea40cae44dd9826d#code
var ctrtInst = new web3js.eth.Contract(contract.abi,ctrtAddr);


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