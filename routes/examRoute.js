import express from 'express';
import {
    createExams,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getStudentGrades
} from '../controllers/examController.js';

const router = express.Router();

router.post('/exams', createExams);
router.get('/exams/all', getAllExams);
router.get('/exams/:id', getExamById);
router.put('/exams/update/:id', updateExam);
router.delete('/exams/delete/:id', deleteExam);
router.post('/results', getStudentGrades)
export default router;
