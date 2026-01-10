# PRODUCT WIZARD 3.0 - PRODUCTION-ONLY

## Rolle

AI-gestützter Assistent für neue Produkte im Dashboard. Prüft, ergänzt fehlende Felder, macht Produkte Production-Ready.

**Wichtig:**
- Nur neue Produkte (keine Imports)
- Nur relevante Steps pro Produktart
- Step 2 = AI-Generator
- Hauptbild = Titelbild + SEO

---

## Step 1 – Produktart wählen

**Prüfung:** `product_type` gesetzt?

**Produktarten:**
1. Simple Product
2. Configurable Product
3. Grouped Product
4. Virtual Product
5. Bundle Product
6. Downloadable Product
7. Subscription Product
8. Personalized Product
9. Bookable Product

**Action:** Speichere `product_type`

---

## Step 2 – AI-Generator

**Prüfung:** Titel, Beschreibung, SEO, TikTok, Attribute vorhanden?

**AI-Generierung (Claude 3.5 Sonnet):**

**Input:** Bild Upload

**Analyse:**
- Titel
- Beschreibung
- SEO Meta
- TikTok Caption/Hashtags
- Attribute
- Varianten (falls relevant)

**Hauptbild:**
- Automatisch als Titelbild
- SEO-Image Description

**Output JSON:**
```json
{
  "title": "string",
  "short_description": "string (max 160)",
  "description": "string HTML",
  "category": "string",
  "manufacturer": "string",
  "tags": "string",
  "sku": "string",
  "attributes": {
    "material": "string",
    "color": "string",
    "size": "string",
    "weight": "string"
  },
  "variants": [
    { "name": "string", "values": ["string"] }
  ],
  "seo": {
    "title": "string",
    "description": "string",
    "image_alt": "string"
  },
  "tiktok": {
    "caption": "string (max 150)",
    "hashtags": ["#tag1", "#tag2"]
  },
  "images": ["main_url", "additional_urls"]
}
```

**Editierbar:** Ja

---

## Step 3 – Medien

**Upload:**
- Zusätzliche Bilder (max 5)
- CDN Storage
- Validation: max 5MB, jpg/png/webp

---

## Step 4 – Preise & Inventar

**Felder:**
- Preis (required, > 0)
- Vergleichspreis (optional)
- Bestand (required, >= 0)
- Bestandswarnung (optional)

**Preis-Radar (optional):**
- Konkurrenzanalyse
- Preisempfehlung
- Dynamische Anpassung

---

## Step 5 – Attribute & Varianten

**Nur laden wenn:** Configurable, Bundle, Personalized

**Attribute:**
- Material, Farbe, Größe, Gewicht
- Custom Fields (JSONB)

**Varianten:**
- SKU pro Variante
- Preis pro Variante

---

## Step 6 – SEO & Marketing

**SEO (AI-generiert):**
- Meta Title
- Meta Description
- URL Slug (auto)

**TikTok:**
- Caption (max 150 chars)
- Hashtags (max 5)

---

## Step 7 – Channels & Sync

**Kanäle:**
- Shopify, WooCommerce, Amazon, eBay
- TikTok Shop, Instagram Shopping
- Otto Market, Zalando

**Pflichtfeld-Check:**
- Pro Kanal validieren
- Transform zu Channel-Format
- External IDs vorbereiten
- Webhooks registrieren

---

## Step 8 – SEO-Vorschau

**Checks:**
- Titel: 50-60 chars ✅/⚠️/❌
- Beschreibung: 150-160 chars ✅/⚠️/❌
- Bilder: Min 1 ✅/⚠️/❌

---

## Step 9 – Bereit für Sync

**Validierung:**
- Alle Pflichtfelder ✅
- Min 1 Bild ✅
- SKU unique ✅
- Preis > 0 ✅
- Bestand >= 0 ✅

**Status:**
```
🚀 Bereit für Sync
Produkt optimal konfiguriert.
Alle Pflichtfelder für X Kanäle ausgefüllt.
```

---

## Step 10 – Vorschau & Speichern

**Vorschau:**
- Alle Daten zusammengefasst
- AI-Felder editierbar

**Speichern:**
- DB Transaction
- Channel Sync Trigger
- Response: `product_id` + Status

---

## Dynamische Steps

**Simple Product:**
- 1, 2, 3, 4, 6, 7, 8, 9, 10

**Configurable Product:**
- 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

**Downloadable Product:**
- 1, 2, 3, 6, 7, 8, 9, 10

---

## Datenbankfelder

```
product_type, title, description, short_description, 
sku, category, manufacturer, tags, attributes, seo, 
tiktok, channels, price, stock, variants, images, 
price_radar
```

---

## Anforderungen

1. Fehlende Felder automatisch ergänzen
2. Nur relevante Steps laden
3. Hauptbild = Titelbild + SEO
4. AI Output editierbar
5. Channel-Mapping vorbereiten
6. JSON strukturiert für DB + Frontend

