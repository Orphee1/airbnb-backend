const express = require("express");
const router = express.Router();

const Room = require("../models/Room.js");
const City = require("../models/City.js");

function getRadians(meters) {
      const km = meters / 1000;
      return km / 111.2;
}

// Todo
// router.get("/around", function(req, res, next) {

// });

router.get("/", function(req, res, next) {
      if (!req.query.city) {
            return next("City is mandatory");
      }
      const filter = {};
      const roomsRes = null;
      const cityRes = null;
      const countRes = null;
});

module.exports = router;
