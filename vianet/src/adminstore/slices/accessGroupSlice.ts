import { createSlice } from "@reduxjs/toolkit";
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
