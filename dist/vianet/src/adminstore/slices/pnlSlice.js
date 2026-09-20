import { createSlice } from "@reduxjs/toolkit";
const initialState = {
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
        setPnLData: (state, action) => {
            state.data = action.payload;
            state.error = null;
        },
        setSummary: (state, action) => {
            state.summary = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setPnLData, setSummary, setLoading, setError } = pnlSlice.actions;
export default pnlSlice.reducer;
