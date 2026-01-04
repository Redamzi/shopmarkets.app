# ✅ ShopMarkets Microservices - Setup Complete

**Datum:** 2026-01-05  
**Version:** 2.0  
**Status:** Ready for Deployment

---

## 📦 Was wurde erstellt?

### 1. Projekt-Struktur

```
shopmarkets.app/
├── services/
│   ├── security/              ✅ Authentication & 2FA Service
│   │   ├── src/
│   │   │   ├── controllers/   ✅ Auth Logic
│   │   │   ├── routes/        ✅ API Endpoints
│   │   │   ├── middleware/    ✅ Validation, Rate Limiting
│   │   │   ├── utils/         ✅ DB, Email, Helpers
│   │   │   └── server.js      ✅ Main Server
│   │   ├── Dockerfile         ✅ Docker Build
│   │   ├── package.json       ✅ Dependencies
│   │   ├── .env.example       ✅ Config Template
│   │   └── README.md          ✅ Documentation
│   │
│   ├── api/                   ✅ Backend API Service
│   │   ├── Dockerfile         ✅ Docker Build
│   │   └── .env.example       ✅ Config Template
│   │
│   └── dashboard/             ✅ React Frontend
│       ├── components/        ✅ All UI Components (moved)
│       ├── Dockerfile         ✅ Docker Build
│       └── .env.example       ✅ Config Template
│
├── infrastructure/
│   ├── supabase/
│   │   └── docker-compose.yml ✅ Custom Ports Config
│   └── coolify/               ✅ Deployment Configs
│
├── ARCHITECTURE.md            ✅ System Overview
├── DEPLOYMENT-GUIDE.md        ✅ Step-by-Step Deploy
└── setup-microservices.sh     ✅ Automated Setup Script
```

---

## 🎯 Services Übersicht

| Service | Domain | Port | Status | Beschreibung |
|---------|--------|------|--------|--------------|
| **Security** | `security.shopmarkets.app` | 3001 | ✅ Ready | Auth, 2FA, JWT |
| **API** | `api.shopmarkets.app` | 3000 | ⏳ To Do | Shop Integration |
| **Dashboard** | `start.shopmarkets.app` | 3000 | ✅ Ready | React Frontend |
| **Supabase** | `supabase.shopmarkets.app` | Custom | ✅ Ready | Database |
| **AI Generator** | `ai-generator.shopmarkets.app` | 8000 | ⏳ Future | AI Content |
| **Landing** | `www.shopmarkets.com` | 3000 | ⏳ Future | Marketing |
| **Marketplace** | `shop-markets.com` | 3000 | ⏳ Future | E-Commerce |

---

## 🔧 Supabase Custom Ports

Um Konflikte mit der bestehenden Supabase-Instanz zu vermeiden:

| Service | Standard Port | Custom Port | Grund |
|---------|--------------|-------------|-------|
| Studio | 3000 | **3001** | Konflikt vermeiden |
| Kong API | 8000 | **8001** | Konflikt vermeiden |
| Auth (GoTrue) | 9999 | **9100** | Konflikt vermeiden |
| Meta | 8080 | **8082** | Konflikt vermeiden |
| Realtime | 4000 | **4001** | Konflikt vermeiden |
| Storage | 5000 | **5001** | Konflikt vermeiden |
| Database | 5432 | **5432** | Bleibt (intern) |

---

## 🚀 Nächste Schritte

### Phase 1: Security Service Deployment (JETZT)

1. **Datenbank erstellen:**
   ```
   Coolify → Databases → + New PostgreSQL
   Name: security-db
   Password: [generiert]
   ```

2. **Security Service deployen:**
   ```
   Coolify → Applications → + New
   Repository: shopmarkets.app
   Branch: main
   Base Directory: /services/security
   Dockerfile: /services/security/Dockerfile
   Port: 3001
   Domain: security.shopmarkets.app
   ```

3. **ENV Variables setzen:**
   - Kopiere aus `services/security/.env.example`
   - Füge echte Credentials ein
   - Save & Deploy

4. **Migration ausführen:**
   ```bash
   # Im Security Service Terminal (Coolify)
   npm run migrate
   ```

5. **Testen:**
   ```bash
   curl https://security.shopmarkets.app/health
   ```

### Phase 2: Supabase mit Custom Ports

1. **In Coolify:**
   - Services → + New → Supabase
   - Nutze `infrastructure/supabase/docker-compose.yml`
   - Alle Ports wie oben anpassen
   - Domain: `supabase.shopmarkets.app`

2. **Secrets generieren:**
   - JWT_SECRET
   - ANON_KEY
   - SERVICE_ROLE_KEY
   - POSTGRES_PASSWORD

3. **Deploy & Verify**

### Phase 3: API Service

1. **Backend Code anpassen:**
   - Supabase Client konfigurieren
   - Shop-Integrationen hinzufügen
   - Security Service Integration

2. **Deployen:**
   ```
   Base Directory: /services/api
   Port: 3000
   Domain: api.shopmarkets.app
   ```

### Phase 4: Dashboard

1. **Frontend anpassen:**
   - Auth-Service URLs aktualisieren
   - API URLs aktualisieren
   - Testen

2. **Deployen:**
   ```
   Base Directory: /services/dashboard
   Port: 3000
   Domain: start.shopmarkets.app
   ```

---

## 📋 Checkliste

### Security Service
- [x] Struktur erstellt
- [x] Code implementiert
- [x] Dockerfile erstellt
- [x] README geschrieben
- [ ] In Coolify deployed
- [ ] Datenbank verbunden
- [ ] Migration ausgeführt
- [ ] SMTP konfiguriert
- [ ] Getestet

### Supabase
- [x] Docker Compose mit Custom Ports
- [ ] In Coolify deployed
- [ ] Secrets generiert
- [ ] Studio erreichbar
- [ ] Datenbank erreichbar

### API Service
- [ ] Code refactored
- [ ] Supabase Client konfiguriert
- [ ] Shop-APIs integriert
- [ ] Deployed
- [ ] Getestet

### Dashboard
- [x] Code nach services/dashboard verschoben
- [ ] ENV URLs aktualisiert
- [ ] Auth-Flow angepasst
- [ ] Deployed
- [ ] Getestet

---

## 🔐 Wichtige Credentials

**Speichere diese sicher (z.B. in 1Password):**

### Security Service
```
DB_PASSWORD=<generiert-von-coolify>
JWT_SECRET=<generiere-mit: openssl rand -base64 32>
SMTP_PASS=<dein-ionos-passwort>
```

### Supabase
```
POSTGRES_PASSWORD=<generiert>
JWT_SECRET=<generiere-mit: openssl rand -base64 32>
ANON_KEY=<generiere-mit-jwt.io>
SERVICE_ROLE_KEY=<generiere-mit-jwt.io>
```

---

## 📚 Dokumentation

| Dokument | Zweck |
|----------|-------|
| `ARCHITECTURE.md` | Komplette System-Architektur |
| `DEPLOYMENT-GUIDE.md` | Schritt-für-Schritt Deployment |
| `services/security/README.md` | Security Service API Docs |
| `setup-microservices.sh` | Automatisiertes Setup |

---

## 🐛 Troubleshooting

### "Connection timeout" beim Security Service
- Prüfe `DB_HOST` (muss Coolify DB-Name sein)
- Prüfe `DB_PASSWORD` (aus Coolify kopieren)
- Prüfe ob DB läuft

### "SMTP Error" bei Registration
- Prüfe `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- Teste SMTP-Credentials separat
- Prüfe Firewall/Port 587

### "Port already in use" bei Supabase
- Nutze Custom Ports aus `docker-compose.yml`
- Prüfe ob alte Supabase läuft
- Stoppe Konflikte

### "CORS Error" im Frontend
- Prüfe `CORS_ORIGIN` im Security Service
- Muss exakt `https://start.shopmarkets.app` sein
- Keine trailing slashes

---

## ✅ Success Criteria

**Du weißt, dass alles funktioniert, wenn:**

1. ✅ `https://security.shopmarkets.app/health` → `{"status":"healthy"}`
2. ✅ User Registration funktioniert
3. ✅ Email mit Code kommt an
4. ✅ Login mit 2FA funktioniert
5. ✅ JWT Token wird generiert
6. ✅ Dashboard kann sich verbinden
7. ✅ Supabase Studio ist erreichbar
8. ✅ API Service kann Daten abrufen

---

## 🎉 Go-Live Checklist

- [ ] Alle Services deployed
- [ ] Alle Health Checks grün
- [ ] SMTP funktioniert
- [ ] SSL Zertifikate aktiv
- [ ] Monitoring eingerichtet
- [ ] Backups konfiguriert
- [ ] Logs werden gespeichert
- [ ] Performance getestet
- [ ] Security Audit durchgeführt
- [ ] Dokumentation vollständig

---

**Erstellt:** 2026-01-05 00:15 UTC  
**Nächstes Update:** Nach Phase 1 Deployment

**Viel Erfolg! 🚀**
