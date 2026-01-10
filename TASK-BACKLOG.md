# TASK-BACKLOG – STRENG PRIORISIERT

**Regel:** Tickets werden von oben nach unten abgearbeitet. Kein Überspringen.

---

## 🔴 P0 – SYSTEM STOPPER (MUSS ZUERST)

### T-01 Rotate & Enforce Secrets
- Entferne alle hardcoded Secrets
- JWT_SECRET required
- App startet nicht ohne Secrets
- Rotiere JWT, DB, API Keys

### T-02 Database Backup & Snapshot
- Vollständiges DB-Backup
- Backup verifizieren
- Dokumentieren (wo + wie)

### T-03 Lock Down CORS
- Whitelist echte Domains
- Keine Wildcards
- Env-basiert

---

## 🔴 P1 – SECURITY BASELINE

### T-04 Global Rate Limiting
- API-weit
- Strenger für Auth-Endpoints
- IP + User-based

### T-05 Input Validation Layer
- Zod oder Joi
- Alle API-Endpoints
- Sanitize Inputs
- Reject invalid Payloads

### T-06 Security Headers & HTTPS
- Helmet aktiv
- CSP definiert
- HTTP → HTTPS Redirect

---

## 🔴 P2 – AUTH & INTEGRATION

### T-07 Standardize User Identity
- UUID als User-ID
- FK-Constraints
- Migration mit Backup

### T-08 Integrate Security Service (Auth)
- JWT nur validieren
- Permissions extern
- 2FA Flow nutzbar

### T-09 Session Invalidation
- Token Revocation
- Logout erzwingt Invalidierung
- Expiry erzwingen

---

## 🟡 P3 – MOCK ELIMINATION

### T-10 Remove Backend Mocks
- Billing
- Sync Logs
- Dashboard Stats
- Features deaktivieren, wenn nötig

### T-11 Remove Frontend Mocks
- Analytics
- Credits
- Fake Loading
- UI ehrlich machen

---

## 🟡 P4 – GDPR MINIMUM

### T-12 GDPR Core Rights
- Data Export
- Account Delete
- Keine PII in Logs

### T-13 Consent & Privacy
- Cookie Consent
- Privacy Policy Page
- Tracking blockiert ohne Consent

---

## 🟢 P5 – STABILITY

### T-14 Logging & Health
- Strukturierte Logs
- DB-Health Check
- External Service Checks

---

## 🟢 GO-CHECKLISTE

**GO ist erlaubt NUR, wenn ALLES erfüllt ist.**

### 🔒 SECURITY
- [ ] Keine hardcoded Secrets
- [ ] Secrets rotiert
- [ ] JWT ohne Fallback
- [ ] CORS geschlossen
- [ ] Rate Limiting aktiv
- [ ] HTTPS enforced
- [ ] Security Headers aktiv

### 👤 AUTH
- [ ] UUID User IDs
- [ ] Security Service integriert
- [ ] JWT Validation extern
- [ ] Session Invalidation funktioniert
- [ ] 2FA nutzbar

### 🧹 CODE & UX
- [ ] 0 Mocks im Production-Code
- [ ] Keine Fake-Daten im UI
- [ ] Deaktivierte Features sauber versteckt

### ⚖️ GDPR (MINIMUM)
- [ ] Privacy Policy erreichbar
- [ ] Consent vor Tracking
- [ ] Datenexport möglich
- [ ] Account Delete möglich
- [ ] Keine PII in Logs

### 🧠 STABILITY
- [ ] DB Backups laufen
- [ ] Health Checks valide
- [ ] Logging zentral
- [ ] Fehler sichtbar (nicht silent)

### 🚀 DEPLOYMENT
- [ ] Alle Änderungen über GitHub
- [ ] Alle Deployments über Coolify
- [ ] Kein Hotfix auf VPS

---

## 🟢 WENN ALLE PUNKTE ERFÜLLT SIND

**Dann:**

```
GO
```

**Alles davor ist PRE-PRODUCTION.**
