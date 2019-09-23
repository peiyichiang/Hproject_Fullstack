pull from remote branch
$ yarn install

$ yarn run solc
$ yarn run testhcat
$ yarn run testcf
$ yarn run testim

add your new product details in ethereum/contracts/zsetupData.js
const productObj0 = new productObject(...);
productObjArray = [...]
symNum = 2;

consider turn timeserver or part of it on...
const isTimeserverON = true;
const useFullTimeServer = true;

deploy contracts by ethereum/contracts/zdeploy.js
$ yarn run deploy -c 1 -s 1 -cName cName
cName = helium, assetbook, registry, cf, tokc, hcat, addproduct, adduser, addorder, im, addsctrt, addia, pm
copy and paste the contract addresses into zsetupData.js


operate on contracts by ethereum/contracts/zlivechain.js
checkDeployedContracts: yarn run livechain -c 1 --f 0
addUserArray: yarn run livechain -c 1 --f 21
setupTest:   yarn run livechain -c 1 --f 1
getTokenController:  yarn run livechain -c 1 --f 2
showAssetBookBalance_TokenId:  yarn run livechain -c 1 --f 3
showAssetBookBalancesBigAmount: yarn run livechain -c 1 --f 31
showAssetInfo: yarn run livechain -c 1 --f 4

investCrowdContract: 
notice toAssetbookNumStr: 1 for assetBook1...
Check CFC details:  yarn run livechain -c 1 --f 8 -s 0 -t 1 -a 1
Set CFC to funding: yarn run livechain -c 1 --f 8 -s 1 -t 1 -a 1
Check all balances: yarn run livechain -c 1 --f 8 -s 3 -t 1 -a 1
Invest/buy:         yarn run livechain -c 1 --f 8 -s 4 -t 1 -a 1079

Inside timeserver/manualTriggered.js
mintSequentialPerCtrt_API: yarn run testmt -f 43