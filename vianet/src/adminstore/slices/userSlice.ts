import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: UserData[];
  selectedUser: UserData | null;
  loading: boolean;
  error: string | null;
  test?: string; // Optional property for testing purposes
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  test: 'lorem ipsum dolor sit amet', // Initial value for testing purposes
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserData[]>) => {
      state.users = action.payload;
      state.error = null;
    },
    setTest: (state, action: PayloadAction<string>) => {
      state.test = action.payload;
    },
    addUser: (state, action: PayloadAction<UserData>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<UserData>) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    setSelectedUser: (state, action: PayloadAction<UserData | null>) => {
      state.selectedUser = action.payload;
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
  setUsers,
  addUser,
  updateUser,
  removeUser,
  setSelectedUser,
  setLoading,
  setError,
  setTest,
} = userSlice.actions;
export default userSlice.reducer;
