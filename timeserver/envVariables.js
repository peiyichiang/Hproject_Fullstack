require("dotenv").config();

let symbolNumber, operationMode, backendAddrChoice, isToDeploy, assetbookAmount, addrHelium, addrRegistry, addrProductManager, blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, fakeServertime, loglevel;

const SYMBOLNUMBER = parseInt(process.env.SYMBOLNUMBER);
if(isNaN(SYMBOLNUMBER)){
  symbolNumber = 1;
} else {
  symbolNumber = SYMBOLNUMBER;
}
console.log('symbolNumber:', symbolNumber);

const OPERATIONMODE = parseInt(process.env.OPERATIONMODE);
if(isNaN(OPERATIONMODE)){
  operationMode = 1;
} else {
  operationMode = OPERATIONMODE;
}
console.log('operationMode:', operationMode);
//9 for production with more strict time checking inside blockchain.js

const BACKENDADDRCHOICE = parseInt(process.env.BACKENDADDRCHOICE);
if(isNaN(BACKENDADDRCHOICE)){
  backendAddrChoice = 0;
} else {
  backendAddrChoice = BACKENDADDRCHOICE;
}
console.log('backendAddrChoice:', backendAddrChoice);

const IS_TO_DEPLOY = parseInt(process.env.IS_TO_DEPLOY);
if(isNaN(IS_TO_DEPLOY)){
  isToDeploy = 1;
} else {
  isToDeploy = IS_TO_DEPLOY;
}
console.log('isToDeploy:', isToDeploy);

const ASSETBOOKAMOUNT = parseInt(process.env.ASSETBOOKAMOUNT);
if(isNaN(ASSETBOOKAMOUNT)){
  assetbookAmount = 10;
} else {
  assetbookAmount = ASSETBOOKAMOUNT;
}
console.log('assetbookAmount:', assetbookAmount);

//1 error, 2 warn, 3 info, 4 verbose, 5 debug
const LOGLEVEL = parseInt(process.env.LOGLEVEL);
if(LOGLEVEL === 1){
  loglevel = 'error';
} else if(LOGLEVEL === 2){
  loglevel = 'warn';
} else if(LOGLEVEL === 3){
  loglevel = 'info';
} else if(LOGLEVEL === 4){
  loglevel = 'verbose';
} else if(LOGLEVEL === 5){
  loglevel = 'debug';
} else {
    loglevel = 'warn';
}
console.log('loglevel:', loglevel);

//process.exit(0);

//----------------------------==Server Settings
const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_PROTOCOL = process.env.SERVER_PROTOCOL;

//----------------------------==Database Settings
const DB_host = process.env.DB_HOST;
const DB_port = process.env.DB_PORT;
const DB_user = process.env.DB_USER;
const DB_password = process.env.DB_PASS;
const DB_name = process.env.DB_NAME;

/*
const DB_host2 = process.env.DB_HOST2;
const DB_port2 = process.env.DB_PORT2;
const DB_user2 = process.env.DB_USER2;
const DB_password2 = process.env.DB_PASS2;
const DB_name2 = process.env.DB_NAME2;
*/
//----------------------------==Blockchain Settings
const blockchainChoice = process.env.BLOCKCHAIN_CHOICE;
console.log('blockchainChoice:', blockchainChoice);

if(blockchainChoice === '1'){//POA
  blockchainURL = "http://"+process.env.BC_HOST+":"+process.env.BC_PORT;
  gasLimitValue = 9000000;//intrinsic gas too low
  gasPriceValue = 0;//insufficient fund for gas * gasPrice + value
  admin = process.env.HELIUM_ADMIN;
  adminpkRaw =  process.env.HELIUM_ADMIN_PRIVATEKEY;

  addrHelium =     process.env.HELIUMCONTRACTADDR;
  addrRegistry =   process.env.REGISTRYCONTRACTADDR;
  addrProductManager = process.env.PRODUCTMANAGERCONTRACTADDR;

} else if(blockchainChoice === '2'){/*ganache*/
  blockchainURL = "http://"+process.env.BC_HOST+":"+process.env.BC_PORT_GANACHE;
  gasLimitValue = 9000000;// for POW private chain
  gasPriceValue = 20000000000;//100000000000000000
  addrHelium =     "";
  addrRegistry =   "";
  addrProductManager = "";

} else if(blockchainChoice === '3'){/*Infura HttpProvider Endpoint*/
  blockchainURL = process.env.BC_PROVIDER;
  gasLimitValue = 9000000;// for POW private chain
  gasPriceValue = 20000000000;//100000000000000000
  addrHelium =     "";
  addrRegistry =   "";
  addrProductManager = "";

} else if(blockchainChoice === '4'){/*local ganache-cli
  ganache-cli -m "mnemonic words..." -l 9721975  -g 20000000000 */
  blockchainURL = "http://"+process.env.BC_HOST_GANACHECLI+":"+process.env.BC_PORT_GANACHECLI;
  gasLimitValue = 9721975;// for POW private chain
  gasPriceValue = 20000000000;//100000000000000000
  admin = process.env.GANACHE_EOA0;
  adminpkRaw =  process.env.GANACHE_EOAPK0;
  addrHelium =     "";
  addrRegistry =   "";
  addrProductManager = "";
}

//Helium_Chairman = process.env.HELIUM_CHAIRMAN, process.env.HELIUM_DIRECTOR, process.env.HELIUM_MANAGER, process.env.HELIUM_OWNER

console.log(`addrHelium: ${addrHelium} \naddrRegistry: ${addrRegistry} \naddrProductManager: ${addrProductManager}`);


//----------------------------==Timeserver Settings


const isTimeserverON = process.env.IS_TIMESERVER_ON === '1';
console.log('isTimeserverON:', isTimeserverON);

const SERVERTIME = parseInt(process.env.SERVERTIME);
if(isNaN(SERVERTIME)){
  fakeServertime = 201910220930;
} else {
  fakeServertime = SERVERTIME;
}
console.log('fakeServertime:', fakeServertime);


let timeserverMode = parseInt(process.env.TIMESERVER_MODE);// = 1
if(isNaN(timeserverMode)){
  timeserverMode = 1;
}
let timeserverTimeInverval = parseInt(process.env.TIMESERVER_TIME_INTERVAL);//20
if(isNaN(timeserverTimeInverval)){
  timeserverTimeInverval = 20;
}

const is_addAssetbooksIntoCFC = process.env.IS_ADDASSETBOOKS_INTO_CFC === '1';
const is_makeOrdersExpiredCFED = process.env.IS_MAKEORDERS_EXPIRED_CFED === '1';
const is_updateExpiredOrders = process.env.IS_UPDATE_EXPIRED_ORDERS === '1';

const is_updateFundingStateFromDB = process.env.IS_UPDATE_FUNDING_STATE_FROM_DB === '1';
//crowdfunding state can be partially triggered by timeserver!!!

const is_updateTokenStateFromDB = process.env.IS_UPDATE_TOKEN_STATE_FROM_DB === '1';
const is_calculateLastPeriodProfit = process.env.IS_CALCULATE_LAST_PERIOD_PROFIT === '1';

/*console.log(`isTimeserverON: ${isTimeserverON} ${typeof isTimeserverON}
is_addAssetbooksIntoCFC: ${is_addAssetbooksIntoCFC}
is_makeOrdersExpiredCFED: ${is_makeOrdersExpiredCFED}
is_updateExpiredOrders: ${is_updateExpiredOrders}
is_updateFundingStateFromDB: ${is_updateFundingStateFromDB}
is_updateTokenStateFromDB: ${is_updateTokenStateFromDB}
is_calculateLastPeriodProfit: ${is_calculateLastPeriodProfit}
`);
*/


module.exports = { addrHelium, addrRegistry, addrProductManager, symbolNumber, operationMode, backendAddrChoice, isToDeploy, assetbookAmount, fakeServertime, SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL, DB_host, DB_user, DB_password, DB_name, DB_port, blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, isTimeserverON, timeserverMode, timeserverTimeInverval, is_addAssetbooksIntoCFC, is_makeOrdersExpiredCFED, is_updateExpiredOrders, is_updateFundingStateFromDB, is_updateTokenStateFromDB, is_calculateLastPeriodProfit, loglevel, isTimeserverON };