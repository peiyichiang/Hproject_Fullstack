# Backend

## Usage

### 1. Download this repository
```
git clone https://github.com/backend my-app
```

Repository will be downloaded into `my-app/` folder

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

### 4. Run Solidity Unit Tests

Go to the ethereum/contracts folder under the project
Compile and build smart contract ABI and bytecode:
```
node zcompile.js
```

Install web3@1.0.0-beta.37 to prevent Ganache-cli provider error
https://github.com/ethereum/web3.js/issues/2266
```
yarn add web3@1.0.0-beta.37
```

Write tests inside project root directory -> test folder

Install Mocha, a JavaScript test framework
```
yarn global add mocha
yarn run test
```


## Live Preview

http://heliumcryptic.website/backend
http://rinkeby.etherscan.com/smartcontract
