//const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const saltRounds = 10;
const { registrationSchema, roleSchema, newProfileSchema } = require("../helpers/userValidation");

// Controller to get all users
const getUsers = async (req, res) => {
  try {
    const data = await userModel.find();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

//get users based on role
//get agents
const getUsersByRole = async (req, res) => {
  try {
    const result= await roleSchema.validateAsync(req.params);
    const { role } = result;
// role 1 - agent, 2-seller, 3-buyer
    const users = await userModel.find({ role: role });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found with this role" });
    }

    res.status(200).json(users);
  } catch (error) {
    if(error.isJoi === true) return res.status(422).json({status: "error",
      message: error.details.map((detail) => detail.message).join(", "),});
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Controller to create a new user
const createUser = async (req, res) => {
  try {
    console.log("password",req.body.password);
    const result = await registrationSchema.validateAsync(req.body);
console.log("result",result.password);
const exists = await userModel.findOne({phoneNumber: result.phoneNumber});
if(exists){
  console.log("User with this phone number already exists");
  return res.status(409).json("phone number exists");
}
const emailCheck = await userModel.findOne({email:result.email});
if(emailCheck){
  console.log("User with this email already exists");
  return res.status(409).json("email exists");
}
    const user = new userModel(result);
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    if (user.profilePicture === "") {
      user.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    // user
    //   .save()
    //   .then(() => {
    //     res.status(201).json({
    //       message: "User Added Successfully",
    //       success: true,
    //       user: user,
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error.errmsg);
    //     res.status(400).send({
    //       message: "Registration failed",
    //       error: error.errmsg,
    //     });
    //   });
    await user.save();
    res.status(201).json({message: "User added successfully", success: true, user: user})
  } catch (error) {
    if (error.isJoi === true){
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
  // For non-Joi errors, send a generic 500 error
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
}

// Controller to update a user
// const updateUser = async (req, res) => {
//   // const updateData = await newProfileSchema.validateAsync(req.body);
//   const updateData= req.body;
//   const userId = req.user.user.userId;
//   if (updateData.hasOwnProperty("password")) {
//     // Password key is present, encrypt it
//     bcrypt.hash(
//       updateData.password,
//       saltRounds,
//       async (err, hashedPassword) => {
//         if (err) {
//           // Handle the error
//           return res
//             .status(500)
//             .send({ message: "Error hashing password", error: err.message });
//         }

//         // Update the password with the hashed version
//         updateData.password = hashedPassword;

//         // Now proceed to update the user data in the database
//         try {
//           const updatedUser = await userModel.findByIdAndUpdate(
//             userId,
//             updateData,
//             { new: true, runValidators: true }
//           );
//           res.send({ message: "User updated successfully", user: updatedUser });
//         } catch (error) {
//            if (error.isJoi === true)
//         return res.status(422).json({
//           status: "error",
//           message: error.details.map((detail) => detail.message).join(", "),
//         });
//           res
//             .status(500)
//             .send({ message: "Error updating user", error: error.message });
//         }
//       }
//     );
//   } else {
//     // If there's no password, just update the other fields
//     try {
//       const updatedUser = await userModel.findByIdAndUpdate(
//         userId,
//         updateData,
//         { new: true, runValidators: true }
//       );
//       res.send({ message: "User updated successfully", user: updatedUser });
//     } catch (error) {
//       if (error.isJoi === true)
//         return res.status(422).json({
//           status: "error",
//           message: error.details.map((detail) => detail.message).join(", "),
//         });
//       res
//         .status(500)
//         .send({ message: "Error updating user", error: error.message });
//     }
//   }
// };


const updateUser = async (req, res) => {
  try {
    const updateData = await newProfileSchema.validateAsync(req.body);
    const userId = req.user.user.userId;
    // Check if password key is present, encrypt it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      // Update the password with the hashed version
      updateData.password = hashedPassword;
    }
// const numberExists = await userModel.findOne({phoneNumber:updateData.phoneNumber});
// if(numberExists){
//   return res.status(409).json("User with this phone number already exists");
// }
//console.log(numberExists);
    // Update user information in the database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    console.log(updatedUser);
    res.send({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).send({ message: "Error updating user", error: error.message });
  }
};


// Controller to delete a user
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.user.userId;

    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found", success: false });
    }

    res.send({ message: "User Deleted Successfully", success: true });
  } catch (error) {
    res.status(500).send(error);
  }
};

//getProfile
const getProfile = async (req, res) => {
  try {
    // Assuming userId is provided in the request (e.g., from req.user)
    const userId = req.user.user.userId; // Adjust this based on your setup

    // Define the fields you want to retrieve
    const fields =
      "profilePicture firstName lastName pinCode city email phoneNumber";

    // Find the user and project the specified fields
    const user = await userModel.findById(userId, fields).exec();

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error retrieving user profile", error });
  }
};

//get user names based on role
const namesBasedOnRole = async (req, res) => {
  try {
    const result= await roleSchema.validateAsync(req.params);
    const { role } = result;
    const fields = "firstName lastName";
    const details = await userModel.find({ role: role }, fields);
    let names = [];
    for (let element of details) {
      let fullName = element.firstName + " " + element.lastName;
      names.push(fullName);
    }
    if (names) {
      res.status(200).json(names.sort());
    } else {
      res.status(404).json({ message: "Users not found" });
    }
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    res.status(500).json({ message: "Error retrieving names", error });
  }
};

module.exports = {
  createUser,
  deleteUser, //unused
  getUsers, //unused
  updateUser,
  getProfile,
  getUsersByRole, //unused
  namesBasedOnRole,
};
