import { supabase } from '../config/supabase.js';

export const getProfessorCourses = () =>
  supabase
    .from('professor_course')
    .select('*')
    .order('prof_id', { ascending: true })
    .order('semester', { ascending: true });

export const assignProfessorCourse = async ({ prof_id, subject_id, semester }) => {
  const {data, error} = await supabase
    .from('professor_course')
    .insert([{ prof_id, subject_id, semester }]);
  return {data, error};
}
  

export const updateProfessorCourse = (id, changes) =>
  supabase
    .from('professor_course')
    .update(changes)
    .eq('id', id);

export const deleteProfessorCourse = (id) =>
  supabase
    .from('professor_course')
    .delete()
    .eq('id', id);
