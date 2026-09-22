import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  user_type: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenExpiry: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tokenExpiry: null,
};

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  localStorage.removeItem('admin-root');
  dispatch(logout());
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; tokenExpiry?: number }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.tokenExpiry = action.payload.tokenExpiry || null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTokenExpiry: (state, action: PayloadAction<number | null>) => {
      state.tokenExpiry = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError, setTokenExpiry } =
  authSlice.actions;
export default authSlice.reducer;
