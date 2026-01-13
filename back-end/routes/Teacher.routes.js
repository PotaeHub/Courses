import { Router } from 'express'
import { auth } from "../middlewares/auth.js"
import { Roles } from "../middlewares/checkRole.js"
import { upload } from "../middlewares/upload.js"
import {
    createTeacherCourse,
    getCategories,
    getDashboard,
    getIDCourses,
    getStudents,
    getTeacherCourses,
    getTeacherProfile,
    removeCourse,
    updateTeacherCourse,
    updateTeacherProfile
} from '../controllers/Teacher.controller.js'

const router = Router()

router.get('/teacher/dashboard', auth, Roles("TEACHER"), getDashboard)
router.get('/teacher/courses', auth, Roles("TEACHER"), getTeacherCourses)
router.get('/teacher/categories', auth, Roles("TEACHER"), getCategories)
router.get('/teacher/course/:id', auth, Roles("TEACHER"), getIDCourses)
router.get('/teacher/profile', auth, Roles("TEACHER"), getTeacherProfile)
router.get("/teacher/student/enrollment", auth, Roles("TEACHER"), getStudents)

router.put('/teacher/profile', auth, Roles("TEACHER"), upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 } // ถ้าจะรองรับ video ด้วย
]), updateTeacherProfile)

router.post(
    "/teacher/course",
    auth,
    Roles("TEACHER"),
    upload.any(), // ✅ สำคัญ
    createTeacherCourse
)

router.put(
    '/teacher/course/:id',
    auth,
    Roles("TEACHER"),
    upload.any(), // ✅ สำคัญ
    updateTeacherCourse
)

router.delete("/teacher/course/:id", auth, Roles("TEACHER"), removeCourse)

export default router
