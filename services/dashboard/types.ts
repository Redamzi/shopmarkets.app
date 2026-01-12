export interface Product {
    id: string;
    title: string;
    description?: string;
    short_description?: string;
    price: number;
    compare_at_price?: number;
    cost_per_item?: number;
    currency: string;
    image_url?: string;
    images?: string[];
    sku?: string;
    barcode?: string;
    stock: number;
    inventory_quantity?: number;
    product_type?: string;
    created_at?: string;
    updated_at?: string;
    category?: string;
    channels?: Platform[];
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    shippingProfile?: string;
    lastSync?: string;
}

export type Platform = 'shopify' | 'woocommerce' | 'tiktok' | 'instagram' | 'facebook' | 'amazon' | 'ebay' | 'google_shopping' | 'pinterest' | 'etsy' | 'shopware' | 'magento' | 'prestashop' | 'oxid' | 'bol' | 'x' | string;
