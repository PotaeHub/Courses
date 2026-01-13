import prisma from "../config/db.js"

export const getPublicCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED'
            },
            include: {
                category: true,
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                reviews: {
                    select: { rating: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = courses.map(c => {
            const avgRating =
                c.reviews.length > 0
                    ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
                    : 0

            return {
                id: c.id,
                title: c.title,
                image: c.image,
                price: c.price,
                category: c.category?.name,
                teacher: c.teacher?.name,
                rating: Number(avgRating.toFixed(1))
            }
        })

        res.json(formatted)
    } catch (err) {
        res.status(500).json({ message: 'Load courses failed' })
    }
}
export const getCourseDetail = async (req, res) => {
    try {
        const courseId = Number(req.params.id)

        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                status: 'PUBLISHED'
            },
            include: {
                teacher: {
                    select: {
                        name: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                },
                lessons: {
                    orderBy: { id: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        videos: true,
                    },
                },
                reviews: true,
            }
        })

        if (!course) {
            return res.status(404).json({
                message: 'ไม่พบคอร์ส'
            })
        }

        res.json(course)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}
// getPopularCourses
export const getPopularCourses = async (req, res) => {
    try {
        // const image = req.files?.image?.[0];
        // console.log(image)
        // console.log(req.files)
        const courses = await prisma.course.findMany({
            where: {
                status: 'PUBLISHED'
            },
            take: 8,
            orderBy: {
                studentCourses: {
                    _count: 'desc'
                }
            },
            include: {
                category: true,
                teacher: {
                    select: { name: true }
                },
                _count: {
                    select: {
                        studentCourses: true
                    }
                }
            }
        })

        res.json(courses)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}


export const getLatestCourses = async (req, res) => {
    const courses = await prisma.course.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    })
    res.json(courses)
}

export const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    })
    res.json(categories)
}
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const role = req.user.role

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true,
                studentProfile: true
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // เลือกรูปตาม role
        let image = user.image
        let profile = null

        if (role === 'TEACHER') {
            image = user.image
            profile = user.teacherProfile
        }

        if (role === 'STUDENT') {
            image = user.image
            profile = user.studentProfile
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
