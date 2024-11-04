const express = require("express");
const {
  getLocationByPincode,
  getMandalsByDistrict,
  getVillagesByMandal,
  getAllMandals,
  getAllVillages,
} = require("../controllers/locationController");

const locationRoutes = express.Router();
const apicache = require('apicache');
let cache = apicache.middleware; 

locationRoutes.get("/getallmandals",cache('5 seconds'), getAllMandals);
locationRoutes.get("/getallvillages",cache('5 seconds'), getAllVillages);
locationRoutes.get(
  "/getlocationbypincode/:pincode/:district/:mandal",cache('5 seconds'),
  getLocationByPincode
);
locationRoutes.get("/getmandals/:district",cache('5 seconds'), getMandalsByDistrict);
locationRoutes.get("/getvillagesbymandal/:mandal",cache('5 seconds'), getVillagesByMandal);
module.exports = locationRoutes;
