const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    propertyId: {
      type: String,
    },
    propertyType: {
      type: String,
    },
  },
  { timestamps: true }
);

const wishlistModel = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlistModel;
