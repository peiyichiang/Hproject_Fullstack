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
```

### 3. Compile Solidity smart contracts

Compile and build smart contract ABI and bytecode:
```
yarn run solc
```

### 4. Run the app

```
yarn run start
```

App will be opened in browser at `http://localhost:3000/`

### 5. Install web3 version 1.0.0-beta.37

Install web3@1.0.0-beta.37 to prevent Ganache-cli provider error
https://github.com/ethereum/web3.js/issues/2266
```
yarn add web3@1.0.0-beta.37
```

### 6. Run Mocha Tests on smart contracts and web3

Write tests inside project root directory -> test folder

Install Mocha, a JavaScript test framework
```
yarn run test721
yarn run testcf
OR
yarn run test
```

## 7. Live Preview

Backend User Login:
http://140.119.101.130:3000/BackendUser/BackendUserLogin

Backend Roles:
Platform_Admin
Platform_Auditor
Platform_CustomerService
Company_FundManagerN
Company_FundManagerA

http://heliumcryptic.website