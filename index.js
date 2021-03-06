// Configure environment variables
require("dotenv").config();


// Dependencies
const bodyParser     = require("body-parser");
const cors           = require("cors");
const express        = require("express");
const handlebars     = require("handlebars");
const OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
const passport       = require("passport");
const request        = require("request");
const session        = require("express-session");


// Constants
const PORT                    = 8080;
const SESSION_SECRET          = "$mama-uwu";
const TWITCH_APP_CALLBACK_URL = "https://wwd-auth.uc.r.appspot.com/auth/twitch/callback";
const TWITCH_APP_CLIENT_ID    = "af24u4hqornqmyb92rc7xyz0z7djhx";


// Initialize Express and middlewares
let app = express();
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    // Small modification to the JSON bodyParser to expose the raw body in the request object
    // The raw body is required at signature verification
    req.rawBody = buf
  }
}));


// [Passport]

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: "https://api.twitch.tv/helix/users",
    method: "GET",
    headers: {
      "Client-ID": TWITCH_APP_CLIENT_ID,
      "Accept": "application/vnd.twitchtv.v5+json",
      "Authorization": "Bearer " + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

// Use "twitch" OAuth2 strategy
passport.use("twitch", new OAuth2Strategy({
    authorizationURL: "https://id.twitch.tv/oauth2/authorize",
    tokenURL: "https://id.twitch.tv/oauth2/token",
    clientID: TWITCH_APP_CLIENT_ID,
    clientSecret: process.env.TWITCH_APP_CLIENT_SECRET,
    callbackURL: TWITCH_APP_CALLBACK_URL,
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


// [Express templates]

let closeTabTemplate = handlebars.compile(`<script>
  window.close();
</script>`);

let authRedirectTemplate = handlebars.compile(`<script>
  window.location.href = "/auth/twitch"
</script>`);


// [Express routes]

// Set route to start OAuth link, this is where you define scopes to request
app.get("/auth/twitch", passport.authenticate("twitch", { scope: "user_read channel:read:redemptions" }));

// Set route for OAuth redirect
app.get("/auth/twitch/callback", passport.authenticate("twitch", { successRedirect: "/", failureRedirect: "/" }));

// If user has an authenticated session, close the tab, else redirect to authenticate
app.get("/", function(req, res) {
  if (req.session?.passport?.user) {
    res.send(closeTabTemplate());
  }
  else {
    res.send(authRedirectTemplate());
  }
});

// Retrieve Passport user to ensure authentication
app.post("/", function(req, res) {
  if (req.session?.passport?.user) {
    res.json({
      user: req.session.passport.user
    });
  }
  else {
    res.json({
      user: null
    });
  }
});

app.get("/fireplace", function(req, res) {
  res.send("🔥");
})

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}!`);
});