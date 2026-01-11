CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add folder_id column to media_files if it doesn't exist
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_media_folders_user_id ON public.media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON public.media_files(folder_id);
