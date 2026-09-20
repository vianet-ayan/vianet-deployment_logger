import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
    items: [],
    loading: false,
    error: null,
};
export const fetchInventory = createAsyncThunk("inventory/fetchInventory", async (_, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/admin/inventory");
        if (!res.ok)
            throw new Error("Failed to fetch inventory");
        return await res.json();
    }
    catch (err) {
        return rejectWithValue(err.message);
    }
});
const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload;
            state.error = null;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        updateItem: (state, action) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
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
            state.error = action.payload || "Failed to fetch inventory";
        });
    },
});
export const { setItems, addItem, updateItem, removeItem, setLoading, setError } = inventorySlice.actions;
export default inventorySlice.reducer;
