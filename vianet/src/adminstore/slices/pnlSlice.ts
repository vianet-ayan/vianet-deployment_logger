import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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
  summary: PnLSummary;
  loading: boolean;
  error: string | null;
}

const initialState: PnLState = {
  data: null,
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
});

export const { setPnLData, setSummary, setLoading, setError } =
  pnlSlice.actions;
export default pnlSlice.reducer;
