const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    String,
  rating:  { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date:    { type: Date, default: Date.now }
});

const bikeSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  brand:         { type: String, required: true },
  type:          { type: String, enum: ['Mountain','Road','City','Electric','Hybrid','BMX','Kids'], required: true },
  description:   { type: String, required: true },
  images:        [{ type: String }],                    // paths or URLs
  pricePerHour:  { type: Number, required: true },
  pricePerDay:   { type: Number, required: true },
  city:          { type: String, required: true },
  location:      { type: String, required: true },      // address / landmark
  specs: {
    gears:       String,
    frameSize:   String,
    wheelSize:   String,
    weight:      String,
    color:       String
  },
  availability:  { type: Boolean, default: true },
  featured:      { type: Boolean, default: false },
  reviews:       [reviewSchema],
  avgRating:     { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 }
}, { timestamps: true });

// Recalculate average rating
bikeSchema.methods.calcAvgRating = function() {
  if (!this.reviews.length) { this.avgRating = 0; return; }
  const sum = this.reviews.reduce((a, r) => a + r.rating, 0);
  this.avgRating = Math.round((sum / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Bike', bikeSchema);
