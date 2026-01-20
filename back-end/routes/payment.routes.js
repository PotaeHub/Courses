import { Router } from "express"
import {
    confirmPayment,
    uploadPayment
} from "../controllers/Payment.controller.js"
import { upload } from "../middlewares/upload.js"
import { Roles } from "../middlewares/checkRole.js"
import { auth } from "../middlewares/auth.js"

const router = Router()

router.post(
    "/payments",
    auth,
    Roles("STUDENT"),
    upload.single("slip"),
    uploadPayment
)

router.patch(
    "/payments/:id/confirm",
    auth,
    Roles("ADMIN", "TEACHER"),
    confirmPayment
)


export default router;
