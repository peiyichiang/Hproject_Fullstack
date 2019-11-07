**mysql.js**

**Working with MySQL databases**

| Packages | Descriptions  |
|-|--|
| mysql | This is a node.js driver for mysql|
| bcrypt| A password hashing function based on the Blowfish cipher. Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power. |
| web3  | Ethereum Javascript API for interacting with ethereum nodes, using a HTTP or IPC connection  |

**Imported functions from /timeserver/envVariables.js**

| Imported variables | Descriptions|
|--|--|
| DB_host| Database IP |
| DB_user| Database username |
| DB_password  | Database password |
| DB_name| Database name  |
| DB_port| Database port  |
| blockchainURL| Base HTTP url  |
| assetbookAmount | Amount of test EOA for testing mode |

**Imported functions from /timeserver/utilities.js**

| Imported Functions| Descriptions |
|--|-|
| isNoneInteger  | Check if the given value is valid(not undefined or null or empty string or object) |
| asyncForEach| A function to sequentially execute an asynchronous callback function in the order of given array items  |
| asyncForEachAssetRecordRowArray  | Same as asyncForEach with different name, first loop  |
| asyncForEachAssetRecordRowArray2 | Same as asyncForEach with different name, second loop |
| makeFakeTxHash | Make fake transaction hash  |
| isEmpty  | Check if the given value is valid(not undefined or null or empty string or a string ‘undefined’|
| testInputTime  | Test if the given time is a valid time, which is 12 digits of numbers YYYYMMDDHHMM and representing a current or future time |

Note: asyncForEach is a function to execute asynchronous callback functions in
the order of given array items

**Imported functions from /ethereum/contracts/zsetupData.js**

| Imported variables | Type| Descriptions  |
|--|--|--|
| TokenController | Boolean| Compiled Token Controller smart contract |
| HCAT721| Boolean| Compiled HCAT token smart contract |
| CrowdFunding | Boolean| Compiled Crowdfunding smart contract  |
| IncomeManager| Boolean| Compiled Income Manager smart contract|
| wlogger| Function object | For displaying different logging levels  |
| excludedSymbols | Array of string | An array of symbols to skip(to be excluded) |

**Imported variables from /test_CI/zTestParameters.js**

| Imported variables | Type | Descriptions |
|--|--|--|
| userArray | Array of objects | An array of user objects for testing |

**Functions defined within mysql.js**

Note. in the following functions. The naming indicates the returned value types:

If the name starts with ‘is’, then it returns a boolean.

| Function Name | Parameters| Description |
|--|--|-|
| mysqlPoolQuery| sql, options, callback| Write / read data from database with a callback function|
| mysqlPoolQueryB  | sql, options | Write / read data from database then returns a promise  |
| addTxnInfoRow | txid, tokenSymbol, fromAssetbook, toAssetbook, tokenId, txCount, holdingDays, txTime, balanceOffromassetbook  | Add a row inside transaction_info table|
| deleteTxnInfoRows| tokenSymbol  | Delete a row with the given tokenSymbol inside transaction_info table  |
| getTxnInfoRowsBySymbol | tokenSymbol  | Returns a row with the given tokenSymbol from transaction_info table|
| addTxnInfoRowFromObj| Row object| Given the row object, add a row inside transaction_info table |
| addProductRow | tokenSymbol, nftName, location, initialAssetPricing, duration, pricingCurrency, IRR20yrx100, TimeReleaseDate, TimeTokenValid, siteSizeInKW, maxTotalSupply, fundmanager, \_CFSD, \_CFED, \_quantityGoal, TimeTokenUnlock, fundingType, state, notarizedRentalContract, BOEApprovedLetter, powerPurchaseAgreement, onGridTryrunLetter, powerPlantEquipmentRegisteredLetter, powerPlantInsurancePolicy, forecastedAnnualIncomePerModule, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10 | Given the product details, add a row inside the product table |
| deleteProductRows| tokenSymbol  | Delete a row inside product table with the given tokenSymbol  |
| getProductRows| tokenSymbol  | Returns a row from product table with the given tokenSymbol|
| addSmartContractRow | tokenSymbol, addrCrowdFunding, addrHCAT721, maxTotalSupply, addrIncomeManager, addrTokenController| Add a row inside smart_contracts table with the given parameters |
| add3SmartContractsBySymbol| tokenSymbol, addrHCAT721, addrIncomeManager, addrTokenController  | Add three smart contract addresses into a row that has the given tokenSymbol inside smart_contracts table |
| deleteSmartContractRows| tokenSymbol  | Delete rows that have the given tokenSymbol inside the smart_contracts table |
| getSmartContractRows| tokenSymbol  | Returns rows that have the given tokenSymbol inside the smart_contracts table|
| addUserRow | email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel, imagef, imageb, bank_booklet  | Add a row inside user table with the given parameters|
| addUsersIntoDB| User object array  | Add new users into user table |
| getAssetbookFromEmail  | email  | Search in database, then return an assetbook address from the given email |
| getAssetbookFromIdentityNumber  | Identity number | Search in database, then return an assetbook address from the given identityNumber |
| deleteUsersInDB  | User object array  | Delete the given users with matched Ethereum address in user table  |
| addOrderRow| nationalId, email, tokenCount, symbol, fundCount, paymentStatus| Add an order row inside order_list table  |
| deleteOrderRows  | tokenSymbol  | Delete orders with matched token symbol|
| addUserArrayOrdersIntoDB  | users, \_price, paymentStatus, tokenSymbol | Add orders into order_list table with given users, token price, paymentStatus, and token symbol, from users’ view point  |
| addArrayOrdersIntoDB| userIndexArray, amountArray, initialAssetPricing, paymentStatus, tokenSymbol  | Add orders from orders’ view point. userIndexArray is an array of indexes, which is the index for finding a user inside the userArray. amountArray is an array of token amounts that each of the above users wants to buy |
| addOrderIntoDB| identityNumber, email, tokenCount, fundCount, paymentStatus, tokenSymbol| Add an order into order_list table  |
| addActualPaymentTime| actualPaymentTime, symbol, payablePeriodEnd| Add actual payment time for given symbol and payable period end inside income_arrangement table  |
| addIncomeArrangementRowFromObj  | iaObj, an object| Add an income arrangement row inside income_arrangement table |
| addIncomeArrangementRow| symbol, ia_time, actualPaymentTime, payablePeriodEnd, annualEnd, wholecasePrincipalCalledBack, wholecaseBookValue, wholecaseForecastedAnnualIncome, wholecaseForecastedPayableIncome, wholecaseAccumulatedIncome, wholecaseIncomeReceivable, wholecaseTheoryValue, singlePrincipalCalledBack, singleForecastedAnnualIncome, singleForecastedPayableIncome, singleActualIncomePayment, singleAccumulatedIncomePaid, singleTokenMarketPrice, ia_state, singleCalibrationActualIncome  | Add an income arrangement row inside income_arrangement table |
| updateIAassetRecordStatus | symbol | Update is_assetRecord_status to 1 given symbol with ia_Payable_Period_End is 0, inside income_arrangement table |
| deleteIncomeArrangementRows  | tokenSymbol  | Delete any row that has the same given symbol inside income_arrangement table|
| addIncomeArrangementRows  | incomeArrangementArray, an object array | Add rows inside income_arrangement table  |
| getProductPricing| symbol | Returns product pricing from product table|
| getPastScheduleTimes| symbol , serverTime| Returns past schedule times from income_arrangement table for a given symbol |
| getSymbolsONM | \-  | Find products with ‘ONM’ as p_state, then return symbols and token addresses from smart_contracts table and product table|
| checkIaAssetRecordStatus  | symbol, actualPaymentTime| Returns ia_assetRecord_status from income_arrangement table with given symbol and actualPaymentTime |
| getMaxActualPaymentTime| symbol, serverTime | Returns the maximum actual payment time that is in the past from income_arrangement with given symbol  |
| getAcPayment  | symbol, maxActualPaymentTime| Returns single actual income payment from income_arrangement table for the given symbol and max actual payment time|
| getProfitSymbolAddresses  | serverTime| Returns symbols, token addresses, actual payment times, and max actual payment times from income_arrangement table |
| calculateLastPeriodProfit | serverTime| See timeserver section  |
| getOwnerAddrAmountList | tokenAddress, indexStart, indexAmount| Returns HCAT token owner addresses and their balances. indexStart and indexAmount are used to set the range of owners.|
| setAssetRecordStatus| assetRecordStatus, symbol, actualPaymentTime | Set ia_assetRecord_status for a given symbol and actualPaymentTime  |
| addAssetRecordRow| investorEmail, symbol, ar_time, holdingAmount, AccumulatedIncomePaid, UserAssetValuation, HoldingAmountChanged, HoldingCostChanged, AcquiredCost, MovingAverageofHoldingCost| Add a new asset record row inside investor_assetRecord table  |
| deleteAssetRecordRows  | tokenSymbol  | Delete an asset record inside investor_assetRecord table for the given token symbol|
| deleteAllRecordsBySymbol  | tokenSymbol  | Delete all records with the matching tokenSymbol  |
| deleteAllRecordsBySymbolArray| tokenSymbol  | Use above function to for multiple times with different symbols  |
| addAssetRecordRowArray | tokenSymbol  | Add asset record rows for an array of different assetbook addresses and amounts |
| getFundingStateDB| tokenSymbol  | Get funding p_state, p_CFSD, p_CFED from product table for a given symbol |
| setFundingStateDB| tokenSymbol  | Set p_state, (optionally p_CFSD and p_CFED) values inside product table for given symbol|
| setTokenStateDB  | tokenSymbol  | Set p_tokenState, (optionally p_lockuptime and p_validdate) inside product table for given symbol|
| getTokenStateDB  | tokenSymbol  | Get p_tokenState, p_lockuptime and p_validdate inside product table for given symbol  |
| getAllSmartContractAddrs  | tokenSymbol  | Get all smart contract addresses inside smart_contracts table for given token symbol  |
| getCtrtAddr| symbol, ctrtType| Get contract address from database for given contract type |
| getSymbolFromCtrtAddr  | ctrtAddr, ctrtType | Get symbol from database for given contract address and contract type  |
| setIMScheduleDB  | symbol, tokenState, lockuptime, validdate  | Set an income manager schedule(p_tokenState, optionally p_lockuptime and p_validdate) inside product table|
| isIMScheduleGoodDB  | symbol | Get income manager schedule details(p_tokenState, p_lockuptime, p_validdate) inside product table for given symbol |
| addIncomePaymentPerPeriodIntoDB | serverTime| Add income payment per period into database:  1.Get unique symbols from product table. 2.Get corresponding actual payment time, single actual income payment from income_arrangement table for each symbol. 3.Get corresponding HCAT token contract addresses for each symbol. 4.Get HCAT token balances and assetbook addresses. 5.Get user’s email address.  6.Save a new row into investor_assetRecord table |
| getForecastedSchedulesFromDB | symbol | Get forecasted income schedules from database for given symbol: 1.Get ia_time and ia_single_Forecasted_Payable_Income_in_the_Period from income_arrangement table with given symbol. 2.Get forecastedPayableTimes, forecastedPayableAmounts |
