import express from 'express'
import { enrollCourse, checkEnroll } from '../controllers/enroll.controller.js'
import { auth } from '../middlewares/auth.js'
const router = express.Router()

router.post('/enroll', auth, enrollCourse)
router.get('/enroll/check/:courseId', auth, checkEnroll)

export default router;
