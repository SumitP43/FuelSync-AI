const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const createNotification = async ({ userId, title, body, type = 'general', metadata = {} }) => {
  return Notification.create({ userId, title, body, type, metadata });
};

const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) { logger.warn('Email transporter not configured'); return; }
  try {
    await t.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@fuelsync.ai', to, subject, html });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Email send error: ${err.message}`);
  }
};

const notifyHighCongestion = async (pump) => {
  await createNotification({
    title: 'High Congestion Alert',
    body: `${pump.name} has a queue of ${pump.queueLength}. Consider alternative pumps.`,
    type: 'high_congestion',
    metadata: { pumpId: pump._id },
  });
};

const notifyLowFuel = async (pump) => {
  await createNotification({
    title: 'Low Fuel Alert',
    body: `${pump.name} fuel availability is at ${pump.fuelAvailabilityPercent}%.`,
    type: 'fuel_low',
    metadata: { pumpId: pump._id },
  });
};

module.exports = { createNotification, sendEmail, notifyHighCongestion, notifyLowFuel };
