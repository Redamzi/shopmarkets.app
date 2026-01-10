import fetch from 'node-fetch';

const AI_GENERATOR_URL = process.env.AI_GENERATOR_URL || 'http://localhost:5005';

export async function generateProductFromImage(imageBase64, productType) {
    try {
        const response = await fetch(`${AI_GENERATOR_URL}/generate/product-from-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageBase64,
                product_type: productType
            })
        });

        if (!response.ok) {
            throw new Error(`AI Generator failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate and transform AI output
        return {
            title: data.title || '',
            short_description: data.short_description || '',
            description: data.description || '',
            category: data.category || '',
            manufacturer: data.manufacturer || '',
            tags: data.tags || '',
            sku: data.sku || generateSKU(),
            attributes: data.attributes || {},
            seo: {
                title: data.seo?.title || data.title,
                description: data.seo?.description || data.short_description,
                image_alt: data.seo?.image_alt || `${data.title} product image`
            },
            tiktok: {
                caption: data.tiktok?.caption || '',
                hashtags: data.tiktok?.hashtags || []
            },
            main_image: data.main_image || ''
        };
    } catch (error) {
        console.error('AI Generation error:', error);
        throw new Error('AI generation failed');
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

    if (aiOutput.tiktok?.caption && aiOutput.tiktok.caption.length > 150) {
        errors.push({ field: 'tiktok.caption', message: 'TikTok caption must be max 150 characters' });
    }

    if (aiOutput.tiktok?.hashtags && aiOutput.tiktok.hashtags.length > 5) {
        errors.push({ field: 'tiktok.hashtags', message: 'Max 5 hashtags allowed' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
