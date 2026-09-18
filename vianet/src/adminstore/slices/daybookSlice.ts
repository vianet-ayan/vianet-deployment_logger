import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface LedgerEntry {
  amount: string;
  ledgerName: string;
  description: string;
  isDeemedPositive: string;
}

export interface InventoryEntry {
  rate: string;
  amount: string;
  serialNo: string[];
  billedQty: string;
  description: string;
  stockItemName: string;
}

export interface DaybookEntry {
  id: string;
  guid: string;
  date: string;
  voucher_type: string;
  voucher_number: string;
  party_ledger_name: string;
  narration: string;
  ledgerentries: LedgerEntry[];
  inventoryentries: InventoryEntry[];
  created_at: string;
  billagentname: string;
}

interface DaybookState {
  entries: DaybookEntry[];
  dateRange: { from: string; to: string };
  summary: {
    totalSales: number;
    totalPayments: number;
    totalExpenses: number;
    netCash: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DaybookState = {
  entries: [],
  dateRange: { from: "", to: "" },
  summary: {
    totalSales: 0,
    totalPayments: 0,
    totalExpenses: 0,
    netCash: 0,
  },
  loading: false,
  error: null,
};

export function getAmount(entry: DaybookEntry): number {
  const total = entry.ledgerentries.reduce((sum, l) => sum + parseFloat(l.amount || "0"), 0);
  return Math.abs(total);
}

export const fetchDaybook = createAsyncThunk(
  "daybook/fetchDaybook",
  async ({ from, to }: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/admin/daybook/range?from=${from}&to=${to}`);
      console.log("[daybookSlice] status:", res.status, "ok:", res.ok);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      console.log("[daybookSlice] response length:", text.length, "starts:", text.slice(0, 100));
      const data = JSON.parse(text);
      return { data, from, to };
    } catch (err: unknown) {
      console.error("[daybookSlice] error:", err);
      return rejectWithValue((err as Error).message);
    }
  }
);

const daybookSlice = createSlice({
  name: "daybook",
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<DaybookEntry[]>) => {
      state.entries = action.payload;
      state.error = null;
    },
    addEntry: (state, action: PayloadAction<DaybookEntry>) => {
      state.entries.push(action.payload);
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(
        (entry) => entry.id !== action.payload
      );
    },
    setDateRange: (
      state,
      action: PayloadAction<{ from: string; to: string }>
    ) => {
      state.dateRange = action.payload;
    },
    setSummary: (
      state,
      action: PayloadAction<{
        totalSales: number;
        totalPayments: number;
        totalExpenses: number;
        netCash: number;
      }>
    ) => {
      state.summary = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDaybook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDaybook.fulfilled, (state, action) => {
        state.loading = false;
        const { data, from, to } = action.payload;
        const entries: DaybookEntry[] = Array.isArray(data) ? data : [];
        state.entries = entries;
        state.dateRange = { from, to };

        let totalSales = 0;
        let totalPayments = 0;
        let totalExpenses = 0;

        for (const entry of entries) {
          const amount = getAmount(entry);
          if (entry.voucher_type === "Sales" || entry.voucher_type === "Sales HP") {
            totalSales += amount;
          } else if (entry.voucher_type === "Payment") {
            totalPayments += amount;
          } else if (entry.voucher_type === "Purchase") {
            totalExpenses += amount;
          }
        }

        state.summary = {
          totalSales,
          totalPayments,
          totalExpenses,
          netCash: totalSales - totalPayments - totalExpenses,
        };
      })
      .addCase(fetchDaybook.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch daybook";
      });
  },
});

export const {
  setEntries,
  addEntry,
  removeEntry,
  setDateRange,
  setSummary,
  setLoading,
  setError,
} = daybookSlice.actions;
export default daybookSlice.reducer;
