const express = require("express");
const router = express.Router();
const passport = require("passport");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const formidableMiddleware = require("express-formidable");

const User = require("../models/User");
const authenticate = require("../middleware/authenticate");

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

      // res.json({ message: "route sign_up OK" });
      User.register(
            new User({
                  email: req.body.email,
                  // L'inscription créera le token permettant de s'authentifier auprès de la strategie `http-bearer`
                  token: uid2(16), // uid2 permet de générer une clef aléatoirement. Ce token devra être regénéré lorsque l'utilisateur changera son mot de passe
                  account: {
                        username: req.body.username,
                        // Name pas prévu dans le model
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
      console.log("Route log-in OK");
      // console.log(req.fields);

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

// Route upload with passport authentication httpBearerStrategy

// router.post(
//       "/upload_picture",

//       formidableMiddleware(),

//       // uploadPicture,
//       function(req, res, next) {
//             console.log("Route upload picture OK");
//             // console.log(req.query);
//             // const id = req.query.id;
//             // const token = req.query.token;
//             passport.authenticate("bearer", { session: false }, function(
//                   err,
//                   user
//             ) {
//                   console.log("here we are");

//                   if (err) {
//                         res.status(400);
//                         return next(err.message);
//                   }
//                   if (!user) {
//                         return res.status(401).json({ error: "Unauthorized" });
//                   } else {
//                         return res.status(200).json({ message: "Authorized" });
//                         // console.log(req.picture);
//                         // if (req.picture !== "") {
//                         // // ici identifier user
//                         // const UserToUpdate = await User.findOne({ _id: id });
//                         // console.log(UserToUpdate);

//                         // UserToUpdate.account.photos = req.picture;

//                         // await UserToUpdate.save();
//                         // console.log(UserToUpdate);
//                         // console.log("envoi de l'url");
//                         // res.status(200).json(req.picture);
//                   }
//             });
//       }
// );

// Route upload with my authenticate middleware

router.post(
      "/upload_picture",
      authenticate,
      formidableMiddleware(),
      uploadPicture,
      async (req, res) => {
            // res.json({ message: "route upload_picture OK" });
            console.log("Route upload_picture OK");
            console.log(req.query);

            const token = req.query.token;

            try {
                  // const { picture } = req.files;
                  // console.log(req.files.picture.path);
                  console.log(req.picture);
                  if (req.picture !== "") {
                        // ici identifier user
                        const UserToUpdate = await User.findOne({
                              token: token
                        });
                        // console.log(UserToUpdate);

                        UserToUpdate.account.photos = req.picture;

                        await UserToUpdate.save();
                        console.log(UserToUpdate);
                        console.log("envoi de l'url");
                        res.status(200).json(req.picture);
                  }
            } catch (error) {
                  console.log(error);
                  res.status(400).json({ message: error.message });
            }
      }
);

module.exports = router;
