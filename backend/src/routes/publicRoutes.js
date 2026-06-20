import express from 'express';
import { sendPublicContact } from '../controllers/publicController.js';

const router = express.Router();
router.post('/contact', sendPublicContact);
export default router;
