import { Router } from 'express'
import { auth } from "../middlewares/auth.js"
import { Roles } from "../middlewares/checkRole.js"
import { courseLessons, createReview,  getCategories, getCourseDetail, myCourses, paymentHistory, studentDashboard, updateProgress } from '../controllers/Student.controller.js'

const router = Router()

router.get("/studetn/categoty", auth, Roles("STUDENT"), getCategories)
router.get("/studetn/course", auth, Roles("STUDENT"), myCourses)
router.get("/studetn/course/:id", auth, Roles("STUDENT"), getCourseDetail)
router.get("/studetn/dashboard", auth, Roles("STUDENT"), studentDashboard)
router.get("/student/courses/:courseId/lessons", auth, Roles("STUDENT"), courseLessons)
router.post("/student/progress", auth, Roles("STUDENT"), updateProgress)
router.get('/payments', auth, Roles("STUDENT"), paymentHistory)
router.post('/reviews', auth, Roles("STUDENT"), createReview)
export default router