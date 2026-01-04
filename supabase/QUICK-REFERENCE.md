# ⚡ Supabase Coolify - Quick Reference

## 🚀 Schnellstart (5 Minuten)

### 1. Secrets kopieren
```bash
# Öffne:
supabase/supabase-env-variables.md

# Kopiere den kompletten ENV-Block
```

### 2. In Coolify einfügen
```
Coolify → Supabase → Settings → Environment Variables → Bulk Import
```

### 3. SMTP anpassen
```bash
GOTRUE_SMTP_USER=deine-email@gmail.com
GOTRUE_SMTP_PASS=dein-app-password
```

### 4. Services starten (Reihenfolge!)
```
1. supabase-db       → warten bis healthy
2. supabase-kong     → warten bis healthy
3. supabase-auth     → warten bis healthy
4. supabase-rest     → warten bis healthy
5. supabase-meta     → warten bis healthy ← WICHTIG!
6. supabase-realtime → warten bis healthy
7. supabase-storage  → warten bis healthy
8. supabase-studio   → warten bis healthy
```

### 5. Testen
```sql
-- In Studio SQL Editor:
CREATE TABLE public.test (id serial primary key);
-- Reload → Tabelle bleibt ✅
```

---

## 🔑 Wichtigste Variablen

### Müssen identisch sein:
```bash
JWT_SECRET=<same-value>
PGRST_JWT_SECRET=<same-value>
GOTRUE_JWT_SECRET=<same-value>
```

### Müssen identisch sein:
```bash
POSTGRES_PASSWORD=<same-value>
PGPASSWORD=<same-value>
PG_META_DB_PASSWORD=<same-value>
```

### URLs (NICHT verwechseln!):
```bash
# Extern (für Browser/Frontend):
PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app

# Intern (für Docker Services):
INTERNAL_SUPABASE_URL=http://supabase-kong:8000
```

---

## 🔧 Häufige Probleme

### supabase-meta exited
```bash
# Prüfen:
1. Ist supabase-db running?
2. Stimmt PG_META_DB_PASSWORD?
3. Sind alle PG_META_* Variablen gesetzt?

# Logs checken:
Coolify → supabase-meta → Logs
```

### Studio: "includes of undefined"
```bash
# Fehlt:
NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopmarkets.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-key>
```

### Tabellen verschwinden
```bash
# Volume fehlt!
supabase-db → Volumes → /var/lib/postgresql/data
Type: Volume (NICHT Bind Mount)
```

---

## ✅ Status Check

Alle Services müssen "healthy" sein:

```
✅ supabase-db
✅ supabase-kong
✅ supabase-auth
✅ supabase-rest
✅ supabase-meta       ← Das war das Problem!
✅ supabase-realtime
✅ supabase-storage
✅ supabase-studio
```

---

## 📚 Vollständige Anleitungen

- **Setup:** `supabase/README.md`
- **Deployment:** `supabase/COOLIFY-DEPLOYMENT.md`
- **Secrets:** `supabase/supabase-env-variables.md` (gitignored)

---

## 🆘 Notfall-Reset

```bash
# Alle Services stoppen
# Alle ENV-Variablen löschen
# Neue Secrets generieren:
cd supabase
./generate-secrets.sh

# Neue ENV-Variablen einfügen
# Services in Reihenfolge starten
```

---

**Version:** 1.0 | **Datum:** 2026-01-04
