const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId:    { type: String, default: () => 'BR' + uuidv4().slice(0,8).toUpperCase(), unique: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bike:         { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  rentalType:   { type: String, enum: ['hourly','daily'], required: true },
  hours:        Number,
  days:         Number,
  totalAmount:  { type: Number, required: true },
  status:       { type: String, enum: ['pending','confirmed','active','completed','cancelled'], default: 'pending' },
  payment: {
    method:      { type: String, enum: ['razorpay','cod','wallet'], default: 'razorpay' },
    status:      { type: String, enum: ['pending','paid','refunded','failed'], default: 'pending' },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    paidAt:      Date
  },
  pickupLocation: String,
  notes:          String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
