export type CraftType = 'ceramic' | 'textile' | 'wood' | 'metal' | 'other';

export type Unit = 'kg' | 'pieces' | 'liters' | 'meters' | 'grams';

export type TransactionType = 'add' | 'remove' | 'sale' | 'reorder' | 'transfer';

export type SyncStatus = 'pending' | 'synced' | 'conflict';

export type LoanStatus = 'pending' | 'active' | 'repaid' | 'defaulted';

export type ListingStatus = 'active' | 'sold' | 'expired';

export interface User {
  id: string;
  name: string;
  phone: string;
  craft: CraftType;
  location: {
    lat: number;
    lng: number;
    district: string;
    state: string;
  };
  coopId?: string;
  kyc: {
    verified: boolean;
    aadharHash?: string;
  };
  createdAt: string;
  ledgerProof?: string;
}

export interface InventoryItem {
  id: string;
  artisanId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: Unit;
  reorderLevel: number;
  price: number;
  lastUpdated: string;
  syncedToBlockchain: boolean;
  syncStatus: SyncStatus;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromArtisanId: string;
  toArtisanId?: string;
  inventoryId: string;
  quantity: number;
  amount?: number;
  timestamp: string;
  voiceCommand?: string;
  blockchainHash?: string;
  status: SyncStatus;
}

export interface Coop {
  id: string;
  name: string;
  members: string[];
  inventory: string[];
  rules: {
    revenueShare: 'proportional' | 'equal' | 'custom';
    votingThreshold?: number;
  };
  createdAt: string;
  leaderDID: string;
}

export interface MarketplaceListing {
  id: string;
  artisanId: string;
  inventoryId: string;
  quantity: number;
  price: number;
  status: ListingStatus;
  buyers: Array<{
    buyerId: string;
    quantity: number;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  createdAt: string;
  expiresAt: string;
}

export interface MicroLoan {
  id: string;
  borrowerId: string;
  lenderId: string;
  principal: number;
  interestRate: number;
  term: number;
  collateral: 'inventory' | 'reputation';
  status: LoanStatus;
  blockchainProof?: string;
  createdAt: string;
  repaymentSchedule: Array<{
    dueDate: string;
    amount: number;
    paid: boolean;
  }>;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'inventory' | 'transaction' | 'listing' | 'coop';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

export interface VoiceCommand {
  transcript: string;
  intent: {
    action: TransactionType | 'check' | 'list';
    quantity?: number;
    unit?: Unit;
    item?: string;
    amount?: number;
  };
  confidence: number;
  language: string;
}
