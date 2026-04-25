const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bookingController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/new/:bikeId',  isLoggedIn, ctrl.getBookingForm);
router.post('/create',      isLoggedIn, ctrl.createBooking);
router.get('/:id',          isLoggedIn, ctrl.getBooking);
router.post('/:id/cancel',  isLoggedIn, ctrl.cancelBooking);

module.exports = router;
