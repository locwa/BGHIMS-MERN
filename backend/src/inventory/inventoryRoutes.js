const express = require('express')
const router = express.Router()
const {ProcurementLog, Particular, Transaction} = require('../../models')

router.get('/', async (req, res) => {
    try {
        const inventory = await ProcurementLog.findAll({
            include: [
                { model: Particular, as: 'Particular' },
                { model: Transaction, as: 'Transaction' }
            ]
        });
        res.json(inventory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

module.exports = router