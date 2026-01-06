import prisma, { PaymentStatus } from '../config/db.js';
// Teacher Dashboard 
export const getTeacherDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id

        const courses = await prisma.course.count({
            where: { teacherId }
        })

        const students = await prisma.enrollment.count({
            where: {
                course: { teacherId }
            }
        })

        const earnings = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                course: { teacherId },
                status: PaymentStatus.COMPLETED
            }
        })

        res.json({
            success: true,
            data: {
                courses,
                students,
                earnings: earnings._sum.amount || 0
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err.message })
    }
}
// Teacher My Courses
