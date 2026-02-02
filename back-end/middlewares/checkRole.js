import AppError from "../utils/AppError.js";
export const Roles = (...roles) => {
    const allowRoles = roles.flat();
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        
        if (!allowRoles.includes(req.user.role)) {
            throw new AppError("Forbidden", 403);
        }
        next();
    };
};
