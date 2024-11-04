const layoutModel = require("../models/layoutModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const {layoutValidationSchema, updatePlotsValidationSchema} = require('../helpers/layoutValidation');






// Create a new field
const insertLayoutDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const layoutDetailsData = {
      userId,
      role,
      ...req.body, // Spread the rest of the fields from the request body
    };
    // Validate the request body against the Joi schema
    const result = await layoutValidationSchema.validateAsync(layoutDetailsData);
    console.log("result",result);

    const layoutDetails = new layoutModel(result);
    await layoutDetails.save();
    res.status(201).json({ message: "Layout details added successfully", success: true });
  } catch (error) {
    if (error.isJoi) {console.log(error);
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
        success: false,
      });
    }   
    res.status(500).json({ message: "Error inserting layout details", error });
  }
};
// Function to get all layout properties added by that user
const getLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const layouts = await layoutModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });
    if (layouts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(layouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all layouts

const getAllLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role= req.user.user.role;
    // Fetch all layouts
let layouts;
if(role === 3){
  layouts = await layoutModel.find({status:0}).sort({updatedAt: -1 });
}
else{
    layouts = await layoutModel.find().sort({ status: 1, updatedAt: -1 });
}

    if (layouts.length === 0) {
      return res.status(200).json([]);
    }

    // Extract property IDs
    const propertyIds = layouts.map((property) => property._id.toString());

    // Fetch wishlist statuses for all property IDs
    const statuses = await wishlistModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    const ratingstatuses = await propertyRatingModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    // Create a map for quick status lookup
    const statusMap = statuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});

    const ratingstatusMap = ratingstatuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});
    // Add wishStatus to each layout item
    const updatedLayouts = layouts.map((layout) => {
      const layoutObj = layout.toObject(); // Convert Mongoose document to plain object
      layoutObj.wishStatus = statusMap[layout._id.toString()] || 0;
      layoutObj.ratingStatus = ratingstatusMap[layout._id.toString()] || 0; // Default to 0 if not found
      return layoutObj;
    });

    res.status(200).json(updatedLayouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//update available plots
const updateplots = async (req, res) => {
  try {
    // Extract userId from the authenticated user
    const userId = req.user.user.userId;

    // Prepare the data to be validated
    const updateData = {
      ...req.body, // Spread the request body which includes propertyId and availablePlots
      userId // Include the userId from the token
    };

    // Validate the request body using the Joi schema
    const validatedData = await updatePlotsValidationSchema.validateAsync(updateData, { abortEarly: false });

    const { propertyId, availablePlots } = validatedData;

    // Check if the property belongs to the user
    const property = await layoutModel.findOne({ _id: propertyId, userId: userId });
    if (!property) {
      return res.status(404).json({ message: "This is not your property to update." });
    }

    // Update the available plots
    const updatedProperty = await layoutModel.findOneAndUpdate(
      { _id: propertyId, userId: userId }, // Ensure the propertyId belongs to the user
      { $set: { "layoutDetails.availablePlots": availablePlots } }, // Update availablePlots
      { new: true } // Return the updated document
    );

    // Check if the property was found and updated
    if (!updatedProperty) {
      return res.status(404).json({ message: "No property found with the specified ID." });
    }

    return res.status(200).json({ message: "Updated successfully", property: updatedProperty });
  } catch (error) {
    if (error.isJoi) {
      // Handle Joi validation errors
      console.log(error);
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
      });
    }
    // Handle any other errors
    console.error("Error updating available plots:", error);
    return res.status(500).json({ message: "Error updating available plots", error });
  }
};

// Export functions
module.exports = {
  insertLayoutDetails,
  getLayouts,
  getAllLayouts,
  updateplots,
};
