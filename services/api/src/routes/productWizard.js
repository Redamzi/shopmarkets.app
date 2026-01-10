const express = require('express');
const router = express.Router();
const productWizardController = require('../controllers/productWizardController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    createProductSchema,
    updateProductSchema,
    stepDataSchemas,
    aiGenerateSchema
} = require('../validation/productSchema');

// Get available steps for product type
router.get('/steps', productWizardController.getSteps);

// Create new product
router.post('/', authenticateToken, validate(createProductSchema), productWizardController.createProduct);

// Get product by ID
router.get('/:id', authenticateToken, productWizardController.getProduct);

// Update product
router.put('/:id', authenticateToken, validate(updateProductSchema), productWizardController.updateProduct);

// Get step data
router.get('/:id/step/:stepNumber', authenticateToken, productWizardController.getStepData);

// Save step data
router.put('/:id/step/:stepNumber', authenticateToken, productWizardController.saveStepData);

// AI Generate
router.post('/ai-generate', authenticateToken, validate(aiGenerateSchema), productWizardController.aiGenerate);

module.exports = router;
