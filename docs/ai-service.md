# AI-Service Dokumentation

## Übersicht
Der AI-Service ist ein eigenständiger Microservice für die KI-gestützte Produktgenerierung aus Bildern. Er nutzt Claude 3.5 Sonnet von Anthropic, um aus hochgeladenen Produktbildern vollständige, verkaufsfertige Produktdaten zu erstellen.

---

## Technologie-Stack

- **Runtime**: Node.js 18 (Alpine Linux)
- **Framework**: Express.js
- **AI-Provider**: Anthropic Claude 3.5 Sonnet
- **Bildverarbeitung**: Multer
- **Port**: 5005

---

## Projektstruktur

```
services/ai-generator/
├── Dockerfile
├── package.json
├── package-lock.json
└── src/
    ├── server.js
    ├── controllers/
    │   └── magicController.js
    └── routes/
        └── generate.js
```

---

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5005

CMD ["node", "src/server.js"]
```

**Eigenschaften:**
- Basiert auf Node.js 18 Alpine (minimal)
- Installiert Dependencies während des Builds
- Exponiert Port 5005
- Startet den Server mit `node src/server.js`

---

## package.json

```json
{
    "name": "shopmarkets-ai-generator",
    "version": "1.0.0",
    "description": "AI Service for ShopMarkets Product Generation",
    "main": "src/server.js",
    "type": "module",
    "scripts": {
        "start": "node src/server.js",
        "dev": "nodemon src/server.js"
    },
    "dependencies": {
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "express": "^4.18.2",
        "helmet": "^7.1.0",
        "multer": "^1.4.5-lts.1",
        "@anthropic-ai/sdk": "^0.36.3"
    },
    "devDependencies": {
        "nodemon": "^3.0.2"
    }
}
```

**Wichtige Dependencies:**
- `@anthropic-ai/sdk`: Offizielle Anthropic SDK für Claude
- `multer`: File-Upload Middleware
- `express`: Web-Framework
- `cors`: Cross-Origin Resource Sharing
- `helmet`: Security Headers
- `dotenv`: Umgebungsvariablen

---

## server.js (Haupt-Datei)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    console.log(`[AI-Service] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/generate', generateRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'ai-generator' });
});

app.listen(PORT, () => {
    console.log(`🤖 AI Generator Service running on port ${PORT}`);
});
```

**Funktionen:**
- CORS aktiviert für alle Origins
- JSON/URL-encoded Body Parsing (max 50MB)
- Request Logging Middleware
- Health Check Endpoint: `GET /health`
- Hauptroute: `/generate`

---

## routes/generate.js

```javascript
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { generateProductFromImage } from '../controllers/magicController.js';

const router = express.Router();

const uploadDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// POST /
router.post('/', upload.single('image'), generateProductFromImage);

export default router;
```

**Funktionalität:**
- Multer-Upload-Konfiguration
- Speichert Uploads temporär im System-Temp-Verzeichnis
- Dateinamen: Timestamp + Original-Extension
- Endpoint: `POST /generate` mit Multipart-Form-Data (Feld: `image`)

---

## controllers/magicController.js

```javascript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy',
});

export const generateProductFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');
    const mediaType = req.file.mimetype;

    console.log(`Analyzing image: ${req.file.originalname} (${mediaType})`);

    const systemPrompt = `Du bist der "Magic Product Creator" eines E-Commerce-Systems.

## Ziel
Analysiere das hochgeladene Produktbild und erstelle ein vollständiges, verkaufsfertiges Produkt als JSON-Objekt. SEO-optimiert, verkaufsstark.

## Output Format (JSON Only)
Antworte NUR mit einem validen JSON-Objekt. Kein Markdown.
Struktur:
{
  "title": "Produktname (SEO-optimiert)",
  "short_description": "Kurzbeschreibung (max 160 Zeichen)",
  "description": "Detaillierte Produktbeschreibung (HTML erlaubt, aber clean)",
  "category": "Eine der Kategorien: Möbel, Mode, Elektronik, etc.",
  "manufacturer": "Geschätzter Hersteller oder fiktiver Premium-Name",
  "tags": "Komma-getrennte Keywords",
  "price": "Geschätzter Verkaufspreis (nur Zahl, als String)",
  "sku": "Vorschlag für SKU",
  "attributes": {
    "material": "...",
    "color": "...",
    "dimensions": "...",
    "weight": "..."
  },
  "variants": [
    { "name": "OptionName (z.B. Farbe)", "values": ["Wert1", "Wert2"] }
  ],
  "seo": {
    "title": "SEO Title",
    "description": "Meta Description"
  },
  "tiktok": {
    "caption": "Viraler TikTok Caption Text",
    "hashtags": "Hashtags für TikTok"
  }
}

## Analyse-Schritte
1. Erkenne Produkttyp, Material, Farbe, Stil.
2. Schreibe verkaufsstarke Texte.
3. Schätze technische Daten (Maße, Gewicht) realistisch ein.
`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } }
          ],
        }
      ],
    });

    // Cleanup
    fs.unlinkSync(req.file.path);

    const textResponse = message.content[0].text;
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsedData = JSON.parse(jsonMatch[0]);

    res.json({ success: true, data: parsedData });

  } catch (error) {
    console.error('❌ Error generating product:', error);
    console.error('Stack:', error.stack);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Generation failed', details: error.message });
  }
};
```

---

## API-Endpoints

### 1. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-generator"
}
```

---

### 2. Produkt aus Bild generieren
**Endpoint:** `POST /generate`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (File): Produktbild (JPEG, PNG, etc.)

**Response (Erfolg):**
```json
{
  "success": true,
  "data": {
    "title": "Premium Leder Sofa - Modern & Komfortabel",
    "short_description": "Luxuriöses 3-Sitzer Sofa aus echtem Leder",
    "description": "<p>Hochwertiges Sofa...</p>",
    "category": "Möbel",
    "manufacturer": "LuxuryHome",
    "tags": "Sofa, Leder, Modern, Wohnzimmer",
    "price": "1299.00",
    "sku": "LH-SOFA-001",
    "attributes": {
      "material": "Echtleder",
      "color": "Braun",
      "dimensions": "220x90x85 cm",
      "weight": "45 kg"
    },
    "variants": [
      {
        "name": "Farbe",
        "values": ["Braun", "Schwarz", "Grau"]
      }
    ],
    "seo": {
      "title": "Premium Leder Sofa kaufen | Modern & Komfortabel",
      "description": "Luxuriöses 3-Sitzer Ledersofa in Premium-Qualität..."
    },
    "tiktok": {
      "caption": "Dieses Sofa macht dein Wohnzimmer zum Luxus-Tempel! 🛋️✨",
      "hashtags": "#sofa #interior #luxury #home"
    }
  }
}
```

**Response (Fehler):**
```json
{
  "error": "Generation failed",
  "details": "Error message"
}
```

---

## Umgebungsvariablen

Erforderliche Environment Variables:

```bash
# Anthropic API Key (erforderlich)
ANTHROPIC_API_KEY=sk-ant-...

# Port (optional, default: 5005)
PORT=5005
```

---

## Workflow

1. **Bild-Upload**: Client sendet Bild via `POST /generate`
2. **Speicherung**: Multer speichert Bild temporär im System-Temp
3. **Base64-Konvertierung**: Bild wird in Base64 konvertiert
4. **Claude API Call**: 
   - Model: `claude-3-5-sonnet-20241022`
   - Max Tokens: 4000
   - Temperature: 0.7
   - Input: System Prompt + Base64-Bild
5. **JSON-Extraktion**: Response wird nach JSON-Objekt durchsucht
6. **Cleanup**: Temporäre Datei wird gelöscht
7. **Response**: Generierte Produktdaten werden zurückgegeben

---

## Besonderheiten

### Prompt Engineering
Der System-Prompt ist optimiert für:
- **SEO-Optimierung**: Title, Meta-Description
- **E-Commerce**: Verkaufsstarke Texte
- **Technische Daten**: Realistische Schätzungen
- **Social Media**: TikTok-optimierte Captions
- **Strukturierte Daten**: Konsistentes JSON-Format

### Error Handling
- Validierung: Prüft ob Bild hochgeladen wurde
- Cleanup: Löscht temporäre Dateien auch bei Fehlern
- Logging: Detaillierte Fehlerausgabe mit Stack-Trace
- JSON-Parsing: Robuste Extraktion mit Regex

### Sicherheit
- CORS aktiviert
- File-Size-Limit: 50MB
- Temporäre Dateien werden automatisch gelöscht
- API-Key über Umgebungsvariablen

---

## Deployment

### Docker Build
```bash
cd services/ai-generator
docker build -t shopmarkets-ai-generator .
```

### Docker Run
```bash
docker run -p 5005:5005 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  shopmarkets-ai-generator
```

### Development
```bash
cd services/ai-generator
npm install
npm run dev
```

---

## Integration

### Beispiel: Frontend-Integration

```javascript
const generateProduct = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:5005/generate', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Generated Product:', result.data);
    return result.data;
  } else {
    throw new Error(result.error);
  }
};
```

---

## Monitoring

### Logs
- Alle Requests werden geloggt: `[AI-Service] METHOD URL`
- Bildanalyse: `Analyzing image: filename (mimetype)`
- Fehler: Detaillierte Stack-Traces

### Health Check
```bash
curl http://localhost:5005/health
```

---

## Kosten-Überlegungen

**Claude 3.5 Sonnet Pricing (Stand: 2024):**
- Input: ~$3 per 1M tokens
- Output: ~$15 per 1M tokens

**Durchschnittliche Kosten pro Produktgenerierung:**
- Input: ~2000 tokens (Prompt + Bild)
- Output: ~1000 tokens (JSON)
- **Kosten: ~$0.02 pro Produkt**

---

## Zukünftige Erweiterungen

### Geplante Features
- [ ] Batch-Processing (mehrere Bilder gleichzeitig)
- [ ] Caching von ähnlichen Produkten
- [ ] Mehrsprachige Produktbeschreibungen
- [ ] Bildoptimierung vor API-Call
- [ ] Rate-Limiting
- [ ] Authentifizierung
- [ ] Webhook-Support für asynchrone Verarbeitung

### Optimierungen
- [ ] Streaming-Response für schnelleres Feedback
- [ ] Komprimierung von Bildern vor Upload
- [ ] Redis-Cache für häufige Anfragen
- [ ] Metriken & Analytics (Prometheus)

---

## Troubleshooting

### Problem: "No image uploaded"
**Lösung:** Stelle sicher, dass das Formular-Feld `image` heißt und `multipart/form-data` verwendet wird.

### Problem: "Generation failed"
**Lösung:** 
1. Prüfe ANTHROPIC_API_KEY
2. Prüfe Bild-Format (JPEG, PNG unterstützt)
3. Prüfe Logs für detaillierte Fehlermeldung

### Problem: "No JSON found in response"
**Lösung:** Claude hat kein valides JSON zurückgegeben. Prüfe:
1. Model-Version korrekt?
2. Prompt zu restriktiv?
3. Max-Tokens ausreichend?

---

## Support & Kontakt

Bei Fragen oder Problemen:
- **Logs prüfen**: `docker logs <container-id>`
- **Health Check**: `curl http://localhost:5005/health`
- **API-Dokumentation**: Diese Datei

---

**Letzte Aktualisierung:** 2026-01-07
**Version:** 1.0.0
**Maintainer:** ShopMarkets Team
