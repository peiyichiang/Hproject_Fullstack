/**
chain: 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,
*/
/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = helium, assetbook, registry, cf, tokc, hcat, db
*/
//const timer = require('./api.js');
const Web3 = require('web3');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const {addProductRow, addSmartContractRow} = require('../../timeserver/mysql.js');

let provider, web3, web3deploy, gasLimitValue, gasPriceValue, prefix = '', tokenURI;
console.log('process.argv', process.argv);
if (process.argv.length < 8) {
  console.log('not enough arguments. Make it like: yarn run deploy -n 1 --chain 1 --cName contractName');
  console.log('chain = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain');
  console.log('cName = helium, assetbook, registry, tokc, hcat, cf, db');
  process.exit(1);
}
// chain    symNum   ctrtName
const chain = parseInt(process.argv[3]);//0;
const symNum = parseInt(process.argv[5]);
const ctrtName = process.argv[7];//'assetbook';

let admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, managementTeam;
let adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, adminpk;
let addrHelium, addrMultiSig1, addrMultiSig2, addrRegistry, addrTokenController;
let addrHCAT721, addrAssetBook1, addrAssetBook2, addrIncomeManagement, addrProductManager;
let nftSymbol, nftName, location, maxTotalSupply, siteSizeInKW, initialAssetPricing, IRR20yrx100, duration, quantityGoal;
let timeAnchor, CFSD2, CFED2, TimeReleaseDate, TimeTokenUnlock, TimeTokenValid, fundmanager, serverTime;
console.log('chain = ', chain, ', ctrtName =', ctrtName);


//1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
if (chain === 1) {//POA private chain

  admin = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
  adminpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
  AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
  AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
  AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
  AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
  AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
  AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
  AssetOwner4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
  AssetOwner4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";
  AssetOwner5 = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
  //AssetOwner5pkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";

  managementTeam = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4];
  /** deployed contracts
      yarn run deploy -c 1 -s 1 -cName db
      cName = helium, assetbook, registry, cf, tokc, hcat, db
   */
  addrHelium =     "0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7";
  addrAssetBook1 = "0x10C2E71CE92d637E6dc30BC1d252441A2E0865B0";
  addrAssetBook2 = "0xe1A64597056f5bf55268dF75F251e546879da89c";
  addrAssetBook3 = "0x22e2691be1312F69549d23A2C2d3AA3d55D56c92";
  addrRegistry =   "0xe86976cEd3bb9C924235B904F43b829E4A32fa0d";

  //fundingType= 1 PO, 2 PP
  //Math.round(maxTotalSupply*quantityGoalPercentage);
  function symbolObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, timeOfDeployment, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager) {
    this.nftSymbol = nftSymbol;
    this.maxTotalSupply = maxTotalSupply;
    this.quantityGoal = quantityGoal;
    this.siteSizeInKW = siteSizeInKW;
    this.initialAssetPricing = initialAssetPricing;
    this.pricingCurrency = pricingCurrency;
    this.fundingType = fundingType;
    this.IRR20yrx100 = IRR20yrx100;
    this.duration = duration;
    this.nftName = nftSymbol+" site No.n(2019)";
    this.location = nftSymbol.substr(0, nftSymbol.length-4);
    this.timeOfDeployment = timeOfDeployment;
    this.addrTokenController = addrTokenController;
    this.addrHCAT721 = addrHCAT721;
    this.addrCrowdFunding = addrCrowdFunding;
    this.addrIncomeManager = addrIncomeManager;
  }
  /** deployed contracts
      yarn run deploy -c 1 -s 1 -cName db
      cName = helium, assetbook, registry, cf, tokc, hcat, db
   */


  // const currentTime = await timer.getTime();
  // console.log('currentTime', currentTime);
  //To be copied to timeserverTest.js
  serverTime = 201905201700;
  timeAnchor = serverTime+1000;
  CFSD2 = timeAnchor+1;
  CFED2 = timeAnchor+7;
  TimeReleaseDate = timeAnchor+10;
  TimeTokenUnlock = timeAnchor+20; 
  TimeTokenValid =  timeAnchor+90;
  fundmanager = 'Company_FundManagerN';

  const symbolObjX = new symbolObject("AKOS1902", "nftName", "location", 973, 924, 300, 18000, "NTD", 470, 20, 201905150000, 2, "0x677835e97c4Dc35cc1D9eCd737Cc6Fc1380e1bDD", "0xF8Bbc068b325Fe7DA1Ef9bE8f69de38CB7299D10", "0xe589C3c07D6733b57adD21F8C17132059Ad6b2b0", "");

  /** deployed contracts
      yarn run deploy -c 1 -n 0 -cName cf
      -c chain    -n symNum   
      cName = helium, assetbook, registry, tokc, hcat, cf, db
  */
  //"AAOS1903", 18000, "NTD", 986, 973, 201905201800, 201905211810, 201905211710, "0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7"
  //nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD2, CFED2, timeOfDeployment, addrHelium

  /**
  nftSymbol, nftName, location, maxTotalSupply, quantityGoalPercentage, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, timeOfDeployment, 
  fundingType: PO: 1, PP: 2
  addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager
  */
  const symbolObj0 = new symbolObject("AAOS1903", "nftName", "location", 986, 973, 300, 18000, "NTD", 470, 20, serverTime, 2, "0xBC62fbFA144f3bAeea7889DB17e581dd48CAF16C", "0x423E610E7Ba9781D598593c1387fd854995bAe57", "0x2DC32EF8EA02D8965B813a466e1dB35bbd3a80b5", "");
  const symbolObj1 = new symbolObject("ALOS1901", "nftName", "location", 2073, 2035, 350, 19000, "NTD", 480, 20, serverTime, 2, "", "", "", "");
  const symbolObj2 = new symbolObject("AOOS1901", "nftName", "location", 5073, 4937, 400, 20000, "NTD", 490, 20, serverTime, 2, "", "", "", "");
  
  const symObjArray = [symbolObj0, symbolObj1, symbolObj2];
  const symArray = [];
  const crowdFundingAddrArray= [];
  const tokenControllerAddrArray= [];
  
  symObjArray.forEach( (obj) => {
    symArray.push(obj.nftSymbol);
    crowdFundingAddrArray.push(obj.addrCrowdFunding);
    tokenControllerAddrArray.push(obj.addrTokenController)
  });
  console.log('\nconst symArray =', symArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray,';');

  console.log(`
  const timeAnchor = ${timeAnchor};
  const CFSD2 = timeAnchor+1;
  const CFED2 = timeAnchor+7;
  const TimeReleaseDate = timeAnchor+10;
  const TimeTokenUnlock = timeAnchor+20; 
  const TimeTokenValid =  timeAnchor+90;
  const fundmanager = 'Company_FundManagerN';
  const pricingCurrency = "NTD";
  const timeOfDeployment = timeAnchor+1000;
  `);

  nftName = symObjArray[symNum].nftName;
  nftSymbol = symObjArray[symNum].nftSymbol;
  maxTotalSupply = symObjArray[symNum].maxTotalSupply;
  quantityGoal = symObjArray[symNum].quantityGoal;
  siteSizeInKW = symObjArray[symNum].siteSizeInKW;
  initialAssetPricing = symObjArray[symNum].initialAssetPricing;
  pricingCurrency = symObjArray[symNum].pricingCurrency;
  IRR20yrx100 = symObjArray[symNum].IRR20yrx100;
  duration = symObjArray[symNum].duration;
  location = symObjArray[symNum].location;
  timeOfDeployment = symObjArray[symNum].timeOfDeployment;
  fundingType = symObjArray[symNum].fundingType;
  addrTokenController = symObjArray[symNum].addrTokenController;
  addrHCAT721 = symObjArray[symNum].addrHCAT721;
  addrCrowdFunding = symObjArray[symNum].addrCrowdFunding;
  addrIncomeManager = symObjArray[symNum].addrIncomeManager;

  tokenURI = nftSymbol+"/uri";

  console.log(`
  const timeAnchor = ${timeAnchor};
  const CFSD2 = ${CFSD2};
  const CFED2 = ${CFED2};
  const TimeReleaseDate = ${TimeReleaseDate};
  const TimeTokenUnlock = ${TimeTokenUnlock}; 
  const TimeTokenValid =  ${TimeTokenValid};
  const fundmanager = '${fundmanager}';

  symNum: ${symNum}
  nftSymbol: ${nftSymbol}, nftName: ${nftName}
  maxTotalSupply: ${maxTotalSupply}, quantityGoal: ${quantityGoal}
  siteSizeInKW: ${siteSizeInKW}, tokenURI: ${tokenURI}
  initialAssetPricing: ${initialAssetPricing}, pricingCurrency = ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}
  addrHelium: ${addrHelium}
  addrRegistry: ${addrRegistry}
  addrTokenController = ${addrTokenController}
  addrHCAT721 = '${addrHCAT721}'

  duration: ${duration}, timeOfDeployment: ${timeOfDeployment}
  fundingType: ${fundingType}
  `);

  // addrProductManager = "";  

  gasLimitValue = '7000000';//intrinsic gas too low
  gasPriceValue = '0';//insufficient fund for gas * gasPrice + value
  console.log('gasLimit', gasLimitValue, 'gasPrice', gasPriceValue);

  const nodeUrl = "http://140.119.101.130:8545";//POA

  adminpk = Buffer.from(adminpkRaw.substr(2), 'hex');
  provider = new PrivateKeyProvider(adminpk, nodeUrl);
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  console.log('web3.version', web3deploy.version);
  prefix = '0x';

} else if (chain === 2) {//2: POW private chain
  const options = { gasLimit: 9000000 };
  gasLimitValue = '5000000';// for POW private chain
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "http://140.119.101.130:8540";
  provider = new PrivateKeyProvider(adminpk, nodeUrl);//ganache
  web3deploy = new Web3(provider);
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else if (chain === 3) {
  const options = { gasLimit: 7000000 };
  gasLimitValue = '5000000';// for POW Infura Rinkeby chain
  gasPriceValue = '20000000000';//100000000000000000
  provider = ganache.provider(options);
  const nodeUrl = "https://rinkeby.infura.io/v3/b789f67c3ef041a8ade1433c4b33de0f";
  //const noeeUrl = "https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d";
  web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

} else {
  console.log('chain is out of range. chain =', chain);
  process.exit(1);
}


//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let instRegistry, instTokenController, instHCAT721, instCrowdFunding,  instIncomeManager, instProductManager;
let balance0, balance1, balance2;
let argsAssetBookN, argsAssetBook1, argsAssetBook2, argsAssetBook3, argsAssetBook4;
let instAssetBookN, instAssetBook1, instAssetBook2, instAssetBook3, instAssetBook4; 

//const rate = new BigNumber('1e22').mul(value);
const addrZero = "0x0000000000000000000000000000000000000000";

//--------------------==
console.log('\n---------------==Load contract json file compiled from sol file');
//const { interface, bytecode } = require('../compile');//dot dot for one level up
const TestCtrt = require('./build/TestCtrt.json');
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
}

const Helium = require('./build/Helium.json');
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

const AssetBook = require('./build/AssetBook.json');
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



const Registry = require('./build/Registry.json');
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

const TokenController = require('./build/TokenController.json');
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

const HCAT721 = require('./build/HCAT721_AssetToken.json');
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

const CrowdFunding = require('./build/CrowdFunding.json');
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

const IncomeManagement = require('./build/IncomeManagerCtrt.json');
if (IncomeManagement === undefined){
  console.log('[Error] IncomeManagement is Not Defined <<<<<<<<<<<<<<<<<<<<<');
} else {
  console.log('[Good] IncomeManagement is defined');
  if (IncomeManagement.abi === undefined){
    console.log('[Error] IncomeManagement.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManagement.abi is defined');
      //console.log('IncomeManagement.abi:', IncomeManagement.abi);
  }
  if (IncomeManagement.bytecode === undefined || IncomeManagement.bytecode.length < 10){
    console.log('[Error] IncomeManagement.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<');
  } else {
    console.log('[Good] IncomeManagement.bytecode is defined');
      //console.log('IncomeManagement.bytecode:', IncomeManagement.bytecode);
  }
  //console.log(IncomeManagement);
}

const ProductManager = require('./build/ProductManager.json');
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

//  await asyncForEachBasic(mainInputArray, async (item) => {
async function asyncForEachBasic(arrayBasic, callback) {
  console.log("arrayBasic:"+arrayBasic);
  for (let idxBasic = 0; idxBasic < arrayBasic.length; idxBasic++) {
    console.log("idxBasic:"+idxBasic, arrayBasic[idxBasic]);
    await callback(arrayBasic[idxBasic], idxBasic, arrayBasic);
  }
}

const writeCtrtToDB = async() => {
  console.log('\nto add product row into DB');
  //await addProductRow(nftSymbol, nftSymbol, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, CFSD2, CFED2, quantityGoal, TimeTokenUnlock);
  
  console.log(`\nto add smart contract row into DB: nftSymbol ${nftSymbol}, addrCrowdFunding: ${addrCrowdFunding}, addrHCAT721: ${addrHCAT721}, maxTotalSupply: ${maxTotalSupply}, addrIncomeManager: ${addrIncomeManager}, addrTokenController: ${addrTokenController}`);
  //nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController
  //await addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController);
  mysqlPoolQuery('INSERT INTO htoken.smart_contracts (sc_symbol, sc_crowdsaleaddress, sc_erc721address, sc_totalsupply, sc_remaining, sc_incomeManagementaddress, sc_erc721Controller) VALUES (?, ?, ?, ?, ?, ?, ?)', [nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, maxTotalSupply, addrIncomeManager, addrTokenController], function (err, result) {
    if (err) {
      console.log('\n[Error @ writing data into smart_contracts rows]', err);
    } else {
      console.log("\nSmart contract table has been added with one new row. result:", result);
      console.log(result);
    }
  });

  console.log('\nsymNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);
}

const deploy = async () => {
    console.log('\n--------==To deploy');

    console.log('admin', admin);
    console.log('AssetOwner1', AssetOwner1);
    console.log('AssetOwner2', AssetOwner2);
    console.log('AssetOwner3', AssetOwner3);
    console.log('AssetOwner4', AssetOwner4);

    if (2===1) {
        balance0 = await web3deploy.eth.getBalance(admin);//returns strings!
        balance1 = await web3deploy.eth.getBalance(AssetOwner1);//returns strings!
        balance2 = await web3deploy.eth.getBalance(AssetOwner2);//returns strings!
        console.log('admin',  admin, balance0);//100,00000000,0000000000
        console.log('AssetOwner1',  AssetOwner1, balance1);
        console.log('AssetOwner2',  AssetOwner2, balance2);
    }

    console.log('\nDeploying contracts...');
    //JSON.parse() is not needed because the abi and bytecode are already objects

    if (ctrtName === 'helium') {
      //Deploying Helium contract...
      const argsHelium = [managementTeam];
      console.log('\nDeploying Helium contract...');
      instHelium =  await new web3deploy.eth.Contract(Helium.abi)
      .deploy({ data: prefix+Helium.bytecode, arguments: argsHelium })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('Helium.sol has been deployed');
      if (instHelium === undefined) {
        console.log('[Error] instHelium is NOT defined');
        } else {console.log('[Good] instHelium is defined');}
      instHelium.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrHelium = instHelium.options.address;
      console.log('addrHelium:', addrHelium);
      process.exit(0);


      //yarn run deploy -c 1 -s 1 -cName db
    } else if (ctrtName === 'testctrt') {
      console.log('\nDeploying testCtrt contracts...');
      const HCAT721SerialNumber = 2020;
      const argsTestCtrt = [HCAT721SerialNumber, addrHelium];
      instTestCtrt =  await new web3deploy.eth.Contract(TestCtrt.abi)
      .deploy({ data: prefix+TestCtrt.bytecode, arguments: argsTestCtrt })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('TestCtrt has been deployed');
      if (instTestCtrt === undefined) {
        console.log('[Error] instTestCtrt is NOT defined');
        } else {console.log('[Good] instTestCtrt is defined');}
      instTestCtrt.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrTestCtrt = instTestCtrt.options.address;
      console.log('addrTestCtrt:', addrTestCtrt);
      process.exit(0);


    } else if (ctrtName === 'multisig') {
      const argsMultiSig1 = [AssetOwner1, addrHelium];
      const argsMultiSig2 = [AssetOwner2, addrHelium];

      console.log('\nDeploying multiSig contracts...');
      instMultiSig1 =  await new web3deploy.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig1 })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('MultiSig1 has been deployed');
      if (instMultiSig1 === undefined) {
        console.log('[Error] instMultiSig1 is NOT defined');
        } else {console.log('[Good] instMultiSig1 is defined');}
      instMultiSig1.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig1 = instMultiSig1.options.address;
      console.log('addrMultiSig1:', addrMultiSig1);
      console.log('\nwaiting for addrMultiSig2...');

      instMultiSig2 =  await new web3deploy.eth.Contract(MultiSig.abi)
      .deploy({ data: prefix+MultiSig.bytecode, arguments: argsMultiSig2 })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });

      console.log('MultiSig2 has been deployed');
      if (instMultiSig2 === undefined) {
        console.log('[Error] instMultiSig2 is NOT defined');
        } else {console.log('[Good] instMultiSig2 is defined');}
      instMultiSig2.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
      addrMultiSig2 = instMultiSig2.options.address;

      console.log('addrMultiSig1:', addrMultiSig1);
      console.log('addrMultiSig2:', addrMultiSig2);
      process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName db
  } else if (ctrtName === 'assetbook') {
    const addrAssetBookArray = [];
    console.log('\nDeploying AssetBook contracts...');
    const mainInputArray = [AssetOwner1, AssetOwner2, AssetOwner3];
    await asyncForEachBasic(mainInputArray, async (item, idx) => {
      argsAssetBookN = [item, addrHelium];
      instAssetBookN =  await new web3deploy.eth.Contract(AssetBook.abi)
      .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookN })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });
      if (instAssetBookN === undefined) {
        console.log(`\n[Error] instAssetBook${idx+1} is NOT defined`);
        } else {console.log(`[Good] instAssetBook${idx+1} is defined`);}
    
      console.log(`AssetBook${idx+1} has been deployed`);
      console.log(`addrAssetBook${idx+1}: ${instAssetBookN.options.address}`);
      addrAssetBookArray.push(instAssetBookN.options.address);
      console.log(`Finished deploying AssetBook${idx+1}...`);
    });
    addrAssetBook1 = addrAssetBookArray[0];
    addrAssetBook2 = addrAssetBookArray[1];
    addrAssetBook3 = addrAssetBookArray[2];
    process.exit(0);

  //yarn run deploy -c 1 -s 1 -cName db
  } else if (ctrtName === 'assetbookx'){
    console.log('\nDeploying AssetBook contract x1...');
    const assetowner = "";
    const argsAssetBookx = [assetowner, addrHelium];
    instAssetBookx =  await new web3deploy.eth.Contract(AssetBook.abi)
    .deploy({ data: prefix+AssetBook.bytecode, arguments: argsAssetBookx })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('Another assetbook has been deployed');
    if (instAssetBookx === undefined) {
      console.log('\n[Error] instAssetBook is NOT defined');
      } else {console.log('[Good] instAssetBook is defined');}
    console.log('addrAssetBookx:', instAssetBookx.options.address);
    process.exit(0);

  } else if (ctrtName === 'registry') {
    console.log('\nDeploying Registry contract...');
    const argsRegistry = [addrHelium];
    instRegistry =  await new web3deploy.eth.Contract(Registry.abi)
    .deploy({ data: prefix+Registry.bytecode, arguments: argsRegistry })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('Registry.sol has been deployed');
    if (instRegistry === undefined) {
      console.log('[Error] instRegistry is NOT defined');
      } else {console.log('[Good] instRegistry is defined');}
    instRegistry.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrRegistry = instRegistry.options.address;
    console.log('addrRegistry:', addrRegistry);
    process.exit(0);

  } else if (ctrtName === 'tokc') {
    //Deploying TokenController contract...
    console.log('\nDeploying TokenController contract...');
    const argsTokenController = [
      timeAnchor, TimeTokenUnlock, TimeTokenValid, addrHelium ];
    instTokenController = await new web3deploy.eth.Contract(TokenController.abi)
    .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('TokenController.sol has been deployed');
    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

    if (instTokenController === undefined) {
      console.log('[Error] instTokenController is NOT defined');
      } else {console.log('[Good] instTokenController is defined');}
    instTokenController.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrTokenController = instTokenController.options.address;
    console.log('addrTokenController:', addrTokenController);
    process.exit(0);


  //yarn run deploy -c 1 -s 1 -cName hcat/hcattest
  } else if (ctrtName === 'hcat' || ctrtName === 'hcattest') {
    console.log('\nDeploying HCAT721 contract... initial');
    /**https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    */
    const nftName_bytes32 = web3deploy.utils.fromAscii(nftName);
    const nftSymbol_bytes32 = web3deploy.utils.fromAscii(nftSymbol);
    const pricingCurrency_bytes32 = web3deploy.utils.fromAscii(pricingCurrency);
    const tokenURI_bytes32 = web3deploy.utils.fromAscii(tokenURI);
    const argsHCAT721 = [
    nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
    initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
    addrRegistry, addrTokenController, tokenURI_bytes32, addrHelium];
  
    console.log('\nDeploying HCAT721 contract... .deploy()');
    if (ctrtName === 'hcat'){
      console.log('check1 hcat');
      instHCAT721 = await new web3deploy.eth.Contract(HCAT721.abi)
      .deploy({ data: prefix+HCAT721.bytecode, arguments: argsHCAT721 })
      .send({ from: admin, gas: 9000000, gasPrice: '0' })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      }).on('error', function (error) {
          console.log('error:', error.toString());
      });
      console.log('HCAT721.sol has been deployed');
  
    } else if(ctrtName === 'hcattest'){
      console.log('check1 hcattest');

      instHCAT721 = await new web3deploy.eth.Contract(HCAT721_Test.abi)
      .deploy({ data: prefix+HCAT721_Test.bytecode, arguments: argsHCAT721 })
      .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
      .on('receipt', function (receipt) {
        console.log('receipt:', receipt);
      })
      .on('error', function (error) {
          console.log('error:', error.toString());
      });
      console.log('HCAT721_Test.sol has been deployed');
    }
    // instTokenController = await new web3deploy.eth.Contract(TokenController.abi)
    // .deploy({ data: prefix+TokenController.bytecode, arguments: argsTokenController })
    // .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    // .on('receipt', function (receipt) {
    //   console.log('receipt:', receipt);
    // })
    // .on('error', function (error) {
    //     console.log('error:', error.toString());
    // });


    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

    if (instHCAT721 === undefined) {
      console.log('[Error] instHCAT721 is NOT defined');
      } else {console.log('[Good] instHCAT721 is defined');}
    instHCAT721.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrHCAT721 = instHCAT721.options.address;
    console.log('addrHCAT721 '+ctrtName, addrHCAT721);
    /**
    value: '0', from: admin, gas: gasLimitValue, gasPrice: gasPriceValue
    value: web3deploy.utils.toWei('10','ether')
    */

    //-------------------==
    /*
    console.log('\nto add product row into DB');
    addProductRow(nftSymbol, nftSymbol, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, CFSD2, CFED2, quantityGoal, TimeTokenUnlock);
    
    console.log('\nto add smart contract row into DB');
    addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController);
 
    console.log('\naddrCrowdFunding:', addrCrowdFunding);
    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);
    */
    process.exit(0);

  //yarn run deploy -c 1 -s 0 -cName addctrt
  } else if (ctrtName === 'addctrt') {
    addSmartContractRow(nftSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController);
    process.exit(0);


  //yarn run deploy -c 1 -s 0 -cName adduser
  } else if (ctrtName === 'adduser') {
    addUserRow(email, salt, password_hash, identityNumber, eth_add, cellphone, name, physicalAddress, gender, telephone, investorLevel);
    process.exit(0);


  //yarn run deploy -c 1 -n 0 -cName cf
  } else if (ctrtName === 'cf') {
   console.log('\nDeploying CrowdFunding contract...');

   const argsCrowdFunding = [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD2, CFED2, timeOfDeployment, addrHelium];
   console.log('argsCrowdFunding', argsCrowdFunding);

   instCrowdFunding = await new web3deploy.eth.Contract(CrowdFunding.abi)
    .deploy({ data: prefix+CrowdFunding.bytecode, arguments: argsCrowdFunding })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('CrowdFunding.sol has been deployed');
    console.log('symNum:', symNum, ', nftSymbol', nftSymbol, ', maxTotalSupply', maxTotalSupply, ', initialAssetPricing', initialAssetPricing, ', siteSizeInKW', siteSizeInKW);

    if (instCrowdFunding === undefined) {
      console.log('[Error] instCrowdFunding is NOT defined');
    } else {console.log('[Good] instCrowdFunding is defined');}
    
    instCrowdFunding.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrCrowdFunding = instCrowdFunding.options.address;
    console.log('addrCrowdFunding:', addrCrowdFunding);


  /*
  } else if (ctrtName === 'incomemanagement') {
    const argsIncomeManagement =[addrHCAT721, addrHeliumCtrt];

    instIncomeManager = await new web3deploy.eth.Contract(IncomeManagement.abi)
    .deploy({ data: IncomeManagement.bytecode, arguments: argsIncomeManagement })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('IncomeManagement.sol has been deployed');
    if (instIncomeManager === undefined) {
      console.log('[Error] instIncomeManager is NOT defined');
      } else {console.log('[Good] instIncomeManager is defined');}
    instIncomeManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrIncomeManagement = instIncomeManager.options.address;
    console.log('addrIncomeManagement:', addrIncomeManagement);


  } else if (ctrtName === 'productmanager') {
    const argsProductManager =[addrHCAT721, addrHeliumCtrt];

    instProductManager = await new web3deploy.eth.Contract(ProductManager.abi)
    .deploy({ data: ProductManager.bytecode, arguments: argsProductManager })
    .send({ from: admin, gas: gasLimitValue, gasPrice: gasPriceValue })
    .on('receipt', function (receipt) {
      console.log('receipt:', receipt);
    })
    .on('error', function (error) {
        console.log('error:', error.toString());
    });

    console.log('ProductManager.sol has been deployed');
    if (instProductManager === undefined) {
      console.log('[Error] instProductManager is NOT defined');
      } else {console.log('[Good] instProductManager is defined');}
    instProductManager.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!
    addrProductManager = instProductManager.options.address;
    console.log('addrProductManager:', addrProductManager);
    */

  } else {
    console.log('ctrtName is not found');
    process.exit(0);
  }


}
deploy();
  /**
  From KuanYi:
  "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
  "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
 
  https://iancoleman.io/bip39
  m/44'/60'/0'/0/0 	0xa6cc621A179f01A719ee57dB4637A4A1f603A442 	0x02afa51468bfb825ddfa794b360f42c016da3dba10df065a11650b63799befed45 	0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a

  m/44'/60'/0'/0/1 	0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2 	0x025e0eaf152f741fc91f437d0b6dfdaf96c076ad98010a0d60ba0490c05a46bbdd 	0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca

  m/44'/60'/0'/0/2 	0x470Dea51542017db8D352b8B36B798a4B6d92c2E 	0x0384a124835b166c5b3fceec66c861959843eeccb92e18de938be272328692d33f 	0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2

  m/44'/60'/0'/0/3 	0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61 	0x034d315e0adb4a832b692b51478feb1b81e761b9834aaf35f83cd23c43239027ed 	0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45

  m/44'/60'/0'/0/4 	0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E 	0x0231900ed8b38e4c23ede6c151bf794418da573c9f63a1235d8823ab229ed251e3 	0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f
   */