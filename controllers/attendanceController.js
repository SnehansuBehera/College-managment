import { markAttendance, onAttendanceChange } from '../College-managment/models/attendanceModel.js';
import { supabase } from '../config/supabase.js';

/**
 * Controller to mark attendance for a student in a course.
 */
export const takeAttendance = async (req, res) => {
    try {
        const { reg_no, subject_id, status } = req.body;

        // Validate required fields
        if (!reg_no || !subject_id || !status) {
            return res.status(400).json({ error: 'reg_no, subject_id, and status are required.' });
        }

        // First, check if the subject exists
        const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('subject_id')
            .eq('subject_id', subject_id)
            .single();

        if (subjectError || !subjectData) {
            return res.status(400).json({ error: `Subject ${subject_id} does not exist.` });
        }

        // Now mark attendance
        const { data, error } = await markAttendance({ reg_no, subject_id, status });

        if (error) {
            console.error('Error marking attendance:', error);
            return res.status(500).json({ error: 'Failed to mark attendance' });
        }

        return res.status(201).json(data);
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * SSE endpoint: subscribe to attendance changes in real-time.
 */
export const subscribeAttendance = (req, res) => {
    try {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });

        const subscription = onAttendanceChange(payload => {
            res.write(`data: ${JSON.stringify(payload.new)}\n\n`);
        });

        req.on('close', () => subscription.unsubscribe());
    } catch (err) {
        console.error('SSE error:', err);
        res.status(500).json({ error: 'Failed to subscribe to attendance updates' });
    }
};