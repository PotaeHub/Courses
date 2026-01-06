import { Router } from "express";
import { getUser, getUserId, login, register } from "../controllers/auth.controller.js";
import { refreshToken } from "../controllers/refrshToken.js"
const router = Router()

router.post("/login", login)
router.post("/register", register)
router.get("/users", getUser)
router.get("/users/:id", getUserId)
router.post("/refresh", refreshToken)

export default router; 