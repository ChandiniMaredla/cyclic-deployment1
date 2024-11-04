const mongoose = require("mongoose");

const agentRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
        type: "Number",
        default: 0,
      },
  
    agentId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const agentRatingModel = mongoose.model("agentRatings", agentRatingSchema);

module.exports = agentRatingModel;
