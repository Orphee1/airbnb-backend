require("dotenv").config();

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
});

const express = require("express");
const app = express();

const cors = require("cors");
app.use("/api", cors());

// Le package `helmet` est une collection de protections contre certaines vulnérabilités HTTP
const helmet = require("helmet");
app.use(helmet());

// Les réponses (> 1024 bytes) du serveur seront compressées au format GZIP pour diminuer la quantité d'informations transmise
const compression = require("compression");
app.use(compression());

// Parse le `body` des requêtes HTTP reçues
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Initialisation des models
const City = require("./models/City");
const Room = require("./models/Room");
const User = require("./models/User");

// Le package `passport`
const passport = require("passport");
app.use(passport.initialize()); // TODO test

// Nous aurons besoin de 2 strategies :
// - `local` permettra de gérer le login nécessitant un mot de passe
const LocalStrategy = require("passport-local").Strategy;
passport.use(
      new LocalStrategy(
            {
                  usernameField: "email",
                  passReqToCallback: true,
                  session: false
            },
            User.authenticateLocal()
      )
);

// Les routes sont séparées dans plusieurs fichiers
const coreRoutes = require("./routes/core");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");
// Les routes relatives aux utilisateurs auront pour préfixe d'URL `/user`
app.use("/api/", coreRoutes);
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);

app.get("/", function(req, res) {
      res.send("Welcome to the Airbnb API");
});

app.listen(process.env.PORT, function() {
      console.log(`Airbnb API running on port ${process.env.PORT}`);
});
