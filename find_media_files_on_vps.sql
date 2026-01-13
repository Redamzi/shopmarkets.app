-- ============================================
-- Finde alle Media-Dateien in der Datenbank
-- ============================================

-- 1. Zeige alle Media-Dateien mit vollständigen Details
SELECT 
    id,
    user_id,
    folder_id,
    filename,
    url,
    mime_type,
    size_bytes,
    is_active,
    source,
    external_id,  -- WICHTIG: Hier ist der relative Pfad gespeichert!
    created_at,
    updated_at
FROM public.media_files
ORDER BY created_at DESC;

-- 2. Zeige alle Ordner
SELECT 
    id,
    user_id,
    name,
    parent_id,
    created_at
FROM public.media_folders
ORDER BY created_at DESC;

-- 3. Zeige Dateien gruppiert nach Ordner
SELECT 
    mf.name as folder_name,
    COUNT(mfi.id) as file_count,
    SUM(mfi.size_bytes) as total_size_bytes,
    ROUND(SUM(mfi.size_bytes)::numeric / 1024 / 1024, 2) as total_size_mb
FROM public.media_folders mf
LEFT JOIN public.media_files mfi ON mfi.folder_id = mf.id
GROUP BY mf.id, mf.name
ORDER BY file_count DESC;

-- 4. Zeige alle URLs (um zu sehen wo die Dateien sein sollten)
SELECT 
    url,
    external_id,
    filename,
    created_at
FROM public.media_files
ORDER BY created_at DESC;
