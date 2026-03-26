const Booking = require('../models/Booking');
const Pump = require('../models/Pump');
const QRCode = require('qrcode');
const { asyncHandler } = require('../middleware/errorHandler');

const MAX_PER_SLOT = 5;

exports.createBooking = asyncHandler(async (req, res) => {
  const { pumpId, slotDate, slotHour, vehicleNumber, notes } = req.body;

  const pump = await Pump.findById(pumpId);
  if (!pump || !pump.isActive) return res.status(404).json({ success: false, message: 'Pump not found' });

  const slotStart = new Date(slotDate);
  slotStart.setHours(0, 0, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setDate(slotEnd.getDate() + 1);

  const count = await Booking.countDocuments({
    pumpId, slotHour,
    slotDate: { $gte: slotStart, $lt: slotEnd },
    status: 'active',
  });
  if (count >= MAX_PER_SLOT) {
    return res.status(409).json({ success: false, message: 'Slot is full. Please choose another time.' });
  }

  const expiresAt = new Date(slotDate);
  expiresAt.setHours(slotHour + 1, 0, 0, 0);

  const booking = await Booking.create({
    userId: req.user._id, pumpId, slotDate, slotHour, vehicleNumber, notes, expiresAt,
  });

  const qrData = JSON.stringify({ bookingId: booking._id, token: booking.qrToken });
  const qrCode = await QRCode.toDataURL(qrData);
  booking.qrCode = qrCode;
  await booking.save();

  const io = req.app.get('io');
  if (io) io.to(`pump:${pumpId}`).emit('newBooking', { pumpId, slotHour, bookedAt: new Date() });

  res.status(201).json({ success: true, booking });
});

exports.getUserBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { userId: req.user._id };
  if (status) filter.status = status;
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('pumpId', 'name address city')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, total, bookings });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('pumpId', 'name address city');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({ success: true, booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  if (booking.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Only active bookings can be cancelled' });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled', booking });
});

exports.rescheduleBooking = asyncHandler(async (req, res) => {
  const { slotDate, slotHour } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  if (booking.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Only active bookings can be rescheduled' });
  }

  const slotStart = new Date(slotDate);
  slotStart.setHours(0, 0, 0, 0);
  const slotEnd = new Date(slotStart);
  slotEnd.setDate(slotEnd.getDate() + 1);
  const count = await Booking.countDocuments({
    pumpId: booking.pumpId, slotHour,
    slotDate: { $gte: slotStart, $lt: slotEnd },
    status: 'active',
    _id: { $ne: booking._id },
  });
  if (count >= MAX_PER_SLOT) {
    return res.status(409).json({ success: false, message: 'New slot is also full' });
  }

  booking.slotDate = slotDate;
  booking.slotHour = slotHour;
  const expiresAt = new Date(slotDate);
  expiresAt.setHours(slotHour + 1, 0, 0, 0);
  booking.expiresAt = expiresAt;
  await booking.save();
  res.json({ success: true, booking });
});
