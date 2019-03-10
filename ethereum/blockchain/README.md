# CliqueChain

## command line :

- init

    geth --datadir ./data init genesis.json

- open node

    geth --datadir ./data --networkid 123 --syncmode "full" --gcmode "archive" --port 30303 --rpc --rpcport 8545 --rpcapi "eth,net,web3" --rpcaddr "0.0.0.0" --rpccorsdomain "*" --ws --wsorigins "*" --wsport 8546 --wsaddr "0.0.0.0" --gasprice "0" --unlock e0486839768db2e5fb64c7a86a17eb57b223b8a2 --password "./pwd.txt"
