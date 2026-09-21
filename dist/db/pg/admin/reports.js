import { query } from '../main.js';
// ===========================================================================
// P&L
// ===========================================================================
export async function getPnlData() {
    const result = await query('SELECT data FROM app.profitloss ORDER BY id DESC LIMIT 1');
    return result.rows[0]?.data ?? null;
}
export async function savePnlData(data) {
    const result = await query('INSERT INTO app.profitloss (data) VALUES ($1) RETURNING *', [data]);
    return result.rows[0];
}
export async function getMonthlyPnlData(limit = 12) {
    const result = await query('SELECT month, data FROM app.profitloss_monthly ORDER BY month DESC LIMIT $1', [limit]);
    return result.rows;
}
export async function saveMonthlyPnlData(month, data) {
    await query(`INSERT INTO app.profitloss_monthly (month, data)
     VALUES ($1, $2)
     ON CONFLICT (month)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`, [month, data]);
    return { month, data };
}
// ===========================================================================
// Outstanding
// ===========================================================================
export async function getOutstandingVouchers() {
    const result = await query(`SELECT id, date, voucher_type, voucher_number, narration, party_ledger_name,
            COALESCE((SELECT SUM((e->>'amount')::numeric) FROM jsonb_array_elements(ledgerentries) e
     WHERE (e->>'isDeemedPositive') = 'No'), 0) AS amount
       FROM app.vouchers ORDER BY date DESC LIMIT 200`);
    return result.rows;
}
// ===========================================================================
// Balance Sheet
// ===========================================================================
export async function getBalanceSheetData() {
    const result = await query('SELECT data FROM app.balancesheet ORDER BY id DESC LIMIT 1');
    return result.rows[0]?.data ?? null;
}
export async function saveBalanceSheetData(data) {
    const result = await query('INSERT INTO app.balancesheet (data) VALUES ($1) RETURNING *', [data]);
    return result.rows[0];
}
// ===========================================================================
// Daybook
// ===========================================================================
export async function getDaybookReport({ from_date, to_date }) {
    const vouchers = await query(`SELECT id, date, voucher_type, voucher_number, narration, party_ledger_name,
            billagentname,
            COALESCE((SELECT SUM((e->>'amount')::numeric) FROM jsonb_array_elements(ledgerentries) e
                      WHERE (e->>'isDeemedPositive') = 'No'), 0) AS amount
     FROM app.vouchers
     WHERE date >= $1 AND date <= $2
     ORDER BY date DESC`, [from_date, to_date]);
    const invQuery = await query(`SELECT v.id::int AS vid,
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'item', e->>'stockItemName',
                  'qty', CAST(SPLIT_PART(COALESCE(e->>'billedQty', '0'), ' ', 1) AS numeric),
                  'unit', COALESCE(NULLIF(SPLIT_PART(COALESCE(e->>'billedQty', ''), ' ', 2), ''), ''),
                  'rate', CAST(SPLIT_PART(COALESCE(e->>'rate', '0'), '/', 1) AS numeric),
                  'amount', CAST(COALESCE(e->>'amount', '0') AS numeric),
                  'description', e->>'description',
                  'serialNo', COALESCE(e->>'serialNo', '[]')
                )
              ) FILTER (WHERE e->>'stockItemName' IS NOT NULL), '[]'::jsonb
            ) AS invEntries
     FROM app.vouchers v
     LEFT JOIN LATERAL jsonb_array_elements(v.inventoryentries) e ON true
     WHERE v.date >= $1 AND v.date <= $2
     GROUP BY v.id`, [from_date, to_date]);
    const invMap = {};
    for (const row of invQuery.rows) {
        invMap[String(row.vid)] = row.invEntries || [];
    }
    const ledQuery = await query(`SELECT v.id::int AS vid,
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'ledgerName', e->>'ledgerName',
                  'amount', CAST(COALESCE(e->>'amount', '0') AS numeric),
                  'isDeemedPositive', e->>'isDeemedPositive',
                  'description', e->>'description'
                )
              ), '[]'::jsonb
            ) AS ledEntries
     FROM app.vouchers v
     LEFT JOIN LATERAL jsonb_array_elements(v.ledgerentries) e ON true
     WHERE v.date >= $1 AND v.date <= $2
     GROUP BY v.id`, [from_date, to_date]);
    const ledMap = {};
    for (const row of ledQuery.rows) {
        ledMap[String(row.vid)] = row.ledEntries || [];
    }
    return { voucherRows: vouchers.rows, invMap, ledMap };
}
