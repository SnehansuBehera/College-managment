import { supabase } from "../config/supabse-config.js";

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

export const assignGrades = async (req, res) => {
    try {
        const { exam_id, reg_no, marks_obtained, grade } = req.body;
        const { data: exam, error: examErr } = await supabase.from('exams').select('*').eq('id', exam_id).single();
        if (!exam) {
            return res.status(400).json({status:400, error: "Exam not found" });
        }
        if (examErr) {
            console.log(examErr.mesaage)
            return res.status(400).json({ status: 400, error: examErr.message });
        }
        const { data, error } = await supabase.from('exam_results').insert([{
            exam_id, reg_no, marks_obtained, grade
        }]).select();

        if (error) return res.status(400).json({status:400, data: error });
        res.status(200).json({status:200, message:"Result assigned", data: data[0]});
    } catch (error) {
        console.error("Error assigning grades:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

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

export const getSubjectResultsBySemAndType = async (req, res) => {
    try {
        const { subject_id, semester, exam_type } = req.query;

        if (!subject_id || !semester || !exam_type) {
            return res.status(400).json({
                status: 400,
                error: "subject_id, semester, and exam_type are required",
            });
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

        if (error) {
            return res.status(400).json({ status: 400, error: error.message });
        }

        const filtered = data.filter(result =>
            result.exams &&
            result.exams.subject_id === subject_id &&
            result.exams.semester == semester &&
            result.exams.exam_type === exam_type
        );

        res.status(200).json({ status: 200, data: filtered });
    } catch (error) {
        console.error("Error fetching filtered results:", error);
        res.status(500).json({ status: 500, error: "Internal server error" });
    }
};
