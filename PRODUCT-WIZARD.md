# PRODUCT WIZARD 3.0 - PRODUCTION-ONLY

## Übersicht

Vollständiger Step-basierter Wizard für Produkterstellung mit AI-Unterstützung, Preis-Radar, TikTok Integration und Channel Sync.

---

## Step 1 – Produktart wählen

**Frontend:**
- User wählt Produktart
- Dynamische Steps werden geladen

**Backend:**
- Speichert `product_type` in DB
- Gibt relevante Steps zurück

**Produktarten:**
1. Einfaches Produkt
2. Konfigurierbares Produkt
3. Gruppiertes Produkt
4. Virtuelles Produkt
5. Bündelprodukt
6. Herunterladbares Produkt
7. Abo-Produkt
8. Personalisiertes Produkt
9. Buchbares Produkt

---

## Step 2 – Grundinformationen

**Felder:**
- Titel (required)
- Beschreibung
- Kurzbeschreibung (max 160 chars)
- SKU (required, unique)
- Kategorie
- Hersteller (optional)
- Tags

**Validation:**
- Title: min 3 chars
- SKU: unique, alphanumerisch
- Kategorie: existierend

---

## Step 3 – Medien

**Upload:**
- Hauptbild (required)
- Zusätzliche Bilder (max 5)
- CDN Storage

**AI-Generator:**
- Bild-Analyse via Claude 3.5 Sonnet
- Generiert: title, description, seo, tiktok, attributes

---

## Step 4 – Preise & Inventar

**Felder:**
- Preis (required)
- Vergleichspreis (optional)
- Bestand (required)
- Bestandswarnung (optional)

**Preis-Radar:**
- Findet günstigstes Konkurrenzangebot
- Dynamische Preisanpassung (optional)
- Web-Scraping Integration

---

## Step 5 – Attribute & Varianten

**Attribute:**
- Material, Farbe, Größe, Gewicht
- Custom Fields (JSONB)

**Varianten:**
- Nur bei Configurable/Bundle
- SKU pro Variante
- Preis pro Variante

---

## Step 6 – SEO & Marketing

**SEO:**
- Meta Title
- Meta Description
- URL Slug (auto-generated)

**TikTok Integration:**
- Caption (max 150 chars)
- Hashtags (max 5)
- Video-Optimierung für Reels & TikTok

---

## Step 7 – Channels & Sync

**Kanal-Auswahl:**
- Shopify, WooCommerce, Amazon, eBay
- TikTok Shop, Instagram Shopping
- Otto Market, Zalando

**Kanal-Check:**
- ✅ Ready: Alle Pflichtfelder ausgefüllt
- ⚠️ Missing: Fehlende Felder anzeigen

**Sync:**
- Transform zu Channel-Format
- POST zu Channel API
- External ID speichern
- Webhook registrieren

---

## Step 8 – SEO-Vorschau

**Checks:**
- Titel-Länge: Optimal (50-60 chars)
- Beschreibung: Perfekt (150-160 chars)
- Bilder: Min 1 Bild

**Status:**
- ✅ Gut
- ⚠️ Verbesserung möglich
- ❌ Fehlt

---

## Step 9 – Bereit für Sync

**Validierung:**
- Alle Pflichtfelder ausgefüllt
- Min 1 Bild
- Gültige SKU
- Preis > 0
- Bestand >= 0

**Status:**
```
🚀 Bereit für Sync
Ihr Produkt ist optimal konfiguriert.
Alle Pflichtfelder für X Kanäle ausgefüllt.
```

---

## Step 10 – Vorschau & Speichern

**Vorschau:**
- Alle Daten zusammengefasst
- AI-generierte Felder editierbar

**Speichern:**
- DB Transaction
- Channel Sync Trigger
- Response: product_id + Status

---

## Features

### Preis-Radar
- Automatische Konkurrenzanalyse
- Web-Scraping
- Dynamische Preisanpassung
- Preisempfehlung

### TikTok Integration
- Caption-Generator
- Hashtag-Vorschläge
- Video-Optimierung
- Reels-Format

### Kanal-Check
- Pflichtfeld-Validierung pro Channel
- Ready-Status
- Missing Fields Anzeige

### SEO-Vorschau
- Titel-Länge Check
- Beschreibung Check
- Bild-Anzahl Check
- Optimierungsvorschläge

---

## Dynamische Steps

**Simple Product:**
- Steps: 1, 2, 3, 4, 6, 7, 8, 9, 10

**Configurable Product:**
- Steps: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

**Downloadable Product:**
- Steps: 1, 2, 3, 6, 7, 8, 9, 10

---

## Backend Schema

```sql
ALTER TABLE products ADD COLUMN product_type VARCHAR(50);
ALTER TABLE products ADD COLUMN attributes JSONB;
ALTER TABLE products ADD COLUMN seo JSONB;
ALTER TABLE products ADD COLUMN tiktok JSONB;
ALTER TABLE products ADD COLUMN channels JSONB;
ALTER TABLE products ADD COLUMN price_radar JSONB;
```

---

## Validation Rules

**SKU:** Unique, A-Z 0-9 -, min 3 chars  
**Preis:** > 0, max 2 decimals  
**Bestand:** >= 0, integer  
**Bilder:** Min 1, max 10, jpg/png/webp, max 5MB  
**TikTok Caption:** Max 150 chars  
**TikTok Hashtags:** Max 5
