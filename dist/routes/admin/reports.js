import express from 'express';
import { getPnlData, savePnlData, saveMonthlyPnlData, getMonthlyPnlData, getOutstandingVouchers, getBalanceSheetData, saveBalanceSheetData, getDaybookReport, } from '../../db/pg/admin/reports.js';
const router = express.Router();
// GET /api/admin/reports/pnl
router.get('/pnl', async (_req, res) => {
    try {
        const pl = await getPnlData();
        if (!pl)
            return res.json([]);
        const rows = (pl.rows || []).map((r, i) => ({
            id: i + 1,
            label: r.name || 'Unknown',
            amount: Math.abs(parseFloat(r.amount) || 0),
            type: (parseFloat(r.amount) || 0) >= 0 ? 'income' : 'expense',
            subs: [],
        }));
        rows.sort((a, b) => b.amount - a.amount);
        res.json(rows);
    }
    catch {
        res.json([]);
    }
});
// POST /api/admin/reports/pnl
router.post('/pnl', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data)
            return res.status(400).json({ message: 'data required' });
        const saved = await savePnlData(data);
        res.json({ message: 'P&L saved', data: saved });
    }
    catch (err) {
        console.error('[reports] POST pnl error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/admin/reports/pnl-monthly
router.get('/pnl-monthly', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 12;
        const history = await getMonthlyPnlData(limit);
        if (!history || history.length === 0)
            return res.json([]);
        const result = history.map((h) => {
            const payload = Array.isArray(h.data?.rows) ? h.data : h.data?.data;
            const rows = (payload?.rows || []).map((r, i) => ({
                id: i + 1,
                label: r.name || 'Unknown',
                amount: Math.abs(parseFloat(r.amount) || 0),
                type: (parseFloat(r.amount) || 0) >= 0 ? 'income' : 'expense',
                subs: (Array.isArray(r.children) ? r.children : [])
                    .filter((c) => (parseFloat(c.amount) || 0) !== 0)
                    .map((c) => ({
                    label: c.name || 'Unknown',
                    amount: parseFloat(c.amount) || 0,
                })),
            }));
            rows.sort((a, b) => b.amount - a.amount);
            return { month: h.month, data: rows };
        });
        res.json(result);
    }
    catch (err) {
        console.error('[reports] GET pnl-monthly error:', err);
        res.json([]);
    }
});
// POST /api/admin/reports/pnl-monthly
router.post('/pnl-monthly', async (req, res) => {
    try {
        const { month, data } = req.body;
        if (!month || !data)
            return res.status(400).json({ message: 'month and data required' });
        const saved = await saveMonthlyPnlData(month, data);
        res.json({ message: 'Monthly P&L saved', data: saved });
    }
    catch (err) {
        console.error('[reports] POST pnl-monthly error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/admin/reports/outstanding
router.get('/outstanding', async (_req, res) => {
    try {
        const vouchers = await getOutstandingVouchers();
        const rows = vouchers.map((r) => {
            const days = r.date ? Math.floor((Date.now() - new Date(r.date).getTime()) / 86400000) : 0;
            let status = 'due';
            if (days > 60)
                status = 'critical';
            else if (days > 30)
                status = 'overdue';
            const vt = (r.voucher_type || '').toLowerCase();
            const category = vt.startsWith('sales') || vt.startsWith('receipt') || vt.includes('receipt') || vt === 'credit note'
                ? 'receivable'
                : vt.startsWith('purchase') || vt.startsWith('payment') || vt.startsWith('cash') || vt.startsWith('chq') || vt.startsWith('material') || vt === 'debit note'
                    ? 'payable'
                    : (parseFloat(r.amount) || 0) < 0 ? 'payable' : 'receivable';
            return {
                id: r.id,
                customer: r.party_ledger_name || r.narration || `Voucher #${r.voucher_number || r.id}`,
                amount: Math.abs(parseFloat(r.amount) || 0),
                days,
                date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
                status,
                category,
                subs: [{
                        invoice: r.voucher_number || `V-${r.id}`,
                        amount: Math.abs(parseFloat(r.amount) || 0),
                        due: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
                    }],
            };
        });
        res.json(rows);
    }
    catch {
        res.json([]);
    }
});
function parseBsAmount(v) {
    if (v === null || v === undefined || typeof v === 'object')
        return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}
function collectBsSubs(node, depth = 1) {
    const subs = [];
    for (const child of node.Children || []) {
        const prefix = '\u00a0\u00a0\u00a0\u00a0'.repeat(Math.max(0, depth - 1));
        subs.push({
            label: `${prefix}${child.AccName || 'Unknown'}`,
            amount: Math.abs(parseBsAmount(child.Amount)),
        });
        subs.push(...collectBsSubs(child, depth + 1));
    }
    return subs;
}
function normalizeBalanceSheetData(bs) {
    if (!bs)
        return [];
    if (Array.isArray(bs.rows)) {
        return bs.rows.map((r, i) => ({
            id: i + 1,
            label: r.name || 'Unknown',
            amount: Math.abs(parseFloat(r.amount) || 0),
            type: (parseFloat(r.amount) || 0) >= 0 ? 'liability' : 'asset',
            subs: [],
        }));
    }
    const included = bs?.balancesheet?.included;
    if (!Array.isArray(included))
        return [];
    return included.map((node, i) => {
        const amt = parseBsAmount(node.Amount);
        return {
            id: i + 1,
            label: node.AccName || 'Unknown',
            amount: Math.abs(amt),
            type: amt >= 0 ? 'liability' : 'asset',
            subs: collectBsSubs(node),
        };
    });
}
// GET /api/admin/reports/balance-sheet
router.get('/balance-sheet', async (_req, res) => {
    try {
        const bs = await getBalanceSheetData();
        res.json(normalizeBalanceSheetData(bs));
    }
    catch {
        res.json([]);
    }
});
// POST /api/admin/reports/balance-sheet
router.post('/balance-sheet', async (req, res) => {
    try {
        const data = req.body?.data ?? req.body;
        if (!data || (!Array.isArray(data.rows) && !Array.isArray(data?.balancesheet?.included))) {
            return res.status(400).json({ message: 'data required' });
        }
        const saved = await saveBalanceSheetData(data);
        res.json({ message: 'Balance sheet saved', data: saved });
    }
    catch (err) {
        console.error('[reports] POST balance-sheet error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/admin/reports/daybook
router.get('/daybook', async (req, res) => {
    try {
        const now = new Date();
        const from_date = req.query.from_date ||
            new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const to_date = req.query.to_date ||
            now.toISOString().split('T')[0];
        const { voucherRows, invMap, ledMap } = await getDaybookReport({ from_date, to_date });
        const rows = voucherRows.map((r) => {
            const raw = r.voucher_type || '';
            let displayType;
            if (/receipt|sales|credit note/i.test(raw) && !/return/i.test(raw))
                displayType = 'Sale';
            else if (/payment/i.test(raw) && !/receipt/i.test(raw))
                displayType = 'Payment';
            else if (/purchase|debit note/i.test(raw))
                displayType = 'Purchase';
            else if (/expense|cost|manufacturing|overhead/i.test(raw))
                displayType = 'Expense';
            else
                displayType = 'Other';
            return {
                id: r.id,
                date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
                type: displayType,
                voucherType: raw,
                customer: r.party_ledger_name || '',
                ref: r.voucher_number || '',
                narration: r.narration || '',
                salesman: r.billagentname || '',
                amount: Math.abs(parseFloat(r.amount) || 0),
                inventoryEntries: invMap[String(r.id)] || [],
                ledgerEntries: ledMap[String(r.id)] || [],
            };
        });
        res.json(rows);
    }
    catch {
        res.json([]);
    }
});
export default router;
