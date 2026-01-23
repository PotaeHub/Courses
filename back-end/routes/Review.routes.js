import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { canReviewCourse } from "../middlewares/canReview.js"
import { createReview, getCourseReviews } from "../controllers/Review.controller.js"

const router = Router()

router.post(
    "/courses/:id/reviews",
    auth,
    canReviewCourse,
    createReview
)
router.get(
    "/public/courses/:id/reviews",
    getCourseReviews
)
export default router
