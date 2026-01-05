-- Create trusted_devices table
CREATE TABLE IF NOT EXISTS public.trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    last_used_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, device_fingerprint)
);

-- Index for faster lookups
CREATE INDEX idx_trusted_devices_user_fingerprint ON public.trusted_devices(user_id, device_fingerprint);
CREATE INDEX idx_trusted_devices_expires ON public.trusted_devices(expires_at);

-- Auto-cleanup expired devices (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_devices()
RETURNS void AS $$
BEGIN
    DELETE FROM public.trusted_devices 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$ LANGUAGE plpgsql;
