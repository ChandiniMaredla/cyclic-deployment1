const express = require("express");
const { userLoginController, otpForLogin, otpLogin } = require("../controllers/noAuthController");
const { display } = require("../controllers/defaultController");
const { createUser } = require("../controllers/userController");
const {
  getAllProperties,
  resetRatings,
  getLatestProps,
} = require("../controllers/propertyController");
const { getByDistrict } = require("../controllers/fieldController");

const apicache = require('apicache');
let cache = apicache.middleware;

const noAuthRouter = express.Router();
noAuthRouter.get("/latestprops",cache('5 seconds'), getLatestProps);
noAuthRouter.put("/reset", resetRatings);
noAuthRouter.get("/getallprops", cache('5 seconds'),getAllProperties);
noAuthRouter.get("/getbydist",cache('5 seconds'), getByDistrict);
noAuthRouter.post("/login", userLoginController);
noAuthRouter.post("/create", createUser);

noAuthRouter.get("/hi", display);

noAuthRouter.post("/otp",otpForLogin);
noAuthRouter.post('/verify',otpLogin);


module.exports = noAuthRouter;
