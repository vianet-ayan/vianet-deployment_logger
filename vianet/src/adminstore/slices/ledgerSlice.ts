import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface LedgerEntry {
  id: string;
  guid: string;
  name: string;
  address: string[] | null;
  mobile: string[] | null;
  ledgername: string | null;
}

interface LedgerState {
  entries: LedgerEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: LedgerState = {
  entries: [],
  loading: false,
  error: null,
};

export const getLedger = createAsyncThunk<
  LedgerEntry[],            // Type of the returned payload
  void,                     // First argument passed to dispatch (none in this case)
  { rejectValue: string }   // Type when rejected
>(
  "ledger/getLedger",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth.token;
      const res = await fetch("/api/admin/ledger", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch ledger");

      const data: LedgerEntry[] = await res.json();
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const ledgerSlice = createSlice({
  name: "ledger",
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<LedgerEntry[]>) => {
      state.entries = action.payload;
      state.error = null;
    },
    addEntry: (state, action: PayloadAction<LedgerEntry>) => {
      state.entries.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<LedgerEntry>) => {
      const index = state.entries.findIndex(
        (entry) => entry.id === action.payload.id
      );
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(
        (entry) => entry.id !== action.payload
      );
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
      .addCase(getLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ledger";
        console.log("[error get ledger]", state, action);
      });
  },
});

export const {
  setEntries,
  addEntry,
  updateEntry,
  removeEntry,
  setLoading,
  setError,
} = ledgerSlice.actions;

export default ledgerSlice.reducer;