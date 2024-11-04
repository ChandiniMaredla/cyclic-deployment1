const Joi = require("joi");

const registrationSchema = Joi.object({
  firstName: Joi.string()
    .required().regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting first name"),

  lastName: Joi.string()
    .required().regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting last name"),

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  email: Joi.string().email().lowercase().required(),

  pinCode: Joi.string()
    .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
    .required(),

  city: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting city"),

  state: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase();
      return formattedValue;
    }, "formatting state"),

  country: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting country"),

  city: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting city"),

  // password: Joi.string().required().min(5).max(15)
  // .pattern(
  //   new RegExp(
  //      //"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W)[A-Z][a-zA-Z\\d\\W]{7,}$"
  //   )      
  // )  
  //   .message(
  //     "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
  //   ),
  password : Joi.string()
  .required()
  .min(5)
  .max(15)
  .pattern(
    new RegExp(
      "^(?=[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])[A-Z][A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{7,14}$"
    )
  )
  .message(
    "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
  ),

  district: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting district"),

  mandal: Joi.string()
    .required()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting mandal"),

  role: Joi.number().integer().valid(1, 2, 3).required().messages({
    "any.only": "Role must be one of 1, 2, or 3.",
    "number.base": "Role must be a number.",
  }),

  profilePicture: Joi.string(),
});

//validation for role
const roleSchema = Joi.object({
  role: Joi.number().integer().valid(1, 2, 3).required().messages({
    "any.only": "Role must be one of 1, 2, or 3.",
    "number.base": "Role must be a number.",
  }),
});

//validation for update profile data
const newProfileSchema = Joi.object({
  firstName: Joi.string()
  .required().regex(/^[A-Za-z]+$/)
  .custom((value, helper) => {
    // Convert the first character to uppercase and the rest to lowercase
    const formattedValue =
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return formattedValue;
  }, "formatting first name"),

lastName: Joi.string()
  .required().regex(/^[A-Za-z]+$/)
  .custom((value, helper) => {
    // Convert the first character to uppercase and the rest to lowercase
    const formattedValue =
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return formattedValue;
  }, "formatting last name"),
  
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Z][a-zA-Z\\d@$!%*?&]{7,}$"
      )
    )
    .message(
      "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
    ),

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  profilePicture: Joi.string(),
});

module.exports = {
  registrationSchema,
  roleSchema,
  newProfileSchema,
};
