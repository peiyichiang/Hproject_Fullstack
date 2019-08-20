const {isTimeserverON, admin, adminpkRaw } = require('../../timeserver/envVariables');
const { sLog } = require('../../timeserver/utilities');

sLog(`\n------------------==zTestParameters.js`);
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

/*newly deployed assetbooks
addrAssetBook0 = "0x9cfb84eCC3E8990EEFF56FE6ED601A9b9deee4bA";
addrAssetBook1 = "0x6679c0a52285B3005bab5c196edEe458eA0011c7";
addrAssetBook2 = "0x73D88777C4e29B1ccf9F45964827dE2Eb5076d00";
addrAssetBook3 = "0x4E669A79886b11a3BA98D10E6aDe0F94D09E3C8E";
addrAssetBook4 = "0xDA542FBE8515c4784aC81A8ABF5c2C55e33df33d";
addrAssetBook5 = "0xCAFe7aD86205b4b43c0B95a1B55bF8a54A153Ee2";
addrAssetBook6 = "0x824A7d628A3D58d0068c6614CC6367f801B31CdA";
addrAssetBook7 = "0x915eb0eFB735AF262832a8645129f6Ff26E70699";
addrAssetBook8 = "0x2eB48E0B6350300b5082A6F388a56A679A12ad73";
addrAssetBook9 = "0xb2223A54065351E36BF341d0a3d99095D575570F";
addrAssetBook10 = "0xBF0b705c7d3051aC75F21350842f15D3C21b72Da";
*/

//let addrIncomeManager, addrProductManager;

let crowdFundingAddrArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, symNum, fundmanager;


const assetOwnerArray = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5, AssetOwner6, AssetOwner7, AssetOwner8, AssetOwner9, AssetOwner10];
const assetOwnerpkRawArray = [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw, AssetOwner6pkRaw, AssetOwner7pkRaw, AssetOwner8pkRaw, AssetOwner9pkRaw, AssetOwner10pkRaw];
//AssetOwner1, AssetOwner1pkRaw    AssetOwner2, AssetOwner2pkRaw   AssetOwner3, AssetOwner3pkRaw

let addrHelium, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrAssetBook4, addrAssetBook5, addrAssetBook6, addrAssetBook7, addrAssetBook8, addrAssetBook9, addrAssetBook10, addrAssetBook0, addrRegistry;
/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = addproduct, adduser, addorder, im, addsctrt, addia, pm
 */
const chain = 1;
if (chain === 1){
  addrHelium =     "0xEEB51B9B88824a491b076737EBdd40b3babaB3bB";
  addrRegistry =   "0x067E900608Df20060d7597bc4EB1d08b9B1f0C3c";
  //addrRegistry = "0x7FD747B276687A55f48d9ad91c11a43b07461E4c";new

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
function paddingLeft(str,lenght){
  if(str.length >= lenght)
    return str;
  else
    return paddingLeft("0" +str,lenght);
}

function nowDateAddMinites(date ,min){
  nowDate.setTime(nowDate.setMinutes(nowDate.getMinutes() + min))
  return nowDate.getFullYear() + paddingLeft(String(nowDate.getMonth()+1), 2) + paddingLeft(String(nowDate.getDate()), 2) + paddingLeft(String(nowDate.getHours()), 2) + paddingLeft(String(nowDate.getMinutes()), 2)

}

//productDate = today's Date. ex: 0725 
let nowDate = new Date()
let productDate = paddingLeft(String(nowDate.getMonth()+1), 2) + paddingLeft(String(nowDate.getDate()), 2)

const productObj0 = new productObject("TSTA" + productDate, "Mercury1901", "Mercury base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 530, 20, 1, "", "", "", "");


//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
//const productObj0 = new productObject("AMER1903", "Mercury1901", "Mercury base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 530, 20, 2, "0xF811f727da052379D8cbfBF1188E290B32ff9f99", "0x9812d0eBcd89d8491Bca80000c147f739B9Cef73", "0x57B7c9837cFc7fC2f0510d16cc52D2F0Dc10276A", "");

const productObj1 = new productObject("AVEN1902", "Venus1902", "Venus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 520, 20, 1, "0xaCab94A5d3650873F85E16Abadfb15AFf87fe65C", "0x67b96f80AfE5C74fb366ae4A4e1A88813a940Fc9", "0xA80c0A88e38aa61190A3Ad41bd3907774D291f87", "0xCb5B388E9f4f7028547797a4C0C1844f9e04Cecd");

const productObj2 = new productObject("AJUP1903", "Jupiter1903", "Jupiter base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 510, 20, 2, "", "", "", "");

const productObj3 = new productObject("AURA1904", "Uranus1904", "Uranus base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 500, 20, 2, "", "", "", "");

const productObj4 = new productObject("ANEP1905", "Neptune1905", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "0x5Fd93F8a4B023D837f0b04bb2836Daf535BfeFBF", "0x3a7BeC42Da08Ad2bDe31D03489925ab44C7D9f4E", "0x152CB125DA1d0bd8B71f441fEdb8e22dc1189F0f", "0x176332F32818e7a2DcD9802d465f96d602476751");

const productObj5 = new productObject("AOOT1907", "AOOT1907", "MARS0001", 1000000000, 900000000, 73310, 22000, "NTD", 490, 20, 2, "", "", "", "");

const productObj6 = new productObject("ASAT1906", "Satarn1906", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj7 = new productObject("AMAR1907", "MARS1907", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj8 = new productObject("APLU1908", "APLU1908", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj9 = new productObject("AHOB1909", "HOBBLE1909", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj10 = new productObject("ASUN1910", "SUN1910", "Neptune base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4, productObj5, productObj6, productObj7, productObj8, productObj9, productObj10];

symNum = 0;


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
  
  /*TimeOfDeployment_CF = productDate;
  CFSD = nowDateAddMinites(nowDate, 10);
  CFED = nowDateAddMinites(nowDate, 15);
  TimeOfDeployment_TokCtrl = nowDateAddMinites(nowDate, 20);
  TimeOfDeployment_HCAT = nowDateAddMinites(nowDate, 21);
  TimeOfDeployment_IM = nowDateAddMinites(nowDate, 22);
  TimeTokenUnlock = nowDateAddMinites(nowDate, 30); 
  TimeTokenValid =  nowDateAddMinites(nowDate, 90);*/
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
sLog(`const symbolArray = ${symbolArray}; \nconst crowdFundingAddrArray = ${crowdFundingAddrArray}; \nconst tokenControllerAddrArray = ${ tokenControllerAddrArray}\nsymNum: ${symNum}`);

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


sLog(`
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
addrTokenController: ${addrTokenController}
addrHCAT721:  ${addrHCAT721}

duration: ${duration}, fundingType: ${fundingType}
`);


module.exports = { addrHelium, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, symNum, TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid,
  
}
/**
email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb,
 */