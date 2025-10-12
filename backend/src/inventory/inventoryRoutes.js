const express = require('express')
const router = express.Router()
const {ProcurementLog, Particular, Transaction} = require('../../models')
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const { particularSearch, batchNumber } = req.query;
        const whereClause = {};

        const particularWhere = particularSearch
            ? { Name: { [Op.like]: `%${particularSearch}%` } }
            : undefined;

        const batchNumberWhere = batchNumber
            ? { BatchNumber: { [Op.like]: `%${batchNumber}%`} }
            : undefined;


        const data = await ProcurementLog.findAll({
            where: batchNumberWhere,
            include: [
                {
                    model: Particular,
                    as: 'Particular',
                    where: particularWhere, // 🔍 filters by item name
                },
                {
                    model: Transaction,
                    as: 'Transaction',
                },
            ],
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

module.exports = router