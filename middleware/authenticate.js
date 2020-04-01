const User = require("../models/User");

// const authenticate = async (req, res, next) => {
module.exports = async (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth) {
            res.status(401).json({
                  error: "Missing Authorization Header"
            });
            return;
      }
      const parts = req.headers.authorization.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
            res.status(401).json({
                  error: "Invalid Authorization Header"
            });
            return;
      }
      const token = parts[1];
      const user = await User.findOne({ token });
      // console.log(user);
      if (!user) {
            res.status(401).json({
                  error: "Invalid Token"
            });
            return;
      }
      return next();
};
