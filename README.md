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

### 5. Run Mocha Tests on smart contracts and web3

Write tests inside project root directory -> test folder

Install Mocha, a JavaScript test framework
```
yarn run test721
yarn run testcf
yarn run testim
```

### 6. Setup P.O.A. Blockchain
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

### 7. Deploy smart contracts
Deploy contracts
```
yarn run deploy --c 1 --ctrtName contractName
```
where chain can be 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,

and contractName can be either platform, multisig, assetbook, registry, tokencontroller, erc721splc, or crowdfunding.

### 8. Test
---------------==Testing Flow
yarn run testmt -f 54 ... deployHeliumContract_API
yarn run testmt -f 55 ... deployRegistryContract_API
yarn run testmt -f 56 ... deployAssetbookContracts_API
yarn run testmt -f 57 ... addUsersIntoDB_API
yarn run livechain -c 1 --f 21 ... addUsersToRegistryCtrt

----==
yarn run testmt -f 61 ... deployCrowdfundingContract_API
yarn run testmt -f 64 ... deployTokenControllerContract_API
yarn run testmt -f 67 ... deployHCATContract_API
yarn run testmt -f 70 ... deployIncomeManagerContract_API
yarn run testmt -f 71 ... deployProductManagerContract_API
yarn run testmt -f 72 ... addSmartContractRow_API
yarn run testmt -f 74 ... addIncomeArrangementRows_API

yarn run testmt -f 73 ... addProductRowFromSymbol_API
yarn run testmt -f 100 .. intergrationTestOfProduct
----==
yarn run testmt -f 39 ... getDetailsCFC_API
yarn run testmt -f 42 ... getCFC_Balances_API
yarn run testmt -f 78 ... addPaidOrdersIntoDBnCFC
----==
----== >>> doAssetRecordsCaller() and API
yarn run testmt -f 82 ... setTokenController
yarn run testmt -f 79 ... getTokenContractDetails
yarn run testmt -f 83 ... getTokenBalances_API

yarn run testmt -f 49 ... mintSequentialPerCtrt_API 
(OR ProductAdministration.ejs interface button press)

-----------------==
yarn run testmt -f 39 ... getDetailsCFC_API
yarn run testmt -f 41 ... getCrowdfundingInvestors_API
yarn run testmt -f 42 ... getCFC_Balances_API

yarn run testmt -f 78 ... addPaidOrdersIntoDBnCFC
yarn run testmt -f 788 .. addAssetbooksIntoCFC_API (like timeserver)

yarn run testmt -f 75 ... addUserArrayOrdersIntoDB_API
yarn run testmt -f 76 ... addOrderIntoDB_API
yarn run testmt -f 77 ... addArrayOrdersIntoDB_API

yarn run testmt -f 43 ... invest in CFC
yarn run testmt -f 44 ... check invest function
yarn run testmt -f 47 ... invest in CFC in batch!!!

yarn run testmt -f 101 symbolName ... to delete all records of a symbol

//yarn run livechain -c 1 --f 0 ... checkDeployedContracts 
yarn run livechain -c 1 --f 1 ... setupTest to verify initial conditions



### 8. Test deployed smart contracts
```
yarn run testlive1 --chain C --func F
```
C = 1: POA private chain, 2: POW private chain, 3: POW Infura Rinkeby chain
F = 0: testDeployedCtrt, 1: checking AssetBook1, 2: checking AssetBook2

0: setupTest
```
yarn run livechain --c 1 --f 0
```

1: getSystemInfo
```
yarn run livechain --c 1 --f 1
```

2: showAccountnAssetBooks
```
yarn run livechain --c 1 --f 2
```

3: showAssetInfo(tokenId)
```
yarn run livechain --c 1 --f 3 -a tokenId
```

4: mintTokens(assetbookNum, amountToMint)
```
yarn run livechain --c 1 --f 4 -a assetbookNum, -b amountToMint
```

8: sendAssetBeforeAllowed(),
```
yarn run livechain --c 1 --f 8
```

9: setServerTime(newServerTime)
```
yarn run livechain --c 1 --f 9 -a serverTime
```

10: transferTokens(assetbookNum, amount)
```
yarn run livechain --c 1 --f 10 -a 2 -b 1
```

### 9. Setup Timeserver sending part
```
'*/5 * * * * *'
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