// transactionRoutes.js
// Add this to your backend routes

const express = require('express');
const router = express.Router();
const { RequestLog, UserAccounts, ItemRequestFulfillment, ProcurementLog, Particular } = require('../../models');
const { Op } = require('sequelize');

/**
 * GET /transactions/history
 * Fetch transaction history (item requests) for a date range
 * Query params: startDate (YYYY-MM-DD format), endDate (YYYY-MM-DD format)
 */
router.get('/history', async (req, res) => {
    try {
        console.log('=== Transaction History Request ===');
        console.log('Query params received:', req.query);
        console.log('Full URL:', req.originalUrl);
        
        const { startDate, endDate } = req.query;
        
        console.log('Parsed startDate:', startDate);
        console.log('Parsed endDate:', endDate);
        
        if (!startDate || !endDate) {
            console.log('ERROR: Missing parameters');
            return res.status(400).json({ 
                error: 'Both startDate and endDate parameters are required',
                received: req.query 
            });
        }

        // Parse the dates to get start and end of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        console.log('Date range:', start, 'to', end);

        // Validate date range
        if (end < start) {
            return res.status(400).json({ error: 'End date must be after or equal to start date' });
        }

        // Query to get all requests for the specified date range with requester info
        const requests = await RequestLog.findAll({
            where: {
                DateAdded: {
                    [Op.between]: [start, end]
                }
            },
            include: [{
                model: UserAccounts,
                as: 'UserAccount',
                attributes: ['Name', 'JobTitle', 'Email']
            }],
            order: [['DateAdded', 'DESC']]
        });

        console.log(`Found ${requests.length} requests`);

        // For each request, get the items that were fulfilled
        const requestsWithItems = await Promise.all(
            requests.map(async (request) => {
                const items = await ItemRequestFulfillment.findAll({
                    where: {
                        RequestId: request.id
                    },
                    include: [{
                        model: ProcurementLog,
                        as: 'ProcurementLog',
                        include: [{
                            model: Particular,
                            as: 'Particular',
                            attributes: ['Name', 'Unit']
                        }]
                    }]
                });

                return {
                    RequestId: request.id,
                    DateAdded: request.DateAdded,
                    RequesterName: request.UserAccount?.Name || 'Unknown',
                    JobTitle: request.UserAccount?.JobTitle || 'N/A',
                    Email: request.UserAccount?.Email || 'N/A',
                    items: items.map(item => ({
                        ItemName: item.ProcurementLog?.Particular?.Name || 'Unknown Item',
                        BatchNumber: item.BatchNumber,
                        Quantity: item.Quantity,
                        Unit: item.ProcurementLog?.Particular?.Unit || 'N/A'
                    }))
                };
            })
        );

        console.log('Sending response with', requestsWithItems.length, 'transactions');
        res.json(requestsWithItems);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'Failed to fetch transaction history', details: error.message });
    }
});

module.exports = router;