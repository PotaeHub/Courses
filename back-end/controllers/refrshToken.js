import { asyncHandler } from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError("No refresh token", 401);

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
        const payload = { id: decoded.id, role: decoded.role, email: decoded.email };
        const accessToken = jwt.sign(payload, process.env.ACCSSES_TOKEN, { expiresIn: "15m" });

        res.status(200).json({ accessToken });
    } catch (err) {
        throw new AppError("Refresh token expired", 401);
    }
})