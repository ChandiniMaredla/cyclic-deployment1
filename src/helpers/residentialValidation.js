const Joi = require("joi");

// Function to capitalize the first letter of each word
const capitalizeWords = (value) => {
  if (typeof value === "string") {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return value;
};

// Validation for residential property
const residentialSchema = Joi.object({
  userId: Joi.string().required(),

  propertyType: Joi.string().required(),

  rating: Joi.number().default(0), 
  ratingCount: Joi.number().default(0), 
  status: Joi.number().default(0).required(), 

  owner: Joi.object({
    ownerName: Joi.string()
      .required()
      .regex(/^[A-Za-z\s]+$/)
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for ownerName")
      .required(),

      ownerEmail: Joi.string().email().optional().allow('').lowercase(),
   
    contact: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required(),
  }).required(),

  propertyDetails: Joi.object({
    type: Joi.string().required(),

    apartmentName: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for appartmentName"),

    flatNumber: Joi.string().required(),

    apartmentLayout: Joi.string().required(),

    flatSize: Joi.number().required().min(1),

    flatCost: Joi.number().required().min(10),

    totalCost: Joi.number().required().min(0),

    flatFacing: Joi.string().required(),

    furnitured: Joi.string().required(),

    propDesc: Joi.string().optional(),
  }).required(),

  address: Joi.object({
    pincode: Joi.string()
      .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
      .optional(),

    country: Joi.string().default("India").required(),
    state: Joi.string().default("Andhra Pradesh").required(),

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

    village: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "formatting village"),
  }).required(), // Address is required

  amenities: Joi.object({
    powerSupply: Joi.boolean().required(),
    waterFacility: Joi.boolean().required(),
    electricityFacility: Joi.boolean().required(),
    elevator: Joi.boolean().required(),
    watchman: Joi.boolean().required(),
    cctv: Joi.boolean().required(),
    medical: Joi.number().min(0).required(),
    educational: Joi.number().min(0).required(),
    grocery: Joi.number().min(0).required(),
    gymFacility: Joi.boolean().required(),
  }).required(),

  propPhotos: Joi.array().items(Joi.string()).optional(),

  configurations: Joi.object({
    bathroomCount: Joi.number().min(0).required(),
    balconyCount: Joi.number().min(0).required(),
    floorNumber: Joi.number().min(0).required(),
    propertyAge: Joi.number().min(0).required(),
    maintenanceCost: Joi.number().min(0).required(),
    visitorParking: Joi.boolean().required(),
    waterSource: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for watersource")
      )
      .required(),
    playZone: Joi.boolean().required(),
    extraAmenities: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for extra amenities")
      )
      .optional(),
  }).required(),
});

module.exports = { residentialSchema };
