import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
export const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCSSES_TOKEN);
        req.user = decoded;
        next();
    } catch {
        throw new AppError("Token expired", 401);
    }
};
