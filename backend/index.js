const express = require('express');
const app = express()
const passport = require('passport')
const cors = require('cors')
const session = require("express-session");

const authenticationRoutes = require('./src/authentication/authenticationRoutes')
const inventoryRoutes = require('./src/inventory/inventoryRoutes')
const transactionRoutes = require('./src/transaction/Transactionroutes')

// ✅ Body parser middleware (place these early, before routes)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173', // your React app URL
    credentials: true,
}))

app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session());

// Routes come after middleware
app.use('/auth', authenticationRoutes)
app.use('/inventory', inventoryRoutes)
app.use('/transactions', transactionRoutes)

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000')
})