import prisma from "../config/db.js"

export const createReview = async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.id)
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5 || !comment?.trim()) {
        return res.status(400).json({
            message: 'ข้อมูลรีวิวไม่ถูกต้อง'
        })
    }

    await prisma.review.create({
        data: { userId, courseId, rating, comment }
    })

    res.status(201).json({ message: 'Review submitted' })
}

export const getCourseReviews = async (req, res) => {
    try {
        const courseId = Number(req.params.id)

        const reviews = await prisma.review.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const avgRating =
            reviews.length === 0
                ? 0
                : Math.round(
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
                ) / 10

        res.json({
            total: reviews.length,
            average: avgRating,
            reviews
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}
