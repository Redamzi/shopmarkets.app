-- Categories and Tags Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT DEFAULT 'category', -- category, tag, collection
    source TEXT DEFAULT 'manual', -- manual, woocommerce, shopify, amazon
    external_id TEXT, -- ID in the external system
    parent_id UUID REFERENCES public.categories(id),
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug, type) -- Prevent duplicate slugs per user/type
);

-- Media Folders
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id),
    path TEXT NOT NULL, -- e.g. /products/shoes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Files
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.media_folders(id),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    is_active BOOLEAN DEFAULT true, -- false = inactive/unused
    source TEXT DEFAULT 'manual', -- manual, import, auto-generated
    external_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_source ON public.categories(user_id, source);
CREATE INDEX IF NOT EXISTS idx_media_user_folder ON public.media_files(user_id, folder_id);
