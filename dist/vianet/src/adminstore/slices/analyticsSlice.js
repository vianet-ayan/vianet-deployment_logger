import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    sales: {
        totalSales: 0,
        avgOrderValue: 0,
        salesGrowth: 0,
        salesByPeriod: [],
    },
    customers: {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        topCustomers: [],
    },
    products: {
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        topSelling: [],
        slowMoving: [],
    },
    financial: {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        cashFlow: 0,
        outstandingReceivables: 0,
        outstandingPayables: 0,
    },
    inventoryAnalytics: {
        totalInventoryValue: 0,
        totalItems: 0,
        stockTurnoverRate: 0,
        categoryWise: [],
        warehouseWise: [],
    },
    dateRange: { start: "", end: "" },
    loading: false,
    error: null,
};
const analyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {
        setSalesAnalytics: (state, action) => {
            state.sales = { ...state.sales, ...action.payload };
            state.error = null;
        },
        setCustomerAnalytics: (state, action) => {
            state.customers = { ...state.customers, ...action.payload };
            state.error = null;
        },
        setProductAnalytics: (state, action) => {
            state.products = { ...state.products, ...action.payload };
            state.error = null;
        },
        setFinancialAnalytics: (state, action) => {
            state.financial = { ...state.financial, ...action.payload };
            state.error = null;
        },
        setInventoryAnalytics: (state, action) => {
            state.inventoryAnalytics = {
                ...state.inventoryAnalytics,
                ...action.payload,
            };
            state.error = null;
        },
        setDateRange: (state, action) => {
            state.dateRange = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setSalesAnalytics, setCustomerAnalytics, setProductAnalytics, setFinancialAnalytics, setInventoryAnalytics, setDateRange, setLoading, setError, } = analyticsSlice.actions;
export default analyticsSlice.reducer;
