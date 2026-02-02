import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { Roles } from "../middlewares/checkRole.js"
import {
    getCategories,
    myCourses,
    getCourseDetail,
    studentGetCourse,
    getPublishedTeacherCourses,
    studentDashboard,
    courseLessons,
    updateProgress,
    paymentHistory,
    createReview,
    getCourseReviews,
    getLessonProgress
} from "../controllers/Student.controller.js"

const router = Router()

router.get("/student/categories", auth, Roles("STUDENT"), getCategories)
router.get("/student/course", auth, Roles("STUDENT"), myCourses)
router.get("/student/course/:id", auth, Roles("STUDENT"), getCourseDetail)
router.get("/student/mycourses", auth, Roles("STUDENT"), studentGetCourse)
router.get("/student/courses", auth, Roles("STUDENT"), getPublishedTeacherCourses)
router.get("/student/dashboard", auth, Roles("STUDENT"), studentDashboard)

router.get(
    "/student/courses/:courseId/lessons",
    auth,
    Roles("STUDENT"),
    courseLessons
)

router.post("/student/progress", auth, Roles("STUDENT"), updateProgress)
router.get("/student/payments", auth, Roles("STUDENT"), paymentHistory)
router.post("/student/reviews", auth, Roles("STUDENT"), createReview)
router.get(
    "/student/course/:courseId/reviews",
    auth,
    Roles("STUDENT"),
    getCourseReviews
)
router.get(
    "/courses/:courseId/lessons",
    auth,
    Roles("STUDENT"),
    getLessonProgress
)
export default router
