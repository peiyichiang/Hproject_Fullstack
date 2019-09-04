var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var csv2sql = require('csv2sql-stream');
var fs = require('fs');
const { getTime, asyncForEach } = require('../timeserver/utilities');
const { addScheduleBatch, editActualSchedule, getIncomeScheduleList, addScheduleBatchFromDB } = require('../timeserver/blockchain.js');

// Web3
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
// HTTP provider
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/136557225d6a4fdcbaf3f37ea4b31097"));
var abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_Hash",
				"type": "string"
			}
		],
		"name": "sethashTable",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_Hash",
				"type": "string"
			}
		],
		"name": "searchHash",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "test",
		"outputs": [
			{
				"name": "str1",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	}
];
var address = '0x3f566b3ed659c3100a818ca2eff24b67244fd9a9';  //Contract Address
var AccountAddress="0x9402cf812792E6845813Db3dB5Ae7615d0956167";
var PrivateKey="0x3AE8AB94B3EFF34C931909EDC8EE4DEF1F2E7DB30D4F7BD5237E299FF71D2BD0";

var Contract;
async function init(){
    Contract = await new web3.eth.Contract(abi, address);
}
// 初始化合約
init(); 


//撈取資料(Platform_Supervisor專用，沒在用)
router.get('/Product', function (req, res, next) {
    console.log('------------------------==\n@Product/Product:\nreq.query', req.query, 'req.body', req.body);
    //   console.log("＊：" + JSON.stringify(req.session));
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Supervisor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
    var mysqlPoolQuery = req.pool;

    // var iaData;
    // mysqlPoolQuery("SELECT ia_time,ia_single_Actual_Income_Payment_in_the_Period,ia_single_Calibration_Actual_Income_Payment_in_the_Period FROM income_arrangement WHERE ia_State =?", "ia_state_underReview"  , function(err, rows) {
    //     if (err) {
    //         console.log(err);
    //     }else{
    //         iaData = rows;
    //         console.log("@@" + JSON.stringify(rows));
    //     }
    // });


    mysqlPoolQuery('SELECT * FROM product', function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use index.ejs
        res.render('ViewProduct', { title: 'Product Information', data: data });
        //res.render('ProductAdministrationByPlatformSupervisor', { title: 'Product Information', data: data});
    });

});

//撈取資料(FMN專用，只撈取自己創建的產品資料，且產品狀態為creation)
router.get('/ProductByFMN', function (req, res, next) {
    console.log('------------------------==\n@Product/ProductByFMN:\nreq.query', req.query, 'req.body', req.body);

    //   console.log("＊：" + JSON.stringify(req.session));
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // var mysqlPoolQuery = req.pool;
    // mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ? AND p_state = ?',[JWT_decoded.payload.m_id , "creation"])
    // .then( rows => {
    //     var data = rows;
    //     res.render('ProductAdministrationByFMN', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data});
    // } );

    var mysqlPoolQuery = req.pool;
    //獲取審核中的產品資料
    // mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ? AND p_state = ?', [JWT_decoded.payload.m_id , "creation"] , function(err, rows) {
    mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ?', JWT_decoded.payload.m_id, function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        //獲取編輯中的產品資料
        mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ? AND p_state = ?', [JWT_decoded.payload.m_id, "draft"], function (err, rows) {
            if (err) {
                console.log(err);
            }
            var dataDraft = rows;
            res.render('ProductAdministrationByFMN', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data, dataDraft: dataDraft });
        });
    });


});

//撈取資料(FMS專用，撈取該公司所有FMS創建的產品資料，且產品狀態為creation)
router.get('/ProductByFMS', function (req, res, next) {
    console.log('------------------------==\n@Product/ProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    //   console.log("＊：" + JSON.stringify(req.session));
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Company_FundManagerS") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    //   var mysqlPoolQuery = req.pool;
    //   mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company,"creation"]  , function(err, rows) {
    //       if (err) {
    //           console.log(err);
    //       }
    //       var data = rows;
    //     //   console.log(rows);
    //       // use index.ejs
    //       res.render('ProductAdministrationByFMS', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data});
    //   });

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company, "creation"], function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;


        //撈取已付款的數量
        mysqlPoolQuery("SELECT o_symbol , SUM(o_tokenCount) AS paidTokenCount FROM order_list WHERE o_paymentStatus = ? GROUP BY o_symbol", "paid", function (err, rows) {
            if (err) {
                console.log(err);
            }

            //更新p_PaidNumber
            for (var i = 0; i < rows.length; i++) {
                // console.log(JSON.stringify(rows[i].o_symbol));
                // console.log(JSON.stringify(rows[i].paidTokenCount));

                var sql = {
                    p_paidNumber: rows[i].paidTokenCount
                };

                var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, rows[i].o_symbol], function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                });
            }

        });

        // mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company,"publish"]  , function(err, rows) {
        mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?)", JWT_decoded.payload.m_company, function (err, rows) {
            if (err) {
                console.log(err);
            }
            var dataPublish = rows;
            res.render('ProductAdministrationByFMS', { title: 'Product Information', UserID: JWT_decoded.payload.m_id, data: data, dataPublish: dataPublish });
        });


    });

});


//新增資料:頁面(FMN專用)
router.get('/AddProductByFMN', function (req, res, next) {
    console.log('------------------------==\n@Product/AddProductByFMN:\nreq.query', req.query, 'req.body', req.body);
    // console.log("＊：" + JSON.stringify(req.session));
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }
    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
    // use userAdd.ejs
    res.render('AddProductByFMN', { title: 'Add Product' });
});

//新增資料：接收資料的post(FMN專用)
router.post('/AddProductByFMN', function (req, res, next) {
    // console.log('------------------------==\n@Product/AddProductByFMN:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
    var mysqlPoolQuery = req.pool;

    //因為是FMN新增的產品資料，所以狀態永遠是creation
    //新增該產品資料的Fund Manager則是用存在JWT中的帳號資料
    console.log("@@@" + req.body.p_fundingType);
    var sql = {
        p_SYMBOL: req.body.p_SYMBOL,
        p_name: req.body.p_name,
        p_location: req.body.p_location,
        p_pricing: req.body.p_pricing,
        p_duration: req.body.p_duration,
        p_currency: req.body.p_currency,
        p_irr: Number(req.body.p_irr).toFixed(2),
        p_releasedate: req.body.p_releasedate,
        p_validdate: req.body.p_validdate,
        p_size: req.body.p_size,
        p_totalrelease: req.body.p_totalrelease,
        p_fundingType: req.body.p_fundingType,
        p_fundmanager: JWT_decoded.payload.m_id,
        p_state: "draft",   //草稿
        p_icon: req.body.p_icon,
        p_assetdocs: req.body.p_assetdocs,
        p_csvFIle: req.body.p_csvFIle,
        p_Image1: req.body.p_Image1,
        p_Image2: req.body.p_Image2,
        p_Image3: req.body.p_Image3,
        p_Image4: req.body.p_Image4,
        p_Image5: req.body.p_Image5,
        p_Image6: req.body.p_Image6,
        p_Image7: req.body.p_Image7,
        p_Image8: req.body.p_Image8,
        p_Image9: req.body.p_Image9,
        p_Image10: req.body.p_Image10,
        p_FAY: req.body.p_FAY,
        p_FTRT: req.body.p_FTRT,
        p_RPT: req.body.p_RPT,
        p_FRP: req.body.p_FRP,
        p_Timeline: req.body.p_Timeline,
        p_PSD: req.body.p_PSD,
        p_TaiPowerApprovalDate: req.body.p_TaiPowerApprovalDate,
        p_BOEApprovalDate: req.body.p_BOEApprovalDate,
        p_PVTrialOperationDate: req.body.p_PVTrialOperationDate,
        p_PVOnGridDate: req.body.p_PVOnGridDate,
        p_CFSD: req.body.p_CFSD,
        p_CFED: req.body.p_CFED,
        p_fundingGoal: req.body.p_fundingGoal,
        p_HCAT721uri: req.body.p_HCAT721uri,
        p_EPCname: req.body.p_EPCname,
        p_Copywriting: req.body.p_Copywriting,
        p_ContractOut: req.body.p_ContractOut,
        p_CaseConstruction: req.body.p_CaseConstruction,
        p_ElectricityBilling: req.body.p_ElectricityBilling,
        p_isNewCase: req.body.p_isNewCase,
        p_assetdocsHash:req.body.p_assetdocsHash
    };

    console.log(sql);

    var qur = mysqlPoolQuery('INSERT INTO product SET ?', sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMN');
    });

});

//刪除資料：獲取網址上的參數(Platform_Supervisor跟FMN都可以使用)
router.get('/DeleteProduct', function (req, res, next) {
    console.log('------------------------==\n@Product/DeleteProduct:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Platform_Supervisor" && decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var symbol = req.query.symbol;
    var mysqlPoolQuery = req.pool;

    var sql = {
        p_isDelete: true
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }
        if (JWT_decoded.payload.m_permission == "Platform_Supervisor") {
            res.redirect('/Product/Product');
        } else if (JWT_decoded.payload.m_permission == "Company_FundManagerN") {
            res.redirect('/Product/ProductByFMN');
        }
    });

    // var qur = mysqlPoolQuery('DELETE FROM product WHERE p_SYMBOL = ?', symbol, function(err, rows) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     if (JWT_decoded.payload.m_permission=="Platform_Supervisor"){
    //         res.redirect('/Product/Product');
    //     } else if (JWT_decoded.payload.m_permission=="Company_FundManagerN"){
    //         res.redirect('/Product/ProductByFMN');
    //     }

    // });
});

//修改資料：撈取原有資料到修改頁面(FMN專用)
router.get('/EditProductByFMN', function (req, res, next) {
    console.log('------------------------==\n@Product/EditProductByFMN:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }


    var symbol = req.query.symbol;
    var mysqlPoolQuery = req.pool;

    mysqlPoolQuery('SELECT * FROM product WHERE p_SYMBOL = ?', symbol, function (err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('EditProductByFMN', { title: 'Edit Product', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫(FMN專用)
router.post('/EditProductByFMN', function (req, res, next) {
    // console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.body.p_SYMBOL;

    var sql = {
        p_SYMBOL: req.body.p_SYMBOL,
        p_name: req.body.p_name,
        p_location: req.body.p_location,
        p_pricing: req.body.p_pricing,
        p_duration: req.body.p_duration,
        p_currency: req.body.p_currency,
        p_irr: Number(req.body.p_irr).toFixed(2),
        p_releasedate: req.body.p_releasedate,
        p_validdate: req.body.p_validdate,
        p_size: req.body.p_size,
        p_totalrelease: req.body.p_totalrelease,
        p_fundingType: req.body.p_fundingType,
        p_icon: req.body.p_icon,
        p_assetdocs: req.body.p_assetdocs,
        p_csvFIle: req.body.p_csvFIle,
        p_Image1: req.body.p_Image1,
        p_Image2: req.body.p_Image2,
        p_Image3: req.body.p_Image3,
        p_Image4: req.body.p_Image4,
        p_Image5: req.body.p_Image5,
        p_Image6: req.body.p_Image6,
        p_Image7: req.body.p_Image7,
        p_Image8: req.body.p_Image8,
        p_Image9: req.body.p_Image9,
        p_Image10: req.body.p_Image10,
        p_FAY: req.body.p_FAY,
        p_FTRT: req.body.p_FTRT,
        p_RPT: req.body.p_RPT,
        p_FRP: req.body.p_FRP,
        p_Timeline: req.body.p_Timeline,
        p_PSD: req.body.p_PSD,
        p_TaiPowerApprovalDate: req.body.p_TaiPowerApprovalDate,
        p_BOEApprovalDate: req.body.p_BOEApprovalDate,
        p_PVTrialOperationDate: req.body.p_PVTrialOperationDate,
        p_PVOnGridDate: req.body.p_PVOnGridDate,
        p_CFSD: req.body.p_CFSD,
        p_CFED: req.body.p_CFED,
        p_fundingGoal: req.body.p_fundingGoal,
        p_HCAT721uri: req.body.p_HCAT721uri,
        p_EPCname: req.body.p_EPCname,
        p_Copywriting: req.body.p_Copywriting,
        p_ContractOut: req.body.p_ContractOut,
        p_CaseConstruction: req.body.p_CaseConstruction,
        p_ElectricityBilling: req.body.p_ElectricityBilling,
        p_isNewCase: req.body.p_isNewCase,
        p_assetdocsHash:req.body.p_assetdocsHash
        // p_fundmanager: req.body.p_fundmanager,
        // p_state: req.body.p_state
    };
    // console.log("@@@：" + symbol);
    console.log("@@@：" + JSON.stringify(req.body));
    // console.log("@@@:" + JSON.stringify(sql));

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log("＊＊＊:" + err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMN');
    });

});

//修改資料：將產品狀態設置為creation，讓FMS可以審核(FMN專用)
router.get('/SetProductCreationByFMN', function (req, res, next) {
    // console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerN") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;
    // console.log("@@@:" + symbol);

    var qur = mysqlPoolQuery('UPDATE product SET p_state = ? WHERE p_SYMBOL = ?', ["creation", symbol], function (err, rows) {
        if (err) {
            console.log("＊＊＊:" + err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMN');
    });

});

//設置產品的狀態：將產品狀態設為publish(FMS專用)
router.get('/EditProductByFMS', function (req, res, next) {
    console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerS") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerS"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;

    //獲取當前時間作為FMS通過審核的時間
    //範例：1/30/2019, 3:23:19 PM
    var currentTime = new Date().toLocaleString().toString();
    console.log(currentTime);

    var sql = {
        p_state: "publish",
        p_FMXAdate: currentTime
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMS');
    });

});

//設置產品的狀態：將產品狀態設為draft(FMS專用)
router.get('/SetProductDraftByFMS', function (req, res, next) {
    console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerS") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Company_FundManagerS"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;

    var sql = {
        p_state: "draft",
        p_FMXAdate: ""
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMS');
    });

});

//設置產品的狀態：將產品狀態設為退回creation，或設置為funding(Platform Supervisor專用)
router.get('/EditProductByPlatformSupervisor', function (req, res, next) {
    console.log('------------------------==\n@Product/EditProductByPlatformSupervisor:\nreq.query', req.query, 'req.body', req.body);
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    // if(req.session.login!=true){
    //     res.render('error', { message: '請先登入帳號', error: '' });
    //     return;
    // }

    // if(req.session.m_permission!="Platform_Supervisor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;
    var State = req.query.State;

    //獲取當前時間作為PA通過審核的時間
    //範例：1/30/2019, 3:23:19 PM
    var currentTime = new Date().toLocaleString().toString();
    if (State == "creation") {
        //假如是被退回，就將審核時間清空
        currentTime = "";
    }

    var sql = {
        p_state: State,
        p_PAdate: currentTime
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
    });

});

//設置產品的狀態：將產品狀態設為退回creation，或設置為funding(Platform Supervisor專用)
router.post('/SetProductStateByPlatformSupervisor', function (req, res, next) {
    console.log('------------------------==\n@Product/EditProductByPlatformSupervisor:\nreq.query', req.query, 'req.body', req.body);

    var mysqlPoolQuery = req.pool;
    var symbol = req.body.tokenSymbol;
    var State = req.body.tokenState;

    //獲取當前時間作為PA通過審核的時間
    //範例：1/30/2019, 3:23:19 PM
    var currentTime = new Date().toLocaleString().toString();
    if (State == "creation") {
        //假如是被退回，就將審核時間清空
        currentTime = "";
    }

    var sql = {
        p_state: State,
        p_PAdate: currentTime
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send({ status: "true" });
        }

    });

});

//設置產品的p_FMSNote並將產品狀態設為draft(FMS專用)
router.get('/SetFMSNoteAndReturnByFMS', function (req, res, next) {
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                if (decoded.payload.m_permission != "Company_FundManagerS") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;
    var note = req.query.note;

    console.log("＊＊＊symbol:" + symbol);
    console.log("note:" + note);

    var sql = {
        p_state: "draft",
        p_FMXAdate: "",
        p_FMSNote: note
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMS');
    });

});

//設置產品的p_PANote並將產品狀態設為creation(Platform Supervisor專用)
router.get('/SetPANoteAndReturnByPA', function (req, res, next) {
    var token = req.cookies.access_token;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                console.log("＠＠＠＠＠＠：" + decoded.payload.m_permission);
                if (decoded.payload.m_permission != "Platform_Supervisor") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }

    var mysqlPoolQuery = req.pool;
    var symbol = req.query.symbol;
    var note = req.query.note;

    console.log("＊＊＊symbol:" + symbol);
    console.log("note:" + note);

    var sql = {
        p_state: "creation",
        p_FMXAdate: "",
        p_PANote: note
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
    });

});

//設置產品的p_PANote並將產品狀態設為creation(Platform Supervisor專用)
router.post('/SetAbortedReasonByPA', function (req, res, next) {
    // var token=req.cookies.access_token;
    // // console.log("@@@：" + req.cookies);
    // if (token) {
    //     // 驗證JWT token
    //     jwt.verify(token, "my_secret_key", function (err, decoded) {
    //       if (err) {
    //         //JWT token驗證失敗
    //         res.render('error', { message: '帳號密碼錯誤', error: '' });
    //         return;
    //       } else {
    //         //JWT token驗證成功
    //         console.log("＠＠＠＠＠＠：" + decoded.payload.m_permission);
    //         if(decoded.payload.m_permission!="Platform_Supervisor"){
    //             res.render('error', { message: '權限不足', error: '' });
    //             return;
    //         }
    //       }
    //     })
    // } else {
    //     //不存在JWT token
    //     res.render('error', { message: '請先登入111', error: '' });
    //     return;
    // }

    var mysqlPoolQuery = req.pool;
    var symbol = req.body.tokenSymbol;
    var AbortedReason = req.body.AbortedReason;

    console.log("＊＊＊symbol:" + symbol);
    console.log("note:" + AbortedReason);

    var sql = {
        p_abortedReason: AbortedReason
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function (err, rows) {
        if (err) {
            console.log(err);
        }

        res.status(200);
        res.send({
            "message": "設置AbortedReasont成功",
            "result": rows
        });
    });

});

//將IncomeCSV轉存到Database
router.post('/IncomeCSV', function (req, res, next) {
    var IncomeCSVFilePath = "./" + req.body.IncomeCSVFilePath;
    // console.log("＊＊＊:" + IncomeCSVFilePath);
    // console.log(IncomeCSVFilePath);
    if (IncomeCSVFilePath.indexOf(".csv") != -1) {
        console.log("0");
        console.log(fs.existsSync(IncomeCSVFilePath));
        //判斷文件路徑是否存在
        try {
            if (fs.existsSync(IncomeCSVFilePath)) {
                console.log("1");
                //file exists
                // 將csv轉換成sql語句
                csv2sql.transform("income_arrangement", fs.createReadStream(IncomeCSVFilePath))
                    .on('data', function (sql) {
                        //console.log(sql);
                        var mysqlPoolQuery = req.pool;
                        var qur = mysqlPoolQuery(sql, function (err, rows) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.send({
                                    "messageForDeveloper": "IncomeCSV文件寫入資料庫成功",
                                    "messageForUser": "",
                                    "isSuccess": true
                                });
                            }
                        });

                    })
                    .on('end', function (rows) {
                        // console.log(rows); // 5 - Num of rows handled, including header
                    })
                    .on('error', function (error) {
                        console.error(error); //Handle error
                    })
            } else {
                res.send({
                    "messageForDeveloper": "沒有Income CSV文件",
                    "messageForUser": "Income CSV文件遺失，請重新上傳",
                    "isSuccess": false
                });
            }
        } catch (err) {
            console.error(err)
            res.send({
                "messageForDeveloper": "沒有Income CSV文件",
                "messageForUser": "Income CSV文件遺失，請重新上傳",
                "isSuccess": false
            });
        }
    } else {
        res.send({
            "messageForDeveloper": "沒有Income CSV文件",
            "messageForUser": "請上傳Income CSV文件",
            "isSuccess": false
        });
    }

});

// 撈取指定產品Income Arrangement資料
router.get('/IncomeArrangement', function (req, res, next) {
    var token = req.cookies.access_token;
    var JWT_decoded;
    var dateNow = new Date();
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
            //檢查JWT token有沒有過期
            if (decoded.exp < dateNow.getTime() / 1000) {
                res.render('error', { message: '登入過時，請重新登入', error: '' });
                return;
            }
            if (err) {
                //JWT token驗證失敗
                res.render('error', { message: '帳號密碼錯誤', error: '' });
                return;
            } else {
                //JWT token驗證成功
                JWT_decoded = decoded;
                if (decoded.payload.m_permission != "Company_FundManagerS") {
                    res.render('error', { message: '權限不足', error: '' });
                    return;
                }
            }
        })
    } else {
        //不存在JWT token
        res.render('error', { message: '請先登入', error: '' });
        return;
    }
    var symbol = req.query.symbol;

    var mysqlPoolQuery = req.pool;
    mysqlPoolQuery("SELECT ia_time,ia_single_Actual_Income_Payment_in_the_Period,ia_single_Forecasted_Payable_Income_in_the_Period,ia_Payable_Period_End,ia_State FROM income_arrangement WHERE ia_SYMBOL =?", symbol, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            var data = rows;
            res.json(data);
        }
    });
});

// 接收FMS Actual Payment的校正資料
router.post('/CorrectActualPayment', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log("#Symobl:" + req.body.CorrectActualPaymentTokenSymbol);
    console.log("#第幾期:" + req.body.Period);
    console.log("#校正前時間:" + req.body.OriginalPaymentTime);
    console.log("#校正後時間:" + req.body.CorrectActualPaymentTime);
    console.log("#校正前金額:" + req.body.OriginalPaymentNumber);
    console.log("#校正後金額:" + req.body.CorrectActualPaymentNumber);

    var sql = {
        //校正後金額
        ia_single_Actual_Income_Payment_in_the_Period: req.body.CorrectActualPaymentNumber,
        //校正後時間
        ia_actualPaymentTime: req.body.CorrectActualPaymentTime,
        ia_State: "ia_state_underReview"
    };

    var mysqlPoolQuery = req.pool;
    var qur = mysqlPoolQuery('UPDATE income_arrangement SET ? WHERE ia_SYMBOL = ? AND ia_time = ?  ', [sql, req.body.CorrectActualPaymentTokenSymbol, req.body.OriginalPaymentTime], function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/Product/ProductByFMS');
        }
    });
});

// 接收 平台方審核Actual Payment的結果
router.post('/CorrectActualPaymentResult', function (req, res, next) {
    // console.log("#Symobl:" + req.body.CorrectActualPaymentTokenSymbol);
    // console.log("#校正前時間:" + req.body.OriginalPaymentTime);
    // console.log("#校正結果：" + req.body.CorrectActualPaymentResult);

    var sql = {
        ia_State: req.body.CorrectActualPaymentResult
    };

    var mysqlPoolQuery = req.pool;
    //根據傳來的symbol、校正前時間 查詢期數、實際發放金額、實際發放時間
    var qur = mysqlPoolQuery('SELECT ia_Payable_Period_End,ia_single_Actual_Income_Payment_in_the_Period,ia_actualPaymentTime FROM income_arrangement WHERE ia_SYMBOL = ? AND ia_time = ?', [req.body.CorrectActualPaymentTokenSymbol, req.body.OriginalPaymentTime], async function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            var data = rows;
            // 期數
            var period = rows[0].ia_Payable_Period_End;
            console.log("第幾期：" + period);
            // 實際發放金額
            var actualPaymentAmount_ = rows[0].ia_single_Actual_Income_Payment_in_the_Period;
            console.log("實際發放金額：" + actualPaymentAmount_);
            // console.log(rows[0].ia_single_Actual_Income_Payment_in_the_Period);
            // 實際發放時間
            var actualPaymentTime_ = rows[0].ia_actualPaymentTime;
            console.log("實際發放時間：" + actualPaymentTime_);
            // console.log(rows[0].ia_actualPaymentTime);                    

            // 如果通過審核就寫入到智能合約
            if (req.body.CorrectActualPaymentResult == "ia_state_approved") {
                const symbol = req.body.CorrectActualPaymentTokenSymbol;
                const schIndex = period;
                const actualPaymentTime = actualPaymentTime_;
                const actualPaymentAmount = actualPaymentAmount_;
                const result = await editActualSchedule(symbol, schIndex, actualPaymentTime, actualPaymentAmount);
                console.log('result', result);

                // 如果成功寫入智能合約，就設置審核狀態
                if (result == true) {
                    //設置審核狀態 
                    var sql = {
                        ia_State: req.body.CorrectActualPaymentResult
                    };
                    var qur1 = mysqlPoolQuery('UPDATE income_arrangement SET ? WHERE ia_SYMBOL = ? AND ia_time = ?  ', [sql, req.body.CorrectActualPaymentTokenSymbol, req.body.OriginalPaymentTime], async function (err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                            res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
                        }
                    });
                }
            } else if (req.body.CorrectActualPaymentResult == "ia_state_unapproved") {
                var sql = {
                    ia_State: req.body.CorrectActualPaymentResult
                };
                var qur1 = mysqlPoolQuery('UPDATE income_arrangement SET ? WHERE ia_SYMBOL = ? AND ia_time = ?  ', [sql, req.body.CorrectActualPaymentTokenSymbol, req.body.OriginalPaymentTime], async function (err, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
                    }
                });
            }
        }
    });


    // 將校正結果寫入資料庫
    // var mysqlPoolQuery = req.pool;
    // var qur = mysqlPoolQuery('UPDATE income_arrangement SET ? WHERE ia_SYMBOL = ? AND ia_time = ?  ', [sql, req.body.CorrectActualPaymentTokenSymbol, req.body.OriginalPaymentTime], async function (err, rows) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         if(req.body.CorrectActualPaymentResult=="ia_state_approved"){
    //             const symbol = req.body.CorrectActualPaymentTokenSymbol;
    //             const schIndex = req.body.Period;
    //             const actualPaymentTime =req.body.CorrectActualPaymentTime;
    //             const actualPaymentAmount = req.body.CorrectActualPaymentNumber;
    //             const result = await editActualSchedule(symbol, schIndex, actualPaymentTime, actualPaymentAmount);
    //             console.log('result', result);
    //         }
    //         res.setHeader('Content-Type', 'application/json');
    //         res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
    //     }
    // });
});

router.get('/testRayAPI', function (req, res, next) {
    if (addScheduleBatch("ACHM6666", [201907081516, 201907081517], [3, 4])) {
        console.log("###Success");
    } else {
        console.log("###Fail");
    }
});

router.get('/LaunchedProductList', function (req, res) {
    console.log('------------------------==\n@Product/LaunchedProductList');
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery(
        `SELECT 
        p_irr AS IRR,
        p_name AS name,
        p_location AS location,
        p_SYMBOL AS symbol,
        p_pricing AS pricing,
        p_currency AS currency,
        p_totalrelease AS maxProductQuantity,
        ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
        SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
        SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
        SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
        SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
        SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
        p_size AS size,
        p_duration AS durationInYear,
        SUBSTRING(p_CFED, 1, 4) AS deadlineYear,
        SUBSTRING(p_CFED, 5, 2) AS deadlineMonth,
        SUBSTRING(p_CFED, 7, 2) AS deadlineDate,
        SUBSTRING(p_CFED, 9, 2) AS deadlineHour,
        SUBSTRING(p_CFED, 11, 2) AS deadlineMinute,
        p_Image1 AS imageURL,
        p_TaiPowerApprovalDate AS taiPowerApprovalDate,
        p_CFSD AS CFSD,
        p_BOEApprovalDate AS BOEApprovalDate,
        p_CFED AS CFED,
        p_PVTrialOperationDate AS PVTrialOperationDate,
        p_ContractOut AS contractOut,
        p_CaseConstruction AS caseConstruction,
        p_ElectricityBilling AS electricityBilling,
        p_fundingType AS fundingType,
        p_totalrelease - IFNULL(reservedTokenCount, 0 ) AS remainTokenCount,
        IFNULL(purchasedNumberOfPeople , 0) AS purchasedNumberOfPeople,
        IFNULL(payablePeriodTotal, 0) AS payablePeriodTotal,
        p_Copywriting AS copyWritingText
        FROM product AS T1
        LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                    FROM order_list
                    WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                    GROUP BY o_symbol) AS T2
        ON T1.p_SYMBOL = T2.o_symbol
        LEFT JOIN ( SELECT o_symbol , COUNT(o_email) AS purchasedNumberOfPeople
                    FROM order_list
                    GROUP BY o_symbol) AS T3
        ON T1.p_SYMBOL = T3.o_symbol
        LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                    FROM income_arrangement 
                    GROUP BY ia_SYMBOL) AS T4
        ON T1.p_SYMBOL = T4.ia_SYMBOL
        WHERE p_state = \'funding\';`, function (err, productArray) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "產品列表取得失敗:\n" + err
                })
            }
            else {
                /* 取得現在時間 */
                let timeNow = new Date();
                const minuteAndHour = timeNow.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: "numeric",
                    minute: "numeric"
                });
                let year = timeNow.getFullYear();
                let month = String(timeNow.getMonth() + 1).padStart(2, '0'); //January is 0!
                let day = String(timeNow.getDate()).padStart(2, '0');
                let hour = minuteAndHour.substring(0, 2);
                let minute = minuteAndHour.substring(3, 5);
                timeNow = year + month + day + hour + minute;
                /* 回傳還沒超過 CFED 的專案 */
                productArray = productArray.filter(function (item, index, array) {
                    return timeNow < item.CFED;
                });
                if (productArray.length > 0) {
                    res.status(200);
                    res.json({
                        "message": "產品列表取得成功",
                        "result": productArray
                    });
                } else {
                    res.status(404);
                    res.json({
                        "message": "找不到已上架產品"
                    });
                }
            }
            /* code = 304? */
        });
});

router.get('/ForcastIncomeBySymbol', function (req, res) {
    console.log('------------------------==\n@Product/ForcastIncomeBySymbol');
    const mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol;
    mysqlPoolQuery(
        `SELECT ia_Annual_End AS year, 
                ia_single_Forecasted_Annual_Income AS incomeOfThePeriod
         FROM   income_arrangement
         WHERE  ia_SYMBOL = ? 
         AND    ia_single_Forecasted_Annual_Income > 0
        `, symbol, function (err, forcastIncomeArray) {

            let initArray = []
            initArray.push(forcastIncomeArray[0])

            forcastIncomeArray.reduce(
                function (array, nextElement) {
                    const index = array.length - 1
                    if (index > 0) {
                        nextElement.accumulatedIncome = nextElement.incomeOfThePeriod + array[index].accumulatedIncome
                    } else {
                        nextElement.accumulatedIncome = nextElement.incomeOfThePeriod
                    }
                    return array.concat(nextElement);
                }, initArray
            );

            if (err) {
                res.status(400)
                res.json({
                    "message": "預估收益取得失敗:\n" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "預估收益取得成功！",
                    "result": forcastIncomeArray
                });
            }
        });
});

router.get('/CaseImageURLByCaseSymbol', function (req, res) {
    console.log('------------------------==\n@Product/CaseImageURLByCaseSymbol');
    const mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol;
    mysqlPoolQuery(
        `SELECT p_Image1 AS ImageURL1,
                p_Image2 AS ImageURL2,
                p_Image3 AS ImageURL3,
                p_Image4 AS ImageURL4,
                p_Image5 AS ImageURL5,
                p_Image6 AS ImageURL6,
                p_Image7 AS ImageURL7,
                p_Image8 AS ImageURL8,
                p_Image9 AS ImageURL9,
                p_Image10 AS ImageURL10
         FROM   product
         WHERE  p_SYMBOL = ? `, symbol, function (err, imageURLObjectArray) {

            let imageURLObject = imageURLObjectArray[0]
            let imageURLArray = Object.values(imageURLObject)
            // imageURLArray = imageURLArray.map(imageURL => {
            //     imageURLObject = { imageURL: imageURL.replace("public/", "") }
            //     return imageURLObject
            // });

            if (err) {
                res.status(400)
                res.json({
                    "message": "照片路徑取得失敗:\n" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "照片路徑取得成功！",
                    "result": imageURLArray
                });
            }
        });
});

//Ray ...   omitted
router.get('/ProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log('------------------------==\n@Product/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    mysqlPoolQuery(qstr1, [symbol], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] 產品symbol found 取得成功！",
                "result": result
            });
        }
    });
});

router.get('/LaunchedProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log('------------------------==\n@Product/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    mysqlPoolQuery(qstr1, [symbol], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] 產品symbol found 取得成功！",
                "result": result
            });
        }
    });
});

//冠毅
router.get('/SymbolToTokenAddr', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    let symbol = req.query.tokenSymbol;

    let qstr1 = 'SELECT sc_erc721address FROM smart_contracts WHERE sc_symbol = ?';
    //console.log('qstr1', qstr1);
    mysqlPoolQuery(qstr1, [symbol], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.send({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.send({
                "message": "[Success] 產品symbol found 取得成功！",
                "result": result
            });
        }
    });
});

//回傳該使用者是否可購買token
router.get('/canBuyToken', async function (req, res) {
    const email = req.query.email;
    const symbol = req.query.symbol;
    const keys = [symbol, email];
    let mysqlPoolQuery = req.pool;
    let isServerTimeLargerThanCFSD;
    let isAssetbookContractAddressExist;
    let canBuyToken;
    const serverTime = await getTime();
    mysqlPoolQuery(
        `SELECT p_CFSD AS CFSD, 
                p_CFED AS CFED,
                u_assetbookContractAddress AS assetbookContractAddress
         FROM product , user
         WHERE p_SYMBOL = ? AND u_email = ?
         `, keys, function (err, result) {
            if (err) {
                res.status(400).send("專案狀態取得失敗:" + err);
            }
            else {
                serverTime >= Number(result[0].CFSD) && serverTime <= Number(result[0].CFED) ?
                    isServerTimeLargerThanCFSD = true :
                    isServerTimeLargerThanCFSD = false;

                result[0].assetbookContractAddress ?
                    isAssetbookContractAddressExist = true :
                    isAssetbookContractAddressExist = false;

                isServerTimeLargerThanCFSD && isAssetbookContractAddressExist ?
                    canBuyToken = true :
                    canBuyToken = false;

                // console.log(isServerTimeLargerThanCFSD)
                // console.log(isAssetbookContractAddressExist)
                // console.log(canBuyToken)

                if (!!canBuyToken) {
                    res.status(200).json({ "message": "可購買token", });
                }
                else {
                    if (!!isServerTimeLargerThanCFSD) {
                        res.status(400).send("使用者尚未通過身份驗證");
                        console.error('assetbook address is not found : ', email);
                    } else {
                        res.status(400).send("非專案開賣時間");
                        console.error('product is not funding : ', symbol);
                        console.error('check product CFED & CFSD , also check that server time is on');
                    }
                }
            }
        });
});

/* getIncomeHistoryBySymbol */
router.get('/AssetImageURLAndIconURL', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol
    const query = (queryString, keys) => {
        return new Promise((resolve, reject) => {
            mysqlPoolQuery(
                queryString,
                keys,
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    };

    let queryString = `
    SELECT  p_Image1 AS imageURL,
            p_icon AS iconURL
    FROM    product
    WHERE   p_SYMBOL = ?
    `;

    query(queryString, symbol)
        .then((URL) => {
            res.status(200);
            res.json({
                "message": "[Success] image & icon 取得成功",
                "result": URL
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] image & icon 取得失敗:\n" + err
            });
        })
});

router.get('/ProductDataBySymbol', function (req, res) {
    console.log('------------------------==\n@Product/ProductList');
    let mysqlPoolQuery = req.pool;
    const symbol = req.query.symbol;
    mysqlPoolQuery(
        `SELECT 
        p_irr AS IRR,
        p_name AS name,
        p_location AS location,
        p_pricing AS pricing,
        p_currency AS currency,
        p_totalrelease AS maxProductQuantity,
        ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken,
        SUBSTRING(p_CFSD, 1, 4) AS releaseDateYear,
        SUBSTRING(p_CFSD, 5, 2) AS releaseDateMonth,
        SUBSTRING(p_CFSD, 7, 2) AS releaseDateDate,
        SUBSTRING(p_CFSD, 9, 2) AS releaseDateHour,
        SUBSTRING(p_CFSD, 11, 2) AS releaseDateMinute,
        p_size AS size,
        p_duration AS durationInYear,
        SUBSTRING(p_CFED, 1, 4) AS deadlineYear,
        SUBSTRING(p_CFED, 5, 2) AS deadlineMonth,
        SUBSTRING(p_CFED, 7, 2) AS deadlineDate,
        SUBSTRING(p_CFED, 9, 2) AS deadlineHour,
        SUBSTRING(p_CFED, 11, 2) AS deadlineMinute,
        p_Image1 AS imageURL,
        p_TaiPowerApprovalDate AS taiPowerApprovalDate,
        p_CFSD AS CFSD,
        p_BOEApprovalDate AS BOEApprovalDate,
        p_CFED AS CFED,
        p_PVTrialOperationDate AS PVTrialOperationDate,
        p_ContractOut AS contractOut,
        p_CaseConstruction AS caseConstruction,
        p_ElectricityBilling AS electricityBilling,
        p_fundingType AS fundingType,
        p_totalrelease - IFNULL(reservedTokenCount, 0 ) AS remainTokenCount,
        IFNULL(purchasedNumberOfPeople , 0) AS purchasedNumberOfPeople,
        IFNULL(payablePeriodTotal, 0) AS payablePeriodTotal,
        p_Copywriting AS copyWritingText
        FROM product AS T1
        LEFT JOIN ( SELECT o_symbol , SUM(o_tokenCount) AS reservedTokenCount
                    FROM order_list
                    WHERE o_paymentStatus = "waiting" OR o_paymentStatus = "paid" OR o_paymentStatus = "txnFinished"
                    GROUP BY o_symbol) AS T2
        ON T1.p_SYMBOL = T2.o_symbol
        LEFT JOIN ( SELECT o_symbol , COUNT(o_email) AS purchasedNumberOfPeople
                    FROM order_list
                    GROUP BY o_symbol) AS T3
        ON T1.p_SYMBOL = T3.o_symbol
        LEFT JOIN ( SELECT ia_SYMBOL , COUNT(*)-1 AS payablePeriodTotal
                    FROM income_arrangement 
                    GROUP BY ia_SYMBOL) AS T4
        ON T1.p_SYMBOL = T4.ia_SYMBOL
        WHERE p_SYMBOL = ?;`, symbol, function (err, productArray) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "產品資訊取得失敗:\n" + err
                })
            }
            else {
                if (productArray.length > 0) {
                    res.status(200);
                    res.json({
                        "message": "產品資訊取得成功",
                        "result": productArray[0]
                    });
                } else {
                    res.status(404);
                    res.json({
                        "message": `找不到產品: ${symbol}`
                    });
                }
            }
            /* code = 304? */
        });
});

//通過文件Hash值查詢是否記錄在公鏈上
router.post('/isFileHashOnEthereum', async function (req, res) {
    var p_fileHash = req.body.p_fileHash
    // console.log(p_fileHash);
    Contract.methods.searchHash(p_fileHash).call()
    .then(function(data){
        console.log("＊＊＊:" + data)
        res.status(200);
        res.json({
            "result": data
        });
    })
});

/*sign rawtx*/
function signTx(userEthAddr, userRawPrivateKey, contractAddr, encodedData) {
    return new Promise((resolve, reject) => {
  
        web3.eth.getTransactionCount(userEthAddr, 'pending')
            .then(nonce => {
  
                let userPrivateKey = Buffer.from(userRawPrivateKey.slice(2), 'hex');
                let txParams = {
                    nonce: web3.utils.toHex(nonce),
                    gas: 7000000,//9000000,
                    gasPrice: 3000000000,//0,
                    //gasPrice: web3js.utils.toHex(20 * 1e9),
                    //gasLimit: web3.utils.toHex(3400000),
                    to: contractAddr,
                    value: 0,
                    data: encodedData
                }
  
                let tx = new Tx(txParams);
                tx.sign(userPrivateKey);
                const serializedTx = tx.serialize();
                const rawTx = '0x' + serializedTx.toString('hex');
  
                //console.log('☆ RAW TX ☆\n', rawTx);
  
                web3.eth.sendSignedTransaction(rawTx)
                    .on('transactionHash', hash => {
                        //console.log(hash);
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        // //console.log('confirmation', confirmationNumber);
                    })
                    .on('receipt', function (receipt) {
                        //console.log(receipt);
                        resolve(receipt)
                    })
                    .on('error', function (err) {
                        //console.log(err);
                        reject(err);
                    });
            });
  
    });
  }

// 將文件Hash值寫入到公鏈上(太慢)
router.get('/WriteHashtoEthereum', async function () {
    console.log("%%%");
    const encodedData = Contract.methods.sethashTable("12333333").encodeABI();
    await signTx(AccountAddress,PrivateKey,address,encodedData).catch((err) => {
        console.log(err);
        // reject('[Error @ signTx() addPlatformSupervisor()]'+ err);
        // return false;
    });
});



module.exports = router;
