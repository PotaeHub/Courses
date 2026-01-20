import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { canReviewCourse } from "../middlewares/canReview.js"
import { createReview } from "../controllers/Review.controller.js"

const router = Router()

router.post(
    "/courses/:id/reviews",
    auth,
    canReviewCourse,
    createReview
)

export default router
