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

let virtualAccount;
let crowdFundingAddr;

//each version is represented as different version of frontend api path

//var describe = mocha.describe;
//var it = mocha.it;
const version = "/frontendAPI/v1.0";
const version2 = "/frontendAPI/v2.0";



// JWT_demo is a demo of our new method of jwt authorization test.

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


// new api testing begin here. Every api mocha code is designed to be fed all parameters in and simulate all conditions.


const productinfo_api = (p_status)=>{describe("Frontend API 2.0/ Product.js",()=>{
  it("Get Products Information(status:200) with "+p_status, done => {
    request
    .get(version2+"/product/ProductInfo")
    .query({
      status:p_status
    })
    .set("Accept","application/json")
    .expect(200)
    .end(
      (err,res)=>{
        res.body.message.should.equal("success")
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
    it("get asset",done=>{
      request
      .get(version2+"/AssetManagement/asset")
      .set("Accept","application/json")
      .expect(200)
      .end(
        (err,res)=>{
          res.body.message.should.equal("success")
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
// the api query string still fixed it will be a parameter later so still need to be modified
const Order_api = () => {
  describe("Order.js test...",()=>{
    it("QueryOrder api test..",done=>{
      request
      .get(version2+"/Order/QueryOrder")
      .set("Accept","application/json")
      .expect(200)
      .end(
        (err,res)=>{
          res.body.message.should.equal("success")
          if(err){
            console.log(err)
            done(err)
          }
          else{
            done()
          }
        }
      )
    })
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


flow1();
//JWT_demo();

// demo zone...



/* node node_modules/.bin/mocha  --exit test_CI/new_apiTest.js */





