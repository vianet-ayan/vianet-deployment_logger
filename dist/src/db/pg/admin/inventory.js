import { query } from '../main.js';
export const getInventory = async (limit = 500, offset = 0) => {
    const result = await query(`
    SELECT * FROM app.inventory
    ORDER BY id ASC  -- Crucial for stable streaming/pagination
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
    // Return ONLY the rows array so it's iterable
    return result.rows;
};
export const getInventoryCount = async () => {
    const result = await query(`
    SELECT COUNT(*) FROM app.inventory
  `);
    const countString = result.rows[0].count;
    return parseInt(countString, 10);
};
