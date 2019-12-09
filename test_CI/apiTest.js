const app = require('../app');
const request = require('supertest')(app);
var mocha = require('mocha');
var faker = require('faker');
const should = require('should');
const assert = require('assert');
const {mysqlPoolQueryB, getAllSmartContractAddrs} = require('../timeserver/mysql.js');
const {edit_product, add_product, symbol, total, goal, generateCSV, price, type} = require('./api_product');
const {addAssetbooksIntoCFC, updateFundingStateFromDB} = require('../timeserver/blockchain.js');
const {asyncForEach, getLocalTime} = require('../timeserver/utilities');
let virtualAccount;
let crowdFundingAddr;

//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0";

const getRandomNum = async(x)=>{
  return new Promise((resolve, reject) => {
    resolve(Math.floor(Math.random()*x)+1);
  })
};
const getRandomList = async(randomList = [],  randomListLength = 0, remain = 0)=>{
    if(randomListLength == 0 ){
      randomListLength = await getRandomNum(9);// How many user buy
      remain = goal % randomListLength;
    }
    let average = parseInt(goal / randomListLength);
    let hold = await getRandomNum(remain);
    remain -= hold;
    randomList.push(hold + average);
    if(remain <= 0){
      while(randomList.length < randomListLength){
        randomList.push(average);
      }
      return (randomList);
    }
    else{
      return getRandomList(randomList, randomListLength, remain);
    }
}

const checkAmountArray = async(randomList)=>{
  console.log("last execute")
    await asyncForEach(randomList, async (amount, index) => {
      await checkAmountAfterMint(`000a${10 + index}@gmail.com`, amount).catch(err =>{
        console.log(err);
      });
    })
}
//let randomList = [];
//let randomListLength = getRandomNum(99);


const frontEndUserRegistry = async() => {
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol;
  describe('intergration testing of front-end user register', async function(){
    this.timeout(3000);  
    it('sign up an user', async function(){
      await request
        .post(version+'/user/addUser')
        .send({ ID: 'T' + faker.random.number(999999999), email: _email, password: _password, imageURLF: faker.internet.url(), imageURLB: faker.internet.url(), bankAccount: faker.internet.url(), eth_account: faker.random.hexaDecimal, verify_status: 0, phoneNumber: "09" + faker.random.number(9999999), name: faker.internet.userName})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          await res.body.message.should.equal('[Success] Success');
          await res.body.result.should.not.empty();
          hash = res.body.result.passwordHash;
          console.log(_email, _password);
        })
    });
    it('send email to verify an user', async function(){
      await request
        .post(version+'/user/send_email')
        .send({email: _email, passwordHash: hash})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          await res.body.message.should.equal('驗證信寄送成功');
        })
    }).timeout(20000);
    it('verify an user', async function(){
      await request
        .get(version+'/user/verify_email')
        .query({hash: hash})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log("~~~~~~~~~~~~~~~~~",res.body);
        })
    });
    it('check if the new user can login', async function(){
      await request
        .get(version + '/user/UserLogin')
        .set('Accept', 'application/json')
        .query({ email: _email, password: _password })
        .expect(200)
        .then(async function(res){
          await res.body.jwt.should.not.empty();
          jwt = res.body.jwt;
        });
    });
    it('get all products info', async function(){
      await request
        .get(version+'/product/LaunchedProductList')
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.result.should.be.instanceOf(Array);
          symbol = res.body.result[0].symbol;
        })
    })

    it('check if the user can buy token', async function(){
      await  request
        .get(version+'/product/canBuyToken')
        .set('Accept', 'application/json')
        .query({ JWT: jwt, symbol: symbol })
        .expect(400)
    });
  });
}

const frontEndUserViewingPages = async() => {
  describe('intergration testing of front-end user viewing pages', async function(){
    this.timeout(3000);  
    let jwt;
    before('Login before do something', async function(){
      await request
        .get(version + '/user/UserLogin')
        .set('Accept', 'application/json')
        .query({ email: 'ivan55660228@gmail.com', password: '02282040' })
        .expect(200)
        .then(async function(res){
          await res.body.jwt.should.not.empty();
          jwt = res.body.jwt;
        });
    });
  })
}
const frontEndUserOrdering = async(amout, email = 'ivan55660228@gmail.com', password = '02282040') => {
  describe('intergration testing of front-end user ordering', async function(){
    this.timeout(3000);  
    let jwt, canBuy = false;
    before('Login before do something', async function(){
      await request
        .get(version + '/user/UserLogin')
        .set('Accept', 'application/json')
        .query({ email: email, password: password })
        .expect(200)
        .then(async function(res){
          await res.body.jwt.should.not.empty();
          jwt = res.body.jwt;
        });
    });

    it('check need to reupload info', async function(){
      await request
        .get(version+'/user/NeedToReuploadMemberDocument')
        .query({ JWT: jwt})
        .set('Accept', 'application/json')
        .then(async function(res){
          console.log(res.body);
          //await res.body.message.should.equal('[Success] Success');
        })
    });
    it('check if the user can buy token', async function(){
      await  request
        .get(version+'/product/canBuyToken')
        .set('Accept', 'application/json')
        .query({ JWT: jwt, symbol: symbol })
        .expect(200)
        .then(async function(res){
          await res.body.message.should.equal('可購買token');
          canBuy = true;
      });
    });
    it('get all products info', async function(){
      await request
        .get(version+'/product/LaunchedProductList')
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.result.should.be.instanceOf(Array);
            //symbol = res.body.result[0].symbol;
            //
            //fundingType = res.body.result[0].fundingType;
        })
    })
    it('get one products detail', async function(){
      await request
        .get(version+'/product/CaseImageURLByCaseSymbol')
        .query({ JWT: jwt, symbol: symbol })
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.result.should.not.empty();
        })
    })
    it('get one products buy amount', async function(){
      await request
        .get(version+'/order/SumReservedOrdersBySymbol')
        .query({ JWT: jwt, symbol: symbol })
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          await res.body.message.should.equal('[Success] Success');
        })
    })
    //tokenCount and buyAmount are the same thing
    it('get order compliance', async function(){
      await request
        .get(version+'/order/CheckOrderCompliance')
        .query({ JWT: jwt, symbol: symbol, email: email, fundingType: type, authLevel: "5", tokenCount: amout,  buyAmount: amout, userIdentity: "A128465975", fundCount: price * amout})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          await res.body.message.should.equal('[Success] Success');
        })
    });
    
    it('add order to db', async function(){
      await request
        .post(version+'/order/AddOrder')
        .send({ JWT: jwt, symbol: symbol, email: email, fundingType: type, authLevel: "5", tokenCount: amout,  buyAmount: amout, userIdentity: "A128465975", fundCount: price * amout})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.message.should.equal('訂單寫入資料庫成功 & 驗證信寄送成功');
            
        })
    }).timeout(20000);
    it('get unpaid orders detail', async function(){
      await request
        .get(version+'/order/OrdersByEmail')
        .query({ JWT: jwt, status: ['waiting', '']})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body.result[0].o_bankvirtualaccount);
          virtualAccount = res.body.result[0].o_bankvirtualaccount;
          await res.body.message.should.equal('[Success] Success');
        })
    });
    it('get paid orders detail', async function(){
      await request
        .get(version+'/order/OrdersByEmail')
        .query({ JWT: jwt, status: [ 'paid', 'txnFinished', 'refunded']})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.message.should.equal('[Success] Success');
        })
    });
  });
}
const FMNAddProduct = async() => {
  let token;
  describe('intergration testing of FMS', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'myrronlin@gmail.com', m_password: '123456789' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By FMN', async function(){
      await request
        .get('/product/ProductByFMN')
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Add Product By FMN Pages', async function(){
      await request
        .get('/product/AddProductByFMN')
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
        });
    });
    it('Add Product By FMN', async function(){
      generateCSV()
      await request
        .post('/product/AddProductByFMN')
        .send(add_product)
        .set('Cookie', token)
        .expect(302)
        .then(async function(res){
          //res.text.should.not.equal("請先登入");
        });
    });
    
    it('Edit Product By FMN Pages', async function(){
      await request
        .get('/product/EditProductByFMN')
        .query({ symbol: symbol})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          
          //res.text.should.not.equal("請先登入");
        });
    });
    it('Edit Product By FMN', async function(){
      await request
        .post('/product/EditProductByFMN')
        .send(edit_product)
        .set('Cookie', token)
        .expect(302)
        .then(async function(res){
          
          //res.text.should.not.equal("請先登入");
        });
    });
    it('Submit Product By FMN', async function(){
      await request
        .get('/product/SetProductCreationByFMN')
        .query({ symbol: symbol})
        .set('Cookie', token)
        .expect(302)
        .then(async function(res){
          
          //res.text.should.not.equal("請先登入");
        });
    });
  })
}
const FMSApproveProduct = async() => {
  describe('intergration testing of FMS', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'myrronlins@gmail.com', m_password: '123456789' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By FMS', async function(){
      await request
        .get('/product/ProductByFMS')
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Browse Product Detail By FMS', async function(){
      await request
        .get('/product/ViewProductDeatil')
        .set('Cookie', token)
        .query({ symbol: symbol})
        .expect(200)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Submit Product By FMS', async function(){
      await request
        .get('/product/EditProductByFMS')
        .query({ symbol: symbol})
        .set('Cookie', token)
        .expect(302)
        .then(async function(res){
          
          //res.text.should.not.equal("請先登入");
        });
    });
  });
};
const PSPublishProduct = async() => {
  describe('intergration testing of PS publish product', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Browse Product Detail By PS', async function(){
      await request
        .get('/product/ViewProductDeatil')
        .query({ symbol: symbol})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Add CSV Into DB By PS', async function(){
      await request
        .post('/product/IncomeCSV')
        .set('Cookie', token)
        .send({ IncomeCSVFilePath: 'public/uploadImgs/product.csv' })
        .expect(200)
        .then(async function(res){
          console.log(res.body);
        });
    });
    
    it('Deploy Crowdfunding By PS', async function(){
      await request
        .post('/contracts/crowdFundingContract/' + symbol)
        .send({ tokenPrice: price, currency: "NTD", quantityMax: total, fundingGoal: goal, CFSD2: edit_product.p_CFSD, CFED2: edit_product.p_CFED})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          console.log(res.body);
        });
    }).timeout(10000);
    it('Set Prodct State By PS', async function(){
      await request
        .post('/product/SetProductStateByPlatformSupervisor')
        .send({ tokenSymbol: symbol, tokenState: 'funding'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          console.log(res.body);
        });
    });
    
  });
};
const PSPauseProduct = async() => {
  describe('intergration testing of PS pause product', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('You need to wait 60 secs now', async function(){
    }).timeout(3000);
    it('Wating one minute for pause time > time of deployment', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 60000);    
      }).then(() => {
        return ; // do the promise call in a `then` callback to properly chain it
      })
    }).timeout(100000);
    it('Pause Product By PS', async function(){
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/pause`)
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){

        });
    }).timeout(25000);
    it('Set Prodct State By PS', async function(){
      await request
        .post('/product/SetProductStateByPlatformSupervisor')
        .send({ tokenSymbol: symbol, tokenState: 'FundingPaused'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.status.should.equal('true');
        });
    });
   
  });
};
const PSRestartProduct = async() => {
  describe('intergration testing of PS restart product', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Restart Product By PS', async function(){
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/resume`)
        .send({ CFED2: parseInt(edit_product.p_CFED), quantityMax: goal + 10})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.DBresult.should.not.empty();
          await res.body.TxResult.should.not.empty();
        });
    }).timeout(25000);
    it('Set Prodct State By PS', async function(){
      await request
        .post('/product/SetProductStateByPlatformSupervisor')
        .send({ tokenSymbol: symbol, tokenState: 'funding'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.status.should.equal('true');
        });
    });
   
  });
};
const PSTerminateProduct = async() => {
  describe('intergration testing of PS terminate product', async function(){
    this.timeout(3000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('Terminate Product By PS', async function(){
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/terminate`)
        .send({ reason: 'CI testing'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.DBresult.should.not.empty();
          await res.body.TxResult.should.not.empty();
        });
    }).timeout(25000);
    it('Set Prodct State By PS', async function(){
      await request
        .post('/product/SetProductStateByPlatformSupervisor')
        .send({ tokenSymbol: symbol, tokenState: 'aborted'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.status.should.equal('true');
        });
    });
    it('Set Prodct State By PS', async function(){
      await request
        .post('/product/SetAbortedReasonByPA')
        .send({ tokenSymbol: symbol, AbortedReason: 'CI testing'})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.message.should.equal('設置AbortedReasont成功');
        });
    });
  });
};
const makeOrderPaidAndWriteIntoCFC = async() => {
  describe('Make Order Paid And Write Into Crowdfunding', async function(){
    this.timeout(1000);  
    it('Make Order Paid', async function(){
      var sql = { o_paymentStatus: "paid" };
      const result = await mysqlPoolQueryB('UPDATE order_list SET ? WHERE o_bankvirtualaccount = ?', [sql, virtualAccount]).catch(async (err) => {
        await err.should.empty();
      });
    }).timeout(3000);
    it('Write Into Crowdfunding', async function(){
      await addAssetbooksIntoCFC(getLocalTime()+2).catch(async (err) => {
        console.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
        await err.should.empty();
      });
    }).timeout(30000);
    
  });
};
const checkAmountAfterMint = async(email, amount)=>{
  describe('check the amount is correct or not', async function(){
    it('Check the amout of every user is correct', async function(){
      let addr = await getAllSmartContractAddrs(symbol);
      await request
        .post(`/contracts/crowdfunding/emailToQty`)
        .send({"ctrtAddr" : addr[0], "email" : email})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await parseInt(res.body.quantityOwned).should.equal(parseInt(amount));
        });
    }).timeout(2000);
  })
}
const PSMintToken = async(updateTime) => {
  describe('intergration testing of PS mint token', async function(){
    this.timeout(1000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('update funding state', async function(){
      await updateFundingStateFromDB(updateTime).catch((err) => {
        console.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
      });
    }).timeout(50000);
    it('Get Product status By PS', async function(){
      await request
        .get(`/contracts/crowdFundingContract/${symbol}/status`)
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          crowdFundingAddr = res.body.crowdFundingAddr;
          await res.body.fundingState.should.equal('4');
        });
    }).timeout(25000);
    it('Funding Close By PS', async function(){
      let result = await mysqlPoolQueryB('SELECT * FROM product WHERE p_SYMBOL = ?', [symbol]);
      let data = result[0];
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/closeFunding`)
        .set('Cookie', token)
        .send({'TimeOfDeployment':getLocalTime(), "TimeTokenValid": parseInt(data.p_validdate), "TimeTokenUnlock": parseInt(data.p_lockuptime), "nftName": symbol, "siteSizeInKW": data.p_size, "maxTotalSupply":data.p_totalrelease, "initialAssetPricing": data.p_pricing, "pricingCurrency": data.p_currency, "IRR20yrx100": parseInt(data.p_irr * 100), "tokenURI": data.p_HCAT721uri, "crowdFundingCtrtAddr":crowdFundingAddr})
        .expect(200)
        .then(async function(res){
          await res.body.tokenControllerAddr.should.not.empty();
          await res.body.HCAT721Addr.should.not.empty();
          await res.body.incomeManagerAddr.should.not.empty();
          await res.body.updateDB.should.not.empty();
        });
    }).timeout(25000);
    it('Mint Token By PS', async function(){
      await request
        .post(`/contracts/HCAT721_AssetTokenContract/${symbol}/mintSequentialPerContract`)
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.success.should.equal('in process...');
        });
    }).timeout(2000);
    it('Wating a while(60s) for Minting...', async function(){
    }).timeout(1000);
    it('Mint', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 100000);    
      }).then(() => {
        return ; // do the promise call in a `then` callback to properly chain it
      });
    }).timeout(102000);
    
  });
};
const PSFundingClose = async(updateTime) => {
  describe('intergration testing of PS mint token', async function(){
    this.timeout(1000);  
    before('Login before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          token = (res.header["set-cookie"]);
        });
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/BackendUser/BackendUser_Platform_Supervisor')
        .set('Cookie', token)
        .then(async function(res){
          await res.text.should.not.equal("請先登入");
          
        });
    });
    it('update funding state', async function(){
      await updateFundingStateFromDB(updateTime).catch((err) => {
        console.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
      });
    }).timeout(50000);
    it('Get Product status By PS', async function(){
      await request
        .get(`/contracts/crowdFundingContract/${symbol}/status`)
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.body.fundingState.should.equal('4');
          crowdFundingAddr = res.body.crowdFundingAddr;
        });
    });
    it('Funding Close By PS', async function(){
      let result = await mysqlPoolQueryB('SELECT * FROM product WHERE p_SYMBOL = ?', [symbol]);
      let data = result[0];
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/closeFunding`)
        .set('Cookie', token)
        .send({'TimeOfDeployment':getLocalTime(), "TimeTokenValid": parseInt(data.p_validdate), "TimeTokenUnlock": parseInt(data.p_lockuptime), "nftName": symbol, "siteSizeInKW": data.p_size, "maxTotalSupply":data.p_totalrelease, "initialAssetPricing": data.p_pricing, "pricingCurrency": data.p_currency, "IRR20yrx100": parseInt(data.p_irr * 100), "tokenURI": data.p_HCAT721uri, "crowdFundingCtrtAddr":crowdFundingAddr})
        .expect(200)
        .then(async function(res){
          await res.body.tokenControllerAddr.should.not.empty();
          await res.body.HCAT721Addr.should.not.empty();
          await res.body.incomeManagerAddr.should.not.empty();
          await res.body.updateDB.should.not.empty();
        });
    }).timeout(25000);
    
  });
};
const flow1 = async() => {
  describe('intergration testing of sold out the product', async function(){
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    await frontEndUserOrdering(total);
    await makeOrderPaidAndWriteIntoCFC();
    await PSMintToken(getLocalTime());

  });
};
async function flow2(){
 // describe('intergration testing of reaching the funding goal after CFED', async function(){
   // this.timeout(100000);  
    
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    // let result = await getRandomList().then(async(result) =>{
    //   console.log(result);
    //   await asyncForEach(result, async (amount, index) => {
    //     await frontEndUserOrdering(amount, `000a${10 + index}@gmail.com`, `user${10 + index}pw`);
    //     await makeOrderPaidAndWriteIntoCFC();
    //   })
    // })
    // await PSMintToken(parseInt(edit_product.p_CFED) + 1);
    // await checkAmountArray(result);

    await getRandomList()
    .then(async(result) =>{
      console.log(result);
      await asyncForEach(result, async (amount, index) => {
        await frontEndUserOrdering(amount, `000a${10 + index}@gmail.com`, `user${10 + index}pw`);
        await makeOrderPaidAndWriteIntoCFC();
      })
      return result;
    })
    .then(async(result)=>{
      await PSMintToken(parseInt(edit_product.p_CFED) + 1);
      await checkAmountArray(result);
    })
 // });
};
const flow3 = async() => {
  describe('intergration testing of terminating product', async function(){
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    await frontEndUserOrdering(goal);
    await PSPauseProduct();
    await makeOrderPaidAndWriteIntoCFC();
    await PSTerminateProduct();

  });
};
const flow4 = async() => {
  describe('intergration testing of restart product', async function(){
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    await PSPauseProduct();      
    await PSRestartProduct();
    await frontEndUserOrdering(goal + 10);
    await makeOrderPaidAndWriteIntoCFC();
    await PSMintToken(parseInt(edit_product.p_CFED) + 1);    

  });
};
const flow5 = async() => {
  describe('intergration testing of reaching funding goal but aborted', async function(){
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    await getRandomList()
    .then(async(result) =>{
      console.log(result);
      await asyncForEach(result, async (amount, index) => {
        await frontEndUserOrdering(amount, `000a${10 + index}@gmail.com`, `user${10 + index}pw`);
        await makeOrderPaidAndWriteIntoCFC();
      })
      return result;
    })
    await PSFundingClose(parseInt(edit_product.p_CFED) + 1);
    await PSTerminateProduct();
  });
};
const deleteSymbol = async() => {
  let symbol = 'NAKI1111'
  await mysqlPoolQueryB('DELETE FROM product WHERE p_SYMBOL = ?', [symbol]);
  await mysqlPoolQueryB('DELETE FROM smart_contracts WHERE sc_symbol = ?', [symbol]);
  await mysqlPoolQueryB('DELETE FROM order_list WHERE o_symbol = ?', [symbol]);
  await mysqlPoolQueryB('DELETE FROM investor_assetRecord WHERE ar_tokenSYMBOL = ?', [symbol]);
  await mysqlPoolQueryB('DELETE FROM income_arrangement WHERE ia_SYMBOL = ?', [symbol]);
}

flow2();
