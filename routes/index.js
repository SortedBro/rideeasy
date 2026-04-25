const express = require('express');
const router  = express.Router();
const Bike    = require('../models/Bike');
const Contact = require('../models/Contact');

// ── Homepage ──────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const featured = await Bike.find({ featured: true, availability: true }).limit(6);
    const allBikes = featured.length < 3 ? await Bike.find({ availability: true }).limit(6) : featured;
    res.render('index', { title: 'RideEasy – Rent a Bike', bikes: allBikes });
  } catch (e) { res.render('index', { title: 'RideEasy – Rent a Bike', bikes: [] }); }
});

// ── About ─────────────────────────────────────────────────────────────────────
router.get('/about', (req, res) => res.render('about', { title: 'About Us' }));

// ── FAQ ───────────────────────────────────────────────────────────────────────
router.get('/faq', (req, res) => res.render('faq', { title: 'FAQ' }));

// ── Contact ───────────────────────────────────────────────────────────────────
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact Us' }));

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await Contact.create({ name, email, subject, message });
    req.flash('success', 'Message sent! We will get back to you soon.');
    res.redirect('/contact');
  } catch (e) { req.flash('error', e.message); res.redirect('/contact'); }
});

module.exports = router;
