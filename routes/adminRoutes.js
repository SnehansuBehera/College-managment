import express from 'express';
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,

  listProfessorCourses,
  assignProfessorCourse,
  updateProfessorCourse,
  deleteProfessorCourse,

  listStudentCourses,
  enrollStudentCourse,
  updateStudentCourse,
  deleteStudentCourse
} from '../controllers/adminController.js';

const router = express.Router();

// — COURSES —
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// — PROFESSOR_COURSE —
router.get('/professor_courses', listProfessorCourses);
router.post('/professor_courses', assignProfessorCourse);
router.put('/professor_courses/:id', updateProfessorCourse);
router.delete('/professor_courses/:id', deleteProfessorCourse);

// — STUDENT_COURSE —
router.get('/student_courses', listStudentCourses);
router.post('/student_courses', enrollStudentCourse);
router.put('/student_courses/:id', updateStudentCourse);
router.delete('/student_courses/:id', deleteStudentCourse);

export default router;


 