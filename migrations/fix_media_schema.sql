-- ============================================
-- Konsolidierte Media-Schema Migration
-- ============================================

-- 1. Erstelle media_folders Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Erstelle media_files Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    is_active BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Stelle sicher, dass folder_id existiert (falls Tabelle schon existierte)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'media_files' 
        AND column_name = 'folder_id'
    ) THEN
        ALTER TABLE public.media_files 
        ADD COLUMN folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Erstelle Indizes
CREATE INDEX IF NOT EXISTS idx_media_folders_user_id ON public.media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON public.media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_user_folder ON public.media_files(user_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_source ON public.categories(user_id, source);

-- 5. Zeige Ergebnis
SELECT 
    'media_folders' as table_name,
    COUNT(*) as row_count
FROM public.media_folders
UNION ALL
SELECT 
    'media_files' as table_name,
    COUNT(*) as row_count
FROM public.media_files;
