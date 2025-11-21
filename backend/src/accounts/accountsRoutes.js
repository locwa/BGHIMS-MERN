const express = require('express');
const router = express.Router();
const { UserAccounts } = require('../../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try{
        const accounts = await UserAccounts.findAll({
            where: {
                IsActive: 1
            }
        })
        res.send(accounts)
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
})

router.post('/update', async (req, res) => {
    try {
        console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));

        const request = await UserAccounts.update(
            {
                Name: req.body.Name,
                Email: req.body.Email,
                Password: req.body.Password,
                Role: req.body.Role,
                JobTitle: req.body.JobTitle
            },
            {
                where: {
                    Id: req.body.Id
                }
            }
        )
    } catch (e) {
        res.status(500).json({ error: 'Failed to update accounts' });
    }
});
router.post('/delete/:id', async (req, res) => {
    try {
        const accountDetails = await UserAccounts.findAll({
            where: {
                Role: "Admin"
            }
        })

        if (accountDetails.length === 1){
            if (Number(req.params.id) === accountDetails[0].Id){
                res.status(500).json({ error: 'Failed to delete account'});
                return
            }
        }
        const request = await UserAccounts.update(
            {
                IsActive: 0
            },
            {
                where: {
                    Id: Number(req.params.id)
                }
            })


    } catch (e) {
        res.status(500).json({ error: 'Failed to delete account ' + e });
    }
});
router.post('/add', async (req, res) => {
    try {
        const request = await UserAccounts.create(
            {
                Name: req.body.Name,
                Email: req.body.Email,
                Password: req.body.Password,
                Role: req.body.Role,
                JobTitle: req.body.JobTitle,
                IsActive: 1
            }
        )
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete account ' + e });
    }
});
module.exports = router