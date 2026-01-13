import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('123456', 10)

    // ================= USERS =================
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            password,
            role: 'ADMIN',
            name: 'Admin',
            adminProfile: { create: { phone: '0999999999' } }
        }
    })

    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@gmail.com' },
        update: {},
        create: {
            email: 'teacher@gmail.com',
            password,
            role: 'TEACHER',
            name: 'Teacher One',
            teacherProfile: {
                create: {
                    subject: 'Math',
                    experience: 3,
                    phone: '0888888888'
                }
            }
        }
    })

    const student = await prisma.user.upsert({
        where: { email: 'student@gmail.com' },
        update: {},
        create: {
            email: 'student@gmail.com',
            password,
            role: 'STUDENT',
            name: 'Student One',
            studentProfile: {
                create: {
                    gradeLevel: 'ม.6',
                    classroom: '6/1',
                    phone: '0777777777'
                }
            }
        }
    })

    // ================= CATEGORIES =================
    const categoryNames = ['English', 'Math', 'Science', 'History', 'Computer', 'Art']
    const categories = {}

    for (const name of categoryNames) {
        categories[name] = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name }
        })
    }

    // ================= COURSES + LESSONS =================
    const courseTitles = [
        'Basic Mathematics',
        'English Grammar',
        'Science Experiments',
        'World History',
        'Computer Programming',
        'Art & Design',
        'Advanced Math',
        'English Conversation',
        'Physics Fundamentals',
        'Creative Writing'
    ]

    for (const title of courseTitles) {
        const existing = await prisma.course.findFirst({ where: { title } })
        if (existing) continue

        // เลือก category แบบ random
        const categoryKeys = Object.keys(categories)
        const randomCategory = categories[categoryKeys[Math.floor(Math.random() * categoryKeys.length)]]

        // สร้างบทเรียน 5-8 บทต่อคอร์ส
        const lessons = []
        const lessonCount = 5 + Math.floor(Math.random() * 4) // 5-8 lessons
        for (let i = 1; i <= lessonCount; i++) {
            lessons.push({
                title: `Lesson ${i} of ${title}`,
                content: `เนื้อหาของบทเรียนที่ ${i} ในคอร์ส ${title}`,
                sortOrder: i,
                videos: {
                    create: [
                        { url: `/uploads/lessons/videos/sample-video-${i}.mp4` }
                    ]
                }
            })
        }

        await prisma.course.create({
            data: {
                title,
                description: `คำอธิบายสำหรับคอร์ส ${title}`,
                image: `/uploads/courses/images/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                price: 500 + Math.floor(Math.random() * 1000),
                type: 'GENERAL',
                teacherId: teacher.id,
                categoryId: randomCategory.id,
                lessons: { create: lessons }
            }
        })
    }

    // ================= PAYMENTS =================
    await prisma.payment.createMany({
        data: [
            { userId: student.id, courseId: 1, amount: 1200, status: 'COMPLETED', createdAt: new Date('2025-01-10') },
            { userId: student.id, courseId: 2, amount: 1800, status: 'COMPLETED', createdAt: new Date('2025-02-15') },
        ]
    })

    // ================= ENROLLMENTS + STUDENTCOURSE =================
    const allStudents = await prisma.user.findMany({ where: { role: 'STUDENT' } })
    const allCourses = await prisma.course.findMany()

    for (const student of allStudents) {
        for (const course of allCourses) {
            let enrollment = await prisma.enrollment.findFirst({ where: { userId: student.id, courseId: course.id } })
            if (!enrollment) {
                enrollment = await prisma.enrollment.create({
                    data: {
                        userId: student.id,
                        courseId: course.id,
                        status: 'ENROLLED',
                        enrolledAt: new Date(
                            2025,
                            Math.floor(Math.random() * 12),
                            Math.floor(Math.random() * 28) + 1
                        )
                    }
                })
            }

            const existsSC = await prisma.studentCourse.findFirst({
                where: { studentId: student.id, courseId: course.id }
            })

            if (!existsSC) {
                await prisma.studentCourse.create({
                    data: {
                        studentId: student.id,
                        courseId: course.id,
                        progress: Math.floor(Math.random() * 101),
                        joinedAt: enrollment.enrolledAt,
                        enrollmentId: enrollment.id
                    }
                })
            }
        }
    }

    console.log('🌱 Seed completed successfully')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
