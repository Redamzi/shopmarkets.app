# ShopMarkets.app

Multi-Channel E-Commerce Management Platform

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

### Production Deployment
Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für vollständige Anleitung.

**Kurzversion:**
1. Erstelle Supabase Projekt
2. Führe `supabase/schema.sql` aus
3. Deploy mit Coolify + Docker
4. Setze Build Args: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`

## 📁 Projekt-Struktur

```
shopmarkets.app/
├── components/          # React Components
├── lib/                 # Supabase Client & API
│   ├── supabase.ts     # Supabase Client
│   └── api.ts          # Database API Layer
├── supabase/           # Database Schema
│   └── schema.sql      # PostgreSQL Schema
├── Dockerfile          # Production Docker Build
├── docker-compose.yml  # Local Testing
├── nginx.conf          # Nginx Configuration
└── DEPLOYMENT.md       # Deployment Guide
```

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Docker, Coolify, Nginx
- **Styling**: CSS (Custom Design System)

## 📚 Features

- ✅ Multi-Channel Product Management
- ✅ Real-time Sync Tracking
- ✅ Connection Management (Shopify, WooCommerce, Amazon, etc.)
- ✅ Credit System
- ✅ Responsive Design (Mobile-First)
- ✅ Dark Mode Support

## 🔐 Environment Variables

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://api.shopmarkets.app  # Optional
VITE_ENV=production                        # Optional
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Vollständige Deployment-Anleitung
- [Database Schema](./supabase/schema.sql) - PostgreSQL Schema

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - siehe LICENSE Datei

---

**Made with ❤️ for E-Commerce**
