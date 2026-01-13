# 🔍 MEDIATHEK-PROBLEM DIAGNOSE

## ✅ WAS FUNKTIONIERT:
1. **Dateien sind physisch vorhanden:** 7 Dateien auf VPS in `/app/uploads/ae4a3b19-5f5d-4abb-8307-c38ccbf63218/`
2. **Datenbank ist korrekt:** 7 Einträge in `media_files` Tabelle
3. **API-Route funktioniert:** `/api/media` ist korrekt implementiert
4. **UPLOAD_DIR ist gesetzt:** Environment-Variable wurde hinzugefügt

## ❌ PROBLEM:
**Mediathek zeigt keine Dateien an** auf https://start.shopmarkets.app/media

## 🔍 MÖGLICHE URSACHEN:

### 1. **Frontend lädt alte Version**
- Browser-Cache
- Service Worker
- Build nicht neu deployed

### 2. **API-Aufruf schlägt fehl**
- CORS-Problem
- Authentication-Token fehlt/ungültig
- API-URL falsch konfiguriert

### 3. **Datenbank-Abfrage filtert falsch**
- `is_active = false` für alle Dateien?
- `user_id` stimmt nicht überein?
- `folder_id` Filter aktiv?

### 4. **Frontend-Fehler**
- JavaScript-Fehler in Console
- React-Rendering-Problem
- State-Management-Problem

## 🛠️ NÄCHSTE SCHRITTE:

### Schritt 1: Prüfe Browser Console
```
Öffne: https://start.shopmarkets.app/media
Drücke: F12 (Developer Tools)
Gehe zu: Console Tab
Suche nach: Fehlermeldungen (rot)
```

### Schritt 2: Prüfe Network Tab
```
Öffne: Developer Tools → Network Tab
Lade Seite neu (Cmd+R)
Suche nach: Request zu `/api/media`
Prüfe:
  - Status Code (sollte 200 sein)
  - Response Body (sollte Array mit 7 Dateien sein)
  - Request Headers (Authorization Token vorhanden?)
```

### Schritt 3: Prüfe is_active Status in DB
```sql
SELECT id, filename, is_active, user_id, folder_id 
FROM public.media_files 
WHERE user_id = 'ae4a3b19-5f5d-4abb-8307-c38ccbf63218'
ORDER BY created_at DESC;
```

**Erwartung:** Alle `is_active` sollten `true` sein

### Schritt 4: Teste API direkt
```bash
# Hole Auth-Token aus Browser (Application → Local Storage → auth_token)
curl -H "Authorization: Bearer <TOKEN>" \
  https://api.shopmarkets.app/api/media
```

**Erwartung:** JSON-Array mit 7 Dateien

### Schritt 5: Prüfe Frontend-Build
```bash
# Im Dashboard-Verzeichnis
cd services/dashboard
npm run build

# Prüfe ob Build erfolgreich
ls -la dist/
```

## 📊 DIAGNOSE-CHECKLISTE:

- [ ] Browser Console zeigt Fehler?
- [ ] Network Tab zeigt `/api/media` Request?
- [ ] API-Response enthält Dateien?
- [ ] `is_active` ist `true` in DB?
- [ ] Auth-Token ist gültig?
- [ ] Frontend-Build ist aktuell?
- [ ] Service Worker blockiert?

## 🎯 WAHRSCHEINLICHSTE URSACHE:

Basierend auf "komplett andere Version":
- **Frontend zeigt alte Mediathek-Version**
- **Service Worker cached alte Version**
- **Build wurde nicht neu deployed**

**Lösung:**
1. Hard Refresh: Cmd+Shift+R
2. Clear Cache
3. Oder: Rebuild + Redeploy Frontend
