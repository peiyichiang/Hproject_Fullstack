**SmartContracts.js**

**To be edited then included into frontend apps**

1. Edit this SmartContracts.js
2. Copy & paste it into your frontend app project(temporarily Web3Frondend project)
3. Use webpack to bundle web3.js, smartContract.js, and compiled smart contracts(AssetBook and HCAT721)
4. Copy & paste the bundled file into your frontend app

Need to import the user's address and private key into the smartContract.js, then call the functions inside it., ...

| Packages | Descriptions|
|----------|-------------|
| web3| Ethereum Javascript API for interacting with ethereum nodes, using a HTTP or IPC connection |
| ethereumjs-tx | A simple module for creating, manipulating and signing ethereum transactions|

**Imported variables from /ethereum/contracts/zsetupData.js**

| Imported variables | Type | Descriptions  |
|--------------|----------|--------|
| ethereumNodeURL | string | URL for connecting to an Ethereum node |
| AssetOwner1 | string | an Ethereum EOA |
| AssetOwner1pkRaw | string | the private key of the above Ethereum address |
| addrHCAT721 | string | a deployed HCAT token contract address |
| fromAssetbook | string | a deployed assetbook contract address |
| toAssetbook | string | a deployed assetbook contract address |
| amountStr | number | the amount of tokens to be sent |
| priceStr | number | the price for each transferred token |
| HCAT721 | JSON | compiled HCAT721 contract |
| AssetBook | JSON | compiled Assetbook contract |


**Functions defined within smartContracts.js**

| Function Names| Parameters| Descriptions|Output |
|---------------|-----------|-------------|-------|
| checkSafeTransferFromBatch | assetIndex, addrHCAT721, fromAssetbook, toAssetbook, amount, price, serverTime| Check all arguments of safeTransferFromBatch() | string |
| transferTokens| addrHCAT721, fromAssetbook, toAssetbook, amountStr, priceStr, \_fromAssetOwner, \_fromAssetOwnerpkRaw | Transfer HCAT tokens | boolean |
| checkIsContract| addrAssetBook, assetAddr| Check if input address has a contract deployed in it| boolean |
| addLoginTime| addrAssetBook| add login time| boolean |
| assetOwnerVote| addrAssetBook, serverTime| for the assetbook owner to vote on the assetbook| boolean |
| endorserVote| addrAssetBook, serverTime| for an endorser to vote on other people's assetbook contract | boolean |
| setAntiSystemOverrideDays| addrAssetBook, _setAntiSystemOverrideDays| set the anti-System override days| boolean |
| resetVoteStatus| addrAssetBook| reset votes to zeros| boolean |
| addEndorser| addrAssetBook, newEndorser, serverTime| add a new endorser to the given assetbook| boolean |
| changeEndorser| addrAssetBook, oldEndorser, newEndorser, serverTime| change an existing endorser to a new endorser| boolean |
| getEndorsers| addrAssetBook| get all endorsers| array of strings |
| get_assetOwner| addrAssetBook | Get asset owner EOA saved inside given assetbook address| string |
| changeAssetOwner| addrAssetBook, \_assetOwnerNew, serverTime | Change assetbook owner EOA | boolean |
| getAssetbookDetails| addrAssetBook | Get all state variables from given assetbook address| array of booleans and strings |
| get_lastLoginTime | addrAssetBook | Get last login time inside given assetbook address| string |
| signTx | userEthAddr, userRawPrivateKey, contractAddr, encodedData| Use Ethereum-Tx.js to sign then send the signed transaction| - |
