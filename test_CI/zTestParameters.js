var faker = require('faker');
var _ = require('lodash');
const { symbolNumber, isTimeserverON } = require('../timeserver/envVariables');
const { getArraysFromCSV, getOneAddrPerLineFromCSV } = require('../timeserver/utilities');
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
//function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {

//Private
const productObj1 = new productObject("ABEN1901", "Ben1901", "Ben base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 520, 20, 2, "0x04110eC2b17E6593d9BD90273c3B2555F3F8370d", "0x4A4559298E83Bd4fe123AFEeAAdC3665143C971B", "0x5fB1A76955f55CB6EB29668a1103dB6B3874567b", "");

//Public
const productObj2 = new productObject("ACUP1902", "Cup1902", "Cupiter base 0001", 1000, 900, 73310, 15000, "NTD", 510, 20, 1, "", "", "", "");

//Public
const productObj3 = new productObject("ADAM1903", "Adam1903", "Adam base 0001", 100, 90, 7331, 15000, "NTD", 500, 20, 1, "", "", "", "");

//Public
const productObj4 = new productObject("AETH1914", "AETH1904", "Earth base 0001", 100, 90, 73310, 17000, "NTD", 490, 20, 1, "0x26e2479C1dD4b739D864A9AdaFb6E759D8069474", "0xf777aF7b3d0495190dc74aF12c99AB6238801F77", "0xCe162342c999791c1b3070cA125cdf73bE85BB4d", "0x87485F2620540deaC4500E14c6CAd17CBF4D5C47");// each investor can own max of 17 tokens

//Public
const productObj5 = new productObject("AFOT1905", "AFOT1905", "AFOT 0001", 100, 90, 73310, 17000, "NTD", 490, 20, 1, "", "", "", "");

const productObj6 = new productObject("ASAT1906", "Satarn1906", "Saturn base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj7 = new productObject("AMAR1907", "MARS1907", "Mars base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj8 = new productObject("APLU1908", "APLU1908", "Pluto base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj9 = new productObject("AHOB1909", "HOBBLE1909", "Hobble base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObj10 = new productObject("ASUN1910", "SUN1910", "Sun base 0001", 1000000000, 900000000, 73310, 15000, "NTD", 490, 20, 2, "", "", "", "");

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4, productObj5, productObj6, productObj7, productObj8, productObj9, productObj10];

//const getLocalTime_API = async () => await getLocalTime();


// const currentTime = await timer.getTimeServerTime();
// wlogger.debug('currentTime', currentTime);
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


module.exports = { productObjArray, symbolArray, crowdFundingAddrArray, assetbookArray, userArray, assetRecordArray, incomeArrangementArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray,  TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, fundmanager, CFSD, CFED, TimeTokenUnlock, TimeTokenValid, nowDate, userObject,
}
