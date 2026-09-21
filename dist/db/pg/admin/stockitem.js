import { query } from '../main.js';
export async function listDistinctBrands() {
    const result = await query("SELECT DISTINCT brand FROM app.inventory WHERE brand IS NOT NULL AND brand != '' AND isblocked IS NOT TRUE ORDER BY brand");
    return result.rows.map((r) => r.brand);
}
export async function listDistinctGroups() {
    const result = await query("SELECT DISTINCT category_level_1 AS \"group\" FROM app.inventory WHERE category_level_1 IS NOT NULL AND category_level_1 != '' AND isblocked IS NOT TRUE ORDER BY category_level_1");
    return result.rows.map((r) => r.group);
}
export async function listInventoryStock({ search, brand, group, limit, offset }) {
    let countQuery = 'SELECT COUNT(*) FROM app.inventory inv WHERE 1=1 AND inv.isblocked IS NOT TRUE';
    let dataQuery = "SELECT inv.*, COALESCE(inv.fullname, inv.stockname) AS display_name, COALESCE(inv.price, 0) AS inv_price FROM app.inventory inv WHERE 1=1 AND inv.isblocked IS NOT TRUE";
    const params = [];
    let idx = 1;
    if (search) {
        const clause = ` AND (inv.stockname ILIKE $${idx} OR inv.brand ILIKE $${idx} OR inv.model ILIKE $${idx} OR inv.fullname ILIKE $${idx} OR inv.category_level_1 ILIKE $${idx})`;
        countQuery += clause;
        dataQuery += clause;
        params.push(`%${search}%`);
        idx++;
    }
    if (brand && brand !== 'all') {
        const clause = ` AND inv.brand ILIKE $${idx}`;
        countQuery += clause;
        dataQuery += clause;
        params.push(brand);
        idx++;
    }
    if (group && group !== 'all') {
        const clause = ` AND inv.category_level_1 ILIKE $${idx}`;
        countQuery += clause;
        dataQuery += clause;
        params.push(group);
        idx++;
    }
    const countResult = await query(countQuery, [...params]);
    const total = parseInt(countResult.rows[0].count);
    dataQuery += ` ORDER BY COALESCE(NULLIF(inv.fullname, ''), inv.stockname) ASC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);
    const result = await query(dataQuery, params);
    return { rows: result.rows, total };
}
export async function* listInventoryStockBatched({ search, brand, group, batchSize = 200 } = {}) {
    let countQuery = 'SELECT COUNT(*) FROM app.inventory inv WHERE 1=1 AND inv.isblocked IS NOT TRUE';
    let dataQuery = 'SELECT inv.*, COALESCE(inv.fullname, inv.stockname) AS display_name, COALESCE(inv.price, 0) AS inv_price FROM app.inventory inv WHERE 1=1 AND inv.isblocked IS NOT TRUE';
    const params = [];
    let idx = 1;
    if (search) {
        const clause = ` AND (inv.stockname ILIKE $${idx} OR inv.brand ILIKE $${idx} OR inv.model ILIKE $${idx} OR inv.fullname ILIKE $${idx} OR inv.category_level_1 ILIKE $${idx})`;
        countQuery += clause;
        dataQuery += clause;
        params.push(`%${search}%`);
        idx++;
    }
    if (brand && brand !== 'all') {
        const clause = ` AND inv.brand ILIKE $${idx}`;
        countQuery += clause;
        dataQuery += clause;
        params.push(brand);
        idx++;
    }
    if (group && group !== 'all') {
        const clause = ` AND inv.category_level_1 ILIKE $${idx}`;
        countQuery += clause;
        dataQuery += clause;
        params.push(group);
        idx++;
    }
    const countResult = await query(countQuery, [...params]);
    const total = parseInt(countResult.rows[0].count);
    dataQuery += ' ORDER BY COALESCE(NULLIF(inv.fullname, ""), inv.stockname) ASC';
    let offset = 0;
    while (offset < total) {
        const batchParams = [...params, batchSize, offset];
        const result = await query(dataQuery + ` LIMIT $${idx} OFFSET $${idx + 1}`, batchParams);
        yield { rows: result.rows, total, offset };
        offset += batchSize;
    }
}
