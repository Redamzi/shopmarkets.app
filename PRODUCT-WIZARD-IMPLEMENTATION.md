# PRODUCT WIZARD IMPLEMENTATION

## API Endpoints

### GET /api/products/steps?product_type={type}

**Response:**
```json
{
  "product_type": "simple",
  "steps": [1, 2, 3, 4, 6, 7, 8, 9, 10],
  "step_details": {
    "1": { "name": "Produktart wählen", "required": true },
    "2": { "name": "AI-Generator", "required": false },
    "3": { "name": "Medien", "required": true },
    "4": { "name": "Preise & Inventar", "required": true },
    "6": { "name": "SEO & Marketing", "required": false },
    "7": { "name": "Channels & Sync", "required": false },
    "8": { "name": "SEO-Vorschau", "required": false },
    "9": { "name": "Bereit für Sync", "required": false },
    "10": { "name": "Vorschau & Speichern", "required": true }
  }
}
```

### POST /api/products/ai-generate

**Request:**
```json
{
  "image": "base64_encoded_image",
  "product_type": "simple"
}
```

**Response:**
```json
{
  "title": "Premium Lederjacke Schwarz",
  "short_description": "Hochwertige Lederjacke...",
  "description": "<p>Detaillierte Beschreibung...</p>",
  "category": "Mode",
  "manufacturer": "Premium Fashion",
  "tags": "Lederjacke, Mode, Premium",
  "sku": "LJ-BLK-001",
  "attributes": {
    "material": "Echtleder",
    "color": "Schwarz",
    "size": "M, L, XL",
    "weight": "1.2kg"
  },
  "seo": {
    "title": "Premium Lederjacke kaufen",
    "description": "Hochwertige Lederjacke...",
    "image_alt": "Schwarze Premium Lederjacke"
  },
  "tiktok": {
    "caption": "Diese Lederjacke ist ein Must-Have!",
    "hashtags": ["#fashion", "#leather", "#style"]
  },
  "main_image": "https://cdn.shopmarkets.app/..."
}
```

### POST /api/products

**Request:**
```json
{
  "product_type": "simple",
  "title": "string",
  "description": "string",
  "short_description": "string",
  "sku": "string",
  "category": "string",
  "manufacturer": "string",
  "tags": "string",
  "price": "decimal",
  "stock": "integer",
  "attributes": {},
  "seo": {},
  "tiktok": {},
  "channels": [],
  "images": []
}
```

**Response:**
```json
{
  "success": true,
  "product_id": "uuid",
  "status": "created"
}
```

---

## Frontend Flow

### Step 1 – Produktart wählen

**Component:** `ProductTypeSelector.tsx`

```typescript
const productTypes = [
  { id: 'simple', name: 'Einfaches Produkt', description: 'Einzelartikel ohne Varianten' },
  { id: 'configurable', name: 'Konfigurierbares Produkt', description: 'Mit Varianten' },
  { id: 'grouped', name: 'Gruppiertes Produkt', description: 'Produkt-Sets' },
  { id: 'virtual', name: 'Virtuelles Produkt', description: 'Keine physische Lieferung' },
  { id: 'bundle', name: 'Bündelprodukt', description: 'Kunde stellt Paket zusammen' },
  { id: 'downloadable', name: 'Herunterladbares Produkt', description: 'Digitale Dateien' },
  { id: 'subscription', name: 'Abo-Produkt', description: 'Wiederkehrende Zahlungen' },
  { id: 'personalized', name: 'Personalisiertes Produkt', description: 'Web-to-Print, 3D' },
  { id: 'bookable', name: 'Buchbares Produkt', description: 'Termine, Reservierungen' }
];
```

**Action:**
- User wählt Typ
- POST zu Backend: `product_type`
- GET `/api/products/steps?product_type={type}`
- Lade dynamisch Steps

---

### Step 2 – AI-Generator

**Component:** `AIGenerator.tsx`

**Flow:**
1. Bild Upload
2. POST `/api/products/ai-generate`
3. Vorschau anzeigen
4. User kann editieren
5. Speichern

**Features:**
- Hauptbild automatisch setzen
- SEO Image Alt generieren
- TikTok Caption + Hashtags
- Attribute extrahieren

---

## Backend Implementation

### Controller: `productWizardController.js`

```javascript
export const getSteps = (req, res) => {
  const { product_type } = req.query;
  
  const stepMapping = {
    simple: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    configurable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    grouped: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    virtual: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    bundle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    downloadable: [1, 2, 3, 6, 7, 8, 9, 10],
    subscription: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    personalized: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    bookable: [1, 2, 3, 4, 6, 7, 8, 9, 10]
  };
  
  res.json({
    product_type,
    steps: stepMapping[product_type] || stepMapping.simple
  });
};

export const aiGenerate = async (req, res) => {
  const { image, product_type } = req.body;
  
  // Claude 3.5 Sonnet Integration
  const result = await claudeAnalyze(image, product_type);
  
  res.json(result);
};
```

---

## Database Schema

```sql
-- Already migrated
ALTER TABLE products ADD COLUMN product_type VARCHAR(50);
ALTER TABLE products ADD COLUMN attributes JSONB;
ALTER TABLE products ADD COLUMN seo JSONB;
ALTER TABLE products ADD COLUMN tiktok JSONB;
ALTER TABLE products ADD COLUMN channels JSONB;
ALTER TABLE products ADD COLUMN price_radar JSONB;
```

---

## Validation Rules

**Step 1:**
- `product_type` required

**Step 2:**
- Image optional
- AI Output editierbar

**Step 4:**
- `price` > 0
- `stock` >= 0

**Step 10:**
- `title` required
- `sku` unique
- `price` required
- `stock` required
- Min 1 image

---

## Step Mapping

| Product Type | Steps |
|---|---|
| Simple | 1,2,3,4,6,7,8,9,10 |
| Configurable | 1,2,3,4,5,6,7,8,9,10 |
| Grouped | 1,2,3,4,5,6,7,8,9,10 |
| Virtual | 1,2,3,4,6,7,8,9,10 |
| Bundle | 1,2,3,4,5,6,7,8,9,10 |
| Downloadable | 1,2,3,6,7,8,9,10 |
| Subscription | 1,2,3,4,6,7,8,9,10 |
| Personalized | 1,2,3,4,5,6,7,8,9,10 |
| Bookable | 1,2,3,4,6,7,8,9,10 |
