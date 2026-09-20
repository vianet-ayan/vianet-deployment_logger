import { createSlice } from "@reduxjs/toolkit";
const initialState = {
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
        setBalanceSheetData: (state, action) => {
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
export const { setBalanceSheetData, setSummary, setLoading, setError } = balanceSheetSlice.actions;
export default balanceSheetSlice.reducer;
