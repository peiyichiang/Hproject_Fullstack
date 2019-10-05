pull from remote branch
$ yarn install

$ yarn run solc
$ yarn run testhcat
$ yarn run testcf
$ yarn run testim

add your new product details in ethereum/contracts/zsetupData.js
const productObj0 = new productObject(...);
productObjArray = [...]
symNum = 2;

consider turn timeserver or part of it on...
const isTimeserverON = true;
const useFullTimeServer = true;

----==setup basic system and users
yarn run testmt -f x
 53 ... deployHeliumContract_API -> paste it into .env
 54 ... deployRegistryContract_API -> paste it into .env
 55 ... deployProductManagerContract_API -> paste it into .env

 56 ... deployAssetbookContracts_API -> paste results into Assetbooks.csv
>> delete existing test users
 57 ... addUsersIntoDB_API
 59 ... addUsersToRegistryCtrt

----==every new product
 61 ... deployCrowdfundingContract_API -> paste into zTestParameter

 65 ... investTokensToCloseCFC_API
        buy tokens in CFC => sold out => fundingClosed
// 78 ... addPaidOrdersIntoDBnCFC ... don't do as we use timeServer functions

 66 ... deployTokenControllerContract_API
 67 ... deployHCATContract_API
 69 ... deployIncomeManagerContract_API
 70 ... add3SmartContractsBySymbol_API
 71 ... addIncomeArrangementRows_API
 72 ... addProductRowFromSymbol_API
----==
 39 ... getDetailsCFC_API
 42 ... getCFC_Balances_API
----==
 82 ... setTokenController
 79 ... getTokenContractDetails
 83 ... getTokenBalances_API

 86 ... mintSequentialPerContract_CLI_API ***
(OR ProductAdministration.ejs interface button press)

 85 ... addOrders_CFC_MintTokens_API

 5  ... calculateLastPeriodProfit_API

 121 3 2 12 ... transferTokens_API

 100 .. intergrationTestOfProduct
