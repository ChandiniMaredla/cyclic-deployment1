const Joi=require('joi');



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

const wishlistSchema=Joi.object({

    userId: Joi.string().required(),

    propertyId: Joi.string().required().messages({
        'any.required': 'Property ID is required.',
        'string.empty': 'Property ID should not be empty.',
      }),
      propertyType: Joi.string().required().messages({
        'any.required': 'Property type is required.',
        'string.empty': 'Property type should not be empty.',
      }).custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for Property Type'),

      status: Joi.number().valid(0, 1).default(1).messages({
        'any.only': 'Status must be either 0 (removed) or 1 (active).',
        'number.base': 'Status must be a valid number.',
      }),

})





const deleteWishlistValidationSchema = Joi.object({
    propertyId: Joi.string().required().messages({
      
      "any.required": "Property ID is required."
    }),
  });

module.exports={wishlistSchema,deleteWishlistValidationSchema}