

const agentRatingModel = require("../models/agentRatingModel");
const userModel = require("../models/userModel");
const bookingModel = require("../models/bookingModel");
const {validateId} = require('../helpers/bookingValidation');
const { agentRatingValidation, validateLocation }= require('../helpers/agentRatingValidation');

//insertAgentRatings
const insertAgentRatings = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    // const firstName = req.user.user.firstName;
    // const lastName = req.user.user.lastName;
    const status = 1;
     console.log("agent rating", userId);
    console.log(req.body);
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is missing in request", success: false });
    }

    const ratingsData = {
      userId,
      // firstName,
      // lastName,
      status,
      ...req.body, // Spread the rest of the fields from the request body
    };

    const result= await agentRatingValidation.validateAsync(ratingsData);
    console.log(result);
    //console.log(fieldDetailsData);
    const ratings = new agentRatingModel(result);
    await ratings.save();
    res
      .status(201)
      .json({ message: "rating details added successfully", success: true });
  } catch (error) {
    if (error.isJoi === true){
      console.log(error)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: "Error inserting rating details", error });
  }
};

//api for agent to view his own ratings
const getAgentRatingsByAgentId = async (req, res) => {
  try {
    const agentId = req.user.user.userId;
    //console.log(userId)
    const ratings = await agentRatingModel.find({ agentId: agentId });

    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found" });
    }
const updatedRatings = await Promise.all(
  ratings.map(async (rating) => {
    // Fetch user details based on userId
    const user = await userModel.findById(rating.userId, 'firstName lastName role');
    
    // Add the user details to the rating result
    return {
      ...rating.toObject(), // Convert Mongoose document to plain object
      firstName: user.firstName,
      lastName: user.lastName,
        role: user.role
    };
  })
);
console.log("new ratings",updatedRatings);
    res.status(200).json(updatedRatings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//api for displaying ratings of an agent, agentId is sent through path params
const getAgentRatings = async (req, res) => {
  try {
    const result = await validateId.validateAsync(req.params);
    console.log("result",result);
    const agentId = result.agentId; 
    const ratings = await agentRatingModel.find({ agentId: agentId });
    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found" });
    }
    const updatedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Fetch user details based on userId
        const user = await userModel.findById(rating.userId, 'firstName lastName role');
        
        // Add the user details to the rating result
        return {
          ...rating.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
            role: user.role
        };
      })
    );
    res.status(200).json(updatedRatings);
  } catch (error) {
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: error.message });
  }
};



//get agents by location

const getAgentsbyloc = async (req, res) => {
  try {
    const result= await validateLocation.validateAsync(req.params);
    let { location } = result;
    const userId = req.user.user.userId; // Get userId from the token
    const buyerRole = 3; // Define buyer role
    const role = 1; // Role 1 is for agents

    // Format the location string (capitalize first letter)
    location =
      location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    if (!location) {
      return res.status(400).json({ message: "Location not found in token" });
    }

    const fields =
      "profilePicture firstName lastName pinCode city email phoneNumber";

    // Find agents with the specified role and location
    const users = await userModel.find({ role, city: location }, fields);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No agents found for this location" });
    }

    // Iterate over users and check the booking status for each agent
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if the current agent has any bookings by the user with the given buyerRole and userId
        const booking = await bookingModel
          .findOne({
            userId: userId,
            agentId: user._id, // The current agent's user ID
            role: buyerRole, // Buyer role
          })
          .sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the latest record

        // Add booking status to the user object
        const status = booking ? booking.status : 9; // If booking exists, use its status; otherwise, default to 0

        const ratings = await agentRatingModel.find({ agentId: user._id });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating
        const rating = ratings ? avgRating : null;

        //get the rating status of an user for a particular agent 
        const isRating = await agentRatingModel.findOne({agentId: user._id, userId: userId});
        const ratingStatus = isRating ? isRating.status : 0;

        // Return the user object with the added status field
        return {
          ...user.toObject(), // Convert the Mongoose document to a plain object
          status, // Add the status field
          rating,
          ratingStatus
        };
      })
    );
    const sortedUsers = usersWithStatus.sort((a, b) => {
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
    // Return the modified users with their booking status
    res.status(200).json(sortedUsers);
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  insertAgentRatings, 
  getAgentRatingsByAgentId, //unused
  getAgentRatings, //unused
  getAgentsbyloc,
};
