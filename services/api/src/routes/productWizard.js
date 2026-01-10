const express = require('express');
const router = express.Router();
const productWizardController = require('../controllers/productWizardController');
const authenticateToken = require('../middleware/authMiddleware');

// Get available steps for product type
router.get('/steps', productWizardController.getSteps);

// Create new product
router.post('/', authenticateToken, productWizardController.createProduct);

// Get product by ID
router.get('/:id', authenticateToken, productWizardController.getProduct);

// Update product
router.put('/:id', authenticateToken, productWizardController.updateProduct);

// Get step data
router.get('/:id/step/:stepNumber', authenticateToken, productWizardController.getStepData);

// Save step data
router.put('/:id/step/:stepNumber', authenticateToken, productWizardController.saveStepData);

// AI Generate
router.post('/ai-generate', authenticateToken, productWizardController.aiGenerate);

module.exports = router;
