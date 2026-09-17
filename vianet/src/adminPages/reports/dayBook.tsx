import React, { useRef, useState, useEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Loader2 } from "lucide-react"
import { ExportDropdown } from "@/components/ui/export-dropdown"
import type { ExportColumn } from "@/lib/exportUtils"
import { useAdminQuery } from "@/hooks/useAdminQuery"
import { Suspense } from "react"

const DAYBOOK_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'date', header: 'Date' },
  { key: 'customer', header: 'Customer' },
  { key: 'ref', header: 'Reference' },
  { key: 'salesman', header: 'Salesman' },
  { key: 'type', header: 'Type' },
  { key: 'amount', header: 'Amount' },
  { key: 'narration', header: 'Narration' },
]

const typeColors: Record<string, string> = {
  Sale: 'bg-green-100 text-green-700',
  Payment: 'bg-blue-100 text-blue-700',
  Expense: 'bg-red-100 text-red-700',
  Purchase: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-700',
}

// Mock Day Book Transaction Data
interface DayBookEntry {
  id: number
  voucherNo: string
  date: string
  particulars: string
  voucherType: "Sales" | "Purchase" | "Payment" | "Receipt"
  debit?: number
  credit?: number
  narration: string
  entries: { account: string; dr?: number; cr?: number }[]
  customer: string
  salesman: string
  amount: number
}

const dayBookData: DayBookEntry[] = Array.from({ length: 1000 }, (_, i) => {
  const types: DayBookEntry["voucherType"][] = ["Sales", "Purchase", "Payment", "Receipt"]
  const type = types[i % types.length]
  const amount = parseFloat(((i + 1) * 142.5).toFixed(2))

  return {
    id: i + 1,
    voucherNo: `VCH-${2024000 + i}`,
    date: `2024-04-${String((i % 30) + 1).padStart(2, "0")}`,
    particulars:
      type === "Sales"
        ? `Acme Corp ${i + 1}`
        : type === "Purchase"
        ? `Global Supplies Ltd ${i + 1}`
        : type === "Payment"
        ? `Office Rent / Utilities`
        : `Customer Inward Wire`,
    voucherType: type,
    debit: type === "Purchase" || type === "Payment" ? amount : undefined,
    credit: type === "Sales" || type === "Receipt" ? amount : undefined,
    narration: `Being ${type.toLowerCase()} voucher recorded for transaction ref #${10000 + i}. Payment processed via standard banking channel.`,
    entries: [
      {
        account: type === "Sales" || type === "Receipt" ? "Bank / Cash A/c" : "Expenses / Vendor A/c",
        dr: amount,
      },
      {
        account: type === "Sales" || type === "Receipt" ? "Sales / Revenue A/c" : "Bank / Cash A/c",
        cr: amount,
      },
    ],
    customer: type === "Sales" ? `Acme Corp ${i + 1}` : `Customer ${i + 1}`,
    salesman: `Salesman ${(i % 5) + 1}`,
    amount,
  }
})

const getBadgeColor = (type: DayBookEntry["voucherType"]) => {
  switch (type) {
    case "Sales":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
    case "Purchase":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
    case "Payment":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
    case "Receipt":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
  }
}

function SummaryCards({ totalSales, totalPayments, totalExpenses, netCash }: { totalSales: number; totalPayments: number; totalExpenses: number; netCash: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  )
}

function DailyChart({ dailyTotals }: { dailyTotals: { day: string; income: number; expense: number }[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Daily Totals</h2>
      <div className="space-y-2">
        {dailyTotals.map(({ day, income, expense }) => (
          <div key={day} className="flex items-center gap-4 text-sm">
            <span className="w-24">{day}</span>
            <span className="text-green-600">Income: {income}</span>
            <span className="text-red-600">Expense: {expense}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionBreakdown({ transactionsData, typeColors }: { transactionsData: DayBookEntry[]; typeColors: Record<string, string> }) {
  const typeCounts = transactionsData.reduce((acc: Record<string, number>, t: DayBookEntry) => {
    acc[t.voucherType] = (acc[t.voucherType] || 0) + 1
    return acc
  }, {})

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Transaction Breakdown</h2>
      <div className="space-y-2">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SalesmanPerformance({ transactionsData }: { transactionsData: DayBookEntry[] }) {
  const salesmanData = transactionsData.reduce((acc: Record<string, number>, t: DayBookEntry) => {
    acc[t.salesman] = (acc[t.salesman] || 0) + (t.amount ?? 0)
    return acc
  }, {})

  return (
    <div className="rounded-lg border p-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">Salesman Performance</h2>
      <div className="space-y-2">
        {Object.entries(salesmanData).map(([name, total]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span>{name}</span>
            <span className="font-medium">{total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionRow({ transaction, isOpen, onToggle }: { transaction: DayBookEntry; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border rounded-lg p-3 mb-2 cursor-pointer hover:bg-muted/50" onClick={onToggle}>
      <div className="flex items-center justify-between text-sm">
        <span>{transaction.particulars}</span>
        <span>{transaction.voucherType}</span>
        <span>{transaction.amount}</span>
      </div>
      {isOpen && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <p>Narration: {transaction.narration}</p>
          <p>Voucher No: {transaction.voucherNo}</p>
        </div>
      )}
    </div>
  )
}

export default function DayBook() {
  const parentRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(yesterday)
  const [toDate, setToDate] = useState(yesterday)

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  useEffect(() => { setMounted(true) }, [])

  const daybookKey = `daybook-${fromDate}-${toDate}`
  const { data: daybookRaw, isLoading } = useAdminQuery<any[]>(daybookKey, `/api/admin/reports/daybook?from_date=${fromDate}&to_date=${toDate}`)
  const transactionsData = Array.isArray(daybookRaw) ? daybookRaw : dayBookData

  const dailyTotals = (() => {
    const daily: Record<string, { income: number; expense: number }> = {}
    for (const t of transactionsData) {
      const day = t.date ? t.date.split('T')[0] : 'Unknown'
      if (!daily[day]) daily[day] = { income: 0, expense: 0 }
      if (t.voucherType === 'Sales') daily[day].income += t.amount ?? 0
      else daily[day].expense += t.amount ?? 0
    }
    return Object.entries(daily).map(([day, v]) => ({ day, income: v.income, expense: v.expense }))
  })()

  const filtered = transactionsData.filter((t: DayBookEntry) =>
    (t.particulars ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.voucherNo ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.narration ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.customer ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalSales = transactionsData.filter((t: DayBookEntry) => t.voucherType === 'Sales').reduce((s: number, t: DayBookEntry) => s + (t.amount ?? 0), 0)
  const totalPayments = transactionsData.filter((t: DayBookEntry) => t.voucherType === 'Payment').reduce((s: number, t: DayBookEntry) => s + (t.amount ?? 0), 0)
  const totalExpenses = transactionsData.filter((t: DayBookEntry) => t.voucherType === 'Expense' || t.voucherType === 'Purchase').reduce((s: number, t: DayBookEntry) => s + (t.amount ?? 0), 0)
  const netCash = totalSales - totalPayments - totalExpenses

  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => 56,
    overscan: 10,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Daybook</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-32" />
          </div>
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-36 text-sm" />
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-36 text-sm" />
          <Button variant="outline" size="sm"><Filter size={14} /> Filter</Button>
          <ExportDropdown data={filtered} columns={DAYBOOK_EXPORT_COLUMNS} filename="daybook" showLabel />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detail">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SummaryCards totalSales={totalSales} totalPayments={totalPayments} totalExpenses={totalExpenses} netCash={netCash} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <DailyChart dailyTotals={dailyTotals} />
            <TransactionBreakdown transactionsData={transactionsData} typeColors={typeColors} />
          </div>

          <SalesmanPerformance transactionsData={transactionsData} />
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          {mounted && (
            <div ref={setScrollEl} className="h-[72vh] overflow-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
              ) : (
              <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                  const t: DayBookEntry = filtered[virtualRow.index]
                  const rowId = t.id ?? virtualRow.index
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="absolute top-0 left-0 w-full pr-3 pb-3"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <TransactionRow
                        transaction={t}
                        isOpen={expandedIds.has(rowId)}
                        onToggle={() => toggleExpand(rowId)}
                      />
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
