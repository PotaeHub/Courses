
import prisma from "../config/db.js";
export const requireEnrollment = async (req, res, next) => {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrolled = await prisma.enrollment.findFirst({
        where: {
            userId,
            courseId,
            status: "APPROVED",
        },
    });

    if (!enrolled) {
        return res.status(403).json({
            message: "คุณยังไม่ได้ลงทะเบียนคอร์สนี้",
        });
    }

    next();
};
