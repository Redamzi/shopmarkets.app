# ============================================
# 🎯 VPS MEDIATHEK-ANALYSE
# ============================================
**Datum:** 2026-01-13 01:13 Uhr  
**Status:** ✅ DATENBANK OK - DATEIEN MÜSSEN LOKALISIERT WERDEN

---

## ✅ **DATENBANK-STATUS (VPS):**

Aus deinen Screenshots kann ich sehen:

### **Tabellen existieren:**
- ✅ `media_files` - **7 Dateien** vorhanden
- ✅ `media_folders` - **5 Ordner** vorhanden

### **Schema `media_files`:**
```
- id (uuid)
- user_id (text) ⚠️ ACHTUNG: Sollte UUID sein!
- folder_id (uuid, nullable)
- filename (text)
- url (text)
- mime_type (text, nullable)
- size_bytes (bigint, nullable)
- is_active (boolean, default: true)
- source (text, nullable, default: 'manual')
- external_id (text, nullable) ← WICHTIG: Relativer Pfad!
- created_at (timestamp with time zone)
```

### **Schema `media_folders`:**
```
- id (uuid)
- user_id (text) ⚠️ ACHTUNG: Sollte UUID sein!
- name (text)
- parent_id (uuid, nullable)
- created_at (timestamp with time zone)
```

**⚠️ HINWEIS:** `user_id` ist als `text` statt `uuid` definiert - das ist inkonsistent!

---

## 🔍 **WAS WIR JETZT TUN MÜSSEN:**

### **1. Hole die vollständigen Datei-Details aus der Datenbank**

Führe auf dem VPS aus:
```bash
# Verbinde mit der Datenbank und hole alle URLs
PGPASSWORD=<DEIN_PASSWORD> psql -h localhost -U postgres -d postgres -f find_media_files_on_vps.sql
```

Das wird uns zeigen:
- Welche URLs in der Datenbank gespeichert sind
- Wo die Dateien laut `external_id` liegen sollten
- Welche Ordner existieren

### **2. Finde die physischen Dateien auf dem VPS**

**Option A: SSH auf VPS und manuell suchen**
```bash
# Verbinde mit VPS
ssh root@<VPS_IP>

# Suche nach Upload-Verzeichnissen
sudo find / -type d -name 'uploads' 2>/dev/null

# Suche nach Bild-Dateien
sudo find / -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.jpeg' \) ! -path '*/node_modules/*' 2>/dev/null | head -20

# Prüfe Docker Volumes
docker volume ls
docker volume inspect shopmarkets_uploads 2>/dev/null || echo "Volume nicht gefunden"

# Prüfe Coolify Persistent Storage
ls -la /data/coolify/applications/*/persistent-storage/ 2>/dev/null
```

**Option B: Gib mir VPS-Zugang**
Wenn du mir SSH-Zugang gibst, kann ich direkt suchen.

---

## 🎯 **WAHRSCHEINLICHE SZENARIEN:**

### **Szenario 1: Dateien sind in Docker Volume**
```bash
# Auf VPS:
docker volume ls | grep -E "(upload|media|cdn)"
docker volume inspect <volume_name>

# Dateien könnten hier sein:
/var/lib/docker/volumes/<volume_name>/_data/
```

### **Szenario 2: Dateien sind in Coolify Persistent Storage**
```bash
# Auf VPS:
ls -la /data/coolify/applications/
ls -la /data/coolify/applications/<app_id>/persistent-storage/
```

### **Szenario 3: Dateien sind in Container-Verzeichnis**
```bash
# Auf VPS:
docker ps | grep -E "(api|cdn)"
docker exec -it <container_name> ls -la /app/uploads
docker exec -it <container_name> find /app -name "*.jpg"
```

### **Szenario 4: Dateien sind verloren** 😢
Wenn keine der obigen Methoden funktioniert, sind die Dateien wahrscheinlich verloren.

---

## 🛠️ **REPARATUR-PLAN:**

### **Schritt 1: Lokalisiere die Dateien**
Führe die Suchbefehle auf dem VPS aus (siehe oben).

### **Schritt 2: Konfiguriere Upload-Pfad**
Je nachdem wo die Dateien sind:

**Für Docker Volume:**
```yaml
# docker-compose.yml oder Coolify Volume Config
volumes:
  - shopmarkets-uploads:/app/uploads
```

**Für Coolify Persistent Storage:**
```
# In Coolify UI:
Persistent Storage: /app/uploads → /data/coolify/.../uploads
```

### **Schritt 3: Konfiguriere CDN**
```yaml
# docker-compose.cdn.yml
services:
  cdn:
    volumes:
      - shopmarkets-uploads:/usr/share/nginx/html/uploads:ro
      # Oder für Coolify:
      # - /data/coolify/.../uploads:/usr/share/nginx/html/uploads:ro
```

### **Schritt 4: Environment-Variablen setzen**
```bash
# In Coolify oder .env auf VPS:
UPLOAD_DIR=/app/uploads
CDN_URL=https://cdn.shopmarkets.app
```

### **Schritt 5: Services neu starten**
```bash
# Auf VPS:
docker-compose restart api
docker-compose restart cdn
# Oder in Coolify: Restart Services
```

---

## 📋 **SOFORT-AKTIONEN:**

### **1. Hole Datei-Details aus Datenbank**
```sql
-- Führe auf VPS aus:
SELECT url, external_id, filename FROM public.media_files;
```

Das zeigt uns die erwarteten Pfade.

### **2. Prüfe ob API-Service läuft**
```bash
# Auf VPS:
docker ps | grep api
curl http://localhost:4000/health
```

### **3. Prüfe ob CDN-Service läuft**
```bash
# Auf VPS:
docker ps | grep cdn
curl http://localhost:8080/
```

### **4. Teste einen Upload**
```bash
# Auf VPS, im API-Container:
docker exec -it <api_container> ls -la /app/uploads
docker exec -it <api_container> ls -la uploads/
```

---

## ❓ **FRAGEN AN DICH:**

1. **Hast du SSH-Zugang zum VPS?**
   - Wenn ja, führe die Suchbefehle aus
   - Oder gib mir Zugang, damit ich suchen kann

2. **Nutzt du Coolify für Deployment?**
   - Wenn ja, welche Application ID?
   - Sind Persistent Volumes konfiguriert?

3. **Welche Container laufen auf dem VPS?**
   ```bash
   docker ps
   ```

4. **Kannst du mir die Ausgabe dieser Befehle schicken?**
   ```bash
   # 1. Finde Upload-Verzeichnisse
   sudo find / -type d -name 'uploads' 2>/dev/null
   
   # 2. Liste Docker Volumes
   docker volume ls
   
   # 3. Zeige laufende Container
   docker ps
   ```

---

## 🎯 **NÄCHSTER SCHRITT:**

**Bitte führe auf dem VPS aus:**
```bash
# 1. Hole Datei-URLs aus Datenbank
PGPASSWORD=<PASSWORD> psql -h localhost -U postgres -d postgres -c "SELECT url, external_id, filename FROM public.media_files;"

# 2. Suche nach Upload-Verzeichnissen
sudo find / -type d -name 'uploads' 2>/dev/null

# 3. Liste Docker Volumes
docker volume ls
```

**Schicke mir die Ausgabe, dann kann ich:**
- Die genaue Position der Dateien identifizieren
- Die korrekte Konfiguration erstellen
- Die Mediathek vollständig reparieren

---

**Erstellt:** 2026-01-13 01:13 Uhr  
**Status:** Warte auf VPS-Informationen 🔍
