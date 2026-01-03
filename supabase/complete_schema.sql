-- =====================================================
-- ShopMarkets Multi-Tenant System with Roles
-- Rollen: Admin, Partner, Seller
-- =====================================================

-- 1. Enum für User Rollen
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'seller');

-- 2. Enum für Partner Status
CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- 3. Enum für Subscription Plans
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- =====================================================
-- PROFILES TABLE (erweitert)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Rolle & Status
    role user_role DEFAULT 'seller' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    -- Subscription
    subscription_plan subscription_plan DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Partner Referral
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- =====================================================
-- PARTNER APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Application Details
    company_name TEXT,
    website TEXT,
    description TEXT,
    expected_referrals INTEGER,
    
    -- Status
    status partner_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_application UNIQUE(user_id)
);

CREATE INDEX idx_partner_applications_status ON public.partner_applications(status);
CREATE INDEX idx_partner_applications_user ON public.partner_applications(user_id);

-- =====================================================
-- PARTNER COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Commission Details
    amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Prozent
    transaction_type TEXT, -- 'subscription', 'credit_purchase', etc.
    
    -- Payment Status
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_amount CHECK (amount >= 0),
    CONSTRAINT valid_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

CREATE INDEX idx_partner_commissions_partner ON public.partner_commissions(partner_id);
CREATE INDEX idx_partner_commissions_referred_user ON public.partner_commissions(referred_user_id);
CREATE INDEX idx_partner_commissions_paid ON public.partner_commissions(is_paid);

-- =====================================================
-- ORGANIZATIONS TABLE (für Multi-Tenant)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Owner
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Subscription
    subscription_plan subscription_plan DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE INDEX idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- =====================================================
-- ORGANIZATION MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Role in Organization
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_org_member UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- =====================================================
-- CREDITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Credit Balance
    balance INTEGER DEFAULT 0 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_credits UNIQUE(user_id),
    CONSTRAINT non_negative_balance CHECK (balance >= 0)
);

CREATE INDEX idx_credits_user ON public.credits(user_id);

-- =====================================================
-- CREDIT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Transaction Details
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
    description TEXT,
    
    -- Balance After Transaction
    balance_after INTEGER NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX idx_credit_transactions_created ON public.credit_transactions(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Generate Referral Code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Create Profile on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        generate_referral_code()
    );
    
    -- Create Credits Account
    INSERT INTO public.credits (user_id, balance)
    VALUES (NEW.id, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function: Update Credits
CREATE OR REPLACE FUNCTION public.update_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update balance
    UPDATE public.credits
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (p_user_id, p_amount, p_type, p_description, v_new_balance);
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user is Admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user is Partner
CREATE OR REPLACE FUNCTION public.is_partner(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND role = 'partner'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (is_admin(auth.uid()));

-- Partner Applications Policies
CREATE POLICY "Users can view own applications"
    ON public.partner_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
    ON public.partner_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
    ON public.partner_applications FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all applications"
    ON public.partner_applications FOR UPDATE
    USING (is_admin(auth.uid()));

-- Partner Commissions Policies
CREATE POLICY "Partners can view own commissions"
    ON public.partner_commissions FOR SELECT
    USING (auth.uid() = partner_id);

CREATE POLICY "Admins can manage all commissions"
    ON public.partner_commissions FOR ALL
    USING (is_admin(auth.uid()));

-- Credits Policies
CREATE POLICY "Users can view own credits"
    ON public.credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits"
    ON public.credits FOR SELECT
    USING (is_admin(auth.uid()));

-- Credit Transactions Policies
CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
    ON public.credit_transactions FOR SELECT
    USING (is_admin(auth.uid()));

-- Organizations Policies
CREATE POLICY "Users can view own organizations"
    ON public.organizations FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create organizations"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own organizations"
    ON public.organizations FOR UPDATE
    USING (auth.uid() = owner_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create first admin user (update with your email)
-- INSERT INTO public.profiles (id, email, full_name, role, email_verified)
-- VALUES (
--     'YOUR_USER_ID_HERE',
--     'admin@shopmarkets.app',
--     'Admin User',
--     'admin',
--     true
-- ) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Partner Statistics
CREATE OR REPLACE VIEW public.partner_stats AS
SELECT
    p.id AS partner_id,
    p.full_name,
    p.email,
    COUNT(DISTINCT ref.id) AS total_referrals,
    COALESCE(SUM(pc.amount), 0) AS total_commissions,
    COALESCE(SUM(CASE WHEN pc.is_paid THEN pc.amount ELSE 0 END), 0) AS paid_commissions,
    COALESCE(SUM(CASE WHEN NOT pc.is_paid THEN pc.amount ELSE 0 END), 0) AS pending_commissions
FROM public.profiles p
LEFT JOIN public.profiles ref ON ref.referred_by = p.id
LEFT JOIN public.partner_commissions pc ON pc.partner_id = p.id
WHERE p.role = 'partner'
GROUP BY p.id, p.full_name, p.email;

COMMENT ON TABLE public.profiles IS 'User profiles with roles (admin, partner, seller)';
COMMENT ON TABLE public.partner_applications IS 'Partner program applications';
COMMENT ON TABLE public.partner_commissions IS 'Partner referral commissions';
COMMENT ON TABLE public.organizations IS 'Multi-tenant organizations';
COMMENT ON TABLE public.credits IS 'User credit balances';
COMMENT ON TABLE public.credit_transactions IS 'Credit transaction history';
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
-- =====================================================
-- Password Reset & Email Verification Enhancement
-- =====================================================

-- Table: Password Reset Tokens (zusätzlich zu Supabase Auth)
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Token
    token TEXT UNIQUE NOT NULL,
    
    -- Status
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    
    CONSTRAINT token_not_expired CHECK (expires_at > NOW() OR used = true)
);

CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON public.password_reset_tokens(expires_at);

-- Table: Email Verification Tokens
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    
    -- Token/Code
    code TEXT NOT NULL,
    
    -- Status
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Attempts
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    CONSTRAINT code_not_expired CHECK (expires_at > NOW() OR verified = true),
    CONSTRAINT attempts_within_limit CHECK (attempts <= max_attempts)
);

CREATE INDEX idx_email_verification_user ON public.email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_code ON public.email_verification_tokens(code);
CREATE INDEX idx_email_verification_expires ON public.email_verification_tokens(expires_at);

-- Table: Login Attempts (Security)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Attempt Details
    success BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Location (optional)
    country TEXT,
    city TEXT,
    
    -- Failure Reason
    failure_reason TEXT,
    
    -- Timestamp
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_user ON public.login_attempts(user_id);
CREATE INDEX idx_login_attempts_time ON public.login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);

-- Table: Sessions (zusätzlich zu Supabase Auth Sessions)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session Details
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    
    -- Device Info
    device_name TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    ip_address TEXT,
    user_agent TEXT,
    
    -- Location
    country TEXT,
    city TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    
    CONSTRAINT session_not_expired CHECK (expires_at > NOW() OR is_active = false)
);

CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Generate Password Reset Token
CREATE OR REPLACE FUNCTION public.create_password_reset_token(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
BEGIN
    -- Generate secure token
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert token
    INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
    VALUES (p_user_id, v_token, NOW() + INTERVAL '1 hour');
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify Password Reset Token
CREATE OR REPLACE FUNCTION public.verify_password_reset_token(p_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id
    FROM public.password_reset_tokens
    WHERE token = p_token
      AND used = false
      AND expires_at > NOW();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;
    
    -- Mark as used
    UPDATE public.password_reset_tokens
    SET used = true, used_at = NOW()
    WHERE token = p_token;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create Email Verification Code
CREATE OR REPLACE FUNCTION public.create_email_verification_code(
    p_user_id UUID,
    p_email TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- Generate 6-digit code
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Invalidate old codes
    UPDATE public.email_verification_tokens
    SET verified = true
    WHERE user_id = p_user_id AND verified = false;
    
    -- Insert new code
    INSERT INTO public.email_verification_tokens (user_id, email, code, expires_at)
    VALUES (p_user_id, p_email, v_code, NOW() + INTERVAL '10 minutes');
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify Email Code
CREATE OR REPLACE FUNCTION public.verify_email_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record
    FROM public.email_verification_tokens
    WHERE user_id = p_user_id
      AND code = p_code
      AND verified = false
      AND expires_at > NOW()
      AND attempts < max_attempts;
    
    IF v_record IS NULL THEN
        -- Increment attempts if code exists
        UPDATE public.email_verification_tokens
        SET attempts = attempts + 1
        WHERE user_id = p_user_id AND code = p_code AND verified = false;
        
        RETURN false;
    END IF;
    
    -- Mark as verified
    UPDATE public.email_verification_tokens
    SET verified = true, verified_at = NOW()
    WHERE id = v_record.id;
    
    -- Update profile
    UPDATE public.profiles
    SET email_verified = true
    WHERE id = p_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log Login Attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
    p_email TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user_id if exists
    SELECT id INTO v_user_id FROM public.profiles WHERE email = p_email;
    
    INSERT INTO public.login_attempts (
        email, user_id, success, ip_address, user_agent, failure_reason
    ) VALUES (
        p_email, v_user_id, p_success, p_ip_address, p_user_agent, p_failure_reason
    );
    
    -- Update last_login_at on success
    IF p_success AND v_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET last_login_at = NOW()
        WHERE id = v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if account is locked (too many failed attempts)
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_failed_count
    FROM public.login_attempts
    WHERE email = p_email
      AND success = false
      AND attempted_at > NOW() - INTERVAL '15 minutes';
    
    RETURN v_failed_count >= 5;
END;
$$ LANGUAGE plpgsql;

-- Function: Revoke Session
CREATE OR REPLACE FUNCTION public.revoke_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_sessions
    SET is_active = false, revoked_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cleanup Expired Tokens (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS VOID AS $$
BEGIN
    -- Delete expired password reset tokens
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    -- Delete expired email verification tokens
    DELETE FROM public.email_verification_tokens
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    -- Delete old login attempts (keep 30 days)
    DELETE FROM public.login_attempts
    WHERE attempted_at < NOW() - INTERVAL '30 days';
    
    -- Revoke expired sessions
    UPDATE public.user_sessions
    SET is_active = false, revoked_at = NOW()
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Password Reset Tokens Policies
CREATE POLICY "Users can view own reset tokens"
    ON public.password_reset_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Email Verification Tokens Policies
CREATE POLICY "Users can view own verification tokens"
    ON public.email_verification_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Login Attempts Policies
CREATE POLICY "Users can view own login attempts"
    ON public.login_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all login attempts"
    ON public.login_attempts FOR SELECT
    USING (is_admin(auth.uid()));

-- User Sessions Policies
CREATE POLICY "Users can view own sessions"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke own sessions"
    ON public.user_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
    ON public.user_sessions FOR SELECT
    USING (is_admin(auth.uid()));

-- =====================================================
-- VIEWS
-- =====================================================

-- View: User Security Overview
CREATE OR REPLACE VIEW public.user_security_overview AS
SELECT
    p.id AS user_id,
    p.email,
    p.email_verified,
    p.last_login_at,
    COUNT(DISTINCT us.id) FILTER (WHERE us.is_active) AS active_sessions,
    COUNT(DISTINCT la.id) FILTER (WHERE la.attempted_at > NOW() - INTERVAL '24 hours') AS login_attempts_24h,
    COUNT(DISTINCT la.id) FILTER (WHERE la.success = false AND la.attempted_at > NOW() - INTERVAL '15 minutes') AS failed_attempts_15m,
    is_account_locked(p.email) AS is_locked
FROM public.profiles p
LEFT JOIN public.user_sessions us ON us.user_id = p.id
LEFT JOIN public.login_attempts la ON la.user_id = p.id
GROUP BY p.id, p.email, p.email_verified, p.last_login_at;

COMMENT ON TABLE public.password_reset_tokens IS 'Password reset tokens with expiry';
COMMENT ON TABLE public.email_verification_tokens IS 'Email verification codes';
COMMENT ON TABLE public.login_attempts IS 'Login attempt history for security';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions across devices';
