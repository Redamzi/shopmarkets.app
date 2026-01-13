# 🎯 COOLIFY MEDIATHEK-DIAGNOSE
**Datum:** 2026-01-13 01:15 Uhr  
**VPS:** 91.99.53.147  
**Coolify Projekt:** https://hotel.voyanero.com/project/xck484s44gkgocwwgkog448o

---

## ✅ **COOLIFY-KONFIGURATION GEFUNDEN:**

### **Laufende Services:**
- ✅ `ai-generator` - https://ai.shopmarkets.app
- ✅ `cdn-storage-app` - **https://cdn.shopmarkets.app** ← CDN Service!
- ✅ `Service API` - https://api.shopmarkets.app
- ✅ `Dashboard Service` - https://start.shopmarkets.app
- ✅ `security` - https://security.shopmarkets.app
- ✅ `postgresql-database` - Postgres DB
- ✅ `db-shopmarkets-app` - CloudBeaver (DB Management)

---

## 📁 **PERSISTENT STORAGE KONFIGURATION:**

### **CDN SPEICHER APP:**
```
Volume Name: tgg04cws4co40g804sogcwok-cdn-storage
Host Path: /cdn-storage-app
Container Path: /usr/share/nginx/html/uploads
```

### **Service API:**
```
Volume Name: y0ssgws0o8gwc8oo8408oow8-cdn-storage
Host Path: /cdn-storage-app
Container Path: /app/uploads
```

**🎉 WICHTIG:** Beide Services nutzen **dasselbe Host-Verzeichnis** `/cdn-storage-app`!

---

## ⚙️ **ENVIRONMENT-VARIABLEN (Service API):**

### **Gefunden:**
- ✅ `CDN_URL=https://cdn.shopmarkets.app`
- ✅ `DB_HOST=91.99.53.147`
- ✅ `DB_NAME=postgres`

### **Fehlend:**
- ❌ `UPLOAD_DIR` - **NICHT GESETZT!**

---

## 🔍 **DIAGNOSE:**

### **Problem 1: UPLOAD_DIR fehlt**
Der API-Service hat keine `UPLOAD_DIR` Environment-Variable. Das bedeutet:
- Code verwendet Fallback: `UPLOAD_DIR = 'uploads'` (relatives Verzeichnis)
- Sollte sein: `UPLOAD_DIR = '/app/uploads'` (absoluter Pfad)

### **Problem 2: Dateien könnten auf VPS sein**
Die Metadaten (7 Dateien) sind in der Datenbank, aber die physischen Dateien könnten:
- ✅ In `/cdn-storage-app` auf dem VPS sein (wenn Volume funktioniert)
- ❌ Verloren sein (wenn Volume nicht korrekt gemountet war)

---

## 🛠️ **REPARATUR-PLAN:**

### **Schritt 1: Prüfe VPS-Verzeichnis**
```bash
# SSH auf VPS
ssh root@91.99.53.147

# Prüfe ob Verzeichnis existiert
ls -la /cdn-storage-app

# Prüfe ob Dateien drin sind
find /cdn-storage-app -type f -name "*.jpg" -o -name "*.png" -o -name "*.jpeg"

# Zeige Verzeichnis-Struktur
tree /cdn-storage-app 2>/dev/null || find /cdn-storage-app -type d
```

### **Schritt 2: Füge UPLOAD_DIR zu Service API hinzu**

**In Coolify:**
1. Gehe zu: Service API → Environment Variables
2. Füge hinzu:
   ```
   UPLOAD_DIR=/app/uploads
   ```
3. Restart Service API

### **Schritt 3: Prüfe CDN-Konfiguration**

**In CDN Container:**
```bash
# Prüfe nginx.conf
docker exec -it <cdn_container_name> cat /etc/nginx/conf.d/default.conf

# Prüfe ob Uploads-Verzeichnis gemountet ist
docker exec -it <cdn_container_name> ls -la /usr/share/nginx/html/uploads
```

### **Schritt 4: Teste Upload**

**Nach Reparatur:**
1. Öffne Dashboard: https://start.shopmarkets.app
2. Gehe zur Mediathek
3. Lade Testbild hoch
4. Prüfe ob URL funktioniert: https://cdn.shopmarkets.app/USER_ID/FILENAME.jpg

---

## 📋 **SOFORT-AKTIONEN:**

### **1. VPS-Zugang prüfen**
```bash
ssh root@91.99.53.147
```

Wenn du keinen SSH-Zugang hast, können wir über Coolify Terminal arbeiten:
- Coolify → Service API → Terminal
- Coolify → CDN SPEICHER APP → Terminal

### **2. Prüfe Dateien im API-Container**
```bash
# In Coolify: Service API → Terminal
ls -la /app/uploads
find /app/uploads -type f
```

### **3. Prüfe Dateien im CDN-Container**
```bash
# In Coolify: CDN SPEICHER APP → Terminal
ls -la /usr/share/nginx/html/uploads
find /usr/share/nginx/html/uploads -type f
```

### **4. Hole Datei-URLs aus Datenbank**
```bash
# In Coolify: postgresql-database → Terminal (oder CloudBeaver)
psql -U postgres -d postgres -c "SELECT url, external_id, filename FROM public.media_files;"
```

---

## 🎯 **ERWARTETE DATEI-STRUKTUR:**

### **Auf VPS Host:**
```
/cdn-storage-app/
├── <USER_ID_1>/
│   ├── image1-123456789.jpg
│   └── image2-987654321.png
└── <USER_ID_2>/
    └── image3-456789123.jpg
```

### **Im API-Container:**
```
/app/uploads/
├── <USER_ID_1>/
│   ├── image1-123456789.jpg
│   └── image2-987654321.png
└── <USER_ID_2>/
    └── image3-456789123.jpg
```

### **Im CDN-Container:**
```
/usr/share/nginx/html/uploads/
├── <USER_ID_1>/
│   ├── image1-123456789.jpg
│   └── image2-987654321.png
└── <USER_ID_2>/
    └── image3-456789123.jpg
```

**Alle 3 Pfade sollten auf dasselbe Verzeichnis zeigen!**

---

## 🚨 **KRITISCHE FRAGEN:**

### **1. Sind die Dateien noch da?**
Führe auf VPS aus:
```bash
ls -la /cdn-storage-app
```

**Wenn leer:** Dateien sind verloren 😢  
**Wenn Dateien da sind:** Nur Konfiguration reparieren! 🎉

### **2. Funktioniert das Volume-Mounting?**
Teste:
```bash
# Im API-Container (über Coolify Terminal)
echo "test" > /app/uploads/test.txt

# Im CDN-Container (über Coolify Terminal)
cat /usr/share/nginx/html/uploads/test.txt
```

**Wenn "test" erscheint:** Volume funktioniert! ✅  
**Wenn Fehler:** Volume-Konfiguration ist kaputt ❌

---

## 📝 **NÄCHSTE SCHRITTE:**

### **Option A: Du hast SSH-Zugang**
1. SSH auf VPS: `ssh root@91.99.53.147`
2. Prüfe: `ls -la /cdn-storage-app`
3. Schicke mir die Ausgabe

### **Option B: Kein SSH-Zugang**
1. Öffne Coolify: Service API → Terminal
2. Führe aus: `ls -la /app/uploads`
3. Schicke mir Screenshot

### **Option C: Ich mache es**
Gib mir:
- SSH-Zugang zum VPS, ODER
- Coolify-Login-Daten

Dann repariere ich alles direkt! 🚀

---

**Erstellt:** 2026-01-13 01:15 Uhr  
**Status:** Warte auf VPS-Verzeichnis-Prüfung 🔍
