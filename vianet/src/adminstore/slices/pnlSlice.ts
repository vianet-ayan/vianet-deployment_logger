import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { normalizeRecordData } from "@/lib/reportData";

interface PnLLineItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

interface PnLData {
  period: string;
  startDate: string;
  endDate: string;
  revenue: PnLLineItem[];
  cogs: PnLLineItem[];
  operatingExpenses: PnLLineItem[];
  nonOperatingExpenses: PnLLineItem[];
  taxes: PnLLineItem[];
}

interface PnLSummary {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  operatingProfit: number;
  totalNonOperatingExpenses: number;
  profitBeforeTax: number;
  totalTaxes: number;
  netProfit: number;
}

interface PnLState {
  data: PnLData | null;
  monthly: PnLMonthlyRecord[];
  summary: PnLSummary;
  loading: boolean;
  error: string | null;
}

const initialState: PnLState = {
  data: null,
  monthly: [],
  summary: {
    totalRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    totalOperatingExpenses: 0,
    operatingProfit: 0,
    totalNonOperatingExpenses: 0,
    profitBeforeTax: 0,
    totalTaxes: 0,
    netProfit: 0,
  },
  loading: false,
  error: null,
};

interface PnLMonthlyRecord {
  id: number;
  month: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const fetchPnlMonthly = createAsyncThunk<
  PnLMonthlyRecord[],
  void,
  { rejectValue: string; state: { auth: { token: string } } }
>("pnl/fetchPnlMonthly", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token;
    const res = await fetch("/api/admin/pnl/monthly", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch monthly PnL");
    const raw = (await res.json()) as PnLMonthlyRecord[];
    // Normalize double-wrapped payloads: { data: { data: { rows } } } → { data: { rows } }
    return Array.isArray(raw) ? raw.map(normalizeRecordData) : [];
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

export const savePnlMonthly = createAsyncThunk<
  PnLMonthlyRecord,
  { month: string; data: Record<string, unknown> },
  { rejectValue: string; state: { auth: { token: string } } }
>("pnl/savePnlMonthly", async ({ month, data }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token;
    const res = await fetch("/api/admin/pnl/monthly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ month, data }),
    });
    if (!res.ok) throw new Error("Failed to save monthly PnL");
    return normalizeRecordData((await res.json()) as PnLMonthlyRecord);
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

const pnlSlice = createSlice({
  name: "pnl",
  initialState,
  reducers: {
    setPnLData: (state, action: PayloadAction<PnLData>) => {
      state.data = action.payload;
      state.error = null;
    },
    setSummary: (state, action: PayloadAction<PnLSummary>) => {
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
      .addCase(fetchPnlMonthly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPnlMonthly.fulfilled, (state, action) => {
        state.loading = false;
        state.monthly = action.payload;
      })
      .addCase(fetchPnlMonthly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch monthly PnL";
      })
      .addCase(savePnlMonthly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePnlMonthly.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.monthly.findIndex((m) => m.month === action.payload.month);
        if (index !== -1) {
          state.monthly[index] = action.payload;
        } else {
          state.monthly.push(action.payload);
          state.monthly.sort((a, b) => b.month.localeCompare(a.month));
        }
      })
      .addCase(savePnlMonthly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save monthly PnL";
      });
  },
});

export const { setPnLData, setSummary, setLoading, setError } =
  pnlSlice.actions;
export default pnlSlice.reducer;
