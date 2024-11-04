const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    countOfRatings: {
      type: Object
          },
    status: {
      type: Number,
      default: 0,
    },
    propertyDetails: {
      owner: {
        ownerName: {
          type: String,
        },
        ownerContact: {
          type: String,
        },
        ownerEmail: {
          type: String,
        },
        isLegalDispute: {
          type: Boolean,
        },
        disputeDesc: {
          type: String,
        },
      },
      landDetails: {
        sell: {
          plotSize: String,
          price: Number,
          totalAmount: Number,
          landUsage: [String],
        },
        rent: {
          plotSize: String,
          rent: Number,
          noOfMonths: Number,
          totalAmount: Number,
          landUsage: [String],
        },
        lease: {
          plotSize: String,
          leasePrice: Number,
          duration: Number,
          totalAmount: Number,
          landUsage: [String],
        },
        address: {
          pinCode: {
            type: String,
            required: false,
          },
          country: {
            type: String,
            default: "India",
          },
          state: {
            type: String,
            default: "Andhra Pradesh",
          },
          district: {
            type: String,
            required: true,
          },
          mandal: {
            type: String,
            required: true,
          },
          village: {
            type: String,
            required: true,
          },
        },
        description: {
          type: String,
        },
      },

      amenities: {
        isElectricity: Boolean,
        isWaterFacility: Boolean,
        isRoadFace: Boolean,
      },
      uploadPics: {
        type: [String],
      },
    },
  },
  { timestamps: true }
);

const commercialModel = mongoose.model("Commercial", commercialSchema);

module.exports = commercialModel;
