import * as Course from '../models/courseModel.js';

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