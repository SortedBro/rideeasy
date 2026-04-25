const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// Multer config for bike images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g,''))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

router.get('/dashboard',              isAdmin, ctrl.getDashboard);
router.get('/bikes',                  isAdmin, ctrl.getBikes);
router.get('/bikes/add',              isAdmin, ctrl.getAddBike);
router.post('/bikes/add',             isAdmin, upload.array('images', 5), ctrl.postAddBike);
router.get('/bikes/:id/edit',         isAdmin, ctrl.getEditBike);
router.post('/bikes/:id/edit',        isAdmin, upload.array('images', 5), ctrl.postEditBike);
router.post('/bikes/:id/delete',      isAdmin, ctrl.deleteBike);
router.get('/bookings',               isAdmin, ctrl.getBookings);
router.post('/bookings/:id/status',   isAdmin, ctrl.updateBookingStatus);
router.get('/users',                  isAdmin, ctrl.getUsers);
router.get('/contacts',               isAdmin, ctrl.getContacts);
router.post('/contacts/:id/replied',  isAdmin, ctrl.markContactReplied);

module.exports = router;
