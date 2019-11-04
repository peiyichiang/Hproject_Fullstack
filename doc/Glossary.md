Referenced source:
https://medium.com/chainfundch/blockchain-basics-02-a-complete-view-on-ethereum-blockchain-89e103b4ddaa

Smart contracts

Codes that add a layer of logic and computation to the trust infrastructure
supported by the blockchain. Smart contracts allow for execution of code,
enhancing the basic value transfer capability of the Bitcoin Blockchain.

Solidity

the high level programming language code for writing smart contracts that run on
EVM.

Ethereum Virtual Machine (EVM)

a special structure where code is deployed on after being translated into
byte-code. Accounts are basic units of Ethereum protocol: external owned
accounts and smart contract accounts. An Ethereum transaction includes not only
fields for transfer of Ethers but also for messages for invoking smart contract.

Externally Owned Accounts, or EOA, are controlled by private keys.

Contract Accounts, or CA, are controlled by code and can be activated only by an
EOA.

Transaction Validation involves checking the timestamp and nonce combination to
be valid, and the availability of sufficient fees for execution.

Miner Nodes in the network receive, verify, gather and execute transactions. Any
transaction in

Ethereum, including transfer of Ethers, requires fees or gas points to be
specified in the transaction.

Gas Points are used to specify the fees instead of Ether for ease of comparison
using standard values. Miners are paid fees for security, validation, execution
of smart contract as well as for creation of blocks.

\-----------------------------==

PMC … Product Manager contract

CFC … Crowdfunding contract

TCC … TokenController contract

ABC … Assetbook contract

Table … a table inside database

Funding state can be one of the following: initial, funding, fundingPaused,
fundingGoalReached, fundingClosed, fundingNotClosed, terminated

Require statements

a check function to evaluation a given boolean statement or variable

If the result is true, then the execution will go to the next line.

If the result is false, then the whole transaction will be reverted.
