import express from 'express';
import { getConnections, addConnection, deleteConnection } from '../controllers/connectionController.js';

const router = express.Router();

router.get('/', getConnections);
router.post('/', addConnection);
router.delete('/:id', deleteConnection);

export default router;
