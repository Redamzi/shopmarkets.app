-- Force clean schema on startup
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    name TEXT,
    api_key TEXT,
    url TEXT,
    shop_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
