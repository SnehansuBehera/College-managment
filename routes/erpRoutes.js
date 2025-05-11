import express from 'express';
import { erpRegistration } from '../controllers/erpController.js';

const router = express.Router();

router.post('/erp', erpRegistration);


export default router;
