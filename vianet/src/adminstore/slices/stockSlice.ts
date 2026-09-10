import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface StockEntry {
  id: string;
  itemId: string;
  warehouseId: string;
  quantity: number;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

interface StockState {
  entries: StockEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: StockState = {
  entries: [],
  loading: false,
  error: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<StockEntry[]>) => {
      state.entries = action.payload;
      state.error = null;
    },
    addEntry: (state, action: PayloadAction<StockEntry>) => {
      state.entries.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<StockEntry>) => {
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
} = stockSlice.actions;
export default stockSlice.reducer;
