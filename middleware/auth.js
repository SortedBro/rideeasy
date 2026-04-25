const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect any route: checks session OR JWT cookie ──────────────────────────
exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1. Session-based (EJS pages)
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user._id).select('-password -otp');
      if (user) { req.user = user; return next(); }
    }
    // 2. JWT cookie (API / SPA)
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password -otp');
      if (user) { req.user = user; req.session.user = user; return next(); }
    }
    req.flash('error', 'Please login to continue');
    return res.redirect('/auth/login');
  } catch (e) {
    req.flash('error', 'Session expired. Please login again.');
    return res.redirect('/auth/login');
  }
};

// ── Admin guard ───────────────────────────────────────────────────────────────
exports.isAdmin = async (req, res, next) => {
  await exports.isLoggedIn(req, res, async () => {
    if (req.user && req.user.role === 'admin') return next();
    req.flash('error', 'Admin access only');
    return res.redirect('/');
  });
};

// ── Already logged in → redirect to dashboard ─────────────────────────────────
exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return res.redirect('/user/dashboard');
  next();
};
