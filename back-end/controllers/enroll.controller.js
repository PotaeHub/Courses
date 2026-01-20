import prisma from "../config/db.js"
export const checkEnroll = async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.courseId)

    const enrolled = await prisma.enrollment.findFirst({
        where: {
            userId,
            courseId
        }
    })

    res.json({
        enrolled: !!enrolled
    })
}
export const enrollCourse = async (req, res) => {
    const userId = req.user.id
    const { courseId } = req.body

    const already = await prisma.enrollment.findFirst({
        where: { userId, courseId }
    })

    if (already) {
        return res.status(400).json({ message: 'คุณซื้อคอร์สนี้แล้ว' })
    }

    const enroll = await prisma.enrollment.create({
        data: { userId, courseId }
    })

    res.json({ success: true, enroll })
}