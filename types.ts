
export type Platform =
  | 'shopify'
  | 'woocommerce'
  | 'amazon'
  | 'ebay'
  | 'etsy'
  | 'prestashop'
  | 'oxid'
  | 'shopware'
  | 'magento'
  | 'fnac'
  | 'allegro'
  | 'bol'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'x';

export enum SyncStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
  SYNCING = 'syncing'
}

export enum ConnectionStatus {
  ACTIVE = 'active',
  ERROR = 'error',
  DISCONNECTED = 'disconnected'
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;
  channels: Platform[];
  channelPrices?: Record<string, number>; // Stores platform specific prices (e.g. { amazon: 29.99 })
  lastSync: string;
  // New fields for shipping and attributes
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  shippingProfile?: string;
  category?: string;
}

export interface Connection {
  id: string;
  platform: Platform;
  name: string;
  url: string;
  status: ConnectionStatus;
  lastSyncAt: string;
}

export interface SyncLog {
  id: string;
  productName: string;
  sku: string;
  source: Platform;
  target: Platform;
  status: SyncStatus;
  timestamp: string;
  message?: string;
}

export interface ChartData {
  name: string;
  syncs: number;
  errors: number;
}