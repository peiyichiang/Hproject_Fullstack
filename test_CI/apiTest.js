const app = require('../app');
const request = require('supertest')(app);
var mocha = require('mocha');
var faker = require('faker');
const should = require('should');
const assert = require('assert');
const amqp = require('amqplib/callback_api');
require("dotenv").config();

const {mysqlPoolQueryB, getAllSmartContractAddrs} = require('../timeserver/mysql.js');
const {edit_product, add_product, symbol, total, goal, generateCSV, price, type,updated_product} = require('./api_product');
const {addAssetbooksIntoCFC, updateFundingStateFromDB} = require('../timeserver/blockchain.js');
const {asyncForEach, getLocalTime} = require('../timeserver/utilities');
const { set } = require('../app');

let virtualAccount;
let crowdFundingAddr;

//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0";
const version2 = "/frontendAPI/v2.0";
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
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol,user_verify_code,token;
  describe('intergration testing of front-end user register', async function(){
    this.timeout(3000);
    let eth_account_var = "0x" + faker.random.number(420989161277374234851052247841559622657063210593).toString(16)  
    let assetBookAddress_var
    let user_identy_var = 'T' + faker.random.number(999999999)
    it("post user email",async function(){
      await request
        .post(version2+"/Login/send_email")
        .send({email:_email,option:"signUp"})
        .set('Accept', 'application/json')
        .expect(200)
        .then(
          async function(res){
            await res.body.message.should.equal("驗證信寄送成功")
          }
        )
    }).timeout(300000);
    it("post user verify code ", async function(){
      user_verify_code = await mysqlPoolQueryB("SELECT u_verify_code FROM user WHERE u_email = ?",[_email])
      user_verify_code = user_verify_code[0].u_verify_code
      await request
      .post(version2+"/Login/verify_email")
      .send({email:_email,verify_code:user_verify_code})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          await res.body.message.should.equal("驗證成功")
          console.log(res.text)
        }
      )
    });
    it("sign up for stage one ",async function(){
      await request
      .post(version2+"/Login/signUp")
      .send({password:_password,email: _email})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          console.log(res.body)
          await res.body.message.should.equal("[Success] Success")
        }
      )
    });
    it("Sign in", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:_email,
        password:_password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
    it('waiting for jwt done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);    
      }).then(() => {
        return ; 
      });
    }).timeout(10000);
    it("update user detail information",async function(){
      await request
      .post(version2+"/User/AddUserInformation")
      .send({
        u_eth_add:eth_account_var,
        u_name :faker.internet.userName(),
        u_identityNumber:user_identy_var,
        u_cellphone: "09" + faker.random.number(9999999),
        u_physicalAddress:"台北市文山區指南路一號",
        u_birthday:"19930204",
        u_bankBooklet: faker.internet.url(), 
        u_imagef:faker.internet.url(),
        u_imageb:faker.internet.url(),
        email:_email
      })
      .set('Accept', 'application/json')
      .set("x-access-token",token)
      .expect(200)
      .then(async function(res){
        await res.body.message.should.equal("更新帳戶資料庫成功")
      })
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
    
    it("deploy assetbook contract",async function (){
      await  request
        .post("/Contracts/assetbookContract")
        .send({assetBookOwner:eth_account_var})
        .expect(200)
        .then(async function(res){
          await res.body.contractAddress.should.not.empty();
          console.log(res.body.contractAddress)
          assetBookAddress_var = res.body.contractAddress
          }
        )
    }).timeout(100000);
    it("write assetbook addr back to the DB",async function (){
      await request
        .post("/Contracts/registryContract/users/"+user_identy_var)
        .send({
          assetBookAddress:assetBookAddress_var,
          ethAddr:eth_account_var,
          email:_email
        })
        .expect(200)
        .then(
          async function(res,err) {
            if(err){
              console.log(err)
            }
            
              }
        )
        }).timeout(100000);
    it("review member status change unapproved into approve",async function(){
      await request
        .post("/user/reviewStatus")
        .send({reviewStatus:"approved",email:_email})
        .expect(302)
    })    
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
    it('check if the user can buy token', async function(){
      await  request
        .get(version+'/product/canBuyToken')
        .set('Accept', 'application/json')
        .query({ JWT: jwt, symbol: symbol })
        .expect(200)
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

const ForgetPassword = async()=>{
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol,user_verify_code,token;
  var email = _email
  let fp_verify_code
  var password = faker.random.words()
  describe("Forget Password testing...",async function(){
    it("post user email",async function(){
      await request
        .post(version2+"/Login/send_email")
        .send({email:_email,option:"signUp"})
        .set('Accept', 'application/json')
        .expect(200)
        .then(
          async function(res){
            await res.body.message.should.equal("驗證信寄送成功")
          }
        )
    }).timeout(300000);
    it("post user verify code ", async function(){
      user_verify_code = await mysqlPoolQueryB("SELECT u_verify_code FROM user WHERE u_email = ?",[_email])
      user_verify_code = user_verify_code[0].u_verify_code
      await request
      .post(version2+"/Login/verify_email")
      .send({email:_email,verify_code:user_verify_code})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          await res.body.message.should.equal("驗證成功")
          console.log(res.text)
        }
      )
    });
    it("sign up for stage one ",async function(){
      await request
      .post(version2+"/Login/signUp")
      .send({password:_password,email: _email})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          console.log(res.body)
          await res.body.message.should.equal("[Success] Success")
        }
      )
    });
    it("Sign in", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:_email,
        password:_password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
    it("Send email",async function(){
      await request
      .post(version2+"/ForgetPassword/send_email")
      .send({email:email})
      .set("Accept",'application/json')
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("驗證信寄送成功")
          
          }
      )
    }).timeout(100000);
    it("Verify the code sent in email",async function(){
      fp_verify_code = await mysqlPoolQueryB("SELECT fp_verification_code FROM forget_pw WHERE fp_investor_email = ?",[email])
      fp_verify_code = fp_verify_code[0].fp_verification_code
      await request
      .post(version2+"/ForgetPassword/verify_email")
      .send({email:email, fp_verification_code:fp_verify_code})
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("投資者為一階段註冊會員，不需KYC審核")
          console.log(res.body)
        }
      )
    });

    it("change Password (no need to do KYC)",async function(){
      await request
      .post(version2+"/ForgetPassword/changePassword")
      .send({email:email,password:password})
      .set('Accept','application/json')
      .expect(200)
      .then(
        async function(res){
          console.log(res.body)
        }
      )
    });
    
    it("new password Sign-in testing", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:email,
        password:password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
  })
}


const ForgetPassword2 = async()=> {
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol,user_verify_code,token;
  var email = _email
  let fp_verify_code
  var password = faker.random.words()
  describe("Forget Password (KYC needed) API CICD test",async function(){
    this.timeout(3000);
    let eth_account_var = "0x" + faker.random.number(420989161277374234851052247841559622657063210593).toString(16)  
    let assetBookAddress_var
    let user_identy_var = 'T' + faker.random.number(999999999)
    it("post user email",async function(){
      await request
        .post(version2+"/Login/send_email")
        .send({email:_email,option:"signUp"})
        .set('Accept', 'application/json')
        .expect(200)
        .then(
          async function(res){
            await res.body.message.should.equal("驗證信寄送成功")
          }
        )
    }).timeout(300000);
    it("post user verify code ", async function(){
      user_verify_code = await mysqlPoolQueryB("SELECT u_verify_code FROM user WHERE u_email = ?",[_email])
      user_verify_code = user_verify_code[0].u_verify_code
      await request
      .post(version2+"/Login/verify_email")
      .send({email:_email,verify_code:user_verify_code})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          await res.body.message.should.equal("驗證成功")
          console.log(res.text)
        }
      )
    });
    it("sign up for stage one ",async function(){
      await request
      .post(version2+"/Login/signUp")
      .send({password:_password,email: _email})
      .set('Accept', 'application/json')
      .expect(200)
      .then(
        async function(res){
          console.log(res.body)
          await res.body.message.should.equal("[Success] Success")
        }
      )
    });
    it("Sign in", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:_email,
        password:_password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
    it('waiting for jwt done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);    
      }).then(() => {
        return ; 
      });
    }).timeout(10000);
    it("update user detail information",async function(){
      await request
      .post(version2+"/User/AddUserInformation")
      .send({
        u_eth_add:eth_account_var,
        u_name :faker.internet.userName(),
        u_identityNumber:user_identy_var,
        u_cellphone: "09" + faker.random.number(9999999),
        u_physicalAddress:"台北市文山區指南路一號",
        u_birthday:"19930204",
        u_bankBooklet: faker.internet.url(), 
        u_imagef:faker.internet.url(),
        u_imageb:faker.internet.url(),
        email:_email
      })
      .set('Accept', 'application/json')
      .set("x-access-token",token)
      .expect(200)
      .then(async function(res){
        await res.body.message.should.equal("更新帳戶資料庫成功")
      })
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
    
    it("deploy assetbook contract",async function (){
      await  request
        .post("/Contracts/assetbookContract")
        .send({assetBookOwner:eth_account_var})
        .expect(200)
        .then(async function(res){
          await res.body.contractAddress.should.not.empty();
          console.log(res.body.contractAddress)
          assetBookAddress_var = res.body.contractAddress
          }
        )
    }).timeout(100000);
    it("write assetbook addr back to the DB",async function (){
      await request
        .post("/Contracts/registryContract/users/"+user_identy_var)
        .send({
          assetBookAddress:assetBookAddress_var,
          ethAddr:eth_account_var,
          email:_email
        })
        .expect(200)
        .then(
          async function(res,err) {
            if(err){
              console.log(err)
            }
            
              }
        )
        }).timeout(100000);
    it("review member status change unapproved into approve",async function(){
      await request
        .post("/user/reviewStatus")
        .send({reviewStatus:"approved",email:_email})
        .expect(302)
    })    
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
    it('check if the user can buy token', async function(){
      await  request
        .get(version+'/product/canBuyToken')
        .set('Accept', 'application/json')
        .query({ JWT: jwt, symbol: symbol })
        .expect(200)
    });



    

    it("check the account is  able to change PW or not.",async function(){
      await request
      .get(version2+"/ForgetPassword/IsAbleToApply")
      .send({email:email})
      .set('Accept','application/json')
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("符合申請資格")
        }
      )
    });
    it("Send email",async function(){
      await request
      .post(version2+"/ForgetPassword/send_email")
      .send({email:email})
      .set("Accept",'application/json')
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("驗證信寄送成功")
          }
      )
    }).timeout(100000);
    it("Verify the code sent in email",async function(){
      fp_verify_code = await mysqlPoolQueryB("SELECT fp_verification_code FROM forget_pw WHERE fp_investor_email = ?",[email])
      fp_verify_code = fp_verify_code[0].fp_verification_code
      await request
      .post(version2+"/ForgetPassword/verify_email")
      .send({email:email, fp_verification_code:fp_verify_code})
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("投資者為二階段註冊會員，需要KYC審核")
          console.log(res.body)
        }
      )
    });
    /*
    it("upload KYC images ", async function(){
      await request
      .post(version2+"/ForgetPassword/Image")
      .send({})
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res){
          comsole.log(res)
        }
      )
    });*/
    it("apply for new password", async function(){
      await request
      .post(version2+"/ForgetPassword/ApplyForResettingPassword")
      .send({email:email, password:password, fp_imagef:"public/uploadImgs/1.jpg",fp_imageb:"public/uploadImgs/1.jpg",fp_bankAccountimage:"public/uploadImgs/1.jpg" })
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res){
          await res.body.message.should.equal("申請成功，請等待身份驗證通過後再以新密碼登入")
        }
      )
    });
    /*
    it("new password Sign-in testing", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:email,
        password:password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });*/
  })
}





const frontEndUserOrdering = async(amout, email = 'ivan55660228@gmail.com', password = '02282040',product_status="ONM") => {
  describe('intergration testing of front-end user ordering', async function(){
    this.timeout(3000);  
    let token
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
    it("Sign in", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:email,
        password:password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
    it('waiting for jwt done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);    
      }).then(() => {
        return ; 
      });
    }).timeout(10000);
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
    it("Get Products Information", done => {
      request
      .get(version2+"/product/ProductInfo")
      .query({
        status:product_status
      })
      .set("x-access-token",token)
      .set("Accept","application/json")
      .expect(200)
      .end(
        (err,res)=>{
          res.body.success.should.equal("True")
          res.body.data.should.not.empty()
          if(err){
            console.log(err)
            done(err);
          }
          else{
            done();
          }
        }
      )
    });
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
    it("place an order...",done=>{
      request
      .get(version2+"/Order/PlaceOrder")
      .send(
            { symbol:symbol,tokenCount:amout,fundCount:price*amout } // email... etc  must be send
          )
      .set("x-access-token",token)
      .expect(200)
      .end(
        (err,res)=>{
          console.log(res.body)
          res.body.success.should.equal("True")
          if (err) {
            console.log(err)
            done(err)
              }
          else{
            done()
          }
        }  
      )
    }).timeout(300000);
    // previous adding order api is down below
    /*it('add order to db', async function(){
      await request
        .post(version+'/order/AddOrder')
        .send({ JWT: jwt, symbol: symbol, email: email, fundingType: type, authLevel: "5", tokenCount: amout,  buyAmount: amout, userIdentity: "A128465975", fundCount: price * amout})
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.message.should.equal('訂單寫入資料庫成功 & 驗證信寄送成功');
            
        })
    }).timeout(20000);*/
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

function FMNUpdateProduct(){ 
  let currentTime
  describe("Whole processes are about updating Product documents.", ()=>{
  it('Login before do something', done=>{
    request
      .post('/BackendUser/BackendUserLogin')
      .set('Accept', 'application/json')
      .send({ m_id: 'myrronlin@gmail.com', m_password: '123456789' })
      .expect(302)
      .then((res)=>{
        res.header["set-cookie"].should.not.empty();
        //jwt = res.body.jwt;
        token = (res.header["set-cookie"]);
        done();
      });
  });
  it('update product after publish',done=>{
    request
    .post("/product/UpdateProductAfterPublish")
    .send(updated_product)
    .set("Cookie",token)
    .expect(302)
    .end(
      (err)=>{
        currentTime = new Date().toLocaleString().toString();
        console.log(updated_product)
        if(err){
          console.log(err);
          done(err)
        }
        else{
          done()
        }
      }
    )
  });
  
});
}
/*
const application_time_get = async(symbol) => {
  let currentTime
  describe("get application time by sql query", async=>{
    let currentTime
    it("get time operation...",async function(){
      currentTime = await mysqlPoolQueryB("SELECT * FROM product_editHistory WHERE pe_symbol = ?",[symbol])
      currentTime = currentTime[0].pe_applicationTime
      console.log(currentTime)
    });
    return currentTime;
  })
  return currentTime;
}*/

const update_approve_flow = async()=>{
  describe("update_approve_flow is here",async function(){
      await FMS_PS_Approve_update(symbol,"pd_NotarizedRentalContract");
      await FMS_PS_Approve_update(symbol,"pd_OnGridAuditedLetter");
      await FMS_PS_Approve_update(symbol,"pd_OnGridAuditedLetter_mask");
      await FMS_PS_Approve_update(symbol,"pd_NotarizedRentalContract_mask");
  })
}


const FMS_PS_Approve_update = async(symbol,pe_columnName)=>{
  describe("FMS+PS approved the update",async function(){
    let token;
    let currentTime;
    //let pe_applicationTime = "2020%2F5%2F13%20%E4%B8%8B%E5%8D%882%3A27%3A06" // have  to be translate by url encoding
    let RejectReason = "useless_for_now"
    it('Login FMS before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'myrronlins@gmail.com', m_password: '123456789' })
        .expect(302)
        .then((res)=>{
          res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
          
        });
    });
    
    it("FMS approved the update",async function(){
      currentTime = await mysqlPoolQueryB("SELECT * FROM product_editHistory WHERE pe_symbol = ?",[symbol])
      currentTime = currentTime[0].pe_applicationTime
      console.log(currentTime)
      currentTime = encodeURIComponent(currentTime)
      await request
      .get(`/product/ReviewUpdateProductAfterPublish/true/${symbol}/${pe_columnName}/${currentTime}/${RejectReason}`)
      .set("Cookie",token) 
      .expect(302)
      .then( 
        /*(res,err)=>{
          if(err){
            done(err)
          }
          else{
            done()}
          }  */
      )
    })
    it('Login FMS before do something', async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then((res)=>{
          res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
          //done();
        });
    });
    it("PS approved the update",async function(){
      currentTime = await mysqlPoolQueryB("SELECT * FROM product_editHistory WHERE pe_symbol = ?",[symbol])
      currentTime = currentTime[0].pe_applicationTime
      console.log(currentTime)
      currentTime = encodeURIComponent(currentTime)
      await request
      .get(`/product/ReviewUpdateProductAfterPublish/true/${symbol}/${pe_columnName}/${currentTime}/${RejectReason}`)
      .set("Cookie",token) 
      .expect(302)
      .then( 
        /*(res,err)=>{
          if(err){
            done(err)
          }
          else{
            done()}
          }  */
      )
    })
  })
}


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
    //
    it('Wait a while for generating csv', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);    
      }).then(() => {
        return ; // do the promise call in a `then` callback to properly chain it
      });
    }).timeout(15000);
    it('Add CSV Into DB By PS', async function(){
      await request
        .post('/product/IncomeCSV')
        .set('Cookie', token)
        .send({ IncomeCSVFilePath: `public/uploadImgs/${symbol}.csv` })
        .expect(200)
        .then(async function(res){
          console.log(res.body);
          await res.body.messageForDeveloper.should.equal("IncomeCSV文件寫入資料庫成功");
        });
    });
    
    it('Deploy Crowdfunding By PS', async function(){
      await request
        .post('/contracts/crowdFundingContract/' + symbol)
        .send({ tokenPrice: price, currency: "NTD", quantityMax: total, fundingGoal: goal, CFSD2: edit_product.p_CFSD, CFED2: edit_product.p_CFED})
        .set('Cookie', token)
        .expect(200)
        .then(async function(res,err){
          console.log(res.body);
          console.log(err)
          await res.body.status.should.equal(true);
          
        });
    }).timeout(20000);
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
    });
    it('Write Into Crowdfunding Request', async function(){
      /*
      await addAssetbooksIntoCFC(getLocalTime()+2).catch(async (err) => {
        console.error(`[Error @ addAssetbooksIntoCFC]: ${err}`);
        await err.should.empty();
      });*/
      amqp.connect(`amqp://${process.env.AMQP_USER}:${process.env.AMQP_PASS}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`, function (err, conn) {
          conn.createChannel(function (err, ch) {
              ch.assertExchange('timeserver', 'direct', { durable: true });
              //發送訊息
              ch.publish('timeserver', `addAssetbooksIntoCFC`, Buffer.from((getLocalTime()+100).toString()));
              console.log(` [x] Sent ${getLocalTime()+100}_addAssetbooksIntoCFC`);
          })
          setTimeout(function () { conn.close() }, 500);
        })
    }).timeout(3000);
    
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
    }).timeout(3000);
    it('waiting for rabbitmq consumer', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 30000);    
      }).then(() => {
        return ; // do the promise call in a `then` callback to properly chain it
      });
    }).timeout(300000);
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


// frontend_api V2.0 begin (All the membership are fixed for now, it would be modified later.)(Ivan@gmail.com......)


const productinfo_api = (p_status)=>{describe("Frontend API 2.0/ Product.js",()=>{
  let token;
  it("Sign in", done=>{
    request
    .post(version2+"/Login/signIn")
    .send({
      email:"ivan55660228@gmail.com",
      password:"02282040"
    })
    .set("Accept","application/json")
    .expect(200)
    .then(
      (res,err)=>{
        token =  res.body.jwt
        res.body.success.should.equal("True")
        if(err){
          done(err)
        }
        else{
          done()
        }
      }
    )
  });
  it('waiting for jwt done', async function(){
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 5000);    
    }).then(() => {
      return ; 
    });
  }).timeout(10000);
  it("Get Products Information(status:200) with "+p_status, done => {
    request
    .get(version2+"/product/ProductInfo")
    .query({
      status:p_status
    })
    .set('Accept', 'application/json')
    .set("x-access-token",token)
    
    .expect(200)
    .end(
      (err,res)=>{
        res.body.success.should.equal("True")
        res.body.data.should.not.empty()
        if(err){
          console.log(err)
          done(err);
        }
        else{
          done();
        }
      }
    )
  });
})}

// the api query string still fixed it will be a parameter later so still need to be modified
const AssetManagement_api = ()=>{
  describe("AssetManagement.js api test...",()=>{
    let token;
  it("Sign in", done=>{
    request
    .post(version2+"/Login/signIn")
    .send({
      email:"ivan55660228@gmail.com",
      password:"02282040"
    })
    .set("Accept","application/json")
    .expect(200)
    .then(
      (res,err)=>{
        token =  res.body.jwt
        res.body.success.should.equal("True")
        if(err){
          done(err)
        }
        else{
          done()
        }
      }
    )
  });
  it('waiting for jwt done', async function(){
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 5000);    
    }).then(() => {
      return ; 
    });
  }).timeout(10000);
    it("get asset",done=>{
      request
      .get(version2+"/AssetManagement/asset")
      .set("x-access-token",token)
      .set("Accept","application/json")
      .expect(200)
      .end(
        (err,res)=>{
          res.body.success.should.equal("True")
          if(err){
            console.log(err);
            done(err);
          }
          else{
            done();
          }
        }
      )
    })
  })
}
// the api query string still fixed it will be a parameter later so still need to be modified, eg: e-mail --> ivan55660228@gmail.com for now
const Order_api = () => {
  describe("Order.js test...",()=>{
    let token;
    it("Sign in", done=>{
      request
      .post(version2+"/Login/signIn")
      .send({
        email:"ivan55660228@gmail.com",
        password:"02282040"
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        (res,err)=>{
          token =  res.body.jwt
          res.body.success.should.equal("True")
          if(err){
            done(err)
          }
          else{
            done()
          }
        }
      )
    });
    it('waiting for jwt done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);    
      }).then(() => {
        return ; 
      });
    }).timeout(10000);
    it("Query all the Order data..",done=>{
      request
      .get(version2+"/Order/QueryOrder")
      .set("Accept","application/json")
      .set("x-access-token",token)
      .expect(200)
      .end(
        (err,res)=>{
          res.body.success.should.equal("True")
          if(err){
            console.log(err)
            done(err)
          }
          else{
            done()
          }
        }
      )
    });


    it("Product Remain number query api...",done=>{
      request
      .get(version2+"/Order/RemainRelease")
      .send({
        symbol:"EMMY0511"
      })
      .set("x-access-token",token)
      .expect(200)
      .then(
        (res,err)=>{
          res.body.success.should.equal("True")
          if(err){
           done(err)
          }
          else {
            done()
              }
        }
      )
    });

    it("Qualify place order api test...",done=>{
      request
      .get(version2+"/Order/QualifyPlaceOrder")
      .send({
        symbol:"EMMY0511"
      })
      .set("x-access-token",token)
      .expect(200)
      .then(
        (res,err)=>{
          res.body.success.should.equal("True")
          //res.body.quaification.should.equal("True")  
          if(err){
           done(err)
          }
          else {
            done()
              }
        }
      )
    });
    
    
  })
}





// V1 api testing flow

const flow1 = async() => {
  describe('intergration testing of sold out the product', async function(){
    await frontEndUserRegistry();
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    FMNUpdateProduct();
    await update_approve_flow();
    await frontEndUserOrdering(total);
    await makeOrderPaidAndWriteIntoCFC();
    await PSMintToken(getLocalTime());

  });
};
async function flow2(){
  describe('intergration testing of reaching the funding goal after CFED', async function(){
    this.timeout(100000);  
    
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    FMNUpdateProduct();
    await update_approve_flow();
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
  });
};
const flow3 = async() => {
  describe('intergration testing of terminating product', async function(){
    await FMNAddProduct();
    await FMSApproveProduct();
    await PSPublishProduct();
    FMNUpdateProduct();
    await update_approve_flow();
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
    FMNUpdateProduct();
    await update_approve_flow();
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
    FMNUpdateProduct();
    await update_approve_flow();
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





// V2 api testing flow
const new_flow1 = ()=>{
  p_status=["draft","creation","publish", "funding", "ONM", "aborted"]
  p_status.forEach(element =>{
    productinfo_api(element);
  })
  AssetManagement_api();
  Order_api();
  ForgetPassword();
  ForgetPassword2();
}



flow1();
new_flow1();
console.log("Done")



//node node_modules/.bin/mocha  --exit test_CI/apiTest.js 
