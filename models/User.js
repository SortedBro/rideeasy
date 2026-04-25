const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String },                       // null for OTP-only users
  phone:        { type: String, default: '' },
  avatar:       { type: String, default: '/images/default-avatar.png' },
  role:         { type: String, enum: ['user','admin'], default: 'user' },
  isVerified:   { type: Boolean, default: false },
  otp:          { type: String },
  otpExpiry:    { type: Date },
  resetToken:   { type: String },
  resetExpiry:  { type: Date },
  city:         { type: String, default: '' },
  bookings:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
