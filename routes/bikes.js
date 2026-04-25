const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bikeController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/',           ctrl.listBikes);
router.get('/:id',        ctrl.getBike);
router.post('/:id/review', isLoggedIn, ctrl.postReview);

module.exports = router;
