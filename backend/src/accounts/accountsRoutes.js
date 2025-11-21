const express = require('express');
const router = express.Router();
const { UserAccounts } = require('../../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try{
        const accounts = await UserAccounts.findAll()
        res.send(accounts)
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
})
module.exports = router