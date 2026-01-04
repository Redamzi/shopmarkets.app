#!/bin/bash

# ============================================
# 🔐 Supabase Secrets Generator
# ============================================
# Generiert alle benötigten Secrets für Supabase
# Autor: ShopMarkets Team
# Datum: 2026-01-04
# ============================================

set -e

echo "🔐 Generiere Supabase Secrets..."
echo ""

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. JWT Secret generieren
# ============================================
echo -e "${BLUE}📝 Generiere JWT Secret...${NC}"
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo -e "${GREEN}✅ JWT_SECRET generiert${NC}"

# ============================================
# 2. Postgres Password generieren
# ============================================
echo -e "${BLUE}📝 Generiere Postgres Password...${NC}"
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
echo -e "${GREEN}✅ POSTGRES_PASSWORD generiert${NC}"

# ============================================
# 3. MinIO Credentials generieren
# ============================================
echo -e "${BLUE}📝 Generiere MinIO Credentials...${NC}"
MINIO_ROOT_USER="supabase-storage-admin"
MINIO_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
echo -e "${GREEN}✅ MINIO Credentials generiert${NC}"

# ============================================
# 4. JWT Tokens generieren (ANON & SERVICE_ROLE)
# ============================================
echo -e "${BLUE}📝 Generiere JWT Tokens...${NC}"

# Funktion zum Generieren von JWT Tokens
generate_jwt() {
    local role=$1
    local secret=$2
    
    # Header
    header='{"alg":"HS256","typ":"JWT"}'
    
    # Payload
    iat=$(date +%s)
    exp=$((iat + 315360000)) # ~10 Jahre
    
    payload="{\"iss\":\"supabase\",\"ref\":\"shopmarkets\",\"role\":\"$role\",\"iat\":$iat,\"exp\":$exp}"
    
    # Base64 URL encode
    header_b64=$(echo -n "$header" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    payload_b64=$(echo -n "$payload" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    
    # Signatur erstellen
    signature=$(echo -n "${header_b64}.${payload_b64}" | openssl dgst -sha256 -hmac "$secret" -binary | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    
    # JWT zusammensetzen
    echo "${header_b64}.${payload_b64}.${signature}"
}

ANON_KEY=$(generate_jwt "anon" "$JWT_SECRET")
SERVICE_ROLE_KEY=$(generate_jwt "service_role" "$JWT_SECRET")

echo -e "${GREEN}✅ ANON_KEY generiert${NC}"
echo -e "${GREEN}✅ SERVICE_ROLE_KEY generiert${NC}"

# ============================================
# 5. SMTP Credentials (Optional - Beispielwerte)
# ============================================
echo -e "${YELLOW}⚠️  SMTP Credentials müssen manuell gesetzt werden${NC}"

# ============================================
# 6. Secrets in Datei schreiben
# ============================================
echo ""
echo -e "${BLUE}💾 Schreibe Secrets in Datei...${NC}"

OUTPUT_FILE="supabase-env-variables.md"

cat > "$OUTPUT_FILE" << EOF
# 🔐 Supabase Environment Variables
**Generiert am:** $(date '+%Y-%m-%d %H:%M:%S')

⚠️ **WICHTIG:** Diese Datei enthält sensitive Daten! Nicht in Git committen!

---

## 📋 Komplette ENV-Liste für Coolify

\`\`\`bash
# ============================================
# 🌐 GLOBAL SERVICE DOMAIN
# ============================================
SERVICE_FQDN_SUPABASE_KONG=supabase.shopmarkets.app

# ============================================
# 🔗 URLs (INTERN vs EXTERN - KRITISCH!)
# ============================================
PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
INTERNAL_SUPABASE_URL=http://supabase-kong:8000
API_EXTERNAL_URL=https://supabase.shopmarkets.app

# ============================================
# 🎨 STUDIO ENVIRONMENT (OHNE DAS CRASHT ALLES!)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}

SUPABASE_URL=https://supabase.shopmarkets.app
SUPABASE_PUBLIC_URL=https://supabase.shopmarkets.app
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# ============================================
# 🔐 JWT SECRETS (MÜSSEN ÜBERALL GLEICH SEIN!)
# ============================================
JWT_SECRET=${JWT_SECRET}
PGRST_JWT_SECRET=${JWT_SECRET}
GOTRUE_JWT_SECRET=${JWT_SECRET}

# ============================================
# 🗄️ POSTGRES DATABASE (EXTREM WICHTIG!)
# ============================================
POSTGRES_DB=postgres
POSTGRES_HOST=supabase-db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

PGPASSWORD=${POSTGRES_PASSWORD}

# Database Connection String
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres

# ============================================
# 🔍 SUPABASE META (FIXT SQL EDITOR!)
# ============================================
PG_META_DB_HOST=supabase-db
PG_META_DB_PORT=5432
PG_META_DB_NAME=postgres
PG_META_DB_USER=postgres
PG_META_DB_PASSWORD=${POSTGRES_PASSWORD}
PG_META_PORT=8080

# ============================================
# 📦 STORAGE / MINIO
# ============================================
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}

AWS_ACCESS_KEY_ID=${MINIO_ROOT_USER}
AWS_SECRET_ACCESS_KEY=${MINIO_ROOT_PASSWORD}

STORAGE_BACKEND=s3
STORAGE_S3_ENDPOINT=http://supabase-minio:9000
STORAGE_S3_BUCKET=supabase-storage

# ============================================
# 🔒 AUTH CONFIGURATION
# ============================================
GOTRUE_SITE_URL=https://shopmarkets.app
GOTRUE_URI_ALLOW_LIST=https://shopmarkets.app,https://supabase.shopmarkets.app
GOTRUE_DISABLE_SIGNUP=false
GOTRUE_EXTERNAL_EMAIL_ENABLED=true
GOTRUE_EXTERNAL_PHONE_ENABLED=false
GOTRUE_MAILER_AUTOCONFIRM=false

# SMTP Configuration (MANUELL ANPASSEN!)
GOTRUE_SMTP_HOST=smtp.gmail.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=your-email@gmail.com
GOTRUE_SMTP_PASS=your-app-password
GOTRUE_SMTP_ADMIN_EMAIL=admin@shopmarkets.app

# ============================================
# 🌊 REALTIME
# ============================================
REALTIME_DB_URL=postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres

# ============================================
# 🔧 POSTGREST (REST API)
# ============================================
PGRST_DB_URI=postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres
PGRST_DB_SCHEMA=public,storage,graphql_public
PGRST_DB_ANON_ROLE=anon
PGRST_DB_USE_LEGACY_GUCS=false

# ============================================
# 📊 ANALYTICS (Optional - bei Bedarf anpassen)
# ============================================
# LOGFLARE_API_KEY=your-logflare-api-key
# LOGFLARE_SOURCE_TOKEN=your-logflare-source-token

# ============================================
# ⚙️ SAFE DEFAULTS
# ============================================
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_PHONE_SIGNUP=false
FUNCTIONS_VERIFY_JWT=false
\`\`\`

---

## 🔑 Generierte Secrets (Backup)

### JWT Secret
\`\`\`
${JWT_SECRET}
\`\`\`

### ANON Key (JWT Token)
\`\`\`
${ANON_KEY}
\`\`\`

### SERVICE_ROLE Key (JWT Token)
\`\`\`
${SERVICE_ROLE_KEY}
\`\`\`

### Postgres Password
\`\`\`
${POSTGRES_PASSWORD}
\`\`\`

### MinIO Credentials
- **User:** \`${MINIO_ROOT_USER}\`
- **Password:** \`${MINIO_ROOT_PASSWORD}\`

---

## 🔁 Neustart-Reihenfolge in Coolify

**WICHTIG:** Services in exakt dieser Reihenfolge starten:

1. ✅ \`supabase-db\` (warten bis healthy)
2. ✅ \`supabase-kong\` (warten bis healthy)
3. ✅ \`supabase-auth\` (warten bis healthy)
4. ✅ \`supabase-rest\` (warten bis healthy)
5. ✅ \`supabase-meta\` (warten bis healthy) ← **KRITISCH!**
6. ✅ \`supabase-realtime\`
7. ✅ \`supabase-storage\`
8. ✅ \`supabase-studio\` (als letztes)

---

## ✅ Erwartetes Ergebnis

| Service | Status |
|---------|--------|
| \`supabase-db\` | ✅ running (healthy) |
| \`supabase-kong\` | ✅ running (healthy) |
| \`supabase-auth\` | ✅ running (healthy) |
| \`supabase-rest\` | ✅ running (healthy) |
| \`supabase-meta\` | ✅ running (healthy) |
| \`supabase-realtime\` | ✅ running (healthy) |
| \`supabase-storage\` | ✅ running (healthy) |
| \`supabase-studio\` | ✅ running (healthy) |

---

## 🧪 Test nach Deployment

1. **Öffne Studio:** https://supabase.shopmarkets.app
2. **Gehe zu SQL Editor**
3. **Führe aus:**
\`\`\`sql
CREATE TABLE public.final_test (
  id serial primary key,
  name text
);
\`\`\`
4. **Reload die Seite** → Tabelle muss noch da sein! ✅

---

## 📝 Wichtige Hinweise

### ⚠️ Coolify Volume Check
- **Container Path:** \`/var/lib/postgresql/data\`
- **Type:** Volume (nicht Bind Mount)

### ⚠️ SMTP Konfiguration
Die SMTP-Variablen müssen **manuell** angepasst werden:
- \`GOTRUE_SMTP_HOST\`
- \`GOTRUE_SMTP_PORT\`
- \`GOTRUE_SMTP_USER\`
- \`GOTRUE_SMTP_PASS\`
- \`GOTRUE_SMTP_ADMIN_EMAIL\`

### ⚠️ Security
- Diese Datei **NICHT** in Git committen!
- Secrets sicher in Coolify speichern
- Regelmäßig Secrets rotieren

---

**Generiert mit:** \`generate-secrets.sh\`
EOF

echo -e "${GREEN}✅ Secrets gespeichert in: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG:${NC}"
echo -e "   1. Öffne ${OUTPUT_FILE}"
echo -e "   2. Kopiere die ENV-Variablen in Coolify"
echo -e "   3. Passe SMTP-Credentials manuell an"
echo -e "   4. Starte Services in der angegebenen Reihenfolge"
echo ""
echo -e "${GREEN}🎉 Fertig!${NC}"
