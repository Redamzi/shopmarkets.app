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
