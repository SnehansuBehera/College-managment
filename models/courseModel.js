import { supabase } from '../config/supabase.js';

export const getCourses = () => supabase.from('courses').select('*');
export const getCourseById = (id) => supabase.from('courses').select('*').eq('id', id).single();
export const createCourse = (data) => supabase.from('courses').insert(data);
export const updateCourse = (id, data) => supabase.from('courses').update(data).eq('id', id);
export const deleteCourse = (id) => supabase.from('courses').delete().eq('id', id);  