import pool from '../utils/db.js';

const STEP_MAPPING = {
    simple: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    configurable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    grouped: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    virtual: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    bundle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    downloadable: [1, 2, 3, 6, 7, 8, 9, 10],
    subscription: [1, 2, 3, 4, 6, 7, 8, 9, 10],
    personalized: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    bookable: [1, 2, 3, 4, 6, 7, 8, 9, 10]
};

export const getSteps = (req, res) => {
    const { product_type } = req.query;

    if (!product_type || !STEP_MAPPING[product_type]) {
        return res.status(400).json({ error: 'Invalid product_type' });
    }

    res.json({
        product_type,
        steps: STEP_MAPPING[product_type]
    });
};

export const createProduct = async (req, res) => {
    const {
        product_type, title, sku, description, short_description,
        category, vendor, tags, price, stock, track_quantity, low_stock_threshold, barcode,
        price_radar, shipping, attributes, variants, extras,
        seo, tiktok, channels, images, video, is_ai_generated
    } = req.body;

    // Auth middleware ensures user exists
    // Robust extraction: id (standard), userId (custom), sub (JWT standard)
    const user_id = req.user.id || req.user.userId || req.user.sub;

    if (!user_id) {
        console.error('[ProductWiz] Error: No User ID found in token payload:', req.user);
        return res.status(403).json({ error: 'User ID missing in token' });
    }

    try {
        // --- Credit Calculation (Server Side Validation) ---
        let totalCredits = 0;

        // 1. AI Usage
        if (is_ai_generated) totalCredits += 1.00;

        // 2. Channels (0.30 per channel)
        if (channels && Array.isArray(channels) && channels.length > 0) {
            totalCredits += (channels.length * 0.30);

            // 3. Auto Price Calc (Check inside price_radar config)
            // Assuming price_radar structure: { enabled: bool, autoCalc: bool, ... }
            if (price_radar && price_radar.autoCalc) {
                totalCredits += (channels.length * 0.10);
            }
        }

        // TODO: Implement Billing Service Check
        // const hasBalance = await billingService.checkBalance(user_id, totalCredits);
        // if (!hasBalance) return res.status(402).json({ error: 'Insufficient credits' });
        // await billingService.deductCredits(user_id, totalCredits, 'Product Creation');

        console.log(`[ProductWiz] Creating product for User ${user_id}. Deducting ${totalCredits} Credits.`);

        // --- Database Insert ---
        // Ensure JSON objects are stringified if library doesn't handle JSONB automatically 
        // (pg-pool usually handles string/object for JSONB if parameterized, but being explicit is safe for simple objects)

        const result = await pool.query(
            `INSERT INTO products (
                user_id, product_type, title, sku, description, short_description,
                category, vendor, tags, price, stock, track_quantity, low_stock_threshold, barcode,
                price_radar, shipping, attributes, variants, extras,
                seo, tiktok, channels, images, video, is_ai_generated,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24, $25,
                NOW(), NOW()
            ) RETURNING id`,
            [
                user_id,
                product_type || 'simple',
                title,
                sku,
                description || '',
                short_description || '',
                category || '',
                vendor || '',
                tags || '',
                price || 0,
                stock || 0,
                track_quantity || false,
                low_stock_threshold || 0,
                barcode || '',
                price_radar || {},
                shipping || {},
                attributes || {},
                variants || [],
                extras || {}, // Personalization Config
                seo || {},
                tiktok || {},
                channels || [],
                images || [],
                video || null,
                is_ai_generated || false
            ]
        );

        res.json({
            success: true,
            product_id: result.rows[0].id,
            credits_deducted: totalCredits,
            message: 'Product created successfully'
        });

    } catch (err) {
        console.error('createProduct error:', err);
        res.status(500).json({ error: 'Failed to create product', details: err.message });
    }
};

export const getProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('getProduct error:', err);
        res.status(500).json({ error: 'Failed to get product' });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        await pool.query(
            `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1}`,
            [...values, id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('updateProduct error:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const getStepData = async (req, res) => {
    const { id, stepNumber } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = result.rows[0];
        const stepData = extractStepData(product, parseInt(stepNumber));

        res.json(stepData);
    } catch (err) {
        console.error('getStepData error:', err);
        res.status(500).json({ error: 'Failed to get step data' });
    }
};

export const saveStepData = async (req, res) => {
    const { id, stepNumber } = req.params;
    const stepData = req.body;

    try {
        const updates = mapStepDataToFields(parseInt(stepNumber), stepData);

        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        await pool.query(
            `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1}`,
            [...values, id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('saveStepData error:', err);
        res.status(500).json({ error: 'Failed to save step data' });
    }
};

export const aiGenerate = async (req, res) => {
    const { image, product_type } = req.body;

    try {
        const { generateProductFromImage, validateAIOutput } = await import('../services/aiService.js');

        // Generate product data from image
        const aiOutput = await generateProductFromImage(image, product_type);

        // Validate AI output
        const validation = validateAIOutput(aiOutput);

        if (!validation.valid) {
            return res.status(400).json({
                error: 'AI output validation failed',
                details: validation.errors
            });
        }

        res.json({
            success: true,
            data: aiOutput
        });
    } catch (err) {
        console.error('aiGenerate error:', err);
        res.status(500).json({
            error: 'AI generation failed',
            message: err.message
        });
    }
};

function extractStepData(product, stepNumber) {
    switch (stepNumber) {
        case 1:
            return { product_type: product.product_type };
        case 2:
            return {
                title: product.title,
                description: product.description,
                short_description: product.short_description,
                seo: product.seo,
                tiktok: product.tiktok,
                attributes: product.attributes
            };
        case 3:
            return { images: product.images };
        case 4:
            return {
                price: product.price,
                stock: product.stock
            };
        case 5:
            return {
                attributes: product.attributes,
                variants: product.variants
            };
        case 6:
            return {
                seo: product.seo,
                tiktok: product.tiktok
            };
        case 7:
            return { channels: product.channels };
        default:
            return product;
    }
}

function mapStepDataToFields(stepNumber, stepData) {
    switch (stepNumber) {
        case 1:
            return { product_type: stepData.product_type };
        case 2:
            return {
                title: stepData.title,
                description: stepData.description,
                short_description: stepData.short_description,
                seo: JSON.stringify(stepData.seo),
                tiktok: JSON.stringify(stepData.tiktok),
                attributes: JSON.stringify(stepData.attributes)
            };
        case 3:
            return { images: JSON.stringify(stepData.images) };
        case 4:
            return {
                price: stepData.price,
                stock: stepData.stock
            };
        case 5:
            return {
                attributes: JSON.stringify(stepData.attributes),
                variants: JSON.stringify(stepData.variants)
            };
        case 6:
            return {
                seo: JSON.stringify(stepData.seo),
                tiktok: JSON.stringify(stepData.tiktok)
            };
        case 7:
            return { channels: JSON.stringify(stepData.channels) };
        default:
            return stepData;
    }
}

export default {
    getSteps,
    createProduct,
    getProduct,
    updateProduct,
    getStepData,
    saveStepData,
    aiGenerate
};
