# 🚀 ShopMarkets Deployment Guide

## Prerequisites

- Coolify installed on Hetzner VPS
- GitHub repository connected
- Domain DNS configured

## Step-by-Step Deployment

### 1. Deploy PostgreSQL Database (Security)

1. Go to Coolify → Databases → + New
2. Select: PostgreSQL
3. Name: `security-db`
4. Generate strong password
5. Deploy

### 2. Deploy Security Service

1. Go to Coolify → Applications → + New
2. Select: GitHub Repository
3. Repository: `shopmarkets.app`
4. Branch: `main`
5. Base Directory: `/services/security`
6. Dockerfile Location: `/services/security/Dockerfile`
7. Port: `3001`
8. Domain: `security.shopmarkets.app`
9. Environment Variables: Copy from `services/security/.env.example`
10. Deploy

### 3. Deploy Supabase (Custom Ports)

1. Go to Coolify → Services → + New
2. Select: Supabase
3. Configure Ports:
   - Studio: 3001
   - Kong: 8001
   - Auth: 9100
   - REST: 3001
   - Meta: 8082
4. Generate all secrets
5. Domain: `supabase.shopmarkets.app`
6. Deploy

### 4. Deploy API Service

1. Go to Coolify → Applications → + New
2. Repository: `shopmarkets.app`
3. Base Directory: `/services/api`
4. Dockerfile Location: `/services/api/Dockerfile`
5. Port: `3000`
6. Domain: `api.shopmarkets.app`
7. Environment Variables: Copy from `services/api/.env.example`
8. Deploy

### 5. Deploy Dashboard

1. Go to Coolify → Applications → + New
2. Repository: `shopmarkets.app`
3. Base Directory: `/services/dashboard`
4. Dockerfile Location: `/services/dashboard/Dockerfile`
5. Port: `3000`
6. Domain: `start.shopmarkets.app`
7. Environment Variables: Copy from `services/dashboard/.env.example`
8. Deploy

## Verification

```bash
# Security Service
curl https://security.shopmarkets.app/health

# API Service
curl https://api.shopmarkets.app/health

# Dashboard
curl https://start.shopmarkets.app
```

## Troubleshooting

### Service won't start
- Check logs in Coolify
- Verify environment variables
- Check database connection

### Database connection failed
- Verify DB_HOST matches database name in Coolify
- Check DB_PASSWORD is correct
- Ensure database is running

### CORS errors
- Verify CORS_ORIGIN in Security Service
- Check domain configuration

## Post-Deployment

1. Run database migrations:
   ```bash
   # In Security Service terminal
   npm run migrate
   ```

2. Create first admin user via API

3. Test login flow

4. Configure SMTP settings

5. Test email delivery

## Monitoring

- Check Coolify logs regularly
- Monitor database size
- Set up alerts for service downtime
