import express from 'express';
import { takeAttendance, subscribeAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

// POST /api/admin/attendance - Record attendance
router.post('/', takeAttendance);

// GET /api/admin/attendance/stream - Subscribe to attendance stream (e.g., for real-time updates)
router.get('/stream', subscribeAttendance);

export default router;