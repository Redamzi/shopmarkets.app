# 🚀 Frontend Deployment Guide - start.shopmarkets.app

## 📋 Environment Variables für Coolify

Kopiere diese Variablen in Coolify für dein **Frontend-Deployment** (`start.shopmarkets.app`):

```bash
# ============================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================

# Supabase Connection
VITE_SUPABASE_URL=https://supabase.shopmarkets.app
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BtYXJrZXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTU0NjUsImV4cCI6MjA4MjkxNTQ2NX0._K8oQUJQudU053iUkf3m7og-pfIAdJMlL3CFTHAdJBo

# Backend API
VITE_API_URL=https://api.shopmarkets.app

# Security Service (2FA)
VITE_SECURITY_SERVICE_URL=https://security.shopmarkets.app

# Environment
VITE_ENV=production

# App Settings
APP_NAME=ShopMarkets
APP_DOMAIN=start.shopmarkets.app
SUPPORT_EMAIL=support@shopmarkets.app
```

---

## 🔧 Coolify Konfiguration

### 1. Frontend Service erstellen

```
Service Name: shopmarkets-frontend
Domain: start.shopmarkets.app
Repository: https://github.com/Redamzi/shopmarkets.app
Branch: main
```

### 2. Build Settings

```
Build Command: npm run build
Start Command: npm run preview
Port: 4173 (Vite Preview) oder 3000 (Custom Server)
```

**Alternative (mit nginx):**
```
Build Command: npm run build
Start Command: nginx -g 'daemon off;'
Port: 80
```

### 3. Environment Variables einfügen

```
1. Gehe zu: Service → Settings → Environment Variables
2. Klicke: "+ Add Multiple" oder "Bulk Import"
3. Kopiere die Variablen oben
4. Klicke: "Save"
```

### 4. Domain konfigurieren

```
1. Gehe zu: Service → Domains
2. Klicke: "+ Add Domain"
3. Eingeben: start.shopmarkets.app
4. SSL: Automatisch (Let's Encrypt)
5. Speichern
```

---

## 📦 Backend Service (api.shopmarkets.app)

### Environment Variables für Backend:

```bash
# Supabase Connection
SUPABASE_URL=https://supabase.shopmarkets.app
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BtYXJrZXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTU0NjUsImV4cCI6MjA4MjkxNTQ2NX0._K8oQUJQudU053iUkf3m7og-pfIAdJMlL3CFTHAdJBo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BtYXJrZXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU1NTQ2NSwiZXhwIjoyMDgyOTE1NDY1fQ.vLCLrXjTNHtclOtPsRwONDww_3NMLMKCpXp9WxMTFJo

# Server Config
PORT=4000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://start.shopmarkets.app
```

### Build Settings:

```
Build Command: npm install
Start Command: node backend/server.js
Port: 4000
```

---

## 🔄 Deployment-Reihenfolge

**WICHTIG:** Services in dieser Reihenfolge deployen:

```
1. ✅ Supabase (supabase.shopmarkets.app)
   → Alle Services müssen "healthy" sein

2. ✅ Backend API (api.shopmarkets.app)
   → Warte bis "running"
   → Test: curl https://api.shopmarkets.app

3. ✅ Frontend (start.shopmarkets.app)
   → Warte bis "running"
   → Test: https://start.shopmarkets.app
```

---

## ✅ Deployment Checklist

### Vor dem Deployment:

- [ ] Alle ENV-Variablen in Coolify gesetzt
- [ ] Domain DNS konfiguriert (A-Record auf Server-IP)
- [ ] SSL-Zertifikat aktiv
- [ ] Supabase läuft und ist erreichbar
- [ ] Backend API läuft und ist erreichbar

### Nach dem Deployment:

- [ ] Frontend öffnet ohne Fehler
- [ ] Login funktioniert
- [ ] API-Calls funktionieren
- [ ] Supabase-Verbindung funktioniert
- [ ] Keine Console-Errors im Browser

---

## 🧪 Tests nach Deployment

### 1. Frontend-Test

```bash
# Öffne:
https://start.shopmarkets.app

# Erwartung:
✅ Seite lädt ohne Fehler
✅ Keine Console-Errors (F12)
✅ Login-Formular wird angezeigt
```

### 2. API-Test

```bash
# Terminal:
curl https://api.shopmarkets.app

# Erwartung:
{
  "status": "healthy",
  "service": "shopmarkets-api",
  "version": "1.0.0"
}
```

### 3. Supabase-Test

```bash
# Terminal:
curl https://supabase.shopmarkets.app

# Erwartung:
Supabase Kong Response
```

### 4. Auth-Flow-Test

```
1. Gehe zu: https://start.shopmarkets.app/register
2. Registriere einen Test-User
3. Prüfe E-Mail (Bestätigungslink)
4. Klicke auf Link
5. Erwartung: Redirect zu https://start.shopmarkets.app/auth/callback
6. Erwartung: User ist eingeloggt
```

---

## 🔧 Troubleshooting

### Problem: Frontend zeigt "Cannot connect to Supabase"

**Lösung:**
```
1. Prüfe VITE_SUPABASE_URL in Coolify
2. Sollte sein: https://supabase.shopmarkets.app
3. NICHT: http://... oder :8000
```

### Problem: API-Calls schlagen fehl

**Lösung:**
```
1. Prüfe VITE_API_URL in Coolify
2. Sollte sein: https://api.shopmarkets.app
3. Prüfe CORS in Backend (backend/server.js)
4. CORS_ORIGIN sollte sein: https://start.shopmarkets.app
```

### Problem: Auth-Redirect funktioniert nicht

**Lösung:**
```
1. Prüfe in Supabase ENV:
   GOTRUE_SITE_URL=https://start.shopmarkets.app
   GOTRUE_URI_ALLOW_LIST=https://start.shopmarkets.app,...
2. Starte Supabase Auth neu
```

### Problem: SSL-Fehler

**Lösung:**
```
1. Warte 2-3 Minuten (Let's Encrypt braucht Zeit)
2. Prüfe DNS: nslookup start.shopmarkets.app
3. Prüfe in Coolify: SSL Status
4. Falls fehlgeschlagen: "Regenerate SSL Certificate"
```

---

## 📊 Monitoring

### Logs checken:

```
Coolify → Service → Logs

Wichtige Log-Meldungen:
✅ "Server running on port 4173"
✅ "Vite preview server started"
❌ "ECONNREFUSED" → Backend nicht erreichbar
❌ "CORS error" → CORS-Konfiguration prüfen
```

### Performance:

```
# Lighthouse Score (Ziel):
Performance: > 90
Accessibility: > 95
Best Practices: > 90
SEO: > 90
```

---

## 🔐 Security Checklist

- [ ] Alle Secrets in Coolify (NICHT im Code)
- [ ] HTTPS erzwungen (HTTP → HTTPS Redirect)
- [ ] CORS korrekt konfiguriert
- [ ] Rate Limiting aktiviert (optional)
- [ ] Security Headers gesetzt (optional)

---

## 📞 Support

Bei Problemen:
1. Prüfe Coolify Logs
2. Prüfe Browser Console (F12)
3. Teste API mit curl
4. Screenshot von Fehler

---

**Erstellt:** 2026-01-04
**Für:** ShopMarkets Frontend Deployment
**Domain:** start.shopmarkets.app
