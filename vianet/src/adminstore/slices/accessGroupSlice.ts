import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AccessGroup {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface AccessGroupState {
  groups: AccessGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: AccessGroupState = {
  groups: [],
  loading: false,
  error: null,
};

export const fetchAccessGroups = createAsyncThunk<
  AccessGroup[],
  void,
  { rejectValue: string }
>(
  "accessGroup/fetchAccessGroups",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth.token;
      const res = await fetch("/api/admin/access-group", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch access groups");

      const data: AccessGroup[] = await res.json();
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const accessGroupSlice = createSlice({
  name: "accessGroup",
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<AccessGroup[]>) => {
      state.groups = action.payload;
      state.error = null;
    },
    addGroup: (state, action: PayloadAction<AccessGroup>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<AccessGroup>) => {
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.id
      );
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload
      );
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
      .addCase(fetchAccessGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAccessGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch access groups";
      });
  },
});

export const {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
} = accessGroupSlice.actions;

export default accessGroupSlice.reducer;
