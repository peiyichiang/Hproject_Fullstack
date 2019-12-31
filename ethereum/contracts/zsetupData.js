const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

const { loglevel } = require('../../timeserver/envVariables');
const excludedSymbols = ['ABCD1234'];//'AURA1904', 'AVEN1902', 'AJUP1903', 'ANEP1905',
const excludedSymbolsIA = [];

//---------------------------==Winston Logger
//const loglevel = 'warn';//to show/hide logs.
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
/* wlogger.silly('log level = silly');
wlogger.debug(`log level = 5 debug`);
wlogger.verbose(`log level = 4 verbose`);
wlogger.info(`log level = 3 info`);
wlogger.warn(`log level = 2 warn`);
wlogger.error(`log level = 1 error`);
*/
//---------------------------==
//---------------------------==
wlogger.info(`--------------------==zsetupData.js`);

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
  wlogger.debug(`\n[checkCompliance] authLevel: ${authLevel}, ${typeof authLevel}, balance: ${balance} ${typeof balance}, orderPayment: ${orderPayment} ${typeof orderPayment}, fundingType: ${fundingType} ${typeof fundingType}`);

  if(typeof authLevel !== 'string'){
    wlogger.error(`\n[checkCompliance] authLevel should be of type string: ${authLevel}`);
    return false;
  } else if (typeof fundingType !== 'string') {
    wlogger.error(`\n[checkCompliance] fundingType should be of type string: ${fundingType}`);
    return false;
  } else if (typeof balance !== 'number' || isNaN(balance)) {
    wlogger.error(`\n[checkCompliance] balance should be of type number and not NaN: ${balance}`);
    return false;
  } else if (typeof orderPayment !== 'number' || isNaN(balance)) {
    wlogger.error(`\n[checkCompliance] orderPayment should be of type number and not NaN: ${orderPayment}`);
    return false;

  } else if (fundingType === "PublicOffering" || fundingType === '1') {
      wlogger.debug(`inside fundingType == PublicOffering\n, COMPLIANCE_LEVELS[authLevel]: ${COMPLIANCE_LEVELS[authLevel]}`);
      if (orderPayment > COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic) {
          wlogger.error(`orderPayment ${orderPayment} should be <= maxOrderPaymentPublic ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic}`);
          return false;

      } else if (balance + orderPayment > COMPLIANCE_LEVELS[authLevel].maxBalancePublic) {
          wlogger.error(`balance + orderPayment ${balance + orderPayment} should be <= maxBalancePublic orderPayment ${COMPLIANCE_LEVELS[authLevel].maxBalancePublic}`);
          return false;

        } else {
          wlogger.debug(`passing both orderPayment and new balance regulation for Public Offering`);
          wlogger.debug(`orderPayment ${orderPayment} <= maxOrderPaymentPublic ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPublic}`);
          wlogger.debug(`balance + orderPayment ${balance + orderPayment} <= maxBalancePublic orderPayment ${COMPLIANCE_LEVELS[authLevel].maxBalancePublic}`);
          return true;
      }

  } else if (fundingType === "PrivatePlacement" || fundingType === '2') {
      wlogger.debug(`inside fundingType == PrivatePlacement \n COMPLIANCE_LEVELS[authLevel]: ${COMPLIANCE_LEVELS[authLevel]}`);
      if (orderPayment > COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate) {
          wlogger.error(`orderPayment ${orderPayment} should be <= maxOrderPaymentPrivate ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate}`);
          return false;

      } else if (balance + orderPayment > COMPLIANCE_LEVELS[authLevel].maxBalancePrivate) {
          wlogger.debug(`balance + orderPayment ${balance+orderPayment} should be <= maxBalancePrivate ${COMPLIANCE_LEVELS[authLevel].maxBalancePrivate}`);
          return false;

        } else {
          wlogger.debug(`passing both orderPayment and new balance regulation for Private Placement`);
          wlogger.debug(`orderPayment ${orderPayment} <= maxOrderPaymentPrivate ${COMPLIANCE_LEVELS[authLevel].maxOrderPaymentPrivate}`);
          wlogger.debug(`balance + orderPayment ${balance+orderPayment} <= maxBalancePrivate ${ COMPLIANCE_LEVELS[authLevel].maxBalancePrivate}`);
          return true;
      }
  } else {
      wlogger.error(`fundingType is not valid: ${fundingType}`);
      return false;
  }

}

wlogger.debug(`loading blockchain.js smart contract json files`);

const Helium = require('./build/Helium.json');

if (Helium === undefined){
  wlogger.error(`[Error] Helium is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] Helium is defined`);
  if (Helium.abi === undefined){
    wlogger.error(`[Error] Helium.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] Helium.abi is defined`);
      //wlogger.debug(`Helium.abi:: ${Helium.abi);
  }
  if (Helium.bytecode === undefined || Helium.bytecode.length < 10){
    wlogger.error(`[Error] Helium.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] Helium.bytecode is defined`);
      //wlogger.debug(`Helium.bytecode:: ${Helium.bytecode);
  }
  //wlogger.debug(Helium);
}

const AssetBook = require('./build/AssetBook.json');
if (AssetBook === undefined){
  wlogger.error(`[Error] AssetBook is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] AssetBook is defined`);
  if (AssetBook.abi === undefined){
    wlogger.error(`[Error] AssetBook.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] AssetBook.abi is defined`);
      //wlogger.debug(`AssetBook.abi:: ${AssetBook.abi);
  }
  if (AssetBook.bytecode === undefined || AssetBook.bytecode.length < 10){
    wlogger.error(`[Error] AssetBook.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] AssetBook.bytecode is defined`);
      //wlogger.debug(`AssetBook.bytecode:: ${AssetBook.bytecode);
  }
  //wlogger.debug(AssetBook);
}


const Registry = require('./build/Registry.json');
if (Registry === undefined){
  wlogger.error(`[Error] Registry is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] Registry is defined`);
  if (Registry.abi === undefined){
    wlogger.error(`[Error] Registry.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] Registry.abi is defined`);
      //wlogger.debug(`Registry.abi:: ${Registry.abi);
  }
  if (Registry.bytecode === undefined || Registry.bytecode.length < 10){
    wlogger.error(`[Error] Registry.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] Registry.bytecode is defined`);
      //wlogger.debug(`Registry.bytecode:: ${Registry.bytecode);
  }
  //wlogger.debug(Registry);
}

const TokenController = require('./build/TokenController.json');
if (TokenController === undefined){
  wlogger.error(`[Error] TokenController is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] TokenController is defined`);
  if (TokenController.abi === undefined){
    wlogger.error(`[Error] TokenController.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] TokenController.abi is defined`);
      //wlogger.debug(`TokenController.abi:: ${TokenController.abi);
  }
  if (TokenController.bytecode === undefined || TokenController.bytecode.length < 10){
    wlogger.error(`[Error] TokenController.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] TokenController.bytecode is defined`);
      //wlogger.debug(`TokenController.bytecode:: ${TokenController.bytecode);
  }
  //wlogger.debug(TokenController);
}

const HCAT721 = require('./build/HCAT721_AssetToken.json');
if (HCAT721 === undefined){
  wlogger.error(`[Error] HCAT721 is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] HCAT721 is defined`);
  if (HCAT721.abi === undefined){
    wlogger.error(`[Error] HCAT721.abi is NOT defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] HCAT721.abi is defined`);
      //wlogger.debug(`HCAT721.abi:: ${HCAT721.abi);
  }
  if (HCAT721.bytecode === undefined || HCAT721.bytecode.length < 10){
    wlogger.error(`[Error] HCAT721.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] HCAT721.bytecode is defined`);
      //wlogger.debug(`HCAT721.bytecode:: ${HCAT721.bytecode);
  }
  //wlogger.debug(HCAT721);
}

const HCAT721_Test = '';
/*
const HCAT721_Test = require('./build/HCAT721_AssetToken_Test.json');
if (HCAT721_Test === undefined) {
  wlogger.error(`[Error] HCAT721_Test is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] HCAT721_Test is defined`);
  if (HCAT721_Test.abi === undefined) {
    wlogger.error(`[Error] HCAT721_Test.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] HCAT721_Test.abi is defined`);
    //wlogger.debug(`HCAT721_Test.abi:: ${HCAT721_Test.abi);
  }
  if (HCAT721_Test.bytecode === undefined || HCAT721_Test.bytecode.length < 10) {
    wlogger.error(`[Error] HCAT721_Test.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] HCAT721_Test.bytecode is defined`);
    //wlogger.debug(`HCAT721_Test.bytecode:: ${HCAT721_Test.bytecode);
  }
  //wlogger.debug(HCAT721_Test);
}*/

const CrowdFunding = require('./build/CrowdFunding.json');
if (CrowdFunding === undefined){
  wlogger.error(`[Error] CrowdFunding is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] CrowdFunding is defined`);
  if (CrowdFunding.abi === undefined){
    wlogger.error(`[Error] CrowdFunding.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] CrowdFunding.abi is defined`);
      //wlogger.debug(`CrowdFunding.abi:: ${CrowdFunding.abi);
  }
  if (CrowdFunding.bytecode === undefined || CrowdFunding.bytecode.length < 10){
    wlogger.error(`[Error] CrowdFunding.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] CrowdFunding.bytecode is defined`);
      //wlogger.debug(`CrowdFunding.bytecode:: ${CrowdFunding.bytecode);
  }
  //wlogger.debug(CrowdFunding);
}
const CrowdFundingV2 = require('./build/CrowdFundingV2.json');
if (CrowdFundingV2 === undefined){
  wlogger.error(`[Error] CrowdFundingV2 is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] CrowdFundingV2 is defined`);
  if (CrowdFundingV2.abi === undefined){
    wlogger.error(`[Error] CrowdFundingV2.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] CrowdFundingV2.abi is defined`);
      //wlogger.debug(`CrowdFunding.abi:: ${CrowdFunding.abi);
  }
  if (CrowdFundingV2.bytecode === undefined || CrowdFundingV2.bytecode.length < 10){
    wlogger.error(`[Error] CrowdFundingV2.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] CrowdFundingV2.bytecode is defined`);
      //wlogger.debug(`CrowdFunding.bytecode:: ${CrowdFunding.bytecode);
  }
  //wlogger.debug(CrowdFunding);
}

const IncomeManager = require('./build/IncomeManagerCtrt.json');
if (IncomeManager === undefined){
  wlogger.error(`[Error] IncomeManager is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] IncomeManager is defined`);
  if (IncomeManager.abi === undefined){
    wlogger.error(`[Error] IncomeManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] IncomeManager.abi is defined`);
      //wlogger.debug(`IncomeManager.abi:: ${IncomeManager.abi);
  }
  if (IncomeManager.bytecode === undefined || IncomeManager.bytecode.length < 10){
    wlogger.error(`[Error] IncomeManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] IncomeManager.bytecode is defined`);
      //wlogger.debug(`IncomeManager.bytecode:: ${IncomeManager.bytecode);
  }
  //wlogger.debug(IncomeManager);
}

const ProductManager = require('./build/ProductManager.json');
if (ProductManager === undefined){
  wlogger.error(`[Error] ProductManager is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] ProductManager is defined`);
  if (ProductManager.abi === undefined){
    wlogger.error(`[Error] ProductManager.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] ProductManager.abi is defined`);
      //wlogger.debug(`ProductManager.abi:: ${ProductManager.abi);
  }
  if (ProductManager.bytecode === undefined || ProductManager.bytecode.length < 10){
    wlogger.error(`[Error] ProductManager.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] ProductManager.bytecode is defined`);
      //wlogger.debug(`ProductManager.bytecode:: ${ProductManager.bytecode);
  }
  //wlogger.debug(ProductManager);
}
const RegistryProxy = require('./build/RegistryProxy.json');
if (RegistryProxy === undefined){
  wlogger.error(`[Error] RegistryProxy is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] RegistryProxy is defined`);
  if (RegistryProxy.abi === undefined){
    wlogger.error(`[Error] RegistryProxy.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] RegistryProxy.abi is defined`);
      //wlogger.debug(`AssetBook.abi:: ${AssetBook.abi);
  }
  if (RegistryProxy.bytecode === undefined || RegistryProxy.bytecode.length < 10){
    wlogger.error(`[Error] RegistryProxy.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] RegistryProxy.bytecode is defined`);
  }
}
const UpgradeabilityProxy = require('./build/UpgradeabilityProxy.json');
if (UpgradeabilityProxy === undefined){
  wlogger.error(`[Error] UpgradeabilityProxy is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] UpgradeabilityProxy is defined`);
  if (UpgradeabilityProxy.abi === undefined){
    wlogger.error(`[Error] UpgradeabilityProxy.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] UpgradeabilityProxy.abi is defined`);
      //wlogger.debug(`AssetBook.abi:: ${AssetBook.abi);
  }
  if (UpgradeabilityProxy.bytecode === undefined || UpgradeabilityProxy.bytecode.length < 10){
    wlogger.error(`[Error] UpgradeabilityProxy.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] UpgradeabilityProxy.bytecode is defined`);
  }
}
const UpgradeabilityStorage = require('./build/UpgradeabilityStorage.json');
if (UpgradeabilityStorage === undefined){
  wlogger.error(`[Error] UpgradeabilityStorage is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
} else {
  wlogger.info(`[Good] UpgradeabilityStorage is defined`);
  if (UpgradeabilityStorage.abi === undefined){
    wlogger.error(`[Error] UpgradeabilityStorage.abi is Not Defined <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] UpgradeabilityStorage.abi is defined`);
      //wlogger.debug(`AssetBook.abi:: ${AssetBook.abi);
  }
  if (UpgradeabilityStorage.bytecode === undefined || UpgradeabilityStorage.bytecode.length < 10){
    wlogger.error(`[Error] UpgradeabilityProxy.bytecode is NOT defined or too small <<<<<<<<<<<<<<<<<<<<<`);
  } else {
    wlogger.info(`[Good] UpgradeabilityProxy.bytecode is defined`);
  }
}





module.exports = { COMPLIANCE_LEVELS, checkCompliance,
  Helium, AssetBook, Registry, TokenController, HCAT721, HCAT721_Test, CrowdFunding, IncomeManager, ProductManager, wlogger,  excludedSymbols, excludedSymbolsIA, COMPLIANCE_LEVELS, RegistryProxy, CrowdFundingV2, UpgradeabilityProxy, UpgradeabilityStorage
}