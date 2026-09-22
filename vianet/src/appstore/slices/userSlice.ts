import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AppUserData {
  id: number;
  name: string;
  email: string;
  access_group_id: number;
  user_type: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  verified: boolean;
}

interface AppUserState {
  users: AppUserData[];
  selectedUser: AppUserData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppUserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const appFetchUsers = createAsyncThunk(
  "appUser/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/app/user");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const appFetchUserById = createAsyncThunk(
  "appUser/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/app/user/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const appUpdateUserById = createAsyncThunk(
  "appUser/updateUserById",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: Partial<
        Pick<
          AppUserData,
          "name" | "email" | "user_type" | "is_active" | "access_group_id"
        >
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/app/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const appUserSlice = createSlice({
  name: "appUser",
  initialState,
  reducers: {
    setAppSelectedUser: (state, action: PayloadAction<AppUserData | null>) => {
      state.selectedUser = action.payload;
    },
    clearAppSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setAppUsers: (state, action: PayloadAction<AppUserData[]>) => {
      state.users = action.payload;
    },
    setAppUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAppUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(appFetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appFetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(appFetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(appFetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appFetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(appFetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(appUpdateUserById.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.users.findIndex((u) => u.id === updated.id);
        if (index !== -1) state.users[index] = updated;
        if (state.selectedUser?.id === updated.id) state.selectedUser = updated;
      });
  },
});

export const {
  setAppSelectedUser,
  clearAppSelectedUser,
  setAppUsers,
  setAppUserLoading,
  setAppUserError,
} = appUserSlice.actions;
export default appUserSlice.reducer;
