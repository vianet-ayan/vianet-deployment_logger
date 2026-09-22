import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { normalizeRecordData } from "@/lib/reportData";

interface BSLineItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

interface BalanceSheetData {
  asOfDate: string;
  assets: {
    currentAssets: BSLineItem[];
    nonCurrentAssets: BSLineItem[];
  };
  liabilities: {
    currentLiabilities: BSLineItem[];
    nonCurrentLiabilities: BSLineItem[];
  };
  equity: BSLineItem[];
}

interface BalanceSheetSummary {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface BalanceSheetState {
  data: BalanceSheetData | null;
  records: BalanceSheetRecord[];
  summary: BalanceSheetSummary;
  loading: boolean;
  error: string | null;
}

const initialState: BalanceSheetState = {
  data: null,
  records: [],
  summary: {
    totalCurrentAssets: 0,
    totalNonCurrentAssets: 0,
    totalAssets: 0,
    totalCurrentLiabilities: 0,
    totalNonCurrentLiabilities: 0,
    totalLiabilities: 0,
    totalEquity: 0,
  },
  loading: false,
  error: null,
};

interface BalanceSheetRecord {
  id: number;
  date: string;
  data: Record<string, unknown> | null;
  created_at: string;
}

export const fetchBalanceSheets = createAsyncThunk<
  BalanceSheetRecord[],
  void,
  { rejectValue: string; state: { auth: { token: string } } }
>("balanceSheet/fetchBalanceSheets", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token;
    const res = await fetch("/api/admin/pnl/balance-sheet", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch balance sheets");
    const raw = (await res.json()) as BalanceSheetRecord[];
    // Normalize double-wrapped payloads: { data: { data: { rows } } } → { data: { rows } }
    return Array.isArray(raw) ? raw.map(normalizeRecordData) : [];
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

export const saveBalanceSheet = createAsyncThunk<
  BalanceSheetRecord,
  { date: string; data: Record<string, unknown> },
  { rejectValue: string; state: { auth: { token: string } } }
>("balanceSheet/saveBalanceSheet", async ({ date, data }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token;
    const res = await fetch("/api/admin/pnl/balance-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, data }),
    });
    if (!res.ok) throw new Error("Failed to save balance sheet");
    return normalizeRecordData((await res.json()) as BalanceSheetRecord);
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

export const deleteBalanceSheetById = createAsyncThunk<
  number,
  number,
  { rejectValue: string; state: { auth: { token: string } } }
>("balanceSheet/deleteBalanceSheet", async (id, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token;
    const res = await fetch(`/api/admin/pnl/balance-sheet/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete balance sheet");
    return id;
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

const balanceSheetSlice = createSlice({
  name: "balanceSheet",
  initialState,
  reducers: {
    setBalanceSheetData: (state, action: PayloadAction<BalanceSheetData>) => {
      state.data = action.payload;
      state.error = null;
    },
    setSummary: (state, action: PayloadAction<BalanceSheetSummary>) => {
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
      .addCase(fetchBalanceSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalanceSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchBalanceSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch balance sheets";
      })
      .addCase(saveBalanceSheet.fulfilled, (state, action) => {
        const index = state.records.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        } else {
          state.records.unshift(action.payload);
        }
      })
      .addCase(deleteBalanceSheetById.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
      });
  },
});

export const { setBalanceSheetData, setSummary, setLoading, setError } =
  balanceSheetSlice.actions;
export default balanceSheetSlice.reducer;
