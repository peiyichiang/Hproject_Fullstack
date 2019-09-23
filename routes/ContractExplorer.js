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

router.get('/assetbook', function (req, res, next) {
  res.render('assetbook', {contractType: 'Assetbook'});
});

router.get('/registry', function (req, res, next) {
  res.render('registry', {contractType: 'Registry'});
});

router.get('/helium', function (req, res, next) {
  res.render('helium', {contractType: 'Helium'});
});

module.exports = router;
