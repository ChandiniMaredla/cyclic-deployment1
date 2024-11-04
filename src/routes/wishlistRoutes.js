const express = require("express");
// const { getBuyers, createBuyer } = require('../controllers/buyersController');
const {
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
} = require("../controllers/wishListController");

const wishlistRoutes = express.Router();

wishlistRoutes.get("/getwishList", getWishlist);
wishlistRoutes.post("/addtowishList", addToWishlist);
wishlistRoutes.delete("/delete/:propertyId", deleteFromWishlist);

module.exports = wishlistRoutes;
