const Web3 = require('web3');
const nodeUrl = "http://140.119.101.130:8545";//POA
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));


//let addrIncomeManager, addrProductManager;
console.log('--------------------==zsetupData.js');
let crowdFundingAddrArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, symNum, fundmanager;

const excludedSymbols = ['HToken123', 'NCCU1902','NCCU1901', 'NCCU1801', 'NCCU0531', 'SUNL1607', 'TOKN1999', 'MYRR1701'];
const excludedSymbolsIA = [];

const admin = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
const adminpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
const AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
const AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
const AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
const AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
const AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
const AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
const AssetOwner4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
const AssetOwner4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";
const AssetOwner5 = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
const AssetOwner5pkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";

const AssetOwner6 = "0x6Ae6Bd45E4F30fdFe487BC5940f092a69A72462B";
const AssetOwner6pkRaw = "0x5df6762ff8e898f6ca718844d6be97852f5ea3e0b9f3b9af89cb9f8dd074a6db";
const AssetOwner7 = "0x836434d111AC6893Ff4d6C7547870e6bb1D31B67";
const AssetOwner7pkRaw = "0x85d930838529708da898206a9cc6c8fca172b398011ed414dab48bdb76fe4148";
const AssetOwner8 = "0x52566ac53BD14B4519e063b6A16CC0d249FF8Fd2";
const AssetOwner8pkRaw = "0x3bd92e02137d5678463a23cdff407e5af06ab6b7bfe1b8c8ac172b1ce19182a4";
const AssetOwner9 = "0xe93c0A8845E8477ae460578d2D84d918aaCA37F7";
const AssetOwner9pkRaw = "0x4717997c64e19cfbd4df771c3f8900232b8681c77162bf5de0f5e7dca115237d";
const AssetOwner10 = "0x61D9068dA7B5dF1BBfb0a254Cb40C6739A52bd76";
const AssetOwner10pkRaw = "0x7347b852ddbbb7c1c39e7ca381f4c30ce3cd8adb55a48f7f67310d0a8db3ae68";

const assetOwnerArray = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10];
const assetOwnerpkRawArray = [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw];
//AssetOwner1, AssetOwner1pkRaw    AssetOwner2, AssetOwner2pkRaw   AssetOwner3, AssetOwner3pkRaw

let addrHelium, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrAssetBook4, addrAssetBook5, addrAssetBook6, addrAssetBook7, addrAssetBook8, addrAssetBook9, addrAssetBook10, addrAssetBook0, addrRegistry;
/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = helium, assetbook, registry, cf, tokc, hcat, addproduct, adduser, addorder, im, addsctrt, addia, pm
 */
const chain = 1;
if (chain === 1){
  addrHelium =     "0x49e0c4Fc9edD11d9B565963d36af102C0efaB66a";
  addrAssetBook7 = "0x8e10AB006D5aa5f189Cb3a1417Ee0f187EF56E56";
  addrAssetBook8 = "0xca2628e05A8887295e80c6df474a3D21E563E73A";
  addrAssetBook9 = "0x5F594C7E19EaD79fcDC66C2c5BBdB7AFcF9c4ed1";
  addrRegistry =   "0x551239714e6C2b59d4AAdc9F51825a5BedD4C021";

  addrAssetBook0 = "0x9151d4BC2a05a127477D5938039551218C0c7703";
  addrAssetBook1 = "0x51B48015726C16802C850847682DaBd39596D06a";
  addrAssetBook2 = "0xEa9C8431710206F9092b6146b0C275eeFCC07812";
  addrAssetBook3 = "0x0F55D711f5D81df7e13BF3D3a69bD44a6eB6A95A";
  addrAssetBook4 = "0xcDEB03D6B6dfE94B21e802ec7db4e808CF0F2F16";
  addrAssetBook5 = "0x61490b4f58Ef5D6ce1e20a74E99Aaae076F433cd";
  addrAssetBook6 = "0xccaF9388399d2BC9Bb9a4038b6adb4f2c54196eE";
  addrAssetBook10 = "0xF9f35EACEEc9b8031c9534D7E5a508A86DA224BE";
  
} else if (chain === 2){
  //ganache chain
  addrHelium = "";
  addrAssetBook1 ="";
  addrAssetBook2 = "";
  addrAssetBook3 = "";
  addrRegistry =   "";
}

//fundingType= 1 PO, 2 PP
//Math.round(maxTotalSupply*quantityGoalPercentage);
function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
  this.nftSymbol = nftSymbol;
  this.maxTotalSupply = maxTotalSupply;
  this.quantityGoal = quantityGoal;
  this.siteSizeInKW = siteSizeInKW;
  this.initialAssetPricing = initialAssetPricing;
  this.pricingCurrency = pricingCurrency;
  this.fundingType = fundingType;
  this.IRR20yrx100 = IRR20yrx100;
  this.duration = duration;
  this.nftName = nftName;
  this.location = location;//.substr(0, nftSymbol.length-4)
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
const TimeOfDeployment_CF = 201905281410;
const CFSD = TimeOfDeployment_CF+10;
const CFED = TimeOfDeployment_CF+15;
const TimeOfDeployment_TokCtrl = TimeOfDeployment_CF + 20;
const TimeOfDeployment_HCAT = TimeOfDeployment_CF + 21;
const TimeOfDeployment_IM = TimeOfDeployment_CF + 22;
const TimeTokenUnlock = TimeOfDeployment_CF+30; 
const TimeTokenValid =  TimeOfDeployment_CF+90;
fundmanager = 'FundManagerN';

//fundingType: PO: 1, PP: 2
symNum = 1;
//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
const productObj0 = new productObject("AMER1901", "Mercury1901", "Mercury base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 530, 20, 1, "", "", "", "");

const productObj1 = new productObject("AVEN1902", "Venus1902", "Venus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 520, 20, 1, "0x9796376315CE9DBE0f78Da6f3f26B60048852B5b", "0x77aC1f79a02B5D8D3A4aED5647cEDf25A68cb577", "0xA43a549f6C785A85F485c6ff30E3AE627104E1C4", "0x36502181603025f9C01A9876D5267183FC9b9628");

const productObj2 = new productObject("AJUP1903", "Jupiter1903", "Jupiter base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 510, 20, 1, "", "", "", "");

const productObj3 = new productObject("AURA1904", "Uranus1904", "Uranus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 500, 20, 1, "", "", "", "");

const productObj4 = new productObject("ANEP1904", "Neptune", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObj5 = new productObject("AOOT1907", "tokenNameZZZ", "MARS0001", 1000000000, 900000000, 73310, 22000, "NTD", 490, 20, 2, "0x85a754958966eA626d1e248D4C94BE79097f0A1a", "0x5398e00628Ee4Dd0a55a185595Dba8214c4D3090", "0x1Ebb4797058fcbC1B38Bdb0e701DeF384f9ba85c", "0x1Fc366016bCAaC35C48D37D956289Dd5B230265b");


//const isTestingMode = true;
const isTestingMode = false;
const whichTimeServerArray = [1, 1, 1, 1, 1, 1];//timeserver
//const whichTimeServerArray = [0, 0, 0, 0, 0, 0];//timeserver
/**
index 0: addAssetbooksIntoCFC(serverTime);//blockchain.js
index 1: cancelOverCFEDOrders(serverTime);//blockchain.js
index 2: updateExpiredOrders(serverTime);//blockchain.js
index 3: updateCFC(serverTime);//blockchain.js
index 4: updateTCC(serverTime);//blockchain.js
index 5: checkIncomeManager(serverTime);//blockchain.js
*/
if(whichTimeServerArray.length !== 6){
  console.log('whichTimeServerArray should have length ===', 6);
  process.exit(1);
}

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4, productObj5];
const symbolArray = [];
crowdFundingAddrArray= [];
tokenControllerAddrArray= [];

productObjArray.forEach( (obj) => {
  symbolArray.push(obj.nftSymbol);
  crowdFundingAddrArray.push(obj.addrCrowdFunding);
  tokenControllerAddrArray.push(obj.addrTokenController)
});
console.log('\nconst symbolArray =', symbolArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray,';');

console.log('symNum', symNum);
const productObjN = productObjArray[symNum];
nftName = productObjN.nftName;
nftSymbol = productObjN.nftSymbol;
maxTotalSupply = productObjN.maxTotalSupply;
quantityGoal = productObjN.quantityGoal;
siteSizeInKW = productObjN.siteSizeInKW;
initialAssetPricing = productObjN.initialAssetPricing;
pricingCurrency = productObjN.pricingCurrency;
IRR20yrx100 = productObjN.IRR20yrx100;
duration = productObjN.duration;
location = productObjN.location;
fundingType = productObjN.fundingType;
addrTokenController = productObjN.addrTokenController;
addrHCAT721 = productObjN.addrHCAT721;
addrCrowdFunding = productObjN.addrCrowdFunding;
addrIncomeManager = productObjN.addrIncomeManager;

addrProductManager= '';

tokenURI = nftSymbol+"/uri";

function userObject(email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, tokenOrderAmount) {
  this.email = email;
  this.password = password;
  this.identityNumber = identityNumber;
  this.eth_add = eth_add;
  this.cellphone = cellphone;
  this.name = name;
  this.addrAssetBook = addrAssetBook;
  this.investorLevel = investorLevel;
  this.tokenOrderAmount = tokenOrderAmount;
  this.imagef = Math.random().toString(36).substring(2, 15);
  this.imageb = Math.random().toString(36).substring(2, 15);
  this.bank_booklet = Math.random().toString(36).substring(2, 15);
}
const user0 = new userObject('000a0@gmail.com', 'user0pw', 'R999777000', admin, '093755500', 'Romeo0', addrAssetBook0, 5, 1);
const user1 = new userObject('000a1@gmail.com', 'user1pw', 'R999777001', AssetOwner1, '093755501', 'Romeo0', addrAssetBook1, 5, 1);
const user2 = new userObject('000a2@gmail.com', 'user2pw', 'R999777002', AssetOwner2, '093755502', 'Romeo0', addrAssetBook2, 5, 1);
const user3 = new userObject('000a3@gmail.com', 'user3pw', 'R999777003', AssetOwner3, '093755503', 'Romeo0', addrAssetBook3, 5, 1);
const user4 = new userObject('000a4@gmail.com', 'user4pw', 'R999777004', AssetOwner4, '093755504', 'Romeo0', addrAssetBook4, 5, 1);
const user5 = new userObject('000a5@gmail.com', 'user5pw', 'R999777005', AssetOwner5, '093755505', 'Romeo0', addrAssetBook5, 5, 1);
const user6 = new userObject('000a6@gmail.com', 'user6pw', 'R999777006', AssetOwner6, '093755506', 'Romeo0', addrAssetBook6, 5, 1);

const user7 = new userObject('000a7@gmail.com', 'user7pw', 'R999777007', AssetOwner7, '093755507', 'Romeo7', addrAssetBook7, 5, 10);
const user8 = new userObject('000a8@gmail.com', 'user8pw', 'R999777008', AssetOwner8, '093755508', 'Romeo8', addrAssetBook8, 5, 5);
const user9 = new userObject('000a9@gmail.com', 'user9pw', 'R999777009', AssetOwner9, '093755509', 'Romeo9', addrAssetBook9, 5, 15);
const user10 = new userObject('000a0@gmail.com', 'user0pw', 'R999777000', AssetOwner10, '093755510', 'Romeo10', addrAssetBook10, 5, 1);

const userArray = [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];

userNum = 9;
const userObjN = userArray[userNum];
const email = userObjN.email;
const password = userObjN.password;
const identityNumber = userObjN.identityNumber;
const eth_add = userObjN.eth_add;
const cellphone = userObjN.cellphone;
const name = userObjN.name;
const addrAssetBook = userObjN.addrAssetBook;
const investorLevel = userObjN.investorLevel;
const imagef = userObjN.imagef;
const imageb = userObjN.imageb;
const bank_booklet = userObjN.bank_booklet;


//-----------------------== Asset Record
function assetRecordObject(investorEmail, symbol, ar_time, holdingAmount, AccumulatedIncomePaid, UserAssetValuation, HoldingAmountChanged, HoldingCostChanged, AcquiredCost, MovingAverageofHoldingCost) {
  this.investorEmail = investorEmail;
  this.symbol = symbol;
  this.ar_time = ar_time;
  this.holdingAmount = holdingAmount;
  this.AccumulatedIncomePaid = AccumulatedIncomePaid;
  this.UserAssetValuation = UserAssetValuation;
  this.HoldingAmountChanged = HoldingAmountChanged;
  this.HoldingCostChanged = HoldingCostChanged;
  this.AcquiredCost = AcquiredCost;
  this.MovingAverageofHoldingCost = MovingAverageofHoldingCost;
}
const assetRecord1 = new assetRecordObject('johndoe@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
const assetRecord2 = new assetRecordObject('johndoe@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
const assetRecord3 = new assetRecordObject('johndoe@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
const assetRecordArray = [assetRecord1, assetRecord2, assetRecord3];


//-----------------------== Income Arrangement
function incomeArrangementObject(symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome) {
  this.symbol = symbol;
  this.ia_time = ia_time;
  this.actualPaymentTime = actualPaymentTime;
  this.payablePeriodEnd = payablePeriodEnd;
  this.annualEnd = annualEnd;
  this.wholecasePrincipalCalledBack = wholecasePrincipalCalledBack;
  this.wholecaseBookValue = wholecaseBookValue;
  this.wholecaseForecastedAnnualIncome = wholecaseForecastedAnnualIncome;
  this.wholecaseForecastedPayableIncome = wholecaseForecastedPayableIncome;
  this.wholecaseAccumulatedIncome = wholecaseAccumulatedIncome;
  this.wholecaseIncomeReceivable = wholecaseIncomeReceivable;
  this.wholecaseTheoryValue = wholecaseTheoryValue;
  this.singlePrincipalCalledBack = singlePrincipalCalledBack;
  this.singleForecastedAnnualIncome = singleForecastedAnnualIncome;
  this.singleForecastedPayableIncome = singleForecastedPayableIncome;
  this.singleActualIncomePayment = singleActualIncomePayment;
  this.singleAccumulatedIncomePaid = singleAccumulatedIncomePaid;
  this.singleTokenMarketPrice = singleTokenMarketPrice;
  this.ia_state = ia_state;
  this.singleCalibrationActualIncome = singleCalibrationActualIncome;
}
const incomeArrangement1 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const incomeArrangement2 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const incomeArrangement3 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const incomeArrangementArray = [incomeArrangement1, incomeArrangement2, incomeArrangement3];






console.log(`
const TimeOfDeployment_CF = ${TimeOfDeployment_CF};
const CFSD = ${CFSD};
const CFED = ${CFED};
const TimeOfDeployment_TokCtrl = ${TimeOfDeployment_TokCtrl};
const TimeOfDeployment_HCAT = ${TimeOfDeployment_HCAT};
const TimeOfDeployment_IM = ${TimeOfDeployment_IM};
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

duration: ${duration}, fundingType: ${fundingType}
`);

const argsCrowdFunding = [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD, CFED, TimeOfDeployment_CF, addrHelium];

const argsTokenController = [
  TimeOfDeployment_TokCtrl, TimeTokenUnlock, TimeTokenValid, addrHelium ];

const nftName_bytes32 = web3.utils.fromAscii(nftName);
const nftSymbol_bytes32 = web3.utils.fromAscii(nftSymbol);
const pricingCurrency_bytes32 = web3.utils.fromAscii(pricingCurrency);
const tokenURI_bytes32 = web3.utils.fromAscii(tokenURI);

const argsHCAT721 = [
nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
addrRegistry, addrTokenController, tokenURI_bytes32, addrHelium,TimeOfDeployment_HCAT];
const argsIncomeManager =[addrHCAT721, addrHelium, TimeOfDeployment_IM];
const addrZero = "0x0000000000000000000000000000000000000000";

//const assetbookArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];


console.log('loading blockchain.js smart contract json files');
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

const IncomeManager = require('./build/IncomeManagerCtrt.json');
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


//---------------------------==
/*
authLevel & STO investor classification on purchase amount and holding balance restrictions in case of public offering and private placement, for each symbol; currency = NTD
1 Natural person: 0, 0; UnLTD, UnLTD;
2 Professional institutional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
3 High Networth investment legal person: UnLTD, UnLTD; UnLTD, UnLTD; 
4 Legal person or fund of a professional investor: UnLTD, UnLTD; UnLTD, UnLTD; 
5 Natural person of Professional investor: 100k, 100k; UnLTD, UnLTD;
*/
function PersonClassified(maxOrderPaymentPublic, maxBalancePublic, maxOrderPaymentPrivate, maxBalancePrivate) {
  this.maxOrderPaymentPublic = maxOrderPaymentPublic;
  this.maxBalancePublic = maxBalancePublic;
  this.maxOrderPaymentPrivate = maxOrderPaymentPrivate;
  this.maxBalancePrivate = maxBalancePrivate;
}
//maxOrderPaymentPublic, maxBalancePublic, maxOrderPaymentPrivate, maxBalancePrivate
let NaturalPerson = new PersonClassified(0, 0, Infinity, Infinity);
let ProfInstitutionalInvestor = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let HighNetworthInvestmentLegalPerson = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let LegalPersonOrFundOfProfInvestor = new PersonClassified(Infinity, Infinity, Infinity, Infinity);
let NaturalPersonOfProfInvestor = new PersonClassified(300000, 300000, Infinity, Infinity);

const COMPLIANCE_LEVELS = {
  "currencyType": "NTD",
  "1": NaturalPerson,
  "2": ProfInstitutionalInvestor,
  "3": HighNetworthInvestmentLegalPerson,
  "4": LegalPersonOrFundOfProfInvestor,
  "5": NaturalPersonOfProfInvestor
};


const checkCompliance = (authLevel, balance, orderPayment, fundingType) => {
  console.log('\n[checkCompliance] authLevel', authLevel, typeof authLevel, 'balance', balance, typeof balance, 'orderPayment', orderPayment, typeof orderPayment, 'fundingType', fundingType, typeof fundingType);

  if(typeof authLevel !== 'string'){
    console.log('\n[checkCompliance] authLevel should be of type string:', authLevel);
    return false;
  } else if (typeof fundingType !== 'string') {
    console.log('\n[checkCompliance] fundingType should be of type string:', fundingType);
    return false;
  } else if (typeof balance !== 'number' || isNaN(balance)) {
    console.log('\n[checkCompliance] balance should be of type number and not NaN:', balance);
    return false;
  } else if (typeof orderPayment !== 'number' || isNaN(balance)) {
    console.log('\n[checkCompliance] orderPayment should be of type number and not NaN:', orderPayment);
    return false;

  } else if (fundingType === "PublicOffering" || fundingType === '1') {
      console.log("inside fundingType == PublicOffering\n", COMPLIANCE_LEVELS[authLevel]);
      if (orderPayment > COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic) {
          console.log(`orderPayment ${orderPayment} should be <= maxOrderPaymentPublic ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic}`);
          return false;

      } else if (balance + orderPayment > COMPLIANCE_LEVELS[authLevel].maxBalancePublic) {
          console.log(`balance + orderPayment ${balance + orderPayment} should be <= maxBalancePublic orderPayment ${COMPLIANCE_LEVELS[authLevel].maxBalancePublic}`);
          return false;

        } else {
          console.log("passing both orderPayment and new balance regulation for Public Offering");
          console.log(`orderPayment ${orderPayment} <= maxOrderPaymentPublic ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic}`);
          console.log(`balance + orderPayment ${balance + orderPayment} <= maxBalancePublic orderPayment ${COMPLIANCE_LEVELS[authLevel].maxBalancePublic}`);
          return true;
      }

  } else if (fundingType === "PrivatePlacement" || fundingType === '2') {
      console.log("inside fundingType == PrivatePlacement\n", COMPLIANCE_LEVELS[authLevel]);
      if (orderPayment > COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate) {
          console.log(`orderPayment ${orderPayment} should be <= maxOrderPaymentPrivate ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate}`);
          return false;

      } else if (balance + orderPayment > COMPLIANCE_LEVELS[authLevel].maxBalancePrivate) {
          console.log(`balance + orderPayment ${balance+orderPayment} should be <= maxBalancePrivate ${ COMPLIANCE_LEVELS[authLevel].maxBalancePrivate}`);
          return false;

        } else {
          console.log("passing both orderPayment and new balance regulation for Private Placement");
          console.log(`orderPayment ${orderPayment} <= maxOrderPaymentPrivate ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate}`);
          console.log(`balance + orderPayment ${balance+orderPayment} <= maxBalancePrivate ${ COMPLIANCE_LEVELS[authLevel].maxBalancePrivate}`);
          return true;
      }
  } else {
      console.log('fundingType is not valid', fundingType);
      return false;
  }

}

module.exports = {
  addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, symNum,
  TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, isTestingMode,
  CFSD, CFED, TimeTokenUnlock, TimeTokenValid, whichTimeServerArray,
  argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManager,
  TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManager, ProductManager, 
  email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, excludedSymbols, excludedSymbolsIA, COMPLIANCE_LEVELS, checkCompliance
}
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
