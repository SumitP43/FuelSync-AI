require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Pump = require('./models/Pump');
const User = require('./models/User');

const pumps = [
  { name: 'Green CNG Station - Delhi', address: 'Connaught Place', city: 'Delhi', state: 'Delhi', location: { type: 'Point', coordinates: [77.2090, 28.6139] }, fuelAvailabilityPercent: 80, queueLength: 3, avgWaitingTimeMin: 10, status: 'open' },
  { name: 'Blue CNG Pump - Mumbai', address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', location: { type: 'Point', coordinates: [72.8479, 19.1197] }, fuelAvailabilityPercent: 65, queueLength: 5, avgWaitingTimeMin: 15, status: 'open' },
  { name: 'CNG Express - Bangalore', address: 'Koramangala', city: 'Bangalore', state: 'Karnataka', location: { type: 'Point', coordinates: [77.6245, 12.9352] }, fuelAvailabilityPercent: 90, queueLength: 1, avgWaitingTimeMin: 5, status: 'open' },
  { name: 'FuelFast CNG - Pune', address: 'Kothrud', city: 'Pune', state: 'Maharashtra', location: { type: 'Point', coordinates: [73.8260, 18.5074] }, fuelAvailabilityPercent: 55, queueLength: 7, avgWaitingTimeMin: 20, status: 'open' },
  { name: 'Speed CNG - Hyderabad', address: 'Hitech City', city: 'Hyderabad', state: 'Telangana', location: { type: 'Point', coordinates: [78.3816, 17.4474] }, fuelAvailabilityPercent: 70, queueLength: 4, avgWaitingTimeMin: 12, status: 'open' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fuelsync');
  await Promise.all([Pump.deleteMany({}), User.deleteMany({})]);

  const adminPassword = await bcrypt.hash('admin1234', 12);
  await User.create({ name: 'Admin', email: 'admin@fuelsync.ai', password: adminPassword, role: 'admin' });

  const ownerPassword = await bcrypt.hash('owner1234', 12);
  const owner = await User.create({ name: 'Pump Owner', email: 'owner@fuelsync.ai', password: ownerPassword, role: 'pump_owner' });

  const demoPassword = await bcrypt.hash('demo1234', 12);
  await User.create({ name: 'Demo User', email: 'demo@fuelsync.ai', password: demoPassword, role: 'user' });

  await Pump.insertMany(pumps.map((p) => ({ ...p, ownerId: owner._id })));
  console.log('✅ Seed complete');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
