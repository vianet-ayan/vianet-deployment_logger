import { useState, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Loader2 } from "lucide-react";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { getAmount, fetchDaybook } from "@/adminstore/slices/daybookSlice";
const DAYBOOK_EXPORT_COLUMNS = [
    { key: 'date', header: 'Date' },
    { key: 'party_ledger_name', header: 'Customer' },
    { key: 'voucher_number', header: 'Reference' },
    { key: 'billagentname', header: 'Salesman' },
    { key: 'voucher_type', header: 'Type' },
    { key: 'narration', header: 'Narration' },
];
const typeColors = {
    'Sales': 'bg-green-100 text-green-700',
    'Purchase': 'bg-purple-100 text-purple-700',
    'Payment': 'bg-blue-100 text-blue-700',
    'Receipt': 'bg-yellow-100 text-yellow-700',
    'Sales HP': 'bg-green-100 text-green-700',
};
function SummaryCards({ totalSales, totalPayments, totalExpenses, netCash }) {
    return (<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Sales</p>
        <p className="text-2xl font-bold">{totalSales.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Payments</p>
        <p className="text-2xl font-bold">{totalPayments.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-2xl font-bold">{totalExpenses.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Net Cash</p>
        <p className="text-2xl font-bold">{netCash.toLocaleString()}</p>
      </div>
    </div>);
}
function DailyChart({ dailyTotals }) {
    return (<div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Daily Totals</h2>
      <div className="space-y-2">
        {dailyTotals.map(({ day, income, expense }) => (<div key={day} className="flex items-center gap-4 text-sm">
            <span className="w-24">{day}</span>
            <span className="text-green-600">Income: {income}</span>
            <span className="text-red-600">Expense: {expense}</span>
          </div>))}
      </div>
    </div>);
}
function TransactionBreakdown({ transactionsData, typeColors }) {
    const typeCounts = transactionsData.reduce((acc, t) => {
        acc[t.voucher_type] = (acc[t.voucher_type] || 0) + 1;
        return acc;
    }, {});
    return (<div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Transaction Breakdown</h2>
      <div className="space-y-2">
        {Object.entries(typeCounts).map(([type, count]) => (<div key={type} className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>
            <span>{count}</span>
          </div>))}
      </div>
    </div>);
}
function SalesmanPerformance({ transactionsData }) {
    const salesmanData = transactionsData.reduce((acc, t) => {
        acc[t.billagentname] = (acc[t.billagentname] || 0) + getAmount(t);
        return acc;
    }, {});
    return (<div className="rounded-lg border p-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">Salesman Performance</h2>
      <div className="space-y-2">
        {Object.entries(salesmanData).map(([name, total]) => (<div key={name} className="flex items-center justify-between text-sm">
            <span>{name}</span>
            <span className="font-medium">{total.toLocaleString()}</span>
          </div>))}
      </div>
    </div>);
}
function TransactionRow({ transaction, isOpen, onToggle }) {
    return (<div className="border rounded-lg p-3 mb-2 cursor-pointer hover:bg-muted/50" onClick={onToggle}>
      <div className="flex items-center justify-between text-sm">
        <span>{transaction.party_ledger_name}</span>
        <span>{transaction.voucher_type}</span>
        <span>{getAmount(transaction).toLocaleString()}</span>
      </div>
      {isOpen && (<div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <p>Narration: {transaction.narration}</p>
          <p>Voucher No: {transaction.voucher_number}</p>
          <p>Date: {transaction.date ? transaction.date.split('T')[0] : 'N/A'}</p>
          <p>Bill Agent: {transaction.billagentname}</p>
          {transaction.inventoryentries.length > 0 && (<p>Items: {transaction.inventoryentries.map(ii => ii.stockItemName).join(', ')}</p>)}
        </div>)}
    </div>);
}
function DetailTab({ filtered, expandedIds, toggleExpand }) {
    const scrollRef = useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 56,
        overscan: 10,
    });
    return (<div ref={scrollRef} className="h-[calc(100vh-10rem)] overflow-auto rounded-lg border">
      {filtered.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>) : (<div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const t = filtered[virtualRow.index];
                const rowId = t.id ?? String(virtualRow.index);
                return (<div key={virtualRow.key} className="absolute top-0 left-0 w-full border-b" style={{ transform: `translateY(${virtualRow.start}px)` }}>
              <TransactionRow transaction={t} isOpen={expandedIds.has(rowId)} onToggle={() => toggleExpand(rowId)}/>
            </div>);
            })}
      </div>)}
    </div>);
}
function getDefaultDateRange() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return {
        from: `${yyyy}-${mm}-01`,
        to: `${yyyy}-${mm}-${dd}`,
    };
}
export default function DayBook() {
    const dispatch = useDispatch();
    const { entries: transactionsData, loading, error } = useSelector((state) => state.daybook);
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [from, setFrom] = useState(getDefaultDateRange().from);
    const [to, setTo] = useState(getDefaultDateRange().to);
    useEffect(() => {
        if (from && to) {
            dispatch(fetchDaybook({ from, to }));
        }
    }, [dispatch, from, to]);
    const handleFetch = () => {
        if (from && to) {
            dispatch(fetchDaybook({ from, to }));
        }
    };
    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    };
    const dailyTotals = useMemo(() => {
        const daily = {};
        for (const t of transactionsData) {
            const day = t.date ? t.date.split('T')[0] : 'Unknown';
            if (!daily[day])
                daily[day] = { income: 0, expense: 0 };
            if (t.voucher_type === 'Sales' || t.voucher_type === 'Sales HP')
                daily[day].income += getAmount(t);
            else
                daily[day].expense += getAmount(t);
        }
        return Object.entries(daily).map(([day, v]) => ({ day, income: v.income, expense: v.expense }));
    }, [transactionsData]);
    const filtered = useMemo(() => transactionsData.filter((t) => (t.party_ledger_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.voucher_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.narration ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.billagentname ?? '').toLowerCase().includes(search.toLowerCase())), [transactionsData, search]);
    const totalSales = useMemo(() => transactionsData.filter((t) => t.voucher_type === 'Sales' || t.voucher_type === 'Sales HP').reduce((s, t) => s + getAmount(t), 0), [transactionsData]);
    const totalPayments = useMemo(() => transactionsData.filter((t) => t.voucher_type === 'Payment').reduce((s, t) => s + getAmount(t), 0), [transactionsData]);
    const totalExpenses = useMemo(() => transactionsData.filter((t) => t.voucher_type === 'Purchase').reduce((s, t) => s + getAmount(t), 0), [transactionsData]);
    const netCash = totalSales - totalPayments - totalExpenses;
    if (loading) {
        return (<div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted-foreground"/>
      </div>);
    }
    return (<div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 h-full">
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Daybook</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-36 border-0 p-0 h-auto text-sm focus-visible:ring-0"/>
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-36 border-0 p-0 h-auto text-sm focus-visible:ring-0"/>
          </div>
          <Button variant="outline" size="sm" onClick={handleFetch}>Fetch</Button>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground"/>
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-32"/>
          </div>
          <Button variant="outline" size="sm"><Filter size={14}/> Filter</Button>
          <ExportDropdown data={filtered} columns={DAYBOOK_EXPORT_COLUMNS} filename="daybook" showLabel/>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detail">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SummaryCards totalSales={totalSales} totalPayments={totalPayments} totalExpenses={totalExpenses} netCash={netCash}/>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <DailyChart dailyTotals={dailyTotals}/>
            <TransactionBreakdown transactionsData={transactionsData} typeColors={typeColors}/>
          </div>

          <SalesmanPerformance transactionsData={transactionsData}/>
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          <DetailTab filtered={filtered} expandedIds={expandedIds} toggleExpand={toggleExpand}/>
        </TabsContent>
      </Tabs>
    </div>);
}
