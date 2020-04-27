var express = require('express');
var router = express.Router();

 
// router.use('/User', require('./User.js'));
router.use('/Product', require('./Product.js'));
router.use('/AssetManagement', require('./AssetManagement.js'));
router.use('/Login',require('./Login.js'));
router.use('/Order',require('./Order.js'));
// router.use('/Payment', require('./Payment.js'));
// router.use('/IncomeManagement', require('./IncomeManagement.js'));
 
module.exports = router;