import { useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Scale,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteBalanceSheetById } from "@/adminstore/slices/balanceSheetSlice"
import {
  getRows,
  parseAmount,
  sumAllRows,
  formatCompact,
  formatAmount,
  formatDate,
} from "@/lib/reportData"
import type { ReportRow } from "@/lib/reportData"
import type { RootState, AppDispatch } from "@/adminstore"

/** Heuristic classification of Tally-style balance sheet groups. */
function isLiabilityRow(name: string): boolean {
  const n = name.toLowerCase()
  return (
    n.includes("liabilit") ||
    n.includes("loan") ||
    n.includes("payable") ||
    n.includes("duties") ||
    n.includes("provision") ||
    n.includes("capital")
  )
}

function RowTree({ rows, depth = 0 }: { rows: ReportRow[]; depth?: number }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-0.5">
      {rows.map((row, idx) => {
        const key = `${depth}-${idx}-${row.name}`
        const hasChildren = Array.isArray(row.children) && row.children.length > 0
        const isOpen = openMap[key] ?? false
        const amount = parseAmount(row.amount)
        const liability = isLiabilityRow(row.name)

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
              <span className={`tabular-nums ${liability ? "text-red-600" : ""}`}>
                {formatAmount(Math.abs(amount))}
              </span>
            </button>
            {hasChildren && isOpen && <RowTree rows={row.children!} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}

export default function BalanceSheet() {
  const dispatch = useDispatch<AppDispatch>()
  const { records, loading, error } = useSelector((state: RootState) => state.balanceSheet)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const sorted = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  )

  const stats = useMemo(
    () =>
      sorted.map((r) => {
        const rows = getRows(r.data)
        // Tally signs amounts: negative = assets (Dr), positive = liabilities (Cr).
        // Name heuristics are the fallback when all rows share the same sign.
        const bySign = rows.some((row) => parseAmount(row.amount) < 0)
        const assetRows = bySign
          ? rows.filter((row) => parseAmount(row.amount) < 0 || !isLiabilityRow(row.name))
          : rows.filter((row) => !isLiabilityRow(row.name))
        const liabilityRows = rows.filter((row) => !assetRows.includes(row))
        return {
          ...r,
          rows,
          assets: Math.abs(sumAllRows(assetRows)),
          liabilities: Math.abs(sumAllRows(liabilityRows)),
        }
      }),
    [sorted]
  )

  const latest = stats[0]
  const previous = stats[1]
  const assetChange = latest && previous ? latest.assets - previous.assets : null
  // Tally balance sheets should net to ~0 across all top-level groups
  const balanceGap = latest ? latest.assets - latest.liabilities : null

  const handleDelete = (id: number) => {
    if (confirm("Delete this balance sheet snapshot?")) {
      dispatch(deleteBalanceSheetById(id))
    }
  }

  if (loading && stats.length === 0) {
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
        <h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1>
        {latest && <Badge variant="secondary">As of {formatDate(latest.date)}</Badge>}
      </div>

      {stats.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
          <Scale size={32} />
          <p className="text-sm">No balance sheet snapshots yet</p>
          <p className="text-xs">Snapshots will appear here once synced</p>
        </div>
      ) : (
        <>
          {latest && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Assets</p>
                <p className="text-2xl font-bold tracking-tight text-green-600">
                  {formatCompact(latest.assets)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Liabilities</p>
                <p className="text-2xl font-bold tracking-tight text-red-600">
                  {formatCompact(latest.liabilities)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Assets − Liabilities</p>
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    Math.abs(balanceGap ?? 0) <= 1 ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {formatCompact(balanceGap ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Assets Change</p>
                  {assetChange != null &&
                    (assetChange < 0 ? (
                      <ArrowDown size={16} className="text-red-500" />
                    ) : (
                      <ArrowUp size={16} className="text-green-600" />
                    ))}
                </div>
                <p className="text-2xl font-bold tracking-tight">
                  {assetChange != null ? formatCompact(assetChange) : "—"}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Snapshots</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Click a snapshot to expand its groups
              </p>
            </div>
            <div className="divide-y">
              {stats.map(({ id, date, rows, assets, liabilities }) => {
                const isOpen = expandedId === id
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{formatDate(date)}</p>
                          <p className="text-xs text-muted-foreground">
                            {rows.length} group{rows.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:inline tabular-nums">
                          Liab {formatCompact(liabilities)}
                        </span>
                        <Badge variant="secondary" className="tabular-nums">
                          Assets {formatCompact(assets)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                          title="Delete snapshot"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        {rows.length > 0 ? (
                          <div className="rounded border bg-muted/20 p-2 overflow-auto max-h-96">
                            <RowTree rows={rows} />
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
