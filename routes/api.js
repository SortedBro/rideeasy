const express = require('express');
const router  = express.Router();
const Bike    = require('../models/Bike');
const Booking = require('../models/Booking');

// ── Check bike availability ───────────────────────────────────────────────────
router.get('/availability/:bikeId', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.json({ available: false, message: 'Dates required' });

    const startDate = new Date(start);
    const endDate   = new Date(end);

    const conflict = await Booking.findOne({
      bike: req.params.bikeId,
      status: { $in: ['confirmed','active'] },
      $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }]
    });

    res.json({ available: !conflict });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Search bikes ──────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const bikes = await Bike.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } }
      ],
      availability: true
    }).select('name type city pricePerDay images avgRating').limit(10);
    res.json(bikes);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Cities list ───────────────────────────────────────────────────────────────
router.get('/cities', async (req, res) => {
  const cities = await Bike.distinct('city');
  res.json(cities);
});

module.exports = router;
