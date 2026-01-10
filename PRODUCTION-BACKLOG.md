# ShopMarkets Production-Only Ticket-Backlog 3.0

**Version:** 3.0  
**Status:** Go-Live Ready (Production-Only)  
**Erstellt:** 2026-01-10

---

## ⚠️ Critical (GO-Live Blocker)

| ID | Task | Beschreibung | Ziel / Akzeptanz | Aufwand (h) | Deployment |
|---|---|---|---|---|---|
| C-001 | Secrets Rotation | Alle Secrets rotiert: JWT_SECRET, DB_PASSWORD, API Keys | App startet ohne Fallbacks, keine Hardcoded Secrets | 2 | deploy all |
| C-002 | Security Service Integration | Security Service korrekt mit API + Dashboard verbunden | User Registration/Login + 2FA funktioniert, JWT validiert | 6 | deploy security |
| C-003 | Input Validation | Alle API Endpoints validieren Input (Joi/Zod) | SQL Injection / XSS verhindert, saubere Fehlercodes | 16 | deploy api |
| C-004 | CORS Whitelist | API Service nur Frontend-Domain erlauben | Keine Cross-Site Requests von externen Domains | 2 | deploy api |
| C-005 | Rate Limiting | Pro-User & Pro-Endpoint Limits implementiert | DDoS / Credential Stuffing verhindert | 4 | deploy api |
| C-006 | Error Handling & Logging | Strukturiertes Logging mit Winston/Sentry | Fehler nachvollziehbar, keine sensitive Infos im Output | 4 | deploy api |
| C-007 | User / Session DB | Vollständige User-Tabelle + Sessions | Registration, Login, Session Invalidation | 8 | deploy security |
| C-008 | GDPR Compliance Basics | Consent, Data Retention, Right to be Forgotten | Minimal gesetzeskonform für Go-Live | 12 | deploy all |

**Total Critical:** 54h

---

## 🔴 High (Feature-Completeness)

| ID | Task | Beschreibung | Ziel / Akzeptanz | Aufwand (h) | Deployment |
|---|---|---|---|---|---|
| H-001 | AI Generator Hardening | API Key Enforcement + Rate Limiting | Nur autorisierte Requests, Logging | 4 | deploy ai-generator |
| H-002 | CDN Storage Integration | Dashboard & API nutzen Storage für Bilder | Upload + Serve via cdn.shopmarkets.app | 4 | deploy cdn-storage-app |
| H-003 | Product Sync Channels | Shopify, WooCommerce, Amazon, eBay, Kaufland, Etsy | Produkte synchronisiert, Webhooks aktiv | 16 | deploy api |
| H-004 | Order / Inventory Sync | Webhook-basierte Sync + Polling Fallback | Alle Bestellungen & Inventar aktuell | 16 | deploy api |
| H-005 | Dashboard Connections | OAuth + API Key Flow korrekt implementiert | User kann Shops verbinden / trennen, Tokens verschlüsselt | 12 | deploy dashboard |

**Total High:** 52h

---

## 🟡 Medium (Post-Go-Live / Monitoring)

| ID | Task | Beschreibung | Ziel / Akzeptanz | Aufwand (h) | Deployment |
|---|---|---|---|---|---|
| M-001 | Monitoring & Health Checks | Winston + Sentry + DB Health Checks | Alerts bei Fehlern, Status verfügbar | 8 | deploy all |
| M-002 | Backup Strategy | Tägliche DB Backups + Restore Test | Datenverlust minimiert | 6 | deploy all |
| M-003 | Advanced GDPR | Data Export, Audit Logging, Cookie Banner | Vollständige Compliance nach Go-Live | 12 | deploy all |
| M-004 | Documentation Update | Architektur, Endpoints, Deployment | Dev-Team & QA können System verstehen | 4 | deploy all |
| M-005 | Testing Framework Setup | Jest / Vitest für Unit Tests, Integration Tests | Basis Coverage >40% nach Go-Live | 8 | deploy all |

**Total Medium:** 38h

---

## Gesamtaufwand

- **Critical:** 54h
- **High:** 52h
- **Medium:** 38h
- **Total:** 144h (~18 Arbeitstage)

---

## Go-Live Checkliste

- [ ] Alle Critical Tasks abgeschlossen
- [ ] Security Audit bestanden
- [ ] GDPR Minimum erfüllt
- [ ] Backup Strategy aktiv
- [ ] Monitoring läuft
- [ ] Alle Services deployed
