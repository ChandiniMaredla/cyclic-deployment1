const express = require("express");
const {
  createCommercial,
  getCommercials,
  getAllCommercials,
} = require("../controllers/commercialController");

const commercialRoutes = express.Router();

const apicache = require('apicache');
const cache = apicache.middleware;

// Correct route definitions
commercialRoutes.post("/postcommercial", createCommercial);
commercialRoutes.get("/getcommercial", getCommercials);
commercialRoutes.get("/getallcommercials", getAllCommercials);
module.exports = commercialRoutes;
