import jwt from "jsonwebtoken"
import AppError from "../utils/AppError.js"

export const auth = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401)
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN 
        )
        req.user = decoded


        next()
    } catch (err) {
        console.error("JWT ERROR:", err.message)
        throw new AppError("Token expired or invalid", 401)
    }
}
