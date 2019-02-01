const path = require('path');
//guaranteed for cross platform path from current dir to inboc dir
const solc = require('solc');
const fs = require('fs-extra');//filesystem module EXTRA

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);//remove the build folder

fs.ensureDirSync(buildPath);//if the build folder does not exist, make it existing

//var mkdirp = require('mkdirp');
// mkdirp(buildPath, function(err) { 
//   if (err) {
//     console.error(err);
//     return;
//   } else {
//     console.log('new build directory is made');
//   }
// });

console.log('check1');
const fileList = ['Campaign', 'Crowdfunding', 'SafeMath', 'Ownable', 'Registry', 'ERC721_SPLC6', 'Asset'];

for (let idx in fileList) {
  const solFileName = fileList[idx];
  console.log('\n inside ', solFileName);
  //const solFileName= 'Campaign';
  const filePath = path.resolve(__dirname, solFileName+'.sol');
  //const filePath = path.resolve(__dirname, 'contracts', solFileName+'.sol');

  // Note: You should be defining your contract sources as objects now.
  // Note: You must also provide the compiler output selection as well.
  const source = {
    language: "Solidity",
    sources: {
        'solFile': { content: fs.readFileSync(filePath, 'utf8') }
    },
    settings: {
      outputSelection: {
        "*": {
          "*": [ "abi", "evm.bytecode" ]
        }
      }
    }
  };

  function findImports(path) {
    return {
        'contents': fs.readFileSync(path).toString()
    }
  }
  // function findImports(importPath, sourcePath) {
  //   try {
  //     var filePath = path.resolve(sourcePath, importPath)
  //     return { contents: fs.readFileSync(filePath).toString() }
  //   } catch (e) {
  //     return { error: e.message }
  //   }
  // }
  console.log('Compiling the contract', solFileName);
  // Note: You have to pass the input in with JSON.stringify now.
  const compiledSol = JSON.parse(solc.compile(JSON.stringify(source), findImports));
  if(compiledSol.errors) {
    compiledSol.errors.forEach(err => console.log(err.formattedMessage));
  }
  // Note: This changed slightly since I'm using JSON.parse above.
  console.log('compiledSol', compiledSol);


  //const ctrt = compiledSol.contracts['solFile'].Campaign;
  //const ctrt = ctrtGroup.Campaign;

  const ctrtGroup = compiledSol.contracts['solFile'];
  console.log('ctrtGroup',ctrtGroup);
  for (let ctrtName in ctrtGroup) {
    console.log('\ninside output', ctrtName);

    const ctrt = ctrtGroup[ctrtName];
    if (ctrt === undefined){
      console.log('\nCheck if '+ctrtName+' is correct');
      return;
    } else {console.log('[Good] '+ctrtName+' is found');}
    //console.log('ctrt', ctrt);
    
    const abi = ctrt.abi;// Note: This is now called 'abi' and not 'interface'
    if (abi === undefined || abi === '') {
      console.log('\n[Error] abi is undefined or empty -> Check if you can deploy it in a Ethereum VM ... can use Remix');
    } else {console.log('[Good] '+ctrtName+' abi is found');}
    //console.log('abi', abi);
    
    const bytecode = ctrt.evm.bytecode.object;
    if (bytecode === undefined || bytecode === '') {
      console.log('\n[Error] bytecode is undefined or empty -> Check if you can deploy it in a Ethereum VM ... can use Remix');
    } else {console.log('[Good] '+ctrtName+' bytecode is found');}
    
    console.log('writing to abi and bytecode files');
    //fs.ensureDirSync(buildPath);//if the build folder does not exist, make it existing
    //fs.mkdirSync(buildPath);

    const compiledCtrt = {
      abi: abi,
      bytecode: bytecode
    }
    
    const filePathOut = path.resolve(buildPath, ctrtName+'.json');
    //const filePathOut = path.resolve(__dirname, ctrtName+'.json');
    fs.writeFileSync(filePathOut, JSON.stringify(compiledCtrt, null, 2));
    console.log('Finished compiling for '+solFileName);

  }
}

// fs.writeFileSync('./ethereum/contracts/'+ctrtName+'_abi.json', JSON.stringify(abi, null, 2));


// for (var contractName in output.contracts['test.sol']) {
// 	console.log(contractName + ': ' + output.contracts['test.sol'][contractName].evm.bytecode.object)
// }

/*
for (let contract in compiledCtrt1) {
  console.log('inside output', contract);
  fs.outputJsonSync(//write out json files
        path.resolve(buildPath, contract.replace(':','')+'.json'),
        compiledCtrt1[contract]
    );//make the compiled files(json files), buildPath is a variable
}*/

/**
async function deployContract(web3, contract, sender) {
    let Voter = new web3.eth.Contract(JSON.parse(JSON.stringify(abi)));
    let bytecode = '0x' + contract.evm.bytecode.object;
    let gasEstimate = await web3.eth.estimateGas({data: bytecode});

    // The rest should work fine...
}
*/

/*
console.log('\n-----------------==Solidity target file1');
const solName2 = 'zzzTokenHeart5D.sol';// xyz.sol;
const ctrtNameArray= ['HeartData', 'HeartLogic'];

const filePath2 = path.resolve(__dirname, 'contracts',solName2);//contracts > [solName2].sol
console.log('filePath2:', filePath2);

const source2 = fs.readFileSync(filePath2, 'utf8');
if (Object.keys(source2).length === 0 && source2.constructor === Object) {
  console.log('\n----==[Error] source2');
  console.log('source2:',source2);
  console.log('check if solName2 is incorrect or missing .sol at the end');
  return;
} else {console.log('\n[Good] source2 is not empty');}

const compiledCtrtsFile2 = solc.compile(source2, 1).contracts;//we only want the contract property
// because Object.keys(new Date()).length === 0;
// we have to do some additional check
if (Object.keys(compiledCtrtsFile2).length === 0 && compiledCtrtsFile2.constructor === Object) {
  console.log('\n----==[Error] compiledCtrtsFile2');
  console.log('compiledCtrtsFile2:',compiledCtrtsFile2);
  console.log('check Online Remix to fix compiling errors');
  return;
} else {console.log('\n[Good] compiledCtrtsFile2 is not empty');}


console.log('\n----==ctrts');
let compiledSolName; let ctrtName;
for (let idx in ctrtNameArray) {
    console.log('');
    ctrtName = ctrtNameArray[idx];
    console.log('ctrtName:', ctrtName);
    compiledSolName = ':'+ctrtName;

    if (compiledCtrtsFile2[compiledSolName] === undefined){
      console.log('Check if ctrtName compiledSolName is correct');
      return;
    } else {console.log('\n[Good] ctrtName is correct');}

    if (compiledCtrtsFile2[compiledSolName].interface === ''){
      //TypeError: Cannot read property 'interface' of undefined => check ctrtName
      console.log('\n[Error]  interface2 is an empty string -> Check if you can deploy it in a Ethereum VM ... can use Remix');
    } else {console.log('[Good] interface2 is found');}
    if (compiledCtrtsFile2[compiledSolName].bytecode === ''){
      console.log('\n[Error]  bytecode2 is an empty string -> Check if you can deploy it in a Ethereum VM ... can use Remix');
    } else {console.log('[Good] bytecode2 is found');}
}

console.log('\n----==clean up contract json filenames');
for (let contract in compiledCtrtsFile2) {
    console.log(contract);
    fs.outputJsonSync(//write out json files
        path.resolve(buildPath, contract.replace(':','')+'.json'),
        compiledCtrtsFile2[contract]
    );//make the compiled files(json files), buildPath is a variable
}
*/
