var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var csv2sql = require('csv2sql-stream');
var fs = require('fs');

//撈取資料(Platform_Supervisor專用)
router.get('/Product', function(req, res, next) {
  console.log('------------------------==\n@Product/Product:\nreq.query', req.query, 'req.body', req.body);
  //   console.log("＊：" + JSON.stringify(req.session));
  var token=req.cookies.access_token;
  if (token) {
      // 驗證JWT token
      jwt.verify(token, "my_secret_key", function (err, decoded) {
        if (err) {
          //JWT token驗證失敗
          res.render('error', { message: '帳號密碼錯誤', error: '' });
          return;
        } else {
          //JWT token驗證成功
          if(decoded.payload.m_permission!="Platform_Supervisor"){
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
router.get('/ProductByFMN', function(req, res, next) {
    console.log('------------------------==\n@Product/ProductByFMN:\nreq.query', req.query, 'req.body', req.body);

    //   console.log("＊：" + JSON.stringify(req.session));
    var token=req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            JWT_decoded=decoded;
            if(decoded.payload.m_permission!="Company_FundManagerN"){
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
    mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ?', JWT_decoded.payload.m_id , function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        //獲取編輯中的產品資料
        mysqlPoolQuery('SELECT * FROM product WHERE p_fundmanager = ? AND p_state = ?', [JWT_decoded.payload.m_id , "draft"] , function(err, rows) {
            if (err) {
                console.log(err);
            }
            var dataDraft = rows;
            res.render('ProductAdministrationByFMN', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data,dataDraft:dataDraft});
        });
    });

    
});

//撈取資料(FMS專用，撈取該公司所有FMS創建的產品資料，且產品狀態為creation)
router.get('/ProductByFMS', function(req, res, next) {
    console.log('------------------------==\n@Product/ProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    //   console.log("＊：" + JSON.stringify(req.session));
    var token=req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            JWT_decoded=decoded;
            if(decoded.payload.m_permission!="Company_FundManagerS"){
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
    mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company,"creation"]  , function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company,"publish"]  , function(err, rows) {
        mysqlPoolQuery("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?)", JWT_decoded.payload.m_company , function(err, rows) {
            if (err) {
                console.log(err);
            }
            var dataPublish = rows;
            res.render('ProductAdministrationByFMS', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data,dataPublish:dataPublish});
        });


    });
    
});

//新增資料:頁面(FMN專用)
router.get('/AddProductByFMN', function(req, res, next) {
    console.log('------------------------==\n@Product/AddProductByFMN:\nreq.query', req.query, 'req.body', req.body);
    // console.log("＊：" + JSON.stringify(req.session));
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerN"){
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
  res.render('AddProductByFMN', { title: 'Add Product'});
});

//新增資料：接收資料的post(FMN專用)
router.post('/AddProductByFMN', function(req, res, next) {
    // console.log('------------------------==\n@Product/AddProductByFMN:\nreq.query', req.query, 'req.body', req.body);
    var token=req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            JWT_decoded=decoded;
            if(decoded.payload.m_permission!="Company_FundManagerN"){
                res.render('error', { message: '權限不足', error: '' });
                return;
            }
          }
        })
    }else {
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
  console.log("@@@"+req.body.p_fundingKind);
  var sql = {
      p_SYMBOL: req.body.p_SYMBOL,
      p_name: req.body.p_name,
      p_location: req.body.p_location,
      p_pricing: req.body.p_pricing,
      p_duration: req.body.p_duration,
      p_currency: req.body.p_currency,
      p_irr: req.body.p_irr,
      p_releasedate: req.body.p_releasedate,
      p_validdate: req.body.p_validdate,
      p_size: req.body.p_size,
      p_totalrelease: req.body.p_totalrelease,
      p_fundingKind:req.body.p_fundingKind,
      p_fundmanager: JWT_decoded.payload.m_id,
      p_state: "draft",   //草稿
      p_icon:req.body.p_icon,
      p_assetdocs:req.body.p_assetdocs,
      p_csvFIle:req.body.p_csvFIle,
      p_Image1:req.body.p_Image1,
      p_Image2:req.body.p_Image2,
      p_Image3:req.body.p_Image3,
      p_Image4:req.body.p_Image4,
      p_Image5:req.body.p_Image5,
      p_Image6:req.body.p_Image6,
      p_Image7:req.body.p_Image7,
      p_Image8:req.body.p_Image8,
      p_Image9:req.body.p_Image9,
      p_Image10:req.body.p_Image10,
      p_FAY:req.body.p_FAY,
      p_FTRT:req.body.p_FTRT,
      p_RPT:req.body.p_RPT,
      p_FRP:req.body.p_FRP,
      p_Timeline:req.body.p_Timeline,
      p_PSD:req.body.p_PSD,
      p_TaiPowerApprovalDate:req.body.p_TaiPowerApprovalDate,
      p_BOEApprovalDate:req.body.p_BOEApprovalDate,
      p_PVTrialOperationDate:req.body.p_PVTrialOperationDate,
      p_PVOnGridDate:req.body.p_PVOnGridDate,
      p_CFSD:req.body.p_CFSD,
      p_CFED:req.body.p_CFED
  };

 console.log(sql);

  var qur = mysqlPoolQuery('INSERT INTO product SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/Product/ProductByFMN');
  });

});

//刪除資料：獲取網址上的參數(Platform_Supervisor跟FMN都可以使用)
router.get('/DeleteProduct', function(req, res, next) {
  console.log('------------------------==\n@Product/DeleteProduct:\nreq.query', req.query, 'req.body', req.body);
  var token=req.cookies.access_token;
    var JWT_decoded;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            JWT_decoded=decoded;
            if(decoded.payload.m_permission!="Platform_Supervisor" && decoded.payload.m_permission!="Company_FundManagerN"){
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

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log(err);
        }
        if (JWT_decoded.payload.m_permission=="Platform_Supervisor"){
            res.redirect('/Product/Product');
        } else if (JWT_decoded.payload.m_permission=="Company_FundManagerN"){
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
router.get('/EditProductByFMN', function(req, res, next) {
  console.log('------------------------==\n@Product/EditProductByFMN:\nreq.query', req.query, 'req.body', req.body);
  var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerN"){
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

    mysqlPoolQuery('SELECT * FROM product WHERE p_SYMBOL = ?', symbol, function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        res.render('EditProductByFMN', { title: 'Edit Product', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫(FMN專用)
router.post('/EditProductByFMN', function(req, res, next) {
    // console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerN"){
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
        p_irr: req.body.p_irr,
        p_releasedate: req.body.p_releasedate,
        p_validdate: req.body.p_validdate,
        p_size: req.body.p_size,
        p_totalrelease: req.body.p_totalrelease,
        p_fundingKind:req.body.p_fundingKind,
        p_icon:req.body.p_icon,
        p_assetdocs:req.body.p_assetdocs,
        p_csvFIle:req.body.p_csvFIle,
        p_Image1:req.body.p_Image1,
        p_Image2:req.body.p_Image2,
        p_Image3:req.body.p_Image3,
        p_Image4:req.body.p_Image4,
        p_Image5:req.body.p_Image5,
        p_Image6:req.body.p_Image6,
        p_Image7:req.body.p_Image7,
        p_Image8:req.body.p_Image8,
        p_Image9:req.body.p_Image9,
        p_Image10:req.body.p_Image10,
        p_FAY:req.body.p_FAY,
        p_FTRT:req.body.p_FTRT,
        p_RPT:req.body.p_RPT,
        p_FRP:req.body.p_FRP,
        p_Timeline:req.body.p_Timeline,
        p_PSD:req.body.p_PSD,
        p_TaiPowerApprovalDate:req.body.p_TaiPowerApprovalDate,
        p_BOEApprovalDate:req.body.p_BOEApprovalDate,
        p_PVTrialOperationDate:req.body.p_PVTrialOperationDate,
        p_PVOnGridDate:req.body.p_PVOnGridDate,
        p_CFSD:req.body.p_CFSD,
        p_CFED:req.body.p_CFED
        // p_fundmanager: req.body.p_fundmanager,
        // p_state: req.body.p_state
    };
    // console.log("@@@：" + symbol);
    console.log("@@@：" + JSON.stringify(req.body));
    // console.log("@@@:" + JSON.stringify(sql));

    var qur = mysqlPoolQuery('UPDATE htoken.product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log("＊＊＊:"+err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMN');
    });

});

//修改資料：將產品狀態設置為creation，讓FMS可以審核(FMN專用)
router.get('/SetProductCreationByFMN', function(req, res, next) {
    // console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerN"){
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

    var qur = mysqlPoolQuery('UPDATE htoken.product SET p_state = ? WHERE p_SYMBOL = ?', ["creation", symbol], function(err, rows) {
        if (err) {
            console.log("＊＊＊:"+err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMN');
    });

});

//設置產品的狀態：將產品狀態設為publish(FMS專用)
router.get('/EditProductByFMS', function(req, res, next) {
  console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
  var token=req.cookies.access_token;
  if (token) {
      // 驗證JWT token
      jwt.verify(token, "my_secret_key", function (err, decoded) {
        if (err) {
          //JWT token驗證失敗
          res.render('error', { message: '帳號密碼錯誤', error: '' });
          return;
        } else {
          //JWT token驗證成功
          if(decoded.payload.m_permission!="Company_FundManagerS"){
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
  var currentTime=new Date().toLocaleString().toString();
  console.log(currentTime);

  var sql = {
      p_state: "publish",
      p_FMXAdate:currentTime
  };

  var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
      if (err) {
          console.log(err);
      }

      res.setHeader('Content-Type', 'application/json');
      res.redirect('/Product/ProductByFMS');
  });

});

//設置產品的狀態：將產品狀態設為draft(FMS專用)
router.get('/SetProductDraftByFMS', function(req, res, next) {
    console.log('------------------------==\n@Product/EditProductByFMS:\nreq.query', req.query, 'req.body', req.body);
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerS"){
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
        p_FMXAdate:""
    };
  
    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log(err);
        }
  
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMS');
    });
  
});

//設置產品的狀態：將產品狀態設為退回creation，或設置為funding(Platform Supervisor專用)
router.get('/EditProductByPlatformSupervisor', function(req, res, next) {
  console.log('------------------------==\n@Product/EditProductByPlatformSupervisor:\nreq.query', req.query, 'req.body', req.body);
  var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Platform_Supervisor"){
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
    var currentTime=new Date().toLocaleString().toString();
    if(State=="creation"){
        //假如是被退回，就將審核時間清空
        currentTime="";
    }

    var sql = {
        p_state: State,
        p_PAdate:currentTime
    };

    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
    });

});

//設置產品的狀態：將產品狀態設為退回creation，或設置為funding(Platform Supervisor專用)
router.post('/SetProductStateByPlatformSupervisor', function(req, res, next) {
    console.log('------------------------==\n@Product/EditProductByPlatformSupervisor:\nreq.query', req.query, 'req.body', req.body);
  
      var mysqlPoolQuery = req.pool;
      var symbol = req.body.tokenSymbol;
      var State = req.body.tokenState;
  
      //獲取當前時間作為PA通過審核的時間
      //範例：1/30/2019, 3:23:19 PM
      var currentTime=new Date().toLocaleString().toString();
      if(State=="creation"){
          //假如是被退回，就將審核時間清空
          currentTime="";
      }
  
      var sql = {
          p_state: State,
          p_PAdate:currentTime
      };
  
      var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          }else{
            res.send({status:"true"});
          }
          
      });
  
});

//設置產品的p_FMSNote並將產品狀態設為draft(FMS專用)
router.get('/SetFMSNoteAndReturnByFMS', function(req, res, next) {
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            if(decoded.payload.m_permission!="Company_FundManagerS"){
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
        p_FMXAdate:"",
        p_FMSNote:note
    };
  
    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log(err);
        }
  
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/ProductByFMS');
    });
  
});

//設置產品的p_PANote並將產品狀態設為creation(Platform Supervisor專用)
router.get('/SetPANoteAndReturnByPA', function(req, res, next) {
    var token=req.cookies.access_token;
    if (token) {
        // 驗證JWT token
        jwt.verify(token, "my_secret_key", function (err, decoded) {
          if (err) {
            //JWT token驗證失敗
            res.render('error', { message: '帳號密碼錯誤', error: '' });
            return;
          } else {
            //JWT token驗證成功
            console.log("＠＠＠＠＠＠：" + decoded.payload.m_permission);
            if(decoded.payload.m_permission!="Platform_Supervisor"){
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
        p_FMXAdate:"",
        p_PANote:note
    };
  
    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
        if (err) {
            console.log(err);
        }
  
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/BackendUser_Platform_Supervisor');
    });
  
});

//設置產品的p_PANote並將產品狀態設為creation(Platform Supervisor專用)
router.post('/SetAbortedReasonByPA', function(req, res, next) {
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
        p_abortedReason:AbortedReason
    };
  
    var qur = mysqlPoolQuery('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, symbol], function(err, rows) {
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
router.post('/IncomeCSV', function(req, res, next) {
    var IncomeCSVFilePath = "./" + req.body.IncomeCSVFilePath;
    console.log(IncomeCSVFilePath);
    if(IncomeCSVFilePath.indexOf(".csv")!=-1){
        // 將csv轉換成sql語句
        csv2sql.transform("income_arrangement",fs.createReadStream(IncomeCSVFilePath))
        .on('data',function(sql){
            //console.log(sql);
            var mysqlPoolQuery = req.pool;
            var qur = mysqlPoolQuery(sql, function(err, rows) {
                if (err) {
                    console.log(err);
                }else{
                    res.status(200);
                    res.send({
                        "messageForDeveloper": "IncomeCSV文件寫入資料庫成功",
                        "messageForUser": ""
                    });
                }
            });

        })
        .on('end',function(rows){
            // console.log(rows); // 5 - Num of rows handled, including header
        })
        .on('error', function(error){
            console.error(error); //Handle error
        })
    }else{
        res.status(200);
        res.send({
            "messageForDeveloper": "沒有CSV文件",
            "messageForUser": ""
        });
    }

});

//有容
router.get('/ProductList', function (req, res) {
  console.log('------------------------==\n@Product/ProductList');
  let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT * FROM product', function (err, result) {
        if (err) {
            res.status(400)
            res.json({
                "message": "產品列表取得失敗:\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "產品列表取得成功！",
                "result": result
            });
        }
        /* code = 304? */
    });
});

router.get('/LaunchedProductList', function (req, res) {
    console.log('------------------------==\n@Product/ProductList');
    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery(
        `SELECT p_irr AS IRR,
                p_name AS name,
                p_location AS location,
                p_SYMBOL AS symbol,
                p_pricing AS pricing,
                p_currency AS currency,
                p_totalrelease AS maxProductQuantity,
                ROUND(p_pricing * p_irr * 0.01, 0) AS astimatedIncomePerToken
       FROM product 
       WHERE p_state = \'publish\'`, function (err, productArray) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "產品列表取得失敗:\n" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "產品列表取得成功！",
                    "result": productArray
                });
            }
            /* code = 304? */
        });
});


//Ray ... htoken.  omitted
router.get('/ProductBySymbol', function (req, res, next) {
    var mysqlPoolQuery = req.pool;
    console.log('------------------------==\n@Product/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {
        symbol = req.body.symbol;
    } else { symbol = req.query.symbol; }
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM htoken.product WHERE p_SYMBOL = ?';
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

    let qstr1 = 'SELECT * FROM htoken.product WHERE p_SYMBOL = ?';
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

    let qstr1 = 'SELECT sc_erc721address FROM htoken.smart_contracts WHERE sc_symbol = ?';
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


module.exports = router;
