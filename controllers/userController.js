const Booking = require('../models/Booking');
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');

exports.getDashboard = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('bike','name images city')
      .sort({ createdAt: -1 })
      .limit(5);
    const stats = {
      total:     await Booking.countDocuments({ user: req.user._id }),
      active:    await Booking.countDocuments({ user: req.user._id, status: 'active' }),
      completed: await Booking.countDocuments({ user: req.user._id, status: 'completed' }),
      cancelled: await Booking.countDocuments({ user: req.user._id, status: 'cancelled' })
    };
    res.render('user/dashboard', { title: 'My Dashboard', bookings, stats });
  } catch (e) { req.flash('error', e.message); res.redirect('/'); }
};

exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const bookings = await Booking.find(filter).populate('bike','name images city pricePerDay').sort({ createdAt: -1 });
    res.render('user/bookings', { title: 'My Bookings', bookings, status: status || 'all' });
  } catch (e) { req.flash('error', e.message); res.redirect('/user/dashboard'); }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp');
  res.render('user/profile', { title: 'My Profile', profile: user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name, phone, city });
    req.session.user.name = name;
    req.flash('success', 'Profile updated');
    res.redirect('/user/profile');
  } catch (e) { req.flash('error', e.message); res.redirect('/user/profile'); }
};

exports.changePassword = async (req, res) => {
  try {
    const { current, newPass, confirm } = req.body;
    if (newPass !== confirm) { req.flash('error', 'Passwords do not match'); return res.redirect('/user/profile'); }
    const user = await User.findById(req.user._id);
    if (user.password) {
      const ok = await user.comparePassword(current);
      if (!ok) { req.flash('error', 'Current password incorrect'); return res.redirect('/user/profile'); }
    }
    user.password = newPass;
    await user.save();
    req.flash('success', 'Password changed successfully');
    res.redirect('/user/profile');
  } catch (e) { req.flash('error', e.message); res.redirect('/user/profile'); }
};
