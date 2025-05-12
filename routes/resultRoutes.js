import express from 'express';
import {
    createExamResult,
    getExamResults,
    getStudentSemesterResults,
    updateExamResult,
    deleteExamResult,
    getStudentResultsBySemAndType,
    getAllResultsBySemAndType,
    updateResult,
    getStudentResultsBySemester
} from '../controllers/examController.js';

const router = express.Router();

router.post('/assign-grade', createExamResult);
router.get('/exam-results', getExamResults);
router.get('/semester-results', getStudentSemesterResults);
router.put('/update-result', updateExamResult);
router.delete('/delete-result/:exam_id/:reg_no', deleteExamResult);
router.get('/results/student/sem-type', getStudentResultsBySemAndType);
router.get('/results/all/sem-type', getAllResultsBySemAndType);
router.put('/updateResult', updateResult);
router.get('/studentResults', getStudentResultsBySemester)
export default router;
