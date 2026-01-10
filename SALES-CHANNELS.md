# SALES CHANNELS

## Verbindungsprozess

### 1. OAuth Flow
1. User klickt "Verbinden"
2. Redirect zu Platform OAuth
3. User autorisiert App
4. Callback mit Auth Code
5. Exchange Code für Access Token
6. Token verschlüsselt speichern

### 2. API Key Flow
1. User gibt Credentials ein
2. Validation Request
3. Bei Erfolg: Speichern
4. Bei Fehler: Ablehnen

### 3. Token Storage
- Verschlüsselt in DB
- Per User + Platform
- Refresh Token separat
- Expiry Tracking

## Datenverarbeitung

### Product Sync
1. Fetch Products von Platform
2. Transform zu Standard Format
3. Speichern in DB
4. Webhook Registration

### Order Sync
1. Webhook empfangen
2. Validieren
3. Transform
4. Speichern
5. Status Update zurück

### Inventory Sync
- Real-time via Webhooks
- Fallback: Polling (15min)
- Conflict Resolution

## E-Commerce Plattformen

### Shopify
- OAuth 2.0
- API Scopes: read_products, write_products, read_orders, write_orders
- Webhook Support

### WooCommerce
- REST API v3
- Consumer Key + Secret
- Webhook Support

### Amazon
- MWS API
- Seller Central Account
- Marketplace IDs

### eBay
- OAuth 2.0
- Developer Account
- Production Keys

### Kaufland
- REST API
- Seller Account
- API Credentials

### Etsy
- OAuth 2.0
- API Key v3
- Shop ID

## Social Commerce

### TikTok Shop
- TikTok for Business
- OAuth 2.0
- Shop ID

### Instagram Shopping
- Facebook Business Manager
- Instagram Business Account
- Product Catalog

### Facebook Marketplace
- Facebook Business Manager
- Commerce Account
- Catalog ID

## Marktplätze

### Otto Market
- Partner API
- Händlerkonto
- API Token

### Real.de
- Händler-Backend
- API Zugang
- Credentials

### Zalando
- Partner Program
- API Access
- Merchant ID

## B2B Plattformen

### Alibaba
- Seller Account
- API Key
- Product Sync

### ManoMano
- Seller Account
- API Integration
- Catalog Sync
