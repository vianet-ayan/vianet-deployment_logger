import { useState, useMemo, useRef } from "react"
import { useSelector } from "react-redux"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Package, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { RootState } from "@/adminstore"

function formatQty(item: { quantity: number; unit: string }): string {
  return `${item.quantity} ${item.unit || "pcs"}`
}

export default function Inventory() {
  const { items, loading, error } = useSelector((state: RootState) => state.inventory)
  const [search, setSearch] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.fullname.toLowerCase().includes(search.toLowerCase()) ||
          item.model.toLowerCase().includes(search.toLowerCase()) ||
          item.tally_name.toLowerCase().includes(search.toLowerCase()) ||
          (item.brand ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const totals = useMemo(
    () => ({
      skus: items.length,
      units: items.reduce((sum, item) => sum + item.quantity, 0),
      blocked: items.filter((item) => item.isblocked).length,
    }),
    [items]
  )

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    overscan: 10,
  })

  if (loading) {
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
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold">{totals.skus}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Units in stock</p>
          <p className="text-2xl font-bold">{totals.units.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Blocked</p>
          <p className="text-2xl font-bold text-red-600">{totals.blocked}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-64 h-[calc(100vh-22rem)] overflow-auto rounded-lg border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Package size={32} />
            <p className="text-sm">{items.length === 0 ? "No inventory items" : "No items match your search"}</p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = filtered[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full border-b px-4 py-3 hover:bg-muted/50 transition-colors"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Package size={16} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.fullname}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.model}
                          {item.brand ? ` · ${item.brand}` : ""}
                          {item.color ? ` · ${item.color}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-sm">
                      <span className="text-muted-foreground hidden sm:inline">
                        Qty: {formatQty(item)}
                      </span>
                      <span className="font-medium tabular-nums">Rs. {item.price}</span>
                      <Badge variant={item.isblocked ? "destructive" : "secondary"}>
                        {item.isblocked ? "Blocked" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
