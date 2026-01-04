# 🔐 Auth Microservice

Standalone authentication service with 2FA for ShopMarkets.

## Features

- ✅ User Registration with Email Verification
- ✅ Login with 2FA (Email Code)
- ✅ Password Reset
- ✅ JWT Token Authentication
- ✅ Rate Limiting
- ✅ Separate User Database
- ✅ Production Ready

## API Endpoints

### POST /api/auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

### POST /api/auth/login
Login (Step 1 - sends 2FA code)
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/verify-2fa
Login (Step 2 - verify code)
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

### POST /api/auth/verify-email
Verify email after registration
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

### POST /api/auth/request-password-reset
Request password reset code
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password
Reset password with code
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

## Setup

### 1. Install Dependencies
```bash
cd auth-service
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Migrations
```bash
npm run migrate
```

### 4. Start Service
```bash
# Development
npm run dev

# Production
npm start
```

## Deployment (Coolify)

### 1. Create PostgreSQL Database
- Name: `auth-db`
- Create database: `auth_db`

### 2. Create Auth Service
- Repository: Your repo
- Branch: main
- Base Directory: `auth-service`
- Dockerfile: `Dockerfile`
- Port: 3001

### 3. Set Environment Variables
See `.env.example`

### 4. Deploy
Service will auto-deploy on push

## Database Schema

### users
- id (UUID)
- email (unique)
- password_hash
- full_name
- is_verified
- is_active
- created_at
- updated_at

### verification_codes
- id (UUID)
- user_id (FK)
- code (6 digits)
- type (email_verification, 2fa_login, password_reset)
- expires_at
- used_at
- created_at

### sessions
- id (UUID)
- user_id (FK)
- refresh_token
- expires_at
- created_at

## Security Features

- ✅ Bcrypt password hashing
- ✅ JWT tokens
- ✅ Rate limiting (5 req/15min)
- ✅ Email verification
- ✅ 2FA on login
- ✅ Secure password reset
- ✅ CORS protection
- ✅ Helmet security headers

## License

MIT
