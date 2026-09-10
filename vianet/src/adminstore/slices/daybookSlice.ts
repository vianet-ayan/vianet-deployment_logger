import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface DaybookEntry {
  id: string;
  date: string;
  type: "receipt" | "payment" | "journal" | "contra";
  referenceNo: string;
  partyName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  createdAt: string;
}

interface DaybookState {
  entries: DaybookEntry[];
  dateRange: { start: string; end: string };
  summary: {
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DaybookState = {
  entries: [],
  dateRange: { start: "", end: "" },
  summary: {
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
  },
  loading: false,
  error: null,
};

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
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
    },
    setSummary: (
      state,
      action: PayloadAction<{
        totalDebit: number;
        totalCredit: number;
        closingBalance: number;
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
