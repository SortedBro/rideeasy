/**
 * Seed Script – run once: node seed.js
 * Creates admin user + 12 sample bikes across cities
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Bike     = require('./models/Bike');

const BIKES = [
  { name:'Trek Marlin 7', brand:'Trek', type:'Mountain', city:'Manali', location:'Mall Road Pickup Point', description:'Rugged 27.5" mountain bike perfect for Manali trails. Full suspension fork and hydraulic disc brakes.', pricePerHour:120, pricePerDay:700, images:['/images/bike-default.jpg'], specs:{ gears:'21-speed', frameSize:'Medium', wheelSize:'27.5 inch', weight:'13.5 kg', color:'Matte Black' }, featured:true, availability:true },
  { name:'Hero Sprint Pro', brand:'Hero', type:'Road', city:'Bangalore', location:'MG Road, near Cubbon Park', description:'Lightweight road bike built for speed. Perfect for Bangalore roads and weekend trails.', pricePerHour:80, pricePerDay:450, images:['/images/bike-default.jpg'], specs:{ gears:'18-speed', frameSize:'Large', wheelSize:'700c', weight:'11 kg', color:'Red/White' }, featured:true, availability:true },
  { name:'BSA Hercules CX', brand:'BSA', type:'City', city:'Goa', location:'Calangute Beach Road', description:'Classic city cruiser perfect for Goa\'s flat roads. Comfortable upright riding position.', pricePerHour:60, pricePerDay:300, images:['/images/bike-default.jpg'], specs:{ gears:'7-speed', frameSize:'Medium', wheelSize:'26 inch', weight:'15 kg', color:'Sky Blue' }, featured:true, availability:true },
  { name:'EMotorad EMX', brand:'EMotorad', type:'Electric', city:'Mumbai', location:'Bandra Reclamation', description:'Electric mountain bike with 60km range. Eco-friendly way to explore Mumbai\'s hills.', pricePerHour:200, pricePerDay:1200, images:['/images/bike-default.jpg'], specs:{ gears:'21-speed + Electric', frameSize:'Medium', wheelSize:'27.5 inch', weight:'22 kg', color:'Forest Green' }, featured:true, availability:true },
  { name:'Firefox Speedo 21S', brand:'Firefox', type:'Hybrid', city:'Pune', location:'Koregaon Park Main Gate', description:'Versatile hybrid bike for city commutes and weekend rides. Smooth gear shifting.', pricePerHour:75, pricePerDay:400, images:['/images/bike-default.jpg'], specs:{ gears:'21-speed', frameSize:'Medium', wheelSize:'700c', weight:'12 kg', color:'Gunmetal Grey' }, featured:false, availability:true },
  { name:'Btwin My Bike', brand:'Btwin', type:'City', city:'Delhi', location:'India Gate, near parking', description:'Simple and comfortable city bike. Ideal for exploring Delhi\'s heritage zones.', pricePerHour:55, pricePerDay:280, images:['/images/bike-default.jpg'], specs:{ gears:'Single Speed', frameSize:'Standard', wheelSize:'26 inch', weight:'16 kg', color:'Orange' }, featured:false, availability:true },
  { name:'Scott Aspect 970', brand:'Scott', type:'Mountain', city:'Hyderabad', location:'KBR Park Entrance', description:'Sport mountain bike with Shimano components. Great for Hyderabad\'s rocky terrain.', pricePerHour:110, pricePerDay:600, images:['/images/bike-default.jpg'], specs:{ gears:'27-speed', frameSize:'Large', wheelSize:'29 inch', weight:'14 kg', color:'Neon Yellow' }, featured:true, availability:true },
  { name:'Ridley Fenix SL', brand:'Ridley', type:'Road', city:'Chennai', location:'Marina Beach Parking', description:'Premium road bike for serious riders. Carbon fork and alloy frame for the perfect blend.', pricePerHour:150, pricePerDay:850, images:['/images/bike-default.jpg'], specs:{ gears:'22-speed', frameSize:'Medium', wheelSize:'700c', weight:'9.5 kg', color:'Pearl White' }, featured:false, availability:true },
  { name:'Hero Sprint Eco', brand:'Hero', type:'Kids', city:'Jaipur', location:'City Palace Road', description:'Safe and fun bike for children aged 8-12. Great for exploring Jaipur with family.', pricePerHour:40, pricePerDay:200, images:['/images/bike-default.jpg'], specs:{ gears:'6-speed', frameSize:'Small', wheelSize:'20 inch', weight:'10 kg', color:'Pink/White' }, featured:false, availability:true },
  { name:'Tronx One Electric', brand:'Tronx', type:'Electric', city:'Bangalore', location:'Whitefield Tech Park', description:'Sleek electric commuter bike. Zero emissions, 80km range, perfect for IT corridor.', pricePerHour:180, pricePerDay:1000, images:['/images/bike-default.jpg'], specs:{ gears:'Electric + 7 speed', frameSize:'Medium', wheelSize:'700c', weight:'20 kg', color:'Midnight Black' }, featured:true, availability:true },
  { name:'Montra Trance', brand:'Montra', type:'Mountain', city:'Kolkata', location:'Victoria Memorial East Gate', description:'Trail-ready mountain bike. Telescopic fork and wide tyres for off-road fun.', pricePerHour:95, pricePerDay:520, images:['/images/bike-default.jpg'], specs:{ gears:'21-speed', frameSize:'Medium', wheelSize:'26 inch', weight:'13 kg', color:'Red/Black' }, featured:false, availability:true },
  { name:'Firefox Black Bird', brand:'Firefox', type:'BMX', city:'Goa', location:'Anjuna Beach, near shacks', description:'BMX stunts and beach rides. Compact and durable, great for Goa beach vibes.', pricePerHour:70, pricePerDay:350, images:['/images/bike-default.jpg'], specs:{ gears:'Single Speed', frameSize:'Universal', wheelSize:'20 inch', weight:'12 kg', color:'Gloss Black' }, featured:false, availability:true }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // ── Admin user ─────────────────────────────────────────────────────
    const existing = await User.findOne({ email: 'admin@rideeasy.in' });
    if (!existing) {
      const admin = new User({
        name: 'Admin User', email: 'admin@rideeasy.in',
        password: 'admin123', role: 'admin', isVerified: true, phone: '+91 98765 43210', city: 'Mumbai'
      });
      await admin.save();
      console.log('✅ Admin created: admin@rideeasy.in / admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // ── Bikes ──────────────────────────────────────────────────────────
    const count = await Bike.countDocuments();
    if (count === 0) {
      await Bike.insertMany(BIKES);
      console.log(`✅ ${BIKES.length} bikes seeded`);
    } else {
      console.log(`ℹ️  ${count} bikes already exist, skipping`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('   Admin login: admin@rideeasy.in / admin123');
    console.log('   Run: npm start  →  http://localhost:4000\n');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  }
}

seed();
