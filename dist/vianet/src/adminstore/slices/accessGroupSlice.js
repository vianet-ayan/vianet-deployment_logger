import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    groups: [],
    loading: false,
    error: null,
};
const accessGroupSlice = createSlice({
    name: "accessGroup",
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
            state.error = null;
        },
        addGroup: (state, action) => {
            state.groups.push(action.payload);
        },
        updateGroup: (state, action) => {
            const index = state.groups.findIndex((group) => group.id === action.payload.id);
            if (index !== -1) {
                state.groups[index] = action.payload;
            }
        },
        removeGroup: (state, action) => {
            state.groups = state.groups.filter((group) => group.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setGroups, addGroup, updateGroup, removeGroup, setLoading, setError, } = accessGroupSlice.actions;
export default accessGroupSlice.reducer;
