#!/bin/bash

# ============================================
# 🔧 MEDIATHEK REPARATUR-SKRIPT
# ============================================
# Automatische Reparatur der Mediathek-Infrastruktur
# Datum: 2026-01-13
# ============================================

set -e  # Exit on error

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "🔧 MEDIATHEK REPARATUR"
echo -e "==========================================${NC}"
echo ""

# ============================================
# 1. VERZEICHNISSE ERSTELLEN
# ============================================
echo -e "${YELLOW}1️⃣  Erstelle Upload-Verzeichnisse...${NC}"

if [ ! -d "uploads" ]; then
    mkdir -p uploads
    chmod 755 uploads
    echo -e "${GREEN}✓${NC} uploads/ erstellt"
else
    echo -e "${GREEN}✓${NC} uploads/ existiert bereits"
fi

if [ ! -d "services/api/uploads" ]; then
    mkdir -p services/api/uploads
    chmod 755 services/api/uploads
    echo -e "${GREEN}✓${NC} services/api/uploads/ erstellt"
else
    echo -e "${GREEN}✓${NC} services/api/uploads/ existiert bereits"
fi

echo ""

# ============================================
# 2. ENVIRONMENT-VARIABLEN KONFIGURIEREN
# ============================================
echo -e "${YELLOW}2️⃣  Konfiguriere Environment-Variablen...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}✗${NC} .env Datei existiert nicht!"
    echo "   Erstelle .env aus .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env erstellt"
fi

# Prüfe ob UPLOAD_DIR bereits existiert
if grep -q "UPLOAD_DIR" .env; then
    echo -e "${GREEN}✓${NC} UPLOAD_DIR bereits in .env vorhanden"
else
    echo "" >> .env
    echo "# Media Upload Configuration" >> .env
    echo "UPLOAD_DIR=uploads" >> .env
    echo -e "${GREEN}✓${NC} UPLOAD_DIR zu .env hinzugefügt"
fi

# Prüfe ob CDN_URL bereits existiert
if grep -q "CDN_URL" .env; then
    echo -e "${GREEN}✓${NC} CDN_URL bereits in .env vorhanden"
else
    echo "CDN_URL=https://cdn.shopmarkets.app" >> .env
    echo -e "${GREEN}✓${NC} CDN_URL zu .env hinzugefügt"
fi

echo ""

# ============================================
# 3. SQL-MIGRATION VORBEREITEN
# ============================================
echo -e "${YELLOW}3️⃣  Bereite SQL-Migrationen vor...${NC}"

# Erstelle konsolidierte Migration
cat > migrations/fix_media_schema.sql << 'EOF'
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
EOF

echo -e "${GREEN}✓${NC} migrations/fix_media_schema.sql erstellt"

echo ""

# ============================================
# 4. DOCKER COMPOSE FÜR CDN ERSTELLEN
# ============================================
echo -e "${YELLOW}4️⃣  Erstelle Docker Compose für CDN...${NC}"

cat > docker-compose.cdn.yml << 'EOF'
version: '3.8'

services:
  cdn:
    build:
      context: ./services/cdn
      dockerfile: Dockerfile
    container_name: shopmarkets-cdn
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      # Persistentes Volume für Uploads (read-only für CDN)
      - ./uploads:/usr/share/nginx/html/uploads:ro
    environment:
      - NGINX_HOST=cdn.shopmarkets.app
      - NGINX_PORT=80
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s

networks:
  default:
    name: shopmarkets-network
    external: true
EOF

echo -e "${GREEN}✓${NC} docker-compose.cdn.yml erstellt"

echo ""

# ============================================
# 5. GITIGNORE AKTUALISIEREN
# ============================================
echo -e "${YELLOW}5️⃣  Aktualisiere .gitignore...${NC}"

if ! grep -q "uploads/" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Media Uploads (nicht in Git committen)" >> .gitignore
    echo "uploads/" >> .gitignore
    echo "services/api/uploads/" >> .gitignore
    echo -e "${GREEN}✓${NC} uploads/ zu .gitignore hinzugefügt"
else
    echo -e "${GREEN}✓${NC} uploads/ bereits in .gitignore"
fi

echo ""

# ============================================
# 6. ZUSAMMENFASSUNG
# ============================================
echo -e "${BLUE}=========================================="
echo "✅ REPARATUR ABGESCHLOSSEN"
echo -e "==========================================${NC}"
echo ""
echo -e "${GREEN}Folgende Änderungen wurden vorgenommen:${NC}"
echo ""
echo "1. ✓ Upload-Verzeichnisse erstellt:"
echo "   - uploads/"
echo "   - services/api/uploads/"
echo ""
echo "2. ✓ Environment-Variablen konfiguriert:"
echo "   - UPLOAD_DIR=uploads"
echo "   - CDN_URL=https://cdn.shopmarkets.app"
echo ""
echo "3. ✓ SQL-Migration vorbereitet:"
echo "   - migrations/fix_media_schema.sql"
echo ""
echo "4. ✓ Docker Compose für CDN erstellt:"
echo "   - docker-compose.cdn.yml"
echo ""
echo "5. ✓ .gitignore aktualisiert"
echo ""
echo -e "${YELLOW}=========================================="
echo "📋 NÄCHSTE SCHRITTE"
echo -e "==========================================${NC}"
echo ""
echo "1. Führe SQL-Migration aus:"
echo -e "   ${BLUE}PGPASSWORD=Testzugang10?20?30edzep123 psql -h localhost -U postgres -d postgres -f migrations/fix_media_schema.sql${NC}"
echo ""
echo "2. Starte CDN-Service (optional):"
echo -e "   ${BLUE}docker-compose -f docker-compose.cdn.yml up -d${NC}"
echo ""
echo "3. Prüfe Datenbank:"
echo -e "   ${BLUE}PGPASSWORD=Testzugang10?20?30edzep123 psql -h localhost -U postgres -d postgres -f check_media_db.sql${NC}"
echo ""
echo "4. Teste Upload:"
echo "   - Starte API-Service"
echo "   - Öffne Mediathek im Frontend"
echo "   - Lade Testbild hoch"
echo ""
echo -e "${GREEN}🎉 Mediathek-Infrastruktur ist bereit!${NC}"
echo ""
