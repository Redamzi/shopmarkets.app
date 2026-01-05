-- AVV Logs Table: Stores all AVV signatures with full audit trail
CREATE TABLE IF NOT EXISTS public.avv_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    signature_data TEXT NOT NULL,  -- Base64-encoded PNG
    ip_address TEXT,
    contract_version TEXT DEFAULT '1.0',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_avv_logs_user_id ON public.avv_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_avv_logs_signed_at ON public.avv_logs(signed_at DESC);

-- Add is_avv_signed flag to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_avv_signed'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_avv_signed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Index for gatekeeper queries
CREATE INDEX IF NOT EXISTS idx_users_avv_signed ON public.users(is_avv_signed);
