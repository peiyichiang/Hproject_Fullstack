# H Project Installation / Setup

## Usage

### 1. Download this repository
```
git clone https://github.com/... my-app
```

Repository will be downloaded into `my-app/` folder

### 2. Instal dependencies

Go to the downloaded repository folder and run:
```
yarn install
```

```
yarn global add mocha
```
to run Mocha test, $ yarn run test

------==
```
yarn add solc --dev
node ./ethereum/compileXYZ.js
```

### 3. Run the app

```
yarn run serve
```

App will be opened in browser at `http://localhost:8080/`

## Use with cordova

...

## One command install

```
git clone https://github.com/... my-app &&
cd my-app &&
yarn install &&
yarn run serve
```

## Live Preview

https://www.heliumcryptic.website
