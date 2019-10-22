pull from remote branch
$ yarn install

$ yarn run solc

$ yarn run mohe
$ yarn run moreg
$ yarn run mopm
$ yarn run moab
$ yarn run mocf
$ yarn run mohcat
$ yarn run moim

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

---------------==Testing Flow

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
 101 symbolNameXYZ ... to delete all records of a symbol
 208 ... to manually set the correct tokenAmountsToInvest
set new product details inside zTestParameters.js
set symbolNumber inside .env

 60 ... deployCrowdfundingContract_API -> paste into zTestParameter CFC field
 61 ... addProductRow_API

--To test Regulation on Public Funding:
skipping 65, just mint tokens.
 66 ... deployTokenControllerContract_API
 67 ... deployHCATContract_API
 73 ... add2SmartContractsBySymbol_API
209 ... mintTokensByRegulations_API
--

To test others:
 65 ... investTokensToCloseCFC_API
        buy tokens in CFC => sold out => fundingClosed

 66 ... deployTokenControllerContract_API
 67 ... deployHCATContract_API
 69 ... deployIncomeManagerContract_API
 70 ... add3SmartContractsBySymbol_API
 71 ... addIncomeArrangementRows_API
----==

 39 ... getDetailsCFC_API
 42 ... getCFC_Balances_API
----==
 82 ... setTokenController
 79 ... getTokenContractDetails
 83 ... getTokenBalances_API

 86 ... mintSequentialPerContract_CLI_API ***
(OR ProductAdministration.ejs interface button press)

 5  ... calculateLastPeriodProfit_API

----==
 85 ... addOrders_CFC_MintTokens_API

 121 3 2 12 ... transferTokens_API

 100 .. intergrationTestOfProduct

// 78 ... addPaidOrdersIntoDBnCFC ... don't do as we use timeServer functions
// 72 ... addProductRowFromSymbol_API

-----------------==
 39 ... getDetailsCFC_API
 41 ... getCrowdfundingInvestors_API
 42 ... getCFC_Balances_API

 788 .. addAssetbooksIntoCFC_API (like timeserver)

 75 ... addUserArrayOrdersIntoDB_API
 76 ... addOrderIntoDB_API
 77 ... addArrayOrdersIntoDB_API

 43 ... invest in CFC
 44 ... check invest function
 47 ... invest in CFC in batch!!!


//yarn run livechain -c 1 --f 0 ... checkDeployedContracts 
yarn run livechain -c 1 --f 1 ... setupTest to verify initial conditions

