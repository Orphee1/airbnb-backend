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

router.get("/", function(req, res, next) {
      console.log("Here we are");
      if (!req.query.city) {
            return next("City is mandatory");
      }
      let filter = {};
      let roomsRes = null;
      let cityRes = null;
      let countRes = null;

      City.findOne({ slug: req.query.city })
            .exec()
            .then(function(city) {
                  if (!city) {
                        res.status(400);
                        return next("City not found");
                  }
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

                  return Room.find(filter)
                        .count()
                        .exec();
            })
            .then(function(count) {
                  countRes = count;

                  let query = Room.find(filter)
                        .populate("city")
                        .populate({
                              path: "user",
                              select: "account"
                        });
                  if (req.query.skip !== undefined) {
                        query.skip(parseInt(req.query.skip));
                  }
                  if (req.query.limit !== undefined) {
                        query.limit(parseInt(req.query.limit));
                  } else {
                        // valeur par défaut de la limite
                        query.limit(100);
                  }
                  return query.exec();
            })
            .then(function(rooms) {
                  roomsRes = rooms;
                  return res.json({
                        rooms: roomsRes || [],
                        city: cityRes,
                        count: countRes
                  });
            })
            .catch(function(err) {
                  res.status(400);
                  return next(err.message);
            });
});

router.get("/:id", function(req, res, next) {
      Room.findById(req.params.id)
            .populate("city")
            // IMPORTANT SÉCURITÉ
            // Les informations sensibles de l'utilisateur étant stockées à la racine de l'objet, il est important de transmettre uniquement `account`
            .populate({
                  path: "user",
                  select: "account"
            })
            .exec()
            .then(function(room) {
                  if (!room) {
                        res.status(404);
                        return next("Room not found");
                  }
                  return res.json(room);
            })
            .catch(function(err) {
                  res.status(400);
                  return next(err.message);
            });
});

module.exports = router;
