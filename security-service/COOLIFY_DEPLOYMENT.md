# 🚀 Coolify Deployment Guide - Security Service

Schritt-für-Schritt-Anleitung zum Deployment des Security Service in Coolify.

## 📋 Voraussetzungen

- ✅ Coolify installiert und läuft
- ✅ GitHub Repository verbunden
- ✅ PostgreSQL läuft (Supabase oder separate Instanz)
- ✅ Mailgun Account mit verifizierter Domain

---

## 🔧 Option 1: Separater Security Service (Empfohlen)

### Schritt 1: Neue Application erstellen

1. **Coolify Dashboard öffnen**
2. **"New Resource"** → **"Application"**
3. **Source**: GitHub Repository
   - Repository: `https://github.com/Redamzi/shopmarkets.app`
   - Branch: `main`

### Schritt 2: Build-Konfiguration

```
Build Pack: Dockerfile
Dockerfile Location: security-service/Dockerfile
Base Directory: security-service
Port: 4000
```

### Schritt 3: Environment Variables

Füge folgende **Environment Variables** hinzu:

```bash
# Server
PORT=4000
NODE_ENV=production

# Database (PostgreSQL)
DB_HOST=postgres  # oder IP deiner DB
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=dein-postgres-passwort
DB_NAME=postgres

# JWT Secret (Service-zu-Service Auth)
JWT_SECRET=dein-super-sicheres-jwt-secret-mindestens-32-zeichen
JWT_EXPIRY=15m

# Mailgun API
MAILGUN_API_KEY=dein-mailgun-api-key
MAILGUN_DOMAIN=mg.shopmarkets.app
MAILGUN_FROM=security@shopmarkets.app

# Rate Limiting
MAX_FAILED_ATTEMPTS=3
LOCKOUT_DURATION_MINUTES=15

# Code Settings
CODE_EXPIRY_MINUTES=10
CODE_LENGTH=6

# TOTP Settings
TOTP_WINDOW=1
TOTP_STEP=30

# App Settings
APP_NAME=ShopMarkets
APP_DOMAIN=shopmarkets.app
SUPPORT_EMAIL=support@shopmarkets.app

# CORS
ALLOWED_ORIGINS=https://shopmarkets.app,https://www.shopmarkets.app
```

### Schritt 4: Domain konfigurieren

```
Domain: security.shopmarkets.app
SSL: Let's Encrypt (automatisch)
```

### Schritt 5: Database Schema ausführen

**Vor dem ersten Start:**

```bash
# Verbinde dich mit PostgreSQL
psql -h deine-db-host -U postgres -d postgres

# Führe Security Schema aus
\i security-service/schema.sql

# Oder via Supabase Studio:
# SQL Editor → Paste schema.sql → Run
```

### Schritt 6: Deploy starten

1. Klicke auf **"Deploy"**
2. Warte bis Build abgeschlossen ist (~2-3 Minuten)
3. Prüfe Health Check: `https://security.shopmarkets.app/health`

---

## 🐳 Option 2: Mit Full-Stack Docker Compose

Falls du alles zusammen deployen möchtest:

### Schritt 1: Neue Application erstellen

```
Type: Docker Compose
Repository: https://github.com/Redamzi/shopmarkets.app
Branch: main
```

### Schritt 2: Docker Compose File

```
Docker Compose File: docker-compose.full-stack.yml
```

### Schritt 3: Environment Variables

Setze alle Variablen aus `.env.example`:

```bash
# Supabase
POSTGRES_PASSWORD=...
JWT_SECRET=...
ANON_KEY=...
SERVICE_ROLE_KEY=...

# Mailgun
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...

# App
APP_NAME=ShopMarkets
APP_DOMAIN=shopmarkets.app
SUPPORT_EMAIL=support@shopmarkets.app
```

### Schritt 4: Ports konfigurieren

Coolify wird automatisch folgende Ports exposen:
- **3000** - Frontend
- **3001** - Supabase Studio
- **4000** - Security Service
- **8000** - Supabase API Gateway

### Schritt 5: Deploy

Klicke auf **"Deploy"** - Fertig!

---

## 🔐 Mailgun Setup

### 1. Domain verifizieren

1. Gehe zu [Mailgun Dashboard](https://app.mailgun.com)
2. **Sending** → **Domains** → **Add New Domain**
3. Domain: `mg.shopmarkets.app` (Subdomain empfohlen)
4. Füge DNS-Records hinzu:
   - **TXT** - Domain Verification
   - **MX** - Mail Routing
   - **CNAME** - Tracking (optional)

### 2. API Key generieren

1. **Settings** → **API Keys**
2. Kopiere **Private API Key**
3. Setze in Coolify: `MAILGUN_API_KEY`

### 3. Absenderadresse

```bash
MAILGUN_FROM=security@shopmarkets.app
# Oder mit Namen:
MAILGUN_FROM=ShopMarkets Security <security@shopmarkets.app>
```

---

## 🧪 Testing nach Deployment

### 1. Health Check

```bash
curl https://security.shopmarkets.app/health
```

**Erwartete Response:**
```json
{
  "status": "healthy",
  "service": "shopmarkets-security-service",
  "timestamp": "2026-01-03T01:00:00.000Z"
}
```

### 2. E-Mail Code senden (Test)

```bash
curl -X POST https://security.shopmarkets.app/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-uuid-hier",
    "email": "deine-test-email@example.com",
    "type": "LOGIN"
  }'
```

### 3. 2FA Setup testen

```bash
curl -X POST https://security.shopmarkets.app/api/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-uuid-hier"
  }'
```

**Erwartete Response:**
- `secret` - TOTP Secret
- `qrCode` - Base64 QR-Code
- `backupCodes` - 10 Recovery Codes

---

## 📊 Monitoring in Coolify

### Logs ansehen

1. Coolify → Security Service App
2. **Logs** Tab
3. Real-time Logs werden angezeigt

**Wichtige Log-Events:**
- `✅ Database connected` - DB-Verbindung OK
- `🚀 Security Service running on port 4000` - Service gestartet
- `Email sent successfully` - E-Mail versendet
- `2FA activated successfully` - 2FA aktiviert

### Resource Usage

Coolify zeigt automatisch:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**

**Empfohlene Resources:**
- CPU: 0.5 cores
- RAM: 512MB
- Disk: 1GB

---

## 🔄 Updates & Redeploy

### Auto-Deploy aktivieren

1. Coolify → Security Service App
2. **Settings** → **Auto Deploy**
3. Aktiviere **"Deploy on Git Push"**

Jetzt wird bei jedem Push zu `main` automatisch deployed!

### Manuelles Redeploy

1. Coolify → Security Service App
2. Klicke auf **"Redeploy"**
3. Warte bis Build fertig ist

---

## 🐛 Troubleshooting

### "Database connection failed"

**Problem:** Service kann sich nicht mit PostgreSQL verbinden.

**Lösung:**
1. Prüfe `DB_HOST`, `DB_PORT`, `DB_PASSWORD`
2. Stelle sicher PostgreSQL läuft
3. Prüfe Network-Verbindung zwischen Containern
4. Checke Logs: `docker logs shopmarkets-security`

### "Mailgun API error"

**Problem:** E-Mails können nicht versendet werden.

**Lösung:**
1. Prüfe `MAILGUN_API_KEY` ist korrekt
2. Verifiziere Domain in Mailgun Dashboard
3. Prüfe DNS-Records sind gesetzt
4. Teste API Key manuell:
   ```bash
   curl -s --user 'api:YOUR_API_KEY' \
     https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
     -F from='test@YOUR_DOMAIN' \
     -F to='you@example.com' \
     -F subject='Test' \
     -F text='Test'
   ```

### "JWT verification failed"

**Problem:** Token-Validierung schlägt fehl.

**Lösung:**
1. Stelle sicher `JWT_SECRET` ist identisch in:
   - Security Service
   - Haupt-Backend
2. Secret muss mindestens 32 Zeichen haben
3. Keine Leerzeichen am Anfang/Ende

### "Schema not found"

**Problem:** Tabellen existieren nicht.

**Lösung:**
```bash
# Schema manuell ausführen
psql -h DB_HOST -U postgres -d postgres -f security-service/schema.sql

# Oder via Supabase Studio:
# SQL Editor → Paste schema.sql → Run
```

---

## 🔗 Integration mit Frontend

### Environment Variable im Frontend

```bash
# In Coolify Frontend App:
VITE_SECURITY_SERVICE_URL=https://security.shopmarkets.app
```

### API Calls im Frontend

```javascript
// E-Mail Code senden
const response = await fetch(`${import.meta.env.VITE_SECURITY_SERVICE_URL}/api/auth/send-code`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    email: user.email,
    type: 'LOGIN'
  })
});

// 2FA Setup
const response = await fetch(`${import.meta.env.VITE_SECURITY_SERVICE_URL}/api/2fa/setup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id })
});
```

---

## ✅ Deployment Checklist

- [ ] Coolify Application erstellt
- [ ] Dockerfile Location korrekt (`security-service/Dockerfile`)
- [ ] Alle Environment Variables gesetzt
- [ ] Mailgun Domain verifiziert
- [ ] Mailgun API Key konfiguriert
- [ ] Database Schema ausgeführt
- [ ] Domain konfiguriert (`security.shopmarkets.app`)
- [ ] SSL aktiviert (Let's Encrypt)
- [ ] Deployment erfolgreich
- [ ] Health Check erfolgreich
- [ ] Test-E-Mail versendet
- [ ] 2FA Setup getestet
- [ ] Frontend integriert
- [ ] Auto-Deploy aktiviert (optional)

---

**Status**: ✅ Production Ready

Bei Problemen: Checke Coolify Logs oder `security-service/README.md`
