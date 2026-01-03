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
