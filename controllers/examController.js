import { supabase } from "../config/supabase.js";

export const createExams = async (req, res) => {
    try {
        const { subject_id, prof_id, exam_type, semester, max_marks, exam_date } = req.body;

        if (!subject_id || !prof_id || !exam_type || !semester || !max_marks || !exam_date) { 
            return res.status(400).json({ status: 400, message: "All fields are required" });
        }

        const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id')
            .eq('id', subject_id)
            .eq('semester', semester)
            .single();

        if (subjectError || !subjectData) {
            return res.status(404).json({ status: 404, message: "Subject not found for the given semester" });
        }

        const { data, error } = await supabase
            .from('exams')
            .insert([{
                subject_id,
                prof_id,
                exam_type,
                semester,
                max_marks,
                exam_date
            }])
            .select();

        if (error) {
            console.error("Error creating exam:", error);
            if (error.code === '23505') {
                return res.status(400).json({ error: "Exam already exists" });
            }
            return res.status(500).json({ error: "Failed to insert exam" });
        }

        res.status(200).json({ status: 200, message: "Exam created", data: data[0] });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getAllExams = async (req, res) => {
    try {
        const { data, error } = await supabase.from('exams').select('*');

        if (error) {
            console.error("Error fetching exams:", error);
            return res.status(400).json({status:400, message: "No exams available", error: error.message });
        }

        res.status(200).json({ status: 200, mesaage: "Retrieved exams", data });
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getExamById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ status: 400, message: "Exam ID is required" });
            return
        }
        const { data, error } = await supabase.from('exams').select('*').eq('id', id).single();

        if (error) {
            console.error("Error fetching exam:", error);
            return res.status(400).json({ status: 400, message: "Exam not found" });
        }

        res.status(200).json({ status: 200,mesaage:"Exam Retrieved", data });
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ status: 400, message: "Exam ID is required" });
            return
        }
        const { subject_id, prof_id, exam_type, semester, max_marks, exam_date } = req.body;

        const { data, error } = await supabase
            .from('exams')
            .update({ subject_id, prof_id, exam_type, semester, max_marks, exam_date })
            .eq('id', id)
            .select();

        if (error || !data.length) {
            console.error("Error updating exam:", error);
            return res.status(400).json({ status: 400, message: "Exam not found or update failed" });
        }

        res.status(200).json({ status: 200, message: "Exam updated", data: data[0] });
    } catch (error) {
        console.error("Error updating exam:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ status: 400, message: "Exam ID is required" });
            return
        }
        const { data, error } = await supabase.from('exams').delete().eq('id', id).select();

        if (error || !data.length) {
            console.error("Error deleting exam:", error);
            return res.status(400).json({ status: 400, message: "Exam not found or delete failed" });
        }

        res.status(200).json({ status: 200, message: "Exam deleted", data: data[0] });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
//-----------------------------------------------------------------------------------------------------------
export const createExamResult = async (req, res) => {
  try {
    const {
      subject_id,
      prof_id,
      semester,
      reg_no,
      midsem_marks = 0,
      endsem_marks = 0,
      classtest_marks = 0,
      grade,
    } = req.body;

    if (!subject_id || !prof_id || !semester || !reg_no || !grade) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 1: Insert or update exam result
    const { error: resultErr } = await supabase
      .from("exam_results")
      .upsert({
        subject_id,
        prof_id,
        reg_no,
        midsem_marks,
        endsem_marks,
        classtest_marks,
        grade,
      });

    if (resultErr) {
      console.error("Error inserting exam result:", resultErr);
      return res.status(500).json({ error: "Failed to insert exam result" });
    }

    const nextSemester = semester + 1;

    // Step 2: Add all next semester subjects to student_course
    const { data: nextSubjects, error: subjectErr } = await supabase
      .from("subjects")
      .select("subject_id")
      .eq("semester", nextSemester);

    if (subjectErr || !nextSubjects) {
      console.error("Error fetching next semester subjects:", subjectErr);
      return res.status(500).json({ error: "Failed to fetch next semester subjects" });
    }
    console.log(nextSubjects)
    const subjectIds = nextSubjects.map((s) => s.subject_id);

    
      const { data: exists } = await supabase
        .from("student_course")
        .select("*")
        .eq("reg_no", reg_no)
        .eq("subject_ids", subjectIds)
        .maybeSingle();

      if (!exists) {
        const { error: insertErr } = await supabase
          .from("student_course")
          .insert([{ reg_no, subject_ids: subjectIds, semester: nextSemester }]);

        if (insertErr) {
          console.error("Error inserting student_course:", insertErr);
          return res.status(500).json({ error: "Failed to insert into student_course" });
        }
      }
    

    // Step 3: If grade is 'F', insert failed subject into backlog
    if (grade === "F") {
      const { data: existingBacklog } = await supabase
        .from("backlog")
        .select("*")
        .eq("reg_no", reg_no)
        .eq("semester", nextSemester)
        .maybeSingle();

      if (existingBacklog) {
        const updatedSubjects = Array.from(
          new Set([...existingBacklog.subject_ids, subject_id])
        );

        const { error: updateErr } = await supabase
          .from("backlog")
          .update({ subject_ids: updatedSubjects })
          .eq("reg_no", reg_no)
          .eq("semester", nextSemester);

        if (updateErr) {
          console.error("Error updating backlog:", updateErr);
          return res.status(500).json({ error: "Failed to update backlog" });
        }
      } else {
        const { error: insertErr } = await supabase
          .from("backlog")
          .insert([{ reg_no, semester: nextSemester, subject_ids: [subject_id] }]);

        if (insertErr) {
          console.error("Error inserting backlog:", insertErr);
          return res.status(500).json({ error: "Failed to insert backlog" });
        }
      }
    }

    return res.status(200).json({ message: "Exam result and updates saved successfully." });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateResult = async (req, res) => {
  try {
    const {
      subject_id,
      prof_id,
      semester,
      reg_no,
      midsem_marks = 0,
      endsem_marks = 0,
      classtest_marks = 0,
      grade,
    } = req.body;

    if (!subject_id || !prof_id || !semester || !reg_no || !grade) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nextSemester = semester + 1;

    // Step 1: Get previous grade
    const { data: prevResult, error: fetchErr } = await supabase
      .from("exam_results")
      .select("grade")
      .eq("subject_id", subject_id)
      .eq("reg_no", reg_no)
      .maybeSingle();

    if (fetchErr) {
      console.error("Error fetching previous exam result:", fetchErr);
      return res.status(500).json({ error: "Failed to fetch existing exam result" });
    }

    // Step 2: Update exam result
    const { error: updateError } = await supabase
      .from("exam_results")
      .update({
        midsem_marks,
        endsem_marks,
        classtest_marks,
        grade,
      })
      .eq("subject_id", subject_id)
      .eq("prof_id", prof_id)
      .eq("reg_no", reg_no);

    if (updateError) {
      console.error("Error updating exam result:", updateError);
      return res.status(500).json({ error: "Failed to update exam result" });
    }

    // Step 3: Manage student_course (same logic as before)
    const { data: nextSubjects, error: subjectErr } = await supabase
      .from("subjects")
      .select("subject_id")
      .eq("semester", nextSemester);

    if (subjectErr || !nextSubjects) {
      console.error("Error fetching next semester subjects:", subjectErr);
      return res.status(500).json({ error: "Failed to fetch next semester subjects" });
    }

    const subjectIds = nextSubjects.map((s) => s.subject_id);

    const { data: exists } = await supabase
      .from("student_course")
      .select("*")
      .eq("reg_no", reg_no)
      .eq("semester", nextSemester)
      .maybeSingle();

    if (!exists) {
      const { error: insertErr } = await supabase
        .from("student_course")
        .insert([{ reg_no, subject_ids: subjectIds, semester: nextSemester }]);

      if (insertErr) {
        console.error("Error inserting student_course:", insertErr);
        return res.status(500).json({ error: "Failed to insert into student_course" });
      }
    }

    // Step 4: Handle backlog updates
    const { data: existingBacklog, error: backlogErr } = await supabase
      .from("backlog")
      .select("*")
      .eq("reg_no", reg_no)
      .eq("semester", nextSemester)
      .maybeSingle();

    // CASE 1: Grade changed TO F => Add to backlog
    if (grade === "F") {
      if (existingBacklog) {
        const updatedSubjects = Array.from(
          new Set([...existingBacklog.subject_ids, subject_id])
        );

        const { error: updateBacklogErr } = await supabase
          .from("backlog")
          .update({ subject_ids: updatedSubjects })
          .eq("reg_no", reg_no)
          .eq("semester", nextSemester);

        if (updateBacklogErr) {
          console.error("Error updating backlog:", updateBacklogErr);
          return res.status(500).json({ error: "Failed to update backlog" });
        }
      } else {
        const { error: insertBacklogErr } = await supabase
          .from("backlog")
          .insert([{ reg_no, semester: nextSemester, subject_ids: [subject_id] }]);

        if (insertBacklogErr) {
          console.error("Error inserting into backlog:", insertBacklogErr);
          return res.status(500).json({ error: "Failed to insert backlog" });
        }
      }
    }

    // CASE 2: Grade changed FROM F => Remove from backlog
    if (prevResult?.grade === "F" && grade !== "F" && existingBacklog) {
      const updatedSubjects = existingBacklog.subject_ids.filter((id) => id !== subject_id);

      if (updatedSubjects.length === 0) {
        // Delete backlog record if no more failed subjects
        const { error: deleteErr } = await supabase
          .from("backlog")
          .delete()
          .eq("reg_no", reg_no)
          .eq("semester", nextSemester);

        if (deleteErr) {
          console.error("Error deleting empty backlog:", deleteErr);
          return res.status(500).json({ error: "Failed to delete backlog" });
        }
      } else {
        const { error: updateBacklogErr } = await supabase
          .from("backlog")
          .update({ subject_ids: updatedSubjects })
          .eq("reg_no", reg_no)
          .eq("semester", nextSemester);

        if (updateBacklogErr) {
          console.error("Error updating backlog after pass:", updateBacklogErr);
          return res.status(500).json({ error: "Failed to update backlog" });
        }
      }
    }

    return res.status(200).json({ message: "Exam result and backlog updated successfully." });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getExamResults = async (req, res) => {
    try {
        const { reg_no, exam_id } = req.query;

        let query = supabase.from('exam_results').select('*');

        if (reg_no) query = query.eq('reg_no', reg_no);
        if (exam_id) query = query.eq('exam_id', exam_id);

        const { data, error } = await query;

        if (error) return res.status(400).json({ status: 400, error: error.message });
        res.status(200).json({ status: 200, data });
    } catch (error) {
        console.error("Error reading results:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};

export const getStudentSemesterResults = async (req, res) => {
    try {
        const { reg_no, semester } = req.query;
        console.log(semester)
        if (!reg_no || !semester) {
            return res.status(400).json({ status: 400, error: "reg_no and semester are required" });
        }

        const { data, error } = await supabase
            .from('exam_results')
            .select(`
                *,
                exams (
                    id,
                    subject_id,
                    semester
                )
            `)
            .eq('reg_no', reg_no)
            .filter('exams.semester', 'eq', semester);
        console.log(data)
        if (error) return res.status(400).json({ status: 400, error: error.message });

        const filtered = data.filter((result)=> result.exams && result.exams?.semester === Number(semester));
        console.log(filtered);
        res.status(200).json({ status: 200, data: filtered });
    } catch (error) {
        console.error("Error fetching semester results:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};


export const updateExamResult = async (req, res) => {
    try {
        const { exam_id, reg_no, marks_obtained, grade } = req.body;

        const { data, error } = await supabase
            .from('exam_results')
            .update({ marks_obtained, grade })
            .eq('exam_id', exam_id)
            .eq('reg_no', reg_no)
            .select();

        if (error) return res.status(400).json({ status: 400, error: error.message });
        res.status(200).json({ status: 200, message: "Result updated", data: data[0] });
    } catch (error) {
        console.error("Error updating result:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};
export const deleteExamResult = async (req, res) => {
    try {
        const { exam_id, reg_no } = req.params;

        const { data, error } = await supabase
            .from('exam_results')
            .delete()
            .eq('exam_id', exam_id)
            .eq('reg_no', reg_no)
            .select();

        if (error) return res.status(400).json({ status: 400, error: error.message });
        res.status(200).json({ status: 200, message: "Result deleted", data: data[0] });
    } catch (error) {
        console.error("Error deleting result:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};

export const getStudentResultsBySemAndType = async (req, res) => {
    try {
        const { reg_no, semester, exam_type } = req.query;

        if (!reg_no || !semester || !exam_type) {
            return res.status(400).json({ status: 400, error: "reg_no, semester and exam_type are required" });
        }

        const { data, error } = await supabase
            .from('exam_results')
            .select(`
                *,
                exams (
                    id,
                    subject_id,
                    semester,
                    exam_type
                )
            `)
            .eq('reg_no', reg_no);

        if (error) return res.status(400).json({ status: 400, error: error.message });

        const filtered = data.filter(result => 
            result.exams &&
            result.exams.semester == semester &&
            result.exams.exam_type === exam_type
        );

        res.status(200).json({ status: 200, data: filtered });
    } catch (error) {
        console.error("Error fetching student results:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};
export const getAllResultsBySemAndType = async (req, res) => {
    try {
        const { semester, exam_type } = req.query;

        if (!semester || !exam_type) {
            return res.status(400).json({ status: 400, error: "semester and exam_type are required" });
        }

        const { data, error } = await supabase
            .from('exam_results')
            .select(`
                *,
                exams (
                    id,
                    subject_id,
                    semester,
                    exam_type
                )
            `);

        if (error) return res.status(400).json({ status: 400, error: error.message });

        const filtered = data.filter(result => 
            result.exams &&
            result.exams.semester == semester &&
            result.exams.exam_type === exam_type
        );

        res.status(200).json({ status: 200, data: filtered });
    } catch (error) {
        console.error("Error fetching all results:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};

// GET /api/admin/studentResults?reg_no=123&semester=5
export const getStudentResultsBySemester = async (req, res) => {
  const { reg_no, semester } = req.query;

  if (!reg_no || !semester) {
    return res.status(400).json({ error: "Missing reg_no or semester" });
  }

  try {
    // 1. Get subject_ids for this student & semester
    const { data: studentCourses, error: courseError } = await supabase
      .from("student_course")
      .select("subject_ids")
      .eq("reg_no", reg_no)
      .eq("semester", semester)
      .single();

    if (courseError || !studentCourses) {
      return res.status(404).json({ error: "No enrolled subjects found" });
    }

    const subjectIds = studentCourses.subject_ids;

    // 2. Fetch results for these subject_ids
    const { data: results, error: resultError } = await supabase
      .from("exam_results")
      .select("subject_id, midsem_marks, endsem_marks, classtest_marks, grade")
      .eq("reg_no", reg_no)
      .in("subject_id", subjectIds);

    if (resultError) {
      return res.status(500).json({ error: resultError.message });
    }

    return res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getStudentGrades = async (req, res) => {
    try {
        const { subject_id} = req.body;

  if (!subject_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("exam_results")
    .select("reg_no, midsem_marks, endsem_marks, classtest_marks, grade")
    .eq("subject_id", subject_id)

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch grades" });
  }

  return res.json({ grades: data });
    } catch (error) {
        console.error("Error fetching student grades:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
    
}