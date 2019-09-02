require("dotenv").config();

const SERVER_HOST = process.env.SERVER_HOST;
const SERVER_PORT = process.env.SERVER_PORT;
const DB_host = process.env.DB_HOST;
const DB_user = process.env.DB_USER;
const DB_password = process.env.DB_PASS;
const DB_name = process.env.DB_NAME;
const DB_port = process.env.DB_PORT;

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

const isTimeserverON = process.env.isTimeserverON === '1';
const timeserverMode = parseInt(process.env.timeserverMode);// = 1
const timeserverTimeInverval = parseInt(process.env.timeserverTimeInverval);//20
const is_addAssetbooksIntoCFC = process.env.is_addAssetbooksIntoCFC === '1';
const is_makeOrdersExpiredCFED = process.env.is_makeOrdersExpiredCFED === '1';
const is_updateExpiredOrders = process.env.is_updateExpiredOrders === '1';
const is_updateFundingStateFromDB = process.env.is_updateFundingStateFromDB === '1';
const is_updateTokenStateFromDB = process.env.is_updateTokenStateFromDB === '1';
const is_calculateLastPeriodProfit = process.env.is_calculateLastPeriodProfit === '1';

console.log(`isTimeserverON: ${isTimeserverON} ${typeof isTimeserverON}
is_addAssetbooksIntoCFC: ${is_addAssetbooksIntoCFC}
is_makeOrdersExpiredCFED: ${is_makeOrdersExpiredCFED}
is_updateExpiredOrders: ${is_updateExpiredOrders}
is_updateFundingStateFromDB: ${is_updateFundingStateFromDB}
is_updateTokenStateFromDB: ${is_updateTokenStateFromDB}
is_calculateLastPeriodProfit: ${is_calculateLastPeriodProfit}
`);

const admin = process.env.admin;
const adminpkRaw =  process.env.adminpkRaw;

module.exports = { SERVER_HOST, SERVER_PORT, DB_host, DB_user, DB_password, DB_name, DB_port,  blockchainURL, gasLimitValue, gasPriceValue, admin, adminpkRaw, isTimeserverON, timeserverMode, timeserverTimeInverval, is_addAssetbooksIntoCFC, is_makeOrdersExpiredCFED, is_updateExpiredOrders, is_updateFundingStateFromDB, is_updateTokenStateFromDB, is_calculateLastPeriodProfit };