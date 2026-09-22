import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import stockReducer from "./slices/stockSlice";
import ledgerReducer from "./slices/ledgerSlice";
import accessGroupReducer from "./slices/accessGroupSlice";
import settingsReducer from "./slices/settingsSlice";
import userReducer from "./slices/userSlice";
import daybookReducer from "./slices/daybookSlice";
import pnlReducer from "./slices/pnlSlice";
import balanceSheetReducer from "./slices/balanceSheetSlice";
import dashboardReducer from "./slices/dashboardSlice";
import analyticsReducer from "./slices/analyticsSlice";

const localStoragePersistStorage = {
  getItem: (key: string) => {
    const value = localStorage.getItem(key);
    return Promise.resolve(value);
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: "admin-root",
  storage: localStoragePersistStorage,
  whitelist: ["auth", "settings"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  inventory: inventoryReducer,
  stock: stockReducer,
  ledger: ledgerReducer,
  accessGroup: accessGroupReducer,
  settings: settingsReducer,
  user: userReducer,
  daybook: daybookReducer,
  pnl: pnlReducer,
  balanceSheet: balanceSheetReducer,
  dashboard: dashboardReducer,
  analytics: analyticsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const adminStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const adminPersistor = persistStore(adminStore);
export type RootState = ReturnType<typeof adminStore.getState>;
export type AppDispatch = typeof adminStore.dispatch;


