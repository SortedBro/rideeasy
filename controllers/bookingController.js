const Booking = require('../models/Booking');
const Bike    = require('../models/Bike');
const mailer  = require('../utils/mailer');

// ── Show booking form ─────────────────────────────────────────────────────────
exports.getBookingForm = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.bikeId);
    if (!bike || !bike.availability) {
      req.flash('error', 'Bike not available');
      return res.redirect('/bikes');
    }
    res.render('booking/form', { title: 'Book Bike', bike });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/bikes');
  }
};

// ── Create booking (before payment) ──────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { bikeId, startDate, endDate, rentalType, notes } = req.body;
    const bike = await Bike.findById(bikeId);
    if (!bike) { req.flash('error', 'Bike not found'); return res.redirect('/bikes'); }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end <= start) { req.flash('error', 'End date must be after start date'); return res.redirect(`/booking/new/${bikeId}`); }

    // Conflict check
    const conflict = await Booking.findOne({
      bike: bikeId,
      status: { $in: ['confirmed', 'active'] },
      $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }]
    });
    if (conflict) { req.flash('error', 'Bike already booked for selected dates'); return res.redirect(`/booking/new/${bikeId}`); }

    let totalAmount, hours, days;
    if (rentalType === 'hourly') {
      hours = Math.ceil((end - start) / (1000 * 60 * 60));
      totalAmount = hours * bike.pricePerHour;
    } else {
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      totalAmount = days * bike.pricePerDay;
    }

    const booking = await Booking.create({
      user: req.user._id,
      bike: bikeId,
      startDate: start, endDate: end,
      rentalType, hours, days,
      totalAmount,
      pickupLocation: bike.location,
      notes
    });

    // Store booking in session for payment step
    req.session.pendingBookingId = booking._id.toString();
    res.redirect(`/payment/checkout/${booking._id}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/bikes');
  }
};

// ── Cancel booking ────────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) { req.flash('error', 'Booking not found'); return res.redirect('/user/bookings'); }
    if (['completed','cancelled'].includes(booking.status)) {
      req.flash('error', 'Cannot cancel this booking');
      return res.redirect('/user/bookings');
    }
    booking.status = 'cancelled';
    await booking.save();
    req.flash('success', 'Booking cancelled');
    res.redirect('/user/bookings');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/bookings');
  }
};

// ── Booking detail ────────────────────────────────────────────────────────────
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('bike').populate('user','name email');
    if (!booking) { req.flash('error', 'Not found'); return res.redirect('/user/bookings'); }
    res.render('booking/detail', { title: 'Booking Detail', booking });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/bookings');
  }
};
