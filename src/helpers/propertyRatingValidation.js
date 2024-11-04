
const Joi = require("joi");

const propertyRatingSchema = Joi.object({
  userId: Joi.string().required(),
  
  status: Joi.number().valid(0,1).default(0),


  // role: Joi.number().valid(1, 2, 3).required(), // Assuming role should be either 1, 2, or 3

  propertyId: Joi.string().required(),

  propertyType: Joi.string().required(),

  rating: Joi.number().min(1).max(5).required(), // Assuming rating is between 1 and 5

  // review: Joi.string().optional() 
});

// Export the schema
module.exports = {propertyRatingSchema};
