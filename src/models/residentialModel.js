const mongoose = require("mongoose");

const residentialSchema = new mongoose.Schema(
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
    owner: {
      ownerName: {
        type: String,
        required: true,
      },
      ownerEmail: {
        type: String,
        trim: true,
        required: false,
        sparse: true,
      },
      contact: {
        type: String,
        required: true,
      },
    },
    propertyDetails: {
      type: {
        type: String,
        required: true,
      },
      apartmentName: {
        type: String,
      },
      flatNumber: {
        type: String,
      },
      apartmentLayout: {
        type: String,
      },
      flatSize: {
        type: Number,
      },
      flatCost: {
        type: Number,
      },
      totalCost: {
        type: Number,
      },
      flatFacing: {
        type: String,
      },

      furnitured: {
        type: String,
      },
      propDesc: {
        type: String,
      },
    },
    address: {
      pincode: {
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
    amenities: {
      powerSupply: {
        type: Boolean,
      },
      waterFacility: {
        type: Boolean,
      },
      electricityFacility: {
        type: Boolean,
      },
      elevator: {
        type: Boolean,
      },

      watchman: {
        type: Boolean,
      },
      cctv: {
        type: Boolean,
      },
      medical: {
        type: Number,
      },
      educational: {
        type: Number,
      },
      grocery: {
        type: Number,
      },
      gymFacility: {
        type: Boolean,
      },
    },
    propPhotos: {
      type: [String],
    },
    configurations: {
      bathroomCount: {
        type: Number,
        required: true,
      },
      balconyCount: {
        type: Number,
        required: true,
      },
      floorNumber: {
        type: Number,
        required: true,
      },
      propertyAge: {
        type: Number,
        required: true,
      },
      maintenanceCost: {
        type: Number,
        required: true,
      },
      visitorParking: {
        type: Boolean,
        required: true,
      },
      waterSource: {
        type: [String],
        required: true,
      },
      playZone: {
        type: Boolean,
        required: true,
      },
      extraAmenities: {
        type: [String],
      },
    },
  },
  { timestamps: true }
);

const residentialModel = mongoose.model("residential", residentialSchema);

module.exports = residentialModel;
