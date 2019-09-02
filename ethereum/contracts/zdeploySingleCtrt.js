const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
//const timer = require('')

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

const backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
const backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
const backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

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
}

const heliumContractAddr = "0x9C201b1A3628fd6464F4297fbe85e0Fc20666b0f";
const registryContractAddr = "0x9CDEf88c4C1Bb8CdA1EE4ed19B2Bb88723C56E93";
const productManagerContractAddr = "0xAdfD0067cAD50756Ee5A8C00675afC98c44a89A4";

/**time server*/
// timer.getTime().then(function (time) {
//   console.log(`[Routes/Contract.js] current time: ${time}`)
// })    

const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
/**ganache */
//const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');
const web3deploy = new Web3(provider);

let admin, AssetOwner1, AssetOwner2, acc3, acc4, managementTeam;
let adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, adminpk;
let addrHelium, addrMultiSig1, addrMultiSig2, addrRegistry, addrTokenController;
let addrHCAT721, addrAssetBook1, addrAssetBook2, addrIncomeManagement, addrProductManager;
let nftSymbol, nftName, location, maxTotalSupply, siteSizeInKW, initialAssetPricing, IRR20yrx100, duration, quantityGoal;

nftName = 'AMOS1901(Taipei)';
nftSymbol = 'AMOS1901';
siteSizeInKW = 300;
maxTotalSupply = 790;
initialAssetPricing = 18000;
pricingCurrency = 'NTD';
IRR20yrx100 = 470;
tokenURI = nftSymbol+'/uri';
addrRegistry = '0xe86976cEd3bb9C924235B904F43b829E4A32fa0d';
addrTokenController = '0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7';
addrHelium = '0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7';

console.log(`
nftSymbol: ${nftSymbol}, nftName: ${nftName}
maxTotalSupply: ${maxTotalSupply}
siteSizeInKW: ${siteSizeInKW}, tokenURI: ${tokenURI}
initialAssetPricing: ${initialAssetPricing}, pricingCurrency = ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}

`);


const nftName_bytes32 = web3.utils.fromAscii(nftName);
const nftSymbol_bytes32 = web3.utils.fromAscii(nftSymbol);
const pricingCurrency_bytes32 = web3.utils.fromAscii(pricingCurrency);
const tokenURI_bytes32 = web3.utils.fromAscii(tokenURI);

const argsHCAT721 = [
  nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
  initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
  addrRegistry, addrTokenController, tokenURI_bytes32, addrHelium];

const ERC721SPLC = new web3deploy.eth.Contract(HCAT721_Test.abi);

ERC721SPLC.deploy({
    data: HCAT721_Test.bytecode,
    arguments: argsHCAT721
})
.send({
    from: backendAddr,
    gas: 9000000,
    gasPrice: '0'
})
.on('receipt', function (receipt) {
    console.log("ERC721:" + receipt.contractAddress);
  }
);


// function    doGetNodeStatus()  {
//     // Asynch version
//     web3.net.getListening(function(error, result){
//         if(error) {console.log('get_peer_count',error,true);
//     } else {
//             // Since connected lets get the count
//             web3.net.getPeerCount(  function(  error,  result ) {
//             if(error){
//                 console.log('get_peer_count',error,true);
//             } else {
//                 console.log('get_peer_count','Peer Count: '+result,(result == 0));
//             }
//         });
//         }
//     });
// }

// doGetNodeStatus();