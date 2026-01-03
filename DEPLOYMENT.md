# ShopMarkets.app - Deployment Guide

## 🚀 Coolify Deployment

Dieses Projekt ist für Coolify-Deployment mit Docker optimiert.

### Voraussetzungen
- Coolify-Installation
- GitHub-Repository verbunden
- Domain/Subdomain konfiguriert

### Deployment-Schritte in Coolify

1. **Neues Projekt erstellen**
   - Gehe zu Coolify Dashboard
   - Klicke auf "New Resource" → "Application"
   - Wähle "Public Repository" oder verbinde dein GitHub-Repo

2. **Repository-Einstellungen**
   - Repository URL: `https://github.com/Redamzi/shopmarkets.app`
   - Branch: `main`
   - Build Pack: **Dockerfile**

3. **Build-Konfiguration**
   - Dockerfile Path: `./Dockerfile`
   - Base Directory: `/` (Root)
   - Port: `80`

4. **Domain-Konfiguration**
   - Füge deine Domain hinzu (z.B. `shopmarkets.app`)
   - SSL/TLS wird automatisch via Let's Encrypt konfiguriert

5. **Deploy starten**
   - Klicke auf "Deploy"
   - Coolify wird automatisch:
     - Repository klonen
     - Docker Image bauen
     - Container starten
     - SSL-Zertifikat einrichten

### Lokales Testing (Optional)

Vor dem Deployment kannst du lokal testen:

```bash
# Docker Image bauen
docker build -t shopmarkets-app .

# Container starten
docker run -p 3000:80 shopmarkets-app

# Oder mit Docker Compose
docker-compose up
```

Öffne dann: http://localhost:3000

### Technische Details

- **Build-System**: Vite
- **Framework**: React 19 + TypeScript
- **Webserver**: Nginx (Alpine)
- **Multi-Stage Build**: Ja (optimierte Image-Größe)
- **Health Check**: `/health` Endpoint

### Umgebungsvariablen

Falls du API-Endpoints oder andere Konfigurationen brauchst, füge sie in Coolify unter "Environment Variables" hinzu:

```
VITE_API_URL=https://api.shopmarkets.app
VITE_ENV=production
```

**Wichtig**: Vite-Variablen müssen mit `VITE_` beginnen!

### Troubleshooting

**Build schlägt fehl:**
- Prüfe ob `package.json` korrekt ist
- Stelle sicher, dass alle Dependencies installierbar sind

**Container startet nicht:**
- Prüfe Logs in Coolify
- Verifiziere Port 80 ist nicht blockiert

**404 Fehler bei Routing:**
- Nginx ist bereits für SPA-Routing konfiguriert
- Alle Routes werden auf `index.html` umgeleitet

### Monitoring

Coolify bietet integriertes Monitoring:
- Container-Logs in Echtzeit
- Resource-Usage (CPU, RAM)
- Health Check Status

---

**Deployment Status**: ✅ Ready for Production
