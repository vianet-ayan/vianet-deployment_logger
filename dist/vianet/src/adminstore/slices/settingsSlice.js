import { createSlice } from "@reduxjs/toolkit";
const initialState = {
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
        setTest: (state, action) => {
            state.test = action.payload;
        },
        setSiteSettings: (state, action) => {
            state.site = { ...state.site, ...action.payload };
            state.error = null;
        },
        setNotificationSettings: (state, action) => {
            state.notifications = { ...state.notifications, ...action.payload };
            state.error = null;
        },
        setSecuritySettings: (state, action) => {
            state.security = { ...state.security, ...action.payload };
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
// 👇 Exported setTest here
export const { setTest, setSiteSettings, setNotificationSettings, setSecuritySettings, setLoading, setError, } = settingsSlice.actions;
export default settingsSlice.reducer;
