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
})}

//Following AssetManagement api function is not finished yet.
const AssetManagement_api = ()=>{
  describe("AssetManagement.js api test...",()=>{
    it("get asset",done=>{
      request
      .get(version2+"/AssetManagement/asset")
      .set("Accept","application/json")
      .expect(200)
      .then(
        (err,res)=>{
          if(err){
            console.log("Fail")
            console.log(err);
            done(err);
          }
          else{
            console.log("Success")
            console.log(res.text)
            done();
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
}

AssetManagement_api();



// demo zone...






/* node node_modules/.bin/mocha  --exit test_CI/new_apiTest.js */





