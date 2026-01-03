# ShopMarkets.app - Production Deployment Guide

## 🚀 Coolify Deployment mit Supabase

Dieses Projekt ist vollständig für Production-Deployment mit Coolify und Supabase konfiguriert.

---

## 📋 Voraussetzungen

### 1. Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (findest du unter Settings → API)

### 2. Datenbank Schema einrichten
1. Öffne den **SQL Editor** in Supabase
2. Kopiere den Inhalt von `supabase/schema.sql`
3. Führe das SQL-Script aus
4. Verifiziere, dass alle Tabellen erstellt wurden:
   - `products`
   - `connections`
   - `sync_logs`
   - `user_credits`

### 3. Coolify-Installation
- Stelle sicher, dass Coolify auf deinem Server läuft
- GitHub-Repository ist verbunden

---

## 🔧 Deployment-Schritte in Coolify

### Schritt 1: Neue Application erstellen
1. Öffne Coolify Dashboard
2. Klicke auf **"New Resource"** → **"Application"**
3. Wähle **"Public Repository"** oder verbinde dein GitHub-Repo

### Schritt 2: Repository-Konfiguration
```
Repository URL: https://github.com/Redamzi/shopmarkets.app
Branch: main
Build Pack: Dockerfile
```

### Schritt 3: Build-Konfiguration
```
Dockerfile Location: ./Dockerfile
Base Directory: /
Port: 80
```

### Schritt 4: Environment Variables (WICHTIG!)
Füge folgende **Build-Time Environment Variables** in Coolify hinzu:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional
VITE_API_URL=https://api.shopmarkets.app
VITE_ENV=production
```

**⚠️ WICHTIG**: Diese müssen als **Build Arguments** konfiguriert werden, nicht als Runtime Environment Variables!

In Coolify:
- Gehe zu **Build** → **Build Arguments**
- Füge jede Variable einzeln hinzu

### Schritt 5: Domain-Konfiguration
1. Füge deine Domain hinzu (z.B. `shopmarkets.app`)
2. SSL/TLS wird automatisch via Let's Encrypt konfiguriert
3. Optional: Füge www-Subdomain hinzu

### Schritt 6: Deploy starten
1. Klicke auf **"Deploy"**
2. Coolify wird:
   - Repository klonen
   - Docker Image mit Supabase-Credentials bauen
   - Container starten
   - SSL-Zertifikat einrichten

---

## 🧪 Lokales Testing (vor Deployment)

### 1. Environment Variables setzen
Erstelle eine `.env` Datei im Root:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Development Server
```bash
npm install
npm run dev
```

### 3. Docker Build lokal testen
```bash
# Mit Docker Compose (empfohlen)
docker-compose up --build

# Oder manuell
docker build \
  --build-arg VITE_SUPABASE_URL=https://xxxxx.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=eyJhbGc... \
  -t shopmarkets-app .

docker run -p 3000:80 shopmarkets-app
```

Öffne dann: **http://localhost:3000**

---

## 🔐 Supabase Authentication (Optional)

Falls du User-Authentication brauchst:

### 1. Email/Password Auth aktivieren
1. Supabase Dashboard → **Authentication** → **Providers**
2. Aktiviere **Email**
3. Konfiguriere Email-Templates

### 2. Auth-Integration im Code
```typescript
import { supabase } from './lib/supabase';

// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## 📊 Datenbank-Struktur

### Products Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- sku (VARCHAR, Unique)
- title (TEXT)
- price (DECIMAL)
- stock (INTEGER)
- image_url (TEXT)
- channels (TEXT[])
- channel_prices (JSONB)
- weight, dimensions, shipping_profile, category
- created_at, updated_at
```

### Connections Table
```sql
- id (UUID)
- user_id (UUID)
- platform (VARCHAR)
- name (VARCHAR)
- url (TEXT)
- status (VARCHAR)
- api_key, api_secret (TEXT, encrypted)
- config (JSONB)
```

### Row Level Security (RLS)
✅ Alle Tabellen haben RLS aktiviert
✅ User können nur ihre eigenen Daten sehen/bearbeiten

---

## 🔄 Auto-Deploy bei Git Push

### Webhook in Coolify aktivieren
1. Coolify → Application → **Settings**
2. Aktiviere **"Auto Deploy on Push"**
3. Coolify erstellt automatisch einen GitHub Webhook

Jetzt wird bei jedem Push zu `main` automatisch deployed!

---

## 📈 Monitoring & Logs

### In Coolify verfügbar:
- **Real-time Logs**: Build & Runtime Logs
- **Resource Usage**: CPU, RAM, Network
- **Health Checks**: `/health` Endpoint wird überwacht

### Health Check Endpoint
```bash
curl https://shopmarkets.app/health
# Response: "healthy"
```

---

## 🐛 Troubleshooting

### Build schlägt fehl: "VITE_SUPABASE_URL is not defined"
**Lösung**: Stelle sicher, dass die Environment Variables als **Build Arguments** konfiguriert sind, nicht als Runtime Env Vars.

### "Failed to fetch" Fehler im Browser
**Lösung**: 
1. Prüfe Supabase URL und Key in den Build Args
2. Verifiziere RLS-Policies in Supabase
3. Checke Browser Console für CORS-Fehler

### Container startet nicht
**Lösung**:
1. Prüfe Coolify Logs
2. Verifiziere Port 80 ist nicht blockiert
3. Teste lokal mit Docker

### Datenbank-Verbindung schlägt fehl
**Lösung**:
1. Prüfe Supabase Project Status
2. Verifiziere API Key ist korrekt
3. Checke RLS-Policies

---

## 🚀 Performance-Optimierungen

### Bereits implementiert:
✅ Multi-Stage Docker Build (kleinere Image-Größe)
✅ Nginx mit Gzip-Kompression
✅ Static Asset Caching (1 Jahr)
✅ Security Headers
✅ Health Check Endpoint

### Weitere Optimierungen:
- **CDN**: Nutze Cloudflare für statische Assets
- **Database Indexes**: Bereits in schema.sql definiert
- **Connection Pooling**: Supabase managed automatisch

---

## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (optional)
- **Webserver**: Nginx (Alpine)
- **Deployment**: Coolify + Docker
- **SSL**: Let's Encrypt (automatisch)

---

## 🔗 Wichtige Links

- **Supabase Dashboard**: https://app.supabase.com
- **Coolify Docs**: https://coolify.io/docs
- **GitHub Repo**: https://github.com/Redamzi/shopmarkets.app

---

## ✅ Deployment Checklist

- [ ] Supabase Projekt erstellt
- [ ] Database Schema ausgeführt (`supabase/schema.sql`)
- [ ] Supabase URL & Anon Key kopiert
- [ ] Coolify Application erstellt
- [ ] Build Arguments konfiguriert
- [ ] Domain hinzugefügt
- [ ] Deployment gestartet
- [ ] Health Check erfolgreich
- [ ] Login/Signup getestet
- [ ] Daten-CRUD getestet
- [ ] Auto-Deploy aktiviert

---

**Status**: ✅ Production Ready

Bei Fragen oder Problemen, checke die Coolify Logs oder Supabase Dashboard!
