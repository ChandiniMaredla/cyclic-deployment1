const mongoose = require("mongoose");

const propertyRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: "Number",
      default: 0,
    },
    propertyId: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
    },
    // review: {
    //     type: String,
    // }
  },
  { timestamps: true }
);

const propertyRatingModel = mongoose.model(
  "propertyRatings",
  propertyRatingSchema
);

module.exports = propertyRatingModel;
