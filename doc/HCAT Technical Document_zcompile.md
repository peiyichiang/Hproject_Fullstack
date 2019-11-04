**zcompile.js**

**Compile pre-defined smart contracts then put results into build folder...**

| Packages | Descriptions                                                                                                     |
|----------|------------------------------------------------------------------------------------------------------------------|
| fs       | File system read/write support                                                                                   |
| path     | Provides utilities for working with file and directory paths                                                     |
| fs-extra | Adds file system methods that aren't included in the native fs module and adds promise support to the fs methods |
| solc     | JavaScript bindings for the Solidity compiler.                                                                   |

Set the smart contracts that you want to compile by editing the fileList array.

E.g. put each of the smart contract name inside this array

const fileList = ['SafeMath', 'Ownable', 'AssetBook', 'Registry',
'HCAT721_AssetToken',

'TokenController', 'CrowdFunding', 'IncomeManagerCtrt', 'ProductManager',
'Helium',

'Settlement']

Note: this zcompile.js must be placed next to the smart contracts

The compilation can be triggered by this command:

cd ethereum/contracts && node zcompile.js

Then each smart contract will be compiled down to two parts, which are joined
into one json file. And that file is just one big json object with two keys:

“Abi” : [...] … an array of objects, ABI stands for *application binary
interface*, the interface between two program modules, one of which is often at
the level of machine code. The interface is the de facto method for
encoding/decoding data into/out of the machine code.

"bytecode": “...” … Ethereum smart contract is bytecode deployed on the Ethereum
blockchain. The contract converted to byte-code to run on the Ethereum Virtual
Machine (EVM), adhering to the
[specification](https://github.com/ethereum/yellowpaper). Note the function
names and input parameters are hashed during compilation.

Then those compiled smart contracts are ready to be imported into backend
servers or frondend apps.

See zsetupData.js to know how to import them.
