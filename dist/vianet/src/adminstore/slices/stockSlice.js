import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    entries: [],
    loading: false,
    error: null,
};
const stockSlice = createSlice({
    name: "stock",
    initialState,
    reducers: {
        setEntries: (state, action) => {
            state.entries = action.payload;
            state.error = null;
        },
        addEntry: (state, action) => {
            state.entries.push(action.payload);
        },
        updateEntry: (state, action) => {
            const index = state.entries.findIndex((entry) => entry.id === action.payload.id);
            if (index !== -1) {
                state.entries[index] = action.payload;
            }
        },
        removeEntry: (state, action) => {
            state.entries = state.entries.filter((entry) => entry.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setEntries, addEntry, updateEntry, removeEntry, setLoading, setError, } = stockSlice.actions;
export default stockSlice.reducer;
