#!/bin/bash

# ShopMarkets Database Migration Script
# Führt SQL-Migrationen automatisch aus ohne jedes Mal nach Credentials zu fragen

# Datenbank-Verbindungsdaten
DB_HOST="91.99.53.147"
DB_PORT="5433"
DB_NAME="postgres"
DB_USER="postgres"

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 ShopMarkets Database Migration${NC}"
echo "=================================="

# Prüfe ob Passwort in .env existiert
if [ -f ".env.db" ]; then
    source .env.db
    echo -e "${GREEN}✓${NC} .env.db gefunden"
else
    echo -e "${YELLOW}⚠${NC}  .env.db nicht gefunden"
    echo ""
    echo "Erstelle .env.db Datei..."
    echo "Bitte geben Sie das Datenbank-Passwort ein:"
    read -s DB_PASSWORD
    echo "PGPASSWORD=$DB_PASSWORD" > .env.db
    chmod 600 .env.db
    echo -e "${GREEN}✓${NC} .env.db erstellt und gesichert"
    source .env.db
fi

# Prüfe ob Migration-Datei angegeben wurde
if [ -z "$1" ]; then
    echo ""
    echo -e "${RED}✗${NC} Keine Migration-Datei angegeben!"
    echo ""
    echo "Verwendung:"
    echo "  ./run-migration.sh services/security/migrations/003_add_trusted_devices.sql"
    echo ""
    echo "Verfügbare Migrationen:"
    ls -1 services/security/migrations/*.sql 2>/dev/null || echo "  Keine gefunden"
    exit 1
fi

MIGRATION_FILE=$1

# Prüfe ob Datei existiert
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}✗${NC} Datei nicht gefunden: $MIGRATION_FILE"
    exit 1
fi

echo ""
echo -e "${YELLOW}📄 Migration:${NC} $MIGRATION_FILE"
echo -e "${YELLOW}🗄  Datenbank:${NC} $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Bestätigung
read -p "Migration ausführen? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠${NC}  Migration abgebrochen"
    exit 0
fi

# Migration ausführen
echo ""
echo -e "${YELLOW}🚀 Führe Migration aus...${NC}"
echo ""

export PGPASSWORD=$DB_PASSWORD

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Migration erfolgreich ausgeführt!${NC}"
    
    # Log erstellen
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $MIGRATION_FILE" >> .migration-log
    
    exit 0
else
    echo ""
    echo -e "${RED}✗ Migration fehlgeschlagen!${NC}"
    exit 1
fi
