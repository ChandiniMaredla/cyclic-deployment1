
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
// Joi validation schema for agentRating
const agentRatingValidation = Joi.object({
  userId: Joi.string().required(),

  status: Joi.number().valid(0, 1).default(0), // Assuming status can be 0 or 1, modify if needed

  // firstName: Joi.string().required(),

  // lastName: Joi.string().required(),

  agentId: Joi.string().required(),

  rating: Joi.number().min(0).max(5).required(), // Assuming a 5-star rating system

  //review: Joi.string().optional().allow(null, ''), // Review is optional, can be empty or null
});


const validateLocation= Joi.object({
location: Joi.string().required() .custom((value) => {
    return capitalizeWords(value);
  }, "formatting location"),
})
module.exports = { agentRatingValidation, validateLocation };
