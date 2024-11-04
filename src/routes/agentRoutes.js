const express = require("express");
const {
  insertAgentRatings,
  getAgentRatingsByAgentId,
  getAgentRatings,
  getAgentsbyloc,
} = require("../controllers/agentController");

const agentRoutes = express.Router();


agentRoutes.post("/rating", insertAgentRatings);
agentRoutes.get("/getAgentRatingById", getAgentRatingsByAgentId);
agentRoutes.get("/getratings",getAgentRatings);
//agentRoutes.get('/getAgents/:role',getAgents);
agentRoutes.get("/getAgentsbyloc/:location", getAgentsbyloc);
module.exports = agentRoutes;
