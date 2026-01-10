# PRODUCT FLOW 3.0 - PRODUCTION-ONLY

## Step 1 – Produktart wählen

| Produktart | Beschreibung | Typische Felder |
|---|---|---|
| Simple Product | Einzelartikel ohne Varianten | Titel, SKU, Preis, Bestand, Bilder |
| Configurable Product | Mit Varianten (Größe, Farbe) | Titel, SKU, Varianten, Attribute, Preis pro Variante |
| Grouped Product | Mehrere Produkte als Set | Titel, SKU, Produktliste, Preis/Set |
| Virtual Product | Keine physische Lieferung | Titel, SKU, Preis, Beschreibung |
| Bundle Product | Kunde stellt Paket zusammen | Titel, SKU, Komponenten, Preis |
| Downloadable Product | Digitale Dateien | Titel, SKU, Preis, Download-Link |
| Subscription Product | Wiederkehrende Zahlungen | Titel, SKU, Preis, Interval, Trial |
| Custom/Personalized | Personalisiert (Web-to-Print, 3D) | Titel, SKU, Attribute, Upload/Config |
| Bookable Product | Termine, Reservierungen | Titel, SKU, Price, Calendar/Slots |

**Regel:** Nur relevante Felder laden.

---

## Step 2 – AI-Generator (optional)

**Nur aktiv für:** Simple, Configurable, Downloadable, Custom

**AI Output:**
```json
{
  "title": "...",
  "short_description": "...",
  "description": "...",
  "category": "...",
  "price": "...",
  "sku": "...",
  "images": [...],
  "attributes": {...},
  "variants": [...],
  "seo": {...},
  "tiktok": {...}
}
```

**Validation:**
- Pflichtfelder gefüllt
- SKU unique
- Preis > 0
- Kategorie valid

---

## Step 3 – Manuelles Ausfüllen

- Nur Felder für gewählte Produktart
- Frontend + Backend Validation (Joi/Zod)
- Attribute/Varianten dynamisch

---

## Step 4 – Medien & Dateien

- Hauptbild + zusätzliche Bilder
- Upload via CDN Storage
- Validation: MimeType, Größe, Anzahl

---

## Step 5 – Pricing & Inventory

- Preis, Vergleichspreis, Bestand
- Varianten-abhängig
- Subscriptions: Interval, Trial

---

## Step 6 – Produkt speichern

**POST /api/products**

**DB Transaction:**
1. Product
2. Attribute
3. Varianten
4. Medien
5. Rollback bei Fehlern

**Return:** Product ID + Status

---

## Step 7 – Sync zu Sales Channels

- Nur ausgewählte Channels
- Transform zu Channel Format
- POST zu Channel API
- External ID speichern
- Webhook registrieren

---

## Step 8 – Audit & Monitoring

- Audit-Log: Wer, wann, Produktart
- Error-Logging
- GDPR: Pseudonymisierte User-ID

---

## Step 9 – Abschluss

- Status: Production-Ready
- Dashboard: Produktübersicht + Sync Status
- User Feedback: Erfolg, Warnungen, Fehler

---

## JSON Output Format

```json
{
  "product_type": "Simple|Configurable|Bundle|...",
  "title": "string",
  "short_description": "string (max 160)",
  "description": "string HTML",
  "sku": "string (unique)",
  "category": "string",
  "price": "decimal > 0",
  "stock": "integer >= 0",
  "images": ["url1", "url2"],
  "attributes": { "material": "...", "color": "..." },
  "variants": [ { "name": "...", "values": ["..."] } ],
  "seo": { "title": "...", "description": "..." },
  "tiktok": { "caption": "...", "hashtags": "..." },
  "channels": [ 
    { 
      "channel": "Shopify|Amazon|...", 
      "synced": true|false, 
      "external_id": "..." 
    } 
  ],
  "audit": { 
    "created_by": "...", 
    "created_at": "...", 
    "updated_at": "..." 
  },
  "validation": { 
    "errors": [], 
    "warnings": [] 
  }
}
```

---

## Validation Rules

**SKU:** Unique, A-Z 0-9 -, min 3 chars  
**Preis:** > 0, max 2 decimals  
**Bestand:** >= 0, integer  
**Bilder:** Min 1, max 10, jpg/png/webp, max 5MB

---

## Production-Only Constraints

- Step-basiert: nur relevante Felder
- AI optional + validiert
- DB-Transaction + Rollback
- Channel Sync schrittweise
- Audit + Logging
- GDPR + Security
