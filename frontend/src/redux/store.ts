import { configureStore } from '@reduxjs/toolkit';
import inventorySlice from './slices/inventory';

export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
