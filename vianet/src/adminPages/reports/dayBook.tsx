import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useSelector, useDispatch } from "react-redux"
import { ChevronDown, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportDropdown } from "@/components/ui/export-dropdown"
import type { ExportColumn } from "@/lib/exportUtils"
import {
  getAmount,
  fetchDaybookByDateRange,
} from "@/adminstore/slices/daybookSlice"
import type { DaybookEntry } from "@/adminstore/slices/daybookSlice"
import type { RootState, AppDispatch } from "@/adminstore"

const DAYBOOK_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "date", header: "Date" },
  { key: "party_ledger_name", header: "Customer" },
  { key: "voucher_number", header: "Reference" },
  { key: "billagentname", header: "Salesman" },
  { key: "voucher_type", header: "Type" },
  { key: "narration", header: "Narration" },
]

const typeBadgeClass: Record<string, string> = {
  Sales: "bg-green-100 text-green-700 border-green-200",
  "Sales HP": "bg-green-100 text-green-700 border-green-200",
  Purchase: "bg-purple-100 text-purple-700 border-purple-200",
  Payment: "bg-blue-100 text-blue-700 border-blue-200",
  Receipt: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

function getTypeBadgeClass(type: string): string {
  return typeBadgeClass[type] ?? "bg-gray-100 text-gray-700 border-gray-200"
}

function formatDay(dateStr: string | undefined): string {
  if (!dateStr) return "Unknown"
  return dateStr.split("T")[0]
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ?? ""}`}>{value}</p>
    </div>
  )
}

function SummaryCards({
  totalSales,
  totalPayments,
  totalExpenses,
  netCash,
}: {
  totalSales: number
  totalPayments: number
  totalExpenses: number
  netCash: number
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <SummaryCard label="Total Sales" value={formatAmount(totalSales)} accent="text-green-600" />
      <SummaryCard label="Total Payments" value={formatAmount(totalPayments)} accent="text-blue-600" />
      <SummaryCard label="Total Expenses" value={formatAmount(totalExpenses)} accent="text-purple-600" />
      <SummaryCard
        label="Net Cash"
        value={formatAmount(netCash)}
        accent={netCash >= 0 ? "text-green-600" : "text-red-600"}
      />
    </div>
  )
}

function DailyChart({ dailyTotals }: { dailyTotals: { day: string; income: number; expense: number }[] }) {
  const max = Math.max(1, ...dailyTotals.map((d) => Math.max(d.income, d.expense)))

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Daily Totals</h2>
      {dailyTotals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data for this period</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-auto">
          {dailyTotals.map(({ day, income, expense }) => (
            <div key={day} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{day}</span>
              <div className="flex-1 space-y-1">
                <div className="h-2 rounded-full bg-green-500/80" style={{ width: `${(income / max) * 100}%` }} />
                <div className="h-2 rounded-full bg-red-400/80" style={{ width: `${(expense / max) * 100}%` }} />
              </div>
              <span className="w-28 text-right shrink-0">
                <span className="text-green-600">+{formatAmount(income)}</span>{" "}
                <span className="text-red-500">-{formatAmount(expense)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransactionBreakdown({ entries }: { entries: DaybookEntry[] }) {
  const typeCounts = useMemo(
    () =>
      entries.reduce<Record<string, number>>((acc, t) => {
        acc[t.voucher_type] = (acc[t.voucher_type] || 0) + 1
        return acc
      }, {}),
    [entries]
  )

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Transaction Breakdown</h2>
      {Object.keys(typeCounts).length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between text-sm">
              <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getTypeBadgeClass(type)}`}>
                {type}
              </span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SalesmanPerformance({ entries }: { entries: DaybookEntry[] }) {
  const salesmanData = useMemo(
    () =>
      entries.reduce<Record<string, number>>((acc, t) => {
        const name = t.billagentname || "Unassigned"
        acc[name] = (acc[name] || 0) + getAmount(t)
        return acc
      }, {}),
    [entries]
  )

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Salesman Performance</h2>
      {Object.keys(salesmanData).length === 0 ? (
        <p className="text-sm text-muted-foreground">No data</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(salesmanData).map(([name, total]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span>{name}</span>
              <span className="font-medium">{formatAmount(total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransactionRow({
  entry,
  isOpen,
  onToggle,
}: {
  entry: DaybookEntry
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`px-4 py-3 border-b cursor-pointer transition-colors ${isOpen ? "bg-muted/40" : "hover:bg-muted/50"}`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{entry.party_ledger_name || "Unknown party"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatDay(entry.date)} · {entry.voucher_number || "No ref"}
              {entry.billagentname ? ` · ${entry.billagentname}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getTypeBadgeClass(entry.voucher_type)}`}>
            {entry.voucher_type}
          </span>
          <span className="font-medium text-sm tabular-nums">{formatAmount(getAmount(entry))}</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t text-xs space-y-2">
          <p className="text-muted-foreground">Narration: {entry.narration || "—"}</p>
          {entry.inventoryentries.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Items:</p>
              <div className="space-y-1">
                {entry.inventoryentries.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4">
                    <span>{item.stockItemName}</span>
                    <span className="text-muted-foreground">
                      {item.billedQty} × {formatAmount(parseFloat(item.rate))} = {formatAmount(parseFloat(item.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {entry.ledgerentries.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Ledger entries:</p>
              <div className="space-y-1">
                {entry.ledgerentries.map((le, idx) => (
                  <div key={idx} className="flex justify-between gap-4">
                    <span>{le.ledgerName}</span>
                    <span className="text-muted-foreground">
                      {parseFloat(le.amount) >= 0 ? "Dr" : "Cr"} {formatAmount(Math.abs(parseFloat(le.amount)))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailTab({
  filtered,
  expandedIds,
  toggleExpand,
  expandAll,
  collapseAll,
}: {
  filtered: DaybookEntry[]
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    overscan: 8,
    getItemKey: (index) => filtered[index].id ?? String(index),
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} disabled={filtered.length === 0}>
            Expand all
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} disabled={expandedIds.size === 0}>
            Collapse all
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="h-[calc(100vh-16rem)] min-h-64 overflow-auto rounded-lg border">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
        ) : (
          <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const entry = filtered[virtualRow.index]
              const rowId = entry.id ?? String(virtualRow.index)
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <TransactionRow
                    entry={entry}
                    isOpen={expandedIds.has(rowId)}
                    onToggle={() => toggleExpand(rowId)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getDefaultDateRange() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const dd = String(today.getDate()).padStart(2, "0")
  return { from: `${yyyy}-${mm}-01`, to: `${yyyy}-${mm}-${dd}` }
}

export default function DayBook() {
  const dispatch = useDispatch<AppDispatch>()
  const { entries, summary, loading, error } = useSelector((state: RootState) => state.daybook)

  const [search, setSearch] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)

  const fetchData = useCallback(
    (range: { from: string; to: string }) => {
      if (range.from && range.to) {
        dispatch(fetchDaybookByDateRange(range))
      }
    },
    [dispatch]
  )

  useEffect(() => {
    fetchData({ from, to })
  }, [fetchData, from, to])

  const handleFetch = () => fetchData({ from, to })

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      for (const entry of entries) next.add(entry.id)
      return next
    })
  }, [entries])

  const collapseAll = useCallback(() => setExpandedIds(new Set()), [])

  const filtered = useMemo(
    () =>
      entries.filter((t) =>
        (t.party_ledger_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.voucher_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.narration ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.billagentname ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [entries, search]
  )

  const dailyTotals = useMemo(() => {
    const daily: Record<string, { income: number; expense: number }> = {}
    for (const t of entries) {
      const day = formatDay(t.date)
      if (!daily[day]) daily[day] = { income: 0, expense: 0 }
      if (t.voucher_type === "Sales" || t.voucher_type === "Sales HP") {
        daily[day].income += getAmount(t)
      } else {
        daily[day].expense += getAmount(t)
      }
    }
    return Object.entries(daily)
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => a.day.localeCompare(b.day))
  }, [entries])

  // Redux slice already computes these on every fetch — reuse instead of recomputing
  const { totalSales, totalPayments, totalExpenses, netCash } = summary

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 h-full">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Daybook</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36 border-0 p-0 h-auto text-sm focus-visible:ring-0" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36 border-0 p-0 h-auto text-sm focus-visible:ring-0" />
          </div>
          <Button variant="outline" size="sm" onClick={handleFetch} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Fetch
          </Button>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-32" />
          </div>
          <ExportDropdown data={filtered} columns={DAYBOOK_EXPORT_COLUMNS} filename="daybook" showLabel />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detail">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <SummaryCards totalSales={totalSales} totalPayments={totalPayments} totalExpenses={totalExpenses} netCash={netCash} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DailyChart dailyTotals={dailyTotals} />
            <TransactionBreakdown entries={entries} />
          </div>
          <SalesmanPerformance entries={entries} />
        </TabsContent>

        <TabsContent value="detail" className="mt-4">
          <DetailTab
            filtered={filtered}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            expandAll={expandAll}
            collapseAll={collapseAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
