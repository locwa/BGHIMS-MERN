import { Op, QueryTypes} from 'sequelize';
import {ProcurementLog, Particular, Transaction, RequestLog, ItemRequestFulfillment, sequelize} from '../../models';

export async function additionsQuery(startDate, endDate){
    try {
        let additions = await sequelize.query(
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
                LEFT JOIN UserAccounts u ON u.id = t.ReceivingUser
                WHERE t.DateReceived BETWEEN :startDate AND :endDate
                `,
            {
                replacements: { startDate, endDate },
                type: QueryTypes.SELECT
            }
        );
        console.log(`Found ${additions.length} additions`);
        console.log(additions)
        return additions
    } catch (addErr) {
        console.error('Error fetching additions:', addErr.message);
        // Continue with empty array
    }

}