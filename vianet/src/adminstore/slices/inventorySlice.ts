import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"
import { getInventory } from "@/adminPages/adminApi/inventory"

export interface InventoryItem {
  id: number;
  fullname: string;
  brand: string | null;
  model: string;
  varient: string | null;
  color: string | null;
  quantity: number;
  vquantity: number;
  price: string;
  gst: string;
  resources: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  tally_name: string;
  guid: string;
  add_price: string | null;
  unit: string;
  cost_method: string;
  stockname: string | null;
  masterid: string | null;
  costing_meth: string | null;
  data: string | null;
  category_level_1: string | null;
  category_level_2: string | null;
  isblocked: boolean;
  modelname: string | null;
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth.token
      return await getInventory(token)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    addItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
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
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch inventory";
      });
  },
});

export const { setItems, addItem, updateItem, removeItem, setLoading, setError } =
  inventorySlice.actions;
export default inventorySlice.reducer;
