import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  language: string;
  themeMode: ThemeMode;
  syncFrequency: number;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  language: 'en',
  themeMode: 'system',
  syncFrequency: 300000,
  notificationsEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setSyncFrequency: (state, action: PayloadAction<number>) => {
      state.syncFrequency = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
  },
});

export const { setLanguage, setThemeMode, setSyncFrequency, toggleNotifications } = settingsSlice.actions;
export default settingsSlice;
