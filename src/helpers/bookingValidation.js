
const Joi = require("joi");


//buyer or seller booking
const userBookingSchema = Joi.object({
  userId: Joi.string().required(),

  role: Joi.number().valid(2, 3).required(),

  agentId: Joi.string().required(),

  propertyId: Joi.string().required(),
  propertyType: Joi.string().required(),

  date: Joi.date().min('now').required(),

  timing: Joi.string()
  .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // Matches "HH:mm:ss" format
  .required(),

  location:Joi.string()
  .required()
  .custom((value, helper) => {
    // Convert the first character to uppercase and the rest to lowercase
    const formattedValue =
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return formattedValue;
  }, "formatting location"),

 
});


//agent booking
const agentBookingSchema = Joi.object({
    userId: Joi.string().required(),
  
    role: Joi.number().valid(1).required(),
  
    agentId: Joi.string().required(),

    propertyId: Joi.string().required(),

    propertyType: Joi.string().required(),

    date: Joi.date().min('now').required(),
  
    timing: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // Matches "HH:mm:ss" format
    .required(),
  
    location:Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting location"),
  
   
  });


  // validating role and status for getting the bookings in agent page
  const validateRoleAndStatus = Joi.object({
    role: Joi.number().valid(2,3).required(),
    status: Joi.number().valid(-1,0,1,2,3).required()
  })

  //validating for updating booking status
  const validateBookingIdStatus= Joi.object({
bookingId: Joi.string().required(),
status: Joi.number().valid(-1,1,2,3,0).required()
  })

//validate ID's
const validateIds = Joi.object({
   userId: Joi.string().required(),
   agentId: Joi.string().required() 
})

//validating data for filters
const validateFilterData= Joi.object({
    role: Joi.number().valid(2,3).required(),
    location: Joi.string().required(),
    status: Joi.number().valid(-1,1,2,3,0).required()

})

const validateId= Joi.object({
    agentId: Joi.string().required()
})
module.exports = {
    userBookingSchema,agentBookingSchema,validateRoleAndStatus, validateBookingIdStatus, validateIds,validateFilterData, validateId
};
