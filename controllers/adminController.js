import * as Course           from '../models/courseModel.js';
import * as ProfCourseModel  from '../models/professorCourseModel.js';
import * as StudCourseModel  from '../models/studentCourseModel.js';

// — COURSES —
export const listCourses = async (req, res, next) => {
  const { data, error } = await Course.getCourses();
  if (error) return next(error);
  res.json(data);
};

export const createCourse = async (req, res, next) => {
  const { name, description } = req.body;
  const { data, error } = await Course.createCourse({ name, description });
  if (error) return next(error);
  res.status(201).json(data);
};

export const updateCourse = async (req, res, next) => {
  const { id } = req.params;
  const { data, error } = await Course.updateCourse(id, req.body);
  if (error) return next(error);
  res.json(data);
};

export const deleteCourse = async (req, res, next) => {
  const { id } = req.params;
  const { error } = await Course.deleteCourse(id);
  if (error) return next(error);
  res.status(204).end();
};

// — PROFESSOR-COURSE —
export const listProfessorCourses = async (req, res, next) => {
  const { data, error } = await ProfCourseModel.getProfessorCourses();
  if (error) return next(error);
  res.json(data);
};

export const assignProfessorCourse = async (req, res, next) => {
  const { prof_id, subject_id, semester } = req.body;
  const { data, error } = await ProfCourseModel.assignProfessorCourse({ prof_id, subject_id, semester });
  if (error) return next(error);
  res.status(201).json(data);
};

export const updateProfessorCourse = async (req, res, next) => {
  const { id } = req.params;
  const { data, error } = await ProfCourseModel.updateProfessorCourse(id, req.body);
  if (error) return next(error);
  res.json(data);
};

export const deleteProfessorCourse = async (req, res, next) => {
  const { id } = req.params;
  const { error } = await ProfCourseModel.deleteProfessorCourse(id);
  if (error) return next(error);
  res.status(204).end();
};

// — STUDENT-COURSE —
export const listStudentCourses = async (req, res, next) => {
  const { data, error } = await StudCourseModel.getStudentCourses();
  if (error) return next(error);
  res.json(data);
};

export const enrollStudentCourse = async (req, res, next) => {
  const { student_id, subject_ids, semester } = req.body;
  const { data, error } = await StudCourseModel.enrollStudentCourse({ student_id, subject_ids, semester });
  if (error) return next(error);
  res.status(201).json(data);
};

export const updateStudentCourse = async (req, res, next) => {
  const { id } = req.params;
  const { data, error } = await StudCourseModel.updateStudentCourse(id, req.body);
  if (error) return next(error);
  res.json(data);
};

export const deleteStudentCourse = async (req, res, next) => {
  const { id } = req.params;
  const { error } = await StudCourseModel.deleteStudentCourse(id);
  if (error) return next(error);
  res.status(204).end();
};
