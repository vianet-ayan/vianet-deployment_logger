import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
    users: [],
    selectedUser: null,
    test: "",
    loading: false,
    error: null,
};
export const fetchAllUsers = createAsyncThunk("user/fetchAllUsers", async (_, { rejectWithValue }) => {
    try {
        const res = await fetch("/api/admin/users");
        if (!res.ok)
            throw new Error("Failed to fetch users");
        return await res.json();
    }
    catch (err) {
        return rejectWithValue(err.message);
    }
});
export const fetchUserById = createAsyncThunk("user/fetchUserById", async (id, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok)
            throw new Error("Failed to fetch user");
        return await res.json();
    }
    catch (err) {
        return rejectWithValue(err.message);
    }
});
export const updateUserById = createAsyncThunk("user/updateUserById", async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok)
            throw new Error("Failed to update user");
        return await res.json();
    }
    catch (err) {
        return rejectWithValue(err.message);
    }
});
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        setTest: (state, action) => {
            state.test = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload;
        })
            .addCase(fetchAllUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(fetchUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchUserById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedUser = action.payload;
        })
            .addCase(fetchUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(updateUserById.fulfilled, (state, action) => {
            const updated = action.payload;
            const index = state.users.findIndex((u) => u.id === updated.id);
            if (index !== -1)
                state.users[index] = updated;
            if (state.selectedUser?.id === updated.id)
                state.selectedUser = updated;
        });
    },
});
export const { setSelectedUser, clearSelectedUser, setTest } = userSlice.actions;
export default userSlice.reducer;
