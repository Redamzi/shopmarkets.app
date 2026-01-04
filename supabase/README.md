# 🔐 Supabase Setup für ShopMarkets

Dieses Verzeichnis enthält alle Konfigurationsdateien und Scripts für die Self-Hosted Supabase Instanz.

---

## 🚀 Quick Start

### 1. Secrets generieren

```bash
cd supabase
./generate-secrets.sh
```

Das Script generiert automatisch:
- ✅ JWT Secrets
- ✅ ANON & SERVICE_ROLE Keys
- ✅ Postgres Password
- ✅ MinIO Credentials
- ✅ Komplette ENV-Liste in `supabase-env-variables.md`

### 2. Secrets in Coolify einfügen

1. Öffne `supabase/supabase-env-variables.md`
2. Kopiere den kompletten ENV-Block
3. Füge ihn in Coolify ein (Service → Environment Variables)
4. **WICHTIG:** Passe SMTP-Credentials manuell an!

### 3. SMTP konfigurieren (Optional)

Wenn du E-Mail-Versand brauchst (z.B. für Auth), passe diese Variablen an:

```bash
GOTRUE_SMTP_HOST=smtp.gmail.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=your-email@gmail.com
GOTRUE_SMTP_PASS=your-app-password
GOTRUE_SMTP_ADMIN_EMAIL=admin@shopmarkets.app
```

**Gmail App Password erstellen:**
1. Google Account → Security
2. 2-Step Verification aktivieren
3. App Passwords → Generate
4. Passwort kopieren und in `GOTRUE_SMTP_PASS` einfügen

### 4. Services in Coolify starten

**WICHTIG:** Exakt in dieser Reihenfolge starten (jeweils warten bis "healthy"):

1. ✅ `supabase-db`
2. ✅ `supabase-kong`
3. ✅ `supabase-auth`
4. ✅ `supabase-rest`
5. ✅ `supabase-meta` ← **KRITISCH für SQL Editor!**
6. ✅ `supabase-realtime`
7. ✅ `supabase-storage`
8. ✅ `supabase-studio`

### 5. Testen

1. Öffne: https://supabase.shopmarkets.app
2. Gehe zu **SQL Editor**
3. Führe aus:
```sql
CREATE TABLE public.test_table (
  id serial primary key,
  name text,
  created_at timestamp default now()
);
```
4. **Reload** die Seite → Tabelle muss noch da sein! ✅

---

## 📁 Verzeichnisstruktur

```
supabase/
├── generate-secrets.sh          # Script zur Secret-Generierung
├── supabase-env-variables.md    # Generierte ENV-Variablen (GITIGNORED!)
├── migrations/                   # SQL Migrations
│   └── 001_initial_schema.sql
├── seed.sql                      # Test-Daten
└── README.md                     # Diese Datei
```

---

## 🔧 Troubleshooting

### Problem: `supabase-meta` ist "exited" oder "unhealthy"

**Ursache:** Fehlende oder falsche ENV-Variablen

**Lösung:**
1. Prüfe ob alle `PG_META_*` Variablen gesetzt sind
2. Prüfe ob `POSTGRES_PASSWORD` korrekt ist
3. Prüfe ob `supabase-db` läuft und erreichbar ist
4. Starte `supabase-meta` neu

### Problem: SQL Editor speichert keine Tabellen

**Ursache:** `supabase-meta` läuft nicht oder Volume fehlt

**Lösung:**
1. Prüfe Status von `supabase-meta`
2. Stelle sicher, dass Postgres ein **persistentes Volume** hat:
   - Container Path: `/var/lib/postgresql/data`
   - Type: Volume (nicht Bind Mount)
3. Starte Services in korrekter Reihenfolge neu

### Problem: Studio zeigt "includes of undefined" Fehler

**Ursache:** `NEXT_PUBLIC_*` Variablen fehlen

**Lösung:**
Stelle sicher, dass diese Variablen gesetzt sind:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-key>
```

### Problem: Auth funktioniert nicht

**Ursache:** JWT Secrets stimmen nicht überein

**Lösung:**
Alle drei müssen **identisch** sein:
```bash
JWT_SECRET=<same-value>
PGRST_JWT_SECRET=<same-value>
GOTRUE_JWT_SECRET=<same-value>
```

---

## 🔐 Security Best Practices

### ⚠️ NIEMALS committen:
- `supabase-env-variables.md` (ist bereits in `.gitignore`)
- Jegliche Secrets oder Passwörter
- Production API Keys

### ✅ Empfohlene Maßnahmen:
1. **Secrets rotieren** alle 90 Tage
2. **Separate Secrets** für Dev/Staging/Production
3. **Backup** der ENV-Variablen in sicherem Password Manager
4. **2FA aktivieren** für Coolify & Supabase Studio
5. **IP Whitelisting** für Admin-Zugriff

---

## 📊 Monitoring

### Health Checks

Alle Services sollten "healthy" sein:

```bash
# In Coolify prüfen:
Service Status → Alle grün ✅
```

### Logs prüfen

Bei Problemen Logs checken:
```bash
# In Coolify:
Service → Logs → Letzte 100 Zeilen
```

Wichtige Log-Meldungen:
- ✅ `"Listening on port 8080"` (Meta)
- ✅ `"database system is ready to accept connections"` (Postgres)
- ❌ `"connection refused"` → Service nicht erreichbar
- ❌ `"authentication failed"` → Falsche Credentials

---

## 🔄 Updates & Migrations

### Neue Migration erstellen

```bash
cd supabase/migrations
touch 002_add_products_table.sql
```

Beispiel Migration:
```sql
-- 002_add_products_table.sql
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: User kann nur eigene Produkte sehen
CREATE POLICY "Users can view own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Migration ausführen

1. Öffne Supabase Studio → SQL Editor
2. Kopiere Migration-SQL
3. Execute
4. Prüfe ob Tabelle existiert

---

## 📞 Support

Bei Problemen:
1. Prüfe diese README
2. Checke Coolify Logs
3. Prüfe [Supabase Docs](https://supabase.com/docs/guides/self-hosting)
4. Kontaktiere Team

---

**Letzte Aktualisierung:** 2026-01-04
**Version:** 1.0.0
