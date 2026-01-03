# ShopMarkets.app - Self-Hosted Production Deployment

## 🚀 Coolify Deployment mit Self-Hosted Supabase

Dieses Projekt ist für Production-Deployment mit Coolify und **self-hosted Supabase** konfiguriert.

---

## 📋 Deployment-Optionen

### Option 1: Separates Supabase (Empfohlen)
- Supabase läuft als eigene Application in Coolify
- Frontend verbindet sich via URL
- Einfacheres Scaling & Updates

### Option 2: Full-Stack Docker Compose
- Alles in einem Stack (Frontend + Supabase)
- Siehe `docker-compose.full-stack.yml`

---

## 🔧 Option 1: Separates Supabase in Coolify (Empfohlen)

### Schritt 1: Supabase in Coolify deployen

#### 1.1 Neue Application erstellen
```
Name: supabase-shopmarkets
Type: Docker Compose
```

#### 1.2 Docker Compose für Supabase
Erstelle in Coolify eine neue Resource mit diesem Docker Compose:

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    container_name: supabase-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

  supabase-studio:
    image: supabase/studio:20231123-64a766a
    container_name: supabase-studio
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      SUPABASE_URL: http://kong:8000
      SUPABASE_ANON_KEY: ${ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SERVICE_ROLE_KEY}

  kong:
    image: kong:2.8.1
    container_name: supabase-kong
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    volumes:
      - ./kong.yml:/var/lib/kong/kong.yml:ro

  auth:
    image: supabase/gotrue:v2.99.0
    container_name: supabase-auth
    restart: unless-stopped
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
    depends_on:
      - postgres

  rest:
    image: postgrest/postgrest:v11.2.0
    container_name: supabase-rest
    restart: unless-stopped
    environment:
      PGRST_DB_URI: postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"
    depends_on:
      - postgres

  realtime:
    image: supabase/realtime:v2.25.35
    container_name: supabase-realtime
    restart: unless-stopped
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: postgres
      DB_SSL: "false"
      PORT: 4000
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  storage:
    image: supabase/storage-api:v0.43.11
    container_name: supabase-storage
    restart: unless-stopped
    environment:
      ANON_KEY: ${ANON_KEY}
      SERVICE_KEY: ${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://rest:3000
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
    volumes:
      - storage-data:/var/lib/storage
    depends_on:
      - postgres
      - rest

volumes:
  postgres-data:
  storage-data:
```

#### 1.3 Environment Variables für Supabase
```bash
# Generiere sichere Secrets:
# openssl rand -base64 32

POSTGRES_PASSWORD=dein-sicheres-passwort
JWT_SECRET=dein-jwt-secret-mindestens-32-zeichen
ANON_KEY=dein-anon-key
SERVICE_ROLE_KEY=dein-service-role-key
SITE_URL=https://shopmarkets.app
ADDITIONAL_REDIRECT_URLS=https://shopmarkets.app
```

**JWT Keys generieren:**
```bash
# Installiere supabase CLI (optional)
npm install -g supabase

# Oder nutze Online-Generator:
# https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
```

#### 1.4 Kong Configuration (kong.yml)
Erstelle `kong.yml` in Coolify:

```yaml
_format_version: "2.1"

services:
  - name: auth-v1-open
    url: http://auth:9999/verify
    routes:
      - name: auth-v1-open
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors

  - name: auth-v1-open-callback
    url: http://auth:9999/callback
    routes:
      - name: auth-v1-open-callback
        strip_path: true
        paths:
          - /auth/v1/callback
    plugins:
      - name: cors

  - name: auth-v1-open-authorize
    url: http://auth:9999/authorize
    routes:
      - name: auth-v1-open-authorize
        strip_path: true
        paths:
          - /auth/v1/authorize
    plugins:
      - name: cors

  - name: auth-v1
    _comment: "GoTrue: /auth/v1/* -> http://auth:9999/*"
    url: http://auth:9999/
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false

  - name: rest-v1
    _comment: "PostgREST: /rest/v1/* -> http://rest:3000/*"
    url: http://rest:3000/
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true

  - name: realtime-v1
    _comment: "Realtime: /realtime/v1/* -> ws://realtime:4000/socket/*"
    url: http://realtime:4000/socket
    routes:
      - name: realtime-v1-all
        strip_path: true
        paths:
          - /realtime/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false

  - name: storage-v1
    _comment: "Storage: /storage/v1/* -> http://storage:5000/*"
    url: http://storage:5000/
    routes:
      - name: storage-v1-all
        strip_path: true
        paths:
          - /storage/v1/
    plugins:
      - name: cors

consumers:
  - username: anon
    keyauth_credentials:
      - key: ${ANON_KEY}
  - username: service_role
    keyauth_credentials:
      - key: ${SERVICE_ROLE_KEY}

plugins:
  - name: cors
    config:
      origins:
        - "*"
      methods:
        - GET
        - HEAD
        - PUT
        - PATCH
        - POST
        - DELETE
      headers:
        - Accept
        - Accept-Version
        - Content-Length
        - Content-MD5
        - Content-Type
        - Date
        - X-Auth-Token
      exposed_headers:
        - X-Auth-Token
      credentials: true
      max_age: 3600
```

#### 1.5 Domain für Supabase
```
Domain: supabase.shopmarkets.app
SSL: Let's Encrypt (automatisch)
```

#### 1.6 Database Schema einrichten
```bash
# Verbinde dich mit PostgreSQL
psql -h supabase.shopmarkets.app -p 5432 -U postgres

# Oder via Supabase Studio:
# https://supabase.shopmarkets.app:3001

# Führe schema.sql aus
\i supabase/schema.sql
```

---

### Schritt 2: Frontend in Coolify deployen

#### 2.1 Neue Application erstellen
```
Name: shopmarkets-app
Repository: https://github.com/Redamzi/shopmarkets.app
Branch: main
Build Pack: Dockerfile
```

#### 2.2 Build Configuration
```
Dockerfile Location: ./Dockerfile
Base Directory: /
Port: 80
```

#### 2.3 Build Arguments
```bash
VITE_SUPABASE_URL=https://supabase.shopmarkets.app:8000
VITE_SUPABASE_ANON_KEY=dein-anon-key
VITE_ENV=production
```

#### 2.4 Domain
```
Domain: shopmarkets.app
SSL: Let's Encrypt
```

#### 2.5 Deploy
Klicke auf **Deploy** - Fertig! 🎉

---

## � Option 2: Full-Stack Docker Compose

Für lokales Development oder Single-Server Deployment:

```bash
# Siehe docker-compose.full-stack.yml
docker-compose -f docker-compose.full-stack.yml up -d
```

---

## 🔐 Secrets generieren

### JWT Secret
```bash
openssl rand -base64 64
```

### Anon Key & Service Role Key
```bash
# Nutze Supabase JWT Generator:
# https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

# Oder installiere supabase CLI:
npm install -g supabase
supabase init
# Keys werden in .env generiert
```

---

## � Monitoring & Logs

### Supabase Studio
```
URL: https://supabase.shopmarkets.app:3001
```

### Database Logs
```bash
# In Coolify: Supabase App → Logs → postgres
```

### Frontend Logs
```bash
# In Coolify: ShopMarkets App → Logs
```

---

## 🔄 Updates

### Supabase Updates
```bash
# In Coolify: Supabase App → Redeploy
# Neue Image-Versionen werden automatisch gepullt
```

### Frontend Updates
```bash
# Auto-Deploy bei Git Push aktivieren
# Oder manuell: Coolify → ShopMarkets App → Redeploy
```

---

## 🐛 Troubleshooting

### "Failed to connect to database"
**Lösung**: 
1. Prüfe PostgreSQL Container läuft
2. Verifiziere `POSTGRES_PASSWORD` in beiden Services
3. Checke Network-Verbindung zwischen Containern

### "Invalid JWT"
**Lösung**:
1. Stelle sicher `JWT_SECRET` ist identisch in allen Services
2. Generiere neue Keys mit `openssl rand -base64 64`
3. Update `ANON_KEY` und `SERVICE_ROLE_KEY`

### Kong Gateway Fehler
**Lösung**:
1. Prüfe `kong.yml` ist korrekt gemountet
2. Verifiziere alle Services sind erreichbar
3. Checke Kong Logs in Coolify

---

## � Backup & Restore

### Database Backup
```bash
# Automatisches Backup in Coolify aktivieren
# Oder manuell:
docker exec supabase-db pg_dump -U postgres postgres > backup.sql
```

### Restore
```bash
docker exec -i supabase-db psql -U postgres postgres < backup.sql
```

---

## � Performance-Optimierungen

### PostgreSQL Tuning
```sql
-- In postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Connection Pooling
Supabase nutzt bereits PgBouncer intern.

---

## ✅ Production Checklist

- [ ] Supabase in Coolify deployed
- [ ] Sichere Secrets generiert
- [ ] Database Schema ausgeführt
- [ ] Kong Gateway konfiguriert
- [ ] Supabase Studio erreichbar
- [ ] Frontend deployed
- [ ] Build Arguments konfiguriert
- [ ] Domains & SSL konfiguriert
- [ ] Health Checks erfolgreich
- [ ] Backup-Strategie definiert
- [ ] Monitoring aktiviert

---

**Status**: ✅ Production Ready (Self-Hosted)

Für weitere Hilfe: [Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting)
