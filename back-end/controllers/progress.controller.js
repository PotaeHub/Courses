import prisma from "../config/db.js"
import { asyncHandler } from "../middlewares/asyncHandler.js"

/* ===============================
   STUDENT: progress รวมทั้งคอร์ส
================================ */
export const getMyCourseProgress = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.courseId)

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId }
        }
    })

    if (!enrollment) {
        return res.status(404).json({ message: "ยังไม่ได้ลงทะเบียนคอร์สนี้" })
    }

    const lessons = await prisma.lesson.findMany({
        where: { courseId },
        include: { videos: { select: { id: true } } }
    })

    const progress = await prisma.lessonProgress.findMany({
        where: { enrollmentId: enrollment.id }
    })

    const result = lessons.map(lesson => {
        const total = lesson.videos.length
        const watched = progress.filter(
            p => p.lessonId === lesson.id && p.watchedAt
        ).length

        const percent = total === 0 ? 0 : Math.round((watched / total) * 100)

        return {
            lessonId: lesson.id,
            percent,
            completed: percent === 100
        }
    })

    res.json(result)
})

/* ===============================
   STUDENT: mark lesson watched
================================ */
export const markLessonWatched = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { courseId, videoId } = req.body

    const video = await prisma.lessonVideo.findUnique({
        where: { id: videoId },
        include: { lesson: true }
    })

    if (!video) {
        return res.status(404).json({ message: "Video not found" })
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId }
        }
    })

    if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled" })
    }

    await prisma.lessonProgress.upsert({
        where: {
            enrollmentId_lessonId: {
                enrollmentId: enrollment.id,
                lessonId: video.lessonId
            }
        },
        update: { watchedAt: new Date() },
        create: {
            enrollmentId: enrollment.id,
            lessonId: video.lessonId,
            watchedAt: new Date()
        }
    })

    res.json({ success: true })
})

/* ===============================
   STUDENT: progress ต่อ lesson
================================ */
export const getLessonProgress = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const courseId = Number(req.params.courseId)

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId }
        }
    })

    if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled" })
    }

    const lessons = await prisma.lesson.findMany({
        where: { courseId },
        include: { videos: { select: { id: true } } }
    })

    const progress = await prisma.lessonProgress.findMany({
        where: { enrollmentId: enrollment.id }
    })

    const lessonProgress = lessons.map(lesson => {
        const total = lesson.videos.length
        const watched = progress.filter(
            p => p.lessonId === lesson.id && p.watchedAt
        ).length

        return {
            lessonId: lesson.id,
            percent: total === 0 ? 0 : Math.round((watched / total) * 100),
            completed: total > 0 && watched === total
        }
    })

    res.json(lessonProgress)
})

/* ===============================
   TEACHER: ดู progress นักเรียน
================================ */
export const getStudentsProgressByCourse = asyncHandler(async (req, res) => {
    const courseId = Number(req.params.courseId)

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            lessonProgress: true
        }
    })

    const result = enrollments.map(e => {
        const completed = e.lessonProgress.filter(p => p.watchedAt).length
        return {
            user: e.user,
            completedLessons: completed
        }
    })

    res.json(result)
})
