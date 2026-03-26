const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ success: false, message });
  }
  next();
};

module.exports = validate;

const Joi_id = Joi.string().hex().length(24);

module.exports.schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'pump_owner'),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  createPump: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    status: Joi.string().valid('open', 'closed', 'maintenance'),
    capacity: Joi.number().integer().min(1),
    operatingHours: Joi.object({
      open: Joi.string(),
      close: Joi.string(),
    }),
  }),
  createBooking: Joi.object({
    pumpId: Joi_id.required(),
    slotDate: Joi.date().iso().greater('now').required(),
    slotHour: Joi.number().integer().min(0).max(23).required(),
    vehicleNumber: Joi.string(),
    notes: Joi.string().max(500),
  }),
  createReview: Joi.object({
    pumpId: Joi_id.required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000),
  }),
};
