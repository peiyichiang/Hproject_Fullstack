# Backend

## Usage

### 1. Download this repository
```
git clone git@gitlab.com:zSukhoi57/Hproject_Fullstack.git Hproject_Fullstack
```

Repository will be downloaded into `Hproject_Fullstack` folder

### 2. Install NodeJs and dependencies

Use NodeJs v11.10.0 or above

Go to the downloaded repository folder and run:
```
yarn install
yarn global add mocha
yarn global add nodemon
cp example.env .env
```
Complete .env variable values

### 3. Install web3 version 1.0.0-beta.37

Install web3@1.0.0-beta.37 to prevent Ganache-cli provider error
https://github.com/ethereum/web3.js/issues/2266
```
yarn add web3@1.0.0-beta.37
```

### 4. Compile Solidity smart contracts

Compile and build smart contract ABI and bytecode:
```
yarn run solc
```

### 5. Setup P.O.A. Blockchain
```pm2 -n ganache start "ganache-cli -p 8540 -h 0.0.0.0```

OR
```ganache-cli -m "defense tissue lecture abstract clown mammal around motor aware habit where teach" -l 9721975 -g 20000000000```

then inside .env file:
change env: BLOCKCHAIN_CHOICE=4
add:
BC_HOST_GANACHECLI=localhost
BC_PORT_GANACHECLI=8545
GANACHE_EOA0=0xa6cc621a179f01a719ee57db4637a4a1f603a442
GANACHE_EOAPK0=0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a

### 6. Run Mocha Tests on smart contracts and web3
Write tests inside project root directory -> test folder
Install Mocha, a JavaScript test framework
```
yarn run mohe
yarn run moreg
yarn run mopm
yarn run moab
yarn run mocf
yarn run mohcat
yarn run moim
```
### 7. Deploy and Test smart contracts
---------------==Testing Flow
yarn run solc
yarn run moXYZ... as above in step 6

----==setup basic system and users
yarn run testmt -f x
 53 ... deployHeliumContract_API -> paste it into .env
 54 ... deployRegistryContract_API -> paste it into .env
 55 ... deployProductManagerContract_API -> paste it into .env

----==every new user
 52 ... change eoaIndex, then deploy assetbook for 1 user, add to DB and Registry

----==a group of users
 56 ... deployAssetbookContracts_API -> paste results into Assetbooks.csv
 577... deleteUsersInDB_API
 57 ... addUsersIntoDB_API
 59 ... addUsersToRegistryCtrt_API
 599... setUsersInRegistryCtrt_API


----==every new product
 101 symbolNameXYZ ... to delete all records of a symbol

Set new product details inside zTestParameters.js: symbol, amount...
Set symbolNumber inside .env
 60 ... deployCrowdfundingContract_API -> paste into zTestParameter CFC field
 61 ... addProductRow_API

--To test Regulation on Public Funding:
skipping 65, just mint tokens.
 66 ... deployTokenControllerContract_API
 67 ... deployHCATContract_API
 73 ... add2SmartContractsBySymbol_API
209 ... mintTokensByRegulations_API
--

--Public Offering OR Private Placement
 155... deleteOrdersAndSmartCtrt_API ... if the same symbol has been used previously

Set crowdfundingScenario in env: 1 sold out, 2 goal reached, 3 failed

Either manual make amountArray -> paste into zTestParameters.js
 210 ... show amountArray
OR
 209 ... for public/private funding to manually calculate the correct buyAmounts => paste amountArray into zTestParameters.js
 655... makeCorrectAmountArray_API


 39 ... getDetailsCFC_API
 65 ... investTokensThenCloseCFC_API
        1.CFC sold out => fundingClosed
        2.CFC reached goal => fundingClosed
        3.CFC failed => fundingNotClosed
        4.CFC paused => paused
        5.CFC terminated => terminated
OR
 651... pause > Resume
 652... terminated

 66 ... deployTokenControllerContract_API -> paste into zTestParameter
 67 ... deployHCATContract_API -> paste into zTestParameter
 69 ... deployIncomeManagerContract_API -> paste into zTestParameter
 70 ... add3SmartContractsBySymbol_API
 71 ... addIncomeArrangementRows_API

----== CFC
 39 ... getDetailsCFC_API
 48 ... setTimeCFC_bySymbol_API  2019xyzabc symbolABC
 488... setTimeCFC_API
 42 ... getCFC_Balances_API
----==
 82 ... setTokenController
 79 ... getTokenContractDetails
 83 ... getTokenBalances_API

 86 ... mintSequentialPerContract_CLI_API ***
(OR ProductAdministration.ejs interface button press)
 force terminate -> restart ... successfully catch on the previous results

 29 ... calculateLastPeriodProfit_API

----==Test Timeserver
 130 ... addAssetbooksIntoCFC_API
 131 ... makeOrdersExpiredCFED_API
 132 ... updateExpiredOrders_API
 133 ... updateFundingStateFromDB_API
 134 ... updateTokenStateFromDB_API
 135 ... calculateLastPeriodProfit_API

------------==
 85 ... addOrders_CFC_MintTokens_API

 121 3 2 12 ... transferTokens_API

 100 .. intergrationTestOfProduct

// 87 ... addPaidOrdersIntoDBnCFC ... don't do as we use timeServer functions
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

---------------==
---------------==
update the excluded symbol list in ethereum/contract/zsetupData.js

 40 ... preMint_API

reset_addAssetbooksIntoCFC_API
yarn run testts -a 2 -c 0  ... to reset 3 orders from user1, 2, 3 to paid
yarn run start

sequentialMintSuperAPI
delete 3 top orders in investor_assetRecord table
yarn run livechain -c 1 --f 6

cancelOverCFED2Orders_API
if CFC has reached CFED2, then make order paymentStatus: waiting -> expired
make some target symbol order paymentStatus: waiting
yarn run testts -a 2 -c 2

Test FE Token transfer
$ yarn run transfertokens


---------------==
### 8. Set Log Level
by default(if you do nothing in the env file), it will show warn and error messages. You can also set in the .env file: LOGLEVEL=1 for only error, 2 for adding warn, 3 for adding info, 4 for adding verbose, 5 for adding debug console logs ... set it to 5 if you want to debug or show all the logs 

### 9. Setup Timeserver sending part


10: transferTokens(assetbookNum, amount)
```
yarn run livechain --c 1 --f 10 -a 2 -b 1/5 * * * * *'
'*/10 * * * * *'  ... for every 10 seconds
'59 * * * * *'  ... for every 59th minute

yarn run tsself ... to start timseserver self version not sending to others
```

### 10. Test Timeserver Automation
```
$ yarn run testts --c C
```
  1: get funding state value
  2: reset symbol "HHtoekn12222", "Htoken001", "Htoken0030" to p_state = initial
  3: set timeCurrent = CFSD
  4: set timeCurrent = CFED

### 12. Test Income.js
```
yarn run testic
```
to run the income.js tests

### 17. Run the app
inside app.js: set isTestingMode to true to enable testing mode, or false to run in normal mode.
```
yarn run start
```
App will be opened in browser at `http://localhost:3000/`
if you want to run it without timeserver, then comment out "require('./timeserver/timeserverSource');" inside /app.js

Please remember to delete old log files under log folder

### 18. Set to receive incoming time
```
Go to http://140.119.101.130:7000/
Enter your current running IP:
140.119.101.33	portForIncomingTime_value  	HeliumXYZ001
portForIncomingTime has the value defined inside timeServer/manager.js

```

### 19. Live Preview

Backend User Login:
http://140.119.101.130:3000/BackendUser/BackendUserLogin
http://localhost:3030/BackendUser/BackendUserLogin

Backend Roles:
Platform_Admin
Platform_Auditor
Platform_CustomerService
Company_FundManagerN
Company_FundManagerA

http://heliumcryptic.website