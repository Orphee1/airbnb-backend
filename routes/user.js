const express = require("express");
const router = express.Router();
const passport = require("passport");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

// Configuration de Cloudinary
cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
});

//Upload middleware
const uploadPicture = (req, res, next) => {
      try {
            if (Object.keys(req.files).length) {
                  cloudinary.uploader.upload(
                        req.files.picture.path,
                        async (error, result) => {
                              if (error) {
                                    return res.json({ error: "Upload Error" });
                              } else {
                                    req.picture = await result.secure_url;
                                    next();
                              }
                        }
                  );
            } else {
                  req.pictures = "";
                  next();
            }
      } catch (error) {
            console.log(error);
            res.status(400).json({
                  message: "An error occurred uploading picture"
            });
      }
};

router.post("/sign_up", function(req, res) {
      console.log("Here we are");
      res.json({ message: "route sign_up OK" });
      User.register(
            new User({
                  email: req.body.email,
                  // L'inscription créera le token permettant de s'authentifier auprès de la strategie `http-bearer`
                  token: uid2(16), // uid2 permet de générer une clef aléatoirement. Ce token devra être regénéré lorsque l'utilisateur changera son mot de passe
                  account: {
                        username: req.body.username,
                        name: req.body.name,
                        description: req.body.description
                  }
            }),
            req.body.password, // Le mot de passe doit être obligatoirement le deuxième paramètre transmis à `register` afin d'être crypté
            function(err, user) {
                  if (err) {
                        console.error(err);
                        // TODO test
                        res.status(400).json({ error: err.message });
                  } else {
                        res.json({
                              _id: user._id,
                              token: user.token,
                              account: user.account
                        });
                  }
            }
      );
});
router.post("/log_in", function(req, res, next) {
      passport.authenticate("local", { session: false }, function(
            err,
            user,
            info
      ) {
            if (err) {
                  res.status(400);
                  return next(err.message);
            }
            if (!user) {
                  return res.status(401).json({ error: "Unauthorized" });
            }
            res.json({
                  _id: user._id,
                  token: user.token,
                  account: user.account
            });
      })(req, res, next);
});

router.get("/:id", function(req, res, next) {
      passport.authenticate("bearer", { session: false }, function(
            err,
            user,
            info
      ) {
            if (err) {
                  res.status(400);
                  return next(err.message);
            }
            if (!user) {
                  return res.status(401).json({ error: "Unauthorized" });
            }
            User.findById(req.params.id)
                  .select("account")
                  .populate("account.rooms")
                  .exec()
                  .then(function(user) {
                        if (!user) {
                              res.status(404);
                              return next("User not found");
                        }
                        return res.json({
                              _id: user._id,
                              account: user.account
                        });
                  })
                  .catch(function(err) {
                        res.status(400);
                        return next(err.message);
                  });
      })(req, res, next);
});

router.post("/upload_picture", uploadPicture, async (req, res) => {
      // res.json({ message: "route upload_picture OK" });
      console.log("Route upload_picture OK");

      try {
            // const { picture } = req.files;
            // console.log(req.files.picture.path);
            console.log(req.picture);
            if (req.picture !== "") {
                  console.log("envoi de l'url");
                  res.status(200).json(req.picture);
            }
      } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
      }
});

module.exports = router;
