# 🔍 MEDIATHEK DIAGNOSE-BERICHT
**Datum:** 2026-01-13 01:08 Uhr  
**Status:** ❌ KRITISCHE PROBLEME GEFUNDEN

---

## 📊 ZUSAMMENFASSUNG DER PROBLEME

### 🚨 **HAUPTPROBLEM: Fehlende Upload-Verzeichnisse und Konfiguration**

Die Mediathek ist defekt, weil:
1. ❌ **Keine Upload-Verzeichnisse existieren** (weder `uploads/` noch `services/api/uploads/`)
2. ❌ **Keine Environment-Variablen** für Upload-Pfade (`UPLOAD_DIR`, `CDN_URL`)
3. ❌ **Keine Bilder im Projekt** gefunden (0 Dateien)
4. ⚠️  **Docker läuft nicht** - kann Volumes nicht prüfen

---

## 🔎 DETAILLIERTE ANALYSE

### 1️⃣ **SQL-STRUKTUR** ✅ (Wahrscheinlich OK)

**Erwartete Tabellen:**
- `public.media_files` - Sollte existieren (definiert in `005_add_categories_media.sql`)
- `public.media_folders` - Sollte existieren (definiert in `create_media_folders.sql`)

**Spalten in `media_files`:**
```sql
- id (UUID)
- user_id (UUID)
- folder_id (UUID, nullable)
- filename (TEXT)
- url (TEXT)
- mime_type (TEXT)
- size_bytes (BIGINT)
- is_active (BOOLEAN)
- source (TEXT)
- external_id (TEXT) -- Speichert relativen Pfad: userId/filename
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**Spalten in `media_folders`:**
```sql
- id (UUID)
- user_id (UUID)
- name (TEXT)
- parent_id (UUID, nullable)
- path (TEXT)
- created_at (TIMESTAMPTZ)
```

**⚠️ HINWEIS:** Es gibt 2 verschiedene SQL-Dateien für media_folders:
- `services/security/migrations/005_add_categories_media.sql` (mit `path` Spalte)
- `services/api/migrations/create_media_folders.sql` (ohne `path` Spalte)

**→ KONFLIKT:** Die Tabellen-Definitionen sind inkonsistent!

---

### 2️⃣ **UPLOAD-VERZEICHNISSE** ❌ (FEHLEN KOMPLETT)

**Erwartete Verzeichnisse:**
- `uploads/` im Projekt-Root → ❌ **NICHT VORHANDEN**
- `services/api/uploads/` → ❌ **NICHT VORHANDEN**

**Konfiguration in `media.js` (Zeile 12):**
```javascript
const UPLOAD_ROOT = process.env.UPLOAD_DIR || 'uploads';
```

**Problem:** 
- `UPLOAD_DIR` ist NICHT in `.env` definiert
- Fallback auf `uploads/` Verzeichnis, das nicht existiert
- Code erstellt zwar Verzeichnis mit `fs.ensureDirSync(UPLOAD_ROOT)`, aber nur wenn API läuft

---

### 3️⃣ **CDN-KONFIGURATION** ⚠️ (TEILWEISE OK)

**CDN nginx.conf:**
```nginx
root /usr/share/nginx/html/uploads;
```

**Erwartete URL-Struktur:**
```
https://cdn.shopmarkets.app/USER_ID/FILENAME.jpg
```

**Problem:**
- `CDN_URL` ist NICHT in `.env` definiert
- Fallback in `media.js`: `https://cdn.shopmarkets.app` (hardcoded)
- CDN erwartet Dateien in `/usr/share/nginx/html/uploads/`
- Aber: Keine Volume-Konfiguration für persistente Speicherung!

---

### 4️⃣ **ROUTEN-ANALYSE** ✅ (CODE IST OK)

**API-Routen in `services/api/src/routes/media.js`:**

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/media/upload` | POST | Upload-Datei | ✅ Code OK |
| `/api/media/` | GET | Liste Dateien | ✅ Code OK |
| `/api/media/folders` | GET | Liste Ordner | ✅ Code OK |
| `/api/media/folders` | POST | Erstelle Ordner | ✅ Code OK |
| `/api/media/folders/:id` | DELETE | Lösche Ordner | ✅ Code OK |
| `/api/media/:id/move` | PUT | Verschiebe Datei | ✅ Code OK |
| `/api/media/:id` | DELETE | Lösche Datei | ✅ Code OK |

**Upload-Logik (Zeile 19-44):**
1. Speichert Dateien in: `UPLOAD_ROOT/userId/filename`
2. Speichert URL in DB: `${CDN_URL}/${userId}/${filename}`
3. Speichert relativen Pfad in `external_id`: `userId/filename`

**→ CODE IST KORREKT**, aber Konfiguration fehlt!

---

### 5️⃣ **DATENVERLUST** 🔴 (KRITISCH)

**Befund:**
- 0 Bild-Dateien im gesamten Projekt gefunden
- Keine Upload-Verzeichnisse vorhanden
- **Deine hochgeladenen Bilder sind VERLOREN**, wenn:
  - Sie nur lokal gespeichert waren
  - Kein Docker Volume existiert
  - Keine Backups vorhanden sind

**Mögliche Rettung:**
1. Prüfe Docker Volumes (wenn Docker läuft)
2. Prüfe Datenbank auf URLs (vielleicht sind Metadaten noch da)
3. Prüfe Coolify Volumes (falls in Production deployed)

---

## 🛠️ LÖSUNGSVORSCHLÄGE

### ✅ **SOFORT-MASSNAHMEN**

#### 1. **Environment-Variablen hinzufügen**

Füge zu `.env` hinzu:
```bash
# Media Upload Configuration
UPLOAD_DIR=/Users/amziredzep/shopmarketsapp/shopmarkets.app/uploads
CDN_URL=https://cdn.shopmarkets.app

# Für API Service
VITE_CDN_URL=https://cdn.shopmarkets.app
```

#### 2. **Upload-Verzeichnisse erstellen**

```bash
mkdir -p uploads
mkdir -p services/api/uploads
chmod 755 uploads
chmod 755 services/api/uploads
```

#### 3. **SQL-Migration ausführen**

Prüfe zuerst die Datenbank:
```bash
# Mit PostgreSQL verbinden (lokal oder Production)
psql -h localhost -U postgres -d postgres -f check_media_db.sql

# Oder für Coolify/Production:
psql -h <DB_HOST> -U postgres -d postgres -f check_media_db.sql
```

Falls Tabellen fehlen:
```bash
# Führe Migrationen aus
psql -h localhost -U postgres -d postgres -f services/security/migrations/005_add_categories_media.sql
psql -h localhost -U postgres -d postgres -f services/api/migrations/create_media_folders.sql
```

#### 4. **Docker Volume für CDN konfigurieren**

Erstelle `docker-compose.cdn.yml`:
```yaml
version: '3.8'

services:
  cdn:
    build:
      context: ./services/cdn
      dockerfile: Dockerfile
    container_name: shopmarkets-cdn
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      # WICHTIG: Persistentes Volume für Uploads
      - ./uploads:/usr/share/nginx/html/uploads:ro
      # Oder für Production:
      # - cdn-uploads:/usr/share/nginx/html/uploads:ro
    environment:
      - NGINX_HOST=cdn.shopmarkets.app
      - NGINX_PORT=80

volumes:
  cdn-uploads:
    driver: local
```

#### 5. **API-Service Volume hinzufügen**

Falls du `docker-compose.yml` für API nutzt, füge hinzu:
```yaml
services:
  api:
    volumes:
      - ./uploads:/app/uploads
```

---

### 🔧 **SCHEMA-KONFLIKT BEHEBEN**

**Problem:** 2 verschiedene Definitionen für `media_folders`

**Lösung:** Erstelle eine konsolidierte Migration:

```sql
-- Konsolidierte media_folders Tabelle
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    path TEXT, -- Optional, für hierarchische Pfade
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stelle sicher, dass folder_id in media_files existiert
ALTER TABLE public.media_files 
ADD COLUMN IF NOT EXISTS folder_id UUID 
REFERENCES public.media_folders(id) ON DELETE SET NULL;

-- Indizes
CREATE INDEX IF NOT EXISTS idx_media_folders_user_id ON public.media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON public.media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_user_folder ON public.media_files(user_id, folder_id);
```

---

### 📋 **DATENBANK-PRÜFUNG DURCHFÜHREN**

**Nächster Schritt:** Führe SQL-Prüfung aus:

```bash
# Für lokale Datenbank:
PGPASSWORD=Testzugang10?20?30edzep123 psql -h localhost -U postgres -d postgres -f check_media_db.sql

# Oder für Coolify/Production:
# 1. Finde DB-Host in Coolify
# 2. Führe aus:
PGPASSWORD=<PRODUCTION_PASSWORD> psql -h <DB_HOST> -U postgres -d postgres -f check_media_db.sql
```

---

### 🚀 **PRODUCTION DEPLOYMENT (Coolify)**

Wenn du in Coolify deployst:

1. **Persistent Volume erstellen:**
   - In Coolify → Service → Volumes
   - Erstelle Volume: `/app/uploads` → `/data/uploads`

2. **Environment-Variablen setzen:**
   ```
   UPLOAD_DIR=/app/uploads
   CDN_URL=https://cdn.shopmarkets.app
   ```

3. **CDN-Service deployen:**
   - Erstelle neuen Service für CDN
   - Dockerfile: `services/cdn/Dockerfile`
   - Volume mounten: `/data/uploads:/usr/share/nginx/html/uploads:ro`
   - Domain: `cdn.shopmarkets.app`

---

## 📝 **NÄCHSTE SCHRITTE**

### Priorität 1: Datenbank prüfen
```bash
PGPASSWORD=Testzugang10?20?30edzep123 psql -h localhost -U postgres -d postgres -f check_media_db.sql
```

### Priorität 2: Verzeichnisse erstellen
```bash
mkdir -p uploads
chmod 755 uploads
```

### Priorität 3: Environment konfigurieren
```bash
echo "UPLOAD_DIR=uploads" >> .env
echo "CDN_URL=https://cdn.shopmarkets.app" >> .env
```

### Priorität 4: Daten wiederherstellen (falls möglich)
- Prüfe Coolify Volumes
- Prüfe Datenbank auf vorhandene URLs
- Prüfe Backups

---

## ❓ **FRAGEN AN DICH**

1. **Wo läuft deine Anwendung?**
   - Lokal (Docker Compose)?
   - Production (Coolify)?
   - Beides?

2. **Hast du Zugriff auf die Production-Datenbank?**
   - Können wir `check_media_db.sql` auf Production ausführen?

3. **Gibt es Backups der Uploads?**
   - In Coolify Volumes?
   - Lokale Backups?

4. **Soll ich die Reparatur durchführen?**
   - Verzeichnisse erstellen
   - Environment konfigurieren
   - Migrationen ausführen
   - Docker Compose aktualisieren

---

**Erstellt:** 2026-01-13 01:08 Uhr  
**Nächster Schritt:** Warte auf deine Antworten, dann starte ich die Reparatur! 🚀
