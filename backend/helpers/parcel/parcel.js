const Joi = require("joi");

const parcelCreationSchema = Joi.object({
  description: Joi.string().max(255).required(),
  senderName: Joi.string().max(255).required(),
  receiverName: Joi.string().max(255).required(),
  senderNumber: Joi.string().max(15).required(),
  receiverNumber: Joi.string().max(15).required(),
  startLocation: Joi.string().max(255).required(),
  endLocation: Joi.string().max(255).required(),
  weight: Joi.number().min(0.01).required(),
});

const parcelIdSchema =  Joi.number().integer().min(1);

const parcelUpdateSchema = Joi.object({
  description: Joi.string().max(255),
  senderName: Joi.string().max(255),
  receiverName: Joi.string().max(255),
  senderNumber: Joi.string().max(15),
  receiverNumber: Joi.string().max(15),
  startLocation: Joi.string().max(255),
  endLocation: Joi.string().max(255),
  weight: Joi.number().min(0),
});

module.exports = {
  parcelCreationSchema,
  parcelIdSchema,
  parcelUpdateSchema
};
