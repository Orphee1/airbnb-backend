const express = require("express");
const router = express.Router();
const Room = require("../models/Room.js");
const City = require("../models/City.js");

function getRadians(meters) {
      const km = meters / 1000;
      return km / 111.2;
}

// Todo
router.get("/around", function(req, res, next) {
      res.status(200).json({ message: "route rooms around OK" });
});

router.get("/", async (req, res) => {
      console.log("Here we are OK");
      try {
            if (!req.query.city) {
                  res.status(400).json({ message: "City is mandatory" });
            } else {
                  let filter = {};

                  let cityRes = null;

                  let city = await City.findOne({ slug: req.query.city });

                  if (!city) {
                        res.status(400).json({ message: "city not found" });
                  } else {
                        cityRes = city;
                        filter.city = city._id;
                        if (
                              req.query.priceMin !== undefined ||
                              req.query.priceMax !== undefined
                        ) {
                              filter.price = {};
                              if (req.query.priceMin !== undefined) {
                                    filter.price["$gte"] = req.query.priceMin;
                              }
                              if (req.query.priceMax !== undefined) {
                                    filter.price["$lte"] = req.query.priceMax;
                              }
                        }
                  }
                  let rooms = await Room.find(filter)
                        .populate("city")
                        .populate({
                              path: "user",
                              select: "account"
                        });

                  if (
                        req.query.skip !== undefined ||
                        req.query.limit !== undefined
                  ) {
                        skip = req.query.skip;
                        limit = req.query.limit;
                        rooms = rooms.slice(skip, limit);
                  } else {
                        rooms.slice(0, 100);
                  }

                  res.status(200).json({
                        rooms: rooms || [],
                        city: cityRes,
                        count: rooms.length
                  });
            }
      } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
      }
});

router.get("/:id", async (req, res, next) => {
      console.log("route :id OK");

      const id = req.params.id;
      console.log(id);

      try {
            const room = await Room.findById(id)
                  .populate("city")
                  // IMPORTANT SÉCURITE
                  // Les informations sensibles de l'utilisateur étant stockées à la racine de l'objet, il est important de transmettre uniquement `account`
                  .populate({
                        path: "user",
                        select: "account"
                  });

            if (room) {
                  console.log(room);
                  res.status(200).json(room);
            } else {
                  res.status(400).json({ message: "Room not found" });
            }
      } catch (error) {
            console.log(error.message);
      }
});

module.exports = router;
