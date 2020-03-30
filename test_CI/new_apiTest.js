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







const makeOrderPaidAndWriteIntoCFC = async() => {
    describe('Make Order Paid And Write Into Crowdfunding', async function(){
      this.timeout(1000);  
     
      it('Write Into Crowdfunding Request', async function(){
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


function Ordering_test(email,pw,u_ID){
    describe("User Manipulate",()=>{
        it("User login",done=>{ 
            request
                .get("/user/UserLogin")
                .query({"email":email,
                        "password":pw})
                .set("Accept","application/json")
                .expect(200)
                .end(
                    (err,res)=>{
                        if(err){
                            console.log("status: "+res.status)
                            done(err);
                        }
                        else{
                            console.log(res.body.message)
                            jwt = res.body.jwt
                            done()
                        }
                    }
                )
        });
    
    
        
        it("Ordering products",done=>{
            request
                .post(version+"/order/AddOrder")
                .send({symbol:"ANNA0323",
                       JWT:jwt,
                       email:email,
                       userIdentity:u_ID,
                       tokenCount:100,
                       fundCount:100*price
                    })
                .set("Accept","applciation/json")
                .expect(200)
                .then(
                    async function(res){
                        console.log(res.body);
                        done();
                    }
                )
        }).timeout(20000);
    
    
    
        it('get unpaid orders detail', async function(){
            await request
              .get(version+'/order/OrdersByEmail')
              .query({ JWT: jwt, status: ['waiting', '']})
              .set('Accept', 'application/json')
              .expect(200)
              .then(async function(res){
                console.log(res.body.result[0].o_bankvirtualaccount);
                virtualAccount=res.body.result[0].o_bankvirtualaccount;
                await res.body.message.should.equal('[Success] Success');
              })
          });
          it('Make Order Paid', async function(){
            var sql = { o_paymentStatus: "paid" };
            const result = await mysqlPoolQueryB('UPDATE order_list SET ? WHERE o_bankvirtualaccount = ?', [sql, virtualAccount]).catch(async (err) => {
              await err.should.empty();
            });
          }).timeout(3000);
        
    })
}





email_array=["ivan55660228@gmail.com","000a00@gmail.com","000a01@gmail.com"]
pw_array=["02282040","user00pw","user01pw"]
u_ID_array=["A128465975","R999777000","R999777001"]




/*



for (let index = 0; index < email_array.length; index++) {
    Ordering_test(email_array[0],pw_array[0],u_ID_array[0])
    
}
makeOrderPaidAndWriteIntoCFC();


*/



// new type of api testing is down below

describe("test the new api",()=>{
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


})






/* node node_modules/.bin/mocha  --exit test_CI/test.js */





