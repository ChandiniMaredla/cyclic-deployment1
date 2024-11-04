// Define schema for locations collection

const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  district: String,
  mandal: String,
  villages: Array,
});

// Create a model
const locationModel = mongoose.model("locations", locationSchema);

module.exports = locationModel;
