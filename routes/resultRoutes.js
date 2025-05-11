import express from 'express';
import {
    assignGrades,
    getExamResults,
    getStudentSemesterResults,
    updateExamResult,
    deleteExamResult,
    getStudentResultsBySemAndType,
    getAllResultsBySemAndType,
    getSubjectResultsBySemAndType
} from '../controllers/examController.js';

const router = express.Router();

router.post('/assign-grade', assignGrades);
router.get('/exam-results', getExamResults);
router.get('/semester-results', getStudentSemesterResults);
router.put('/update-result', updateExamResult);
router.delete('/delete-result/:exam_id/:reg_no', deleteExamResult);
router.get('/results/student/sem-type', getStudentResultsBySemAndType);
router.get('/results/all/sem-type', getAllResultsBySemAndType);
router.get('/results/subject/sem-type', getSubjectResultsBySemAndType);


export default router;
