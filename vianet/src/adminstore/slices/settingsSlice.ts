import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SiteSettings {
  siteName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
}

interface SettingsState {
  site: SiteSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  loading: boolean;
  error: string | null;
  test?: string;
}

const initialState: SettingsState = {
  site: {
    siteName: "",
    logo: "",
    favicon: "",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
  },
  loading: false,
  error: null,
  test: 'lorem ipsum dolor sit amet',
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // 👇 New simple test action
    setTest: (state, action: PayloadAction<string>) => {
      state.test = action.payload;
    },
    setSiteSettings: (state, action: PayloadAction<Partial<SiteSettings>>) => {
      state.site = { ...state.site, ...action.payload };
      state.error = null;
    },
    setNotificationSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
      state.error = null;
    },
    setSecuritySettings: (
      state,
      action: PayloadAction<Partial<SecuritySettings>>
    ) => {
      state.security = { ...state.security, ...action.payload };
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// 👇 Exported setTest here
export const {
  setTest,
  setSiteSettings,
  setNotificationSettings,
  setSecuritySettings,
  setLoading,
  setError,
} = settingsSlice.actions;

export default settingsSlice.reducer;