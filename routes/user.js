var express = require('express');
var router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');

/* email sender */
const nodemailer = require('nodemailer');

/* sign with default (HMAC SHA256) */
const jwt = require('jsonwebtoken')

/* images management */
var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/ID/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })
// .single('image');
// const images = [
//     { name: 'front' },
//     { name: 'back' }
// ]

// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* 登入 */
router.post('/signIn', function (req, res) {
    // console.log('sign in')
    console.log(req.body)

    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('SELECT u_email,u_eth_add FROM user WHERE u_email = \'' + req.body.email + '\'', function (err) {
        let data = {
            email: result.email,
            address: result.address,
        }
        /* 登入有效時間24小時 */
        let time = {
            expiresIn: '24h'
        }
        result.token = jwt.sign(data, 'secret', time)

        console.log(result)
        res.json(result)
    })

})

/* 寄送註冊表單 */
router.post('/user_information', function (req, res) {
    console.log(req.files)

    let mysqlPoolQuery = req.pool;
    let insertData = {
        u_email: req.body.email,
        u_salt: req.body.salt,
        u_password_hash: req.body.password_hash,
        u_cellphone: req.body.phone_number,
        u_eth_add: req.body.eth_account,
        u_name: req.body.user_name,
        u_verify_status: req.body.verify_status,
        u_imagef: req.body.imageURLF,
        u_imageb: req.body.imageURLB,
    };

    let query = mysqlPoolQuery('INSERT INTO user SET ?', insertData, function (err) {
        if (err) {
            res.status(400)
            res.json({
                "message": "新增帳戶失敗:" + err
            })
        }
        else {
            res.status(200);
            // res.set({
            //     'Content-Type': 'application/json',
            //     'Access-Control-Allow-Origin': '*'
            // });
            res.json({
                "message": "新增帳戶成功！"
            });
        }
    });
});

//寄驗證信
router.post('/send_email', function (req, res) {
    let email = req.body.email
    var transporter = nodemailer.createTransport({
        /* Helium */
        host: 'server239.web-hosting.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "user3@heliumcryptic.club",
            pass: "n{#K](MG.Orc"
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: ' <user3@heliumcryptic.club>', // sender address
        to: email, // list of receivers
        subject: '帳號註冊驗證信', // Subject line
        text: '請點以下連結以完成驗證： http://140.119.101.130:3000/user/verify_email?email=' + email, // plain text body
        // text: '請點以下連結以完成驗證： http://140.119.101.130:8000/user/verify_email?email=' + email, // plain text body
        // html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(400)
            res.json({
                "message": "驗證信寄送失敗：" + err
            })
        }
        else {
            res.status(200);
            res.json({
                "message": "驗證信寄送成功： "
            })
        }
        // console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
})

//驗證信連結
router.get('/verify_email', function (req, res) {
    var email = req.query.email

    let mysqlPoolQuery = req.pool;
    mysqlPoolQuery('UPDATE user SET u_verify_status = 1 WHERE u_email = \'' + email + '\'', function (err) {
        if (err) {
            res.sendFile(path.join(__dirname + '/verify_fail.html'));
            //edit page at /routes/verify_fail.html
        }
        else {
            res.sendFile(path.join(__dirname + '/verify_success.html'));
            //edit page at /routes/verify_success.html
        }
        /* code = 304? */
    });
});


/* test post image function */
router.post('/post_image', upload.single('image'), function (req, res) {
    let mysqlPoolQuery = req.pool;
    var email = req.body.email
    var imageLocation = req.body.imageLocation

    if (req.body.front_back == "front") {
        mysqlPoolQuery('UPDATE user SET u_imagef =\'' + imageLocation + '\'' + 'WHERE u_email = \'' + email + '\'', function (err) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "新增照片地址失敗:" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "新增照片地址成功！"
                });
            }
        });
    } else {
        mysqlPoolQuery('UPDATE user SET u_imageb =\'' + imageLocation + '\'' + 'WHERE u_email = \'' + email + '\'', function (err) {
            if (err) {
                res.status(400)
                res.json({
                    "message": "新增照片地址失敗:" + err
                })
            }
            else {
                res.status(200);
                res.json({
                    "message": "新增照片地址成功！"
                });
            }
        });
    }

    /* error handling for image upload*/
    // upload(req, res, function (err) {
    //     if (err instanceof multer.MulterError) {
    //         console.log('照片上傳發生錯誤：' + err)
    //     } else if (err) {
    //         console.log('照片上傳發生錯誤：' + err)
    //     }
    //     console.log('照片上傳成功！')
    // });
});

//-----------------------==
//http://140.119.101.130:3000/user/POST/AddUser
router.post('/AddUser', function (req, res, next) {
    console.log('------------------------==\n@user/POST/AddUser');
    const qstr1 = 'INSERT INTO htoken.user SET ?';
    var mysqlPoolQuery = req.pool;

    console.log('req.query', req.query, 'req.body', req.body);
    let user;
    if (req.body.email) {
        user = req.body;
    } else { user = req.query; }//Object.keys(user).length === 0 && user.constructor === Object
    console.log('user', user);

    const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
    //Generate a salt and hash on separate function calls.
    //each password that we hash is going to have a unique salt and a unique hash. As we learned before, this helps us mitigate greatly rainbow table attacks.
    bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            console.log(`Salt: ${salt}`);
            return bcrypt.hash(user.password, salt);
        })
        .then(hash => {
            console.log(`Hash: ${hash}`);
            let userNew = {
                u_email: user.email,
                u_salt: 0,
                u_password_hash: hash,
                u_identityNumber: user.nationalId,
                u_imagef: user.imageURLF,
                u_imageb: user.imageURLB,
                u_eth_add: '0x'+Math.random().toString(36).substring(2, 15),
                u_verify_status: user.verify_status,
                u_cellphone: user.phone,
                u_name: user.name,
            };//Math.random().toString(36).substring(2, 15)

            console.log(userNew);
            var qur = mysqlPoolQuery(qstr1, userNew, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] Failure :\n" + err,
                        "success": false,
                    });
                } else {
                    res.status(200);
                    res.json({
                        "message": "[Success] Success",
                        "result": result,
                        "success": true,
                    });
                }
            });

        })
        .catch(err => console.error(err.message));

});


//http://140.119.101.130:3000/user/Get/UserByUserId
router.get('/UserByUserId', function (req, res, next) {
    console.log('------------------------==\n@Order/GET/UserByUserId');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_eth_add = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let status, userId, qstrz;
    if (req.body.userId) {
        userId = req.body.userId;
    } else { userId = req.query.userId; }
    var qur = mysqlPoolQuery(qstr1, userId, function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] Failure :\n" + err,
                "success": false,
            });
        } else {
            res.status(200);
            res.json({
                "message": "[Success] Success",
                "result": result,
                "success": true,
            });
        }
    });
});



//http://140.119.101.130:3000/user/Get/UserLogin
router.get('/UserLogin', function (req, res, next) {
    console.log('------------------------==\n@Order/GET/UserLogin');
    let qstr1 = 'SELECT * FROM htoken.user WHERE u_email = ?';
    var mysqlPoolQuery = req.pool;
    console.log('req.query', req.query, 'req.body', req.body);
    let email, password;
    if (req.body.email) {
        email = req.body.email; password = req.body.password;
    } else { email = req.query.email; password = req.query.password; }

    var qur = mysqlPoolQuery(qstr1, email, function (err, result) {
        if (err) {
            console.log(err);
            res.status(400);
            res.json({
                "message": "[Error] db to/from DB :\n" + err,
                "success": false
            });
        } else {
            res.status(200);
            if (result.length === 0) {
                res.json({
                    "message": "[Error] email Not found",
                    "result": result,
                    "success": false
                });
            } else if (result.length === 1) {
                console.log("1 email is found", result);
                const timeLogin = Date.now() / 1000 | 0;//new Date().getTime();
                const timeExpiry = timeLogin + 60 * 60;
                console.log('timeLogin', timeLogin, 'timeExpiry', timeExpiry);

                bcrypt
                    .compare(password, result[0].u_password_hash)
                    .then(compareResult => {
                        console.log(compareResult);
                        if (compareResult) {
                            const user = result[0];

                            var data = {
                                u_email: result[0].u_email,
                                u_identityNumber: result[0].u_identityNumber
                            };
                            time = {
                                expiresIn: '24h'
                            };
                            token = jwt.sign(data, 'privatekey', time);

                            // token = jwt.sign({ user, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'privatekey');
                            // console.log("＊＊JWT token:" + token);
                            // var decoded = jwt.verify(token, 'privatekey');
                            // console.log("＊@Decoded：" + JSON.stringify(decoded));
                            res.json({
                                "message": "[Success] password is correct",
                                "result": result,
                                "success": true,
                                "expiry": timeExpiry,
                                "jwt": token
                            });

                        } else {
                            res.json({
                                "message": "[Not Valid] password is not correct",
                                "result": result,
                                "success": false
                            });
                        }
                    }).catch(err => console.error('Error at compare password & pwHash', err.message));

            } else {
                res.json({
                    "message": "[Error] Duplicate Entries are found",
                    "result": result,
                    "success": false
                });
            }

        }
    });
});

// 獲取Endorser
router.get('/GetEndorser',function(req, res, next) {
    var token=req.query.JWT_Token;
      if (token) {
          // 驗證JWT token
          jwt.verify(token, "privatekey",function (err, decoded) {
            if (err) {
              //JWT token驗證失敗
              console.log("＊:JWT token驗證失敗");
              console.log(err);
              res.json({
                  "message": "JWT token is invalid.",
                  "success": false
              });
              return;
            } else {
              //JWT token驗證成功
              console.log("＊JWT Content:" + decoded.u_email);
              //查詢Endorser Email  
              let mysqlPoolQuery = req.pool;
              let query = mysqlPoolQuery('SELECT u_endorser1,u_endorser2,u_endorser3 FROM htoken.user WHERE u_email = ?', decoded.u_email , function (err,result) {
                if (err) {
                    console.log("查詢endorser失敗:" + err);
                    console.log(err);
                    res.status(400);
                    res.json({
                        "message": "[Error] Failure :\n" + err,
                        "success": false,
                    });
                }
                else {
                    console.log("查詢endorser成功:");
                    res.status(200);
                    res.json({
                        "message": "[Success] Success",
                        "result": result,
                        "success": true,
                    });
                }
              });
            }
          })
      }else {
          //不存在JWT token
          console.log("＊:不存在JWT token");
          res.json({
              "message": "No JWT Token.Please login.",
              "success": false
          });
          return;
      }

});

// 編輯Endorser
router.post('/EditEndorser', function (req, res, next) {
    // console.log('------------------------==\n@user/POST/EditEndorser');
    // console.log(req.body.EndorserEmail1);
    // console.log(req.body.EndorserEmail2);
    // console.log(req.body.EndorserEmail3);
    // console.log("＊＊＊＊" + req.body.userEmail);
    
    userEmail=req.body.userEmail;
    EndorserEmail1=req.body.EndorserEmail1;
    EndorserEmail2=req.body.EndorserEmail2;
    EndorserEmail3=req.body.EndorserEmail3;

    var mysqlPoolQuery = req.pool;
    const queryUserByEmail = email => {
        return new Promise((resolve, reject) => {
            // 如果使用者有填寫Endorser Email
            if(email!="" && email!=null){
                mysqlPoolQuery(
                    'SELECT * FROM htoken.user WHERE u_email = ? ;',
                    email,
                    (err, rows, fields) => {
                    //   console.log(rows);
                      if (err) reject(err);
                      else resolve(rows);
                    }
                  );
            // 如果使用者沒填寫
            }else{
                // 隨便傳回一個長度為2的字串，代表使用者沒填寫
                resolve("11");
            }
        });
    };

    // 用來保存搜尋結果，1代表Endorser Email存在資料庫，0代表不存在，2代表使用者沒填寫
    var data = [];
    // 檢查EndorserEmail1是否存在資料庫，存在則寫入該使用者的EndorserEmail1
    queryUserByEmail(EndorserEmail1)
    .then(results => {
    //   console.log(results.length);
      data.push(results.length);   

      //假如EndorserEmail1存在資料庫
      if(results.length==1 || results.length==2){
        //寫入該使用者的EndorserEmail
        //假如使用者沒填寫，就清空該endorser email
        let mysqlPoolQuery = req.pool;
        let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser1 = ? WHERE u_email = ?', [EndorserEmail1 , userEmail] , function (err) {
          if (err) {
              console.log("寫入EndorserEmail1失敗:" + err);
          }
          else {
              console.log("寫入EndorserEmail1成功:");
          }
        });
      }

      return queryUserByEmail(EndorserEmail2);
    })
    .then(results => {
        // console.log(results.length);
        data.push(results.length);      
        
        //假如EndorserEmail2存在資料庫
        if(results.length==1 || results.length==2){
          //寫入該使用者的EndorserEmail
          //假如使用者沒填寫，就清空該endorser email
          let mysqlPoolQuery = req.pool;
          let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser2 = ? WHERE u_email = ?', [EndorserEmail2 , userEmail] , function (err) {
            if (err) {
                console.log("寫入EndorserEmail2失敗:" + err);
            }
            else {
                console.log("寫入EndorserEmail2成功:");
            }
          });
        }

        return queryUserByEmail(EndorserEmail3);
    })
    .then(results => {
        // console.log(results.length);
        data.push(results.length);      
        
        //假如EndorserEmail3存在資料庫
        if(results.length==1 || results.length==2){
          //寫入該使用者的EndorserEmail
          //假如使用者沒填寫，就清空該endorser email
          let mysqlPoolQuery = req.pool;
          let query = mysqlPoolQuery('UPDATE htoken.user SET u_endorser3 = ? WHERE u_email = ?', [EndorserEmail3 , userEmail] , function (err) {
            if (err) {
                console.log("寫入EndorserEmail3失敗:" + err);
            }
            else {
                console.log("寫入EndorserEmail3成功:");
            }
          });
        }

        res.status(200);
        res.json({
            "message": "[Success] Success",
            "result": data,
            "success": true,
        });
    })
    .catch(err => {
        console.log(err);
        res.status(400);
        res.json({
            "message": "[Error] Failure :\n" + err,
            "success": false,
        });
    });

});


module.exports = router;
/**
    function bcryptHash(pw) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;//DON"T SET THIS TOO BIG!!!
        const myPlaintextPassword = '1111';
        const someOtherPlaintextPassword = '1112';

        bcrypt
        .hash(pw, saltRounds)
        .then(hash => {
            console.log(`Hash: ${hash}`);
            return hash;
            // Store hash in your password DB.
        })
        .catch(err => console.error('[Error@bcryptHash]',err.message));
    }
 */