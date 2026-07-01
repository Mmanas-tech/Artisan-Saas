import { configureStore } from '@reduxjs/toolkit';
import { inventorySlice } from './inventorySlice';
import { syncSlice } from './syncSlice';
import { authSlice } from './authSlice';
import { settingsSlice } from './settingsSlice';

export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
    sync: syncSlice.reducer,
    auth: authSlice.reducer,
    settings: settingsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
