import { supabase } from "../config/supabase.js";

export const getProfCoursesByProfID = async (req, res) => {
  const { prof_id } = req.params;

  try {
    const { data: courseData, error: courseError } = await supabase
      .from("professor_course")
      .select("subject_id")
      .eq("prof_id", prof_id);

    if (courseError) {
      console.error("Error fetching subject_ids:", courseError);
      return res.status(500).json({ error: "Failed to fetch professor's subject_ids" });
    }

    if (!courseData || courseData.length === 0) {
      return res.status(404).json({ message: "No subjects assigned to this professor" });
    }

    const subjectIds = courseData.map((item) => item.subject_id);

    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("subject_id, name, semester")
      .in("subject_id", subjectIds);

    if (subjectsError) {
      console.error("Error fetching subject details:", subjectsError);
      return res.status(500).json({ error: "Failed to fetch subject details" });
    }

    // Add mock values for fields expected on frontend
    const formatted = subjects.map((s) => ({
      _id: s.subject_id,
      name: s.name,
      code: s.subject_id,        
      semester: s.semester,
      credits: 3         
    }));

    res.json({ courses: formatted });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
