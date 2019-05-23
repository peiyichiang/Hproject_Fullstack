//let addrIncomeManagement, addrProductManager;
console.log('--------------------==zsetupData.js');
let timeAnchor, CFSD2, CFED2, TimeReleaseDate, TimeTokenUnlock, TimeTokenValid, fundmanager, serverTime;

let symbolObject, addrHelium, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrRegistry, symbolObj0, symbolObj1, symbolObj2, symObjArray, symArray, crowdFundingAddrArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, timeOfDeployment, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, admin, adminpkRaw, AssetOwner1, AssetOwner1pkRaw, AssetOwner2, AssetOwner2pkRaw, AssetOwner3, AssetOwner3pkRaw, AssetOwner4, AssetOwner4pkRaw, AssetOwner5, AssetOwner5pkRaw, managementTeam, symNum;

admin = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
adminpkRaw = "0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C";
AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";
AssetOwner4 = "0x1706c33b3Ead4AbFE0962d573eB8DF70aB64608E";
AssetOwner4pkRaw = "0x9767cc10e5c9ceaa945323f26aac029afbf5bb5a641d717466ca44a18dca916f";
AssetOwner5 = "0xa6cc621A179f01A719ee57dB4637A4A1f603A442";
AssetOwner5pkRaw = "0x3f6f9f5802784b4c8b122dc490d2a25ea5b02993333ecff20bedad86a48ae48a";

managementTeam = [admin, AssetOwner1, AssetOwner2, AssetOwner3, AssetOwner4];

/** deployed contracts
    yarn run deploy -c 1 -s 1 -cName db
    cName = helium, assetbook, registry, cf, tokc, hcat, db
 */
addrHelium =     "0xbf94fAE6B7381CeEbCF13f13079b82E487f0Faa7";
addrAssetBook1 = "0x10C2E71CE92d637E6dc30BC1d252441A2E0865B0";
addrAssetBook2 = "0xe1A64597056f5bf55268dF75F251e546879da89c";
addrAssetBook3 = "0x22e2691be1312F69549d23A2C2d3AA3d55D56c92";
addrRegistry =   "0xe86976cEd3bb9C924235B904F43b829E4A32fa0d";

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
function productObject(nftSymbol, nftName, location, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, timeOfDeployment, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager) {
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
  this.timeOfDeployment = timeOfDeployment;
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
serverTime = 201905201700;
timeAnchor = serverTime+1000;
CFSD2 = timeAnchor+1;
CFED2 = timeAnchor+7;
TimeReleaseDate = timeAnchor+10;
TimeTokenUnlock = timeAnchor+20; 
TimeTokenValid =  timeAnchor+90;
fundmanager = 'Company_FundManagerN';

const productObj0 = new productObject("AKOS1902", "nftName", "location", 973, 924, 300, 18000, "NTD", 470, 20, 201905150000, 2, "0x677835e97c4Dc35cc1D9eCd737Cc6Fc1380e1bDD", "0xF8Bbc068b325Fe7DA1Ef9bE8f69de38CB7299D10", "0xe589C3c07D6733b57adD21F8C17132059Ad6b2b0", "");

/** deployed contracts
    yarn run deploy -c 1 -n 0 -cName cf
    -c chain    -n symNum   
    cName = helium, assetbook, registry, tokc, hcat, cf, db
*/
/**
"AAOS1903", 18000, "NTD", 986, 973, 201905201800, 201905211810, 201905211710, "0xbf94fAE6B7381CeEbCF13f13079b82E487f0
nftSymbol, initialAssetPricing, pricingCurrency, maxTotalSupply, quantityGoal, CFSD2, CFED2, timeOfDeployment, addrHelium

nftSymbol, nftName, location, maxTotalSupply, quantityGoalPercentage, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, timeOfDeployment, 
fundingType: PO: 1, PP: 2
addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager
*/
const productObj1 = new productObject("AAOS1903", "nftName", "location", 986, 973, 300, 18000, "NTD", 470, 20, serverTime, 2, "0xBC62fbFA144f3bAeea7889DB17e581dd48CAF16C", "0x423E610E7Ba9781D598593c1387fd854995bAe57", "0x2DC32EF8EA02D8965B813a466e1dB35bbd3a80b5", "");
const productObj2 = new productObject("ALOS1901", "nftName", "location", 2073, 2035, 350, 19000, "NTD", 480, 20, serverTime, 2, "", "", "", "");
const productObj3 = new productObject("AOOS1901", "nftName", "location", 5073, 4937, 400, 20000, "NTD", 490, 20, serverTime, 2, "", "", "", "");

symNum = 1;
const productObjArray = [productObj0, productObj1, productObj2, productObj3];
const symbolArray = [];
crowdFundingAddrArray= [];
tokenControllerAddrArray= [];

productObjArray.forEach( (obj) => {
  symbolArray.push(obj.nftSymbol);
  crowdFundingAddrArray.push(obj.addrCrowdFunding);
  tokenControllerAddrArray.push(obj.addrTokenController)
});
console.log('\nconst symbolArray =', symbolArray, ';\nconst crowdFundingAddrArray =', crowdFundingAddrArray, ';\nconst tokenControllerAddrArray =', tokenControllerAddrArray,';');

console.log(`
const timeAnchor = ${timeAnchor};
const CFSD2 = timeAnchor+1;
const CFED2 = timeAnchor+7;
const TimeReleaseDate = timeAnchor+10;
const TimeTokenUnlock = timeAnchor+20; 
const TimeTokenValid =  timeAnchor+90;
const fundmanager = 'Company_FundManagerN';
const pricingCurrency = "NTD";
const timeOfDeployment = timeAnchor+1000;
`);
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
timeOfDeployment = productObjArray[symNum].timeOfDeployment;
fundingType = productObjArray[symNum].fundingType;
addrTokenController = productObjArray[symNum].addrTokenController;
addrHCAT721 = productObjArray[symNum].addrHCAT721;
addrCrowdFunding = productObjArray[symNum].addrCrowdFunding;
addrIncomeManager = productObjArray[symNum].addrIncomeManager;

addrProductManager= '';

tokenURI = nftSymbol+"/uri";

console.log(`
const timeAnchor = ${timeAnchor};
const CFSD2 = ${CFSD2};
const CFED2 = ${CFED2};
const TimeReleaseDate = ${TimeReleaseDate};
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

duration: ${duration}, timeOfDeployment: ${timeOfDeployment}
fundingType: ${fundingType}
`);
module.exports = {
  addrHelium, addrAssetBook1, addrAssetBook2, addrAssetBook3, addrRegistry, productObjArray, symbolArray, crowdFundingAddrArray, userArray, tokenControllerAddrArray, nftName, nftSymbol, maxTotalSupply, quantityGoal, siteSizeInKW, initialAssetPricing, pricingCurrency, IRR20yrx100, duration, location, tokenURI, timeOfDeployment, fundingType, addrTokenController, addrHCAT721, addrCrowdFunding, addrIncomeManager, admin, adminpkRaw, AssetOwner1, AssetOwner1pkRaw, AssetOwner2, AssetOwner2pkRaw, AssetOwner3, AssetOwner3pkRaw, AssetOwner4, AssetOwner4pkRaw, AssetOwner5, AssetOwner5pkRaw, managementTeam, symNum
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
