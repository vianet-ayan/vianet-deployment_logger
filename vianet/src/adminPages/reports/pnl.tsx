import { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  Receipt,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  getRows,
  computePnlStats,
  formatCompact,
  formatAmount,
  monthLabel,
} from "@/lib/reportData"
import type { ReportRow } from "@/lib/reportData"
import type { RootState } from "@/adminstore"

/**
 * Top-level group coloring: income groups green, expense groups red,
 * using Tally's signed amounts (negative = expense).
 */
function groupTone(name: string, amount: number): string {
  const n = name.toLowerCase()
  if (n.includes("sales") || n.includes("income")) return amount < 0 ? "text-red-600" : "text-green-600"
  return amount < 0 ? "text-red-600" : ""
}

function RowTree({ rows, depth = 0 }: { rows: ReportRow[]; depth?: number }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  return (
    <div className={depth === 0 ? "space-y-0.5" : "space-y-0.5"}>
      {rows.map((row, idx) => {
        const key = `${depth}-${idx}-${row.name}`
        const hasChildren = Array.isArray(row.children) && row.children.length > 0
        const isOpen = openMap[key] ?? false
        const amount = Number(row.amount) || 0

        return (
          <div key={key}>
            <button
              type="button"
              disabled={!hasChildren}
              onClick={() => setOpenMap((prev) => ({ ...prev, [key]: !isOpen }))}
              className={`w-full flex items-center gap-2 rounded px-2 py-1 text-left text-xs ${
                hasChildren ? "hover:bg-muted/50" : "cursor-default"
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              {hasChildren ? (
                isOpen ? (
                  <ChevronDown size={12} className="shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight size={12} className="shrink-0 text-muted-foreground" />
                )
              ) : (
                <span className="w-3 shrink-0" />
              )}
              <span className={`flex-1 truncate ${depth === 0 ? "font-medium" : "text-muted-foreground"}`}>
                {row.name}
              </span>
              <span className={`tabular-nums ${depth === 0 ? groupTone(row.name, amount) : amount < 0 ? "text-red-600" : ""}`}>
                {formatAmount(Math.abs(amount))}
                {amount < 0 && <span className="ml-1 text-muted-foreground">Dr</span>}
              </span>
            </button>
            {hasChildren && isOpen && <RowTree rows={row.children!} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}

export default function PnL() {
  const { monthly, loading, error } = useSelector((state: RootState) => state.pnl)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const monthsDesc = useMemo(
    () => [...monthly].sort((a, b) => b.month.localeCompare(a.month)),
    [monthly]
  )

  const monthlyStats = useMemo(
    () =>
      monthsDesc.map((m) => {
        const rows = getRows(m.data)
        const stats = computePnlStats(rows)
        return {
          month: m.month,
          id: m.id,
          data: m.data,
          rows,
          ...stats,
        }
      }),
    [monthsDesc]
  )

  const latest = monthlyStats[0]
  const previous = monthlyStats[1]
  const momChange =
    latest && previous && previous.netProfit !== 0
      ? ((latest.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100
      : null

  const trendMax = Math.max(1, ...monthlyStats.map((m) => Math.abs(m.netProfit)))
  const trendAsc = [...monthlyStats].reverse()

  if (loading && monthlyStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 h-full">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Profit &amp; Loss</h1>
        {latest && <Badge variant="secondary">Latest: {monthLabel(latest.month)}</Badge>}
      </div>

      {monthlyStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
          <Receipt size={32} />
          <p className="text-sm">No PnL data yet</p>
          <p className="text-xs">Monthly snapshots will appear here once synced</p>
        </div>
      ) : (
        <>
          {latest && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  {latest.netProfit < 0 ? (
                    <TrendingDown size={16} className="text-red-500" />
                  ) : (
                    <IndianRupee size={16} className="text-muted-foreground" />
                  )}
                </div>
                <p className={`text-2xl font-bold tracking-tight ${latest.netProfit < 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCompact(latest.netProfit)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Cost of Sales</p>
                <p className="text-2xl font-bold tracking-tight">{formatCompact(latest.cogs)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold tracking-tight">{formatCompact(latest.expenses)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">MoM Change</p>
                  {momChange != null &&
                    (momChange < 0 ? (
                      <TrendingDown size={16} className="text-red-500" />
                    ) : (
                      <TrendingUp size={16} className="text-green-600" />
                    ))}
                </div>
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    momChange == null ? "" : momChange < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {momChange != null ? `${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>
          )}

          {monthlyStats.length > 1 && (
            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Net Profit Trend</h2>
              <div className="flex items-end gap-1 h-32">
                {trendAsc.map(({ month, netProfit }) => {
                  const height = Math.max(4, (Math.abs(netProfit) / trendMax) * 100)
                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center justify-end gap-1 group relative"
                      title={`${monthLabel(month)}: ${formatAmount(netProfit)}`}
                    >
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCompact(netProfit)}
                      </span>
                      <div
                        className={`w-full max-w-8 rounded-t ${netProfit < 0 ? "bg-red-400/80" : "bg-green-500/80"}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{month.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monthly Breakdown</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Click a month to expand its P&amp;L tree
              </p>
            </div>
            <div className="divide-y">
              {monthlyStats.map(({ id, month, data, revenue, netProfit }) => {
                const isOpen = expandedMonth === month
                return (
                  <div key={id}>
                    <button
                      type="button"
                      onClick={() => setExpandedMonth(isOpen ? null : month)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                        <span className="font-medium text-sm">{monthLabel(month)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm shrink-0">
                        <span className="text-muted-foreground hidden sm:inline tabular-nums">
                          Rev {formatCompact(revenue)}
                        </span>
                        <Badge
                          variant={netProfit < 0 ? "destructive" : "secondary"}
                          className="tabular-nums"
                        >
                          NP {formatCompact(netProfit)}
                        </Badge>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        {getRows(data).length > 0 ? (
                          <div className="rounded border bg-muted/20 p-2 overflow-auto max-h-96">
                            <RowTree rows={getRows(data)} />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">No rows in this snapshot</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
