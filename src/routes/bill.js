const express = require('express');
const router = express.Router();
const {
  createPayment,
  handlePaymentResult,
  checkStatus,
} = require('../controllers/bill');

router.post('/create-payment', createPayment);
router.post('/payment-result', handlePaymentResult);
router.get('/payment-status/:orderID', checkStatus);

module.exports = {
  billRouter: router,
};
