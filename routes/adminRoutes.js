import express from 'express';
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,

  listProfessorCourses,
  assignProfessorCourseHandler,
  updateProfessorCourse,
  deleteProfessorCourse,

  listStudentCourses,
  enrollStudentCourse,
  updateStudentCourse,
  deleteStudentCourse,
  getStudentCoursesbyReg,
  getStudentCoursesbySemAndReg,
  createBacklog,
  getSubjectDetailsfromSubjectIDs,
  getAllStudentsBysemAndReg
} from '../controllers/adminController.js';

const router = express.Router();

// — COURSES —
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// — PROFESSOR_COURSE —
router.get('/professor_courses', listProfessorCourses);
router.post('/professor_courses', assignProfessorCourseHandler);
router.put('/professor_courses/:id', updateProfessorCourse);
router.delete('/professor_courses/:id', deleteProfessorCourse);

// — STUDENT_COURSE —
router.get('/student_courses', listStudentCourses);
router.post('/student_courses', enrollStudentCourse);
router.put('/student_courses/:id', updateStudentCourse);
router.delete('/student_courses/:id', deleteStudentCourse);
router.get('/studentCourses/:reg_no', getStudentCoursesbyReg);
router.get('/studentCourses/:reg_no/:semester', getStudentCoursesbySemAndReg);
router.post('/backlog', createBacklog);
router.get('/subjectsByIds', getSubjectDetailsfromSubjectIDs);
router.post('/getStudent', getAllStudentsBysemAndReg);

export default router;


 