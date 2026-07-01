import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SyncState {
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

const initialState: SyncState = {
  pendingCount: 0,
  isOnline: true,
  isSyncing: false,
  lastSync: null,
  error: null,
};

export const syncBatch = createAsyncThunk(
  'sync/batch',
  async (token: string) => {
    const res = await fetch('http://localhost:3001/sync/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  }
);

export const fetchSyncStatus = createAsyncThunk(
  'sync/status',
  async (token: string) => {
    const res = await fetch('http://localhost:3001/sync/status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch sync status');
    return res.json();
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    incrementPending: (state) => {
      state.pendingCount += 1;
    },
    decrementPending: (state) => {
      if (state.pendingCount > 0) state.pendingCount -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncBatch.pending, (state) => { state.isSyncing = true; })
      .addCase(syncBatch.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.pendingCount = Math.max(0, state.pendingCount - action.payload.synced);
        state.lastSync = new Date().toISOString();
      })
      .addCase(syncBatch.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message || 'Sync failed';
      })
      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.pendingCount = action.payload.pendingCount;
        state.lastSync = action.payload.lastSync;
      });
  },
});

export const { setOnline, incrementPending, decrementPending } = syncSlice.actions;
export default syncSlice;
