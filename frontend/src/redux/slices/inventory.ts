import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllInventory,
  insertInventory,
  updateInventory,
  deleteInventory,
  getPendingSyncCount,
  markSynced,
  type InventoryItem,
} from '../../database/sqlite';

interface InventoryState {
  items: InventoryItem[];
  pendingSync: number;
  isOnline: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  pendingSync: 0,
  isOnline: true,
  loading: false,
  error: null,
};

const ARTISAN_ID = 'did:artisan:local-user';

export const loadInventory = createAsyncThunk(
  'inventory/loadAll',
  async () => {
    const items = await getAllInventory(ARTISAN_ID);
    const pendingSync = await getPendingSyncCount();
    return { items, pendingSync };
  }
);

export const addItem = createAsyncThunk(
  'inventory/add',
  async (item: { name: string; sku: string; quantity: number; unit: string; reorderLevel: number; price: number }) => {
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const inserted = await insertInventory({
      id,
      artisan_id: ARTISAN_ID,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorderLevel,
      price: item.price,
    });
    const pendingSync = await getPendingSyncCount();
    return { item: inserted, pendingSync };
  }
);

export const updateItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
    const updated = await updateInventory(id, data);
    const pendingSync = await getPendingSyncCount();
    return { item: updated, pendingSync };
  }
);

export const removeItem = createAsyncThunk(
  'inventory/remove',
  async (id: string) => {
    await deleteInventory(id);
    const pendingSync = await getPendingSyncCount();
    return { id, pendingSync };
  }
);

export const syncItems = createAsyncThunk(
  'inventory/sync',
  async () => {
    const pending = await getAllInventory(ARTISAN_ID);
    const pendingIds = pending
      .filter(i => i.sync_status === 'pending')
      .map(i => i.id);

    if (pendingIds.length > 0) {
      await markSynced(pendingIds);
    }

    const pendingSync = await getPendingSyncCount();
    return { synced: pendingIds.length, pendingSync };
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pendingSync = action.payload.pendingSync;
      })
      .addCase(loadInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load inventory';
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload.item);
        state.pendingSync = action.payload.pendingSync;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        if (action.payload.item) {
          const idx = state.items.findIndex(i => i.id === action.payload.item!.id);
          if (idx !== -1) state.items[idx] = action.payload.item!;
        }
        state.pendingSync = action.payload.pendingSync;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload.id);
        state.pendingSync = action.payload.pendingSync;
      })
      .addCase(syncItems.fulfilled, (state, action) => {
        state.items.forEach(item => {
          if (item.sync_status === 'pending') {
            item.sync_status = 'synced';
          }
        });
        state.pendingSync = action.payload.pendingSync;
      });
  },
});

export const { setOnline, clearError } = inventorySlice.actions;
export default inventorySlice;
