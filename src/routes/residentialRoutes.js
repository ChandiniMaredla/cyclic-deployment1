const express = require("express");
const {
  createResidential,
  getPropertiesByUserId,
  getAllResidentials,
} = require("../controllers/residentialController");

const residentialRoutes = express.Router();
const apicache = require('apicache');
let cache = apicache.middleware;

residentialRoutes.post("/add", createResidential);
residentialRoutes.get("/getting", getPropertiesByUserId);
residentialRoutes.get("/getallresidentials", getAllResidentials);
module.exports = residentialRoutes;
