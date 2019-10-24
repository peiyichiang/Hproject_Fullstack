var faker = require('faker');
var _ = require('lodash');
const { symbolNumber, isLivetimeOn } = require('../timeserver/envVariables');
const { getArraysFromCSV, getOneAddrPerLineFromCSV, arraySum } = require('../timeserver/utilities');
const { wlogger } = require('../ethereum/contracts/zsetupData');

wlogger.info(`\n--------------------== zTestParameters.js`);
let crowdFundingAddrArray = [], tokenControllerAddrArray = [], symbolArray = [], nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, fundmanager, addrAssetBookArray;

const assetOwnerArray = [], assetOwnerpkRawArray = [], assetbookArray = [], userArray = [];

const [EOA_List, badEOAs] = getArraysFromCSV('./test_CI/EOA_List.csv', 4);
if(badEOAs.length > 0){
  wlogger.warn(`badEOAs are found: ${badEOAs}`);
} else {
  wlogger.debug(`all EOAs are complete in parts`);
}

wlogger.debug('--------==');
const [Assetbooks, badAssetbooks ] = getOneAddrPerLineFromCSV('./test_CI/Assetbooks.csv');
if(badAssetbooks.length > 0){
  wlogger.warn(`badAssetbooks are found: _${badAssetbooks}_`);
} else {
  wlogger.debug(`all assetbooks are complete in parts`);
}

/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = addproduct, adduser, addorder, im, addsctrt, addia, pm
 */


//fundingType= 1 PO, 2 PP
//Math.round(maxTotalSupply*quantityGoalPercentage);
function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule) {
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

  this.notarizedRentalContract = notarizedRentalContract;
  this.BOEApprovedLetter = BOEApprovedLetter;
  this.powerPurchaseAgreement = powerPurchaseAgreement;
  this.onGridTryrunLetter = onGridTryrunLetter;
  this.powerPlantEquipmentRegisteredLetter = powerPlantEquipmentRegisteredLetter;
  this.powerPlantInsurancePolicy = powerPlantInsurancePolicy;
  this.forecastedAnnualIncomePerModule = forecastedAnnualIncomePerModule;
}

//fundingType: PO: 1, PP: 2
function paddingLeft(str, len){
  if(str.length >= len)
    return str;
  else
    return paddingLeft("0" +str,len);
}

function nowDateAddMinites(date ,min){
  nowDate.setTime(nowDate.setMinutes(nowDate.getMinutes() + min))
  return nowDate.getFullYear() + paddingLeft(String(nowDate.getMonth()+1), 2) + paddingLeft(String(nowDate.getDate()), 2) + paddingLeft(String(nowDate.getHours()), 2) + paddingLeft(String(nowDate.getMinutes()), 2)

}

//productDate = today's Date. ex: 0725 
let nowDate = new Date()
let productDate = paddingLeft(String(nowDate.getMonth()+1), 2) + paddingLeft(String(nowDate.getDate()), 2)
var p_name = faker.name.findName()
const productObj0MaxTotalSupply = Math.floor(Math.random()*10000)+10000

const productObj0 = new productObject(p_name.substr(0, 4).toUpperCase() + productDate, p_name.substr(0, 20), (faker.address.streetAddress() + faker.address.city() + faker.address.country()).substr(0, 40), productObj0MaxTotalSupply, productObj0MaxTotalSupply - 100, 73310, Math.floor(Math.random()*100000) , "NTD", 530, 20, 2, "", "", "", "");


//fundingType= 1 PO, 2 PP
//300k / 15k => 20
//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule) {

//Private
const productObj1 = new productObject("ABEN1901", "Ben1901", "Ben base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 520, 20, 2, "0x04110eC2b17E6593d9BD90273c3B2555F3F8370d", "0x4A4559298E83Bd4fe123AFEeAAdC3665143C971B", "0x5fB1A76955f55CB6EB29668a1103dB6B3874567b", "", ".", ".", ".", ".", ".", ".", 1.0);

//Public
const productObj2 = new productObject("ACUP1902", "Cup1902", "Cupiter base 0001", 1000, 900, 73310, 15000, "NTD", 510, 20, 1, "0xEF22926F586779148E99E47dC4cfd52195557037", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//Private
const productObj3 = new productObject("EINS1915", "愛因斯坦x號", "台南市新營區新工路23號", 969, 500, 300, 16468, "NTD", 540, 20, 2, "0x50268032D63986E89C3Ea462F2859983C7A69b48", "0x7D43F481e658d185f2A199eE8Ed1f831078E5b85", "0x67EE71B1DF787C8707E349b39B83325B1afa2f9d", "0x39B833Ebc8d1b1588bA4c0dBE34Ce883a10c57aB", ".", ".", ".", ".", ".", ".", 1.0);


//Public
const productObj4 = new productObject("AETH1914", "AETH base", "Earth base 0001", 100, 90, 110, 16000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//Public
const productObj5 = new productObject("AFLY1906", "base", "0001", 100, 90, 73310, 17000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//fundingType= 1 PO, 2 PP
//300k / 15k => 20
//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule) {

//Public
const productObj6 = new productObject("ASAT1906", "Satarn1906", "Saturn base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//Public - goal reached
//const productObj7 = new productObject("AMAR1907", "MARS1907", "Mars base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);
const productObj7 = new productObject("EINS1907", "愛因斯坦一號", "台南市新營區新工路23號", 969, 79, 300, 16468, "NTD", 540, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//Public - sold out
//const productObj8 = new productObject("APLU1908", "APLU1908", "Pluto base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);
const productObj8 = new productObject("EINS1908", "愛因斯坦一號", "台南市新營區新工路23號", 79, 61, 300, 16468, "NTD", 540, 20, 1, "0x55D978BCbbA2383e1fBA2b08ca8363032E9837e0", "0x154dEe6C875c8FF546EEb277Ec9DE12f63296250", "0x7fa2d4c352EbF9865686584a95d2C254C58f32D6", "0xe538922EcF3c35e18DE5fF0EB1A753A1c14C5155", ".", ".", ".", ".", ".", ".", 1.0);


//Public
const productObj9 = new productObject("EINS1909", "愛因斯坦一號", "台南市新營區新工路23號", 969, 500, 300, 16468, "NTD", 540, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

//Public
const productObj10 = new productObject("ASUN1910", "SUN1910", "Sun base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 1, "", "", "", "", ".", ".", ".", ".", ".", ".", 1.0);

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4, productObj5, productObj6, productObj7, productObj8, productObj9, productObj10];

//const getLocalTime_API = async () => await getLocalTime();


// const currentTime = await timer.getTimeServerTime();
// wlogger.debug('currentTime', currentTime);
let TimeOfDeployment_CF, CFSD, CFED, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid;
if(isLivetimeOn){
  TimeOfDeployment_CF = -1;
  CFSD = -1;
  CFED = -1;
  TimeOfDeployment_TokCtrl = -1;
  TimeOfDeployment_HCAT = -1;
  TimeOfDeployment_IM = -1;
  TimeTokenUnlock = -1;
  TimeTokenValid =  -1;

} else {
  
  TimeOfDeployment_CF = 201910221410;
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
// if(acTimeOfDeployment_TokCtrl <= CFED) {
//   reject(`[Error] acTimeOfDeployment_TokCtrl <= CFED`);
//   return false;
// }
fundmanager = 'Company_FundManagerN';


/**
index 0: addAssetbooksIntoCFC(serverTime);//blockchain.js
index 1: cancelOverCFEDOrders(serverTime);//blockchain.js
index 2: updateExpiredOrders(serverTime);//blockchain.js
index 3: updateCFC(serverTime);//blockchain.js
index 4: updateTCC(serverTime);//blockchain.js
index 5: calculateLastPeriodProfit(serverTime);//blockchain.js
*/


productObjArray.forEach( (obj) => {
  symbolArray.push(obj.nftSymbol);
  crowdFundingAddrArray.push(obj.addrCrowdFunding);
  tokenControllerAddrArray.push(obj.addrTokenController)
});
wlogger.debug(`\nconst symbolArray = ${symbolArray}; \nconst crowdFundingAddrArray = ${crowdFundingAddrArray}; \nconst tokenControllerAddrArray = ${ tokenControllerAddrArray}\nsymbolNumber: ${symbolNumber}`);

const productObjN = productObjArray[symbolNumber];
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

notarizedRentalContract = productObjN.notarizedRentalContract;
BOEApprovedLetter = productObjN.BOEApprovedLetter;
powerPurchaseAgreement = productObjN.powerPurchaseAgreement;
onGridTryrunLetter = productObjN.onGridTryrunLetter;
powerPlantEquipmentRegisteredLetter = productObjN.powerPlantEquipmentRegisteredLetter;
powerPlantInsurancePolicy = productObjN.powerPlantInsurancePolicy;
forecastedAnnualIncomePerModule = productObjN.forecastedAnnualIncomePerModule;

tokenURI = nftSymbol+"/uri";

let amountArray;
if(initialAssetPricing === 15000){
  amountArray = [20, 19, 10, 3, 15, 2, 9, 14, 1, 7];//$ 15000
} else if(initialAssetPricing === 16000){
  amountArray = [18, 17, 13, 3, 15, 5, 9, 12, 1, 7];//$ 16000
} else if(initialAssetPricing === 17000){
  amountArray = [17, 16, 13, 3, 15, 5, 9, 14, 1, 7];//$ 17000
} else if(initialAssetPricing === 18000){
  amountArray = [16, 15, 13, 3, 14, 5, 9, 13, 1, 11];//$ 18000
} else {
  amountArray = [7,1,6,12,4,17,14,4,6,3,8,5,15,4,9,5,19,15,19,7,6,2,17,20,8,5,10,6,20,19,9,12,14,11,4,9,17,10,7,7,16,16,9,1,17,12,8,17,18,17,5,5,6,11,1,4,2,9,16,16,5,6,18,19,17,20,2,20,11,20,7,14,7,3,7,15,18,14,5,1,16,12,17,3,16,1,13,13,8,2,16,2,1,9,8,4];
  const amountArraySumOut = arraySum(amountArray);

  console.log(`initialAssetPricing is not expected. \namountArray: ${amountArray}, amountArraySumOut: ${amountArraySumOut}`);
  //process.exit(1);
}


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

const authLevel = 5;
const tokenAmtToBuyBase = 500;
EOA_List.forEach((item, index)=> {
  let fillingDigit;
  if(index < 10){ fillingDigit = '0';
  } else { fillingDigit = ''; }

  //wlogger.debug(`\nitem: ${item}`);
  const digits = fillingDigit+index;
  const email = '000a'+digits+'@gmail.com';
  const password = 'user'+digits+'pw';
  const idNumber = 'R9997770'+digits;
  const assetOwnerX = item[1];
  const privateKeyX = item[3];
  const phoneNum = '09375558'+digits;
  const userName = 'Romeo'+digits;
  const assetBookX = Assetbooks[index];
  const tokenAmtToBuy = tokenAmtToBuyBase + index;

  //wlogger.debug(`\n  index: ${index}, EOA: ${assetOwnerX} ${typeof assetOwnerX} \n  pkey: ${privateKeyX} ${typeof privateKeyX}`);
  assetOwnerArray.push(assetOwnerX);
  assetOwnerpkRawArray.push(privateKeyX);

  const userX = new userObject(email, password, idNumber, assetOwnerX, phoneNum, userName, assetBookX, authLevel, tokenAmtToBuy);
  userArray.push(userX);
  assetbookArray.push(assetBookX);
});


userNum = 1;
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
const assetRecord1 = new assetRecordObject('john@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
const assetRecord2 = new assetRecordObject('john@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
const assetRecord3 = new assetRecordObject('john@gmail.com', nftSymbol, TimeTokenUnlock+1, 17, 100, 13000, 0, 0, 13000, 13000);
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
const incomeArrangement1 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);
const incomeArrangement2 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);
const incomeArrangement3 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);
const incomeArrangement4 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+7, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);
const incomeArrangement5 = new incomeArrangementObject(nftSymbol, TimeTokenUnlock+9, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "ia_state_approved", 0);

const incomeArrangementArray = [incomeArrangement1, incomeArrangement2, incomeArrangement3, incomeArrangement4, incomeArrangement5];


wlogger.debug(`
const TimeOfDeployment_CF = ${TimeOfDeployment_CF};
const CFSD = ${CFSD};
const CFED = ${CFED};
const TimeOfDeployment_TokCtrl = ${TimeOfDeployment_TokCtrl};
const TimeOfDeployment_HCAT = ${TimeOfDeployment_HCAT};
const TimeOfDeployment_IM = ${TimeOfDeployment_IM};
const TimeTokenUnlock = ${TimeTokenUnlock}; 
const TimeTokenValid =  ${TimeTokenValid};
const fundmanager = '${fundmanager}';

symbolNumber: ${symbolNumber}
nftSymbol: ${nftSymbol}, nftName: ${nftName}
maxTotalSupply: ${maxTotalSupply}, quantityGoal: ${quantityGoal}
siteSizeInKW: ${siteSizeInKW}, tokenURI: ${tokenURI}
initialAssetPricing: ${initialAssetPricing}, pricingCurrency = ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}
addrTokenController: ${addrTokenController}
addrHCAT721:  ${addrHCAT721}

duration: ${duration}, fundingType: ${fundingType}
`);


module.exports = { productObjArray, symbolArray, crowdFundingAddrArray, assetbookArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray,  TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid, nowDate, userObject, amountArray, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule
}
