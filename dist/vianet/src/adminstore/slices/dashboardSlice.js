import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
    analytics: {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        revenueByMonth: [],
        topProducts: [],
        recentActivities: [],
    },
    salesThisMonth: null,
    loading: false,
    error: null,
};
export const fetchSalesThisMonth = createAsyncThunk("dashboard/fetchSalesThisMonth", async (_, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/admin/dashboard/salesthismonth");
        if (!res.ok)
            throw new Error("Failed to fetch sales this month");
        return await res.json();
    }
    catch (err) {
        return rejectWithValue(err.message);
    }
});
const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setAnalytics: (state, action) => {
            state.analytics = { ...state.analytics, ...action.payload };
            state.error = null;
        },
        setRevenueByMonth: (state, action) => {
            state.analytics.revenueByMonth = action.payload;
        },
        setTopProducts: (state, action) => {
            state.analytics.topProducts = action.payload;
        },
        setRecentActivities: (state, action) => {
            state.analytics.recentActivities = action.payload;
        },
        setSalesThisMonth: (state, action) => {
            state.salesThisMonth = action.payload;
            state.error = null;
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
            .addCase(fetchSalesThisMonth.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchSalesThisMonth.fulfilled, (state, action) => {
            state.loading = false;
            state.salesThisMonth = action.payload;
        })
            .addCase(fetchSalesThisMonth.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { setAnalytics, setRevenueByMonth, setTopProducts, setRecentActivities, setSalesThisMonth, setLoading, setError, } = dashboardSlice.actions;
export default dashboardSlice.reducer;
