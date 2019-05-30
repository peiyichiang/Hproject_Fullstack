const Web3 = require('web3');
const nodeUrl = "http://140.119.101.130:8545";//POA
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));


//let addrIncomeManagement, addrProductManager;
console.log('--------------------==zsetupData.js');
let addrHelium, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrRegistry, crowdFundingAddrArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, symNum, fundmanager;

const admin = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
const adminpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
const AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
const AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
const AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
const AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
const AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
const AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
const AssetOwner4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
const AssetOwner4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";
const AssetOwner5 = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
const AssetOwner5pkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";

const assetOwnerArray = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4, AssetOwner5];
const assetOwnerpkRawArray = [adminpkRaw, AssetOwner1pkRaw, AssetOwner2pkRaw, AssetOwner3pkRaw, AssetOwner4pkRaw, AssetOwner5pkRaw];

const managementTeam = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4];

/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = helium, assetbook, registry, cf, tokc, hcat, db1, im, pm, db2
 */
addrHelium =     "0x315521e6D7BafAA84823D2Bc4F78893459275501";
addrAssetBook1 = "0x53E7c6fe9A1e902b8Ca5803Cd050696ED1246a54";
addrAssetBook2 = "0x188FE930714DB55609eBbeA45f0DCce14BbEF716";
addrAssetBook3 = "0x350b52dC1E7Aa23b005d397098eF3F6b246F9D54";
addrRegistry =   "0xE71BDa257B50850Ff573832D06a9fb795A325735";

function userObject(email, password, identityNumber, eth_add, cellphone, name, addrAssetBook, investorLevel) {
  this.email = email;
  this.password = password;
  this.identityNumber = identityNumber;
  this.eth_add = eth_add;
  this.cellphone = cellphone;
  this.name = name;
  this.addrAssetBook = addrAssetBook;
  this.investorLevel = investorLevel;
}
const user0 = new userObject('user0@gmail.com', 'user0pw', 'R999777000', AssetOwner1, '093755500', 'Romeo0', addrAssetBook1, 5);
const user1 = new userObject('user1@gmail.com', 'user1pw', 'R999777001', AssetOwner1, '093755501', 'Romeo1', addrAssetBook1, 5);
const user2 = new userObject('user2@gmail.com', 'user2pw', 'R999777002', AssetOwner2, '093755502', 'Romeo2', addrAssetBook2, 5);
const user3 = new userObject('user3@gmail.com', 'user3pw', 'R999777003', AssetOwner3, '093755503', 'Romeo3', addrAssetBook3, 5);
const userArray = [user0, user1, user2, user3];

//fundingType= 1 PO, 2 PP
//Math.round(maxTotalSupply*quantityGoalPercentage);
function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, fundingType, addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager) {
  this.nftSymbol = nftSymbol;
  this.maxTotalSupply = maxTotalSupply;
  this.quantityGoal = quantityGoal;
  this.siteSizeInKW = siteSizeInKW;
  this.initialAssetPricing = initialAssetPricing;
  this.pricingCurrency = pricingCurrency;
  this.fundingType = fundingType;
  this.IRR20yrx100 = IRR20yrx100;
  this.duration = duration;
  this.nftName = nftSymbol+" site No.n(2019)";
  this.location = nftSymbol.substr(0, nftSymbol.length-4);
  this.addrTokenController = addrTokenController;
  this.addrHCAT721 = addrHCAT721;
  this.addrCrowdFunding = addrCrowdFunding;
  this.addrIncomeManager = addrIncomeManager;
}
/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = helium, assetbook, registry, cf, tokc, hcat, db
 */


// const currentTime = await timer.getTime();
// console.log('currentTime', currentTime);
//To be copied to timeserverTest.js
const TimeOfDeployment_CF = 201905281410;
const CFSD2 = TimeOfDeployment_CF+10;
const CFED2 = TimeOfDeployment_CF+15;
const TimeOfDeployment_TokCtrl = TimeOfDeployment_CF + 20;
const TimeOfDeployment_HCAT = TimeOfDeployment_CF + 21;
const TimeOfDeployment_IM = TimeOfDeployment_CF + 22;
const TimeTokenUnlock = TimeOfDeployment_CF+30; 
const TimeTokenValid =  TimeOfDeployment_CF+90;
fundmanager = 'FundManagerN';

/** deployed contracts
    yarn run deploy -c 1 -n 0 -cName tokc
    -c chain    -n symNum   
    cName = helium, assetbook, registry, cf, tokc, hcat, db
*/
//fundingType: PO: 1, PP: 2
//addrCrowdFunding, addrTokenController, addrHCAT721, addrIncomeManager
symNum = 1;
const productObj0 = new productObject("ACOS1901", "nftName", "location", 973, 924, 300, 18000, "NTD", 470, 20, 201905241737, 2, "", "", "", "");

const productObj1 = new productObject("AKOS1902", "nftName", "location", 1486, 1372, 500, 18000, "NTD", 470, 20, 2, "0x5AE9b9B3348A845E67E6B3D3bEa69ae06F65EcbB", "0x47ca433c10c183B930A021fb5E0Ac647E5BFB2e3", "0x5A79f39512735d2Cc1cce8D872ec03587B52aBA1", "");

const productObj2 = new productObject("ALOS1902", "nftName", "location", 2073, 2035, 750, 19000, "NTD", 480, 20, 2, "", "", "", "");

const productObj3 = new productObject("AMOS1902", "nftName", "location", 3173, 3037, 980, 20000, "NTD", 490, 20, 2, "", "", "", "");

const productObj4 = new productObject("AOOS1902", "nftName", "location", 5073, 4937, 1400, 20000, "NTD", 490, 20, 2, "", "", "", "");

const productObjArray = [productObj0, productObj1, productObj2, productObj3, productObj4];
const symbolArray = [];
crowdFundingAddrArray= [];
tokenControllerAddrArray= [];

productObjArray.forEach( (obj) => {
  symbolArray.push(obj.nftSymbol);
  crowdFundingAddrArray.push(obj.addrCrowdFunding);
  tokenControllerAddrArray.push(obj.addrTokenController)
});
console.log('\nconst symbolArray =', symbolArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray,';');

console.log('symNum', symNum);
nftName = productObjArray[symNum].nftName;
nftSymbol = productObjArray[symNum].nftSymbol;
maxTotalSupply = productObjArray[symNum].maxTotalSupply;
quantityGoal = productObjArray[symNum].quantityGoal;
siteSizeInKW = productObjArray[symNum].siteSizeInKW;
initialAssetPricing = productObjArray[symNum].initialAssetPricing;
pricingCurrency = productObjArray[symNum].pricingCurrency;
IRR20yrx100 = productObjArray[symNum].IRR20yrx100;
duration = productObjArray[symNum].duration;
location = productObjArray[symNum].location;
fundingType = productObjArray[symNum].fundingType;
addrTokenController = productObjArray[symNum].addrTokenController;
addrHCAT721 = productObjArray[symNum].addrHCAT721;
addrCrowdFunding = productObjArray[symNum].addrCrowdFunding;
addrIncomeManager = productObjArray[symNum].addrIncomeManager;

addrProductManager= '';

tokenURI = nftSymbol+"/uri";

console.log(`
const TimeOfDeployment_CF = ${TimeOfDeployment_CF};
const CFSD2 = ${CFSD2};
const CFED2 = ${CFED2};
const TimeOfDeployment_TokCtrl = ${TimeOfDeployment_TokCtrl};
const TimeOfDeployment_HCAT = ${TimeOfDeployment_HCAT};
const TimeOfDeployment_IM = ${TimeOfDeployment_IM};
const TimeTokenUnlock = ${TimeTokenUnlock}; 
const TimeTokenValid =  ${TimeTokenValid};
const fundmanager = '${fundmanager}';

symNum: ${symNum}
nftSymbol: ${nftSymbol}, nftName: ${nftName}
maxTotalSupply: ${maxTotalSupply}, quantityGoal: ${quantityGoal}
siteSizeInKW: ${siteSizeInKW}, tokenURI: ${tokenURI}
initialAssetPricing: ${initialAssetPricing}, pricingCurrency = ${pricingCurrency}, IRR20yrx100: ${IRR20yrx100}
addrHelium: ${addrHelium}
addrRegistry: ${addrRegistry}
addrTokenController = ${addrTokenController}
addrHCAT721 = '${addrHCAT721}'

duration: ${duration}, fundingType: ${fundingType}
`);

const argsCrowdFunding = [nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD2, CFED2, TimeOfDeployment_CF, addrHelium];

const argsTokenController = [
  TimeOfDeployment_TokCtrl, TimeTokenUnlock, TimeTokenValid, addrHelium ];

const nftName_bytes32 = web3.utils.fromAscii(nftName);
const nftSymbol_bytes32 = web3.utils.fromAscii(nftSymbol);
const pricingCurrency_bytes32 = web3.utils.fromAscii(pricingCurrency);
const tokenURI_bytes32 = web3.utils.fromAscii(tokenURI);

const argsHCAT721 = [
nftName_bytes32, nftSymbol_bytes32, siteSizeInKW, maxTotalSupply, 
initialAssetPricing, pricingCurrency_bytes32, IRR20yrx100,
addrRegistry, addrTokenController, tokenURI_bytes32, addrHelium,TimeOfDeployment_HCAT];
const argsIncomeManagement =[addrHCAT721, addrHelium];

const assetbookArray = [addrAssetBook1, addrAssetBook2, addrAssetBook3];
const userIDs = ["A500000001", "A500000002", "A500000003"];
const authLevels = [5, 5, 5];

module.exports = {
  addrHelium, assetbookArray, userIDs, authLevels, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, assetOwnerArray, assetOwnerpkRawArray, managementTeam, symNum,
  TimeOfDeployment_CF, TimeOfDeployment_TokCtrl, TimeOfDeployment_HCAT, TimeOfDeployment_IM, TimeTokenUnlock, TimeTokenValid, CFSD2, CFED2, 
  argsCrowdFunding, argsTokenController, argsHCAT721, argsIncomeManagement
}
  /**
  From KuanYi:
  "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
  "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
 
  https://iancoleman.io/bip39
  m/44'/60'/0'/0/0 	0xa6cc621A179f01A719ee57dB4637A4A1f603A442 	0x02afa51468bfb825ddfa794b360f42c016da3dba10df065a11650b63799befed45 	0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a

  m/44'/60'/0'/0/1 	0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2 	0x025e0eaf152f741fc91f437d0b6dfdaf96c076ad98010a0d60ba0490c05a46bbdd 	0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca

  m/44'/60'/0'/0/2 	0x470Dea51542017db8D352b8B36B798a4B6d92c2E 	0x0384a124835b166c5b3fceec66c861959843eeccb92e18de938be272328692d33f 	0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2

  m/44'/60'/0'/0/3 	0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61 	0x034d315e0adb4a832b692b51478feb1b81e761b9834aaf35f83cd23c43239027ed 	0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45

  m/44'/60'/0'/0/4 	0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E 	0x0231900ed8b38e4c23ede6c151bf794418da573c9f63a1235d8823ab229ed251e3 	0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f
  */
