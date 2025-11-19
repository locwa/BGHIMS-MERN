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
                    p.Category AS Category,
                    pl.BatchNumber,
                    pl.ExpiryDate,
                    pl.UnitCost,
                    pl.Remarks,
                    pl.Year,
                    pl.Quarter,
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
                    p.Category,
                    pl.BatchNumber,
                    pl.ExpiryDate,
                    pl.UnitCost,
                    pl.Remarks,
                    pl.Year,
                    pl.Quarter,
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
            Category,
            BatchNumber,
            UnitCost,
            Quantity,
            ExpiryDate,
            Remarks,
            Year,
            Quarter,
            ReceivingUser, // ID of the user adding it
            DateReceived // optional, can be auto
        } = req.body;

        // Debug logging
        console.log('Adding item with data:', { 
            Name, Unit, Category, BatchNumber, 
            Year, Quarter, UnitCost, Quantity 
        });

        // ✅ 1️⃣ Create the Transaction
        const transaction = await Transaction.create({
            ReceivingUser,
            DateReceived: DateReceived || new Date()
        }, { transaction: t });

        console.log(transaction.Id)

        // ✅ 2️⃣ Create or find the Particular (avoid duplicates by name)
        let particular = await Particular.findOne({
            where: { Name: { [Op.like]: Name } },
            transaction: t
        });

        if (!particular) {
            // Create new particular with Category
            particular = await Particular.create({ 
                Name, 
                Unit, 
                Category 
            }, { transaction: t });
        } else {
            // Update existing particular's category if provided
            if (Category) {
                await particular.update({ Category }, { transaction: t });
            }
        }

        console.log(particular)

        // ✅ 3️⃣ Create the ProcurementLog (link both and include Year & Quarter)
        const procurementLog = await ProcurementLog.create({
            ParticularDescription: particular.id || particular.Id,
            TransactionId: transaction.id || transaction.Id,
            BatchNumber,
            UnitCost,
            Quantity,
            ExpiryDate,
            Remarks,
            Year,
            Quarter
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
        res.status(500).json({ error: 'Failed to add to inventory', details: err.message });
    }
});

// Test route to verify routing is working
router.get('/test', async (req, res) => {
    res.json({ message: 'Inventory routes are working!' });
});

router.put('/updateItem/:id', async (req, res) => {
    console.log('UPDATE ROUTE HIT - ID:', req.params.id);
    console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    const t = await sequelize.transaction();

    try {
        const { id } = req.params; // ProcurementLog ID
        const {
            Name,
            Unit,
            Category,
            BatchNumber,
            UnitCost,
            QuantityAdjustment, // This is the adjustment amount
            ExpiryDate,
            Remarks,
            Year,
            Quarter,
            ReceivingUser,
            DateReceived
        } = req.body;

        // Debug logging
        console.log('Updating item with data:', { 
            id, Name, Unit, Category, BatchNumber, 
            Year: Year, 
            Quarter: Quarter, 
            QuantityAdjustment: QuantityAdjustment,
            UnitCost
        });

        // ✅ 1️⃣ Find the existing procurement log
        const procurementLog = await ProcurementLog.findByPk(id, { transaction: t });
        if (!procurementLog) {
            await t.rollback();
            console.log('ERROR: Procurement log not found for ID:', id);
            return res.status(404).json({ error: 'Procurement log not found' });
        }

        console.log('Found procurement log - Current Quantity:', procurementLog.Quantity);

        // ✅ 2️⃣ Calculate new quantity
        // The original Quantity needs to be adjusted to reflect the change
        const newQuantity = procurementLog.Quantity + QuantityAdjustment;
        
        if (newQuantity < 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Cannot set quantity below 0' });
        }

        console.log('New quantity will be:', newQuantity);

        // ✅ 3️⃣ Find the related particular and transaction
        const particular = await Particular.findByPk(procurementLog.ParticularDescription, { transaction: t });
        const transaction = await Transaction.findByPk(procurementLog.TransactionId, { transaction: t });

        // ✅ 4️⃣ Update related records if found
        if (particular) {
            await particular.update(
                { Name, Unit, Category },
                { transaction: t }
            );
            console.log('Updated particular');
        }

        if (transaction) {
            await transaction.update(
                {
                    ReceivingUser: ReceivingUser ?? transaction.ReceivingUser,
                    DateReceived: DateReceived || transaction.DateReceived
                },
                { transaction: t }
            );
            console.log('Updated transaction');
        }

        // ✅ 5️⃣ Update procurement log with new quantity
        const updateData = {
            BatchNumber,
            UnitCost,
            Quantity: newQuantity, // Use the calculated new quantity
            ExpiryDate,
            Remarks,
            Year: Year ? parseInt(Year) : null,
            Quarter: Quarter || null
        };
        
        console.log('Updating procurement log with:', updateData);
        
        await procurementLog.update(updateData, { transaction: t });
        
        console.log('Procurement log updated successfully');

        await t.commit();

        res.json({
            message: 'Item successfully updated!',
            particular,
            transaction,
            procurementLog
        });
    } catch (err) {
        await t.rollback();
        console.error('UPDATE ERROR:', err);
        res.status(500).json({ error: 'Failed to update item', details: err.message });
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
        console.log('Report generation request received:', req.body);
        
        const { year, quarter } = req.body;

        if (!year || !quarter) {
            console.error('Missing year or quarter:', { year, quarter });
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
            console.error('Invalid quarter value:', quarter);
            return res.status(400).json({ error: 'Invalid quarter value' });
        }
        
        console.log(`Generating report for ${quarter} ${year} (${startMonth}-${endMonth})`);

        const startDate = new Date(`${year}-${String(startMonth).padStart(2, '0')}-01`);
        const endDate = new Date(`${year}-${String(endMonth).padStart(2, '0')}-31`);

        let additions = [];
        let requests = [];

        // ✅ Fetch ADDITIONS (items added to inventory)
        try {
            additions = await sequelize.query(
                `
                SELECT 
                    t.id AS TransactionId,
                    t.DateReceived AS TransactionDate,
                    'ADDITION' AS TransactionType,
                    COALESCE(u.Name, 'Unknown') AS UserName,
                    COALESCE(u.Email, '') AS UserEmail,
                    COALESCE(u.Role, '') AS UserRole,
                    p.Name AS ParticularName,
                    p.Unit,
                    p.Category,
                    pl.BatchNumber,
                    pl.Quantity,
                    pl.UnitCost,
                    pl.ExpiryDate,
                    pl.Remarks,
                    pl.Year,
                    pl.Quarter
                FROM Transactions t
                INNER JOIN ProcurementLog pl ON pl.TransactionId = t.id
                INNER JOIN Particulars p ON p.id = pl.ParticularDescription
                LEFT JOIN Accounts u ON u.id = t.ReceivingUser
                WHERE t.DateReceived BETWEEN :startDate AND :endDate
                `,
                {
                    replacements: { startDate, endDate },
                    type: QueryTypes.SELECT
                }
            );
            console.log(`Found ${additions.length} additions`);
        } catch (addErr) {
            console.error('Error fetching additions:', addErr.message);
            // Continue with empty array
        }

        // ✅ Fetch REQUESTS (items taken/requested from inventory)
        try {
            requests = await sequelize.query(
                `
                SELECT 
                    rl.id AS RequestId,
                    rl.DateAdded AS TransactionDate,
                    'REQUEST' AS TransactionType,
                    COALESCE(u.Name, 'Unknown') AS UserName,
                    COALESCE(u.Email, '') AS UserEmail,
                    COALESCE(u.Role, '') AS UserRole,
                    p.Name AS ParticularName,
                    p.Unit,
                    p.Category,
                    irf.BatchNumber,
                    irf.Quantity,
                    pl.UnitCost,
                    pl.ExpiryDate,
                    '' AS Remarks,
                    pl.Year,
                    pl.Quarter
                FROM RequestLog rl
                INNER JOIN ItemRequestFulfillment irf ON irf.RequestId = rl.id
                INNER JOIN ProcurementLog pl ON pl.id = irf.ProcurementId
                INNER JOIN Particulars p ON p.id = pl.ParticularDescription
                LEFT JOIN Accounts u ON u.id = rl.AccountId
                WHERE rl.DateAdded BETWEEN :startDate AND :endDate
                `,
                {
                    replacements: { startDate, endDate },
                    type: QueryTypes.SELECT
                }
            );
            console.log(`Found ${requests.length} requests`);
        } catch (reqErr) {
            console.error('Error fetching requests:', reqErr.message);
            // Continue with empty array
        }

        // ✅ Combine and format all transactions
        const allTransactions = [
            ...additions.map(record => ({
                TransactionType: 'ADDITION',
                TransactionDate: record.TransactionDate 
                    ? new Date(record.TransactionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '',
                Particular: record.ParticularName || '',
                Unit: record.Unit || '',
                Category: record.Category || '',
                BatchNumber: record.BatchNumber || '',
                Quantity: record.Quantity || 0,
                UnitCost: record.UnitCost || 0,
                TotalCost: (record.Quantity || 0) * (record.UnitCost || 0),
                ExpiryDate: record.ExpiryDate
                    ? new Date(record.ExpiryDate).toISOString().split('T')[0]
                    : '',
                Remarks: record.Remarks || '',
                Year: record.Year || '',
                Quarter: record.Quarter || '',
                UserName: record.UserName || 'Unknown',
                UserEmail: record.UserEmail || '',
                UserRole: record.UserRole || ''
            })),
            ...requests.map(record => ({
                TransactionType: 'REQUEST',
                TransactionDate: record.TransactionDate 
                    ? new Date(record.TransactionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '',
                Particular: record.ParticularName || '',
                Unit: record.Unit || '',
                Category: record.Category || '',
                BatchNumber: record.BatchNumber || '',
                Quantity: record.Quantity || 0,
                UnitCost: record.UnitCost || 0,
                TotalCost: (record.Quantity || 0) * (record.UnitCost || 0),
                ExpiryDate: record.ExpiryDate
                    ? new Date(record.ExpiryDate).toISOString().split('T')[0]
                    : '',
                Remarks: record.Remarks || '',
                Year: record.Year || '',
                Quarter: record.Quarter || '',
                UserName: record.UserName || 'Unknown',
                UserEmail: record.UserEmail || '',
                UserRole: record.UserRole || ''
            }))
        ];

        // Sort by date (most recent first)
        const data = allTransactions.sort((a, b) => 
            new Date(b.TransactionDate) - new Date(a.TransactionDate)
        );

        const particulars = await Particular.findAll()

        if (data.length === 0) {
            console.log('No transaction data found for this period');
            // Don't return error - still generate report with empty data
        }
        
        console.log(`Found ${data.length} transactions and ${particulars.length} particulars`);

        const getMonthName = (monthNumber) => {
            const date = new Date(2000, monthNumber - 1, 1);
            return date.toLocaleString('default', { month: 'long' });
        }

        // ✅ Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        
        // ===== MAIN INVENTORY SHEET =====
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

        worksheet.mergeCells('C5:E5');
        const beginningBalanceTitle = worksheet.getCell('C5');
        beginningBalanceTitle.value = `Beg. Balance as of ${getMonthName(startMonth)} 1, ${year}`;
        beginningBalanceTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        beginningBalanceTitle.font = { size: 12, bold: true };

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
        finalBalanceTitle.value = `End. Balance as of ${getMonthName(endMonth)} 31, ${year}`;
        finalBalanceTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        finalBalanceTitle.font = { size: 12, bold: true };

        worksheet.addRow(secondHeaders);
        const secondHeaderRow = worksheet.getRow(6);
        secondHeaderRow.font = { bold: true };
        secondHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        secondHeaderRow.font = { size: 12, bold: true };

        const particularHeader = worksheet.getCell('A5');
        particularHeader.alignment = { horizontal: 'left', vertical: 'middle' }

        // Group additions by particular name for the main inventory sheet
        const inventoryData = {};
        
        console.log('Processing additions:', additions.length);
        additions.forEach(item => {
            const key = item.ParticularName;
            if (!inventoryData[key]) {
                inventoryData[key] = {
                    name: item.ParticularName,
                    unit: item.Unit,
                    category: item.Category,
                    acquisitionQty: 0,
                    acquisitionCost: 0
                };
            }
            inventoryData[key].acquisitionQty += item.Quantity || 0;
            inventoryData[key].acquisitionCost += (item.Quantity || 0) * (item.UnitCost || 0);
        });
        console.log('Inventory data grouped:', Object.keys(inventoryData).length, 'unique items');

        // Group requests (consumption) by particular name
        const consumptionData = {};
        console.log('Processing requests:', requests.length);
        requests.forEach(item => {
            const key = item.ParticularName;
            if (!consumptionData[key]) {
                consumptionData[key] = {
                    qty: 0,
                    cost: 0
                };
            }
            consumptionData[key].qty += item.Quantity || 0;
            consumptionData[key].cost += (item.Quantity || 0) * (item.UnitCost || 0);
        });
        console.log('Consumption data grouped:', Object.keys(consumptionData).length, 'unique items');

        // Get all unique items from particulars table
        const allItems = particulars.map(p => ({
            name: p.Name,
            unit: p.Unit,
            category: (p.Category || 'other').toLowerCase()
        }));

        // Group by category
        const categories = {
            'hematology': [],
            'clinical chemistry': [],
            'serology': [],
            'blood banking': [],
            'clinical microscopy': [],
            'laboratory supplies': [],
            'drug testing laboratory': [],
            'cytology': [],
            'coagulation studies': [],
            'other': []
        };

        allItems.forEach(item => {
            const category = item.category;
            if (categories[category]) {
                categories[category].push(item);
            } else {
                categories['other'].push(item);
            }
        });

        // Add data rows for each category
        Object.entries(categories).forEach(([categoryName, items]) => {
            if (items.length === 0) return;

            // Add category header
            const categoryRow = worksheet.addRow([categoryName.toUpperCase()]);
            categoryRow.font = { bold: true, size: 11 };
            categoryRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Add items in this category
            items.forEach(item => {
                const inv = inventoryData[item.name] || { acquisitionQty: 0, acquisitionCost: 0 };
                const cons = consumptionData[item.name] || { qty: 0, cost: 0 };
                
                // Beginning balance (for now, set to 0 - can be enhanced later to pull from previous quarter)
                const beginningQty = 0;
                const beginningUnitCost = 0;
                const beginningTotalCost = 0;
                
                // Acquisition data
                const acquisitionQty = inv.acquisitionQty;
                const acquisitionUnitCost = acquisitionQty > 0 ? inv.acquisitionCost / acquisitionQty : 0;
                const acquisitionTotalCost = inv.acquisitionCost;
                
                // Consumption data
                const consumptionQty = cons.qty;
                const consumptionUnitCost = consumptionQty > 0 ? cons.cost / consumptionQty : 0;
                const consumptionTotalCost = cons.cost;
                
                // Ending balance
                const endingQty = beginningQty + acquisitionQty - consumptionQty;
                const endingTotalCost = beginningTotalCost + acquisitionTotalCost - consumptionTotalCost;
                const endingUnitCost = endingQty > 0 ? endingTotalCost / endingQty : 0;

                const dataRow = worksheet.addRow([
                    item.name,
                    item.unit,
                    beginningQty || '', 
                    beginningUnitCost > 0 ? beginningUnitCost.toFixed(2) : '',
                    beginningTotalCost > 0 ? beginningTotalCost.toFixed(2) : '',
                    acquisitionQty || '',
                    acquisitionUnitCost > 0 ? acquisitionUnitCost.toFixed(2) : '',
                    acquisitionTotalCost > 0 ? acquisitionTotalCost.toFixed(2) : '',
                    consumptionQty || '',
                    consumptionUnitCost > 0 ? consumptionUnitCost.toFixed(2) : '',
                    consumptionTotalCost > 0 ? consumptionTotalCost.toFixed(2) : '',
                    endingQty > 0 ? endingQty : '',
                    endingUnitCost > 0 ? endingUnitCost.toFixed(2) : '',
                    endingTotalCost > 0 ? endingTotalCost.toFixed(2) : ''
                ]);

                // Format number cells to be right-aligned (columns C to N)
                for (let i = 3; i <= 14; i++) {
                    dataRow.getCell(i).alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
        });

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

        // ===== TRANSACTION HISTORY SHEET =====
        const historySheet = workbook.addWorksheet(`Transaction_History`);

        // Title
        historySheet.mergeCells('A1:J1');
        const historyTitle = historySheet.getCell('A1');
        historyTitle.value = `TRANSACTION HISTORY - ${quarter} ${year}`;
        historyTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        historyTitle.font = { size: 14, bold: true };

        historySheet.addRow({});

        // Headers
        const historyHeaders = [
            'Date & Time',
            'Type',
            'Item Name',
            'Batch Number',
            'Quantity',
            'Unit',
            'Unit Cost',
            'Total Cost',
            'User',
            'Email',
            'Role'
        ];

        const headerRow = historySheet.addRow(historyHeaders);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add data rows with color coding by transaction type
        data.forEach((row, index) => {
            const dataRow = historySheet.addRow([
                row.TransactionDate,
                row.TransactionType,
                row.Particular,
                row.BatchNumber,
                row.Quantity,
                row.Unit,
                `₱${row.UnitCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `₱${row.TotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                row.UserName,
                row.UserEmail,
                row.UserRole
            ]);

            // Color code the transaction type cell
            if (row.TransactionType === 'ADDITION') {
                dataRow.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD4EDDA' } // Light green
                };
                dataRow.getCell(2).font = { 
                    bold: true, 
                    color: { argb: 'FF155724' } // Dark green
                };
            } else if (row.TransactionType === 'REQUEST') {
                dataRow.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC107' } // Light orange/yellow
                };
                dataRow.getCell(2).font = { 
                    bold: true, 
                    color: { argb: 'FF856404' } // Dark orange
                };
            }

            // Alternating row colors for better readability
            if (index % 2 === 0) {
                for (let i = 1; i <= 11; i++) {
                    if (i !== 2) { // Skip the type column
                        dataRow.getCell(i).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    }
                }
            }

            // Align columns
            dataRow.getCell(2).alignment = { horizontal: 'center' }; // Type
            dataRow.getCell(5).alignment = { horizontal: 'center' }; // Quantity
            dataRow.getCell(6).alignment = { horizontal: 'center' }; // Unit
            dataRow.getCell(7).alignment = { horizontal: 'right' };  // Unit Cost
            dataRow.getCell(8).alignment = { horizontal: 'right' };  // Total Cost
        });

        // Set column widths
        historySheet.getColumn(1).width = 20;  // Date & Time
        historySheet.getColumn(2).width = 12;  // Type
        historySheet.getColumn(3).width = 40;  // Item Name
        historySheet.getColumn(4).width = 15;  // Batch Number
        historySheet.getColumn(5).width = 10;  // Quantity
        historySheet.getColumn(6).width = 8;   // Unit
        historySheet.getColumn(7).width = 15;  // Unit Cost
        historySheet.getColumn(8).width = 15;  // Total Cost
        historySheet.getColumn(9).width = 20;  // User
        historySheet.getColumn(10).width = 25; // Email
        historySheet.getColumn(11).width = 12; // Role

        // Add borders to all cells
        historySheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) { // Skip title rows
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // Add summary at the bottom
        const summaryRow = historySheet.addRow([]);
        historySheet.addRow([]);
        
        // Summary statistics
        const totalAdditions = data.filter(t => t.TransactionType === 'ADDITION').length;
        const totalRequests = data.filter(t => t.TransactionType === 'REQUEST').length;
        const totalAddedQty = data.filter(t => t.TransactionType === 'ADDITION').reduce((sum, row) => sum + row.Quantity, 0);
        const totalRequestedQty = data.filter(t => t.TransactionType === 'REQUEST').reduce((sum, row) => sum + row.Quantity, 0);
        const totalAddedCost = data.filter(t => t.TransactionType === 'ADDITION').reduce((sum, row) => sum + row.TotalCost, 0);
        const totalRequestedCost = data.filter(t => t.TransactionType === 'REQUEST').reduce((sum, row) => sum + row.TotalCost, 0);

        const summaryTitle = historySheet.addRow(['', '', 'SUMMARY']);
        summaryTitle.getCell(3).font = { bold: true, size: 12 };

        historySheet.addRow([]);

        const additionsRow = historySheet.addRow(['', '', 'Total Additions:', totalAdditions]);
        additionsRow.getCell(3).font = { bold: true };
        additionsRow.getCell(4).font = { bold: true, color: { argb: 'FF155724' } };

        const addedQtyRow = historySheet.addRow(['', '', 'Quantity Added:', totalAddedQty]);
        addedQtyRow.getCell(3).font = { bold: true };
        addedQtyRow.getCell(4).font = { bold: true, color: { argb: 'FF155724' } };

        const addedCostRow = historySheet.addRow(['', '', 'Total Cost Added:', `₱${totalAddedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
        addedCostRow.getCell(3).font = { bold: true };
        addedCostRow.getCell(4).font = { bold: true, color: { argb: 'FF155724' } };

        historySheet.addRow([]);

        const requestsRow = historySheet.addRow(['', '', 'Total Requests:', totalRequests]);
        requestsRow.getCell(3).font = { bold: true };
        requestsRow.getCell(4).font = { bold: true, color: { argb: 'FF856404' } };

        const requestedQtyRow = historySheet.addRow(['', '', 'Quantity Requested:', totalRequestedQty]);
        requestedQtyRow.getCell(3).font = { bold: true };
        requestedQtyRow.getCell(4).font = { bold: true, color: { argb: 'FF856404' } };

        const requestedCostRow = historySheet.addRow(['', '', 'Total Cost Requested:', `₱${totalRequestedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
        requestedCostRow.getCell(3).font = { bold: true };
        requestedCostRow.getCell(4).font = { bold: true, color: { argb: 'FF856404' } };

        historySheet.addRow([]);

        const netQtyRow = historySheet.addRow(['', '', 'Net Quantity Change:', totalAddedQty - totalRequestedQty]);
        netQtyRow.getCell(3).font = { bold: true };
        netQtyRow.getCell(4).font = { bold: true, color: { argb: 'FF0070C0' } };

        const netCostRow = historySheet.addRow(['', '', 'Net Cost Impact:', `₱${(totalAddedCost - totalRequestedCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
        netCostRow.getCell(3).font = { bold: true };
        netCostRow.getCell(4).font = { bold: true, color: { argb: 'FF0070C0' } };

        // ✅ File path and save temporarily
        const reportsDir = path.join(__dirname, '../../reports');
        
        // Create reports directory if it doesn't exist
        if (!fs.existsSync(reportsDir)) {
            console.log('Creating reports directory...');
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const filePath = path.join(reportsDir, `inventory_${year}_${quarter}.xlsx`);
        console.log('Writing Excel file to:', filePath);
        
        await workbook.xlsx.writeFile(filePath);
        console.log('Excel file written successfully');

        // Verify file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File was not created successfully');
        }
        
        console.log('Sending file for download...');
        
        // ✅ Send the file for download
        res.download(filePath, `inventory_${year}_${quarter}.xlsx`, (err) => {
            if (err) {
                console.error('File download error:', err);
                if (!res.headersSent) {
                    res.status(500).send('Failed to download report.');
                }
            } else {
                console.log('File download initiated successfully');
            }

            // Delete temporary file after a delay
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('Temporary file deleted:', filePath);
                    }
                } catch (deleteErr) {
                    console.error('Error deleting temporary file:', deleteErr);
                }
            }, 5000);
        });
    } catch (err) {
        console.error('Error generating Excel report:', err);
        console.error('Error stack:', err.stack);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to generate Excel report.',
                message: err.message,
                details: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    }
});
module.exports = router