-- Security Service Database Schema
-- Run this in your PostgreSQL database

-- Create schema for security service
CREATE SCHEMA IF NOT EXISTS security;

-- User Security Settings Table
CREATE TABLE IF NOT EXISTS security.user_security_settings (
    user_id UUID PRIMARY KEY,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    totp_secret VARCHAR(255),
    backup_codes JSONB DEFAULT '[]'::jsonb,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification Codes Table (for Email Login/Reset)
CREATE TABLE IF NOT EXISTS security.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted Devices Table (optional - for "Remember this device")
CREATE TABLE IF NOT EXISTS security.trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_fingerprint)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON security.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON security.verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON security.trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON security.trusted_devices(device_fingerprint);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION security.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_security_settings
CREATE TRIGGER update_user_security_settings_updated_at
    BEFORE UPDATE ON security.user_security_settings
    FOR EACH ROW
    EXECUTE FUNCTION security.update_updated_at_column();

-- Function to clean up expired verification codes (run via cron)
CREATE OR REPLACE FUNCTION security.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM security.verification_codes
    WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE security.user_security_settings IS '2FA settings and security configuration per user';
COMMENT ON TABLE security.verification_codes IS 'Temporary verification codes for email-based authentication';
COMMENT ON TABLE security.trusted_devices IS 'Devices that user has marked as trusted (skip 2FA)';
COMMENT ON COLUMN security.user_security_settings.totp_secret IS 'Encrypted TOTP secret for Google Authenticator';
COMMENT ON COLUMN security.user_security_settings.backup_codes IS 'Array of hashed backup codes for account recovery';
