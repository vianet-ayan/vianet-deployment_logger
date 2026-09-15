import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ExportColumn } from "@/lib/exportUtils"

interface ExportDropdownProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  showLabel?: boolean;
}

export function ExportDropdown({ data, columns, filename, showLabel }: ExportDropdownProps) {
  const handleExport = () => {
    const headers = columns.map(c => c.header).join(",");
    const rows = data.map((row: any) =>
      columns.map((c: ExportColumn) => row[c.key] ?? "").join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download size={14} /> {showLabel && "Export"}
    </Button>
  );
}
