// const os = require('os');
const path = require('path');
const fs = require('fs');
const net = require("net");

const { mysqlPoolQuery, getCrowdFundingCtrtAddr,
    getIncomeManagerCtrtAddr, getOrderDate,
    getHCAT721ControllerCtrtAddr,
    setOrderExpired, setCrowdFundingState } = require('../lib/mysql.js');
//const {mysqlPoolQuery} = require('../../app');

const { sendTimeTokenController, sendTimeCFctrt, sendTimeIMctrt } = require('../lib/contractAPI.js');

const portForIncomingTime = 7010;
let currentCount = 0;
const maxCount = 10;// time period in minutes

createServer();
// if(currentCount < maxCount+1){
//   console.log('[timeserver] currentCount', currentCount);
//   currentCount++;
// } else {
//   currentCount = 1;
//   print('[timeserver] currentCount', currentCount);
// }

function createServer() {
    const server = net.createServer(c => {
        console.log('inside net.createServer');

        c.on("data", (timeCurrent) => {
            fs.writeFile(path.resolve(__dirname, '..', 'time.txt'), date, function (err) {
                if (err) console.error(`寫入時間失敗`)
            })
            print(timeCurrent);
            checkTimeOfOrder(timeCurrent.toString());
            updateCrowdFunding(timeCurrent.toString());
            //updateHCAT721(timeCurrent.toString());
            //checkIncomeManager(timeCurrent.toString());
        });

        c.on("end", () => {
            print("");
        });
        c.pipe(c);

    });

    server.on('error', (err) => {
        throw err;
    });
    server.listen(portForIncomingTime, () => {
        print(`server bound`);
        let timeCurrent = 201905200000;
        updateCrowdFunding(timeCurrent.toString());
      });
}

function updateHCAT721(timeCurrent) {
  console.log('inside updateHCAT721()');
  let pstate1 = "initial";
  getHCAT721ControllerCtrtAddr(function (result) {
      if (result.length != 0) {
          for (let i in result) {
              if (typeof result[i].sc_erc721Controller !== 'undefined' && result[i].sc_erc721Controller != null) {
                //instTokenController.setTimeCurrent
                  //sendTimeTokenController(result[i].sc_erc721Controller, timeCurrent.toString()).then(print)
              }
          }
      }
  })
}

function updateCrowdFunding(timeCurrent){
  console.log('inside updateCrowdFunding()');
  let pstate1 = "initial";
  let pstate2 = "funding";
  let pstate3 = "fundingGoalReached";
  let symbol, pstateNew;
  var qur = mysqlPoolQuery(
    'SELECT * FROM htoken.product WHERE (p_state = ? AND p_CFSD <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+') OR (p_state = ? AND p_CFED <= '+timeCurrent+')', [pstate1, pstate2, pstate3], function (err, result) {
    const resultLen = result.length;
    console.log('result length', resultLen);

    if (err) {
      console.log(err);
    } else if (resultLen != 0) {
      for (let i in result) {
        symbol = result[i].p_SYMBOL;
        console.log('symbol', symbol);
        if (symbol !== 'undefined' && symbol !== 'null' && symbol.length >=3){

          /**
           * CALL existing APIs to get crowdfunding address, 
           * then call updateState()
           * Contracts.js: /crowdFundingContract/:tokenSymbol/updateState
           * 
           * get tokenState in CrowdfundingCtrt via Contracts.js ???? => write pstates ??!!
           */

          getCrowdFundingCtrtAddr(symbol, (addrCF) => {
            console.log('addrCF is found:', addrCF);
            if (typeof addrCF === 'undefined' || addrCF === null) {
              console.error('[error in value] addrCF', addrCF);
            } else {
              sendTimeCFctrt(addrCF, timeCurrent.toString()).then(print)

            }
   
          });

          //Get crowdfunding result
          
          if(result[i].p_state == pstate1){//if p_state == "initial"
            pstateNew = 'funding';
          } else {
            //if(result[i].p_state == pstate2 || result[i].p_state == pstate3)
            pstateNew = '';
          }
          try {
            setCrowdFundingState(symbol, result[i].p_state, function () {
              print(symbol + ' fixed p_state: '+ pstate1+ ' => '+pstateNew);
            })
          } catch (error) {
              print(result[i] + " 格式錯誤");
          }
        }
      }
    }
  });
}

// function updateCrowdFunding(timeCurrent) {
//     getCrowdFundingCtrtAddr(function (result) {
//         if (result.length != 0) {
//             for (let i in result) {
//                 if (typeof addrCF !== 'undefined' && addrCF != null) {
//                     //sendTimeCFctrt(addrCF, timeCurrent.toString()).then(print)
//                 }
//             }
//         }
//     })
// }

function checkIncomeManager(timeCurrent) {
    getIncomeManagerCtrtAddr(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].sc_rentContractaddress !== 'undefined' && result[i].sc_rentContractaddress != null) {
                    //sendTimeIMCtrt(result[i].sc_rentContractaddress, timeCurrent.toString()).then(print)
                }
            }
        }
    })
}


function checkTimeOfOrder(timeCurrent) {
    getOrderDate(function (result) {
        if (result.length != 0) {
            for (let i in result) {
                if (typeof result[i].o_purchaseDate !== 'undefined') {
                    try {
                        if (timeCurrent.toString() >= result[i].o_purchaseDate.add3Day()) {
                            setOrderExpired(result[i].o_id, function () {
                                print(result[i].o_id + " 已修改");
                            })
                        }
                    } catch (error) {
                        print(result[i].o_purchaseDate + " 格式錯誤")
                    }
                }
            }
        }
    })
}



Object.prototype.add3Day = function () {
    let year = parseInt(this.toString().slice(0, 4));
    let month = parseInt(this.toString().slice(4, 6));
    let day = parseInt(this.toString().slice(6, 8));
    let hour = parseInt(this.toString().slice(8, 10));
    let minute = parseInt(this.toString().slice(10, 12));
    return new Date(year, month - 1, day + 3, hour, minute).myFormat();
}

function print(s) {
    console.log('[timeserver/manager/manager.js] ' + s)
}