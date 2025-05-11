import express from 'express';
import { listCourses, createCourse, updateCourse, deleteCourse } from '../controllers/adminController.js';

const router = express.Router();
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
export default router;