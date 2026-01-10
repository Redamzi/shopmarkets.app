# PRODUCT CREATION FLOW

## Übersicht

Produkt-Erstellung erfolgt über Dashboard mit 3 Methoden:
1. Manuell (Formular)
2. AI-Generator (Bild Upload)
3. Import (CSV/Excel)

---

## Methode 1: Manuelles Erstellen

### Felder

**Basis-Informationen**
- Titel (required)
- Beschreibung (optional)
- Kurzbeschreibung (max 160 Zeichen)
- SKU (required, unique)
- Kategorie (dropdown)

**Preise & Inventar**
- Preis (required, decimal)
- Vergleichspreis (optional)
- Bestand (required, integer)
- Bestandswarnung (optional, integer)

**Medien**
- Hauptbild (required)
- Zusätzliche Bilder (max 5)
- Upload via CDN Storage

**Attribute**
- Material (optional)
- Farbe (optional)
- Größe (optional)
- Gewicht (optional)
- Custom Fields (key-value)

**SEO**
- Meta Title (optional)
- Meta Description (optional)
- URL Slug (auto-generated)

**Varianten**
- Variantenname (z.B. Farbe)
- Variantenwerte (z.B. Rot, Blau)
- Preis pro Variante
- SKU pro Variante

### Flow

1. User klickt "Neues Produkt"
2. Formular öffnet sich
3. User füllt Felder aus
4. Bild Upload → CDN Storage
5. Validation (Frontend + Backend)
6. POST /api/products
7. Produkt gespeichert
8. Redirect zu Produktliste

---

## Methode 2: AI-Generator

### Flow

1. User klickt "AI Produkt erstellen"
2. Bild Upload Modal
3. Bild hochladen
4. POST /generate/product-from-image
5. Claude 3.5 Sonnet analysiert Bild
6. AI generiert:
   - Titel (SEO-optimiert)
   - Beschreibung (HTML)
   - Kategorie (auto-detect)
   - Attribute (Material, Farbe, etc.)
   - Preis (geschätzt)
   - SKU (generiert)
   - SEO Meta Tags
   - TikTok Caption
7. Vorschau anzeigen
8. User kann editieren
9. Speichern → POST /api/products

### AI Output Format

```json
{
  "title": "Premium Lederjacke Schwarz",
  "short_description": "Hochwertige Lederjacke...",
  "description": "<p>Detaillierte Beschreibung...</p>",
  "category": "Mode",
  "manufacturer": "Premium Fashion",
  "tags": "Lederjacke, Mode, Premium",
  "price": "299.99",
  "sku": "LJ-BLK-001",
  "attributes": {
    "material": "Echtleder",
    "color": "Schwarz",
    "dimensions": "M, L, XL"
  },
  "variants": [
    { "name": "Größe", "values": ["M", "L", "XL"] }
  ],
  "seo": {
    "title": "Premium Lederjacke kaufen",
    "description": "Hochwertige Lederjacke..."
  },
  "tiktok": {
    "caption": "Diese Lederjacke ist ein Must-Have!",
    "hashtags": "#fashion #leather #style"
  }
}
```

---

## Methode 3: Import (CSV/Excel)

### Flow

1. User klickt "Produkte importieren"
2. CSV/Excel Upload
3. Datei parsen
4. Vorschau mit Mapping
5. User bestätigt Mapping
6. Batch POST /api/products
7. Progress anzeigen
8. Erfolgsmeldung + Fehlerlog

### CSV Format

```csv
title,description,sku,price,stock,category,image_url
"Produkt 1","Beschreibung",SKU001,99.99,10,Elektronik,https://cdn.shopmarkets.app/image1.jpg
```

---

## Backend Processing

### POST /api/products

**Request Body**
```json
{
  "title": "string",
  "description": "string",
  "sku": "string",
  "price": "decimal",
  "stock": "integer",
  "category": "string",
  "image_url": "string",
  "attributes": {}
}
```

**Validation**
- Title: required, min 3 chars
- SKU: required, unique
- Price: required, > 0
- Stock: required, >= 0
- Image URL: valid URL

**Processing**
1. Input Validation (Joi/Zod)
2. SKU Uniqueness Check
3. Image URL Validation
4. Insert into DB
5. Return Product ID

**Response**
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "title": "...",
    "created_at": "timestamp"
  }
}
```

---

## Sync zu Sales Channels

### Nach Produkt-Erstellung

1. Produkt in DB gespeichert
2. User wählt Channels
3. Für jeden Channel:
   - Transform zu Channel Format
   - POST zu Channel API
   - External ID speichern
   - Webhook registrieren

### Shopify Beispiel

```javascript
POST https://shop.myshopify.com/admin/api/2024-01/products.json
{
  "product": {
    "title": "...",
    "body_html": "...",
    "vendor": "...",
    "product_type": "...",
    "variants": [...]
  }
}
```

---

## Datenbank Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  attributes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Error Handling

**Validation Errors**
- 400 Bad Request
- Fehlercode + Feldname
- User-friendly Message

**Duplicate SKU**
- 409 Conflict
- "SKU bereits vergeben"

**Image Upload Fehler**
- 500 Internal Server Error
- Retry Mechanismus

**AI Generator Fehler**
- Fallback zu manuellem Formular
- Error Logging
