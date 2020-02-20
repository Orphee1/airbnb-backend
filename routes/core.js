const express = require("express");
const router = express.Router();

const Room = require("../models/Room");
const City = require("../models/City");

router.get("/home", function(req, res, next) {
      res.json({ message: "Route Home Ok" });
      City.find()
            .exec()
            .then(function(cities) {
                  Room.findRandom({}, {}, { limit: 3 }, function(err, rooms) {
                        res.json({
                              cities: cities || [],
                              featured: rooms || []
                        });
                  });
            })
            .catch(function(err) {
                  res.status(400);
                  return next(err.message);
            });
});

module.exports = router;
