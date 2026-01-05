export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    image_url?: string;
    sku?: string;
    inventory_quantity?: number;
    created_at?: string;
    updated_at?: string;
}
