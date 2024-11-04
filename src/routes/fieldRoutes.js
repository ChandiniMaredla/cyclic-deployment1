const express = require("express");
const {
  getFields,
  insertFieldDetails,
  getAllFields,
} = require("../controllers/fieldController");

const fieldRoutes = express.Router();
const apicache = require('apicache');
const cache = apicache.middleware;

fieldRoutes.get("/getfields", getFields);
fieldRoutes.post("/insert", insertFieldDetails);
fieldRoutes.get("/getallfields", getAllFields);

module.exports = fieldRoutes;
