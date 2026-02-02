import { Router } from "express"
import {
    adminConfirmPayment,
    getPaymentQR,
    markAsTransferred,
} from "../controllers/Payment.controller.js"

import { upload } from "../middlewares/upload.js"
import { Roles } from "../middlewares/checkRole.js"
import { auth } from "../middlewares/auth.js"

const router = Router()


// router.post("/payments/mock", auth, createPayment)
router.post("/payments/confirm-transfer", auth, markAsTransferred)
router.get("/payments/:orderId/qr", auth, getPaymentQR)
// ADMIN
router.post(
    "/admin/payments/:id/approve",
    auth,
    Roles(["ADMIN"]),
    adminConfirmPayment
);
export default router;