# 🔐 ShopMarkets Security Service

Eigenständiger Microservice für Zwei-Faktor-Authentifizierung (2FA) und E-Mail-Verifizierung.

## 📦 Features

- ✅ **E-Mail Verification** - 6-stellige Codes via Mailgun API
- ✅ **TOTP (Google Authenticator)** - Time-based One-Time Passwords
- ✅ **Backup Codes** - 10 Recovery Codes für Account-Wiederherstellung
- ✅ **Rate Limiting** - Schutz vor Brute-Force-Angriffen
- ✅ **JWT Tokens** - Sichere Service-zu-Service Kommunikation
- ✅ **Deutsche E-Mail Templates** - Professionelle, zustellungsoptimierte E-Mails

## 🚀 Quick Start

### Lokales Development

```bash
# 1. Dependencies installieren
cd security-service
npm install

# 2. Environment Variables kopieren
cp .env.example .env
# Editiere .env mit deinen Credentials

# 3. Database Schema ausführen
psql -h localhost -U postgres -d postgres -f schema.sql

# 4. Service starten
npm run dev
```

### Mit Docker

```bash
# Build
docker build -t shopmarkets-security .

# Run
docker run -p 4000:4000 --env-file .env shopmarkets-security
```

### Mit Docker Compose (Full Stack)

```bash
# Im Root-Verzeichnis
docker-compose -f docker-compose.full-stack.yml up -d
```

## 📡 API Endpoints

### E-Mail Verification

#### POST `/api/auth/send-code`
Sendet einen 6-stelligen Verifizierungscode per E-Mail.

**Request:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "type": "LOGIN" // or REGISTRATION, PASSWORD_RESET, EMAIL_CHANGE
}
```

**Response:**
```json
{
  "success": true,
  "expiresAt": "2026-01-03T01:20:00.000Z",
  "message": "Code sent to user@example.com"
}
```

#### POST `/api/auth/verify-code`
Verifiziert einen Code und gibt ein JWT-Token zurück.

**Request:**
```json
{
  "userId": "uuid",
  "code": "123456",
  "type": "LOGIN"
}
```

**Response:**
```json
{
  "success": true,
  "verifyToken": "eyJhbGc...",
  "message": "Code verified successfully"
}
```

### 2FA (TOTP)

#### POST `/api/2fa/setup`
Generiert TOTP Secret und QR-Code für 2FA-Einrichtung.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["ABCD1234", "EFGH5678", ...],
  "message": "Scan the QR code with your authenticator app"
}
```

#### POST `/api/2fa/activate`
Aktiviert 2FA nach Bestätigung mit Token.

**Request:**
```json
{
  "userId": "uuid",
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456",
  "backupCodes": ["ABCD1234", ...],
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA activated successfully. Backup codes sent to your email."
}
```

#### POST `/api/2fa/verify`
Verifiziert TOTP-Token oder Backup-Code beim Login.

**Request:**
```json
{
  "userId": "uuid",
  "token": "123456" // 6 digits (TOTP) or 8 chars (Backup Code)
}
```

**Response:**
```json
{
  "success": true,
  "verifyToken": "eyJhbGc...",
  "message": "2FA verified successfully"
}
```

#### GET `/api/2fa/status/:userId`
Prüft ob 2FA für einen User aktiviert ist.

**Response:**
```json
{
  "userId": "uuid",
  "is2faEnabled": true
}
```

#### POST `/api/2fa/disable`
Deaktiviert 2FA (erfordert Token-Bestätigung).

**Request:**
```json
{
  "userId": "uuid",
  "token": "123456"
}
```

## 🔐 Sicherheits-Features

### Rate Limiting
- **Max. 3 Fehlversuche** pro User
- **15 Minuten Sperre** nach zu vielen Fehlversuchen
- Automatisches Reset nach erfolgreicher Verifizierung

### Code-Sicherheit
- Alle Codes werden **gehasht** (bcrypt) gespeichert
- **10 Minuten Gültigkeit** für E-Mail-Codes
- **Einmalige Verwendung** - Codes werden nach Nutzung gelöscht

### Backup Codes
- **10 Recovery Codes** bei 2FA-Aktivierung
- Gehasht gespeichert
- Markiert als "verwendet" nach Nutzung
- Per E-Mail an User gesendet

### JWT Tokens
- **15 Minuten Gültigkeit** (konfigurierbar)
- Signiert mit `JWT_SECRET`
- Nur für Service-zu-Service Kommunikation

## 📧 E-Mail Templates

Alle E-Mails folgen strengen Zustellbarkeits-Richtlinien:

- ✅ **Deutsch** - Alle Texte auf Deutsch
- ✅ **Kein noreply@** - Echte Absenderadresse
- ✅ **Plain-Text + HTML** - Maximale Kompatibilität
- ✅ **Keine Bilder** - Bessere Zustellrate
- ✅ **Transparenz** - Klare Erklärung warum E-Mail gesendet wurde
- ✅ **Kontaktadresse** - Support-E-Mail in jeder Mail

## 🗄️ Database Schema

### `security.user_security_settings`
```sql
user_id UUID PRIMARY KEY
is_2fa_enabled BOOLEAN
totp_secret VARCHAR(255)
backup_codes JSONB
failed_attempts INTEGER
locked_until TIMESTAMP
```

### `security.verification_codes`
```sql
id UUID PRIMARY KEY
user_id UUID
code_hash VARCHAR(255)
type VARCHAR(50)
expires_at TIMESTAMP
used_at TIMESTAMP
```

## 🔧 Environment Variables

Siehe `.env.example` für alle verfügbaren Variablen.

**Wichtig:**
- `MAILGUN_API_KEY` - Mailgun API Key
- `MAILGUN_DOMAIN` - Deine verifizierte Domain
- `JWT_SECRET` - Mindestens 32 Zeichen!
- `DB_PASSWORD` - PostgreSQL Passwort

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:4000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "shopmarkets-security-service",
  "timestamp": "2026-01-03T01:00:00.000Z"
}
```

### Logs
Alle Logs werden via Winston ausgegeben:
- **Info**: Erfolgreiche Operationen
- **Warn**: Fehlgeschlagene Versuche
- **Error**: Systemfehler

## 🚀 Production Deployment

### Mit Coolify

1. **Neue Application erstellen**
   - Type: Dockerfile
   - Repository: GitHub
   - Dockerfile Path: `security-service/Dockerfile`

2. **Environment Variables setzen**
   - Alle Variablen aus `.env.example`
   - Besonders wichtig: `MAILGUN_API_KEY`, `JWT_SECRET`

3. **Port konfigurieren**
   - Port: 4000
   - Domain: `security.shopmarkets.app`

4. **Deploy starten**

### Integration mit Haupt-Backend

Das Haupt-Backend muss nach erfolgreicher Passwort-Prüfung:

1. **2FA-Status prüfen**: `GET /api/2fa/status/:userId`
2. **Falls 2FA aktiv**: Frontend zeigt 2FA-Modal
3. **Nach 2FA-Erfolg**: `verifyToken` vom Security Service validieren
4. **Token validieren**: JWT mit `JWT_SECRET` prüfen
5. **Login abschließen**: Session-Token ausstellen

## 📚 Weitere Dokumentation

- [Main README](../README.md) - Projekt-Übersicht
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full-Stack Deployment
- [QUICKSTART.md](../QUICKSTART.md) - Lokales Testing

---

**Made with 🔐 for ShopMarkets**
