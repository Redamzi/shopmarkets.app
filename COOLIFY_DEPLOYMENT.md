# 🚀 ShopMarkets Deployment auf Coolify (Post-Supabase Architecture)

Diese Anleitung führt dich Schritt für Schritt durch das Deployment der **neuen Architektur** (ohne Supabase). Wir deployen 4 separate Services.

> [!IMPORTANT]
> **WICHTIG:** Achte bei jedem Schritt genau darauf, **welchen Service** und **welches Verzeichnis** du auswählst.

---

## Architektur-Übersicht

| Service | Typ | Port (Intern) | Verzeichnis | Beschreibung |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | Datenbank | 5432 | - | Zentrale Datenbank |
| **Security Service** | Node.js | 4000 | `/services/security` | Auth, JWT, E-Mails |
| **Backend API** | Node.js | 5000 | `/services/api` | Produkte, Billing, Uploads |
| **Dashboard** | Statisch/Docker | 3000 | `/services/dashboard` | Frontend (React/Vite) |

---

## 1️⃣ PostgreSQL Datenbank erstellen

### In Coolify:
1.  **Dashboard** → **Projects** → Dein Projekt → **New Resource**
2.  Wähle **PostgreSQL**.
3.  Konfiguration:
    *   **Name**: `shopmarkets-db`
    *   **Version**: `15` (oder latest)
    *   **User**: `postgres`
    *   **Password**: (Kopieren! Wir nennen es `DB_PASSWORD`)
    *   **Internal Domain**: (Kopieren! z.B. `uuid-postgres` oder einfach `postgresql`. Wir nennen es `DB_HOST`)
4.  **Starten**.

---

## 2️⃣ Security Service Deployen

Dieser Service kümmert sich um Login, Registrierung und Tokens.

### In Coolify:
1.  **New Resource** → **GitHub / Public Repository**.
2.  **Repository**: `Redamzi/shopmarkets.app` (oder dein Repo).
3.  **Branch**: `main`.
4.  **Build Pack**: `Nixpacks` oder `Dockerfile`.
5.  **Base Directory**: `/services/security` ⚠️ **(WICHTIG!)**
6.  **Ports Exposes**: `4000`

### Environment Variables (Environment):
Füge diese Variablen hinzu:

```env
PORT=4000
NODE_ENV=production

# Datenbank (Daten aus Schritt 1)
DB_HOST=shopmarkets-db  <-- Dein DB Internal Host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=xxxxxxxxx   <-- Dein DB Passwort
DB_NAME=postgres

# Security
JWT_SECRET=generiere-einen-langen-secure-string-min-32-zeichen
CORS_ORIGIN=https://dein-dashboard-domain.com
ALLOWED_ORIGINS=https://dein-dashboard-domain.com

# Email (Mailgun oder SMTP)
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@deine-domain.com
SMTP_PASS=dein-mailgun-password
MAILGUN_API_KEY=key-xxxxxxxx
MAILGUN_DOMAIN=deine-domain.com
MAILGUN_FROM=security@deine-domain.com
```

### Deployment:
*   Klicke auf **Deploy**.
*   Warte auf "Healthy".

---

## 3️⃣ Backend API Deployen

Dieser Service beinhaltet die Geschäftslogik (Produkte, Kategorien, etc.).

### In Coolify:
1.  **New Resource** → **GitHub**.
2.  **Base Directory**: `/services/api` ⚠️ **(WICHTIG!)**
3.  **Ports Exposes**: `5000`

### Environment Variables:

```env
PORT=5000
NODE_ENV=production

# Datenbank (Gleiche wie oben)
DB_HOST=shopmarkets-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=xxxxxxxxx
DB_NAME=postgres

# Auth (Muss mit Security Service übereinstimmen)
JWT_SECRET=generiere-einen-langen-secure-string-min-32-zeichen (GLEICHER WIE OBEN!)
```

### Deployment:
*   Klicke auf **Deploy**.

---

## 4️⃣ Dashboard (Frontend) Deployen

Das eigentliche React Frontend.

### In Coolify:
1.  **New Resource** → **GitHub**.
2.  **Base Directory**: `/services/dashboard` ⚠️ **(WICHTIG!)**
3.  **Ports Exposes**: `80` (oder `3000`, je nach Dockerfile-Einstellung. Standard Nginx ist 80).

### Environment Variables (Build Time!):
Bei React/Vite müssen diese Variablen **während des Builds** verfügbar sein. In Coolify gibt es oft einen Abschnitt "Build Variables" oder man setzt sie normal als Env Vars.

```env
# URL zum Security Service (HTTPS Domain aus Schritt 2)
VITE_SECURITY_SERVICE_URL=https://dein-security-service.com

# URL zur Backend API (HTTPS Domain aus Schritt 3)
VITE_API_URL=https://dein-api-service.com

# Environment
VITE_ENV=production
```

### Deployment:
*   Klicke auf **Deploy**.

---

## ✅ Checkliste zum Abschluss

1.  [ ] **Datenbank**: Läuft?
2.  [ ] **Security**: `https://dein-security.com/health` -> `{"status":"healthy"}`
3.  [ ] **API**: `https://dein-api.com/health` -> `{"status":"healthy"}`
4.  [ ] **Dashboard**: Öffne die Domain.
    *   Versuche Login -> Ruft Security Service auf.
    *   Lade Produkte -> Ruft API Service auf.
