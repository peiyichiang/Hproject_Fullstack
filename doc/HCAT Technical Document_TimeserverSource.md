**TimeserverSource.js**

**Timeserver settings and the services it can provide.**

TimeserverSource.js defines all the services timeserver will provide.

Each service can be turned on by the corresponding env file parameters.

ServerTime is given from **getTimeServerTime**(), which is controlled by isLivetimeOn

in the env file. If IS_LIVETIME_ON is 1, then isLivetimeOn will be true, and **getTimeServerTime**() will return localtime. If not, then **getTimeServerTime**() will return a fake servertime, which can be set in env file.

| Packages| Description   |
---------------|---------------|
| node-schedule   | A job scheduler that allows scheduling jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules |    |
| Imported functions   | Source location | Description    |
| wlogger    | ../ethereum/contracts/zsetupData    | WinstonJs logger    |
| getTimeServerTime    | ./utilities   | Get timeserver time |
| calculateLastPeriodProfit | ../timeserver/mysql  | Calculate last period profit  |
| updateExpiredOrders  | ./blockchain.js | Update expired orders past 3 days    |
| updateFundingStateFromDB  | ./blockchain.js | Update crowdfunding contract funding state from checking database funding state and server time |
| updateTokenStateFromDB    | ./blockchain.js | Update token controller contract token state from checking database token state and server time |
| addAssetbooksIntoCFC | ./blockchain.js | Add assetbooks into crowdfunding contract |
| makeOrdersExpiredCFED| ./blockchain.js | Make orders expired due to servertime reaching CFED   |

timeserverMode is set inside env file
If it is set to 1: timeserver will be triggered at certain interval.
If it is set to 2: timeserver will be triggered at every minute at certain fixed
second

| Imported variables | Type   | Descriptions |
|--------------------|--------|---------------------------------|
| timeserverMode| integer    | 1 to trigger timeserver at interval of timeserverTimeInverval 2 to trigger timeserver at fixed second of every minute  |
| timeserverTimeInverval  | integer    | See above  |
| is_addAssetbooksIntoCFC | boolean    | Switch for writing assetbooks into crowdfunding |
| is_makeOrdersExpiredCFED| Boolean    | Switch for making orders expired when orders have passed CFED    |
| is_updateExpiredOrders  | Boolean    | Switch for making orders expired when 3 days have passed after making the original orders   |
| is_updateFundingStateFromDB  | Boolean    | Switch for updating crowdfunding funding state by checking database funding state |
| is_updateTokenStateFromDB    | Boolean    | Switch for updating token controller token state by checking database token state |
| is_calculateLastPeriodProfit | Boolean    | Switch for calculating last period profit  |
| Function Name | Parameters | Description|
| getTimeServerTime  | \-    | Get the timeserver time. Note: if isLivetimeOn is set to 1, then it will get the local machine time; Else, it will get the fakeServertime |
| addAssetbooksIntoCFC    | serverTime | Scan in the order_list table to get a list of unique order symbols, Get each symbol???s its crowdfunding contract address For that symbol, get assetbooks, emails, orderAmount, order IDs from paid orders Check above assetbook addresses Write assetbook addresses into Crowdfunding contract via **investTokens** function. If it succeeds, it will write ???txnFinished??? into DB for that symbol If it fails, it will call checkInvest function to find out the reason of error, then write ???ereCFC??? into DB for that symbol  |
| makeOrdersExpiredCFED   | serverTime | Find symbols inside product table whose funding state of ???initial???, ???funding???, or ???fundingGoalReached??? Find orders inside order_list table with above symbols and order payment status is ???waiting???, set that status to ???expired??? |
| updateExpiredOrders| serverTime | Inside order_list table, find orderIDs, purchase dates of all orders with payment status of ???waiting???. if the order has passed 3 days, then change the payment status to ???expired???  |
| updateFundingStateFromDB| serverTime | Update crowdfunding contract funding state from checking database funding state and server time: Inside product table, find symbol that server time has passed symbol???s CFSD and yet p_state is still ???initial???, OR server time has passed symbol???s CFED and yet p_state is still ???fundingGoalReached???. The states are in product table. |
| updateTokenStateFromDB  | serverTime | Update token controller contract token state from checking database token state and server time: Inside product table, find symbols that server time has passed its lockup time but p_tokenState is still ???lockup???, OR that server time has passed valid date but p_tokenState is still ???normal??? The states are in product table.   |
| calculateLastPeriodProfit    | serverTime | See the simplified version in a chart below. Inside smart_contracts table, get symbols, token addresses that the symbol???s p_state inside product table is ???ONM??? Get max actual payment times from income_arrangement table Get single actual income payments from income_arrangement table Get that symbol???s pricing from product table Get token owner assetbook addresses and balances Calculate acquired cost Get user emails from assetbooks Write a new row into investor_assetRecord table Inside income_arrangement table, set assetRecord_status of to 1, ar_time to max actual payment time |

calculateLastPeriodProfit simplified version:

<https://drive.google.com/open?id=1CcmynsFzTSfmHYW3-SOBuhRWmUEDAhDg0PQpt99uUc4>
