-- Prüfung der Mediathek-Datenbank-Struktur und Daten

-- 1. Prüfe ob media_files Tabelle existiert
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'media_files'
) AS media_files_exists;

-- 2. Prüfe ob media_folders Tabelle existiert
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'media_folders'
) AS media_folders_exists;

-- 3. Zeige Struktur der media_files Tabelle
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'media_files'
ORDER BY ordinal_position;

-- 4. Zeige Struktur der media_folders Tabelle
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'media_folders'
ORDER BY ordinal_position;

-- 5. Zähle alle Media Files
SELECT COUNT(*) AS total_media_files FROM public.media_files;

-- 6. Zähle alle Media Folders
SELECT COUNT(*) AS total_media_folders FROM public.media_folders;

-- 7. Zeige alle Media Files mit Details
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
    external_id,
    created_at
FROM public.media_files
ORDER BY created_at DESC
LIMIT 50;

-- 8. Zeige alle Media Folders
SELECT 
    id,
    user_id,
    name,
    parent_id,
    path,
    created_at
FROM public.media_folders
ORDER BY created_at DESC;

-- 9. Prüfe Indizes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('media_files', 'media_folders')
ORDER BY tablename, indexname;

-- 10. Prüfe Foreign Keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('media_files', 'media_folders');
