import * as Course           from '../models/courseModel.js';
import * as ProfCourseModel  from '../models/professorCourseModel.js';
import * as StudCourseModel  from '../models/studentCourseModel.js';
import { supabase } from '../config/supabase.js';

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

export const assignProfessorCourseHandler = async (req, res, next) => {
  const { prof_id, subject_id, semester } = req.body;
  const { data, error } = ProfCourseModel.assignProfessorCourse({ prof_id, subject_id, semester });
  console.log(data)
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
  const { reg_no, subject_ids, semester } = req.body;
  const { data, error } = await StudCourseModel.enrollStudentCourse({ reg_no, subject_ids, semester });
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

export const getStudentCoursesbyReg = async (req, res) => {
  try {
    const { reg_no } = req.params;

    // Fetch the student's enrolled subject_ids for all semesters
    const { data: studentCourses, error } = await supabase
      .from("student_course")
      .select("semester, subject_ids")
      .eq("reg_no", reg_no)
      .order("semester", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    let allCourses = [];
    let maxSemester = 0;

    for (const entry of studentCourses) {
      const { semester, subject_ids } = entry;

      // Track max semester
      if (semester > maxSemester) {
        maxSemester = semester;
      }

      // Fetch subject details based on subject_ids
      const { data: subjects, error: subjectErr } = await supabase
        .from("subjects")
        .select("subject_id, name, semester")
        .in("subject_id", subject_ids);

      if (subjectErr) return res.status(500).json({ error: subjectErr.message });

      // Attach semester to each course (though it's already there in subject)
      const detailedCourses = subjects.map((subj) => ({
        ...subj,
        semester,
      }));

      allCourses.push(...detailedCourses);
    }

    return res.json({
      maxSemester,
      courses: allCourses,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getStudentCoursesbySemAndReg = async (req, res) => {
  try {
    const { reg_no, semester } = req.params;

    const { data: studentCourse, error } = await supabase
      .from("student_course")
      .select("semester, subject_ids")
      .eq("reg_no", reg_no)
      .eq("semester", semester)
      .single();

    if (error || !studentCourse) {
      return res.status(404).json({ error: "Student course info not found" });
    }

    const { subject_ids } = studentCourse;

    const { data: subjects, error: subjectErr } = await supabase
      .from("subjects")
      .select("subject_id, name, semester")
      .in("subject_id", subject_ids);

    if (subjectErr) {
      return res.status(500).json({ error: subjectErr.message });
    }

    const detailedCourses = subjects.map((subj) => ({
      ...subj,
      semester: studentCourse.semester,
    }));

    return res.json({ courses: detailedCourses });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const createBacklog = async (req, res) => {
  try {
    const { reg_no, semester } = req.body;

    if (!reg_no || !semester) {
      return res.status(400).json({ error: "reg_no and semester are required." });
    }

    const previousSemester = semester - 1;
    if (previousSemester <= 0) {
      return res.status(400).json({ error: "No previous semester exists." });
    }

    // Check if backlog already exists
    const { data: existing, error: existingErr } = await supabase
      .from("backlog")
      .select("*")
      .eq("reg_no", reg_no)
      .eq("semester", semester);

    if (existing?.length) {
      return res.status(200).json({ subject_ids: existing[0].subject_ids });
    }

    const { data: previousExams, error: examsErr } = await supabase
      .from("exams")
      .select("id, subject_id")
      .eq("semester", previousSemester);

    if (examsErr || !previousExams?.length) {
      return res.status(404).json({ error: "Previous semester exams not found." });
    }

    const examIdToSubjectMap = {};
    previousExams.forEach((exam) => {
      examIdToSubjectMap[exam.id] = exam.subject_id;
    });

    const { data: failedResults, error: resultsErr } = await supabase
      .from("exam_results")
      .select("exam_id")
      .eq("reg_no", reg_no)
      .eq("grade", "F");

    if (resultsErr) {
      return res.status(500).json({ error: "Error fetching exam results." });
    }

    const failedSubjectIds = failedResults
      .map((r) => examIdToSubjectMap[r.exam_id])
      .filter(Boolean);

    if (!failedSubjectIds.length) {
      return res.status(200).json({ subject_ids: [] });
    }

    const { error: insertErr } = await supabase
      .from("backlog")
      .insert([{ reg_no, semester, subject_ids: failedSubjectIds }]);

    if (insertErr) {
      return res.status(500).json({ error: "Failed to insert into backlog.", details: insertErr.message });
    }

    return res.json({
      message: "Backlog record created successfully",
      subject_ids: failedSubjectIds,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
};


export const getBacklog = async (req, res) => { 
  try {
    const { reg_no } = req.params;

    const { data, error } = await supabase
      .from("backlog")
      .select("*")
      .eq("reg_no", reg_no);

    if (error) {
      return res.status(500).json({ error: "Error fetching backlog data." });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export const getSubjectDetailsfromSubjectIDs = async (req, res) => { 
  const { subject_ids } = req.body;

  if (!Array.isArray(subject_ids) || subject_ids.length === 0) {
    return res.status(400).json({ error: "subject_ids must be a non-empty array" });
  }

  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .in("subject_id", subject_ids);

    if (error) throw error;

    return res.status(200).json({ subjects: data });
  } catch (err) {
    console.error("Error fetching subjects by IDs:", err);
    return res.status(500).json({ error: "Failed to fetch subject details" });
  }
}



export const getAllStudentsBysemAndReg = async (req, res) => {
  const { subjectID, semester, prof_id } = req.body;

  if (!subjectID || !semester || !prof_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Check if professor is assigned to the subject
    const { data: profCourse, error: profError } = await supabase
      .from("professor_course")
      .select("*")
      .eq("prof_id", prof_id)
      .eq("subject_id", subjectID)
      .eq("semester", semester)
      .single();

    if (profError || !profCourse) {
      return res.status(403).json({
        error: "Unauthorized: Professor is not assigned to this subject",
      });
    }

    // 2. Fetch student_course records for the given semester
    const { data: studentCourses, error: studentError } = await supabase
      .from("student_course")
      .select("reg_no, subject_ids")
      .eq("semester", semester);

    if (studentError) {
      return res.status(500).json({ error: studentError.message });
    }

    // 3. Filter students who have subjectID in subject_ids
    const eligibleStudents = studentCourses.filter((student) =>
      student.subject_ids.includes(subjectID)
    );

    const eligibleRegNos = eligibleStudents.map((s) => s.reg_no);

    // 4. Fetch exam_registrations for these reg_nos
    const { data: registrations, error: regError } = await supabase
      .from("exam_registrations")
      .select("reg_no, subjects")
      .eq("semester", semester)
      .in("reg_no", eligibleRegNos);

    if (regError) {
      return res.status(500).json({ error: regError.message });
    }

    // 5. Filter students who registered for this subject
    const finalRegNos = registrations
      .filter((r) => r.subjects.includes(subjectID))
      .map((r) => r.reg_no);

    return res.status(200).json({ students: finalRegNos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
