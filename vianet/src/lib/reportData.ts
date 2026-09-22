// Shared helpers for Tally-style report data (PnL / Balance Sheet).
// Shape: { rows: [{ name, amount: "123.45", children: [{ name, amount }] }] }

export interface ReportRow {
  name: string
  amount: string | number
  children?: ReportRow[]
}

export function parseAmount(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim()
    if (cleaned === "" || cleaned === "-") return 0
    const num = Number(cleaned)
    return isNaN(num) ? 0 : num
  }
  if (typeof value === "object" && value != null && "amount" in (value as Record<string, unknown>)) {
    return parseAmount((value as Record<string, unknown>).amount)
  }
  return 0
}

export function getRows(data: unknown): ReportRow[] {
  if (!data || typeof data !== "object") return []
  const d = data as Record<string, unknown>
  // Accept both { rows } and the double-wrapped { data: { rows } } shape
  const rows = Array.isArray(d.rows) ? d.rows : (d.data as Record<string, unknown> | undefined)?.rows
  return Array.isArray(rows) ? (rows as ReportRow[]) : []
}

/** Unwrap { data: { rows } } → { rows } so record.data is always the inner object. */
export function normalizeRecordData<T extends { data: Record<string, unknown> | null }>(record: T): T {
  const d = record.data
  if (d && typeof d === "object" && "data" in d && !("rows" in d)) {
    const inner = d.data
    if (inner && typeof inner === "object") {
      return { ...record, data: inner as Record<string, unknown> }
    }
  }
  return record
}

const COGS_ROW = /cost of sales/i
const COGS_COMPONENTS = /^(opening stock|add: purchase|less: closing)/i

/**
 * Compute P&L stats from top-level Tally rows.
 * Amounts are signed: positive = income, negative = expense.
 * "Cost of Sales :" is pre-computed by Tally; its component rows
 * (Opening Stock / Add: Purchase / Less: Closing) are skipped to avoid
 * double-counting — or summed as COGS if the summary row is absent.
 */
export function computePnlStats(rows: ReportRow[]): {
  revenue: number
  cogs: number
  expenses: number
  netProfit: number
} {
  let revenue = 0
  let expenses = 0
  let cogs = 0
  let componentSum = 0
  let hasCogsRow = false

  for (const row of rows) {
    const amount = parseAmount(row.amount)
    const name = row.name ?? ""
    if (COGS_ROW.test(name)) {
      hasCogsRow = true
      cogs += Math.abs(amount)
      continue
    }
    if (COGS_COMPONENTS.test(name)) {
      componentSum += amount
      continue
    }
    if (amount >= 0) revenue += amount
    else expenses += Math.abs(amount)
  }

  if (!hasCogsRow) cogs = Math.abs(componentSum)
  return { revenue, cogs, expenses, netProfit: revenue - cogs - expenses }
}

/** Depth-first search for the first row whose name matches (case-insensitive, partial). */
export function findRow(rows: ReportRow[], namePattern: string | RegExp): ReportRow | null {
  const matcher =
    typeof namePattern === "string"
      ? (n: string) => n.toLowerCase().includes(namePattern.toLowerCase())
      : (n: string) => namePattern.test(n)

  for (const row of rows) {
    if (matcher(row.name ?? "")) return row
    if (row.children) {
      const found = findRow(row.children, namePattern)
      if (found) return found
    }
  }
  return null
}

/** Recursively sum a row and all its children (children amounts are line items, not already summed). */
export function sumRowTree(row: ReportRow): number {
  const self = parseAmount(row.amount)
  const childSum = (row.children ?? []).reduce((sum, child) => sum + sumRowTree(child), 0)
  return self + childSum
}

export function sumAllRows(rows: ReportRow[]): number {
  return rows.reduce((sum, row) => sum + sumRowTree(row), 0)
}

export function formatCompact(amount: number): string {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`
  return `${sign}₹${abs.toFixed(0)}`
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
