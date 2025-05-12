import express from 'express';
import { getProfCoursesByProfID } from '../controllers/prof-controller.js';

const router = express.Router();

router.get("/professor/:prof_id", getProfCoursesByProfID)

export default router;
