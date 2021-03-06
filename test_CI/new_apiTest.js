//Main tool of CICD testing is Mocha, the rest of modules help us judge the api work successfully or not.
//the following command is to start testing the api testing code.(make sure yor are in the Hproject_Fullstack) -> node node_modules/.bin/mocha  --exit test_CI/new_apiTest.js
const app = require('../app');
const request = require('supertest')(app);
var mocha = require('mocha');
var faker = require('faker');
const should = require('should');
const assert = require('assert');
const amqp = require('amqplib/callback_api');
require("dotenv").config();

const {mysqlPoolQueryB, getAllSmartContractAddrs} = require('../timeserver/mysql.js');
const {edit_product, add_product, symbol, total, goal, generateCSV, price, type} = require('./api_product');
const {addAssetbooksIntoCFC, updateFundingStateFromDB} = require('../timeserver/blockchain.js');
const {asyncForEach, getLocalTime} = require('../timeserver/utilities');
const { wait } = require('event-stream');
const { post } = require('request');

let virtualAccount;
let crowdFundingAddr;

//each version is represented as different version of frontend api path

//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0";
const version2 = "/frontendAPI/v2.0";
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');






// new api testing begin here. Every api mocha code is designed to be fed all parameters in and simulate all conditions.


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
    }).timeout(10000)
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
    
    /*it("place a order...",done=>{
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
    }).timeout(300000);*/

  })
}

const flow1 = ()=>{
  p_status=["draft","creation","publish", "funding", "ONM", "aborted"]
  p_status.forEach(element =>{
    productinfo_api(element);
  })
  AssetManagement_api();
  Order_api();
}
//flow1()






// demo zone...

const frontEndUserRegistry = async() => {
  let hash, _email = faker.internet.email(), _password = faker.random.words(), jwt, symbol,user_verify_code,token;
  describe('intergration testing of front-end user register', async function(){
    this.timeout(3000);
    let eth_account_var = "0x" + genRanHex(40)
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
            await res.body.message.should.equal("?????????????????????")
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
          await res.body.message.should.equal("????????????")
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
        u_physicalAddress:"?????????????????????????????????",
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
        await res.body.message.should.equal("???????????????????????????")
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
        }).timeout(30000);
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
            await res.body.message.should.equal("?????????????????????")
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
          await res.body.message.should.equal("????????????")
          console.log(res.text)
        }
      )
    });
    it('waiting for verification done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);    
      }).then(() => {
        return ; 
      });
    }).timeout(15000);
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
          await res.body.message.should.equal("?????????????????????")
          
          }
      )
    }).timeout(10000);
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
          await res.body.message.should.equal("??????????????????????????????????????????KYC??????")
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
    
    it("new password Sign-in testing", async function(){
      await request
      .post(version2+"/Login/signIn")
      .send({
        email:email,
        password:password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res,err){
          await res.body.success.should.equal("True")
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
   
    let eth_account_var = "0x" + genRanHex(40)
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
            await res.body.message.should.equal("?????????????????????")
          }
        )
    }).timeout(500000);
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
          await res.body.message.should.equal("????????????")
          console.log(res.text)
        }
      )
    });
    it('waiting for verification done', async function(){
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);    
      }).then(() => {
        return ; 
      });
    }).timeout(15000);
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
    }).timeout(300000);
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
        u_physicalAddress:"?????????????????????????????????",
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
        await res.body.message.should.equal("???????????????????????????")
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
        }).timeout(30000);
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
      .send({email:_email})
      .set('Accept','application/json')
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("??????????????????")
        }
      )
    });
    it("Send email",async function(){
      await request
      .post(version2+"/ForgetPassword/send_email")
      .send({email:_email})
      .set("Accept",'application/json')
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("?????????????????????")
          }
      )
    }).timeout(300000);
    it("Verify the code sent in email",async function(){
      fp_verify_code = await mysqlPoolQueryB("SELECT fp_verification_code FROM forget_pw WHERE fp_investor_email = ?",[_email])
      fp_verify_code = fp_verify_code[0].fp_verification_code
      await request
      .post(version2+"/ForgetPassword/verify_email")
      .send({email:_email, fp_verification_code:fp_verify_code})
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res,err){
          await res.body.message.should.equal("??????????????????????????????????????????KYC??????")
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
      .send({email:_email, password:password, fp_imagef:"public/uploadImgs/1.jpg",fp_imageb:"public/uploadImgs/1.jpg",fp_bankAccountimage:"public/uploadImgs/1.jpg" })
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res){
          await res.body.message.should.equal("??????????????????????????????????????????????????????????????????")
        }
      )
    });
    it("Backend User Login PS",async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Admin', m_password: 'Platform_Admin' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
        })
    });
    it("KYC approve by Platform Admin",async function(){
      ForgetPassword_application_time = await mysqlPoolQueryB("SELECT fp_application_date FROM forget_pw WHERE fp_investor_email = ?",[_email])
      ForgetPassword_application_time = ForgetPassword_application_time[0].fp_application_date
      await request
      .post("/User/ReviewForgetPassword")
      .send({
        email:_email,
        application_date:ForgetPassword_application_time,
        isApprove:"true"
      })
      .set("Cookie",token)
      .expect(302)
      .then(
        async function(){
        }
      )
    });
    
    it("new password Sign-in testing", async function(){
      await request
      .post(version2+"/Login/signIn")
      .send({
        email:email,
        password:password
      })
      .set("Accept","application/json")
      .expect(200)
      .then(
        async function(res,err){
          await res.body.success.should.equal("True")
        }
      )
    });
  })
}

const FMsystemApiTest = async()=>{
  describe("FM system API test (after product ONM )", async function(){
    var token
    it("Backend User Login FMS",async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'myrronlins@gmail.com', m_password: '123456789' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
        })
    });
    it('Browse Product By PS', async function(){
      await request
        .get('/Product/GenerateHolderReport')
        .set('Cookie', token)
        .expect(200)
        .then(async function(res){
          await res.text.should.not.empty();
        });
    });
    it('request for HolderReport', async function(){
      await request
      .post("/Product/GenerateHolderReport")
      .send({p_symbol:"ADEL0525",p_date:"2020/09/10"})
      .set("Accept","application/json")
      .set("Cookie",token)
      .expect(200)
      .then(
        async function(res){
          await res.text.should.not.empty()
        }
      )
    });
    it("Backend User Login PS",async function(){
      await request
        .post('/BackendUser/BackendUserLogin')
        .set('Accept', 'application/json')
        .send({ m_id: 'Platform_Supervisor', m_password: 'Platform_Supervisor' })
        .expect(302)
        .then(async function(res){
          await res.header["set-cookie"].should.not.empty();
          //jwt = res.body.jwt;
          token = (res.header["set-cookie"]);
        })
    });
    it("get Sales Report", async function(){
      await request
      .get("/Report/SalesReport")
      .set("Accept","application/json")
      .set("Cookie",token)
      .expect(200)
      .then(
        async function(res){
          await res.text.should.not.empty()
        }
      )
    });
    it("get income Report", async function(){
      await request
      .get("/Report/IncomeReport")
      .set("Accept","application/json")
      .set("Cookie",token)
      .expect(200)
      .then(
        async function(res){
          await res.text.should.not.empty()
        }
      )
    });
    it("get investor Report", async function(){
      await request
      .get("/Report/InvestorReport")
      .set("Accept","application/json")
      .set("Cookie",token)
      .expect(200)
      .then(
        async function(res){
          await res.text.should.not.empty()
        }
      )
    });
    it("get FM Report", async function(){
      await request
      .get("/Report/FMReport")
      .set("Accept","application/json")
      .set("Cookie",token)
      .expect(200)
      .then(
        async function(res){
          await res.text.should.not.empty()
        }
      )
    });
    
  })
}





/*
describe("test",async function(){
  _email="Bennie_Doyle0@hotmail.com"
  it("Backend User Login PS",async function(){
    await request
      .post('/BackendUser/BackendUserLogin')
      .set('Accept', 'application/json')
      .send({ m_id: 'Platform_Admin', m_password: 'Platform_Admin' })
      .expect(302)
      .then(async function(res){
        await res.header["set-cookie"].should.not.empty();
        //jwt = res.body.jwt;
        token = (res.header["set-cookie"]);
      })
  });
  it("KYC approve by Platform Admin",async function(){
    ForgetPassword_application_time = await mysqlPoolQueryB("SELECT fp_application_date FROM forget_pw WHERE fp_investor_email = ?",[_email])
    ForgetPassword_application_time = ForgetPassword_application_time[0].fp_application_date
    await request
    .post("/User/ReviewForgetPassword")
    .send({
      email:_email,
      application_date:ForgetPassword_application_time,
      isApprove:"true"
    })
    .set("Cookie",token)
    .expect(302)
    .then(
      async function(){
      }
    )
  });
})*/


//frontEndUserRegistry();

//flow1();
//ForgetPassword();
//ForgetPassword2();
//FMsystemApiTest();
frontEndUserRegistry();
/* node node_modules/.bin/mocha  --exit test_CI/new_apiTest.js */
//AssetManagement_api();



