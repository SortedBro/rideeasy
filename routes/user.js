const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/dashboard',        isLoggedIn, ctrl.getDashboard);
router.get('/bookings',         isLoggedIn, ctrl.getBookings);
router.get('/profile',          isLoggedIn, ctrl.getProfile);
router.post('/profile/update',  isLoggedIn, ctrl.updateProfile);
router.post('/profile/password',isLoggedIn, ctrl.changePassword);

module.exports = router;
