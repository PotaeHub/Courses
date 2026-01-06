import AppError from "../utils/AppError.js";
export const Roles = (...roles) => (req, res, next) => {
    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }
    if (!roles.includes(req.user.role)) {
        throw new AppError("Forbidden", 403);
    }
    next();
};