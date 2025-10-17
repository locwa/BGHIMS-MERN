const express = require('express')
const router = express.Router()
const {ProcurementLog, Particular, Transaction, RequestLog, ItemRequestFulfillment, sequelize} = require('../../models')
const { Op, QueryTypes} = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

router.get('/', async (req, res) => {
    try {
        const items = await sequelize.query(
            `
                SELECT
                    pl.id AS Id,
                    p.Name AS ParticularName,
                    p.Unit AS Unit,
                    pl.BatchNumber,
                    pl.ExpiryDate,
                    pl.UnitCost,
                    pl.Remarks,
                    (pl.Quantity - COALESCE(SUM(irf.Quantity), 0)) AS RemainingQuantity
                FROM ProcurementLog pl
                         JOIN Particulars p
                              ON p.id = pl.ParticularDescription
                         LEFT JOIN ItemRequestFulfillment irf
                                   ON irf.ProcurementId = pl.id
                GROUP BY
                    pl.id,
                    p.Name,
                    p.Unit,
                    pl.BatchNumber,
                    pl.ExpiryDate,
                    pl.UnitCost,
                    pl.Remarks,
                    pl.Quantity;

            `,
            { type: QueryTypes.SELECT }
        );

        res.json(items);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
router.get('/lowItems', async (req, res) => {
    try {
        const items = await sequelize.query(
            `
                SELECT p.Name, SUM(pr.Quantity - ir.Quantity) AS Qty
                FROM ProcurementLog AS pr
                         RIGHT JOIN Particulars AS p
                                    ON p.Id = pr.ParticularDescription
                         LEFT JOIN ItemRequestFulfillment as ir
                                   ON pr.Id = ir.ProcurementId
                GROUP BY p.Name
                HAVING Qty IS NULL OR Qty <= 5
      `,
            { type: QueryTypes.SELECT }
        );

        res.json(items); // return array like [2025, 2024, 2023]
    } catch (err) {
        console.error("Failed to fetch items:", err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
})
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
router.post('/report', async (req, res) => {
    try {
        const { year, quarter } = req.body;

        if (!year || !quarter) {
            return res.status(400).json({ error: 'Year and quarter are required' });
        }

        // ✅ Quarter month ranges
        const quarterRanges = {
            Q1: [1, 3],
            Q2: [4, 6],
            Q3: [7, 9],
            Q4: [10, 12],
        };

        const [startMonth, endMonth] = quarterRanges[quarter];
        if (!startMonth) {
            return res.status(400).json({ error: 'Invalid quarter value' });
        }

        const startDate = new Date(`${year}-${String(startMonth).padStart(2, '0')}-01`);
        const endDate = new Date(`${year}-${String(endMonth).padStart(2, '0')}-31`);

        // ✅ Fetch joined data
        const records = await Transaction.findAll({
            where: {
                DateReceived: { [Op.between]: [startDate, endDate] },
            },
            include: [
                {
                    model: ProcurementLog,
                    as: 'ProcurementLogs',
                    include: [{ model: Particular, as: 'Particular' }],
                },
            ],
        });

        // ✅ Flatten data
        const data = records.flatMap((txn) =>
            txn.ProcurementLogs.map((log) => ({
                Particular: log.Particular?.Name || '',
                Unit: log.Particular?.Unit || '',
                BatchNumber: log.BatchNumber || '',
                Quantity: log.Quantity || 0,
                UnitCost: log.UnitCost || 0,
                ExpiryDate: log.ExpiryDate
                    ? new Date(log.ExpiryDate).toISOString().split('T')[0]
                    : '',
                Remarks: log.Remarks || '',
            }))
        );
        const particulars = await Particular.findAll()

        if (data.length === 0) {
            return res.status(404).json({ error: 'No records found for this quarter.' });
        }

        const getMonthName = (monthNumber) => {
            const date = new Date(2000, monthNumber - 1, 1);
            return date.toLocaleString('default', { month: 'long' });
        }

        // ✅ Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Inventory_${year}_${quarter}`);

        // ✅ Add title
        worksheet.mergeCells('A1:N1');
        const title = worksheet.getCell('A1');
        title.value = `INVENTORY OF LABORATORY REAGENTS AND SUPPLIES AS OF ${getMonthName(endMonth)} 31, ${year}`;

        worksheet.addRow({});
        worksheet.addRow({});

        worksheet.getColumn(2).alignment = { horizontal: 'center', vertical: 'middle' } // Unit
        worksheet.getColumn(3).alignment = { horizontal: 'center', vertical: 'middle' }  // BatchNumber
        worksheet.getColumn(4).alignment = { horizontal: 'right', vertical: 'middle' } // Quantity
        worksheet.getColumn(5).alignment = { horizontal: 'right', vertical: 'middle' } // Unit
        worksheet.getColumn(6).alignment = { horizontal: 'center', vertical: 'middle' }  // BatchNumber
        worksheet.getColumn(7).alignment = { horizontal: 'right', vertical: 'middle' } // Quantity
        worksheet.getColumn(8).alignment = { horizontal: 'right', vertical: 'middle' } // Quantity
        worksheet.getColumn(9).alignment = { horizontal: 'center', vertical: 'middle' }  // BatchNumber
        worksheet.getColumn(10).alignment = { horizontal: 'right', vertical: 'middle' } // Quantity
        worksheet.getColumn(11).alignment = { horizontal: 'right', vertical: 'middle' } // Quantity

        title.alignment = { horizontal: 'center', vertical: 'middle' };
        title.font = { size: 12, bold: true };

        const secondHeaders = [
            '',
            '',
            'Qty',
            'U-Cost',
            'T-Cost',
            'Qty',
            'U-Cost',
            'T-Cost',
            'Qty',
            'U-Cost',
            'T-Cost',
            'Qty',
            'U-Cost',
            'T-Cost',
        ];

        const particularTitle = worksheet.getCell('A5')
        particularTitle.value = "Particular"
        particularTitle.font = { bold: true };

        const unitTitle = worksheet.getCell('B5')
        unitTitle.value = "Unit"
        unitTitle.font = { bold: true };

        worksheet.mergeCells('F5:H5');
        const acquisitionTitle = worksheet.getCell('F5');
        acquisitionTitle.value = `Acquisition ${getMonthName(startMonth)}-${getMonthName(endMonth)} ${year}`;
        acquisitionTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        acquisitionTitle.font = { size: 12, bold: true };

        worksheet.mergeCells('I5:K5');
        const consumptionTitle = worksheet.getCell('I5');
        consumptionTitle.value = `Consumption  ${getMonthName(startMonth)}-${getMonthName(endMonth)} ${year}`;
        consumptionTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        consumptionTitle.font = { size: 12, bold: true };

        worksheet.mergeCells('L5:N5');
        const finalBalanceTitle = worksheet.getCell('L5');
        finalBalanceTitle.value = `Bal as of ${getMonthName(startMonth)} 31, ${year}`;
        finalBalanceTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        finalBalanceTitle.font = { size: 12, bold: true };

        worksheet.addRow(secondHeaders);
        const secondHeaderRow = worksheet.getRow(6);
        secondHeaderRow.font = { bold: true };
        secondHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        secondHeaderRow.font = { size: 12, bold: true };

        const particularHeader = worksheet.getCell('A5');
        particularHeader.alignment = { horizontal: 'left', vertical: 'middle' }

        // ✅ Add data rows
        // data.forEach((row) => {
        //     worksheet.addRow([
        //         row.Particular,
        //         row.Unit,
        //         row.BatchNumber,
        //         row.Quantity,
        //         row.UnitCost,
        //         row.ExpiryDate,
        //         row.Remarks,
        //     ]);
        // });

        particulars.forEach((row) => {
            worksheet.addRow([
                row.Name,
                row.Unit
            ]);
        });

        // const hematologyHeader = worksheet.addRow(["HEMATOLOGY"])
        // hematologyHeader.font = { bold: true };
        // hematology.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const clinicalChemistryHeader = worksheet.addRow(["CLINICAL CHEMISTRY"])
        // clinicalChemistryHeader.font = { bold: true };
        // clinicalChemistry.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const serologyHeader = worksheet.addRow(["SEROLOGY"])
        // serologyHeader.font = { bold: true };
        // serology.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const bloodBankingHeader = worksheet.addRow(["SEROLOGY"])
        // bloodBankingHeader.font = { bold: true };
        // bloodBanking.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const clinicalMicroscopyHeader = worksheet.addRow(["SEROLOGY"])
        // clinicalMicroscopyHeader.font = { bold: true };
        // clinicalMicroscopy.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const laboratorySuppliesHeader = worksheet.addRow(["SEROLOGY"])
        // laboratorySuppliesHeader.font = { bold: true };
        // laboratorySupplies.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const drugTestingLaboratoryHeader = worksheet.addRow(["SEROLOGY"])
        // drugTestingLaboratoryHeader.font = { bold: true };
        // drugTestingLaboratory.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const cytologyHeader = worksheet.addRow(["SEROLOGY"])
        // drugTestingLaboratoryHeader.font = { bold: true };
        // drugTestingLaboratory.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })
        //
        // const coagulationStudiesHeader = worksheet.addRow(["SEROLOGY"])
        // drugTestingLaboratoryHeader.font = { bold: true };
        // drugTestingLaboratory.forEach((row) => {
        //     worksheet.addRow([
        //         row
        //     ])
        // })

        worksheet.getColumn(1).width = 70;   // Particular
        worksheet.getColumn(2).width = 5;  // Unit
        worksheet.getColumn(3).width = 5;  // Qty
        worksheet.getColumn(4).width = 17;  // UnitCost
        worksheet.getColumn(5).width = 17;  // TotalCost
        worksheet.getColumn(6).width = 5;  // Qty
        worksheet.getColumn(7).width = 17;  // UnitCost
        worksheet.getColumn(8).width = 17;  // TotalCost
        worksheet.getColumn(9).width = 5;  // Qty
        worksheet.getColumn(10).width = 17;  // UnitCost
        worksheet.getColumn(11).width = 17;  // TotalCost
        worksheet.getColumn(12).width = 5;  // Qty
        worksheet.getColumn(13).width = 17;  // UnitCost
        worksheet.getColumn(14).width = 17;  // TotalCost

        // ✅ Auto-fit column widths
        // worksheet.columns.forEach((column) => {
        //     let maxLength = 0;
        //     column.eachCell({ includeEmpty: true }, (cell) => {
        //         const columnLength = cell.value ? cell.value.toString().length : 10;
        //         if (columnLength > maxLength) maxLength = columnLength;
        //     });
        //     column.width = maxLength;
        // });

        // ✅ File path and save temporarily
        const filePath = path.join(__dirname, `../../reports/inventory_${year}_${quarter}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        // ✅ Send the file for download
        res.download(filePath, `inventory_${year}_${quarter}.xlsx`, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).send('Failed to download report.');
            }

            // Delete temporary file
            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 5000);
        });
    } catch (err) {
        console.error('Error generating Excel report:', err);
        res.status(500).json({ error: 'Failed to generate Excel report.' });
    }
});
module.exports = router