import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SalesAnalytics {
  totalSales: number;
  avgOrderValue: number;
  salesGrowth: number;
  salesByPeriod: { period: string; amount: number }[];
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  topCustomers: { id: string; name: string; totalSpent: number; orders: number }[];
}

interface ProductAnalytics {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  topSelling: { id: string; name: string; quantitySold: number; revenue: number }[];
  slowMoving: { id: string; name: string; quantitySold: number; lastSold: string }[];
}

interface FinancialAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  outstandingReceivables: number;
  outstandingPayables: number;
}

interface InventoryAnalytics {
  totalInventoryValue: number;
  totalItems: number;
  stockTurnoverRate: number;
  categoryWise: { category: string; value: number; quantity: number }[];
  warehouseWise: { warehouse: string; value: number; quantity: number }[];
}

interface AnalyticsState {
  sales: SalesAnalytics;
  customers: CustomerAnalytics;
  products: ProductAnalytics;
  financial: FinancialAnalytics;
  inventoryAnalytics: InventoryAnalytics;
  dateRange: { start: string; end: string };
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
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
    setSalesAnalytics: (state, action: PayloadAction<Partial<SalesAnalytics>>) => {
      state.sales = { ...state.sales, ...action.payload };
      state.error = null;
    },
    setCustomerAnalytics: (
      state,
      action: PayloadAction<Partial<CustomerAnalytics>>
    ) => {
      state.customers = { ...state.customers, ...action.payload };
      state.error = null;
    },
    setProductAnalytics: (
      state,
      action: PayloadAction<Partial<ProductAnalytics>>
    ) => {
      state.products = { ...state.products, ...action.payload };
      state.error = null;
    },
    setFinancialAnalytics: (
      state,
      action: PayloadAction<Partial<FinancialAnalytics>>
    ) => {
      state.financial = { ...state.financial, ...action.payload };
      state.error = null;
    },
    setInventoryAnalytics: (
      state,
      action: PayloadAction<Partial<InventoryAnalytics>>
    ) => {
      state.inventoryAnalytics = {
        ...state.inventoryAnalytics,
        ...action.payload,
      };
      state.error = null;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
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
  setSalesAnalytics,
  setCustomerAnalytics,
  setProductAnalytics,
  setFinancialAnalytics,
  setInventoryAnalytics,
  setDateRange,
  setLoading,
  setError,
} = analyticsSlice.actions;
export default analyticsSlice.reducer;
