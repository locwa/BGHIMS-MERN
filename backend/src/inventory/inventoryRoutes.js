const express = require('express')
const router = express.Router()
const {ProcurementLog, Particular, Transaction, sequelize} = require('../../models')
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
router.post('/addItem', async (req, res) => {
    const t = await sequelize.transaction(); // 🧩 start transaction

    try {
        const {
            Name,
            Unit,
            BatchNumber,
            UnitCost,
            Quantity,
            ExpiryDate,
            Remarks,
            ReceivingUser, // ID of the user adding it
            DateReceived // optional, can be auto
        } = req.body;

        // ✅ 1️⃣ Create the Transaction
        const transaction = await Transaction.create({
            ReceivingUser,
            DateReceived: DateReceived || new Date()
        }, { transaction: t });

        console.log(transaction.Id)

        // ✅ 2️⃣ Create or find the Particular (avoid duplicates)
        let particular = await Particular.findOne({
            where: { Name: { [Op.like]: Name } },
            transaction: t
        });

        if (!particular) {
            particular = await Particular.create({ Name, Unit }, { transaction: t });
        }

        // ✅ 3️⃣ Create the ProcurementLog (link both)
        const procurementLog = await ProcurementLog.create({
            ParticularDescription: particular.Id,
            TransactionId: transaction.Id,
            BatchNumber,
            UnitCost,
            Quantity,
            ExpiryDate,
            Remarks
        }, { transaction: t });

        // ✅ Commit all if successful
        await t.commit();

        res.json({
            message: 'Item successfully added to inventory!',
            transaction,
            particular,
            procurementLog
        });
    } catch (err) {
        await t.rollback(); // ❌ rollback on error
        console.error(err);
        res.status(500).json({ error: 'Failed to add to inventory' });
    }
});
module.exports = router