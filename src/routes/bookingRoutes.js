const express = require("express");
const {
  createBooking,
  getBookingByFilters,
  getBuyerBookings,
  createAgentBooking,
  getByFilters,
  getBookingByName,
  rebookingWithAgent,
  getUserBookingsByStatus,
  getUserBookings,
  getAgentBookings,
  deleteappointment,
  updateBookingStatus,
  updateStatus,
  getBookingByUserAndAgent,
  getBuyerReqForAgent,
} = require("../controllers/bookingController"); // Import as an object

const bookingRoutes = express.Router();

bookingRoutes.post("/userbook", createBooking); //route for a buyer/seller to book appointment with agent
bookingRoutes.post("/agentbook", createAgentBooking); //route for an agent to book appointment with buyer/seller

bookingRoutes.get("/updatetozero", updateStatus);
bookingRoutes.get("/buyerreqs", getBuyerBookings);
bookingRoutes.get("/userbookingdetails/:role", getUserBookings); // get details of users who booked with agent.
bookingRoutes.get(
  "/getbookingsbystatus/:role/:status",
  getUserBookingsByStatus
);
bookingRoutes.get("/getbyname/:role/:name", getBookingByName);
bookingRoutes.get("/bookingdetails/:userId/:agentId", getBookingByUserAndAgent);
bookingRoutes.get("/rebook/:agentId/:userId", rebookingWithAgent);
bookingRoutes.get("/getbyfilters/:name/:status", getBookingByFilters);
bookingRoutes.get("/getbyfilters/:role/:location/:status", getByFilters);
bookingRoutes.get("/agentbookingdetails", getAgentBookings); //get agents who booked with that user
bookingRoutes.get("/getbuyerreqs/:agentId", getBuyerReqForAgent); // get all the buyer requests of a aparticular agent
bookingRoutes.put(
  "/updatebookingstatus/:bookingId/:status",
  updateBookingStatus
);

bookingRoutes.delete("/delete", deleteappointment);
module.exports = bookingRoutes; // Export the correct variable
