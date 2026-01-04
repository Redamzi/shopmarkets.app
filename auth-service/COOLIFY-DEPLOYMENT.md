# 🚀 Auth-Service Deployment in Coolify

## Schritt-für-Schritt Anleitung

---

## 1️⃣ PostgreSQL Datenbank erstellen

### In Coolify:
```
1. Dashboard → Databases → + New Database
2. Typ: PostgreSQL
3. Name: auth-db
4. Version: 16 (oder latest)
5. Create
```

### Notiere dir:
- Host: `auth-db` (interner Docker Name)
- Port: `5432`
- Database: `postgres` (Standard)
- User: `postgres`
- Password: (wird generiert)

---

## 2️⃣ Auth-Service erstellen

### In Coolify:
```
1. Dashboard → Applications → + New Application
2. Source: GitHub
3. Repository: Redamzi/shopmarkets.app
4. Branch: main
5. Base Directory: auth-service
6. Build Pack: Dockerfile
7. Port: 3001
8. Domain: auth.shopmarkets.app
9. Create
```

---

## 3️⃣ Environment Variables setzen

### In Coolify → Auth-Service → Environment Variables:

```bash
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=auth-db
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=DEIN-POSTGRES-PASSWORD-AUS-SCHRITT-1

# JWT (generiere neuen Secret)
JWT_SECRET=GENERIERE-EINEN-NEUEN-SECRET-MIN-32-CHARS

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@shopmarkets.app
SMTP_PASS=DEIN-GMAIL-APP-PASSWORD

# CORS
CORS_ORIGIN=https://start.shopmarkets.app
```

### JWT Secret generieren:
```bash
openssl rand -base64 32
```

---

## 4️⃣ Domain konfigurieren

### DNS Settings (bei deinem Domain-Provider):
```
Type: A
Name: auth
Value: DEINE-SERVER-IP
TTL: 300
```

### In Coolify:
```
1. Auth-Service → Domains
2. + Add Domain
3. Domain: auth.shopmarkets.app
4. SSL: Automatisch (Let's Encrypt)
5. Save
```

---

## 5️⃣ Deployment starten

### In Coolify:
```
1. Auth-Service → Deploy
2. Warte bis Status: "running"
3. Prüfe Logs auf Fehler
```

---

## 6️⃣ Datenbank-Migration ausführen

### Option A: Via Coolify Terminal
```
1. Auth-Service → Terminal
2. Führe aus:
   npm run migrate
3. Erwartung: "✅ Migrations completed successfully"
```

### Option B: Via SSH
```bash
# SSH in Server
ssh user@your-server

# Finde Container ID
docker ps | grep auth-service

# Exec in Container
docker exec -it CONTAINER_ID npm run migrate
```

---

## 7️⃣ Testen

### Health Check:
```bash
curl https://auth.shopmarkets.app/health
```

**Erwartung:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2026-01-04T..."
}
```

### Register Test:
```bash
curl -X POST https://auth.shopmarkets.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "fullName": "Test User"
  }'
```

**Erwartung:**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "userId": "..."
}
```

---

## 8️⃣ Frontend anpassen

### In Frontend ENV (Coolify):
```bash
# Alte Supabase Auth entfernen, neue Auth-Service URL:
VITE_AUTH_SERVICE_URL=https://auth.shopmarkets.app
```

### Frontend Code anpassen:
```javascript
// Statt Supabase Auth:
// import { supabase } from './lib/supabase'

// Nutze Auth-Service:
const response = await fetch('https://auth.shopmarkets.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## 9️⃣ Monitoring

### Logs checken:
```
Coolify → Auth-Service → Logs
```

**Wichtige Log-Meldungen:**
```
✅ "🔐 Auth Service running on port 3001"
✅ "✅ Connected to Auth Database"
❌ "❌ Unexpected database error" → DB-Verbindung prüfen
❌ "ECONNREFUSED" → DB nicht erreichbar
```

### Status prüfen:
```
Coolify → Auth-Service → Status
Erwartung: "running (healthy)"
```

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to database"

**Lösung:**
```
1. Prüfe DB_HOST in ENV
2. Sollte sein: auth-db (nicht localhost!)
3. Prüfe DB_PASSWORD
4. Restart Auth-Service
```

### Problem: "SMTP error"

**Lösung:**
```
1. Prüfe SMTP_USER und SMTP_PASS
2. Gmail App-Passwort erstellt?
3. 2-Step Verification aktiviert?
```

### Problem: "Migration failed"

**Lösung:**
```
1. Prüfe DB-Verbindung
2. Führe Migration manuell aus:
   docker exec -it CONTAINER_ID npm run migrate
3. Prüfe Logs
```

### Problem: "CORS error im Frontend"

**Lösung:**
```
1. Prüfe CORS_ORIGIN in Auth-Service ENV
2. Sollte sein: https://start.shopmarkets.app
3. Restart Auth-Service
```

---

## ✅ Deployment Checklist

Nach erfolgreichem Deployment:

- [ ] Auth-DB läuft und ist erreichbar
- [ ] Auth-Service Status: "running (healthy)"
- [ ] Migration erfolgreich ausgeführt
- [ ] Health Check funktioniert
- [ ] Domain erreichbar (auth.shopmarkets.app)
- [ ] SSL-Zertifikat aktiv
- [ ] Register-Test erfolgreich
- [ ] E-Mail-Versand funktioniert
- [ ] Frontend kann Auth-Service erreichen

---

## 📊 Service-Übersicht

Nach Deployment hast du:

```
✅ auth.shopmarkets.app     - Auth-Service (Port 3001)
✅ auth-db                   - PostgreSQL (Port 5432)
✅ start.shopmarkets.app     - Frontend
✅ api.shopmarkets.app       - Backend API
✅ supabase.shopmarkets.app  - Supabase (nur für App-Daten)
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET ist stark (min. 32 Zeichen)
- [ ] DB_PASSWORD ist stark
- [ ] SMTP_PASS ist Gmail App-Passwort (nicht normales Passwort)
- [ ] CORS_ORIGIN ist korrekt gesetzt
- [ ] Rate Limiting ist aktiv (5 req/15min)
- [ ] SSL ist aktiviert
- [ ] Firewall erlaubt nur Port 443

---

## 📞 Support

Bei Problemen:
1. Prüfe Coolify Logs
2. Prüfe Health Check
3. Teste API mit curl
4. Screenshot von Fehler

---

**Erstellt:** 2026-01-04
**Service:** Auth-Microservice
**Domain:** auth.shopmarkets.app
**Port:** 3001
