# PRODUCT CREATION FLOW

## Features

### Magic Product Creator
- Upload Foto
- KI erkennt Produkt
- Automatische Beschreibung
- Attribute setzen
- Claude 3.5 Sonnet

### Gebühren-Auto-Calc
- Automatische Gebührenberechnung
- Pro Kanal
- Transparente Kostenübersicht

### Preis-Radar
- Marktpreise vergleichen
- Konkurrenzanalyse
- Preisempfehlung

### TikTok Integration
- Caption generieren
- Hashtags vorschlagen
- Viral-optimiert

---

## Pflichtfelder

### Basis
- **Produktname** (required)
- **Beschreibung** (required)
- **SKU** (required, unique)
- **Preis** (required)
- **Bestand** (required)
- **Bild** (min 1)

### Kanal-Spezifisch

**Shopify**
- Titel (max 255 chars)
- Beschreibung (HTML)
- Produkttyp
- Vendor
- Varianten

**Amazon**
- ASIN/EAN
- Kategorie
- Bullet Points
- A+ Content

**eBay**
- Condition
- Shipping
- Return Policy

---

## Sync Status

### Ready für Sync
- Alle Pflichtfelder ausgefüllt
- Mindestens 1 Bild
- Gültige SKU
- Preis > 0
- Bestand >= 0

### Kanal-Check
- ✅ Shopify Ready
- ✅ Amazon Ready
- ⚠️ eBay Missing Fields

---

## SEO-Vorschau

### Titel
- Länge: Optimal (50-60 chars)
- Keywords enthalten
- Unique

### Beschreibung
- Länge: Perfekt (150-160 chars)
- Call-to-Action
- Keywords

### Bilder
- Min 1 Bild
- Empfohlen: 3-5 Bilder
- Format: JPG/PNG
- Max 5MB

---

## Validation Rules

### SKU
- Required
- Unique
- Format: A-Z, 0-9, -
- Min 3 chars

### Preis
- Required
- > 0
- Max 2 Dezimalstellen

### Bestand
- Required
- >= 0
- Integer

### Bilder
- Min 1
- Max 10
- Formats: jpg, png, webp
- Max 5MB per file
