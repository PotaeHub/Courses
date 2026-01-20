import prisma from "../config/db.js"

export const createReview = async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.id)
    const { rating, comment } = req.body

    await prisma.review.create({
        data: {
            userId,
            courseId,
            rating,
            comment
        }
    })

    res.status(201).json({
        message: 'Review submitted'
    })
}
