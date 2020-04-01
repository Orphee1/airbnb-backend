require("dotenv").config();

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
});

const express = require("express");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");

const app = express();
// app.use(formidableMiddleware());
app.use("/api", cors());

// Le package `helmet` est une collection de protections contre certaines vulnérabilités HTTP
// const helmet = require("helmet");
// app.use(helmet());

// Les réponses (> 1024 bytes) du serveur seront compressées au format GZIP pour diminuer la quantité d'informations transmise
// const compression = require("compression");
// app.use(compression());

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
// /// - `http-bearer` permettra de gérer toute les requêtes authentifiées à l'aide d'un `token`
const HTTPBearerStrategy = require("passport-http-bearer").Strategy;
passport.use(
      new HTTPBearerStrategy(
            {
                  // Idéalement je préciserais ici qu'il lui faut attendre token en query.param???
                  // token: "token"
            },
            User.authenticateBearer()
      )
); // La méthode `authenticateBearer` a été déclarée dans le model User

app.get("/", function(req, res) {
      res.send("Welcome to the Airbnb API");
});

// Les routes sont séparées dans plusieurs fichiers
const coreRoutes = require("./routes/core");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");
// Les routes relatives aux utilisateurs auront pour préfixe d'URL `/user`
app.use("/api/", coreRoutes);
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);

// Toutes les méthodes HTTP (GET, POST, etc.) des pages non trouvées afficheront une erreur 404
app.all("*", function(req, res) {
      res.status(404).json({ error: "Not Found" });
});

// Ce middleware gère les cas d'erreurs
app.use(function(err, req, res, next) {
      if (res.statusCode === 200) res.status(400);
      console.error(err);
      if (process.env.NODE_ENV === "production") err = "An error occurred";
      res.json({ error: err });
});

app.listen(process.env.PORT, function() {
      console.log(`Airbnb API running on port ${process.env.PORT}`);
});
