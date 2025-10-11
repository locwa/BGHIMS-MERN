const express = require('express');
const app = express()
const passport = require('passport')
const cors = require('cors')

const authenticationRoutes = require('./src/authentication/authenticationRoutes')
const session = require("express-session");

app.use(express.json())
app.use(cors())

app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session());

app.use('/login', authenticationRoutes)

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000')
})