import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface LedgerEntry {
  id: string;
  date: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
  accountId: string;
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
