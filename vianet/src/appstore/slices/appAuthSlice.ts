import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

interface AppUser {
  id: string;
  name: string;
  email: string;
  user_type: string;
}

interface AppAuthState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenExpiry: number | null;
}

const initialState: AppAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tokenExpiry: null,
};

export const appLogoutThunk = createAsyncThunk('appAuth/logout', async (_, { dispatch }) => {
  localStorage.removeItem('app-root');
  dispatch(appLogout());
});

const appAuthSlice = createSlice({
  name: "appAuth",
  initialState,
  reducers: {
    setAppCredentials: (
      state,
      action: PayloadAction<{ user: AppUser; token: string; tokenExpiry?: number }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.tokenExpiry = action.payload.tokenExpiry || null;
    },
    appLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
      state.error = null;
    },
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAppError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAppTokenExpiry: (state, action: PayloadAction<number | null>) => {
      state.tokenExpiry = action.payload;
    },
  },
});

export const { setAppCredentials, appLogout, setAppLoading, setAppError, setAppTokenExpiry } =
  appAuthSlice.actions;
export default appAuthSlice.reducer;
