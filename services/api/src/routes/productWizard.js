import express from 'express';
import productWizardController from '../controllers/productWizardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
    createProductSchema,
    updateProductSchema,
    stepDataSchemas,
    aiGenerateSchema
} from '../validation/productSchema.js';

const router = express.Router();

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

export default router;

