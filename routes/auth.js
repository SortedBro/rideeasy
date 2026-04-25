const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

router.get('/register',    redirectIfLoggedIn, ctrl.getRegister);
router.post('/register',   redirectIfLoggedIn, ctrl.postRegister);
router.get('/verify-otp',  ctrl.getVerifyOTP);
router.post('/verify-otp', ctrl.postVerifyOTP);
router.get('/login',       redirectIfLoggedIn, ctrl.getLogin);
router.post('/login',      redirectIfLoggedIn, ctrl.postLogin);
router.post('/send-otp',   ctrl.postSendLoginOTP);
router.get('/logout',      ctrl.logout);

module.exports = router;
