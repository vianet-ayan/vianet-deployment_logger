import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface RevenueData {
  month: string;
  revenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: "order" | "payment" | "user" | "inventory";
  message: string;
  timestamp: string;
}

interface DashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  revenueByMonth: RevenueData[];
  topProducts: TopProduct[];
  recentActivities: RecentActivity[];
}

export interface SalesData {
  total_sales: string;
  total_orders: string;
}

interface DashboardState {
  analytics: DashboardAnalytics;
  salesThisMonth: SalesData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
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

export const fetchSalesThisMonth = createAsyncThunk(
  "dashboard/fetchSalesThisMonth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/admin/dashboard/salesthismonth");
      if (!res.ok) throw new Error("Failed to fetch sales this month");
      return await res.json();
    } catch (err: Error) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setAnalytics: (state, action: PayloadAction<Partial<DashboardAnalytics>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
      state.error = null;
    },
    setRevenueByMonth: (state, action: PayloadAction<RevenueData[]>) => {
      state.analytics.revenueByMonth = action.payload;
    },
    setTopProducts: (state, action: PayloadAction<TopProduct[]>) => {
      state.analytics.topProducts = action.payload;
    },
    setRecentActivities: (state, action: PayloadAction<RecentActivity[]>) => {
      state.analytics.recentActivities = action.payload;
    },
    setSalesThisMonth: (state, action: PayloadAction<SalesData>) => {
      state.salesThisMonth = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
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
        state.error = action.payload as string;
      });
  },
});

export const {
  setAnalytics,
  setRevenueByMonth,
  setTopProducts,
  setRecentActivities,
  setSalesThisMonth,
  setLoading,
  setError,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
