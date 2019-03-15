const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const PrivateKeyProvider = require("truffle-privatekey-provider");
const jwt = require('jsonwebtoken');
var router = express.Router();

/*Infura HttpProvider Endpoint*/
//web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d"));
/*POA*/
web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8545"));
/*ganache*/
//web3 = new Web3(new Web3.providers.HttpProvider("http://140.119.101.130:8540"));

/*後台公私鑰*/
var backendAddr = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
var backendPrivateKey = Buffer.from('17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C', 'hex');
var backendRawPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

const assetBookContract = require('../ethereum/contracts/build/AssetBook.json');

//deploy asset contract
router.post('/deploy', async function (req, res, next) {
    //const provider = new PrivateKeyProvider(privateKey, 'https://ropsten.infura.io/v3/4d47718945dc41e39071666b2aef3e8d');
    /**POA */
    const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8545');
    /**ganache */
    //const provider = new PrivateKeyProvider(backendPrivateKey, 'http://140.119.101.130:8540');

    const web3deploy = new Web3(provider);

    let assetOwner = req.body.assetOwner;
    let multiSigContractAddr = req.body.multiSigContractAddr;
    let platformContractAddr = req.body.platformContractAddr;
    let time = 201902250001;
    let assetBook = new web3deploy.eth.Contract(assetBookContract.abi);


    assetBook.deploy({
        data: assetBookContract.bytecode,
        arguments: [assetOwner, multiSigContractAddr, platformContractAddr, time]
    })
        .send({
            from: backendAddr,
            gas: 7000000,
            gasPrice: '0'
        })
        .on('receipt', function (receipt) {
            res.send(receipt);
        })
        .on('error', function (error) {
            res.send(error.toString());
        })
});



/*取得用戶address */
router.get('/OwnerEthAddr', async function (req, res, next) {
    let contractAddr = req.query.address;

    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);
    let assetsOwner = await assetBook.methods.assetOwner().call({ from: backendAddr })

    res.send({
        assetsOwner: assetsOwner
    })
});

/*新增資產到assetBook（由erc721Contract Trigger!）*/
router.post('/addAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let ERC721Addr = req.body.ERC721Addr
    let time = req.body.time;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetBook.methods.addAsset(ERC721Addr, time).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

//copy asset contract info without preserving buy/sell sequence for FIFO accounting purpose
router.patch('/updateReset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetAddr = req.body.assetAddr
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetBook.methods.updateReset(assetAddr).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

//updateAssetOwner
router.patch('/updateAssetOwner', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetBook.methods.updateAssetOwner().encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

//fixTimeIndexedIds
router.patch('/fixTimeIndexedIds', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetAddr = req.body.assetAddr;
    let amount = req.body.amount;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetBook.methods.fixTimeIndexedIds(assetAddr, amount).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

//updateAssetOwner
router.patch('/updateReceivedAsset', async function (req, res, next) {
    let contractAddr = req.body.address;
    let assetAddr = req.body.assetAddr;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用後台公私鑰sign*/
    let encodedData = assetBook.methods.updateReceivedAsset(assetAddr).encodeABI();
    let result = await signTx(backendAddr, backendRawPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })
});

/*輸入erc721tokenAddr，取得token相關資訊*/
router.get('/assetInfo', async function (req, res, next) {
    let contractAddr = req.query.address;
    let ERC721Addr = req.query.ERC721Addr
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    let asset = await assetBook.methods.getAsset(ERC721Addr).call({ from: backendAddr });

    res.send({
        asset: asset
    })
});

/*取得有幾種erc721token */
router.get('/assetAmount', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);
    let assetCount = await assetBook.methods.getAssetCount().call({ from: backendAddr });

    res.send({
        assetCount: assetCount
    })
});

/*取得assetBook 在這張erc721 contract裡面，所擁有的全部token */
router.get('/getAssetIds', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetAddr = req.query.assetAddr;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);
    let assetIds = await assetBook.methods.getAssetIds(assetAddr).call({ from: backendAddr });

    res.send({
        assetIds: assetIds
    })

});

/*取得assetBook所擁有的所有erc721token address */
router.get('/getAssetAddrList', async function (req, res, next) {
    let contractAddr = req.query.address;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);
    let assetIndex = await assetBook.methods.getAssetAddrList().call({ from: backendAddr });

    res.send({
        assetIndex: assetIndex
    })

});

/**approve token被移轉 */
router.post('/approve', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenAddr = req.body.tokenAddr;
    let approved = req.body.approved;
    let tokenId = req.body.tokenId;
    let time = req.body.time;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetBook.methods.approve(tokenAddr, approved, tokenId, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

/*轉移token */
router.post('/transfer', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenAddr = req.body.tokenAddr;
    let to = req.body.to;
    let tokenId = req.body.tokenId;
    let time = req.body.time;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetBook.methods.transferAsset(tokenAddr, to, tokenId, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

/*批次轉移token */
router.post('/transferAssetBatch', async function (req, res, next) {
    let contractAddr = req.body.address;
    let tokenAddr = req.body.tokenAddr;
    let to = req.body.to;
    let amount = req.body.amount;
    let time = req.body.time;
    let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);

    /*用手機keychain 抓公私鑰*/
    let assetsOwner = '0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB';
    let ownerPrivateKey = '0x17080CDFA85890085E1FA46DE0FBDC6A83FAF1D75DC4B757803D986FD65E309C';

    let encodedData = assetBook.methods.transferAssetBatch(tokenAddr, amount, to, time).encodeABI();
    let result = await signTx(assetsOwner, ownerPrivateKey, contractAddr, encodedData);

    res.send({
        result: result
    })


});

//通過User ID獲取Completed Order
router.get('/myAsset', async function (req, res, next) {
    var token = req.query.JWT_Token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "privatekey", async function (err, decoded) {
            if (err) {
                //JWT token驗證失敗
                console.log("＊:JWT token驗證失敗");
                console.log(err);
                res.json({
                    "message": "JWT token is invalid.",
                    "success": false
                });
                return;
            } else {
                //JWT token驗證成功

                console.log(decoded.u_assetbookContractAddress);
                let contractAddr = decoded.u_assetbookContractAddress;
                let assetBook = new web3.eth.Contract(assetBookContract.abi, contractAddr);
                let tokenAddressIndex = await assetBook.methods.getAssetAddrList().call({ from: backendAddr });
                console.log(tokenAddressIndex);

                var symbols = [];
                var data = {};
                for(var i=0 ; i<tokenAddressIndex.length; i++){
                    if(tokenAddressIndex[i]!="0x0000000000000000000000000000000000000000"){
                        console.log(tokenAddressIndex[i]);
                        let assetInfo = await assetBook.methods.getAsset(tokenAddressIndex[i]).call({ from: backendAddr });
                        console.log(assetInfo.symbol);
                        symbols.push(assetInfo.symbol);
                        console.log(assetInfo.amount);
                        data[assetInfo.symbol] = assetInfo.amount;
                    }
                }
                res.json({
                    "message": "[Success] 查找資產成功",
                    "success": true,
                    "MyAsset": data,
                    "AssetSymbols": symbols
                });

                ///////////////////////////////
                var mysqlPoolQuery = req.pool;
                /*
                mysqlPoolQuery('SELECT DISTINCT o_symbol FROM htoken.order WHERE o_userIdentityNumber = ? AND o_paymentStatus = ?', [decoded.u_identityNumber, "completed"], async function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({
                            "message": "[Success] 查找資產失敗",
                            "success": false,
                        });
                    } else {
                        // 生成sql查詢語句
                        sqls = [];
                        symbols = [];
                        for (var i = 0; i < rows.length; i++) {
                            sqls.push('SELECT SUM(o_tokenCount) AS total FROM htoken.order WHERE o_userIdentityNumber = "' + decoded.u_identityNumber + '" AND o_symbol = "' + rows[i].o_symbol + '" AND o_paymentStatus = "completed"');
                            symbols.push(rows[i].o_symbol);
                        }

                        // 使用async.eachSeries執行sql查詢語句(確保上一句執行完後才執行下一句)
                        var count = -1;
                        var data = {};
                        async.eachSeries(sqls, function (item, callback) {
                            // 遍历每条SQL并执行
                            mysqlPoolQuery(item, function (err, results) {
                                if (err) {
                                    // 异常后调用callback并传入err
                                    callback(err);
                                } else {
                                    count++;
                                    data[symbols[count]] = results[0].total;
                                    // 执行完成后也要调用callback，不需要参数
                                    callback();
                                }
                            });
                        }, function (err) {
                            // 所有SQL执行完成后回调
                            if (err) {
                                console.log(err);
                            } else {
                                //console.log("SQL全部执行成功");
                                res.json({
                                    "message": "[Success] 查找資產成功",
                                    "success": true,
                                    "MyAsset": data,
                                    "AssetSymbols": symbols
                                });
                            }
                        });
                    }

                });*/


            }
        })
    } else {
        //不存在JWT token
        console.log("＊:不存在JWT token");
        res.json({
            "message": "No JWT Token.Please login.",
            "success": false
        });
        return;
    }

    function objectify(key, value) {
        console.log("＊＊＊:" + { [key]: value });
        return {
            [key]: value
        };
    }
});


/*sign rawtx*/
function signTx(userEthAddr, userRowPrivateKey, contractAddr, encodedData) {
    return new Promise((resolve, reject) => {

        web3.eth.getTransactionCount(userEthAddr)
            .then(nonce => {

                let userPrivateKey = Buffer.from(userRowPrivateKey.slice(2), 'hex');
                console.log(userPrivateKey);
                let txParams = {
                    nonce: web3.utils.toHex(nonce),
                    gas: 300000,
                    gasPrice: 0,
                    //gasPrice: web3js.utils.toHex(20 * 1e9),
                    gasLimit: web3.utils.toHex(3400000),
                    to: contractAddr,
                    value: 0,
                    data: encodedData
                }

                let tx = new Tx(txParams);
                tx.sign(userPrivateKey);
                const serializedTx = tx.serialize();
                const rawTx = '0x' + serializedTx.toString('hex');

                console.log('☆ RAW TX ☆\n', rawTx);

                web3.eth.sendSignedTransaction(rawTx)
                    .on('transactionHash', hash => {
                        console.log(hash);
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        // console.log('confirmation', confirmationNumber);
                    })
                    .on('receipt', function (receipt) {
                        console.log(receipt);
                        resolve(receipt)
                    })
                    .on('error', function (err) {
                        console.log(err);
                        reject(err);
                    })
            })
    })
}

/*deploy contract with tx*/
/*
router.post('/POST/deploy', async function (req, res, next) {
    let assetOwner = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let platform = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";
    let endorsers = "0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB";

    let assetBook = new web3.eth.Contract(assetBookContract.abi);

    web3.eth.getTransactionCount(backendAddr)
        .then(nonce => {

            let deploy = assetBook.deploy({
                data: contract.bytecode,
                arguments: [assetOwner, platform, endorsers]
            }).encodeABI();

            let txParams = {
                from: backendAddr,
                nonce: web3.utils.toHex(nonce),
                gas: 4700000,
                gasPrice: 0,
                //gasPrice: web3.utils.toHex(40 * 1e9),
                gasLimit: web3.utils.toHex(3400000),
                data: deploy
            }

            let tx = new Tx(txParams);
            tx.sign(backendPrivateKey);
            const serializedTx = tx.serialize();
            const rawTx = '0x' + serializedTx.toString('hex');

            console.log('☆ RAW TX ☆\n', rawTx);

            web3.eth.sendSignedTransaction(rawTx)
                .on('transactionHash', hash => {
                    console.log(hash);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    //console.log('confirmation', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log(receipt);
                    res.send({
                        receipt: receipt
                    })
                })
                .on('error', function (err) {
                    console.log(err);
                    res.send({
                        err: err.toString()
                    })
                })

        })

});
*/

module.exports = router;


