export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    image_url?: string;
    sku?: string;
    stock: number;
    inventory_quantity?: number;
    created_at?: string;
    updated_at?: string;
    category?: string;      // Added based on usage
    channels?: Platform[];  // Added based on usage
    weight?: number;        // Added based on usage
    dimensions?: {          // Added based on usage
        length: number;
        width: number;
        height: number;
    };
    shippingProfile?: string; // Added based on usage
    lastSync?: string;      // Added based on usage
}

export type Platform = 'shopify' | 'woocommerce' | 'tiktok' | 'instagram' | 'facebook' | 'amazon' | 'ebay' | 'google_shopping' | 'pinterest' | 'etsy' | 'shopware' | 'magento' | 'prestashop' | 'oxid' | 'bol' | 'x' | string;
