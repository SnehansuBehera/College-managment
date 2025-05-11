import { supabase } from "../config/supabase.js";

export const erpRegistration = async (req, res) => {
  try {
    const { reg_no, semester, elective_subject_ids = [] } = req.body;

    // 1. Fetch enrolled subjects
    const { data: studentCourse, error: fetchErr } = await supabase
      .from("student_course")
      .select("subject_ids")
      .eq("reg_no", reg_no)
      .eq("semester", semester)
      .single();

    if (fetchErr || !studentCourse) {
      return res.status(404).json({ error: "Student course info not found" });
    }

    const enrolledSubjects = [...studentCourse.subject_ids];

    // 2. Fetch previous semester exams
    const previousSemester = semester - 1;
    const { data: previousExams, error: examsErr } = await supabase
      .from("exams")
      .select("id, subject_id")
      .eq("semester", previousSemester);

    if (examsErr || !previousExams) {
      return res.status(500).json({ error: "Error fetching previous semester exams" });
    }

    // 3. Fetch F-grade results for the student (potential backlogs)
    const { data: backlogResults, error: backlogErr } = await supabase
      .from("exam_results")
      .select("exam_id")
      .eq("reg_no", reg_no)
      .eq("grade", "F");

    let backlogSubjects = [];
    if (!backlogErr && backlogResults?.length > 0) {
      const failedExamIds = backlogResults.map(result => result.exam_id);

      const matchedExams = previousExams.filter(exam => failedExamIds.includes(exam.id));
      backlogSubjects = matchedExams.map(exam => exam.subject_id);

      if (backlogSubjects.length > 0 && elective_subject_ids.length > 0) {
        return res.status(400).json({
          error: "Backlog detected: Electives cannot be selected for this semester",
        });
      }

      enrolledSubjects.push(...backlogSubjects);
    }

    // 4. Combine subjects (enrolled + electives)
    const allSubjects = [...new Set([...enrolledSubjects, ...elective_subject_ids])];

    // 5. Check for existing registration for this semester
    const { data: existingReg, error: existingRegErr } = await supabase
      .from("exam_registrations")
      .select("reg_no")
      .eq("reg_no", reg_no)
      .eq("semester", semester)
      .single();

    if (!existingRegErr && existingReg) {
      return res.status(400).json({ error: "You have already registered for this semester." });
    }

    // 6. Insert the registration
    const registration = {
      reg_no,
      semester,
      backlog_subjects: backlogSubjects,
      subjects: enrolledSubjects,
      elective_subjects: elective_subject_ids,
      registration_date: new Date(),
    };

    const { error: insertErr } = await supabase
      .from("exam_registrations")
      .insert([registration]);

    if (insertErr) {
      return res.status(500).json({ error: "Insert failed", details: insertErr.message });
    }

    return res.json({
      message: "Exam registration successful",
        registered_subjects: allSubjects,
        backlog_subjects: backlogSubjects,
        elective_subjects: elective_subject_ids,
        registration_date: registration.registration_date,
        semester: semester
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
};

export const getAllRegistrations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('reg_no, semester, subjects, elective_subjects, backlog_subjects, registration_date')
      .order('semester', { ascending: true });
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching registrations" });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No registrations found" });
    }
    const formattedData = data.map(item => ({
      reg_no: item.reg_no,
      semester: item.semester,
      subjects: item.subjects,
      elective_subjects: item.elective_subjects,
      backlog_subjects: item.backlog_subjects,
      registration_date: new Date(item.registration_date).toLocaleDateString(),
    }));
    res.status(200).json({ status: 200, message:"Fetched registrations successfully", data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
}

export const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('reg_no, semester, subjects, elective_subjects, backlog_subjects, registration_date')
      .eq('id', id)
      .single();
    if(error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching registration" });
    }
    if (!data) {
      return res.status(404).json({ message: "Registration not found" });
    }
    const formattedData = {
      reg_no: data.reg_no,
      semester: data.semester,
      subjects: data.subjects,
      elective_subjects: data.elective_subjects,
      backlog_subjects: data.backlog_subjects,
      registration_date: new Date(data.registration_date).toLocaleDateString(),
    };
    res.status(200).json({ status: 200, message:"Fetched registration successfully", data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
    
  }
}
export const getRegistrationByStudentAndSemester = async (req, res) => {
  try {
    const { reg_no, semester } = req.params;

    const { data, error } = await supabase
      .from('exam_registrations')
      .select('reg_no, semester, subjects, elective_subjects, backlog_subjects, registration_date')
      .eq('reg_no', reg_no)
      .eq('semester', semester)
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching registration" });
    }

    if (!data) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const formattedData = {
      reg_no: data.reg_no,
      semester: data.semester,
      subjects: data.subjects,
      elective_subjects: data.elective_subjects,
      backlog_subjects: data.backlog_subjects,
      registration_date: new Date(data.registration_date).toLocaleDateString(),
    };

    res.status(200).json({ status: 200, message: "Fetched registration successfully", data: formattedData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRegistrationsBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    // reg_no = Number(reg_no);
    console.log(semester)
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('reg_no, semester, subjects, elective_subjects, backlog_subjects, registration_date')
      .eq('semester', semester)
      .order('reg_no', { ascending: true });
    console.log(data)
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching registrations" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No registrations found for this student" });
    }

    const formattedData = data.map(item => ({
      reg_no: item.reg_no,
      semester: item.semester,
      subjects: item.subjects,
      elective_subjects: item.elective_subjects,
      backlog_subjects: item.backlog_subjects,
      registration_date: new Date(item.registration_date).toLocaleDateString(),
    }));

    res.status(200).json({ status: 200, message: "Fetched registrations successfully", data: formattedData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getRegistrationsByStudent = async (req, res) => {
  try {
    const { reg_no } = req.params;
    // reg_no = Number(reg_no);
    // console.log(semester)
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('reg_no, semester, subjects, elective_subjects, backlog_subjects, registration_date')
      .eq('reg_no', reg_no)
      .order('semester', { ascending: true });
    console.log(data)
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching registrations" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No registrations found for this student" });
    }

    const formattedData = data.map(item => ({
      reg_no: item.reg_no,
      semester: item.semester,
      subjects: item.subjects,
      elective_subjects: item.elective_subjects,
      backlog_subjects: item.backlog_subjects,
      registration_date: new Date(item.registration_date).toLocaleDateString(),
    }));

    res.status(200).json({ status: 200, message: "Fetched registrations successfully", data: formattedData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const modifySubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      add_backlog = [], remove_backlog = [],
      add_subjects = [], remove_subjects = [],
      add_electives = [], remove_electives = []
    } = req.body;

    const { data: registration, error: fetchError } = await supabase
      .from("exam_registrations")
      .select("backlog_subjects, subjects, elective_subjects")
      .eq("id", id)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    const updateArray = (original, toAdd, toRemove) => {
      const added = [...original, ...toAdd];
      const withoutDuplicates = Array.from(new Set(added));
      return withoutDuplicates.filter(item => !toRemove.includes(item));
    };

    const updatedBacklog = updateArray(registration.backlog_subjects, add_backlog, remove_backlog);
    const updatedSubjects = updateArray(registration.subjects, add_subjects, remove_subjects);
    const updatedElectives = updateArray(registration.elective_subjects, add_electives, remove_electives);

    const { error: updateError, data: updated } = await supabase
      .from("exam_registrations")
      .update({
        backlog_subjects: updatedBacklog,
        subjects: updatedSubjects,
        elective_subjects: updatedElectives
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: "Update failed", details: updateError.message });
    }

    return res.status(200).json({
      message: "Subjects updated successfully",
      updated_registration: updated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteAllRegistrations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exam_registrations')
      .delete()
      .neq('id', 0);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error deleting all registrations" });
    }

    res.status(200).json({ status: 200, message: "All exam registrations deleted successfully", deletedData: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('exam_registrations')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error deleting registration" });
    }

    if (!data) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({ status: 200, message: "Registration deleted successfully", deleted: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
