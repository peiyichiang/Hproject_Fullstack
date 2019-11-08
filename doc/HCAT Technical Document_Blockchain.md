**Blockchain.js**

**working with blockchains**

-Read smart contract state variables

-Write data(Change state variables) via making transactions

| Packages| Descriptions|
|---------|-------------|
| web3| Ethereum Javascript API for interacting with ethereum nodes, using a HTTP or IPC connection |
| ethereumjs-tx | A simple module for creating, manipulating and signing ethereum transactions|
| moment | Parse, validate, manipulate, and display dates and times in JavaScript |
| truffle-privatekey-provider | Private Key provider for Web3. Used to sign transactions by provider private key|

**Imported functions from /timeserver/utilities.js**

| Imported functions | Descriptions|
|--------------------|-------------|
| checkEq| Check if two given values are of equal value and equal type|
| getTimeServerTime| Get timeserver time. This function is controlled by env settings to get localtime or fakeservertime|
| isEmpty| Check if given value is valid(not undefined or null or empty string or a string ‘undefined’|
| testInputTime | Test if given time is a valid time, which is 12 digits of numbers YYYYMMDDHHMM and representing a current or future time |
| asyncForEach| A function to execute asynchronous callback functions in order of given array items|
| asyncForEachTsMain | Same as asyncForEach with different name|
| asyncForEachMint | Same as asyncForEach with different name, outer loop|
| asyncForEachMint2| Same as asyncForEach with different name, inner loop|
| asyncForEachCFC| Same as asyncForEach with different name|
| asyncForEachAbCFC| Same as asyncForEach with different name|
| asyncForEachAbCFC2 | Same as asyncForEach with different name|
| asyncForEachOrderExpiry | Same as asyncForEach with different name|
| checkTargetAmounts | Check if given each balance already is above each targetAmount respectively|
| breakdownArray| Breakdown a given amount into pieces that is less than given maximum amount|
| isInt| Check if given value is an integer |
| isIntAboveZero| Same as above isInt and it also checks if given value is above zero |
| checkBoolTrueArray | Check if given value is a boolean true value|
| makeFakeTxHash| Make fake transaction hash|

**Imported functions from /timeserver/mysql.js**

| Imported functions | Descriptions |
|----------|---|
| addActualPaymentTime| Add actual payment time into rows with given symbol and payablePeriodEnd time inside income_arrangement table |
| mysqlPoolQueryB| Write / read data from database then returns a promise|
| setFundingStateDB| Set p_state, (Optionally p_CFSD and p_CFED) values inside product table with given symbol|
| setTokenStateDB| Set p_tokenState, (optionally also p_lockuptime and p_validdate) inside product table for given symbol |
| getTokenStateDB| Get p_tokenState, p_lockuptime, and p_validdate for given symbol inside product table|
| addProductRow| Add a product into product table in database|
| addAssetRecordRowArray| Add an array of asset records into investor_assetRecord table|
| getCtrtAddr | Get contract address from database with given symbol and contract type|
| getForecastedSchedulesFromDB | Get forcasted schedules including ia_time, ia_single_Forecasted_Payable_Income_in_the_Period from income_arrangement table with given symbol |
| getAllSmartContractAddrs| Get all smart contract addresses from smart_contracts table with given symbol|
| updateIAassetRecordStatus | Update ia_assetRecord_status to 1 for given symbol and ia_Payable_Period_End is 0 inside income_arrangement table|

**Imported functions from /timeserver/envVariables.js**

| Imported variables | Descriptions|
|---|--------|
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

**Imported variables from /test_CI/zTestParameters.js**

| Imported variables| Type | Descriptions|
|---|---|-----|
| assetOwnerArray | Array of strings | An array of Ethereum EOAs for testing|
| assetOwnerpkRawArray | Array of strings | An array of private keys for the above EOAs respectively |

**Imported functions from /ethereum/contracts/zsetupData.js**

| Imported variables | Type| Descriptions |
|---|---|------------|
| Helium | JSON | Compiled Helium smart contract|
| Registry | JSON| Compiled Registry smart contract|
| AssetBook| JSON| Compiled Assetbook smart contract |
| TokenController | JSON| Compiled Token Controller smart contract |
| HCAT721| JSON| Compiled HCAT token smart contract|
| CrowdFunding| JSON| Compiled Crowdfunding smart contract |
| IncomeManager | JSON| Compiled Income Manager smart contract |
| ProductManager| JSON| Compiled Product Manager smart contract|
| wlogger| Functional object | For displaying different logging levels|
| excludedSymbols | Array of string | An array of symbols to skip(to be excluded) |

**Functions defined within Blockchain.js**

Note. in the following functions. The naming indicates the returned value types:

If the name starts with ‘is’, then it returns a boolean.

| Function Names| Parameters| Descriptions|Output |
|-----------|---|---| --|
| addPlatformSupervisor| platformSupervisorNew, addrHeliumContract | Add a new platform supervisor address into Helium contract| -|
| addCustomerService| platformSupervisorNew, addrHeliumContract | Add a new customer service address into Helium contract| -|
| checkPlatformSupervisor| eoa, addrHeliumContract | Check if given eoa has platform supervisor authorization according to Helium contract| boolean|
| checkCustomerService| eoa, addrHeliumContract | Check if given eoa has customer service authorization according to Helium contract| boolean|
| checkArgumentsHelium| argsHelium| Check given arguments inside argsHelium object then return a boolean value indicating check result | boolean|
| checkHeliumCtrt | addrHeliumContract, managementTeam| Check if contract deployed on given address really is correct Helium contract by checking contract variables| boolean|
| deployHeliumContract| managementTeam| Deploy a copy of compiled Helium contract | boolean|
| deployRegistryContract | addrHeliumContract | Deploy a copy of compiled Registry contract | boolean|
| deployProductManagerContract| addrHeliumContract | Deploy a copy of compiled Product Manager contract | boolean|
| setRestrictions | registryContractAddr, authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate| Set new regulation restrictions on given Registry contract| boolean|
| deployAssetbooks| eoaArray, addrHeliumContract | Deploy assetbook contracts with given array of EOAs| boolean|
| deployCrowdfundingContract | argsCrowdFunding| Deploy crowdfunding contract using argument object’s properties as parameters: | boolean|
| checkArgumentsCFC | argsCrowdFunding| Check if above mentioned argument object has correct property values for deploying crowdfunding contracts| boolean|
| checkCrowdfundingCtrt| crowdFundingAddr| Check if contract at given address has correct variable values. If yes, then contract at that address is a valid crowdfunding contract | boolean|
| checkDeploymentCFC| crowdFundingAddr, argsCrowdFunding| Check above, then check if crowdfunding contract deployment was successful with correct state variable values | boolean|
| checkArgumentsTCC | argsTokenController| Check if argument has correct values for token controller contract deployment| boolean|
| deployTokenControllerContract | argsTokenController| Deploy token controller contract with given arguments| boolean|
| checkTokenControllerCtrt | tokenControllerCtrtAddr | Check if given address has a correct token controller contract deployed upon | boolean|
| checkDeploymentTCC| tokenControllerAddr, argsTokenController| Check above, then check if token controller contract deployment was successful with correct state variable values| boolean|
| checkArgumentsHCAT| argsHCAT721 | Check if argument has correct values for HCAT token contract deployment | boolean|
| fromAsciiToBytes32| asciiString | Convert an ASCII string to a bytes32 format| string|
| fromBytes32ToAscii| bytes32String | Convert a bytes32 string to an ASCII string| string|
| deployHCATContract| argsHCAT721 | Deploy HCAT contract with given arguments| boolean|
| checkHCATTokenCtrt| tokenCtrtAddr | Check if given address has a correct HCAT token contract deployed upon| boolean|
| checkDeploymentHCAT | tokenCtrtAddr, argsHCAT721| Check above, then check if HCAT token contract deployment was successful with correct state variable values | boolean|
| getTokenContractDetails| tokenCtrtAddr | Get HCAT token contract details| array of different string/boolean|
| checkDeployedContracts | symbol | Check all deployed smart contracts with given symbol | boolean|
| setTokenController| tokenControllerCtrtAddr | Set token state inside TokenController to ‘normal’| boolean|
| addProductRowFromSymbol| tokenSymbol, tokenName, location, duration, fundingType, pricingCurrency, fundmanagerIn, TimeReleaseDateIn, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10 | Add a product into product table | boolean|
| checkArgumentsIncomeManager| argsIncomeManager| Check if argument has correct values for Income Manager contract deployment| boolean|
| deployIncomeManagerContract| argsIncomeManager| Deploy Income Manager contract with given arguments| boolean|
| checkDeploymentIncomeManager| IncomeManager_Addr, argsIncomeManager | Check above, then check if Income Manager contract deployment was successful with correct state variable values | boolean|
| getFundingStateCFC| crowdFundingAddr| Get funding state from given crowdfunding contract address. |string|
| getHeliumAddrCFC| crowdFundingAddr| Get Helium contract address recorded inside given crowdfunding contract| string|
| updateFundingStateCFC| crowdFundingAddr, serverTime, symbol| Update funding state inside crowdfunding contract |txn hash|
| getTokenStateTCC| tokenControllerAddr| Get token state from token controller contract| string|
| getHeliumAddrTCC| tokenControllerAddr| Get Helium contract address from given token controller contract| string|
| updateTokenStateTCC | tokenControllerAddr, serverTime, symbol | Update token controller state| txn hash |
| getCFC_Balances | crowdFundingAddr, assetbooks | Get crowdfunding invested balances for each given assetbook addresses| array of strings|
| getTokenBalances| tokenCtrtAddr, assetbooks | Got HCAT token balances for each given assetbook addresses|array of strings|
| showAssetBookBalance_TokenId| -| Show test assetbook balances | array of strings|
| sequentialCheckBalances| addressArray, tokenCtrtAddr| Get HCAT token balances for each given input address | array of booleans|
| sequentialCheckBalancesAfter| addressArray, amountArray, tokenCtrtAddr, balanceArrayBefore, isToMax| Check result of minting tokens: For each input address, compare balance before and balance now, then decide if token minting result is successful | array of booleans|
| checkMint| tokenCtrtAddr, toAddress, amount, price, fundingType, serverTime| Check tokenMinting operation by 1. Check mint-to addresses 2. Check all require statements inside given HCAT contract mintTokens function| array of booleans|
| sequentialMintToAdd | addressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime| Mint tokens by adding given amount of tokens to each address Danger. This function is likely to mint extra tokens if previous token minting is unsuccessful, e.g. server crashes| boolean|
| sequentialMintToMax | addressArray, amountArray, maxMintAmountPerRun, fundingType, price, tokenCtrtAddr, serverTime| Mint tokens by adding to a fixed given amount of tokens to each address In case of errors occurring during tokenMinting process, we can restart backend server to call this function again with same argument, so it will find remaining token amount for each to-address, then mint correct amounts accordingly| boolean|
|---| --- | --- |
| preMint| symbol | Collect all arguments for minting tokens of given symbol: addressArray, amountArray, tokenCtrtAddr, fundingType, pricing | boolean|
| mintSequentialPerContract| symbol, serverTime, maxMintAmountPerRun | Mint tokens for whole crowdfunding contract:1. preMint() to collect all arguments, 2. doAssetRecords() to add new asset records into DB, 3. updateIAassetRecordStatus(), 4. sequentialMintSuper(), 5. Call sequentialMintToMax, 6. Check after minting balances| array of booleans|
| sequentialMintSuper | addressArray, amountArray, tokenCtrtAddr, fundingType, pricing, maxMintAmountPerRun, serverTime| Check input values | array of booleans|
| sequentialRunTsMain | mainInputArray, waitTime, serverTime, extraInputArray| Will execute various actions according to contract type. Actions including mintTokenToEachBatch, updateExpiredOrders, send time to contracts to get new state: e.g. fundingState, tokenState | array of booleans|
| mintToken| amountToMint, tokenCtrtAddr, to, fundingType, price | Mint tokens directly via calling mintSerialNFT() function on HCAT contract | boolean|
| mintTokensWithRegulationCheck | amount, tokenCtrtAddr, \_to, fundingType, price, tokenControllerAddr | To show more checks via checkMintSerialNFT() during token minting process For testing regulated amount of token minting| boolean|
| doAssetRecords| addressArray, amountArray, serverTime, symbol, pricing | Get Assetbook addresses, then find email addresses Get token balance for that symbol. Get max Actual Payment Time and actualPayment ar_time = serverTime, tokenHoldingAmount Add in IncomeArrangement Table: Asset Record Status = 1 | boolean|
| updateFundingStateFromDB | serverTime| Update crowdfunding contract funding state from checking database product table funding state and server time. \# <br> Find symbols that have passed CFSD but their p_state are still in ‘initial’ state \# Find symbols that have passed CFED but their p_state are still in ‘funding’ or ‘fundingGoalReached’ state \# Then call updateFundingStateCFC() to update that symbol’s crowdfunding contract| boolean|
| makeOrdersExpiredCFED| serverTime| Make orders expired due to servertime reaching CFED inside database product table \# Find symbols that have passed CFED but their p_state are still in ‘initial’, ‘funding’, or ‘fundingGoalReached’ \# Set all orders with found symbols and paymentStatus as ‘waiting’ to be paymentStatus as ‘expired’ inside database order_list table| boolean|
| addUsersToRegistryCtrt | registryCtrtAddr, userIDs, assetbooks, authLevels| Add user ID numbers, assetbook addresses, authorized levels into Registry contract | boolean|
| setUsersInRegistryCtrt | registryCtrtAddr, userIDs, assetbooks, authLevels| Set users inside Registry contract with matched userID to new given assetbook addresses and authLevels| boolean|
| addAssetbooksIntoCFC| serverTime, paymentStatus | \# Find all unique symbols with given paymentStatus value inside order_list table [TO BE DONE]\# Check for Crowdfunding contract token status if status is normal \# Find all assetbook addresses, emails, token counts, orderID with given payment status. \# Check if crowdingfunding contract funding status is valid \# Call investToken() to add paid orders into crowdfunding contract \# Set payment status to ‘txnFinished’ if all is successful inside order_list table, if not successful, set payment status to ‘errCFC’ | boolean|
| investTokens | crowdFundingAddr, addrAssetbookX, amountToInvestStr, serverTime, invokedBy | Call invest() function inside crowdfunding contract with write given assetbook address and buyTokenAmount, serverTime into that Crowdfunding contract| boolean|
| tokenReceiver| addrAssetbookX| Check if address has a assetbook contract, which has correct state variables | boolean|
| checkAssetbookArray | addrAssetbookArray | Check multiple assetbook addresses using above function| array of booleans|
| checkInvest| crowdFundingAddr, addrAssetbook, amountToInvestStr, serverTime| Check all require statements inside given Crowdfunding contract invest() function, if any of require statement is evaluated to be false, then it will tell you which require statement failed and why it failed.| array of booleans|
| investTokensInBatch | crowdFundingAddr, addrAssetbookArray, amountToInvestArray, serverTime| Invest with multiple assetbooks and their buyAmounts respectively using investInBatch() function in crowdfunding contract | array of booleans|
| getDetailsCFC| crowdFundingAddr| Get all state variables from given crowdfunding contract address | array of booleans and strings|
| getInvestorsFromCFC | crowdFundingAddr, indexStartStr = 0, tokenCountStr = 0 | Get investor assetbook addresses from given crowdfunding contract address with optional filter feature | array of strings|
| rabbitMQSender| functionName, symbol, price | Testing RabbitMQ sender fuction| boolean |
| rabbitMQReceiver| functionName, symbol, price | Testing RabbitMQ receive function| boolean |


**Regarding Crowdfunding Contract**

| Function Name| Parameters| Description |Output |
|--------------|-----------|-------------|------ |
| setTimeCFC| crowdFundingAddr, serverTime | Set crowdfunding state by entering a new time | -- |
| setTimeCFC_bySymbol| serverTime, symbol | Set crowdfunding state by given time and symbol | -- |
| updateTokenStateFromDB | serverTime| Update token controller contract token state from checking database product table token state and server time. \# Find symbols that have passed p_lockuptime but their p_tokenState are still in ‘lockup’ state \# Find symbols that have passed p_validdate but their p_tokenState are still in ‘normal’ state \# Then call updateTokenStateTCC() to update that symbol’s token controller contract | boolean |
| writeToBlockchainAndDatabase| targetAddr, serverTime, symbol, actionType | Write state variables into blockchain smart contracts and database, e.g. funding state or token state | boolean |
| updateExpiredOrders| serverTime| Update expidred orders: 1.Find orderIDs, purchase dates from order_list within orders in ‘waiting’ as payment status2.Check those order’s age.3.Set payment status to expired if order age is equal or over 3 days old| boolean |
|filterSymbols | array of symbols or array of symbol objects | Filter symbol array | boolean |
| getRestrictions | registryContractAddr, authLevel | Get Registry contract restriction details | boolean |
| setRestrictions | registryContractAddr, authLevel, maxBuyAmountPublic, maxBalancePublic, maxBuyAmountPrivate, maxBalancePrivate | Set new Registry contract restriction details | boolean |


**Functions regarding Assetbook contracts**

| Function Names| Parameters| Descriptions|Output |
|---------------|-----------|-------------|-------|
| get_assetOwner| addrAssetBook | Get asset owner EOA saved inside given assetbook address| string |
| get_lastLoginTime | addrAssetBook | Get last login time inside given assetbook address| string |
| checkIsContract| addrAssetBook, assetAddr| Check if input address has a contract deployed in it| boolean |
| getAssetbookDetails| addrAssetBook | Get all state variables from given assetbook address| array of booleans and strings |
| endorsers| addrAssetBook | Get all endorsers’ addresses | array of strings |
| setHeliumAddr | addrAssetBook, \_addrHeliumContract| Set new Helium contract address inside given asset book address| - |
| HeliumContractVote| addrAssetBook, serverTime | For a customer service representative to vote| boolean |
| resetVoteStatus| addrAssetBook | Reset all assetbook votes to zero| boolean |
| changeAssetOwner| addrAssetBook, \_assetOwnerNew, serverTime | Change assetbook owner address | boolean |
| checkSafeTransferFromBatchFunction | assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime| Check all arguments of safeTransferFromBatch() | boolean |
| transferTokens| addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, \_fromAssetOwner, \_fromAssetOwnerpkRaw | Transfer HCAT tokens | boolean |
| signTx | userEthAddr, userRawPrivateKey, contractAddr, encodedData| Use Ethereum-Tx.js to sign then send trans| - |


**Functions Regarding IncomeManager**
| Function Name| Parameters| Description |Output |
|--------------|-----------|-------------|------ |
| getIncomeManagerDetails| addrIncomeManager| Get state variables from given income manager contract address| array of strings and booleans |
| get_schCindex| symbol | Get schedule index inside income manager contract | string |
| tokenCtrt| symbol | Get token contract inside income manager contract | string |
| get_paymentCount| symbol | Get payment count inside income manager contract| string |
| get_TimeOfDeployment | symbol | Get time of deployment inside income manager contract|string |
| getIncomeSchedule| Symbol, schIndex| Get an income schedule inside income manager contract|array of strings |
| getIncomeScheduleList| symbol, indexStart, amount| Get income schedule list inside income manager contract|array of strings |
| checkAddForecastedScheduleBatch1 | symbol, forecastedPayableTimes, forecastedPayableAmounts | Check add_forecasted_schedule_batch for any require statement error inside income manager contract| boolean |
| checkAddForecastedScheduleBatch2 | symbol, forecastedPayableTimes, forecastedPayableAmounts | Check add_forecasted_schedule_batch2 for any require statement error inside income manager contract| boolean |
| checkAddForecastedScheduleBatch| symbol, forecastedPayableTimes, forecastedPayableAmounts | Check add_forecasted_schedule_batch for any require statement error inside income manager contract| boolean |
| addForecastedScheduleBatch| symbol, forecastedPayableTimes, forecastedPayableAmounts | Add forecasted schedule in batch| boolean |
| addForecastedScheduleBatchFromDB | symbol | Add data from database into income manager contract as forecasted schedules in batch| boolean |
| editActualSchedule | symbol, schIndex, actualPaymentTime, actualPaymentAmount | Edit actual income schedule| boolean |
| addPaymentCount | symbol | Add payment count| boolean |
| setErrResolution| symbol, schIndex, isErrorResolved, errorCode | Set error resolution code for a chosen income schedule | boolean |
