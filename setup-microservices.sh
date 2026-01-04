#!/bin/bash

# ShopMarkets Microservices Setup Script
# Version: 2.0
# Date: 2026-01-05

set -e

echo "🚀 ShopMarkets Microservices Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}📁 Base Directory: ${BASE_DIR}${NC}"
echo ""

# Step 1: Create directory structure
echo -e "${YELLOW}Step 1: Creating directory structure...${NC}"
mkdir -p services/security/src/{controllers,routes,middleware,utils}
mkdir -p services/api/src/{controllers,routes,middleware,utils,integrations}
mkdir -p services/dashboard
mkdir -p infrastructure/{supabase,coolify}
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Copy existing files to dashboard
echo -e "${YELLOW}Step 2: Moving frontend to services/dashboard...${NC}"
if [ -d "components" ]; then
    cp -r components services/dashboard/
    cp -r lib services/dashboard/
    cp -r services services/dashboard/src_services
    cp -r store services/dashboard/
    cp App.tsx services/dashboard/
    cp index.html services/dashboard/
    cp index.tsx services/dashboard/
    cp package.json services/dashboard/
    cp tsconfig.json services/dashboard/
    cp vite.config.ts services/dashboard/
    cp Dockerfile services/dashboard/
    echo -e "${GREEN}✓ Frontend files copied${NC}"
else
    echo -e "${YELLOW}⚠ Components directory not found, skipping...${NC}"
fi
echo ""

# Step 3: Install dependencies for Security Service
echo -e "${YELLOW}Step 3: Installing Security Service dependencies...${NC}"
cd services/security
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ package.json not found${NC}"
fi
cd ../..
echo ""

# Step 4: Generate .env templates
echo -e "${YELLOW}Step 4: Generating .env templates...${NC}"

cat > services/security/.env.example << 'EOF'
PORT=3001
NODE_ENV=production

# Database
DB_HOST=security-db
DB_PORT=5432
DB_NAME=security
DB_USER=postgres
DB_PASSWORD=CHANGE_ME

# JWT
JWT_SECRET=CHANGE_ME_GENERATE_STRONG_SECRET
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=support@shopmarkets.app
SMTP_PASS=CHANGE_ME
SMTP_FROM=ShopMarkets <support@shopmarkets.app>

# CORS
CORS_ORIGIN=https://start.shopmarkets.app
EOF

cat > services/api/.env.example << 'EOF'
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=http://supabase-kong:8001
SUPABASE_ANON_KEY=CHANGE_ME
SUPABASE_SERVICE_KEY=CHANGE_ME

# Security Service
SECURITY_SERVICE_URL=https://security.shopmarkets.app

# Shop APIs
SHOPIFY_API_KEY=CHANGE_ME
SHOPIFY_API_SECRET=CHANGE_ME
AMAZON_MWS_KEY=CHANGE_ME
AMAZON_MWS_SECRET=CHANGE_ME
KAUFLAND_API_KEY=CHANGE_ME
EOF

cat > services/dashboard/.env.example << 'EOF'
VITE_API_URL=https://api.shopmarkets.app
VITE_SECURITY_URL=https://security.shopmarkets.app
EOF

echo -e "${GREEN}✓ .env templates created${NC}"
echo ""

# Step 5: Create Dockerfiles
echo -e "${YELLOW}Step 5: Creating Dockerfiles...${NC}"

cat > services/security/Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
EOF

cat > services/api/Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

echo -e "${GREEN}✓ Dockerfiles created${NC}"
echo ""

# Step 6: Create .dockerignore
echo -e "${YELLOW}Step 6: Creating .dockerignore files...${NC}"

cat > services/security/.dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
README.md
.DS_Store
EOF

cp services/security/.dockerignore services/api/.dockerignore

echo -e "${GREEN}✓ .dockerignore files created${NC}"
echo ""

# Step 7: Create deployment guide
echo -e "${YELLOW}Step 7: Creating deployment guide...${NC}"

cat > DEPLOYMENT-GUIDE.md << 'EOF'
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
EOF

echo -e "${GREEN}✓ Deployment guide created${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review generated files"
echo "2. Update .env files with real credentials"
echo "3. Follow DEPLOYMENT-GUIDE.md"
echo "4. Deploy to Coolify"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "- ARCHITECTURE.md - System overview"
echo "- DEPLOYMENT-GUIDE.md - Deployment instructions"
echo "- services/security/README.md - Security Service docs"
echo ""
