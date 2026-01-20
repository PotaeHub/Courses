import prisma from "../config/db.js"


export const getPublicCourses = async (req, res) => {
    const courses = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            category: true,
            teacher: { select: { name: true } },
            reviews: { select: { rating: true } }
        }
    })

    const result = courses.map(c => {
        const avg =
            c.reviews.length
                ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
                : 0

        return {
            id: c.id,
            title: c.title,
            image: c.image,
            price: c.price,
            rating: Number(avg.toFixed(1))
        }
    })

    res.json(result)
}

export const getPublicCourseDetail = async (req, res) => {
    const courseId = Number(req.params.id)
    const userId = req.user?.id || null

    const course = await prisma.course.findFirst({
        where: { id: courseId, status: 'PUBLISHED' },
        include: {
            category: { select: { name: true } },
            teacher: { select: { name: true } },
            lessons: {
                orderBy: { sortOrder: 'asc' },
                include: { videos: true }
            },
            reviews: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, image: true }
                    }
                }
            }
        }
    })

    if (!course) {
        return res.status(404).json({ message: 'ไม่พบคอร์ส' })
    }

    const avgRating =
        course.reviews.length
            ? (
                course.reviews.reduce((s, r) => s + r.rating, 0) /
                course.reviews.length
            ).toFixed(1)
            : null

    const isEnrolled = userId
        ? !!(await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        }))
        : false

    res.json({
        ...course,
        avgRating,
        reviewCount: course.reviews.length,
        isEnrolled
    })
}
export const getPopularCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: {
                status: "PUBLISHED"
            },
            take: 8,
            orderBy: {
                enrollments: {
                    _count: "desc"
                }
            },
            include: {
                category: true,
                teacher: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

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
