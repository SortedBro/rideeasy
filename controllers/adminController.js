const Bike    = require('../models/Bike');
const Booking = require('../models/Booking');
const User    = require('../models/User');
const Contact = require('../models/Contact');
const path    = require('path');
const fs      = require('fs');

// ── Dashboard analytics ───────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [totalBikes, totalUsers, totalBookings, revenue, recentBookings, contacts] = await Promise.all([
      Bike.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.find().populate('bike','name').populate('user','name email').sort({ createdAt: -1 }).limit(8),
      Contact.countDocuments({ replied: false })
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    const bikeTypeStats = await Booking.aggregate([
      { $lookup: { from: 'bikes', localField: 'bike', foreignField: '_id', as: 'bikeData' } },
      { $unwind: '$bikeData' },
      { $group: { _id: '$bikeData.type', count: { $sum: 1 } } }
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalBikes, totalUsers, totalBookings, revenue: revenue[0]?.total || 0, contacts },
      recentBookings, monthlyRevenue, bikeTypeStats
    });
  } catch (e) { req.flash('error', e.message); res.redirect('/'); }
};

// ── Bikes CRUD ────────────────────────────────────────────────────────────────
exports.getBikes = async (req, res) => {
  const bikes = await Bike.find().sort({ createdAt: -1 });
  res.render('admin/bikes', { title: 'Manage Bikes', bikes });
};

exports.getAddBike = (req, res) => res.render('admin/bike-form', { title: 'Add Bike', bike: null });

exports.postAddBike = async (req, res) => {
  try {
    const { name, brand, type, description, pricePerHour, pricePerDay, city, location,
            gears, frameSize, wheelSize, weight, color, featured } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : ['/images/bike-default.jpg'];
    await Bike.create({
      name, brand, type, description,
      pricePerHour: Number(pricePerHour), pricePerDay: Number(pricePerDay),
      city, location, images,
      specs: { gears, frameSize, wheelSize, weight, color },
      featured: featured === 'on'
    });
    req.flash('success', 'Bike added!');
    res.redirect('/admin/bikes');
  } catch (e) { req.flash('error', e.message); res.redirect('/admin/bikes/add'); }
};

exports.getEditBike = async (req, res) => {
  const bike = await Bike.findById(req.params.id);
  if (!bike) { req.flash('error', 'Not found'); return res.redirect('/admin/bikes'); }
  res.render('admin/bike-form', { title: 'Edit Bike', bike });
};

exports.postEditBike = async (req, res) => {
  try {
    const { name, brand, type, description, pricePerHour, pricePerDay, city, location,
            gears, frameSize, wheelSize, weight, color, featured, availability } = req.body;
    const update = {
      name, brand, type, description,
      pricePerHour: Number(pricePerHour), pricePerDay: Number(pricePerDay),
      city, location,
      specs: { gears, frameSize, wheelSize, weight, color },
      featured: featured === 'on',
      availability: availability === 'true'
    };
    if (req.files && req.files.length) update.images = req.files.map(f => '/uploads/' + f.filename);
    await Bike.findByIdAndUpdate(req.params.id, update);
    req.flash('success', 'Bike updated!');
    res.redirect('/admin/bikes');
  } catch (e) { req.flash('error', e.message); res.redirect('/admin/bikes'); }
};

exports.deleteBike = async (req, res) => {
  await Bike.findByIdAndDelete(req.params.id);
  req.flash('success', 'Bike deleted');
  res.redirect('/admin/bikes');
};

// ── Bookings ──────────────────────────────────────────────────────────────────
exports.getBookings = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const bookings = await Booking.find(filter).populate('bike','name').populate('user','name email').sort({ createdAt: -1 });
  res.render('admin/bookings', { title: 'Manage Bookings', bookings, status: status || 'all' });
};

exports.updateBookingStatus = async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status });
  req.flash('success', 'Status updated');
  res.redirect('/admin/bookings');
};

// ── Users ─────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Manage Users', users });
};

// ── Contacts ──────────────────────────────────────────────────────────────────
exports.getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.render('admin/contacts', { title: 'Contact Messages', contacts });
};

exports.markContactReplied = async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { replied: true });
  res.redirect('/admin/contacts');
};
