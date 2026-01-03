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
