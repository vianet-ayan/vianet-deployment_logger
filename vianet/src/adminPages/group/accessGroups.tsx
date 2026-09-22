import { useState, useMemo, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Copy, Check, Loader2, Search, Users, ChevronDown, Package, RefreshCw, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchAccessGroupInventory, addInventoryItem, removeInventoryItem } from "@/adminstore/slices/accessGroupSlice"
import type { RootState, AppDispatch } from "@/adminstore"
import type { AccessGroup, AccessGroupInventoryItem } from "@/adminstore/slices/accessGroupSlice"

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function JoinUrlCell({ url }: { url: string | null | undefined }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  if (!url) {
    return <span className="text-xs text-muted-foreground">No link</span>
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title="Copy join link"
    >
      {copied ? (
        <Check size={12} className="text-green-600" />
      ) : (
        <Copy size={12} />
      )}
      <span className="max-w-40 truncate">{copied ? "Copied!" : url}</span>
    </button>
  )
}

function GroupInventoryPanel({ group }: { group: AccessGroup }) {
  const dispatch = useDispatch<AppDispatch>()
  const items = group.inventory?.data

  if (!items) {
    return (
      <div className="mt-2 flex items-center justify-center gap-2 rounded border bg-muted/30 py-6 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        Loading inventory…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mt-2 flex flex-col items-center gap-1 rounded border bg-muted/30 py-6 text-muted-foreground">
        <Package size={20} />
        <p className="text-sm">No inventory allocated to this group</p>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded border bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <p className="text-xs font-medium">
          {items.length} item{items.length === 1 ? "" : "s"} allocated
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            title="Add a demo item to the store"
            onClick={(e) => {
              e.stopPropagation()
              const demo: AccessGroupInventoryItem = {
                iag_id: Date.now(),
                accessgroupid: group.id,
                inventoryid: 0,
                allocated_quantity: 0,
                oprice: "0.00",
                partner_sku_name: null,
                allocated_at: new Date().toISOString(),
                id: Date.now(),
                fullname: "MANUAL ITEM",
                brand: null,
                model: "—",
                varient: null,
                color: null,
                quantity: 1,
                vquantity: 0,
                price: "0.00",
                gst: "0.00",
                tally_name: "",
                guid: "",
                unit: "",
                isblocked: false,
              }
              dispatch(addInventoryItem({ accessGroupId: group.id, item: demo }))
            }}
          >
            + Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              dispatch(fetchAccessGroupInventory(group.id))
            }}
          >
            <RefreshCw size={12} className="mr-1" /> Refresh
          </Button>
        </div>
      </div>
      <div className="max-h-72 overflow-auto divide-y">
        {items.map((item) => (
          <div key={`${item.iag_id}-${item.id}`} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <div className="min-w-0">
              <p className="font-medium truncate">{item.fullname}</p>
              <p className="text-muted-foreground truncate">
                {item.model}
                {item.brand ? ` · ${item.brand}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-muted-foreground tabular-nums">
                Qty {item.quantity}
                {item.allocated_quantity > 0 && ` · alloc ${item.allocated_quantity}`}
              </span>
              <span className="font-medium tabular-nums">₹{item.price}</span>
              {item.isblocked && <Badge variant="destructive">Blocked</Badge>}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                title="Remove from store"
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch(removeInventoryItem({ accessGroupId: group.id, id: item.iag_id }))
                }}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AccessGroups() {
  const dispatch = useDispatch<AppDispatch>()
  const { groups, loading, error } = useSelector(
    (state: RootState) => state.accessGroup
  )
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        (group.description ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [groups, search]
  )

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    overscan: 10,
  })

  const handleToggle = (group: AccessGroup) => {
    const next = expandedId === group.id ? null : group.id
    setExpandedId(next)
    // Fetch on first expand — an empty data array with no accessGroupId means never fetched
    const neverFetched = !group.inventory || group.inventory.accessGroupId !== group.id
    if (next === group.id && neverFetched) {
      dispatch(fetchAccessGroupInventory(group.id))
    }
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Access Groups</h1>
        <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total groups</p>
          <p className="text-2xl font-bold">{groups.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">With join link</p>
          <p className="text-2xl font-bold">
            {groups.filter((g) => g.join_url).length}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-64 h-[calc(100vh-20rem)] overflow-auto rounded-lg border"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Users size={32} />
            <p className="text-sm">
              {groups.length === 0
                ? "No access groups yet"
                : "No groups match your search"}
            </p>
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const group = filtered[virtualRow.index]
              const isOpen = expandedId === group.id
              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full border-b"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(group)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Users size={16} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {group.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.description || `ID: ${group.id}`}
                          {group.inventory?.data?.length
                            ? ` · ${group.inventory.data.length} items`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <JoinUrlCell url={group.join_url} />
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        {formatDate(group.created_at)}
                      </span>
                      <Badge variant="secondary">ID {group.id}</Badge>
                    </div>
                  </button>
                  {isOpen && <div className="px-4 pb-3"><GroupInventoryPanel group={group} /></div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
