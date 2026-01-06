import { Router } from 'express';
import { auth } from "../middlewares/auth.js";
import { Roles } from "../middlewares/checkRole.js";
import { getTeacherDashboard } from '../controllers/Teacher.controller.js';
const router = Router();



router.get('/teacher/dashboard', auth, Roles("TEACHER"), getTeacherDashboard);
export default router;