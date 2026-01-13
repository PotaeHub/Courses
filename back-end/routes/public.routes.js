// routes/public.routes.js
import { Router } from 'express'
import {
    getCategories,
    getCourseDetail,
    getLatestCourses,
    getPopularCourses,
    getProfile,
    getPublicCourses
} from '../controllers/public.controller.js'
import { upload } from '../middlewares/upload.js'
import { auth } from '../middlewares/auth.js'

const router = Router()

// ✅ static routes มาก่อน
router.get('/public/courses/popular', upload.single("image"), getPopularCourses)
router.get('/public/courses/latest', upload.single("image"), getLatestCourses)

// ✅ dynamic route ทีหลัง
router.get('/public/courses/:id', getCourseDetail)

// อื่น ๆ
router.get('/public/courses', getPublicCourses)
router.get('/public/categories', getCategories)
router.get('/profile/me', auth, getProfile)
export default router
