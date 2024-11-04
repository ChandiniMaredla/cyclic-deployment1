

const bookingModel = require("../models/bookingModel");
const userModel = require("../models/userModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");

const mongoose = require("mongoose");
const {
  userBookingSchema,
  agentBookingSchema,
  validateRoleAndStatus,
  validateBookingIdStatus,
  validateIds,
  validateFilterData,
  validateId,
} = require("../helpers/bookingValidation");

//api for a buyer/ seller to book appointment
const createBooking = async (req, res) => {
  try {
    const {
      userId,
      role,
      // firstName,
      // lastName,
      // email,
      // phoneNumber,
      // profilePicture,
    } = req.user.user;
    const details = {
      userId,
      role,
      // firstName,
      // lastName,
      // email,
      // phoneNumber,
      // profilePicture,
      ...req.body,
    };
    const result = await userBookingSchema.validateAsync(details);
    const booking = new bookingModel(result);
    await booking.save();
    res.status(200).send({ message: "Booked Successfully", success: true });
  } catch (error) {
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    console.error("Error Details:", error);
    res
      .status(400)
      .send({ message: "Error in booking", error: error.message || error });
  }
};

//api for an agent to book appointment
const createAgentBooking = async (req, res) => {
  try {
    const {role} = req.user.user;  //, firstName, lastName, email, phoneNumber, profilePicture } =     
    const agentId = req.user.user.userId;
    console.log(agentId);
    const details = {
      agentId,
      role,
      // firstName,
      // lastName,
      // email,
      // phoneNumber,
      // profilePicture,
      ...req.body,
    };
    const result = await agentBookingSchema.validateAsync(details);
    const booking = new bookingModel(result);
    await booking.save();
    res.status(200).send({ message: "Booked Successfully", success: true });
  } catch (error) {
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    console.error("Error Details:", error);
    res
      .status(400)
      .send({ message: "Error in booking", error: error.message || error });
  }
};

//get details of buyer/seller who booked appointement with agent
const getUserBookings = async (req, res) => {
  try {
    const agentId = req.user.user.userId; // Extract agentId from the token
    const { role } = req.params; //role of buyer or seller
    //  console.log(propertyId);
    console.log(role);
    if (role !== "2" && role !== "3") {
      return res.status(400).json("Incorrect role");
    }
    const bookings = await bookingModel
      .find({ role: role, agentId: agentId })
      .sort({ _id: -1 });
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }


    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(booking.userId, 'firstName lastName email phoneNumber profilePicture');
     
        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;
        
        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { "propertyTitle": 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res.status(400).json({ message: "Invalid property type", success: false });
        }
        
        const property = await propertyModel.findById(propertyId, projection).exec();
        
        let title;
        if (propertyType === "Agricultural land" && property?.landDetails?.title) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
          title = property.propertyDetails.apartmentName;
        } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            propertyName: title,
            propertyId: propertyId
        };
      })
    );


    res.status(200).json(updatedbookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get user bookings based on status(accepted(1),rejected(-1), booked(2), pending(0))
//get details of buyer/seller who booked appointement with agent
const getUserBookingsByStatus = async (req, res) => {
  try {
    const agentId = req.user.user.userId; // Extract agentId from the token
    const result= await validateRoleAndStatus.validateAsync(req.params);
    const { role, status } = result; // role of buyer or seller
    //  if status is 3, all bookings will be displayed irrespective of status
    let bookings;
    if (parseInt(status) === 3) {
      bookings = await bookingModel
        .find({ role: role, agentId: agentId })
        .sort({ _id: -1 });
    } else {
      bookings = await bookingModel.find({
        role: role,
        agentId: agentId,
        status: status,
      }).sort({ _id: -1 });
    }
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    console.log(bookings);
    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(booking.userId, 'firstName lastName email phoneNumber profilePicture');
        console.log(booking.propertyType);
        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;
        
        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { "propertyTitle": 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res.status(400).json({ message: "Invalid property type", success: false });
        }
        
        const property = await propertyModel.findById(propertyId, projection).exec();
        let title;
        if (propertyType === "Agricultural land" && property?.landDetails?.title) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
          title = property.propertyDetails.apartmentName;
        } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            propertyName: title,
            propertyId: propertyId
        };
    
      })
    );
    res.status(200).json(updatedbookings);
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

//get userbookings based on name
//get details of buyer/seller who booked appointement with agent
const getBookingByName = async (req, res) => {
  try {
    const agentId = req.user.user.userId; // Extract agentId from the token
    const { role, name } = req.params; //role of buyer or seller
    const words = name.split(" ");
    const firstName = words[0];
    const lastName = words[1];
    console.log(firstName);
    console.log(lastName);
    const bookings = await bookingModel.find({
      role: role,
      agentId: agentId,
      firstName,
      lastName,
    });
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "This user did not book any appointment" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get details of agents who booked appointments with that user
const getAgentBookings = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const role = 1; //role 1
    const bookings = await bookingModel.find({ role: role, userId: userId }).sort({ _id: -1 });
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(booking.agentId, 'firstName lastName email phoneNumber profilePicture');
        
            let propertyModel;
            let projection = {};
            let propertyType = booking.propertyType;
            let propertyId = booking.propertyId;
            
            if (propertyType === "Agricultural land") {
              propertyModel = fieldModel;
              projection = { "landDetails.title": 1 }; // Include the field
            } else if (propertyType === "Commercial") {
              propertyModel = commercialModel;
              projection = { "propertyTitle": 1 }; // Include the field
            } else if (propertyType === "Residential") {
              propertyModel = residentialModel;
              projection = { "propertyDetails.apartmentName": 1 }; // Include the field
            } else if (propertyType === "Layout") {
              propertyModel = layoutModel;
              projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
            } else {
              return res.status(400).json({ message: "Invalid property type", success: false });
            }
            
            const property = await propertyModel.findById(propertyId, projection).exec();
            
            let title;
            if (propertyType === "Agricultural land" && property?.landDetails?.title) {
              title = property.landDetails.title;
            } else if (propertyType === "Commercial" && property?.propertyTitle) {
              title = property.propertyTitle;
            } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
              title = property.propertyDetails.apartmentName;
            } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
              title = property.layoutDetails.layoutTitle;
            }
            // Add the user details to the rating result
            return {
              ...booking.toObject(), // Convert Mongoose document to plain object
              firstName: user.firstName,
              lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                propertyName: title,
                propertyId: propertyId
            };
      
      })
    );
    res.status(200).json(updatedbookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const result= await validateBookingIdStatus.validateAsync(req.params);
    const bookingId = result.bookingId; // Get bookingId from request parameters
    const status = result.status; // Get status from request body
    // Ensure status is either 0 or 1
    // Update the booking status
    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { status: status },
      { new: true }
    );
    // If no booking found with the given id
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const resultData = {
      _id: updatedBooking._id,
      status: updatedBooking.status,
    };
    console.log(resultData);
    // Return the updated booking
    res
      .status(200)
      .json({ message: "Booking status updated successfully", resultData });
  } catch (error) {
    // Handle any errors
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: "Error updating booking status", error });
  }
};

//update status of apntmnt to 0 if it is 2 -----> only for backend use to clear db collection
const updateStatus = async (req, res) => {
  try {
    // Update all bookings where the status is 2 to 0
    const updatedBookings = await bookingModel.updateMany(
      { status: 2 }, // Condition to find bookings with status 2
      { $set: { status: 0 } } // Update status to 0
    );

    // If no bookings found with the given status
    if (updatedBookings.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No bookings with status 2 found" });
    }

    // Return the result of the update operation
    res.status(200).json({
      message: "Booking statuses updated successfully",
      updatedCount: updatedBookings.modifiedCount,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error updating booking statuses", error });
  }
};

//get booking details of agent- accepting and rebooking with a user
const getBookingByUserAndAgent = async (req, res) => {
  try {
    const result= await validateIds.validateAsync(req.params);
    console.log("result",result);
    const { userId, agentId } = result; // Extract userId and agentId from path parameters
    // Query to find booking where userId, agentId match and role = 1
    const booking = await bookingModel
      .findOne({
        userId: userId,
        agentId: agentId,
        role: 1, // Ensure role is 1
      })
      .sort({ _id: -1 });
    // If no booking found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    console.log(booking);
    // Return the found booking
    res.status(200).json({ message: "Booking found", booking });
  } catch (error) {
    // Handle errors
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

//get booking details of buyer- accepting and rebooking with an agent
const rebookingWithAgent = async (req, res) => {
  try {
    const result= await validateIds.validateAsync(req,params);
    const { userId, agentId } = result; // Extract userId and agentId from path parameters

    // Query to find booking where userId, agentId match and role = 1
    const booking = await bookingModel.findOne({
      userId: userId,
      agentId: agentId,
      role: 3, // Ensure role is 3
    });

    // If no booking found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
// Fetch user details based on userId
const user = await userModel.findById(booking.userId, 'firstName lastName email phoneNumber profilePicture');      
// Add the user details to the rating result
booking =  {
  ...booking.toObject(), // Convert Mongoose document to plain object
  firstName: user.firstName,
  lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture
};
    // Return the found booking
    res.status(200).json({ message: "Booking found", booking });
  } catch (error) {
    // Handle errors
    console.log(error);
    if (error.isJoi === true){
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

//delete--- my use
const deleteappointment = async (req, res) => {
  try {
    const deleted = await bookingModel.deleteMany({ role: 1 });
    // Return the result of the update operation
    res.status(200).json({
      message: "Booking statuses updated successfully",
      updatedCount: deleted.modifiedCount,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error updating booking statuses", error });
  }
};

// const getByFilters = async (req, res) => {
//   try {
//     const agentId = req.user.user.userId; // Extract agentId from the token
//     const { role, location, status } = req.params; // role of buyer or seller
//     //  if status is 3, all bookings will be displayed irrespective of status
//     let bookings;
//     if (location === "@") {
//       if (parseInt(status) === 3) {
//         bookings = await bookingModel.find({ role: role, agentId: agentId });
//       } else {
//         bookings = await bookingModel.find({
//           role: role,
//           agentId: agentId,
//           status: status,
//         });
//       }
//     } else {
//       if (parseInt(status) === 3) {
//         bookings = await bookingModel.find({
//           role: role,
//           agentId: agentId,
//           location:location
//         });
//       } else {
//         bookings = await bookingModel.find({
//           role: role,
//           agentId: agentId,
//           status: status,
//           location:location
//         });
//       }
//     }
//     if (bookings.length === 0) {
//       return res.status(404).json({ message: "No bookings found" });
//     }

//     res.status(200).json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//get bookings by filters--- for agent login
const getByFilters = async (req, res) => {
  try {
    const agentId = req.user.user.userId; // Extract agentId from the token
    const result= await validateFilterData.validateAsync(req.params);
    const { role, location, status } = result; // Role of buyer or seller

    let query = {
      role: role,
      agentId: agentId,
    };

    if (parseInt(status) !== 3) {
      query.status = status;
    }

    if (location !== "@") {
      query.location = new RegExp(location, "i"); // Case-insensitive search
    }

    const bookings = await bookingModel.find(query).sort({ _id: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(booking.userId, 'firstName lastName email phoneNumber profilePicture');
        
        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;
        
        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { "propertyTitle": 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res.status(400).json({ message: "Invalid property type", success: false });
        }
        
        const property = await propertyModel.findById(propertyId, projection).exec();
        
        let title;
        if (propertyType === "Agricultural land" && property?.landDetails?.title) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
          title = property.propertyDetails.apartmentName;
        } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            propertyName: title,
            propertyId: propertyId
        };
      })
    );


    res.status(200).json(updatedbookings);

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

//get bookings by filters--- for buyer login(not used)
const getBookingByFilters = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const { name, status } = req.params;
    //  if status is 3, all bookings will be displayed irrespective of status
    let bookings;
    if (name === "@") {
      if (parseInt(status) === 3) {
        bookings = await bookingModel
          .find({ role: 1, userId: userId })
          .sort({ _id: -1 });
      } else {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            status: status,
          })
          .sort({ _id: -1 });
      }
    } else {
      const words = name.split(" ");
      let firstName = words[0];
      let lastName = words[1];
      console.log(firstName);
      console.log(lastName);
      if (parseInt(status) === 3) {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            firstName,
            lastName,
          })
          .sort({ _id: -1 });
      } else {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            status: status,
            firstName,
            lastName,
          })
          .sort({ _id: -1 });
      }
    }
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//buyer requested agents
const getBuyerBookings = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const role = 3; // Role for buyer
    const fields = "agentId date timing location status createdAt updatedAt propertyId propertyType";

    // Fetch the bookings for the given user and role
    const bookings = await bookingModel
      .find({ role: role, userId: userId })
      .select(fields)
      .sort({ _id: -1 });
    console.log("bookings", bookings);
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const fields2 = "firstName lastName phoneNumber email profilePicture role";

    // Use Promise.all to process each booking
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const agentId = booking.agentId;

        // Check if agentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
          // If invalid, return booking without agentDetails
          return {
            ...booking._doc, // Spread the original booking data
            agentDetails: null, // Set agentDetails to null for invalid agentId
          };
        }

        // Fetch agent details using valid ObjectId
        const agentDetails = await userModel
          .findOne({ _id: agentId })
          .select(fields2);

        // const status = booking.status;
        // if (status === 2) {
        //   // Find the record created around the time of the current booking's updatedAt
        //   const timeMargin = 5 * 60 * 1000; // 5 minutes in milliseconds
        //   const createdAtNearUpdatedAt = await bookingModel
        //     .findOne({
        //       userId: userId,
        //       role: 1,
        //       agentId: agentId,
        //       createdAt: {
        //         $gte: new Date(booking.updatedAt.getTime() - timeMargin),
        //         $lte: new Date(booking.updatedAt.getTime() + timeMargin),
        //       },
        //     })
        //     .select("date timing location createdAt updatedAt");

        //   if (createdAtNearUpdatedAt) {
        //     return {
        //       ...booking._doc, // Handle Mongoose document format
        //       firstName: agentDetails.firstName,
        //       lastName: agentDetails.lastName,
        //       phoneNumber: agentDetails.phoneNumber,
        //       email: agentDetails.email,
        //       profilePicture: agentDetails.profilePicture,
        //       newDate: createdAtNearUpdatedAt.date,
        //       newTime: createdAtNearUpdatedAt.timing,
        //       newLocation: createdAtNearUpdatedAt.location,
        //       newCreatedAt: createdAtNearUpdatedAt.createdAt,
        //       newUpdatedAt: createdAtNearUpdatedAt.updatedAt,
        //     };
        //   }
        // }


        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;
        
        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { "propertyTitle": 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res.status(400).json({ message: "Invalid property type", success: false });
        }
        
        const property = await propertyModel.findById(propertyId, projection).exec();
        
        let title;
        if (propertyType === "Agricultural land" && property?.landDetails?.title) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
          title = property.propertyDetails.apartmentName;
        } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
          title = property.layoutDetails.layoutTitle;
        }

        // Attach the agent details to the booking
        return {
          ...booking._doc, // Handle Mongoose document format
          firstName: agentDetails.firstName,
          lastName: agentDetails.lastName,
          phoneNumber: agentDetails.phoneNumber,
          email: agentDetails.email,
          profilePicture: agentDetails.profilePicture,
          propertyName: title
        };
      })
    );
    console.log("bookings.................", updatedBookings);
    // Send the updated bookings with agent details attached
    res.status(200).json(updatedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all the buyer requests for a particular agent
const getBuyerReqForAgent = async (req, res) => {
  const userId = req.user.user.userId;
  const role = 3;
  try {
    const result= await validateId.validateAsync(req.params);
    const { agentId } = result;
    const fields = "date timing location status createdAt updatedAt propertyId propertyType";
    const requests = await bookingModel.find(
      { userId: userId, role: role, agentId: agentId },
      fields
    ).sort({ _id: -1 });
    if (requests.length === 0) {
     return res.status(404).json("No bookings found");
    }

    const newBookings = await Promise.all(
      requests.map(async (booking) => {
        // if (booking.status === 2) {
        //   const timeMargin = 5 * 60 * 1000; // 5 minutes in milliseconds
        //   const createdAtNearUpdatedAt = await bookingModel
        //     .findOne({
        //       userId: userId,
        //       role: 1,
        //       agentId: agentId,
        //       createdAt: {
        //         $gte: new Date(booking.updatedAt.getTime() - timeMargin),
        //         $lte: new Date(booking.updatedAt.getTime() + timeMargin),
        //       },
        //     })
        //     .select("date timing location createdAt updatedAt");

        //   if (createdAtNearUpdatedAt) {
        //     return {
        //       ...booking._doc, // Handle Mongoose document format
        //       newDate: createdAtNearUpdatedAt.date,
        //       newTime: createdAtNearUpdatedAt.timing,
        //       newLocation: createdAtNearUpdatedAt.location,
        //       newCreatedAt: createdAtNearUpdatedAt.createdAt,
        //       newUpdatedAt: createdAtNearUpdatedAt.updatedAt,
        //       propertyName: title
        //     };
        //   }
        // }

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;
        
        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { "propertyTitle": 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res.status(400).json({ message: "Invalid property type", success: false });
        }
        
        const property = await propertyModel.findById(propertyId, projection).exec();
        
        let title;
        if (propertyType === "Agricultural land" && property?.landDetails?.title) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (propertyType === "Residential" && property?.propertyDetails?.apartmentName) {
          title = property.propertyDetails.apartmentName;
        } else if (propertyType === "Layout" && property?.layoutDetails?.layoutTitle) {
          title = property.layoutDetails.layoutTitle;
        }

        return {
          ...booking._doc,
          propertyName: title
        };
      })
    );

    res.status(200).json(newBookings);
  } catch (error) {
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });}
    res.status(500).json({ message: "Error fetching details", error: error });
  }
};

module.exports = {
  //buyer
  createBooking,
  getAgentBookings,
  rebookingWithAgent,
  getBuyerBookings,
  getBuyerReqForAgent,

  updateBookingStatus, // both agent and buyer

  //agent
  createAgentBooking,
  getUserBookings,
  getBookingByUserAndAgent,
  getBookingByFilters,

  //filter
  getByFilters, //agent filter
  getUserBookingsByStatus, //unused
  getBookingByName, //unused

  // for my use
  updateStatus,
  deleteappointment,
}; // Export as an object
