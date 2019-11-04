const app = require('../app');
const request = require('supertest')(app);
var mocha = require('mocha');
var faker = require('faker');
const should = require('should');
const assert = require('assert');
const {mysqlPoolQueryB} = require('../timeserver/mysql.js');
const {edit_product, add_product, symbol, total, goal, generateCSV, price, type} = require('./api_product');
const {addAssetbooksIntoCFC} = require('../timeserver/blockchain.js');
const {asyncForEach, getLocalTime} = require('../timeserver/utilities');
let virtualAccount;
//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0"

const frontEndUserRegistry = async() => {
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol;
  describe('intergration testing of front-end user register', async function(){
    this.timeout(1000);  
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
            res.body.result.should.be.instanceOf(Array);
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
    this.timeout(1000);  
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
const frontEndUserOrdering = async() => {
  describe('intergration testing of front-end user ordering', async function(){
    this.timeout(1000);  
    let jwt, canBuy = false;
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
            res.body.result.should.be.instanceOf(Array);
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
        .query({ JWT: jwt, symbol: symbol, email: 'ivan55660228@gmail.com', fundingType: type, authLevel: "5", tokenCount: total,  buyAmount: total, userIdentity: "A128465975", fundCount: price * total})
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
        .send({ JWT: jwt, symbol: symbol, email: 'ivan55660228@gmail.com', fundingType: type, authLevel: "5", tokenCount: total,  buyAmount: total, userIdentity: "A128465975", fundCount: price * total})
        .set('Accept', 'application/json')
        .expect(200)
        .then(res => {
            res.body.message.should.equal('訂單寫入資料庫成功 & 驗證信寄送成功');
            
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
    this.timeout(1000);  
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
          res.text.should.not.equal("請先登入");
          
        });
    });
    it('Add Product By FMN Pages', async function(){
      await request
        .get('/product/AddProductByFMN')
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          res.text.should.not.equal("請先登入");
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
    this.timeout(1000);  
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
          res.text.should.not.equal("請先登入");
          
        });
    });
    it('Browse Product Detail By FMS', async function(){
      await request
        .get('/product/ViewProductDeatil')
        .set('Cookie', token)
        .query({ symbol: symbol})
        .expect(200)
        .then(async function(res){
          res.text.should.not.equal("請先登入");
          
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
          res.text.should.not.equal("請先登入");
          
        });
    });
    it('Browse Product Detail By PS', async function(){
      await request
        .get('/product/ViewProductDeatil')
        .query({ symbol: symbol})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          res.text.should.not.equal("請先登入");
          
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
        .send({ tokenPrice: price, currency: "NTD", quantityMax: total, fundingGoal: goal, CFSD2: '201910180900', CFED2: '201911241700'})
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
const makeOrderPaidAndWriteIntoCFC = async() => {
  describe('Make Order Paid And Write Into Crowdfunding', async function(){
    this.timeout(1000);  
    it('Make Order Paid', async function(){
      var sql = { o_paymentStatus: "paid" };
      const result = await mysqlPoolQueryB('UPDATE order_list SET ? WHERE o_bankvirtualaccount = ?', [sql, virtualAccount]).catch((err) => {
      });
    }).timeout(3000);
    it('Write Into Crowdfunding', async function(){
      await addAssetbooksIntoCFC(getLocalTime()).catch((err) => {
        console.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
      });
    }).timeout(10000);
    
  });
};
const PSMintToken = async() => {
  let crowdFundingAddr;
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
          res.text.should.not.equal("請先登入");
          
        });
    });
    it('Get Product status By PS', async function(){
      await request
        .get(`/contracts/crowdFundingContract/${symbol}/status`)
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          res.body.fundingState.should.equal('4');
          crowdFundingAddr = res.body.crowdFundingAddr;
        });
    });
    it('Mint Token By PS', async function(){
      let data = await mysqlPoolQueryB('SELECT * FROM product WHERE p_SYMBOL = ?', symbol);
      await request
        .post(`/contracts/crowdFundingContract/${symbol}/closeFunding`)
        .set('Cookie', token)
        .send({'TimeOfDeployment':parseInt(data.p_releasedate), "TimeTokenValid": parseInt(data.p_validdate), "TimeTokenUnlock": parseInt(data.p_lockuptime), "nftName": symbol, "siteSizeInKW": data.p_size, "maxTotalSupply":data.p_totalrelease, "initialAssetPricing": data.p_pricing, "pricingCurrency": data.p_currency, "IRR20yrx100": parseInt(data.p_irr * 100), "tokenURI": data.p_HCAT721uri, "crowdFundingCtrtAddr":crowdFundingAddr})
        .expect(200)
        .then(async function(res){
          console.log(res.body);
        });
    }).timeout(10000);
  });
};
const allFlow = async() => {
  await FMNAddProduct();
  await FMSApproveProduct();
  await PSPublishProduct();
  await frontEndUserOrdering();
  await makeOrderPaidAndWriteIntoCFC();
  await PSMintToken();
}
allFlow();