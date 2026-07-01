import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { InventoryItem } from '@artisan/shared';

interface InventoryState {
  items: InventoryItem[];
  totalValue: number;
  lowStockCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  totalValue: 0,
  lowStockCount: 0,
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async (token: string) => {
    const res = await fetch('http://localhost:3001/inventory', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/add',
  async ({ token, item }: { token: string; item: Partial<InventoryItem> }) => {
    const res = await fetch('http://localhost:3001/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ token, id, data }: { token: string; id: string; data: Partial<InventoryItem> }) => {
    const res = await fetch(`http://localhost:3001/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/delete',
  async ({ token, id }: { token: string; id: string }) => {
    const res = await fetch(`http://localhost:3001/inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return id;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    addItemLocal: (state, action: PayloadAction<InventoryItem>) => {
      state.items.unshift(action.payload);
    },
    updateItemLocal: (state, action: PayloadAction<{ id: string; changes: Partial<InventoryItem> }>) => {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload.changes };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalValue = action.payload.totalValue;
        state.lowStockCount = action.payload.lowStockCount;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearError, addItemLocal, updateItemLocal } = inventorySlice.actions;
export default inventorySlice;
