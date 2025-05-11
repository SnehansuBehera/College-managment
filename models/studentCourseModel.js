import { supabase } from '../config/supabase.js';

export const getStudentCourses = () =>
  supabase
    .from('student_course')
    .select('*')
    .order('student_id', { ascending: true })
    .order('semester', { ascending: true });

export const enrollStudentCourse = ({ student_id, subject_ids, semester }) =>
  supabase
    .from('student_course')
    .insert([{ student_id, subject_ids, semester }]);

export const updateStudentCourse = (id, changes) =>
  supabase
    .from('student_course')
    .update(changes)
    .eq('id', id);

export const deleteStudentCourse = (id) =>
  supabase
    .from('student_course')
    .delete()
    .eq('id', id);
