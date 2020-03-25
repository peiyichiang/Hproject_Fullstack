var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require('async');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { getTimeServerTime } = require('../../../timeserver/utilities');

router.post('/a', function (req, res) {
    name = req.body.name;
    async.waterfall([
        function(callback) {
            callback(null, jwt.sign({usr_name: name},process.env.JWT_PRIVATEKEY, { expiresIn: 60 }))
        },
        function(data, callback) {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
            res.status(302).json(data);
        }
    ])
})

router.use(function (req, res, next) {
    
    var token = req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, process.env.JWT_PRIVATEKEY, function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
            req.decoded = decoded;
            next();
        }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

router.get('/b', function (req, res) {
    res.json({message: 'Welcome to the APIs',token_playload: req.decoded, usr_name: req.decoded.usr_name});
})
module.exports = router;