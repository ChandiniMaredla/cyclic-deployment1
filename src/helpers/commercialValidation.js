
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

// Validation for commercial property
const commercialSchema = Joi.object({
  userId: Joi.string().required(),
  
  propertyType: Joi.string().required(),

  propertyTitle: Joi.string().required().custom((value) => {
    return capitalizeWords(value);
  }, 'Capitalization for propertyTitle'),

  rating: Joi.number().default(0), // Assuming rating can be optional
  ratingCount: Joi.number().default(0), // Assuming ratingCount can be optional
  status: Joi.number().default(0), // Assuming status can be optional

  propertyDetails: Joi.object({
    owner: Joi.object({
      ownerName: Joi.string().required().regex(/^[A-Za-z\s]+$/).custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for ownerName'),

      ownerContact: Joi.string()
        .length(10)
        .pattern(/[6-9]{1}[0-9]{9}/)
        .required(),
      
      //ownerEmail: Joi.string().email().optional().lowercase(),
      ownerEmail: Joi.string().email().optional().allow('').lowercase(),

      isLegalDispute: Joi.boolean().required(),
      disputeDesc: Joi.string().when('isLegalDispute', {
        is: true,       // When litigation is true
        then: Joi.string().required(), // litigationDesc is required
        otherwise: Joi.string().optional() // If litigation is false, litigationDesc is optional
      }),
    }).required(),

    landDetails: Joi.object({
      sell: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        price: Joi.number().min(10).optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, 'Capitalization for landUsage')).optional(),
      }).optional(),

      rent: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        rent: Joi.number().min(10).optional(),
        noOfMonths: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, 'Capitalization for landUsage')).optional(),
      }).optional(),

      lease: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        leasePrice: Joi.number().min(10).optional(),
        duration: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, 'Capitalization for landUsage')).optional(),
      }).optional(),

      address: Joi.object({
        pinCode: Joi.string()
          .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
          .optional(),

        country: Joi.string().default("India").required(),
        state: Joi.string().default("Andhra Pradesh"),

        district: Joi.string()
          .required()
          .custom((value) => {
            return capitalizeWords(value);
          }, "formatting district"),

        mandal: Joi.string()
          .required()
          .custom((value) => {
            return capitalizeWords(value);
          }, "formatting mandal"),

        village: Joi.string().required().custom((value) => {
          return capitalizeWords(value);
        }, "formatting village"),
      }).required(), // Address is required

      description: Joi.string().optional(),
    }).required(),

    amenities: Joi.object({
      isElectricity: Joi.boolean().optional(),
      isWaterFacility: Joi.boolean().optional(),
      isRoadFace: Joi.boolean().optional(),
    }).optional(),
    
    uploadPics: Joi.array().items(Joi.string()).optional(),
  }).optional(), // Property details is required
});

module.exports = {commercialSchema};
