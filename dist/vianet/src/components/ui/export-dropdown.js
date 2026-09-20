import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
export function ExportDropdown({ data, columns, filename, showLabel }) {
    const handleExport = () => {
        const headers = columns.map(c => c.header).join(",");
        const rows = data.map((row) => columns.map((c) => row[c.key] ?? "").join(","));
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (<Button variant="outline" size="sm" onClick={handleExport}>
      <Download size={14}/> {showLabel && "Export"}
    </Button>);
}
