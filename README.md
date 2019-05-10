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

### 6. Deploy smart contracts
Deploy contracts
```
yarn run deploy --c 1 --ctrtName contractName
```
where chain can be 1 for POA private chain, 2 for POW private chain, 3 for POW Infura Rinkeby chain,

and contractName can be either platform, multisig, assetbook, registry, tokencontroller, erc721splc, or crowdfunding.


### 7. Test deployed smart contracts
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

### 8. Setup Timeserver sending part
```
'*/5 * * * * *'
'*/10 * * * * *'  ... for every 10 seconds
'59 * * * * *'  ... for every 59th minute

yarn run tsself ... to start timseserver self version not sending to others
```

### 9. Test Timeserver Automation
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

```
yarn run start
```
App will be opened in browser at `http://localhost:3000/`

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

Backend Roles:
Platform_Admin
Platform_Auditor
Platform_CustomerService
Company_FundManagerN
Company_FundManagerA

http://heliumcryptic.website