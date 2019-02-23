# Backend

## Usage

### 1. Download this repository
```
git clone git@gitlab.com:zSukhoi57/Hproject_Fullstack.git Hproject_Fullstack
```

Repository will be downloaded into `Hproject_Fullstack/` folder

### 2. Instal dependencies

Go to the downloaded repository folder and run:
```
yarn install
```

### 3. Run the app

```
yarn run start
```

App will be opened in browser at `http://localhost:3000/`

### 4. Compile Solidity smart contracts

Go to the ethereum/contracts folder under the project
Compile and build smart contract ABI and bytecode:
```
node zcompile.js
```

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
yarn global add mocha
yarn run test
```

## 7. Live Preview

http://heliumcryptic.website/backend
http://rinkeby.etherscan.com/smartcontract
