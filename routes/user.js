const express = require("express");
const router = express.Router();
const passport = require("passport");
const uid2 = require("uid2");

const User = require("../models/User");

router.get("/:id", function(req, res, next) {
      res.json({ message: "Route User OK" });
});

module.exports = router;
