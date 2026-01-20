import prisma from "../config/db.js"

export const canReviewCourse = async (req, res, next) => {
    const userId = req.user.id
    const courseId = Number(req.params.id)

    // ต้องลงทะเบียนคอร์ส
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId }
        }
    })

    if (!enrollment) {
        return res.status(403).json({
            message: 'ต้องสมัครเรียนคอร์สก่อนจึงจะรีวิวได้'
        })
    }

    // ห้ามรีวิวซ้ำ
    const reviewed = await prisma.review.findFirst({
        where: { userId, courseId }
    })

    if (reviewed) {
        return res.status(400).json({
            message: 'คุณได้รีวิวคอร์สนี้ไปแล้ว'
        })
    }

    next()
}
