import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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
  summary: BalanceSheetSummary;
  loading: boolean;
  error: string | null;
}

const initialState: BalanceSheetState = {
  data: null,
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
});

export const { setBalanceSheetData, setSummary, setLoading, setError } =
  balanceSheetSlice.actions;
export default balanceSheetSlice.reducer;
