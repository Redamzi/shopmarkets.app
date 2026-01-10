import fetch from 'node-fetch';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function generateProductFromImage(imageDataUrl, productType) {
    if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
    }

    try {
        // Extract base64 data and mime type from Data URL
        // Format: "data:image/jpeg;base64,/9j/4AAQSw..."
        const matches = imageDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            throw new Error('Invalid image data format. Expected base64 Data URL.');
        }

        const mediaType = matches[1];
        const base64Data = matches[2];

        console.log(`[AI-Service] Analyzing image (${mediaType}) for product type: ${productType}`);

        const systemPrompt = `Du bist der "Magic Product Creator" eines E-Commerce-Systems.

## Ziel
Analysiere das hochgeladene Produktbild und erstelle ein vollständiges, verkaufsfertiges Produkt als JSON-Objekt. SEO-optimiert, verkaufsstark.
Produkttyp-Kontext: ${productType || 'Generisch'}

## Output Format (JSON Only)
Antworte NUR mit einem validen JSON-Objekt. Kein Markdown, kein Text davor oder danach.
Struktur:
{
  "title": "Produktname (SEO-optimiert)",
  "short_description": "Kurzbeschreibung (max 160 Zeichen)",
  "description": "Detaillierte Produktbeschreibung (HTML erlaubt, aber clean)",
  "category": "Eine der Kategorien: Möbel, Mode, Elektronik, etc.",
  "manufacturer": "Geschätzter Hersteller oder fiktiver Premium-Name",
  "tags": "Komma-getrennte Keywords",
  "price": 0.00,
  "sku": "SKU-VORSCHLAG",
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
    "hashtags": ["#tag1", "#tag2"]
  }
}

## Analyse-Schritte
1. Erkenne Produkttyp, Material, Farbe, Stil.
2. Schreibe verkaufsstarke Texte.
3. Schätze technische Daten (Maße, Gewicht) realistisch ein.
`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                temperature: 0.7,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: systemPrompt },
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Anthropic API failed: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        const textResponse = data.content[0].text;

        // Extract JSON from response (in case of extra text)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        // Transform to internal format if needed (legacy code compatibility)
        return {
            title: parsedData.title || '',
            short_description: parsedData.short_description || '',
            description: parsedData.description || '',
            category: parsedData.category || '',
            manufacturer: parsedData.manufacturer || '',
            tags: parsedData.tags || '',
            sku: parsedData.sku || generateSKU(),
            attributes: parsedData.attributes || {},
            variants: parsedData.variants || [], // Added variants support
            seo: {
                title: parsedData.seo?.title || parsedData.title,
                description: parsedData.seo?.description || parsedData.short_description,
                image_alt: parsedData.title // simplified
            },
            tiktok: {
                caption: parsedData.tiktok?.caption || '',
                hashtags: Array.isArray(parsedData.tiktok?.hashtags)
                    ? parsedData.tiktok.hashtags
                    : (parsedData.tiktok?.hashtags || '').split(' ').filter(t => t.startsWith('#'))
            },
            main_image: '' // We don't change the image, frontend has it
        };

    } catch (error) {
        console.error('AI Generation error:', error);
        throw error;
    }
}

export function generateSKU() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `SKU-${timestamp}-${random}`.toUpperCase();
}

export function validateAIOutput(aiOutput) {
    const errors = [];

    if (!aiOutput.title || aiOutput.title.length < 3) {
        errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    }

    if (!aiOutput.sku) {
        errors.push({ field: 'sku', message: 'SKU is required' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
