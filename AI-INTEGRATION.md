# AI INTEGRATION - PRODUCT WIZARD

## Übersicht

AI-gestützte Produktgenerierung für Step 2 des Product Wizard mit Claude 3.5 Sonnet.

---

## Prompt 1: AI Produktgenerierung

**Aufgabe:** Analysiere hochgeladenes Bild und generiere Produktfelder automatisch.

**Generierte Felder:**
- `title` (SEO-optimiert)
- `description` (HTML)
- `short_description` (max 160 chars)
- `category` (auto-detect)
- `attributes` (Material, Farbe, Größe, Gewicht)
- `seo` (title, description, alt_text)
- `tiktok` (caption, hashtags max 5)

**Bild:** Automatisch als Titelbild, SEO-Alt-Text generiert

---

## Prompt 2: Bild-Analyse

**Analyse:**
- Kategorie erkennen
- Material, Farbe, Größe
- Titel, Beschreibung (SEO)
- Alt-Text für Bild
- TikTok Caption + Hashtags

**Output:** JSON für Product Wizard

---

## Prompt 3: Step 2 Integration

**Workflow:**
1. User lädt Bild hoch
2. AI analysiert (Claude 3.5 Sonnet)
3. Output in Step 2 Felder (editierbar)
4. Titelbild automatisch übernommen
5. SEO-Alt-Text + TikTok gespeichert
6. Nur relevante Felder für Produktart

---

## Prompt 4: Validierung

**Checks:**
- Titel ≥ 3 Zeichen
- SKU generiert (falls leer)
- Kategorie existiert
- Preis, Bestand validiert
- Bild-URL gültig
- TikTok Caption ≤ 150 chars, max 5 Hashtags

**Markierung:** Fehlende Felder vor Step 3

---

## Prompt 5: Workflow

**Nach Step 2:**
- Step 3-10 laden (abhängig von product_type)
- Nur relevante Felder pro Produktart
- AI-Output editierbar
- Backend Speicherung (nicht final)
- Channel Sync erst Step 7

---

## API Integration

**Endpoint:** `POST /api/product-wizard/ai-generate`

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

---

## Implementation

**Service:** `aiService.js`

**Integration:** AI Generator Service (Port 5005)

**Validation:** Joi Schema

**Storage:** Temporary bis Step 10
