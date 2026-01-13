#!/bin/bash

echo "=========================================="
echo "📁 MEDIATHEK VERZEICHNIS-PRÜFUNG"
echo "=========================================="
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Prüfe lokale Upload-Verzeichnisse
echo "1️⃣  Lokale Upload-Verzeichnisse:"
echo "-------------------------------------------"

if [ -d "uploads" ]; then
    echo -e "${GREEN}✓${NC} uploads/ Verzeichnis existiert"
    echo "   Größe: $(du -sh uploads 2>/dev/null | cut -f1)"
    echo "   Dateien: $(find uploads -type f 2>/dev/null | wc -l | tr -d ' ')"
    echo ""
    echo "   Struktur:"
    tree -L 3 uploads 2>/dev/null || find uploads -type d | head -20
else
    echo -e "${RED}✗${NC} uploads/ Verzeichnis existiert NICHT"
fi

echo ""

# 2. Prüfe services/api/uploads
if [ -d "services/api/uploads" ]; then
    echo -e "${GREEN}✓${NC} services/api/uploads/ Verzeichnis existiert"
    echo "   Größe: $(du -sh services/api/uploads 2>/dev/null | cut -f1)"
    echo "   Dateien: $(find services/api/uploads -type f 2>/dev/null | wc -l | tr -d ' ')"
    echo ""
    echo "   Struktur:"
    tree -L 3 services/api/uploads 2>/dev/null || find services/api/uploads -type d | head -20
else
    echo -e "${RED}✗${NC} services/api/uploads/ Verzeichnis existiert NICHT"
fi

echo ""
echo ""

# 3. Prüfe CDN-Konfiguration
echo "2️⃣  CDN-Konfiguration:"
echo "-------------------------------------------"

if [ -f "services/cdn/nginx.conf" ]; then
    echo -e "${GREEN}✓${NC} CDN nginx.conf gefunden"
    echo "   Root-Verzeichnis:"
    grep "root" services/cdn/nginx.conf | head -1
else
    echo -e "${RED}✗${NC} CDN nginx.conf NICHT gefunden"
fi

echo ""
echo ""

# 4. Prüfe Environment-Variablen
echo "3️⃣  Environment-Variablen:"
echo "-------------------------------------------"

if [ -f ".env" ]; then
    if grep -q "UPLOAD_DIR" .env; then
        echo -e "${GREEN}✓${NC} UPLOAD_DIR in .env:"
        grep "UPLOAD_DIR" .env
    else
        echo -e "${YELLOW}⚠${NC}  UPLOAD_DIR NICHT in .env definiert"
    fi
    
    if grep -q "CDN_URL" .env; then
        echo -e "${GREEN}✓${NC} CDN_URL in .env:"
        grep "CDN_URL" .env
    else
        echo -e "${YELLOW}⚠${NC}  CDN_URL NICHT in .env definiert"
    fi
else
    echo -e "${RED}✗${NC} .env Datei existiert NICHT"
fi

echo ""
echo ""

# 5. Suche nach allen möglichen Upload-Verzeichnissen
echo "4️⃣  Alle Upload-Verzeichnisse im Projekt:"
echo "-------------------------------------------"
find . -type d -name "uploads" 2>/dev/null | while read dir; do
    echo -e "${GREEN}✓${NC} $dir"
    echo "   Dateien: $(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')"
done

echo ""
echo ""

# 6. Prüfe Docker Volumes
echo "5️⃣  Docker Volumes (falls Docker läuft):"
echo "-------------------------------------------"
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        docker volume ls | grep -E "(upload|media|cdn)" || echo "Keine Media/Upload Volumes gefunden"
    else
        echo -e "${YELLOW}⚠${NC}  Docker Daemon läuft nicht"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Docker ist nicht installiert"
fi

echo ""
echo ""

# 7. Suche nach Bild-Dateien im Projekt
echo "6️⃣  Bild-Dateien im Projekt:"
echo "-------------------------------------------"
echo "Suche nach .jpg, .jpeg, .png, .gif, .webp..."
total_images=$(find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
echo "Gefundene Bilder: $total_images"

if [ "$total_images" -gt 0 ]; then
    echo ""
    echo "Erste 10 Bilder:"
    find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -10
fi

echo ""
echo "=========================================="
echo "✅ PRÜFUNG ABGESCHLOSSEN"
echo "=========================================="
