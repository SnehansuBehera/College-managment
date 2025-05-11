import { supabase } from '../config/supabase.js';

/**
 * Marks attendance by upserting attendance_count in attendance_mark table.
 */
export const markAttendance = async ({ reg_no, subject_id, status }) => {
    try {
        const attendanceValue = status === 'present' ? 1 : 0;

        // Upsert: insert new row or update existing attendance_count
        const { data, error } = await supabase
            .from('attendance_mark')
            .upsert(
                { reg_no, subject_id, attendance_count: attendanceValue },
                { onConflict: ['reg_no', 'subject_id'], ignoreDuplicates: false }
            )
            .select();

        if (error) {
            throw error;
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error in markAttendance:', err);
        return { data: null, error: err };
    }
};

/**
 * Subscribe to changes on the attendance_mark table.
 */
export const onAttendanceChange = (callback) => {
    return supabase
        .channel('attendance_mark_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'attendance_mark' },
            callback
        )
        .subscribe();
}; 