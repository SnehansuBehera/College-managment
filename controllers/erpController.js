import { supabase } from "../config/supabse-config.js";

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
