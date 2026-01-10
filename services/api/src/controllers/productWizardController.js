const pool = require('../config/db');

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

exports.getSteps = (req, res) => {
    const { product_type } = req.query;

    if (!product_type || !STEP_MAPPING[product_type]) {
        return res.status(400).json({ error: 'Invalid product_type' });
    }

    res.json({
        product_type,
        steps: STEP_MAPPING[product_type]
    });
};

exports.createProduct = async (req, res) => {
    const { product_type, title, sku } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `INSERT INTO products (user_id, product_type, title, sku, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
            [user_id, product_type, title, sku]
        );

        res.json({
            success: true,
            product_id: result.rows[0].id
        });
    } catch (err) {
        console.error('createProduct error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

exports.getProduct = async (req, res) => {
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

exports.updateProduct = async (req, res) => {
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

exports.getStepData = async (req, res) => {
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

exports.saveStepData = async (req, res) => {
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

exports.aiGenerate = async (req, res) => {
    const { image, product_type } = req.body;

    try {
        const aiService = require('../services/aiService');

        // Generate product data from image
        const aiOutput = await aiService.generateProductFromImage(image, product_type);

        // Validate AI output
        const validation = aiService.validateAIOutput(aiOutput);

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
