# Trusted Devices Migration

## Beschreibung
Diese Migration fügt die Funktionalität "Diesem Gerät vertrauen" hinzu, damit Benutzer auf vertrauenswürdigen Geräten nicht jedes Mal einen 2FA-Code eingeben müssen.

## Datenbank-Migration ausführen

### Option 1: Über psql (lokal oder remote)
```bash
psql -h localhost -U postgres -d shopmarkets < services/security/migrations/003_add_trusted_devices.sql
```

### Option 2: Über Supabase SQL Editor
1. Öffnen Sie Supabase Studio
2. Gehen Sie zu SQL Editor
3. Kopieren Sie den Inhalt von `003_add_trusted_devices.sql`
4. Führen Sie das SQL aus

### Option 3: Über pgAdmin
1. Verbinden Sie sich mit der Datenbank
2. Öffnen Sie Query Tool
3. Laden Sie `003_add_trusted_devices.sql`
4. Führen Sie das SQL aus

## Funktionsweise

### Frontend
- **Login Step 1**: Sendet Device Fingerprint mit E-Mail/Passwort
  - Wenn Gerät vertraut ist → Direkter Login ohne 2FA
  - Wenn Gerät nicht vertraut ist → 2FA-Code wird gesendet

- **Login Step 2**: Benutzer kann "Diesem Gerät vertrauen" aktivieren
  - Checkbox wird angezeigt
  - Gerät wird für 30 Tage gespeichert
  - Device Fingerprint wird generiert aus:
    - User Agent
    - Sprache
    - Plattform
    - Bildschirmauflösung
    - Zeitzone
    - Canvas Fingerprint

### Backend
- **Trusted Devices Tabelle**: Speichert vertrauenswürdige Geräte
  - `device_fingerprint`: Eindeutiger Hash des Geräts
  - `expires_at`: Ablaufdatum (30 Tage)
  - `last_used_at`: Letzter Login
  - `is_active`: Kann manuell deaktiviert werden

- **Login-Flow**:
  1. User gibt E-Mail/Passwort ein
  2. Backend prüft ob Gerät vertraut ist
  3. Wenn ja → JWT Token wird direkt zurückgegeben
  4. Wenn nein → 2FA-Code wird per E-Mail gesendet
  5. Nach erfolgreicher 2FA → Optional: Gerät als vertraut speichern

## Sicherheit

### Device Fingerprinting
- Kombiniert mehrere Browser-Eigenschaften
- Nicht 100% eindeutig, aber ausreichend für Convenience-Feature
- Kann durch Browser-Updates ändern

### Ablauf & Verwaltung
- Geräte laufen nach 30 Tagen ab
- Benutzer können Geräte in Settings verwalten (TODO)
- Geräte können manuell widerrufen werden

### Best Practices
- Nur für vertrauenswürdige Geräte aktivieren
- Nicht auf öffentlichen Computern verwenden
- Regelmäßige Bereinigung abgelaufener Geräte

## Testing

### Manueller Test
1. Login mit E-Mail/Passwort
2. 2FA-Code eingeben
3. "Diesem Gerät vertrauen" aktivieren
4. Ausloggen
5. Erneut einloggen → Kein 2FA-Code erforderlich

### SQL-Abfragen zum Testen

```sql
-- Alle vertrauenswürdigen Geräte anzeigen
SELECT 
    u.email,
    td.device_name,
    td.device_fingerprint,
    td.last_used_at,
    td.expires_at,
    td.is_active
FROM public.trusted_devices td
JOIN public.users u ON td.user_id = u.id
ORDER BY td.last_used_at DESC;

-- Vertrauenswürdige Geräte für einen User
SELECT * FROM public.trusted_devices 
WHERE user_id = 'USER_ID_HIER';

-- Gerät manuell widerrufen
UPDATE public.trusted_devices 
SET is_active = false 
WHERE id = 'DEVICE_ID_HIER';

-- Abgelaufene Geräte löschen
DELETE FROM public.trusted_devices 
WHERE expires_at < NOW();
```

## TODO (Zukünftige Erweiterungen)

- [ ] Settings-Seite: Liste aller vertrauenswürdigen Geräte
- [ ] Möglichkeit, einzelne Geräte zu widerrufen
- [ ] E-Mail-Benachrichtigung bei neuem vertrauenswürdigen Gerät
- [ ] Erweiterte Device Fingerprinting Library (z.B. FingerprintJS)
- [ ] Admin-Panel: Übersicht aller Geräte
- [ ] Automatische Bereinigung als Cron-Job

## Rollback

Falls die Migration rückgängig gemacht werden soll:

```sql
DROP TABLE IF EXISTS public.trusted_devices CASCADE;
```

**Achtung**: Dies löscht alle gespeicherten vertrauenswürdigen Geräte!
