-- =====================================================
-- ShopMarkets Product & Channel Management
-- =====================================================

-- Enum für Platforms/Channels
CREATE TYPE platform_type AS ENUM ('shopify', 'woocommerce', 'amazon', 'magento', 'ebay', 'etsy');

-- Enum für Product Status
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'draft', 'archived');

-- Enum für Sync Status
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'success', 'failed');

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Product Details
    sku TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    
    -- Inventory
    stock INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Media
    image_url TEXT,
    images JSONB DEFAULT '[]',
    
    -- Categorization
    category TEXT,
    tags TEXT[],
    
    -- Status
    status product_status DEFAULT 'active',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    
    CONSTRAINT unique_user_sku UNIQUE(user_id, sku),
    CONSTRAINT positive_price CHECK (price >= 0),
    CONSTRAINT positive_stock CHECK (stock >= 0)
);

CREATE INDEX idx_products_user ON public.products(user_id);
CREATE INDEX idx_products_org ON public.products(organization_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);

-- =====================================================
-- CHANNELS TABLE (Connected Platforms)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Channel Details
    platform platform_type NOT NULL,
    name TEXT NOT NULL,
    
    -- Connection
    is_connected BOOLEAN DEFAULT false,
    api_key TEXT,
    api_secret TEXT,
    shop_url TEXT,
    
    -- Settings
    auto_sync BOOLEAN DEFAULT false,
    sync_interval INTEGER DEFAULT 60, -- minutes
    
    -- Status
    last_sync_at TIMESTAMPTZ,
    last_sync_status sync_status,
    last_sync_error TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_platform UNIQUE(user_id, platform, shop_url)
);

CREATE INDEX idx_channels_user ON public.channels(user_id);
CREATE INDEX idx_channels_org ON public.channels(organization_id);
CREATE INDEX idx_channels_platform ON public.channels(platform);
CREATE INDEX idx_channels_connected ON public.channels(is_connected);

-- =====================================================
-- PRODUCT CHANNELS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    
    -- Channel-specific data
    external_id TEXT, -- ID on the platform
    external_url TEXT,
    
    -- Sync Status
    sync_status sync_status DEFAULT 'pending',
    last_synced_at TIMESTAMPTZ,
    sync_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_product_channel UNIQUE(product_id, channel_id)
);

CREATE INDEX idx_product_channels_product ON public.product_channels(product_id);
CREATE INDEX idx_product_channels_channel ON public.product_channels(channel_id);
CREATE INDEX idx_product_channels_status ON public.product_channels(sync_status);

-- =====================================================
-- SYNC LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Sync Details
    action TEXT NOT NULL, -- 'import', 'export', 'update', 'delete'
    status sync_status NOT NULL,
    
    -- Results
    items_processed INTEGER DEFAULT 0,
    items_success INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    
    -- Error Details
    error_message TEXT,
    error_details JSONB,
    
    -- Duration
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sync_logs_user ON public.sync_logs(user_id);
CREATE INDEX idx_sync_logs_channel ON public.sync_logs(channel_id);
CREATE INDEX idx_sync_logs_product ON public.sync_logs(product_id);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX idx_sync_logs_started ON public.sync_logs(started_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON public.channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_channels_updated_at
    BEFORE UPDATE ON public.product_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Get user's product count
CREATE OR REPLACE FUNCTION get_user_product_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.products WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's connected channels count
CREATE OR REPLACE FUNCTION get_user_channels_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.channels WHERE user_id = p_user_id AND is_connected = true);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Users can view own products"
    ON public.products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
    ON public.products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
    ON public.products FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
    ON public.products FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (is_admin(auth.uid()));

-- Channels Policies
CREATE POLICY "Users can view own channels"
    ON public.channels FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own channels"
    ON public.channels FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
    ON public.channels FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
    ON public.channels FOR DELETE
    USING (auth.uid() = user_id);

-- Product Channels Policies
CREATE POLICY "Users can view own product channels"
    ON public.product_channels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_channels.product_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own product channels"
    ON public.product_channels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_channels.product_id
            AND user_id = auth.uid()
        )
    );

-- Sync Logs Policies
CREATE POLICY "Users can view own sync logs"
    ON public.sync_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync logs"
    ON public.sync_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sync logs"
    ON public.sync_logs FOR SELECT
    USING (is_admin(auth.uid()));

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Product Statistics per User
CREATE OR REPLACE VIEW public.user_product_stats AS
SELECT
    p.id AS user_id,
    p.email,
    COUNT(DISTINCT pr.id) AS total_products,
    COUNT(DISTINCT CASE WHEN pr.status = 'active' THEN pr.id END) AS active_products,
    COUNT(DISTINCT c.id) AS connected_channels,
    COUNT(DISTINCT pc.id) AS synced_products,
    MAX(pr.last_synced_at) AS last_sync
FROM public.profiles p
LEFT JOIN public.products pr ON pr.user_id = p.id
LEFT JOIN public.channels c ON c.user_id = p.id AND c.is_connected = true
LEFT JOIN public.product_channels pc ON pc.product_id = pr.id
GROUP BY p.id, p.email;

-- View: Recent Sync Activity
CREATE OR REPLACE VIEW public.recent_sync_activity AS
SELECT
    sl.id,
    sl.user_id,
    p.email AS user_email,
    c.platform,
    c.name AS channel_name,
    sl.action,
    sl.status,
    sl.items_processed,
    sl.items_success,
    sl.items_failed,
    sl.started_at,
    sl.completed_at,
    EXTRACT(EPOCH FROM (sl.completed_at - sl.started_at)) AS duration_seconds
FROM public.sync_logs sl
JOIN public.profiles p ON p.id = sl.user_id
LEFT JOIN public.channels c ON c.id = sl.channel_id
ORDER BY sl.started_at DESC
LIMIT 100;

COMMENT ON TABLE public.products IS 'Product catalog for all users';
COMMENT ON TABLE public.channels IS 'Connected e-commerce platforms';
COMMENT ON TABLE public.product_channels IS 'Product-to-channel mappings';
COMMENT ON TABLE public.sync_logs IS 'Synchronization history and logs';
