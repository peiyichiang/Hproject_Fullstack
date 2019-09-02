require("dotenv").config();

let symbolNumber, operationMode, backendAddrChoice;

const SYMBOLNUMBER = parseInt(process.env.SYMBOLNUMBER);
if(isNaN(SYMBOLNUMBER)){
  symbolNumber = 1;
} else {
  symbolNumber = parseInt(SYMBOLNUMBER);
}
console.log('symbolNumber', symbolNumber);

const OPERATIONMODE = parseInt(process.env.OPERATIONMODE);
if(isNaN(OPERATIONMODE)){
  operationMode = 1;
} else {
  operationMode = parseInt(OPERATIONMODE);
}
console.log('operationMode', operationMode);
//9 for production with more strict time checking inside blockchain.js

const BACKENDADDRCHOICE = parseInt(process.env.BACKENDADDRCHOICE);
if(isNaN(BACKENDADDRCHOICE)){
  backendAddrChoice = 0;
} else {
  backendAddrChoice = parseInt(BACKENDADDRCHOICE);
}
console.log('backendAddrChoice', backendAddrChoice);
//process.exit(0);

//----------------------------==Server Settings
const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_PROTOCOL = process.env.SERVER_PROTOCOL;

//----------------------------==Database Settings
const DB_host = process.env.DB_HOST;
const DB_user = process.env.DB_USER;
const DB_password = process.env.DB_PASS;
const DB_name = process.env.DB_NAME;
const DB_port = process.env.DB_PORT;

//----------------------------==Blockchain Settings
const blockchainChoice = process.env.BLOCKCHAIN_CHOICE;
let blockchainURL, gasLimitValue, gasPriceValue;
if(blockchainChoice === '1'){//POA
  blockchainURL = "http://"+process.env.BC_HOST+":"+process.env.BC_PORT;
  gasLimitValue = 9000000;//intrinsic gas too low
  gasPriceValue = 0;//insufficient fund for gas * gasPrice + value

} else if(blockchainChoice === '2'){/*ganache*/
  blockchainURL = "http://"+process.env.BC_HOST+":"+process.env.BC_PORT_GANACHE;
  gasLimitValue = 9000000;// for POW private chain
  gasPriceValue = 20000000000;//100000000000000000

} else if(blockchainChoice === '3'){/*Infura HttpProvider Endpoint*/
  blockchainURL = process.env.BC_PROVIDER;
  gasLimitValue = 9000000;// for POW private chain
  gasPriceValue = 20000000000;//100000000000000000
}

const admin = process.env.HELIUM_ADMIN;
const adminpkRaw =  process.env.HELIUM_ADMIN_PRIVATEKEY;


//----------------------------==Timeserver Settings
const isTimeserverON = process.env.IS_TIMESERVER_ON === '1';
const timeserverMode = parseInt(process.env.TIMESERVER_MODE);// = 1
const timeserverTimeInverval = parseInt(process.env.TIMESERVER_TIME_INTERVAL);//20
const is_addAssetbooksIntoCFC = process.env.IS_ADDASSETBOOKS_INTO_CFC === '1';
const is_makeOrdersExpiredCFED = process.env.IS_MAKEORDERS_EXPIRED_CFED === '1';
const is_updateExpiredOrders = process.env.IS_UPDATE_EXPIRED_ORDERS === '1';
const is_updateFundingStateFromDB = process.env.IS_UPDATE_FUNDING_STATE_FROM_DB === '1';
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


module.exports = { symbolNumber, operationMode, backendAddrChoice, SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL, DB_host, DB_user, DB_password, DB_name, DB_port,  blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, isTimeserverON, timeserverMode, timeserverTimeInverval, is_addAssetbooksIntoCFC, is_makeOrdersExpiredCFED, is_updateExpiredOrders, is_updateFundingStateFromDB, is_updateTokenStateFromDB, is_calculateLastPeriodProfit };