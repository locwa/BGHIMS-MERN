const express = require('express')
const router = express.Router()
const {ProcurementLog, Particular, Transaction, RequestLog, ItemRequestFulfillment, sequelize} = require('../../models')
const { Op, QueryTypes} = require('sequelize');

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
router.get('/years', async (req, res) => {
    try {
        const years = await sequelize.query(
            `
        SELECT DISTINCT YEAR(DateReceived) AS year
        FROM Transactions
        ORDER BY year DESC;
      `,
            { type: QueryTypes.SELECT }
        );

        res.json(years.map(row => row.year)); // return array like [2025, 2024, 2023]
    } catch (err) {
        console.error("Failed to fetch transaction years:", err);
        res.status(500).json({ error: 'Failed to fetch transaction years' });
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

        console.log(particular)

        // ✅ 3️⃣ Create the ProcurementLog (link both)
        const procurementLog = await ProcurementLog.create({
            ParticularDescription: particular.id || particular.Id,
            TransactionId: transaction.id || transaction.Id,
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
router.post('/updateItem/:id', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params; // ProcurementLog ID
        const {
            Name,
            Unit,
            BatchNumber,
            UnitCost,
            Quantity,
            ExpiryDate,
            Remarks,
            ReceivingUser,
            DateReceived
        } = req.body;

        // ✅ 1️⃣ Find the existing procurement log
        const procurementLog = await ProcurementLog.findByPk(id, { transaction: t });
        if (!procurementLog) {
            await t.rollback();
            return res.status(404).json({ error: 'Procurement log not found' });
        }

        // ✅ 2️⃣ Find the related particular and transaction
        const particular = await Particular.findByPk(procurementLog.ParticularDescription, { transaction: t });
        const transaction = await Transaction.findByPk(procurementLog.TransactionId, { transaction: t });

        // ✅ 3️⃣ Update related records if found
        if (particular) {
            await particular.update(
                { Name, Unit },
                { transaction: t }
            );
        }

        if (transaction) {
            await transaction.update(
                {
                    ReceivingUser: ReceivingUser ?? transaction.ReceivingUser,
                    DateReceived: DateReceived || transaction.DateReceived
                },
                { transaction: t }
            );
        }

        // ✅ 4️⃣ Update procurement log
        await procurementLog.update(
            {
                BatchNumber,
                UnitCost,
                Quantity,
                ExpiryDate,
                Remarks
            },
            { transaction: t }
        );

        await t.commit();

        res.json({
            message: 'Item successfully updated!',
            particular,
            transaction,
            procurementLog
        });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});
router.post('/requestItem', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { AccountId, items } = req.body;
        // items = [{ AcquisitionId, BatchNumber, Quantity }]

        if (!AccountId || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing AccountId or items' });
        }

        // 1️⃣ Create a RequestLog
        const requestLog = await RequestLog.create({
            AccountId,
            DateAdded: new Date()
        }, { transaction: t });

        // 2️⃣ Add all items to ItemRequestFulfillment
        const itemEntries = await Promise.all(items.map(async (item) => {
            // Optional: validate that the ProcurementLog exists
            const exists = await ProcurementLog.findByPk(item.AcquisitionId, { transaction: t });
            if (!exists) throw new Error(`ProcurementLog item ${item.AcquisitionId} not found`);

            return await ItemRequestFulfillment.create({
                ProcurementId: item.AcquisitionId,
                RequestId: requestLog.id,
                BatchNumber: item.BatchNumber,
                Quantity: item.Quantity
            }, { transaction: t });
        }));

        await t.commit();

        res.json({
            message: 'Request successfully created!',
            requestLog,
            itemEntries
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

module.exports = router