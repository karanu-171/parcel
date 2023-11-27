const Joi = require("joi");

// Define the validation schema for user registration
const userRegistrationSchema = Joi.object({
  userType: Joi.string().valid("user", "admin").default("user"),
  userName: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().max(15).required(),
  password: Joi.string().min(4).required(),
});

// Define the validation schema for user login
const userLoginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string(),
});

const userIdSchema = Joi.number().integer().min(1);

// Joi validation schema for updating user data
const userUpdateSchema = Joi.object({
  userName: Joi.string().max(255), 
  email: Joi.string().email(),
  phoneNumber: Joi.string().max(15),
  password: Joi.string().min(4), 
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  userIdSchema,
  userUpdateSchema
};
