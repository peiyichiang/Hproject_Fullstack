const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

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

console.log('loading blockchain.js smart contract json files');

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


module.exports = { COMPLIANCE_LEVELS, checkCompliance,
  Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManager, ProductManager, TestCtrt, wlogger
}