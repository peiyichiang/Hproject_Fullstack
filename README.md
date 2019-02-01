# H Project Installation / Setup

## Usage

### 1. Download this repository
```
git clone https://github.com/... my-app
```

Repository will be downloaded into `my-app/` folder

### 2. Instal dependencies
Install NodeJs: v11.6.0
Install Yarn: v1.13.0

Go to the downloaded repository folder and run:
```
yarn install
yarn add @babel/runtime --dev
yarn add async --dev
yarn add ganache-cli --dev
yarn add solc --dev
```

### 3. Compile Solidity smart contracts
$ node ./ethereum/contracts/zcompile.js

### 4. Test Solidity smart contracts
```
yarn global add mocha
```
to run Mocha test, $ yarn run test

### 5. Run the app

```
yarn run start
```

App will be opened in browser at `http://localhost:8080/`

