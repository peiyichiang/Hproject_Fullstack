const Web3 = require('web3');
var request = require('request');

//connect to ethereum node
const ethereumUri = 'http://172.20.10.3:8989';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));

var model = {};

//交易資料
var tx_hash="";
var tx_from="";
var tx_to="";
var tx_tokencount=0;
var tx_fundcount=0;

// 初始化合約
var Contract;
var abi = 
[
	{
		"constant": true,
		"inputs": [],
		"name": "deadline",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "Progress",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "token_balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_investor",
				"type": "address"
			}
		],
		"name": "getFundingByAddress",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "fundingGoal",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountRaised",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "token_price",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "HTokenaddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "ProjectState",
		"outputs": [
			{
				"name": "_return",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_investor",
				"type": "address"
			}
		],
		"name": "getTokenByAddress",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "fund_balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalamount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_tokencount",
				"type": "uint256"
			}
		],
		"name": "Invest",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_tokenaddress",
				"type": "address"
			},
			{
				"name": "_toeknprice",
				"type": "uint256"
			},
			{
				"name": "_totalamount",
				"type": "uint256"
			},
			{
				"name": "_percents",
				"type": "uint256"
			},
			{
				"name": "durationInMinutes",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_state",
				"type": "string"
			}
		],
		"name": "showState",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_htoken",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "fundingGoal",
				"type": "uint256"
			}
		],
		"name": "StartFunding",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_htoken",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amountRaised",
				"type": "uint256"
			}
		],
		"name": "GoalReached",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sponsor",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundTransfer",
		"type": "event"
	}
];
var address = '0x70c8ee123902683426ded3c4368e4ca37b8a2e9d';
async function init(){
    Contract = new web3.eth.Contract(abi,address);
}
    
//獲取HToken01的發行資訊
async function getInfo(){
    // 獲取TOKEN名稱
    Contract.methods.Progress().call()
    .then(function(data){
        console.log("Token Amount:" + data);
    })
}

// 檢查連線是否成功
async function checkConnect(){
    let coinbase = await web3.eth.getCoinbase();
    console.log('coinbase:' + coinbase);
    let accounts = await web3.eth.getAccounts();
    console.log(accounts);
}

//將要存到資料庫的交易資料設為空
function setTxDataEmpty(){
    tx_hash="";
    tx_from="";
    tx_to="";
    tx_tokencount=0;
    tx_fundcount=0;
}

// 生成token給購買者
async function Invest(_tokencount){
    var accounts = await web3.eth.getAccounts();
	web3.eth.personal.unlockAccount(accounts[1],'yourPassword',1000)
	.then((response) => {
		Contract.methods.Invest(_tokencount)
		.send({
			from:accounts[1],
            gas: 4600000,
		})
		.then(function(data){
            //將要存到資料庫的交易資料設為空
            setTxDataEmpty();
            //紀錄交易hash、from、to
            tx_hash=data.transactionHash;
            tx_from=accounts[1];
            tx_to=address;

            //撈取token數量
            Contract.methods.getTokenByAddress(tx_from).call()
            .then(function(data){
                tx_tokencount=data;

                //撈取fund數量
                Contract.methods.getFundingByAddress(tx_from).call()
                .then(function(data){
                    tx_fundcount=data;
                    var SaveToDatabase={
                        "tx_hash":tx_hash,
                        "tx_from":tx_from,
                        "tx_to":tx_to,
                        "tx_tokencount":tx_tokencount,
                        "tx_fundcount":tx_fundcount
                    };
                    console.log(SaveToDatabase);

                    //將資料存到資料庫
                    request({
                        url: "http://127.0.0.1:3000/POST/AddTxRecord",
                        method: "POST",
                        json: true,   // <--Very important!!!
                        body: SaveToDatabase
                    }, function (error, response, body){
                        // console.log(response);
                    });
                });  
            });   
		}) 
    })
    .catch((error) => {
		console.log(error);
	});

}



// ************************************

// 初始化合約
init(); 

// 檢查連線是否成功
// checkConnect();

//獲取Progress
// getInfo();

//生成token給購買者
Invest(10);


// ************************************
// 查詢Token資訊
model.getICOInfo= function () {
	return new Promise( (res, rej) => {
		Contract.methods.getSPLCName().call()
		.then(function(data){
			// console.log("Token Name:" + data);
			res(data);
		}).catch( err => {
			rej(err);
		})
	})
}

// 查詢有多少顆Token
model.getTokenAmount= function (address_) {
	return new Promise( (res, rej) => {
		Contract.methods.balanceOf(address_.toString()).call()
		.then(function(data){
			// console.log("Token Amount:" + data);
			res(data);
		}).catch( err => {
			rej(err);
		})
	})
}

// 生成token給購買者
// Call by user-model.js
model.generateToken = async function (amount_,address_){
    var accounts = await web3.eth.getAccounts();
	web3.eth.personal.unlockAccount(accounts[0],'yourPassword',1000)
	.then((response) => {
		// console.log(response);
		Contract.methods.generateToken(amount_,address_.toString())
		.send({
			from:accounts[0],
			gas: 4600000
		})
		.then(function(data){
			// console.log(data);
			console.log("購買成功");
		}) 
	}).catch((error) => {
		console.log(error);
	});
}

// 查詢交易細節
model.getTransactionDetail = async function (address_){
	return new Promise( (res, rej) => {
		Contract.methods.getTokenByOwner(address_.toString()).call()
		.then(function(data){
			// 查詢每個tokenID的資訊
			var Alldata=[];
			var count=0;
			var TokenAmount=data.length;
			data.forEach(function(tokeID) {
				Contract.methods.getTokenInfo(tokeID.toString()).call()
				.then(function(data){
					count++;
					Alldata.push(data);
					if(TokenAmount==count){
						// console.log(Alldata);
						res(Alldata);
					}
				}).catch( err => {
					rej(err);
				})
			});
		})
	})
}

module.exports = model;


