const app = require('../app');
const request = require('supertest')(app);
var mocha = require('mocha');
var faker = require('faker');
const should = require('should');

const {asyncForEach} = require('../timeserver/utilities');

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
    let jwt, canBuy = false, symbol, fundingType;
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
        .query({ JWT: jwt, symbol: 'MYRR1701' })
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
            symbol = res.body.result[0].symbol;
            fundingType = res.body.result[0].fundingType;
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
    it('get order compliance', async function(){
      await request
        .get(version+'/order/CheckOrderCompliance')
        .query({ JWT: jwt, symbol: symbol, email: 'ivan55660228@gmail.com', fundingType: fundingType, authLevel: "5", tokenCount: 1,  buyAmount: 1, userIdentity: "A128465975", fundCount: 15000})
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
        .send({ JWT: jwt, symbol: symbol, email: 'ivan55660228@gmail.com', fundingType: fundingType, authLevel: "5", tokenCount: 1,  buyAmount: 1, userIdentity: "A128465975", fundCount: 15000})
        .set('Accept', 'application/json')
        .expect(200)
        .then(res => {
            res.body.message.should.equal('訂單寫入資料庫成功 & 驗證信寄送成功');
            
        })
    }).timeout(20000);
    it('get unpaid orders detail', async function(){
      await request
        .get(version+'/order/OrdersByEmail')
        .query({ JWT: jwt, status: ["waiting"]})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          console.log(res.body);
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
          console.log(res.body);
          await res.body.message.should.equal('[Success] Success');
        })
    });
  });
}
frontEndUserRegistry();