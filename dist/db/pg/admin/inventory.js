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
export const getInventoryByAccessGroup = async (accessGroupId, limit = 500, offset = 0) => {
    const result = await query(`SELECT
       iag.id           AS iag_id,
       iag.accessgroupid,
       iag.inventoryid,
       iag.quantity     AS allocated_quantity,
       iag.oprice,
       iag.partner_sku_name,
       iag.created_at   AS allocated_at,
       inv.*
     FROM app.inventory_access_group iag
     INNER JOIN app.inventory inv ON inv.id = iag.inventoryid
     WHERE iag.accessgroupid = $1
     ORDER BY iag.id ASC
     LIMIT $2 OFFSET $3`, [accessGroupId, limit, offset]);
    return result.rows;
};
export const getInventoryByAccessGroupCount = async (accessGroupId) => {
    const result = await query(`SELECT COUNT(*) FROM app.inventory_access_group WHERE accessgroupid = $1`, [accessGroupId]);
    return parseInt(result.rows[0].count, 10);
};
