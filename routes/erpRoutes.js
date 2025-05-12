import express from 'express';
import { erpRegistration, getAllRegistrations, getRegistrationById, getRegistrationsBySemester, getRegistrationsByStudent, getRegistrationByStudentAndSemester, modifySubjects, deleteAllRegistrations, deleteRegistrationById, updateStatus } from '../controllers/erpController.js';

const router = express.Router();

router.post('/erp', erpRegistration);
router.get('/erp/all', getAllRegistrations);
router.get('/erp/:id', getRegistrationById)
router.get("/erp/sem/:semester", getRegistrationsBySemester)
router.get("/erp/reg/:reg_no", getRegistrationsByStudent)
router.get("/erp/:reg_no/:semester", getRegistrationByStudentAndSemester);
router.put('/erp/:id', modifySubjects);
router.delete('/erp/delete/all', deleteAllRegistrations);
router.delete('/exam-registrations/:id', deleteRegistrationById);
router.put('/erp/:id/status', updateStatus)

export default router;
