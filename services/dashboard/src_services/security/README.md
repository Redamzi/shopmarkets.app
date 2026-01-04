# Security Service

Zentrale Authentifizierung und Autorisierung für ShopMarkets.

## Features

- ✅ User Registration mit Email-Verification
- ✅ Login mit 2FA (Email-Code)
- ✅ JWT Token Management (Access + Refresh)
- ✅ Session Handling
- ✅ Password Reset
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer
- **Validation:** Joi

## API Endpoints

### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

Response: 201
{
  "message": "Registration successful. Please check your email.",
  "userId": "uuid"
}
```

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "userId": "uuid",
  "code": "123456"
}

Response: 200
{
  "message": "Email verified successfully"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "message": "2FA code sent to your email",
  "userId": "uuid",
  "requires2FA": true
}
```

```http
POST /api/auth/verify-2fa
Content-Type: application/json

{
  "userId": "uuid",
  "code": "123456"
}

Response: 200
{
  "message": "Login successful",
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}

Response: 200
{
  "token": "new-jwt-access-token"
}
```

```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "isVerified": true,
  "avvAcceptedAt": "2026-01-05T00:00:00Z",
  "profileCompleted": true
}
```

```http
POST /api/auth/logout
Authorization: Bearer {token}

Response: 200
{
  "message": "Logged out successfully"
}
```

### Password Reset

```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200
{
  "message": "If email exists, reset code has been sent"
}
```

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}

Response: 200
{
  "message": "Password reset successful"
}
```

## Environment Variables

```env
PORT=3001
NODE_ENV=production

# Database
DB_HOST=security-db
DB_PORT=5432
DB_NAME=security
DB_USER=postgres
DB_PASSWORD=<generated-password>

# JWT
JWT_SECRET=<generated-secret>
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=support@shopmarkets.app
SMTP_PASS=<smtp-password>
SMTP_FROM=ShopMarkets <support@shopmarkets.app>

# CORS
CORS_ORIGIN=https://start.shopmarkets.app
```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  avv_accepted_at TIMESTAMP,
  profile_completed BOOLEAN DEFAULT FALSE,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
```

## Deployment (Coolify)

1. Create PostgreSQL Database in Coolify: `security-db`
2. Create Application: `security-service`
3. Set Base Directory: `/services/security`
4. Set Dockerfile Location: `/services/security/Dockerfile`
5. Configure Environment Variables (see above)
6. Set Domain: `security.shopmarkets.app`
7. Deploy

## Development

```bash
cd services/security
npm install
npm run dev
```

## Production

```bash
npm start
```

## Testing

```bash
# Health Check
curl https://security.shopmarkets.app/health

# Register
curl -X POST https://security.shopmarkets.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'
```

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ Rate limiting (100 requests/15min)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input validation with Joi
- ✅ SQL injection protection (parameterized queries)
- ✅ 2FA via email codes (6 digits, 10min expiry)

## Future Enhancements

- [ ] TOTP (Google Authenticator) support
- [ ] OAuth2 (Google, GitHub)
- [ ] Account lockout after failed attempts
- [ ] IP-based rate limiting
- [ ] Audit logs
- [ ] Email templates
- [ ] SMS 2FA option
