const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');
const Bike     = require('../models/Bike');
const User     = require('../models/User');
const mailer   = require('../utils/mailer');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ── Show checkout page ────────────────────────────────────────────────────────
exports.getCheckout = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('bike');
    if (!booking) { req.flash('error', 'Booking not found'); return res.redirect('/user/bookings'); }
    if (booking.user.toString() !== req.user._id.toString()) return res.redirect('/');

    res.render('payment/checkout', {
      title: 'Checkout',
      booking,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/bookings');
  }
};

// ── Create Razorpay order ─────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const order = await razorpay.orders.create({
      amount:   booking.totalAmount * 100,   // paise
      currency: 'INR',
      receipt:  booking.bookingId
    });

    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e) {
    console.error('Razorpay order error:', e);
    res.status(500).json({ error: e.message });
  }
};

// ── Verify payment signature & confirm booking ────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      req.flash('error', 'Payment verification failed');
      return res.redirect(`/payment/checkout/${bookingId}`);
    }

    const booking = await Booking.findById(bookingId).populate('bike');
    booking.status = 'confirmed';
    booking.payment.status      = 'paid';
    booking.payment.razorpayPaymentId = razorpay_payment_id;
    booking.payment.paidAt      = new Date();
    await booking.save();

    // Increment bike bookings
    await Bike.findByIdAndUpdate(booking.bike._id, { $inc: { totalBookings: 1 } });

    // Add to user's bookings
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    // Send confirmation email
    try {
      await mailer.sendBookingConfirmation(req.user.email, booking, booking.bike, req.user);
    } catch (mailErr) { console.error('Mail error:', mailErr.message); }

    req.flash('success', 'Payment successful! Booking confirmed.');
    res.redirect(`/booking/${bookingId}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/bookings');
  }
};

// ── COD / Skip payment ────────────────────────────────────────────────────────
exports.codPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('bike');
    if (!booking || booking.user.toString() !== req.user._id.toString()) return res.redirect('/');

    booking.status         = 'confirmed';
    booking.payment.method = 'cod';
    await booking.save();

    await Bike.findByIdAndUpdate(booking.bike._id, { $inc: { totalBookings: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    try { await mailer.sendBookingConfirmation(req.user.email, booking, booking.bike, req.user); } catch {}

    req.flash('success', 'Booking confirmed! Pay at pickup.');
    res.redirect(`/booking/${booking._id}`);
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/bookings');
  }
};
