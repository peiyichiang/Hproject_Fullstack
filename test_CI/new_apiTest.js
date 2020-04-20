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

let virtualAccount;
let crowdFundingAddr;

//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0";
const version2 = "/frontendAPI/v2.0";



// new type of api testing demo is down below

const JWT_demo = ()=>{describe("test the new api",()=>{
  let token;
  let headers;
  it("test /a ", done=>{
    request
    .post(version2+"/product/a")
    .send({
      name:"George"
    })
    .set("Accept","application/json")
    .expect(302)
    .then(
      (res,err)=>{
        if(err){
          done(err)
        }
        else{
          res.header["set-cookie"].should.not.empty();
          token = (res.body)
          console.log(headers)
          done()
        }
      }
    )
  });

  
  
  it("test /b",done=>{
    request
    .get(version2+"/product/b")
    .set("x-access-token",token)
    .set("Accept","application/json")
    .expect(200)
    .end(
      (err,res)=>{
        if(err){
          done(err);
        }
        else{
          console.log(res.body.usr_name)
          done();
        }
      }
    )
  });


})}


// new api testing begin 


/*describe("Frontend API 2.0/ Product.js",()=>{
  it("Get Products Information", done => {
    request
    .get(version2+"/product/ProductInfo")
    .query({
      status:"ONM"
    })
    .set("Accept","application/json")
    .expect(200)
    .end(
      (err,res)=>{
        if(err){
          console.log(err)
          done(err);
        }
        else{
          console.log(res.body)
          res.body.message.should.equal("success")
          res.body.data.should.not.empty()
          done();
        }
      }
    )
  });
})*/


// demo zone...


describe("demo",(email = 'ivan55660228@gmail.com', password = '02282040',symbol="APPL2022")=>{
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
  it("CaseImageURLByCaseSymbol",done=>{
    request
        .get(version+'/product/CaseImageURLByCaseSymbol')
        .query({ JWT: jwt, symbol: symbol })
        .set('Accept', 'application/json')
        .expect(200)
        .then(async function(res){
          await res.body.result.should.not.empty();
          console.log("message down below")
          console.log(res.body.message)
          done();
        })
  });
})





/* node node_modules/.bin/mocha  --exit test_CI/new_apiTest.js */





