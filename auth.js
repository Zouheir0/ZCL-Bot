const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login
router.get('/login', passport.authenticate('discord'));

// Callback
router.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard')
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;