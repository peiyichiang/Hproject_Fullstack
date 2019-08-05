const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

const {isTimeserverON, admin, adminpkRaw } = require('../../timeserver/envVariables');

const AssetOwner1 = '0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2';
const AssetOwner1pkRaw = '0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca';
const AssetOwner2 = '0x470Dea51542017db8D352b8B36B798a4B6d92c2E';
const AssetOwner2pkRaw = '0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2';
const AssetOwner3 = '0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61';
const AssetOwner3pkRaw = '0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45';
const AssetOwner4 = '0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E';
const AssetOwner4pkRaw = '0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f';
const AssetOwner5 = '0xa6cc621A179f01A719ee57dB4637A4A1f603A442';
const AssetOwner5pkRaw = '0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a';

const AssetOwner6 = '0x6Ae6Bd45E4F30fdFe487BC5940f092a69A72462B';
const AssetOwner6pkRaw = '0x5df6762ff8e898f6ca718844d6be97852f5ea3e0b9f3b9af89cb9f8dd074a6db';
const AssetOwner7 = '0x836434d111AC6893Ff4d6C7547870e6bb1D31B67';
const AssetOwner7pkRaw = '0x85d930838529708da898206a9cc6c8fca172b398011ed414dab48bdb76fe4148';
const AssetOwner8 = '0x52566ac53BD14B4519e063b6A16CC0d249FF8Fd2';
const AssetOwner8pkRaw = '0x3bd92e02137d5678463a23cdff407e5af06ab6b7bfe1b8c8ac172b1ce19182a4';
const AssetOwner9 = '0xe93c0A8845E8477ae460578d2D84d918aaCA37F7';
const AssetOwner9pkRaw = '0x4717997c64e19cfbd4df771c3f8900232b8681c77162bf5de0f5e7dca115237d';
const AssetOwner10 = '0x61D9068dA7B5dF1BBfb0a254Cb40C6739A52bd76';
const AssetOwner10pkRaw = '0x7347b852ddbbb7c1c39e7ca381f4c30ce3cd8adb55a48f7f67310d0a8db3ae68';

/*require("dotenv").config();
const AssetOwner1 = process.env.AssetOwner1;
const AssetOwner1pkRaw = process.env.AssetOwner1pkRaw;
const AssetOwner2 = process.env.AssetOwner2;
const AssetOwner2pkRaw = process.env.AssetOwner2pkRaw;
const AssetOwner3 = process.env.AssetOwner3;
const AssetOwner3pkRaw = process.env.AssetOwner3pkRaw;
const AssetOwner4 = process.env.AssetOwner4;
const AssetOwner4pkRaw = process.env.AssetOwner4pkRaw;
const AssetOwner5 = process.env.AssetOwner5;
const AssetOwner5pkRaw = process.env.AssetOwner5pkRaw;

const AssetOwner6 = process.env.AssetOwner6;
const AssetOwner6pkRaw = process.env.AssetOwner6pkRaw;
const AssetOwner7 = process.env.AssetOwner7;
const AssetOwner7pkRaw = process.env.AssetOwner7pkRaw;
const AssetOwner8 = process.env.AssetOwner8;
const AssetOwner8pkRaw = process.env.AssetOwner8pkRaw;
const AssetOwner9 = process.env.AssetOwner9;
const AssetOwner9pkRaw = process.env.AssetOwner9pkRaw;
const AssetOwner10 = process.env.AssetOwner10;
const AssetOwner10pkRaw = process.env.AssetOwner10pkRaw;
*/

//let addrIncomeManager, addrProductManager;
console.log('--------------------==zsetupData.js');
let crowdFundingAddrArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, symNum, fundmanager, whichTimeServerArray;

const excludedSymbols = ['HToken123', 'NCCU1902','NCCU1901', 'NCCU1801', 'NCCU0531', 'SUNL1607', 'TOKN1999', 'MYRR1701', 'AMER1901', 'AVEN1902', 'AJUP1903', 'ANEP1905', 'AOOT1907', 'NCCC0801'];//'AURA1904'
const excludedSymbolsIA = [];


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
  addrHelium =     "0xEEB51B9B88824a491b076737EBdd40b3babaB3bB";
  addrRegistry =   "0x067E900608Df20060d7597bc4EB1d08b9B1f0C3c";

  addrAssetBook0 = "0x33a00F47501a684593Fbdc51bE6086C3Bc8aCe83";
  addrAssetBook1 = "0x19746ba6B0c85052fB24f4120c9072789d0f7301";
  addrAssetBook2 = "0x7b8e3d6f83Ed2985585635E0274Fe3C7F068f734";
  addrAssetBook3 = "0x60Dc809FD5eF50a4F1826339F2931eaeF5Ce8d72";
  addrAssetBook4 = "0x1a51ae9f18819b177E590f2f3129E050E276Ab15";
  addrAssetBook5 = "0x32dAa83f1c4449c6835297909FF4688C7d3f0A4b";
  addrAssetBook6 = "0x82a1d59a0245a7Ee6cDb436C24994b7b6CC9b2CB";
  addrAssetBook7 = "0xFbAE3234ec2E9cBA59B9E358B764DC24f025C3cc";
  addrAssetBook8 = "0x4819359B20ba011f7517aE804772C0f9d28eB762";
  addrAssetBook9 = "0x7c56b4EE6dF3701029C824944D7a6C2bf0efD38a";
  addrAssetBook10 = "0x48BfFeCdbc8ac0851CFe2cBa31DA0826974B29b5";
  
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

//fundingType: PO: 1, PP: 2

//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
const productObj0 = new productObject("AMER1901", "Mercury1901", "Mercury base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 530, 20, 1, "", "", "", "");

const productObj1 = new productObject("AVEN1902", "Venus1902", "Venus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 520, 20, 1, "", "", "", "");

const productObj2 = new productObject("AJUP1903", "Jupiter1903", "Jupiter base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 510, 20, 1, "", "", "", "");

const productObj3 = new productObject("AURA1904", "Uranus1904", "Uranus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 500, 20, 1, "", "", "", "");

const productObj4 = new productObject("ANEP1905", "Neptune1905", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "0x5Fd93F8a4B023D837f0b04bb2836Daf535BfeFBF", "0x3a7BeC42Da08Ad2bDe31D03489925ab44C7D9f4E", "0x152CB125DA1d0bd8B71f441fEdb8e22dc1189F0f", "0x176332F32818e7a2DcD9802d465f96d602476751");

const productObj5 = new productObject("AOOT1907", "AOOT1907", "MARS0001", 1000000000, 900000000, 73310, 22000, "NTD", 490, 20, 2, "", "", "", "");

const productObj6 = new productObject("ASAT1906", "Satarn1906", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObj7 = new productObject("AMAR1907", "MARS1907", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObj8 = new productObject("APLU1908", "APLU1908", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObj9 = new productObject("AHOB1909", "HOBBLE1909", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObj10 = new productObject("ASUN1910", "SUN1910", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "");

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4, productObj5, productObj6, productObj7, productObj8, productObj9, productObj10];

symNum = 4;


// const currentTime = await timer.getTime();
// console.log('currentTime', currentTime);
let TimeOfDeployment_CF, CFSD, CFED, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid;
if(isTimeserverON){
  TimeOfDeployment_CF = -1;
  CFSD = -1;
  CFED = -1;
  TimeOfDeployment_TokCtrl = -1;
  TimeOfDeployment_HCAT = -1;
  TimeOfDeployment_IM = -1;
  TimeTokenUnlock = -1;
  TimeTokenValid =  -1;

} else {
  TimeOfDeployment_CF = 201905281410;
  CFSD = TimeOfDeployment_CF+10;
  CFED = TimeOfDeployment_CF+15;
  TimeOfDeployment_TokCtrl = TimeOfDeployment_CF + 20;
  TimeOfDeployment_HCAT = TimeOfDeployment_CF + 21;
  TimeOfDeployment_IM = TimeOfDeployment_CF + 22;
  TimeTokenUnlock = TimeOfDeployment_CF+30; 
  TimeTokenValid =  TimeOfDeployment_CF+90;
}
fundmanager = 'Company_FundManagerN';


/**
index 0: addAssetbooksIntoCFC(serverTime);//blockchain.js
index 1: cancelOverCFEDOrders(serverTime);//blockchain.js
index 2: updateExpiredOrders(serverTime);//blockchain.js
index 3: updateCFC(serverTime);//blockchain.js
index 4: updateTCC(serverTime);//blockchain.js
index 5: calculateLastPeriodProfit(serverTime);//blockchain.js
*/

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
//email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, tokenOrderAmount
const user0 = new userObject('000a0@gmail.com', 'user0pw', 'R999777000', admin, '093755500', 'Romeo0', addrAssetBook0, 5, 513);
const user1 = new userObject('000a1@gmail.com', 'user1pw', 'R999777001', AssetOwner1, '093755501', 'Romeo1', addrAssetBook1, 5, 514);
const user2 = new userObject('000a2@gmail.com', 'user2pw', 'R999777002', AssetOwner2, '093755502', 'Romeo2', addrAssetBook2, 5, 534);
const user3 = new userObject('000a3@gmail.com', 'user3pw', 'R999777003', AssetOwner3, '093755503', 'Romeo3', addrAssetBook3, 5, 546);
const user4 = new userObject('000a4@gmail.com', 'user4pw', 'R999777004', AssetOwner4, '093755504', 'Romeo4', addrAssetBook4, 5, 558);
const user5 = new userObject('000a5@gmail.com', 'user5pw', 'R999777005', AssetOwner5, '093755505', 'Romeo5', addrAssetBook5, 5, 562);
const user6 = new userObject('000a6@gmail.com', 'user6pw', 'R999777006', AssetOwner6, '093755506', 'Romeo6', addrAssetBook6, 5, 573);

const user7 = new userObject('000a7@gmail.com', 'user7pw', 'R999777007', AssetOwner7, '093755507', 'Romeo7', addrAssetBook7, 5, 584);
const user8 = new userObject('000a8@gmail.com', 'user8pw', 'R999777008', AssetOwner8, '093755508', 'Romeo8', addrAssetBook8, 5, 597);
const user9 = new userObject('000a9@gmail.com', 'user9pw', 'R999777009', AssetOwner9, '093755509', 'Romeo9', addrAssetBook9, 5, 605);
const user10 = new userObject('000a10@gmail.com', 'user10pw', 'R999777010', AssetOwner10, '093755510', 'Romeo10', addrAssetBook10, 5, 619);

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
function incomeArrangementObject(symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, assetRecordStatus, ia_state, singleCalibrationActualIncome) {
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
  this.assetRecordStatus = assetRecordStatus;
  this.ia_state = ia_state;
  this.singleCalibrationActualIncome = singleCalibrationActualIncome;
}
const incomeArrangement1 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
const incomeArrangement2 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
const incomeArrangement3 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
const incomeArrangement4 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+7, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);
const incomeArrangement5 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+9, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "ia_state_approved", 0);

const incomeArrangementArray = [incomeArrangement1, incomeArrangement2, incomeArrangement3, incomeArrangement4, incomeArrangement5];


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


//---------------------------==Winston Logger
const loglevel = 'warn';//to show/hide logs.
//value = silly, debug, verbose, info, warn, and error
//console.log => wlogger.verbose, wlogger.warn, wlogger.error

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    info => `${info.level}: ${info.message}`,
  ),
);//${info.timestamp} 

//add file and console wloggers to the winston instance
winston.loggers.add('format1', {
  format: logFormat,
  transports: [
    new winstonDailyRotateFile({
      filename: './logs/custom-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
    }),
    new winston.transports.Console({
      level: loglevel,
    }),
  ],
});

const wlogger = winston.loggers.get('format1');
// wlogger.silly('Trace message, Winston!');
// wlogger.debug('Debug message, Winston!');
// wlogger.verbose('A bit more info, Winston!');
// wlogger.info('Hello, Winston!');
// wlogger.warn('Heads up, Winston!');
// wlogger.error('Danger, Winston!');

//---------------------------==


module.exports = {
  addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, admin, adminpkRaw, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, symNum, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid, 
  TestCtrt, Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManager, ProductManager, 
  email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, excludedSymbols, excludedSymbolsIA, COMPLIANCE_LEVELS, checkCompliance, wlogger
}