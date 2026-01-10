import Joi from 'joi';

const productTypeSchema = Joi.string().valid(
    'simple',
    'configurable',
    'grouped',
    'virtual',
    'bundle',
    'downloadable',
    'subscription',
    'personalized',
    'bookable'
).required();

const createProductSchema = Joi.object({
    product_type: productTypeSchema,
    title: Joi.string().min(3).max(255).required(),
    sku: Joi.string().alphanum().min(3).max(50).required(),
    description: Joi.string().allow('').optional(),
    short_description: Joi.string().max(160).allow('').optional(),
    category: Joi.string().max(255).optional(),
    manufacturer: Joi.string().max(255).optional(),
    tags: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).optional(),
    attributes: Joi.object().optional(),
    seo: Joi.object({
        title: Joi.string().max(60).optional(),
        description: Joi.string().max(160).optional(),
        image_alt: Joi.string().optional()
    }).optional(),
    tiktok: Joi.object({
        caption: Joi.string().max(150).optional(),
        hashtags: Joi.array().items(Joi.string()).max(5).optional()
    }).optional(),
    channels: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional()
});

const updateProductSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().allow('').optional(),
    short_description: Joi.string().max(160).allow('').optional(),
    sku: Joi.string().alphanum().min(3).max(50).optional(),
    category: Joi.string().max(255).optional(),
    manufacturer: Joi.string().max(255).optional(),
    tags: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).optional(),
    attributes: Joi.object().optional(),
    seo: Joi.object({
        title: Joi.string().max(60).optional(),
        description: Joi.string().max(160).optional(),
        image_alt: Joi.string().optional()
    }).optional(),
    tiktok: Joi.object({
        caption: Joi.string().max(150).optional(),
        hashtags: Joi.array().items(Joi.string()).max(5).optional()
    }).optional(),
    channels: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional()
}).min(1);

const stepDataSchemas = {
    1: Joi.object({
        product_type: productTypeSchema
    }),
    2: Joi.object({
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().allow('').optional(),
        short_description: Joi.string().max(160).allow('').optional(),
        seo: Joi.object().optional(),
        tiktok: Joi.object().optional(),
        attributes: Joi.object().optional()
    }),
    3: Joi.object({
        images: Joi.array().items(Joi.string().uri()).min(1).max(10).required()
    }),
    4: Joi.object({
        price: Joi.number().min(0).required(),
        stock: Joi.number().integer().min(0).required()
    }),
    5: Joi.object({
        attributes: Joi.object().optional(),
        variants: Joi.array().items(Joi.object()).optional()
    }),
    6: Joi.object({
        seo: Joi.object().optional(),
        tiktok: Joi.object().optional()
    }),
    7: Joi.object({
        channels: Joi.array().items(Joi.string()).optional()
    })
};

const aiGenerateSchema = Joi.object({
    image: Joi.string().required(),
    product_type: productTypeSchema
});

export {
    createProductSchema,
    updateProductSchema,
    stepDataSchemas,
    aiGenerateSchema
};
