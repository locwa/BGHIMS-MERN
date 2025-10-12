const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const cors = require('cors')
const { UserAccounts } = require('../../models')
const router = express.Router()

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await UserAccounts.findOne({ where: { Email: email } });

        if (!user || user.Password !== password) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, user.Id);
    });
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserAccounts.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Login successful', user: req.user });
});

router.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router

