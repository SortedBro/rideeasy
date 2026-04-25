const Bike    = require('../models/Bike');
const Booking = require('../models/Booking');

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Jaipur','Goa','Manali'];

// ── Public: list / filter bikes ───────────────────────────────────────────────
exports.listBikes = async (req, res) => {
  try {
    const { type, city, minPrice, maxPrice, available, sort, q } = req.query;
    const filter = {};
    if (type)      filter.type       = type;
    if (city)      filter.city       = city;
    if (available) filter.availability = available === 'true';
    if (q)         filter.name       = { $regex: q, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    let sortObj = {};
    if (sort === 'price_asc')   sortObj = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortObj = { pricePerDay: -1 };
    else if (sort === 'rating')     sortObj = { avgRating: -1 };
    else sortObj = { createdAt: -1 };

    const bikes = await Bike.find(filter).sort(sortObj);
    res.render('bikes/list', { title: 'Browse Bikes', bikes, query: req.query, cities: CITIES });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/');
  }
};

// ── Public: single bike detail ────────────────────────────────────────────────
exports.getBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!bike) { req.flash('error', 'Bike not found'); return res.redirect('/bikes'); }

    // Check existing bookings to block dates
    const bookings = await Booking.find({ bike: bike._id, status: { $in: ['confirmed','active'] } })
      .select('startDate endDate');

    res.render('bikes/detail', { title: bike.name, bike, bookings });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/bikes');
  }
};

// ── Post review ───────────────────────────────────────────────────────────────
exports.postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.redirect('/bikes');

    // Prevent duplicate review
    const already = bike.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) { req.flash('error', 'You already reviewed this bike'); return res.redirect(`/bikes/${bike._id}`); }

    bike.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    bike.calcAvgRating();
    await bike.save();
    req.flash('success', 'Review submitted!');
    res.redirect(`/bikes/${bike._id}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/bikes');
  }
};
