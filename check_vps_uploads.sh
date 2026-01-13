#!/bin/bash

# ============================================
# 🔍 VPS UPLOAD-VERZEICHNIS PRÜFUNG
# ============================================
# Sucht nach den physischen Dateien auf dem VPS
# ============================================

echo "=========================================="
echo "🔍 VPS UPLOAD-VERZEICHNIS PRÜFUNG"
echo "=========================================="
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}HINWEIS:${NC} Dieses Skript muss auf dem VPS ausgeführt werden!"
echo ""
echo "Mögliche Upload-Verzeichnisse auf dem VPS:"
echo ""

# Liste möglicher Verzeichnisse
POSSIBLE_DIRS=(
    "/app/uploads"
    "/var/lib/docker/volumes/*/uploads"
    "/data/uploads"
    "/usr/share/nginx/html/uploads"
    "/opt/shopmarkets/uploads"
    "/home/*/shopmarkets*/uploads"
)

echo "Suche in folgenden Verzeichnissen:"
for dir in "${POSSIBLE_DIRS[@]}"; do
    echo "  - $dir"
done

echo ""
echo "=========================================="
echo "📋 BEFEHLE FÜR VPS:"
echo "=========================================="
echo ""
echo "1. Suche nach allen Upload-Verzeichnissen:"
echo -e "${BLUE}sudo find / -type d -name 'uploads' 2>/dev/null${NC}"
echo ""
echo "2. Suche nach Bild-Dateien:"
echo -e "${BLUE}sudo find / -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.jpeg' -o -name '*.gif' -o -name '*.webp' \) ! -path '*/node_modules/*' 2>/dev/null | head -20${NC}"
echo ""
echo "3. Prüfe Docker Volumes:"
echo -e "${BLUE}docker volume ls${NC}"
echo -e "${BLUE}docker volume inspect <volume_name>${NC}"
echo ""
echo "4. Prüfe laufende Container und deren Mounts:"
echo -e "${BLUE}docker ps${NC}"
echo -e "${BLUE}docker inspect <container_name> | grep -A 10 Mounts${NC}"
echo ""
echo "5. Prüfe Coolify Volumes (falls verwendet):"
echo -e "${BLUE}ls -la /data/coolify/applications/*/persistent-storage/${NC}"
echo ""
echo "=========================================="
echo "💡 NÄCHSTE SCHRITTE:"
echo "=========================================="
echo ""
echo "1. Verbinde dich mit dem VPS:"
echo -e "   ${BLUE}ssh root@<VPS_IP>${NC}"
echo ""
echo "2. Führe die obigen Befehle aus"
echo ""
echo "3. Teile mir die Ergebnisse mit, damit ich:"
echo "   - Die Dateien lokalisieren kann"
echo "   - Die Upload-Verzeichnisse korrekt konfigurieren kann"
echo "   - Die CDN-Route reparieren kann"
echo ""
