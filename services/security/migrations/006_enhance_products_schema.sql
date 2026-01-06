-- Enhanced Product Schema for Multi-Channel Imports

-- 1. Ensure master products table exists with core data
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sku TEXT, -- Master SKU
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    stock_quantity INTEGER DEFAULT 0,
    manage_stock BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'draft', -- draft, active, archived
    
    -- Hierarchies
    category_id UUID REFERENCES public.categories(id),
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, sku) -- SKU should be unique per user
);

-- 2. Product Sources (The Link between Master and Channels)
-- This allows one product to be connected to WooCommerce AND Amazon
CREATE TABLE IF NOT EXISTS public.product_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL, -- 'woocommerce', 'shopify', 'amazon', 'ebay'
    external_id TEXT NOT NULL, -- ID in the external system (e.g. '12345' or 'B00X...')
    external_link TEXT, -- Direct link to product in external store
    
    sync_status TEXT DEFAULT 'synced', -- synced, changed, error
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Channel specific overrides (if price is different on Amazon)
    price DECIMAL(10,2), 
    stock_quantity INTEGER,
    
    UNIQUE(product_id, channel_type),
    UNIQUE(channel_type, external_id) -- Prevent duplicate imports
);

-- 3. Product Media Link (Many-to-Many)
-- Products can have multiple images from the Media Library
CREATE TABLE IF NOT EXISTS public.product_media (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0, -- Sort order
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (product_id, media_id)
);

-- 4. Product Attributes (Color, Size etc.)
CREATE TABLE IF NOT EXISTS public.attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Color"
    slug TEXT NOT NULL, -- e.g. "color"
    type TEXT DEFAULT 'select', -- select, text, color_hex
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL, -- e.g. "Red"
    value_slug TEXT, -- e.g. "red"
    created_at TIMESTAMPTZ DEFAULT NOW()
);
