import express from 'express';
import {
    createExams,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam
} from '../controllers/examController.js';

const router = express.Router();

router.post('/exams', createExams);
router.get('/exams/all', getAllExams);
router.get('/exams/:id', getExamById);
router.put('/exams/update/:id', updateExam);
router.delete('/exams/delete/:id', deleteExam);

export default router;
