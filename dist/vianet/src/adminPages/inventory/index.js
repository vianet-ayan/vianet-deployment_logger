import { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
export default function Inventory() {
    const { items, loading } = useSelector((state) => state.inventory);
    const [search, setSearch] = useState("");
    const scrollRef = useRef(null);
    const filtered = useMemo(() => items.filter((item) => item.fullname.toLowerCase().includes(search.toLowerCase()) ||
        item.model.toLowerCase().includes(search.toLowerCase()) ||
        item.tally_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.brand ?? "").toLowerCase().includes(search.toLowerCase())), [items, search]);
    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 56,
        overscan: 10,
    });
    if (loading) {
        return (<div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted-foreground"/>
      </div>);
    }
    return (<div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
          <Search size={14} className="text-muted-foreground"/>
          <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 p-0 h-auto text-sm focus-visible:ring-0 w-48"/>
        </div>
      </div>

      <div ref={scrollRef} className="h-[calc(100vh-10rem)] overflow-auto rounded-lg border">
        {filtered.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">No items found</p>) : (<div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = filtered[virtualRow.index];
                return (<div key={virtualRow.key} className="absolute top-0 left-0 w-full border-b px-4 py-3 hover:bg-muted/50 transition-colors" style={{ transform: `translateY(${virtualRow.start}px)` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.fullname}</span>
                      <span className="text-xs text-muted-foreground">{item.model} {item.brand ? `- ${item.brand}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium">Rs. {item.price}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.isblocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {item.isblocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>);
            })}
          </div>)}
      </div>
    </div>);
}
