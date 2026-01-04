# 🚀 Coolify Setup Guide - Supabase Secrets einfügen

## 📋 Schritt-für-Schritt Anleitung

### Vorbereitung
1. ✅ Öffne die Datei `supabase/supabase-env-variables.md` in deinem Editor
2. ✅ Halte sie bereit zum Kopieren

---

## 1️⃣ Coolify öffnen

1. Gehe zu deiner Coolify Installation
2. Login mit deinen Credentials
3. Navigiere zu deinem **Supabase Projekt**

---

## 2️⃣ Environment Variables öffnen

```
Coolify Dashboard
  └─ Projects
      └─ ShopMarkets
          └─ Supabase
              └─ ⚙️ Settings
                  └─ 📝 Environment Variables  ← HIER KLICKEN
```

---

## 3️⃣ Secrets einfügen

### Option A: Bulk Import (Empfohlen)

1. **Klicke auf:** `+ Add Multiple` oder `Bulk Import`
2. **Kopiere** den kompletten ENV-Block aus `supabase-env-variables.md`
   - Beginnt mit: `# ============================================`
   - Endet mit: `FUNCTIONS_VERIFY_JWT=false`
3. **Füge ein** in das Textfeld
4. **Klicke:** `Import` oder `Save`

### Option B: Einzeln einfügen (Falls Bulk nicht verfügbar)

Für jede Variable:
1. **Klicke:** `+ Add Variable`
2. **Name:** z.B. `JWT_SECRET`
3. **Value:** Kopiere den Wert aus der MD-Datei
4. **Klicke:** `Add`

---

## 4️⃣ SMTP Credentials anpassen

**WICHTIG:** Diese Werte musst du **manuell** anpassen!

Suche nach diesen Variablen und ersetze die Werte:

```bash
GOTRUE_SMTP_HOST=smtp.gmail.com          # Dein SMTP Server
GOTRUE_SMTP_PORT=587                     # Port (meist 587 oder 465)
GOTRUE_SMTP_USER=your-email@gmail.com   # Deine E-Mail
GOTRUE_SMTP_PASS=your-app-password      # App-Passwort (NICHT dein normales Passwort!)
GOTRUE_SMTP_ADMIN_EMAIL=admin@shopmarkets.app  # Admin E-Mail
```

### Gmail App-Passwort erstellen:
1. Gehe zu: https://myaccount.google.com/security
2. Aktiviere **2-Step Verification**
3. Gehe zu: **App Passwords**
4. Wähle: **Mail** + **Other (Custom name)**
5. Name: `Supabase ShopMarkets`
6. **Generate** → Kopiere das Passwort
7. Füge es in `GOTRUE_SMTP_PASS` ein

---

## 5️⃣ Variablen überprüfen

### Kritische Variablen checken:

| Variable | Wert | Status |
|----------|------|--------|
| `JWT_SECRET` | 32+ Zeichen | ✅ |
| `PGRST_JWT_SECRET` | = JWT_SECRET | ✅ |
| `GOTRUE_JWT_SECRET` | = JWT_SECRET | ✅ |
| `POSTGRES_PASSWORD` | 24+ Zeichen | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.shopmarkets.app | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT Token | ✅ |
| `PG_META_DB_PASSWORD` | = POSTGRES_PASSWORD | ✅ |

**Alle drei JWT Secrets müssen identisch sein!**

---

## 6️⃣ Speichern & Deployment

1. **Klicke:** `Save` oder `Update Environment Variables`
2. **Warte** auf Bestätigung: "Environment variables updated"
3. **Optional:** Klicke `Redeploy` (oder fahre mit Schritt 7 fort)

---

## 7️⃣ Services neu starten (WICHTIG!)

**KRITISCH:** Services müssen in **exakter Reihenfolge** gestartet werden!

### Methode 1: Über Coolify UI

1. **Stoppe alle Services:**
   - Gehe zu jedem Service
   - Klicke `Stop`
   - Warte bis Status = "stopped"

2. **Starte in dieser Reihenfolge:**

   **a) supabase-db**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅
   - Dauer: ~30-60 Sekunden

   **b) supabase-kong**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅
   - Dauer: ~10-20 Sekunden

   **c) supabase-auth**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅
   - Dauer: ~10-20 Sekunden

   **d) supabase-rest**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅
   - Dauer: ~10-20 Sekunden

   **e) supabase-meta** ← **KRITISCH!**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅
   - Dauer: ~10-20 Sekunden
   - **Falls "exited":** Prüfe Logs!

   **f) supabase-realtime**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅

   **g) supabase-storage**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅

   **h) supabase-studio**
   - Klicke `Start`
   - **Warte** bis Status = "running (healthy)" ✅

### Methode 2: Über Docker Compose (Falls verfügbar)

```bash
# SSH in deinen Server
ssh user@your-server.com

# Navigiere zum Supabase Verzeichnis
cd /path/to/supabase

# Stoppe alle Services
docker-compose down

# Starte in korrekter Reihenfolge
docker-compose up -d supabase-db
sleep 30  # Warte 30 Sekunden

docker-compose up -d supabase-kong
sleep 10

docker-compose up -d supabase-auth
sleep 10

docker-compose up -d supabase-rest
sleep 10

docker-compose up -d supabase-meta
sleep 10

docker-compose up -d supabase-realtime supabase-storage supabase-studio
```

---

## 8️⃣ Status überprüfen

### In Coolify Dashboard:

Alle Services sollten **grün** sein:

```
✅ supabase-db          running (healthy)
✅ supabase-kong        running (healthy)
✅ supabase-auth        running (healthy)
✅ supabase-rest        running (healthy)
✅ supabase-meta        running (healthy)  ← DAS WAR DAS PROBLEM!
✅ supabase-realtime    running (healthy)
✅ supabase-storage     running (healthy)
✅ supabase-studio      running (healthy)
```

### Logs checken:

Für jeden Service:
1. Klicke auf den Service
2. Gehe zu `Logs`
3. Prüfe auf Fehler

**Erwartete Log-Meldungen:**

**supabase-db:**
```
database system is ready to accept connections
```

**supabase-meta:**
```
Listening on port 8080
```

**supabase-rest:**
```
Listening on port 3000
Schema cache loaded
```

**supabase-studio:**
```
ready - started server on 0.0.0.0:3000
```

---

## 9️⃣ Funktionstest

### Test 1: Studio öffnen

1. Öffne: https://supabase.shopmarkets.app
2. **Erwartung:** Studio lädt ohne Fehler ✅
3. **Falls Fehler:** Prüfe Browser Console (F12)

### Test 2: SQL Editor

1. Gehe zu: **SQL Editor**
2. Führe aus:
```sql
CREATE TABLE public.test_deployment (
  id serial primary key,
  name text,
  created_at timestamp default now()
);
```
3. **Klicke:** `Run`
4. **Erwartung:** "Success" ✅
5. **Reload** die Seite (F5)
6. **Erwartung:** Tabelle ist noch da! ✅

### Test 3: Table Editor

1. Gehe zu: **Table Editor**
2. **Erwartung:** Du siehst `test_deployment` ✅
3. Klicke auf die Tabelle
4. **Erwartung:** Spalten werden angezeigt ✅

### Test 4: API Test

```bash
# In deinem Terminal:
curl https://supabase.shopmarkets.app/rest/v1/test_deployment \
  -H "apikey: DEIN_ANON_KEY" \
  -H "Authorization: Bearer DEIN_ANON_KEY"
```

**Erwartung:** `[]` (leeres Array) ✅

---

## 🔧 Troubleshooting

### Problem: supabase-meta ist "exited"

**Lösung:**
1. Klicke auf `supabase-meta`
2. Gehe zu `Logs`
3. Suche nach Fehlern:

**Häufige Fehler:**

**a) "connection refused" oder "could not connect to server"**
```
Ursache: supabase-db läuft nicht oder ist nicht erreichbar
Lösung: 
  1. Prüfe ob supabase-db "running (healthy)" ist
  2. Starte supabase-db neu
  3. Warte 30 Sekunden
  4. Starte supabase-meta neu
```

**b) "password authentication failed"**
```
Ursache: PG_META_DB_PASSWORD stimmt nicht mit POSTGRES_PASSWORD überein
Lösung:
  1. Prüfe beide Variablen in Environment Variables
  2. Stelle sicher, dass sie identisch sind
  3. Speichern & supabase-meta neu starten
```

**c) "missing environment variable"**
```
Ursache: Eine PG_META_* Variable fehlt
Lösung:
  1. Prüfe ob alle diese Variablen gesetzt sind:
     - PG_META_DB_HOST=supabase-db
     - PG_META_DB_PORT=5432
     - PG_META_DB_NAME=postgres
     - PG_META_DB_USER=postgres
     - PG_META_DB_PASSWORD=<dein-password>
     - PG_META_PORT=8080
  2. Speichern & neu starten
```

### Problem: Studio zeigt "includes of undefined"

**Lösung:**
```
Prüfe ob diese Variablen gesetzt sind:
  NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-key>
```

### Problem: Tabellen verschwinden nach Reload

**Lösung:**
```
1. Prüfe ob supabase-db ein persistentes Volume hat:
   - Gehe zu supabase-db → Volumes
   - Container Path: /var/lib/postgresql/data
   - Type: Volume (NICHT Bind Mount)
2. Falls nicht: Volume erstellen und Service neu starten
```

---

## ✅ Erfolgs-Checkliste

Nach dem Setup sollten alle Punkte ✅ sein:

- [ ] Alle 8 Services sind "running (healthy)"
- [ ] Studio öffnet ohne Fehler
- [ ] SQL Editor funktioniert
- [ ] Tabellen bleiben nach Reload erhalten
- [ ] Table Editor zeigt Tabellen an
- [ ] API antwortet (curl test)
- [ ] Keine Fehler in den Logs

---

## 📞 Support

Falls Probleme auftreten:

1. **Prüfe Logs** aller Services
2. **Screenshot** vom Status-Dashboard
3. **Kopiere** relevante Log-Zeilen
4. **Kontaktiere** Team mit diesen Infos

---

**Erstellt:** 2026-01-04
**Für:** ShopMarkets Supabase Deployment
**Version:** 1.0
