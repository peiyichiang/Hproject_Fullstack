var express = require('express');
//var jwt = require('jsonwebtoken');
var router = express.Router();


router.get('/crowdfunding', function (req, res, next) {
  res.render('crowdfunding', {contractType: 'Crowdfunding'});
});

router.get('/tokenController', function (req, res, next) {
  res.render('tokenController', {contractType: 'TokenController'});
});

router.get('/tokenHCAT', function (req, res, next) {
  res.render('tokenHCAT', {contractType: 'TokenHCAT'});
});

router.get('/incomeManager', function (req, res, next) {
  res.render('incomeManager', {contractType: 'IncomeManager'});
});

module.exports = router;
