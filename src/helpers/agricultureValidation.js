const Joi = require("joi");

// Function to capitalize the first letter of each word
const capitalizeWords = (value) => {
    if (typeof value === 'string') {
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return value;
  };

const fieldValidationSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.number().required(),
  propertyType: Joi.string().default("Agricultural land"),
  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  
  ownerDetails: Joi.object({
    ownerName: Joi.string().required().custom((value) => {
    return capitalizeWords(value);
  }, 'Capitalization for OwnerName'),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be a valid 10-digit number.",
      }),
  }).required(),
  
  landDetails: Joi.object({
    title: Joi.string().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for title'),
    surveyNumber: Joi.string()
      .pattern(/^[0-9]{3}-[0-9][A-Za-z][0-9]$/)
      .required()
      .messages({
        "string.pattern.base":
          "Survey number must follow the format: a three-digit number, followed by a hyphen, one digit, one alphabet character, and one digit.",
      }),
    size: Joi.number().min(0).required(),
    price: Joi.number().min(10).required(),
    totalPrice: Joi.number().min(0).required(),
    landType: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for landtype'),

    crops: Joi.array().items(Joi.string().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for crops')).required(),
    litigation: Joi.boolean().required(),
    litigationDesc: Joi.string().when('litigation', {
        is: true,       // When litigation is true
        then: Joi.string().required(), // litigationDesc is required
        otherwise: Joi.string().optional() // If litigation is false, litigationDesc is optional
      }),
    images: Joi.array().items(Joi.string()).optional(),
    propertyDesc: Joi.string().allow('').optional(),
  }).required(),
  
  address: Joi.object({
    pinCode: Joi.string()
      .pattern(/^[0-9]{6}$/) 
      .messages({
        "string.pattern.base": "Pin code must be a valid 6-digit number.",
      }),
    country: Joi.string().default("India").required(),
    state: Joi.string().default("Andhra Pradesh").required(),
    district: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for district'),
    mandal: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for mandal'),
    village: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for village'),
  }).required(),
  
  amenities: Joi.object({
    boreWell: Joi.boolean(),
    electricity: Joi.boolean(),
    distanceFromRoad: Joi.number().min(0).required(),
    storageFacility: Joi.boolean()
  }),

});

module.exports = { fieldValidationSchema};
