const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      match: /^[0-9]{10}$/, 
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      required: true,
    },
    pinCode: {
      type: Number,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
      default: "Andhra Pradesh",
    },
    country: {
      type: String,
      default: "India",
    },
    password: {
      type: String,
      required: true,
    },
    district: {
      type: String,
    },
    mandal: {
      type: String,
    },
    role: {
      type: Number,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
