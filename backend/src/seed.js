require('dotenv').config();
const mongoose = require('mongoose');
const Pump = require('./models/Pump');
const Feedback = require('./models/Feedback');
const CrowdReport = require('./models/CrowdReport');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fuelsync';

const pumps = [
  // Delhi NCR
  { name: 'IGL CNG Station - Connaught Place', address: 'Connaught Place, New Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.6292, longitude: 77.2192, capacity: 4, phone: '011-41404445', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 22, average_rating: 4.2, total_ratings: 128 },
  { name: 'IGL CNG Station - Lajpat Nagar', address: 'Ring Road, Lajpat Nagar, New Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.5665, longitude: 77.2431, capacity: 3, phone: '011-29832212', amenities: { washroom: true, shop: false, parking: true }, historical_avg_wait: 28, average_rating: 3.9, total_ratings: 95 },
  { name: 'IGL CNG Station - Dwarka', address: 'Sector 10, Dwarka, New Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.5823, longitude: 77.0501, capacity: 5, phone: '011-25083218', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 18, average_rating: 4.5, total_ratings: 210 },
  { name: 'IGL CNG Station - Rohini', address: 'Sector 15, Rohini, New Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025, capacity: 4, phone: '011-27052189', amenities: { washroom: false, shop: true, parking: true }, historical_avg_wait: 25, average_rating: 4.0, total_ratings: 156 },
  { name: 'IGL CNG Station - Mayur Vihar', address: 'Mayur Vihar Phase 1, New Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.6119, longitude: 77.2946, capacity: 3, phone: '011-22751024', amenities: { washroom: true, shop: false, parking: false }, historical_avg_wait: 30, average_rating: 3.7, total_ratings: 89 },
  // Noida / Gurgaon
  { name: 'IGL CNG Station - Noida Sector 18', address: 'Sector 18, Noida, UP', city: 'Noida', state: 'Uttar Pradesh', latitude: 28.5672, longitude: 77.3219, capacity: 4, phone: '0120-4242424', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 20, average_rating: 4.3, total_ratings: 175 },
  { name: 'IGL CNG Station - Gurgaon Sector 14', address: 'Sector 14, Gurgaon, Haryana', city: 'Gurgaon', state: 'Haryana', latitude: 28.4595, longitude: 77.0266, capacity: 3, phone: '0124-4812345', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 15, average_rating: 4.6, total_ratings: 220 },
  // Mumbai
  { name: 'MGL CNG Station - Andheri West', address: 'Link Road, Andheri West, Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1176, longitude: 72.8468, capacity: 5, phone: '022-66783737', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 35, average_rating: 4.0, total_ratings: 312 },
  { name: 'MGL CNG Station - Bandra', address: 'Turner Road, Bandra West, Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0596, longitude: 72.8295, capacity: 4, phone: '022-26558899', amenities: { washroom: true, shop: false, parking: true }, historical_avg_wait: 40, average_rating: 3.8, total_ratings: 198 },
  { name: 'MGL CNG Station - Powai', address: 'LBS Road, Powai, Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1197, longitude: 72.9058, capacity: 6, phone: '022-28572345', amenities: { washroom: true, shop: true, parking: true, atm: true, restaurant: true }, historical_avg_wait: 25, average_rating: 4.4, total_ratings: 267 },
  { name: 'MGL CNG Station - Thane West', address: 'Pokhran Road, Thane West', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781, capacity: 4, phone: '022-25453456', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 30, average_rating: 4.1, total_ratings: 145 },
  { name: 'MGL CNG Station - Navi Mumbai', address: 'Palm Beach Road, Navi Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0330, longitude: 73.0297, capacity: 5, phone: '022-27574567', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 22, average_rating: 4.3, total_ratings: 189 },
  // Bangalore
  { name: 'GAIL CNG Station - Koramangala', address: '80 Feet Road, Koramangala, Bangalore', city: 'Bangalore', state: 'Karnataka', latitude: 12.9352, longitude: 77.6245, capacity: 4, phone: '080-25532222', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 20, average_rating: 4.2, total_ratings: 234 },
  { name: 'GAIL CNG Station - Whitefield', address: 'ITPL Main Road, Whitefield, Bangalore', city: 'Bangalore', state: 'Karnataka', latitude: 12.9698, longitude: 77.7499, capacity: 5, phone: '080-28441234', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 18, average_rating: 4.5, total_ratings: 298 },
  { name: 'GAIL CNG Station - Jayanagar', address: '11th Main, Jayanagar, Bangalore', city: 'Bangalore', state: 'Karnataka', latitude: 12.9250, longitude: 77.5938, capacity: 3, phone: '080-26631234', amenities: { washroom: false, shop: true, parking: false }, historical_avg_wait: 25, average_rating: 3.9, total_ratings: 112 },
  // Hyderabad
  { name: 'HPCL CNG Station - Jubilee Hills', address: 'Road No. 36, Jubilee Hills, Hyderabad', city: 'Hyderabad', state: 'Telangana', latitude: 17.4239, longitude: 78.4108, capacity: 4, phone: '040-23352222', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 22, average_rating: 4.1, total_ratings: 167 },
  { name: 'HPCL CNG Station - Banjara Hills', address: 'Road No. 12, Banjara Hills, Hyderabad', city: 'Hyderabad', state: 'Telangana', latitude: 17.4126, longitude: 78.4482, capacity: 3, phone: '040-23332233', amenities: { washroom: true, shop: false, parking: true }, historical_avg_wait: 28, average_rating: 3.8, total_ratings: 98 },
  { name: 'HPCL CNG Station - Gachibowli', address: 'Financial District, Gachibowli, Hyderabad', city: 'Hyderabad', state: 'Telangana', latitude: 17.4400, longitude: 78.3489, capacity: 5, phone: '040-23401234', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 15, average_rating: 4.6, total_ratings: 342 },
  // Pune
  { name: 'MGL CNG Station - Kothrud', address: 'Karve Road, Kothrud, Pune', city: 'Pune', state: 'Maharashtra', latitude: 18.5074, longitude: 73.8077, capacity: 4, phone: '020-25455678', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 20, average_rating: 4.2, total_ratings: 189 },
  { name: 'MGL CNG Station - Wakad', address: 'Wakad Road, Pune', city: 'Pune', state: 'Maharashtra', latitude: 18.5986, longitude: 73.7600, capacity: 3, phone: '020-27652345', amenities: { washroom: false, shop: true, parking: true }, historical_avg_wait: 25, average_rating: 4.0, total_ratings: 134 },
  { name: 'MGL CNG Station - Viman Nagar', address: 'Nagar Road, Viman Nagar, Pune', city: 'Pune', state: 'Maharashtra', latitude: 18.5679, longitude: 73.9143, capacity: 4, phone: '020-26631234', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 18, average_rating: 4.4, total_ratings: 223 },
  // Ahmedabad
  { name: 'GSPC CNG Station - Satellite', address: 'Anand Nagar Road, Satellite, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0300, longitude: 72.5273, capacity: 5, phone: '079-26763456', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 12, average_rating: 4.5, total_ratings: 289 },
  { name: 'GSPC CNG Station - Navrangpura', address: 'C G Road, Navrangpura, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, capacity: 4, phone: '079-26447891', amenities: { washroom: true, shop: false, parking: true }, historical_avg_wait: 15, average_rating: 4.3, total_ratings: 198 },
  { name: 'GSPC CNG Station - Bopal', address: 'SP Ring Road, Bopal, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0263, longitude: 72.4711, capacity: 6, phone: '079-27102345', amenities: { washroom: true, shop: true, parking: true, atm: true, restaurant: true }, historical_avg_wait: 10, average_rating: 4.7, total_ratings: 412 },
  // Chennai
  { name: 'IOCL CNG Station - Anna Nagar', address: '4th Avenue, Anna Nagar, Chennai', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0858, longitude: 80.2101, capacity: 4, phone: '044-26261234', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 20, average_rating: 4.1, total_ratings: 156 },
  { name: 'IOCL CNG Station - T Nagar', address: 'Usman Road, T Nagar, Chennai', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0418, longitude: 80.2341, capacity: 3, phone: '044-24350123', amenities: { washroom: false, shop: true, parking: false }, historical_avg_wait: 30, average_rating: 3.7, total_ratings: 87 },
  // Jaipur
  { name: 'IOCL CNG Station - Malviya Nagar', address: 'JLN Marg, Malviya Nagar, Jaipur', city: 'Jaipur', state: 'Rajasthan', latitude: 26.8631, longitude: 75.8058, capacity: 4, phone: '0141-2723456', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 18, average_rating: 4.2, total_ratings: 145 },
  { name: 'IOCL CNG Station - Vaishali Nagar', address: 'Queens Road, Vaishali Nagar, Jaipur', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7318, capacity: 3, phone: '0141-2375678', amenities: { washroom: true, shop: false, parking: true }, historical_avg_wait: 22, average_rating: 4.0, total_ratings: 112 },
  // Lucknow
  { name: 'GAIL CNG Station - Gomti Nagar', address: 'Vibhuti Khand, Gomti Nagar, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8473, longitude: 81.0086, capacity: 4, phone: '0522-2720123', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 20, average_rating: 4.3, total_ratings: 178 },
  { name: 'GAIL CNG Station - Hazratganj', address: 'MG Marg, Hazratganj, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8523, longitude: 80.9478, capacity: 3, phone: '0522-2234567', amenities: { washroom: false, shop: true, parking: false }, historical_avg_wait: 28, average_rating: 3.9, total_ratings: 98 },
  // Surat
  { name: 'GSPC CNG Station - Vesu', address: 'LP Savani Road, Vesu, Surat', city: 'Surat', state: 'Gujarat', latitude: 21.1467, longitude: 72.7864, capacity: 5, phone: '0261-2768901', amenities: { washroom: true, shop: true, parking: true }, historical_avg_wait: 12, average_rating: 4.4, total_ratings: 234 },
  { name: 'GSPC CNG Station - Adajan', address: 'Adajan Road, Surat', city: 'Surat', state: 'Gujarat', latitude: 21.1930, longitude: 72.7902, capacity: 4, phone: '0261-2456789', amenities: { washroom: true, shop: true, parking: true, atm: true }, historical_avg_wait: 10, average_rating: 4.6, total_ratings: 312 },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Pump.deleteMany({}),
      Feedback.deleteMany({}),
      CrowdReport.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create pumps
    const createdPumps = await Pump.insertMany(pumps);
    console.log(`✅ Inserted ${createdPumps.length} pumps`);

    // Create demo user
    const password_hash = await bcrypt.hash('demo1234', 12);
    const demoUser = await User.create({
      username: 'demo_user',
      email: 'demo@fuelsync.ai',
      password_hash,
      favorite_pumps: [createdPumps[0]._id, createdPumps[2]._id],
    });
    console.log(`✅ Created demo user: ${demoUser.email}`);

    // Seed some crowd reports
    const crowdReports = createdPumps.slice(0, 10).map((pump, i) => ({
      pump_id: pump._id,
      crowd_level: ((i % 3) + 1) * 2 - 1, // 1, 3, 5, 1, 3, 5...
      wait_time_reported: pump.historical_avg_wait + (i % 5) * 3,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000),
    }));
    await CrowdReport.insertMany(crowdReports);
    console.log(`✅ Inserted ${crowdReports.length} crowd reports`);

    // Seed feedback
    const ratings = [5, 4, 4, 3, 5, 4, 2, 5, 4, 3];
    const reviews = [
      'Great station, very efficient staff and quick filling.',
      'Usually crowded in mornings but staff is helpful.',
      'Good location, clean premises.',
      'Average experience, long queues during peak hours.',
      'Best CNG station in the area, highly recommend!',
      'Decent wait times, good amenities.',
      'Too crowded on weekdays.',
      'Excellent service and very quick.',
      'Good experience overall.',
      'Acceptable wait time, decent staff.',
    ];

    const feedbackData = createdPumps.slice(0, 10).map((pump, i) => ({
      pump_id: pump._id,
      user_id: demoUser._id,
      rating: ratings[i],
      review_text: reviews[i],
    }));
    await Feedback.insertMany(feedbackData);
    console.log(`✅ Inserted ${feedbackData.length} feedback records`);

    console.log('\n🌱 Database seeded successfully!');
    console.log('Demo credentials: demo@fuelsync.ai / demo1234');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
