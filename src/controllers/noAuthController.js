
require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const secret_key = process.env.SECRET_KEY;
const {
  loginSchema,
  validateNumber,
  otpValidation,
} = require("../helpers/loginValidation");

// const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio account SID from environment variables
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio auth token from environment variables
const twilioNumber = process.env.TWILIO_NUMBER;
// const client = new twilio(accountSid, authToken);  // Twilio client
const twilio = require("twilio")(accountSid, authToken);
//send sms
const sendSMS = async (phoneNumber, body) => {
  const phone = `+91${phoneNumber}`; // Format the phone number correctly
  let msgOptions = {
    from: twilioNumber,
    to: phone,
    body: body,
  };
  try {
    const msg = await twilio.messages.create(msgOptions);
    return msg;
  } catch (err) {
  //  console.log(err);
    return err;
  }
};

let otpStore = {}; //store the otp in memory

// Function to generate and store OTP
function generateOtp(phoneNumber) {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  otpStore[phoneNumber] = otp; // Store OTP in memory, map it to the phone number
  console.log(otpStore[phoneNumber]);
  return otp;
}

// Function to verify OTP
function verifyOtp(phoneNumber, inputOtp) {
  const storedOtp = otpStore[phoneNumber]; // Get the stored OTP for this phone number
  console.log(otpStore[phoneNumber]);
  if (!storedOtp) {
    return false; // OTP not found for the phone number
  }
  if (parseInt(inputOtp) === storedOtp) {
    delete otpStore[phoneNumber]; // Remove OTP after successful verification
    return true; // OTP matches
  }
  return false; // OTP does not match
}

//otp login
const otpForLogin = async (req, res) => {
  try {
    const result = await validateNumber.validateAsync(req.body);
    let { phoneNumber } = result;
    console.log(phoneNumber);
    //let {phoneNumber}= req.params;
    let user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOtp(phoneNumber); // Format the phone number correctly
    const body = `Dear user, your One-Time Password (OTP) for logging into RealEstate Lokam is: "${otp}". Please use this code within 2 minutes to complete your login.`;
   const responseMsg= await sendSMS(phoneNumber, body);
   console.log(responseMsg);
   res.status(200).json({ smsResponse: responseMsg });
    //console.log("msg",responseMsg);
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
  }
};

const otpLogin = async (req, res) => {
  try {
    const result = await otpValidation.validateAsync(req.body);
    let { phoneNumber, otp } = result;

    // let {phoneNumber,otp}= req.body;
    let user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = verifyOtp(phoneNumber, otp);
    console.log(isMatch);
    if (isMatch) {
      const token = jwt.sign(
        {
          user: {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
        },
        secret_key,
        { expiresIn: "1d" }
      );
      // Send response with success status and token
      res.send({ success: true, token });
      return { token, message: "Login successful" };
    } else {
      // Send response with failure status if credentials are invalid
      res.status(400).send({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
  }
};

// Controller function for user login
const userLoginController = async (req, res) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    console.log(req.body);
    let { email, password } = result;
    // Find the user in the database by email and password
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        {
          user: {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
        },
        secret_key,
        { expiresIn: "1d" }
      );
      // Send response with success status and token
      res.send({ success: true, token });
      return { token, message: "Login successful" };
    } else {
      // Send response with failure status if credentials are invalid
      res.status(400).send({ message: "Invalid credentials", success: false });
      throw new Error("Invalid password or email");
    }
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
    throw new Error("Error during login: " + error.message);
  }
};

module.exports = { userLoginController, otpForLogin, otpLogin };
