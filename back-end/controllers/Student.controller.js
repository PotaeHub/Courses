import { asyncHandler } from "../middlewares/asyncHandler.js";
import AppError from '../utils/AppError.js';
import prisma from '../config/db.js';


// =================== Categories ===================
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
        }
    })
    res.json(categories)
})

// =================== Courses ===================
export const getCourses = asyncHandler(async (req, res) => {
    const courses = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            category: true,
            teacher: true
        },
        orderBy: { createdAt: 'desc' }
    })
    res.json(courses)
})
export const getCourseDetail = asyncHandler(async (req, res) => {
    const courseId = parseInt(req.params.id)

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            category: true,
            teacher: true,
            lessons: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    videos: true, // ดึงวิดีโอแต่ละบทเรียน
                },
            },
            reviews: {
                include: { user: true } // ดึงชื่อผู้รีวิว
            },
        },
    })

    if (!course) {
        return res.status(404).json({ message: 'Course not found' })
    }

    res.json(course)
})

export const studentDashboard = async (req, res) => {
    try {
        const userId = req.user.id

        // 1. คอร์สที่กำลังเรียน
        const enrolledCount = await prisma.enrollment.count({
            where: {
                userId,
                status: 'ENROLLED'
            }
        })

        // 2. คอร์สที่เรียนจบ
        const completedCount = await prisma.enrollment.count({
            where: {
                userId,
                status: 'COMPLETED'
            }
        })

        // 3. Progress บทเรียน
        const progress = await prisma.progress.findMany({
            where: { userId },
            select: { isDone: true }
        })

        const totalLessons = progress.length
        const completedLessons = progress.filter(p => p.isDone).length
        const lessonProgress = totalLessons
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0

        // 4. ยอดเงินที่จ่ายแล้ว
        const totalPaid = await prisma.payment.aggregate({
            where: {
                userId,
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        })

        // 5. คอร์สล่าสุด
        const recentCourses = await prisma.studentCourse.findMany({
            where: { studentId: userId },
            take: 3,
            orderBy: { joinedAt: 'desc' },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        lessons: {
                            select: { id: true }
                        }
                    }
                }
            }
        })

        const formattedCourses = recentCourses.map(c => ({
            courseId: c.course.id,
            title: c.course.title,
            image: c.course.image,
            progress: c.progress,
            joinedAt: c.joinedAt
        }))

        res.json({
            stats: {
                enrolled: enrolledCount,
                completed: completedCount,
                lessonProgress,
                totalPaid: totalPaid._sum.amount || 0
            },
            recentCourses: formattedCourses
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Dashboard load failed' })
    }
}
export const myCourses = async (req, res) => {
    try {
        const userId = req.user.id
        const { status } = req.query

        const whereEnrollment = {
            studentId: userId,
            ...(status && {
                enrollment: {
                    status
                }
            })
        }

        const courses = await prisma.studentCourse.findMany({
            where: whereEnrollment,
            include: {
                enrollment: {
                    select: { status: true }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        image: true
                    }
                }
            }
        })

        res.json(
            courses.map(c => ({
                courseId: c.course.id,
                title: c.course.title,
                image: c.course.image,
                progress: c.progress,
                status: c.enrollment.status
            }))
        )
    } catch (err) {
        res.status(500).json({ message: 'Cannot load courses' })
    }
}
export const courseLessons = async (req, res) => {
    try {
        const userId = req.user.id
        const courseId = Number(req.params.courseId)

        const enrolled = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        })

        if (!enrolled) {
            return res.status(403).json({ message: 'Not enrolled' })
        }

        const lessons = await prisma.lesson.findMany({
            where: { courseId },
            orderBy: { sortOrder: 'asc' },
            include: {
                videos: true,
                progress: {
                    where: { userId },
                    select: { isDone: true }
                }
            }
        })

        res.json(
            lessons.map(l => ({
                lessonId: l.id,
                title: l.title,
                content: l.content,
                videos: l.videos,
                isDone: l.progress[0]?.isDone || false
            }))
        )
    } catch (err) {
        res.status(500).json({ message: 'Load lessons failed' })
    }
}
export const updateProgress = async (req, res) => {
    try {
        const userId = req.user.id
        const { lessonId, isDone } = req.body

        await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            },
            update: { isDone },
            create: {
                userId,
                lessonId,
                isDone
            }
        })

        res.json({ message: 'Progress updated' })
    } catch (err) {
        res.status(500).json({ message: 'Update progress failed' })
    }
}
export const paymentHistory = async (req, res) => {
    const userId = req.user.id

    const payments = await prisma.payment.findMany({
        where: { userId },
        include: {
            course: {
                select: { title: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    res.json(payments)
}
export const createReview = async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.id)
    const { rating, comment } = req.body

    const enrolled = await prisma.enrollment.findFirst({
        where: {
            userId,
            courseId,
            status: { in: ['ENROLLED', 'COMPLETED'] }
        }
    })

    if (!enrolled) {
        return res.status(403).json({
            message: 'ต้องจองคอร์สก่อนจึงจะรีวิวได้'
        })
    }

    const alreadyReviewed = await prisma.review.findFirst({
        where: { userId, courseId }
    })

    if (alreadyReviewed) {
        return res.status(400).json({
            message: 'คุณได้รีวิวคอร์สนี้ไปแล้ว'
        })
    }

    await prisma.review.create({
        data: {
            userId,
            courseId,
            rating,
            comment
        }
    })

    res.json({ message: 'Review submitted' })
}
export const studentGetCourse = async (req, res) => {
    try {
        const studentId = req.user.id
        if (!studentId) return res.status(402).json({ message: "Student Not Found!" })
        const page = Number(req.query.page) || 1
        const limit = 6
        const skip = (page - 1) * limit
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: studentId },
                include: { course: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.order.count({
                where: { userId: studentId }
            })
        ])

        res.json({
            orders,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error studentGetCourse"
        })
    }
}
export const getPublishedTeacherCourses = async (req, res) => {
    try {
        const {
            page = 1,
            keyword = '',
            categoryId = '',
            type = '',
            minPrice = '',
            maxPrice = '',
            sortPrice = ''
        } = req.query

        const PAGE_SIZE = 9
        const skip = (Number(page) - 1) * PAGE_SIZE

        /* ---------------- WHERE ---------------- */
        const where = {
            status: "PUBLISHED"
        }


        if (keyword) {
            where.title = {
                contains: keyword,
            }
        }


        if (categoryId) {
            where.categoryId = Number(categoryId)
        }

        if (type) {
            where.type = type
        }

        // 💰 price range
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = Number(minPrice)
            if (maxPrice) where.price.lte = Number(maxPrice)
        }

        /* ---------------- ORDER BY ---------------- */
        let orderBy = { createdAt: 'desc' }

        if (sortPrice === 'asc') {
            orderBy = { price: 'asc' }
        }

        if (sortPrice === 'desc') {
            orderBy = { price: 'desc' }
        }

        /* ---------------- QUERY ---------------- */
        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                orderBy,
                skip,
                take: PAGE_SIZE,
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    category: true
                }
            }),
            prisma.course.count({ where })
        ])

        res.json({
            courses,
            totalPages: Math.ceil(total / PAGE_SIZE)
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Fetch courses failed' })
    }
}
export const studentGetCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                courses: true
            },
            orderBy: {
                courses: {
                    _count: 'desc'
                }
            }
        })

        res.json(categories)
    } catch (err) {
        res.status(500).json({ message: 'Fetch categories failed' })
    }
}









