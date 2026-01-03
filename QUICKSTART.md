# 🚀 Quick Start - Self-Hosted Supabase

Schnellstart-Anleitung für lokales Testing mit self-hosted Supabase.

## 📦 Voraussetzungen

- Docker & Docker Compose installiert
- Mindestens 4GB RAM verfügbar
- Ports 3000, 3001, 5432, 8000 frei

## ⚡ 3-Schritte Start

### 1. Environment Variables kopieren
```bash
cp .env.example .env
```

**Für Production**: Ändere die Secrets in `.env`!

### 2. Full-Stack starten
```bash
docker-compose -f docker-compose.full-stack.yml up -d
```

### 3. Warten bis alles läuft
```bash
# Prüfe Status
docker-compose -f docker-compose.full-stack.yml ps

# Logs ansehen
docker-compose -f docker-compose.full-stack.yml logs -f
```

## 🌐 URLs

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | ShopMarkets App |
| **Supabase Studio** | http://localhost:3001 | Admin Dashboard |
| **Supabase API** | http://localhost:8000 | Kong Gateway |
| **PostgreSQL** | localhost:5432 | Database (postgres/your-password) |

## 🔐 Default Credentials

### Supabase Studio
- URL: http://localhost:3001
- Supabase URL: `http://kong:8000`
- Anon Key: siehe `.env`

### PostgreSQL
- Host: localhost
- Port: 5432
- User: postgres
- Password: siehe `.env` → `POSTGRES_PASSWORD`
- Database: postgres

## 🧪 Testen

### 1. Frontend öffnen
```bash
open http://localhost:3000
```

### 2. Supabase Studio öffnen
```bash
open http://localhost:3001
```

### 3. Database Schema prüfen
Im Supabase Studio:
- Table Editor → Sollte `products`, `connections`, etc. zeigen

### 4. API testen
```bash
# Health Check
curl http://localhost:3000/health

# Supabase API
curl http://localhost:8000/rest/v1/products \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🛑 Stoppen

```bash
# Stoppen (Container bleiben)
docker-compose -f docker-compose.full-stack.yml stop

# Stoppen & Löschen (Daten bleiben in Volumes)
docker-compose -f docker-compose.full-stack.yml down

# Alles löschen (inkl. Daten!)
docker-compose -f docker-compose.full-stack.yml down -v
```

## 🔄 Neu starten

```bash
# Nach Code-Änderungen
docker-compose -f docker-compose.full-stack.yml up -d --build shopmarkets-app

# Kompletter Neustart
docker-compose -f docker-compose.full-stack.yml restart
```

## 📊 Logs ansehen

```bash
# Alle Services
docker-compose -f docker-compose.full-stack.yml logs -f

# Nur Frontend
docker-compose -f docker-compose.full-stack.yml logs -f shopmarkets-app

# Nur Database
docker-compose -f docker-compose.full-stack.yml logs -f postgres

# Nur Supabase API
docker-compose -f docker-compose.full-stack.yml logs -f kong rest auth
```

## 🐛 Troubleshooting

### Container startet nicht
```bash
# Prüfe welcher Container fehlt
docker-compose -f docker-compose.full-stack.yml ps

# Logs des fehlerhaften Containers
docker-compose -f docker-compose.full-stack.yml logs [service-name]
```

### Port bereits belegt
```bash
# Prüfe welcher Prozess Port 3000 nutzt
lsof -i :3000

# Oder ändere Port in docker-compose.full-stack.yml:
# ports:
#   - "3002:80"  # Statt 3000:80
```

### Database Schema fehlt
```bash
# Schema manuell ausführen
docker exec -i shopmarkets-db psql -U postgres postgres < supabase/schema.sql
```

### "Failed to connect to Supabase"
1. Prüfe ob Kong läuft: `docker ps | grep kong`
2. Teste Kong direkt: `curl http://localhost:8000`
3. Prüfe `.env` → `VITE_SUPABASE_URL=http://localhost:8000`

## 🚀 Production Deployment

Für Production-Deployment siehe [DEPLOYMENT.md](./DEPLOYMENT.md)

**Wichtig für Production:**
1. Ändere **alle** Secrets in `.env`
2. Generiere neue JWT Keys
3. Nutze HTTPS (nicht HTTP)
4. Aktiviere Backups
5. Setze sichere Passwörter

## 📚 Weitere Ressourcen

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vollständige Deployment-Anleitung
- [Supabase Docs](https://supabase.com/docs)
- [Kong Gateway Docs](https://docs.konghq.com/)

---

**Happy Coding!** 🎉
