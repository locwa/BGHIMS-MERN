const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const cors = require('cors')
const { UserAccounts } = require('../../models')
const router = express.Router()

router.use(cors())

passport.use(new LocalStrategy(async(username, password, done) => {
    try{
        const user = await UserAccounts.findOne({
            where: {
                Email: username,
                Password: password
            }
        })
        if(!user){
            done(null, false)
        }

        return done(null, user)
    } catch (err){
        return done(err)
    }
}))

router.post('/', passport.authenticate('local'), (req, res) => {
    res.send("success")
})

passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, user.Id);
    });
});

passport.deserializeUser((id, done) => {
    // find user here based on ID
    done(null, user);

    // user not found
    done(err, null);
});

module.exports = router

