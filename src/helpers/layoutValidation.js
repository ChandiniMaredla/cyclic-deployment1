const Joi = require('joi');


const capitalizeWords = (value) => {
    if (typeof value === 'string') {
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return value;
  };
// Joi schema for layout details validation
const layoutValidationSchema = Joi.object({
  userId: Joi.string().optional(),
  role: Joi.number().optional(),
  propertyType: Joi.string().default('Layout'),
  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  ownerDetails: Joi.object({
    ownerName: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for OwnerName'),
    ownerContact:Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit number."}),
      ownerEmail: Joi.string().email().optional().allow('').lowercase(),
    
  }).required(),
  layoutDetails: Joi.object({
    reraRegistered: Joi.boolean().required(),
    dtcpApproved: Joi.boolean().required(),
    tlpApproved: Joi.boolean().required(),
    flpApproved: Joi.boolean().required(),
    layoutTitle: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for layoutTitle'),
    description: Joi.string().optional(),
    plotCount: Joi.number().required().min(0),
  availablePlots: Joi.number()
    .required()
    .min(0)
    .max(Joi.ref('plotCount')),
    plotSize: Joi.number().required().min(1),
    plotPrice: Joi.number().required().min(10),
    totalAmount: Joi.number().required(),
    address: Joi.object({
      pinCode:  Joi.string()
      .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
      .optional(),
      country: Joi.string().default('India').required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for country'),
      state: Joi.string().default('Andhra Pradesh').required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for state'),
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
  }).required(),
  amenities: Joi.object({
    underGroundWater: Joi.boolean().required(),
    drainageSystem: Joi.boolean().required(),
    electricityFacility: Joi.boolean().required(),
    swimmingPool: Joi.boolean().required(),
    playZone: Joi.boolean().required(),
    gym: Joi.boolean().required(),
    conventionHall: Joi.boolean().required(),
    medical: Joi.number().optional().min(0),
    educational: Joi.number().optional().min(0),
  }).optional(),
  uploadPics: Joi.array().items(Joi.string()).optional(),
});


//update plots schema 
const updatePlotsValidationSchema = Joi.object({
  userId:Joi.string().required(),
    propertyId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Property ID is required.',
        'any.required': 'Property ID is required.',
      }),
    availablePlots: Joi.number()
      .required()
      .min(0)
      .messages({
        'number.base': 'Available plots must be a number.',
        'number.min': 'Available plots cannot be negative.',
        'any.required': 'Available plots are required.',
      }),})


module.exports={
    layoutValidationSchema,updatePlotsValidationSchema
  }