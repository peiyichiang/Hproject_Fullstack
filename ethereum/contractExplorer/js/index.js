console.log('-------------------== index.js is getting loaded...');

const SERVER_HOST = 'localhost';
const SERVER_PORT = '3030';

const AssetOwner1 = "0x9714BC24D73289d91Ac14861f00d0aBe7Ace5eE2";
const AssetOwner1pkRaw = "0x2457188f06f1e788fa6d55a8db7632b11a93bb6efde9023a9dbf59b869054dca";
const AssetOwner2 = "0x470Dea51542017db8D352b8B36B798a4B6d92c2E";
const AssetOwner2pkRaw = "0xc8300f087b43f03d0379c287e4a3aabceab6900e0e6e97dfd130ebe57c4afff2";
const AssetOwner3 = "0xE6b5303e555Dd91A842AACB9dd9CaB0705210A61";
const AssetOwner3pkRaw = "0xf9a486a3f8fb4b2fe2dcf297944c1b386c5c19ace41173f5d33eb70c9f175a45";

let addrTo, addrFrom, addrToPk, addrFromPk;
let choiceFrom = 1, choiceTo = 2;

if(choiceFrom === 1){
  addrFrom = AssetOwner1;
  addrFromPk = AssetOwner1pkRaw;

} else if(choiceFrom === 2){
  addrFrom = AssetOwner2;
  addrFromPk = AssetOwner2pkRaw;

} else if(choiceFrom === 3){
  addrFrom = AssetOwner3;
  addrFromPk = AssetOwner3pkRaw;
}

if(choiceTo === 1){
  addrTo = AssetOwner1;
  addrToPk = AssetOwner1pkRaw;

} else if(choiceTo === 2){
  addrTo = AssetOwner2;
  addrToPk = AssetOwner2pkRaw;

} else if(choiceTo === 3){
  addrTo = AssetOwner3;
  addrToPk = AssetOwner3pkRaw;
}
const addrAssetBook = '0x856F20FF35503CFFe780bB3a100Bdd3DB359C168';


const getCrowdfundingDetails = async(addrAssetBook) => {
  console.log(`addrAssetBook: ${addrAssetBook}`);
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/Contracts/heliumContract/`;
  const response = await fetch(url);
  const text = await response.text();
  //console.log(text);
  return text;
}

const button2 = async(addrAssetBook) => {
  console.log(`addrAssetBook: ${addrAssetBook}`);
  const url = ``;
  const response = await fetch(url);
  const text = await response.text();
  //console.log(text);
  return text;
}

const getHeliumCtrtAddr = async() => {
  console.log(`inside getHeliumCtrtAddr()...`);
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/Contracts/heliumContract/`;
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

const testFunction = () => {
  console.log('testFunction');
}


document.getElementById("button0").addEventListener('click', async() => {
  const addrHeliumCtrt = await getHeliumCtrtAddr();
  console.log(`addrHeliumCtrt: ${addrHeliumCtrt}`);
});

document.getElementById("button1").addEventListener('click', async() => {
  const addrHeliumCtrt = await getHeliumCtrtAddr();
  console.log(`addrHeliumCtrt: ${addrHeliumCtrt}`);
});

document.getElementById("button2").addEventListener('click', async() => {
  const assetOwner = await button2(addrAssetBook);
  console.log(`assetOwner: ${assetOwner}`);
});

document.getElementById("button3").addEventListener('click', async() => {
  const result = await addLoginTime(addrAssetBook);
  console.log(result);
});


// var btn = document.createElement("BUTTON");   // Create a <button> element
// btn.innerHTML = "CLICK ME";                   // Insert text
// document.body.appendChild(btn);               // Append <button> to <body> 

