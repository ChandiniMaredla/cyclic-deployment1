const { Request, Response } = require("express");
const wishlistModel = require("../models/wishlistModel");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");
const {wishlistSchema,deleteWishlistValidationSchema} = require('../helpers/wishListValidation');
// Add a property to the wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const wishlistDetailsData = {
      userId, 
      ...req.body, 
    };
    // Validate the data using Joi
    const validatedData = await wishlistSchema.validateAsync(wishlistDetailsData, { abortEarly: false });
    // Destructure the necessary fields from the validated data
    const { propertyId, propertyType, status = 1 } = validatedData;

    // Check if the property is already in the user's wishlist
    const propertyCheck = await wishlistModel.findOne({
      propertyId: propertyId,
      userId: userId,
    });

    if (propertyCheck) {
      return res.status(409).json({
        message: "Property is already added to wishlist",
        success: false,
      });
    }

    // Create the wishlist object
    const wishlist = new wishlistModel(validatedData);

    // Save the wishlist item to the database
    await wishlist.save();

    res.status(201).json({
      message: "Property added to wishlist successfully",
      success: true,
    });
  } catch (error) {
    if (error.isJoi) {
      // Handle Joi validation errors
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map(err => err.message), // Collect all validation error messages
        success: false,
      });
    }
    // Handle any other errors
    console.error("Error adding property to wishlist:", error);
    res.status(500).json({
      message: "Error adding property to wishlist",
      error,
      success: false,
    });
  }
};

//get wishlist items
// const getWishlist = async (req, res) => {
//   try {
//     const userId = req.user.user.userId;
//     const wishlistItems = await wishlistModel.find({ userId: userId }).sort({_id:-1});
//     //console.log(wishlistItems);
//     if (!wishlistItems || wishlistItems.length === 0) {
//       return res.status(404).json({ message: "Your wishlist is empty" });
//     }

//     const filteredWishlistItems = wishlistItems.map((item) => ({
//       propertyId: item.propertyId,
//       propertyType: item.propertyType,
//     }));

//     let propertyIds = [];
//     let propertyTypes = [];

//     for (let element of filteredWishlistItems) {
//       propertyIds.push(element.propertyId);
//       propertyTypes.push(element.propertyType);
//     }

//     let fields = [];
//     let residentials = [];
//     let commercials = [];
//     let layouts = [];

//     for (let i = 0; i < propertyIds.length; i++) {
//       if (propertyTypes[i] === "Agricultural") {
//         const result = await fieldModel.findOne(
//           { _id: propertyIds[i] },
//           {
//             "landDetails.images": 1,
//             "landDetails.totalPrice": 1,
//             "landDetails.title": 1,
//             "landDetails.size": 1,
//             "address.district": 1,
//           }
//         );
//         if (result) {
//           fields.push({
//             propertyId: propertyIds[i],
//             propertyType: propertyTypes[i],
//             images: result.landDetails.images,
//             price: result.landDetails.totalPrice,
//             size: result.landDetails.size,
//             title: result.landDetails.title,
//             district: result.address.district,
//           });
//         }
//       } else if (propertyTypes[i] === "Commercial") {
//         const result = await commercialModel.findOne(
//           { _id: propertyIds[i] },
//           {
//             "propertyDetails.uploadPics": 1,
//             "propertyDetails.landDetails": 1,
//             propertyTitle: 1,
//           }
//         );
//         if (result) {
//           let price;
//           let size;
//           if (result.propertyDetails.landDetails.sell.landUsage.length !== 0) {
//             price = result.propertyDetails.landDetails.sell.totalAmount;
//             size = result.propertyDetails.landDetails.sell.plotSize;
//           } else if (
//             result.propertyDetails.landDetails.rent.landUsage.length !== 0
//           ) {
//             price = result.propertyDetails.landDetails.rent.totalAmount;
//             size = result.propertyDetails.landDetails.rent.plotSize;
//           } else {
//             price = result.propertyDetails.landDetails.lease.totalAmount;
//             size = result.propertyDetails.landDetails.lease.plotSize;
//           }
//           commercials.push({
//             propertyId: propertyIds[i],
//             propertyType: propertyTypes[i],
//             images: result.propertyDetails.uploadPics,
//             price: price, //result.propertyDetails.landDetails.totalPrice, //price
//             size: size, //result.propertyDetails.landDetails.plotSize, //size
//             title: result.propertyTitle,
//             district: result.propertyDetails.landDetails.address.district,
//           });
//         }
//       } else if (propertyTypes[i] === "Residential") {
//         const result = await residentialModel.findOne(
//           { _id: propertyIds[i] },
//           {
//             propPhotos: 1,
//             "propertyDetails.flatCost": 1,
//             "propertyDetails.flatSize": 1,
//             "propertyDetails.apartmentName": 1,
//             "address.district": 1,
//           }
//         );
//         if (result) {
//           residentials.push({
//             propertyId: propertyIds[i],
//             propertyType: propertyTypes[i],
//             images: result.propPhotos,
//             price: result.propertyDetails.flatCost,
//             size: result.propertyDetails.flatSize,
//             title: result.propertyDetails.apartmentName,
//             district: result.address.district,
//           });
//         }
//       } else {
//         const result = await layoutModel.findOne(
//           { _id: propertyIds[i] },
//           {
//             uploadPics: 1,
//             "layoutDetails.layoutTitle": 1,
//             "layoutDetails.plotSize": 1,
//             "layoutDetails.totalAmount": 1,
//             "layoutDetails.address.district": 1,
//           }
//         );
//         if (result) {
//           layouts.push({
//             propertyId: propertyIds[i],
//             propertyType: propertyTypes[i],
//             images: result.uploadPics,
//             price: result.layoutDetails.totalAmount,
//             size: result.layoutDetails.plotSize,
//             title: result.layoutDetails.layoutTitle,
//             district: result.layoutDetails.address.district,
//           });
//         }
//       }
//     }

//     //response for empty wishlist
//     if (!fields && !commercials && !residentials && !layouts) {
//       res.status(404).json({ message: "Your wishlist is empty" });
//     }
//     res.status(200).json({
//       title1: "Agricultural property details",
//       fields: fields,
//       title2: "Commercial property details",
//       commercials: commercials,
//       title3: "Residential property details",
//       residentials: residentials,
//       title4: "Layout property details",
//       layouts: layouts,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching wishlist items", error });
//   }
// };

// getting all wishlist properties in a single array

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const wishlistItems = await wishlistModel.find({ userId: userId }).sort({_id:-1});
    //console.log(wishlistItems);
    if (!wishlistItems || wishlistItems.length === 0) {
      return res.status(404).json({ message: "Your wishlist is empty" });
    }

    const filteredWishlistItems = wishlistItems.map((item) => ({
      propertyId: item.propertyId,
      propertyType: item.propertyType,
    }));

    let propertyIds = [];
    let propertyTypes = [];

    for (let element of filteredWishlistItems) {
      propertyIds.push(element.propertyId);
      propertyTypes.push(element.propertyType);
    }

    let fields = [];
    let residentials = [];
    let commercials = [];
    let layouts = [];
let wishlistprops= [];
    for (let i = 0; i < propertyIds.length; i++) {
      if (propertyTypes[i] === "Agricultural") {
        const result = await fieldModel.findOne(
          { _id: propertyIds[i] },
          {
            "landDetails.images": 1,
            "landDetails.totalPrice": 1,
            "landDetails.title": 1,
            "landDetails.size": 1,
            "address.district": 1,
          }
        );
        if (result) {
          wishlistprops.push({
            propertyId: propertyIds[i],
            propertyType: propertyTypes[i],
            images: result.landDetails.images,
            price: result.landDetails.totalPrice,
            size: result.landDetails.size,
            title: result.landDetails.title,
            district: result.address.district,
          });
        }
      } else if (propertyTypes[i] === "Commercial") {
        const result = await commercialModel.findOne(
          { _id: propertyIds[i] },
          {
            "propertyDetails.uploadPics": 1,
            "propertyDetails.landDetails": 1,
            propertyTitle: 1,
          }
        );
        if (result) {
          let price;
          let size;
          if (result.propertyDetails.landDetails.sell.landUsage.length !== 0) {
            price = result.propertyDetails.landDetails.sell.totalAmount;
            size = result.propertyDetails.landDetails.sell.plotSize;
          } else if (
            result.propertyDetails.landDetails.rent.landUsage.length !== 0
          ) {
            price = result.propertyDetails.landDetails.rent.totalAmount;
            size = result.propertyDetails.landDetails.rent.plotSize;
          } else {
            price = result.propertyDetails.landDetails.lease.totalAmount;
            size = result.propertyDetails.landDetails.lease.plotSize;
          }
          wishlistprops.push({
            propertyId: propertyIds[i],
            propertyType: propertyTypes[i],
            images: result.propertyDetails.uploadPics,
            price: price, //result.propertyDetails.landDetails.totalPrice, //price
            size: size, //result.propertyDetails.landDetails.plotSize, //size
            title: result.propertyTitle,
            district: result.propertyDetails.landDetails.address.district,
          });
        }
      } else if (propertyTypes[i] === "Residential") {
        const result = await residentialModel.findOne(
          { _id: propertyIds[i] },
          {
            propPhotos: 1,
            "propertyDetails.flatCost": 1,
            "propertyDetails.flatSize": 1,
            "propertyDetails.apartmentName": 1,
            "address.district": 1,
          }
        );
        if (result) {
          wishlistprops.push({
            propertyId: propertyIds[i],
            propertyType: propertyTypes[i],
            images: result.propPhotos,
            price: result.propertyDetails.flatCost,
            size: result.propertyDetails.flatSize,
            title: result.propertyDetails.apartmentName,
            district: result.address.district,
          });
        }
      } else {
        const result = await layoutModel.findOne(
          { _id: propertyIds[i] },
          {
            uploadPics: 1,
            "layoutDetails.layoutTitle": 1,
            "layoutDetails.plotSize": 1,
            "layoutDetails.totalAmount": 1,
            "layoutDetails.address.district": 1,
          }
        );
        if (result) {
          wishlistprops.push({
            propertyId: propertyIds[i],
            propertyType: propertyTypes[i],
            images: result.uploadPics,
            price: result.layoutDetails.totalAmount,
            size: result.layoutDetails.plotSize,
            title: result.layoutDetails.layoutTitle,
            district: result.layoutDetails.address.district,
          });
        }
      }
    }

    //response for empty wishlist
    if (!fields && !commercials && !residentials && !layouts) {
      res.status(404).json({ message: "Your wishlist is empty" });
    }
    res.status(200).json({
      wishlistprops
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist items", error });
  }
};


//delete from wishlist by propertyid
const deleteFromWishlist = async (req, res) => {
  try {
    // Validate the request params (propertyId)
    const { error } = deleteWishlistValidationSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.user.userId; // User ID from the token
    const { propertyId } = req.params; // Property ID from params

    // Find and delete the wishlist item
    const deletedItem = await wishlistModel.findOneAndDelete({
      userId,
      propertyId
    });

    if (!deletedItem) {
      return res
        .status(404)
        .json({ message: "This Property is not in WishList to Delete", success: false });
    }

    // Successfully deleted
    res.status(200).json({
      message: "Property removed from wishlist successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error removing property from wishlist:", error);
    res
      .status(500)
      .json({ message: "Error removing property from wishlist", error });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
};
