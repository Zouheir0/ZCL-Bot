const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const path = require("path");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Express session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new Strategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", passport.authenticate("discord"));

app.get("/auth/discord/callback", passport.authenticate("discord", {
  failureRedirect: "/"
}), (req, res) => {
  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Filter user's guilds where bot is in and user is admin
app.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const botGuildsReq = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`
      }
    });

    const userGuilds = req.user.guilds;
    const botGuilds = await botGuildsReq.json();

    const sharedGuilds = userGuilds.filter(g => {
      const botInGuild = botGuilds.find(bg => bg.id === g.id);
      return botInGuild && (g.permissions & 0x8); // ADMIN permission
    });

    res.render("dashboard", { user: req.user, guilds: sharedGuilds });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.redirect("/");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Dashboard is running at http://localhost:${port}`);
});