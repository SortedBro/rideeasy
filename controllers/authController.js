const User    = require('../models/User');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const mailer  = require('../utils/mailer');

// ── Helper: generate signed JWT ───────────────────────────────────────────────
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Helper: generate 6-digit OTP ─────────────────────────────────────────────
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ════════════════════════════════════════════════════════════════════════
//  REGISTER
// ════════════════════════════════════════════════════════════════════════
exports.getRegister = (req, res) =>
  res.render('auth/register', { title: 'Register' });

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) { req.flash('error', 'Email already registered'); return res.redirect('/auth/register'); }

    const otp = genOTP();
    const user = await User.create({
      name, email, password, phone,
      otp, otpExpiry: Date.now() + 10 * 60 * 1000
    });

    await mailer.sendOTP(email, otp);
    req.session.pendingUserId = user._id.toString();
    req.flash('success', 'OTP sent to your email. Please verify.');
    res.redirect('/auth/verify-otp');
  } catch (e) {
    console.error(e);
    req.flash('error', 'Registration failed: ' + e.message);
    res.redirect('/auth/register');
  }
};

// ════════════════════════════════════════════════════════════════════════
//  OTP VERIFY
// ════════════════════════════════════════════════════════════════════════
exports.getVerifyOTP = (req, res) => res.render('auth/verify-otp', { title: 'Verify OTP' });

exports.postVerifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId  = req.session.pendingUserId;
    if (!userId) { req.flash('error', 'Session expired'); return res.redirect('/auth/register'); }

    const user = await User.findById(userId);
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      req.flash('error', 'Invalid or expired OTP');
      return res.redirect('/auth/verify-otp');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    delete req.session.pendingUserId;
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    const token = signToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    req.flash('success', `Welcome, ${user.name}!`);
    res.redirect('/user/dashboard');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/auth/verify-otp');
  }
};

// ════════════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════════════
exports.getLogin = (req, res) => res.render('auth/login', { title: 'Login' });

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) { req.flash('error', 'No account with that email'); return res.redirect('/auth/login'); }
    if (!user.isVerified) { req.flash('error', 'Please verify your email first'); return res.redirect('/auth/login'); }
    if (!user.password)  { req.flash('error', 'Use OTP login for this account'); return res.redirect('/auth/login'); }

    const match = await user.comparePassword(password);
    if (!match) { req.flash('error', 'Incorrect password'); return res.redirect('/auth/login'); }

    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    const token = signToken(user._id);
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/auth/login');
  }
};

// ════════════════════════════════════════════════════════════════════════
//  OTP LOGIN (passwordless)
// ════════════════════════════════════════════════════════════════════════
exports.postSendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) { req.flash('error', 'No account found. Please register.'); return res.redirect('/auth/login'); }

    const otp = genOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await mailer.sendOTP(email, otp);

    req.session.pendingUserId = user._id.toString();
    req.flash('success', 'OTP sent! Check your email.');
    res.redirect('/auth/verify-otp');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/auth/login');
  }
};

// ════════════════════════════════════════════════════════════════════════
//  LOGOUT
// ════════════════════════════════════════════════════════════════════════
exports.logout = (req, res) => {
  req.session.destroy();
  res.clearCookie('token');
  res.redirect('/');
};
