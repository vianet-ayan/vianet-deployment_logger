import { createSlice } from "@reduxjs/toolkit";
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

interface DashboardState {
  analytics: DashboardAnalytics;
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
  loading: false,
  error: null,
};

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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAnalytics,
  setRevenueByMonth,
  setTopProducts,
  setRecentActivities,
  setLoading,
  setError,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
