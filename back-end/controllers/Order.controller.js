import prisma from "../config/db.js"


export const createOrder = async (req, res) => {
    const userId = req.user.id
    const { courseId } = req.body

    const course = await prisma.course.findUnique({
        where: { id: courseId }
    })

    if (!course) {
        return res.status(404).json({ message: 'ไม่พบคอร์ส' })
    }

    const order = await prisma.order.create({
        data: {
            userId,
            courseId,
            amount: course.price
        }
    })

    res.json(order)
}
export const getOrderById = async (req, res) => {
    const orderId = Number(req.params.id)

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            course: true
        }
    })

    if (!order) {
        return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
}