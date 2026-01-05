# Automatische Datenbank-Migration

## Problem gelöst! 🎉

Sie werden nicht mehr jedes Mal nach der Datenbank-Authentifizierung gefragt.

## Einmalige Einrichtung

### 1. Passwort-Datei erstellen

Erstellen Sie die Datei `.env.db` im Projekt-Root:

```bash
cd /Users/amziredzep/shopmarketsapp/shopmarkets.app
nano .env.db
```

Fügen Sie Ihr Datenbank-Passwort ein:

```bash
PGPASSWORD=IHR_DATENBANK_PASSWORT
```

Speichern Sie mit `Ctrl+O`, `Enter`, `Ctrl+X`

**WICHTIG:** Diese Datei ist in `.gitignore` und wird NICHT zu Git committed!

### 2. Alternativ: Automatische Erstellung

Das Script fragt beim ersten Mal nach dem Passwort und erstellt `.env.db` automatisch:

```bash
./run-migration.sh services/security/migrations/003_add_trusted_devices.sql
```

## Verwendung

### Migration ausführen:

```bash
./run-migration.sh services/security/migrations/DATEINAME.sql
```

### Beispiel:

```bash
# Trusted Devices Migration
./run-migration.sh services/security/migrations/003_add_trusted_devices.sql
```

### Alle verfügbaren Migrationen anzeigen:

```bash
./run-migration.sh
```

## Vorteile

✅ **Kein wiederholtes Passwort-Eingeben**  
✅ **Schnelle Migration-Ausführung**  
✅ **Automatisches Logging** (`.migration-log`)  
✅ **Sicher** (Passwort nicht in Git)  
✅ **Bestätigung vor Ausführung**  

## Sicherheit

- ✅ `.env.db` ist in `.gitignore`
- ✅ Datei-Permissions: `600` (nur Sie können lesen)
- ✅ Passwort wird nicht in Logs gespeichert
- ✅ Keine Credentials im Code

## Migration-Log

Alle ausgeführten Migrationen werden in `.migration-log` protokolliert:

```bash
cat .migration-log
```

Beispiel:
```
2026-01-05 13:05:00 - services/security/migrations/003_add_trusted_devices.sql
```

## Troubleshooting

### "Permission denied"
```bash
chmod +x run-migration.sh
```

### "psql: command not found"
PostgreSQL Client installieren:
```bash
brew install postgresql
```

### "Connection refused"
Prüfen Sie die Verbindungsdaten in `run-migration.sh`:
- DB_HOST="91.99.53.147"
- DB_PORT="5433"
- DB_NAME="postgres"
- DB_USER="postgres"

## Manuelle Migration (falls Script nicht funktioniert)

```bash
export PGPASSWORD='IHR_PASSWORT'
psql -h 91.99.53.147 -p 5433 -U postgres -d postgres -f services/security/migrations/003_add_trusted_devices.sql
```

---

**Jetzt können Sie Migrationen mit einem Befehl ausführen!** 🚀
