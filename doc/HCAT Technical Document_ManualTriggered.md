**ManualTriggered.js**

**For manually triggering functions. Mostly for testing & debugging **

| Packages | Descriptions|
|----------|-------------|
| axios   | Promise based HTTP client for the browser and node.js |
| path   | NodeJS 'path' module |
| fs   | File system read/write support |
| chalk   | Terminal string styling done right |

**Imported variables from /test_CI/zTestParameters.js**

| Imported variables| Type | Descriptions|
|---|---|-----|
| assetOwnerArray | Array of strings | An array of Ethereum EOAs for testing|
| assetOwnerpkRawArray | Array of strings | An array of private keys for the above EOAs respectively |



**Imported functions and variables from /ethereum/contracts/zsetupData.js**

| Imported variables or functions | Type | Descriptions  |
|--------------|----------|--------|
| checkCompliance   | variable | t time |

**Imported functions from /timeserver/envVariables.js**

| Imported Functions   | Descriptions   |
| -- | -- |
| addrHelium| Address of Helium contract|
| addrRegistry| Address of Registry contract|
| addrProductManager | Address of Product Manager contract|
| blockchainURL | IP address of our backend Ethereum node|
| admin| An Ethereum externally owned address for backend server signing transactions|
| adminpkRaw| private key for the above address|
| gasLimitValue | gas limit for sending transactions |
| gasPriceValue | gas price for sending transactions |
| isLivetimeOn| If true, use local machine time, else if false, use fakeservertime value |
| backendAddrChoice| To choose which externally owned address to use for signing transactions |
| isLivetimeOn | ServerTime is given from getTimeServerTime(), which is controlled by isLivetimeOn in the env file. If IS_LIVETIME_ON is 1, then isLivetimeOn will be true, and getTimeServerTime() will return localtime. If not, then getTimeServerTime() will return a fake servertime, which can be set in env file |
| fakeServertime   | See above  |
| crowdfundingScenario | An integer to determine if the funding status is:  1.Sold out … funding successful  2.Ended with goal reached … funding successful.3.Ended with goal not reached … funding failed |



**Functions defined within ManualTriggered.js**

| Function Name | Parameters | Description   |
|---------------|------------|---------------|
| checkEq   | value1, value2| Check if the two given values are equal in both value and type| boolean |

----------
Main Flow Steps
--
yarn run testmt -f numberX

**Setup system contracts**
53 ... deployHeliumContract_API -> paste it into .env
54 ... deployRegistryContract_API -> paste it into .env
55 ... deployProductManagerContract_API -> paste it into .env

**For every new user**
52 ... change eoaIndex, then deploy assetbook for 1 user, add to DB and Registry

**For a group of users**
56 ... deployAssetbookContracts_API -> paste results into Assetbooks.csv
957 ... deleteUsersInDB_API
57 ... addUsersIntoDB_API
59 ... addUsersToRegistryCtrt_API

(Optional) 599... setUsersInRegistryCtrt_API ... if you want to give users different assetbooks and/or userLevels, but with the same UserIDs


**For every new product(new symbol)**
999 ... symbolNameXYZ ... to delete all records of a specified symbol, because all symbols have to be unique, not duplicated symbols. So if you want to add one symbol that has already been added into DB, then delete that symbol completely first.

Set new product details inside zTestParameters.js: symbol, amount...
Set symbolNumber inside .env
60 ... deployCrowdfundingContract_API -> paste into zTestParameter CFC field
61 ... addProductRow_API

**If testing Regulation on Public Funding:**
skipping 65, just mint tokens.
66 ... deployTokenControllerContract_API
67 ... deployHCATContract_API
73 ... add2SmartContractsBySymbol_API
209 ... mintTokensByRegulations_API


**Public Offering OR Private Placement**
991 ... deleteOrdersAndSmartCtrt_API ... if the same symbol has been used previously

**Set crowdfundingScenario in env: 1 sold out, 2 goal reached, 3 failed**

**Either manually make amountArray -> paste into zTestParameters.js**
210 ... show amountArray
**OR**
209 ... for public/private funding to manually calculate the correct buyAmounts => paste amountArray into zTestParameters.js
655 ... makeCorrectAmountArray_API


39 ... getDetailsCFC_API
65 ... investTokensThenCloseCFC_API
____CFC sold out => fundingClosed
____CFC reached goal => fundingClosed
____CFC failed => fundingNotClosed
____CFC paused => paused
____CFC terminated => terminated
**OR**
651... pause > Resume
652... terminated

66 ... deployTokenControllerContract_API -> paste into zTestParameter
67 ... deployHCATContract_API -> paste into zTestParameter
69 ... deployIncomeManagerContract_API -> paste into zTestParameter
70 ... add3SmartContractsBySymbol_API
71 ... addIncomeArrangementRows_API

**Check Crowdfunding Contract**
39 ... getDetailsCFC_API
48 ... setTimeCFC_bySymbol_API  2019xyzabc symbolABC
488... setTimeCFC_API
42 ... getCFC_Balances_API

**Check TokenController Contract**
82 ... setTokenController
79 ... getTokenContractDetails
83 ... getTokenBalances_API

**Mint Tokens**
86 ... mintSequentialPerContract_CLI_API ***
(OR ProductAdministration.ejs interface button press)
force terminate -> restart ... successfully catch on the previous results

29 ... calculateLastPeriodProfit_API

**Test Timeserver functions**
130 ... addAssetbooksIntoCFC_API
131 ... makeOrdersExpiredCFED_API
132 ... updateExpiredOrders_API
133 ... updateFundingStateFromDB_API
134 ... updateTokenStateFromDB_API
135 ... calculateLastPeriodProfit_API
