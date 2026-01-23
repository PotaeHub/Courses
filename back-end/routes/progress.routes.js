import { Router } from "express"
import {
    markLessonWatched,
    getMyCourseProgress,
    getLessonProgress,
    getStudentsProgressByCourse
} from "../controllers/progress.controller.js"
import { auth } from "../middlewares/auth.js"
import { Roles } from "../middlewares/checkRole.js"

const router = Router()

// STUDENT
router.post("/progress/watch", auth, Roles("STUDENT"), markLessonWatched)
router.get("/my-course/:courseId", auth, Roles("STUDENT"), getMyCourseProgress)
router.get("/my-course/:courseId/lesson", auth, Roles("STUDENT"), getLessonProgress)

// TEACHER
router.get(
    "/teacher/course/:courseId",
    auth,
    Roles("TEACHER"),
    getStudentsProgressByCourse
)

export default router
