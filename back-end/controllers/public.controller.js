import prisma from "../config/db.js"

/**
 * =========================
 * PUBLIC COURSES (LIST)
 * =========================
 */
export const getPublicCourses = async (req, res) => {
    const courses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        include: {
            category: true,
            teacher: { select: { name: true } },
            reviews: { select: { rating: true } }
        }
    })

    const result = courses.map(c => {
        const avg =
            c.reviews.length > 0
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

/**
 * =========================
 * COURSE DETAIL
 * =========================
 */

export const getPublicCourseDetail = async (req, res) => {
    const courseId = Number(req.params.id)
    const userId = req.user?.id || null
    const role = req.user?.role || null

    if (!courseId) {
        return res.status(400).json({ message: "Invalid course id" })
    }

    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            status: "PUBLISHED"
        },
        include: {
            teacher: { select: { id: true, name: true } },
            lessons: {
                orderBy: { sortOrder: "asc" },
                include: { videos: true }
            }
        }
    })

    if (!course) {
        return res.status(404).json({ message: "Course not found" })
    }

    let enrollmentStatus = null
    let isEnrolled = false

    if (userId && role === "STUDENT") {
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            },
            select: {
                status: true
            }
        })

        enrollmentStatus = enrollment?.status || null
        isEnrolled = enrollment?.status === "APPROVED"
    }
    console.log("PRE:", course.preTestUrl)
    console.log("POST:", course.postTestUrl)
    res.json({
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.image,
        price: course.price,
        status: course.status,
        type: course.type,

        // 🔥 ตัวที่หายไป
        preTestUrl: course.preTestUrl,
        postTestUrl: course.postTestUrl,

        teacher: course.teacher,
        lessons: course.lessons,

        isEnrolled,
        enrollmentStatus,

        createdAt: course.createdAt,
        updatedAt: course.updatedAt
    })
}
/**
 * =========================
 * POPULAR COURSES
 * =========================
 */
export const getPopularCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { status: "PUBLISHED" },
            take: 8,
            orderBy: {
                enrollments: { _count: "desc" }
            },
            include: {
                category: true,
                teacher: { select: { name: true, image: true } },
                reviews: { select: { rating: true } },
                _count: { select: { enrollments: true } }
            }
        })

        const result = courses.map(c => {
            const avg =
                c.reviews.length > 0
                    ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
                    : 0

            return {
                id: c.id,
                title: c.title,
                image: c.image,
                price: c.price,
                category: c.category,
                teacher: c.teacher,
                enrollCount: c._count.enrollments,
                rating: Number(avg.toFixed(1)),
                reviewCount: c.reviews.length
            }
        })

        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

/**
 * =========================
 * LATEST COURSES
 * =========================
 */
export const getLatestCourses = async (req, res) => {
    const courses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
            teacher: true,
            category: true,
            reviews: { select: { rating: true } }
        }
    })

    const result = courses.map(c => {
        const avg =
            c.reviews.length > 0
                ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
                : 0

        return {
            id: c.id,
            title: c.title,
            image: c.image,
            price: c.price,
            teacher: c.teacher,
            category: c.category,
            rating: Number(avg.toFixed(1)),
            reviewCount: c.reviews.length
        }
    })

    res.json(result)
}

/**
 * =========================
 * CATEGORIES
 * =========================
 */
export const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" }
    })
    res.json(categories)
}

/**
 * =========================
 * PROFILE
 * =========================
 */
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
            return res.status(404).json({ message: "User not found" })
        }

        let profile = null
        if (role === "TEACHER") profile = user.teacherProfile
        if (role === "STUDENT") profile = user.studentProfile

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                profile
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}
