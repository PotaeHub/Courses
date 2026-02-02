import prisma from "../config/db.js"

export const enrollCourse = async (req, res) => {
    return res.status(400).json({
        message: "Enrollment is created after payment approval only",
    });
};

export const checkEnroll = async (req, res) => {
    const userId = req.user.id;
    const courseId = Number(req.params.courseId);

    const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });

    res.json({ enrolled: !!enrolled });
};