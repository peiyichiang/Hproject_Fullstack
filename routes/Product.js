var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//撈取資料(Platform_Auditor專用)
router.get('/GET/Product', function(req, res, next) {

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
        if(decoded.payload.m_permission!="Platform_Auditor"){
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

// if(req.session.m_permission!="Platform_Auditor"){
//     res.render('error', { message: '權限不足', error: '' });
//     return;
// }

  var db = req.con;
  var data = "";

  db.query('SELECT * FROM product', function(err, rows) {
      if (err) {
          console.log(err);
      }
      var data = rows;

      // use index.ejs
      res.render('ProductAdministrationByPlatformAuditor', { title: 'Product Information', data: data});
  });

});

//撈取資料(FMN專用，只撈取自己創建的產品資料，且產品狀態為creation)
router.get('/GET/ProductByFMN', function(req, res, next) {

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
    
      var db = req.con;
      var data = "";
    
      db.query('SELECT * FROM product WHERE p_fundmanager = ? AND p_state = ?', [JWT_decoded.payload.m_id , "creation"] , function(err, rows) {
    //db.query('SELECT * FROM product WHERE p_SYMBOL = ?', SYMBOL, function(err, rows) {
          if (err) {
              console.log(err);
          }
          var data = rows;
    
          // use index.ejs
          res.render('ProductAdministrationByFMN', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data});
      });
    
});

//撈取資料(FMA專用，撈取該公司所有FMA創建的產品資料，且產品狀態為creation)
router.get('/GET/ProductByFMA', function(req, res, next) {

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
            if(decoded.payload.m_permission!="Company_FundManagerA"){
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
    
    // if(req.session.m_permission!="Company_FundManagerA"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
    
      var db = req.con;
      var data = "";
    //   SELECT * FROM htoken.product, backend_user WHERE (backend_user.m_id = product.p_fundmanager AND backend_user.m_company = 'NTU');
      db.query("SELECT * FROM product WHERE p_fundmanager IN (SELECT m_id FROM  backend_user WHERE m_company = ?) AND p_state = ?", [JWT_decoded.payload.m_company,"creation"]  , function(err, rows) {
    //db.query('SELECT * FROM product WHERE p_SYMBOL = ?', SYMBOL, function(err, rows) {
          if (err) {
              console.log(err);
          }
          var data = rows;
        //   console.log(rows);
          // use index.ejs
          res.render('ProductAdministrationByFMA', { title: 'Product Information', UserID:JWT_decoded.payload.m_id, data: data});
      });
    
});

//新增資料:頁面(Platform_Auditor專用)
router.get('/GET/AddProduct', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor"){
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
    
    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
  // use userAdd.ejs
  res.render('AddProduct', { title: 'Add Product'});
});

//新增資料:頁面(FMN專用)
router.get('/GET/AddProductByFMN', function(req, res, next) {
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
  // use userAdd.ejs
  res.render('AddProductByFMN', { title: 'Add Product'});
});

//新增資料：接收資料的post(Platform_Auditor專用)
router.post('/POST/AddProduct', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor"){
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
    
    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }
  var db = req.con;
    
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
      p_fundmanager: req.body.p_fundmanager,
      p_state: req.body.p_state,
      p_icon:req.body.p_icon,
      p_assetdocs:req.body.p_assetdocs
  };

 console.log(sql);

  var qur = db.query('INSERT INTO product SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/Product/GET/Product');
  });

});

//新增資料：接收資料的post(FMN專用)
router.post('/POST/AddProductByFMN', function(req, res, next) {
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
  var db = req.con;

  //因為是FMN新增的產品資料，所以狀態永遠是creation
  //新增該產品資了的Fund Manager則是用存在session中的帳號資料
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
      p_fundmanager: JWT_decoded.payload.m_id,
      p_state: "creation",
      p_icon:req.body.p_icon,
      p_assetdocs:req.body.p_assetdocs
  };

 console.log(sql);

  var qur = db.query('INSERT INTO product SET ?', sql, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/Product/GET/ProductByFMN');
  });

});

//刪除資料：獲取網址上的參數(Platform_Auditor跟FMN都可以使用)
router.get('/GET/DeleteProduct', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor" && decoded.payload.m_permission!="Company_FundManagerN"){
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
    
    // console.log("*:"+req.session.m_permission);
    // if(req.session.m_permission!="Platform_Auditor" && req.session.m_permission!="Company_FundManagerN"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var SYMBOL = req.query.SYMBOL;
    var db = req.con;
  
    var qur = db.query('DELETE FROM product WHERE p_SYMBOL = ?', SYMBOL, function(err, rows) {
        if (err) {
            console.log(err);
        }
        if(JWT_decoded.payload.m_permission=="Platform_Auditor"){
            res.redirect('/Product/GET/Product');
        }else if(JWT_decoded.payload.m_permission=="Company_FundManagerN"){
            res.redirect('/Product/GET/ProductByFMN');
        }
        
    });
});

//修改資料：撈取原有資料到修改頁面(Platform_Auditor專用)
router.get('/GET/EditProduct', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor"){
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
    
    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }


    var SYMBOL = req.query.SYMBOL;
    var db = req.con;
    var data = "";

    db.query('SELECT * FROM product WHERE p_SYMBOL = ?', SYMBOL, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditProduct', { title: 'Edit Product', data: data });
    });
});

//修改資料：撈取原有資料到修改頁面(FMN專用)
router.get('/GET/EditProductByFMN', function(req, res, next) {
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


    var SYMBOL = req.query.SYMBOL;
    var db = req.con;
    var data = "";

    db.query('SELECT * FROM product WHERE p_SYMBOL = ?', SYMBOL, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('EditProductByFMN', { title: 'Edit Product', data: data });
    });
});

//修改資料：將修改後的資料傳到資料庫(Platform_Auditor專用)
router.post('/POST/EditProduct', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor"){
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
    
    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var db = req.con;
    var SYMBOL = req.body.p_SYMBOL;

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
        p_fundmanager: req.body.p_fundmanager,
        p_state: req.body.p_state
    };

    var qur = db.query('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, SYMBOL], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/Product');
    });

});

// ok
//修改資料：將修改後的資料傳到資料庫(FMN專用)
router.post('/POST/EditProductByFMN', function(req, res, next) {
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

    var db = req.con;
    var SYMBOL = req.body.p_SYMBOL;

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
        p_icon:req.body.p_icon,
        p_assetdocs:req.body.p_assetdocs
        // p_fundmanager: req.body.p_fundmanager,
        // p_state: req.body.p_state
    };

    var qur = db.query('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, SYMBOL], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/ProductByFMN');
    });

});

//修改資料：publish(FMA專用)
router.get('/GET/EditProductByFMA', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Company_FundManagerA"){
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
    
    // if(req.session.m_permission!="Company_FundManagerA"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var db = req.con;
    var SYMBOL = req.query.SYMBOL;

    var sql = {
        p_state: "publish"
    };

    var qur = db.query('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, SYMBOL], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/Product/GET/ProductByFMA');
    });

});

//設置產品的狀態：將產品狀態退回creation，或設置為funding跟archive(Platform Auditor專用)
router.get('/GET/EditProductByPlatformAuditor', function(req, res, next) {
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
            if(decoded.payload.m_permission!="Platform_Auditor"){
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
    
    // if(req.session.m_permission!="Platform_Auditor"){
    //     res.render('error', { message: '權限不足', error: '' });
    //     return;
    // }

    var db = req.con;
    var SYMBOL = req.query.SYMBOL;
    var State = req.query.State;
    // console.log("＊:"+JSON.stringify(SYMBOL));
    // console.log("＊:"+JSON.stringify(State));
    var sql = {
        p_state: State
    };

    var qur = db.query('UPDATE product SET ? WHERE p_SYMBOL = ?', [sql, SYMBOL], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/BackendUser/GET/BackendUser_Platform_Auditor');
    });

});



//有容
router.get('/productList', function (req, res) {
    let db = req.con;
    db.query('SELECT * FROM product', function (err , result) {
        if (err) {
            res.status(400)
            res.json({
                "message": "產品列表取得失敗:\n" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message" : "產品列表取得成功！",
                "result" : result
            });
        }
        /* code = 304? */
    });
});

//Ray ... htoken.  omitted
router.get('/Get/ProductBySymbol', function(req, res, next) {
    var db = req.con;
    //console.log('req', req);
    console.log('------------------------==\n@Product/Get/ProductBySymbol:\nreq.query', req.query, 'req.body', req.body);
    let symbol; const status = 'na';
    if (req.body.symbol) {symbol = req.body.symbol;
    } else {symbol = req.query.symbol;}
    //console.log('symbol', symbol);

    let qstr1 = 'SELECT * FROM htoken.product WHERE p_SYMBOL = ?';
    //console.log('qstr1', qstr1);
    db.query(qstr1, [symbol], function(err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] 產品symbol not found 取得失敗:\n" + err
            });
        } else {
            res.status(200);
            res.json({
                "message" : "[Success] 產品symbol found 取得成功！",
                "result" : result
            });
        }
    });
});

module.exports = router;
