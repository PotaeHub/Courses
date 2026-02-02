import prisma from "../config/db.js"

/* =========================
   CREATE ORDER
========================= */
export const createOrder = async (req, res) => {
    const userId = req.user.id
    const { courseId } = req.body

    const courseIdNum = Number(courseId)
    if (!courseIdNum || isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid courseId" })
    }

    /* ---------- COURSE ---------- */
    const course = await prisma.course.findFirst({
        where: {
            id: courseIdNum,
            status: "PUBLISHED"
        }
    })

    if (!course) {
        return res.status(404).json({
            message: "Course not found or not available"
        })
    }

    /* ---------- CHECK ENROLLMENT ---------- */
    const enrolled = await prisma.enrollment.findFirst({
        where: {
            userId,
            courseId: courseIdNum,
            status: "APPROVED"
        }
    })

    if (enrolled) {
        return res.status(400).json({
            message: "You already enrolled this course"
        })
    }

    /* ---------- EXISTING ORDER (เฉพาะ PENDING) ---------- */
    const existingOrder = await prisma.order.findFirst({
        where: {
            userId,
            courseId: courseIdNum,
            status: "PENDING"
        }
    })

    if (existingOrder) {
        return res.json(existingOrder)
    }

    /* ---------- CREATE ORDER ---------- */
    const order = await prisma.order.create({
        data: {
            userId,
            courseId: courseIdNum,
            amount: course.price,
            status: "PENDING"
        }
    })

    res.json(order)
}

/* =========================
   GET ORDER DETAIL
========================= */
export const getOrderById = async (req, res) => {
    const userId = req.user.id
    const orderId = Number(req.params.id)

    if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order id" })
    }

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId // 🔒 กันดู order คนอื่น
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    image: true
                }
            },
            payment: true   // ✅ ใช้เอกพจน์
        }
    })

    if (!order) {
        return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
}