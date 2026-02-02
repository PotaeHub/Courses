import { Router } from "express"
import {
    getCategories,
    getLatestCourses,
    getPopularCourses,
    getProfile,
    getPublicCourseDetail,
    getPublicCourses
} from "../controllers/public.controller.js"
import { auth } from "../middlewares/auth.js"

const router = Router()

// ===== PUBLIC =====
router.get("/public/courses/popular", getPopularCourses)
router.get("/public/courses/latest", getLatestCourses)
router.get("/public/courses/:id", auth, getPublicCourseDetail)
router.get("/public/courses", getPublicCourses)
router.get("/public/categories", getCategories)

// ===== PROTECTED =====
router.get("/profile/me", auth, getProfile)

export default router
