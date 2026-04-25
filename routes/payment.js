const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paymentController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/checkout/:bookingId',    isLoggedIn, ctrl.getCheckout);
router.post('/create-order/:bookingId', isLoggedIn, ctrl.createOrder);
router.post('/verify',                isLoggedIn, ctrl.verifyPayment);
router.post('/cod/:bookingId',        isLoggedIn, ctrl.codPayment);

module.exports = router;
