/**
$ yarn global add mocha
$ yarn run test
*/
const assert = require('assert');
const ganache = require('ganache-cli');
const options = { gasLimit: 8000000 };
/**https://github.com/trufflesuite/ganache-cli#using-ganache-cli
 -g or --gasPrice: The price of gas in wei (defaults to 20000000000)
 -l or --gasLimit: The block gas limit (defaults to 0x6691b7)
 */

const Web3 = require('web3');
const provider = ganache.provider(options);
// const server = ganache.server(options);
// server.listen(port, (err, blockchain) => {
//     /* */
// });
const web3 = new Web3(provider);//lower case web3 means it is an instance

require('events').EventEmitter.defaultMaxListeners = 30;
//require('events').EventEmitter.prototype._maxListeners = 20;
/* emitter.setMaxListeners();
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
*/

//--------------------==
const ctrtData = require('../ethereum/contracts/build/Crowdfunding.json');
//const { interface, bytecode } = require('../compile');//dot dot for one level up

if (ctrtData === undefined){console.log('[Error] ctrtData is NOT defined');
} else {console.log('[Good] ctrtData is defined; ctrtData:');
    //console.log(ctrtData);
}

//Mocha starts > BeforeEach: Deploy a new contract
// > it: Manipulate the contract > it: make an assertion > repeat

// Slow tests... so changed my `mocha` command to `mocha --watch`

let accounts;
let instCtrtData; let addrCtrtData;
let acc0; let acc1; let acc2; let acc4;
let balance0; let balance1; let balance2;
let balance1A; let balance2A;

//const rate = new BigNumber('1e22').mul(value);
const addr0 = "0x0000000000000000000000000000000000000000";
beforeEach( async () => {
    //use one of these accounts to deploy the contract
    accounts = await web3.eth.getAccounts();
    acc0 = accounts[0];
    acc1 = accounts[1];
    acc2 = accounts[2];
    acc3 = accounts[3];
    acc4 = accounts[4];

    if (2===1) {
        balance0 = await web3.eth.getBalance(acc0);//returns strings!
        balance1 = await web3.eth.getBalance(acc1);//returns strings!
        balance2 = await web3.eth.getBalance(acc2);//returns strings!
        console.log('acc0',  acc0, balance0);//100,00000000,0000000000
        console.log('acc1',  acc1, balance1);
        console.log('acc2',  acc2, balance2);
    }

    const _nftName = "NCCU site No.1(2018)"; 

    if (ctrtData.abi === undefined){console.log('[Error] ctrtData.abi is NOT defined');
    } else {console.log('[Good] ctrtData.interface is defined; ctrtData.abi:');
        //console.log(ctrtData.interface);
    }
    if (ctrtData.bytecode === undefined){console.log('[Error] ctrtData.bytecode is NOT defined');
    } else {console.log('[Good] ctrtData.bytecode is defined; ctrtData.bytecode:');
        //console.log(ctrtData.bytecode);
    }

    //https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html
    const args = [
        _nftName, _nftSymbol, _siteSizeInKW, _maxTotalSupply, 
        _initialAssetPricing, _pricingCurrency, _IRR20yrx100, _validDate
    ]
    instCtrtData = await new web3.eth.Contract(JSON.parse(ctrtData.interface))
      .deploy({ data: ctrtData.bytecode, arguments: args
    })
    .send({ from: acc0, gas: '7000000', gasPrice: '9000000000' });

  if (instCtrtData === undefined){console.log('[Error] instCtrtData is NOT defined');
    } else {console.log('[Good] instCtrtData is defined');}
  instCtrtData.setProvider(provider);//super temporary fix. Use this for each compiled ctrt!

});

describe('ERC721_Functional_Test', () => {
  it('check ctrtData and ERC721 deployment test', async () => {
    assert.ok(instCtrtData.options.address);
    //test if the instanceCtrt has a property options, which has a property of address
    //test if such value exists or is not undefined
    addrCtrtData = instCtrtData.options.address;
    console.log('addrCtrtData', addrCtrtData);

  });


  it('read functions test', async () => {
    addrCtrtData = instCtrtData.options.address;//!!!!!!!!! different EVERY it()!!!
    console.log('addrCtrtData', addrCtrtData);

    let givenAssetName = "NCCU site No.1(2018)";

    // await instCtrtData.methods.set_admin(acc1, acc0).send({
    //   value: '0', from: acc0, gas: '1000000'
    // });//set_tokenDump(address _tokenDump, address vendor)

    let owner = await instCtrtData.methods.owner().call();

    assert.equal(owner, acc0);

    let name = await instCtrtData.methods.name().call();

    assert.equal(name, givenAssetName);

  });

  it('transferFrom initiated by owner', async () => {
    addrCtrtData = instCtrtData.options.address;
    console.log('addrCtrtData', addrCtrtData);

    //-------------==balances
    const balance0A = await instCtrtData.methods.balanceOf(acc0).call();
    assert.equal(balance0A, 0);

    //-------------==transferFrom by owner
    console.log("transferFrom by owner");
    let balanceOf3C = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3C, 0);
    _from = acc2; _to = acc3; _tokenId = 1;

    console.log("transferFrom by owner2");
    await instCtrtData.methods.transferFrom(_from, _to, _tokenId).send({
      value: '0', from: acc2, gas: '1000000'
    });//
    balanceOf2C = await instCtrtData.methods.balanceOf(acc2).call();
    assert.equal(balanceOf2C, 0);
    console.log("transferFrom by owner3");
    let balanceOf3D = await instCtrtData.methods.balanceOf(acc3).call();
    assert.equal(balanceOf3D, 1);


  });


});