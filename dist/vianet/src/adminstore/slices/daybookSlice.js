import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
    entries: [],
    dateRange: { from: "", to: "" },
    summary: {
        totalSales: 0,
        totalPayments: 0,
        totalExpenses: 0,
        netCash: 0,
    },
    loading: false,
    error: null,
};
export function getAmount(entry) {
    const total = entry.ledgerentries.reduce((sum, l) => sum + parseFloat(l.amount || "0"), 0);
    return Math.abs(total);
}
export const fetchDaybook = createAsyncThunk("daybook/fetchDaybook", async ({ from, to }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/admin/daybook/range?from=${from}&to=${to}`);
        console.log("[daybookSlice] status:", res.status, "ok:", res.ok);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const text = await res.text();
        console.log("[daybookSlice] response length:", text.length, "starts:", text.slice(0, 100));
        const data = JSON.parse(text);
        return { data, from, to };
    }
    catch (err) {
        console.error("[daybookSlice] error:", err);
        return rejectWithValue(err.message);
    }
});
const daybookSlice = createSlice({
    name: "daybook",
    initialState,
    reducers: {
        setEntries: (state, action) => {
            state.entries = action.payload;
            state.error = null;
        },
        addEntry: (state, action) => {
            state.entries.push(action.payload);
        },
        removeEntry: (state, action) => {
            state.entries = state.entries.filter((entry) => entry.id !== action.payload);
        },
        setDateRange: (state, action) => {
            state.dateRange = action.payload;
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
    extraReducers: (builder) => {
        builder
            .addCase(fetchDaybook.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchDaybook.fulfilled, (state, action) => {
            state.loading = false;
            const { data, from, to } = action.payload;
            const entries = Array.isArray(data) ? data : [];
            state.entries = entries;
            state.dateRange = { from, to };
            let totalSales = 0;
            let totalPayments = 0;
            let totalExpenses = 0;
            for (const entry of entries) {
                const amount = getAmount(entry);
                if (entry.voucher_type === "Sales" || entry.voucher_type === "Sales HP") {
                    totalSales += amount;
                }
                else if (entry.voucher_type === "Payment") {
                    totalPayments += amount;
                }
                else if (entry.voucher_type === "Purchase") {
                    totalExpenses += amount;
                }
            }
            state.summary = {
                totalSales,
                totalPayments,
                totalExpenses,
                netCash: totalSales - totalPayments - totalExpenses,
            };
        })
            .addCase(fetchDaybook.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch daybook";
        });
    },
});
export const { setEntries, addEntry, removeEntry, setDateRange, setSummary, setLoading, setError, } = daybookSlice.actions;
export default daybookSlice.reducer;
