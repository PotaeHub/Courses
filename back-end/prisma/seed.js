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
    const categoryNames = ['English', 'Math', 'Science']
    const categories = {}

    for (const name of categoryNames) {
        categories[name] = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name }
        })
    }

    // ================= COURSES =================

    // ----- Course 1 -----
    const course1 = await prisma.course.findFirst({
        where: { title: 'Basic Mathematics' }
    })

    if (!course1) {
        await prisma.course.create({
            data: {
                title: 'Basic Mathematics',
                description: 'คณิตศาสตร์พื้นฐาน',
                image: 'math.jpg',
                price: 499,
                type: 'GENERAL',
                teacherId: teacher.id,
                categoryId: categories.Math.id,
                lessons: {
                    create: [
                        {
                            title: 'Introduction to Math',
                            content: 'พื้นฐานคณิตศาสตร์',
                            sortOrder: 1
                        },
                        {
                            title: 'Addition & Subtraction',
                            content: 'การบวกและลบ',
                            sortOrder: 2
                        }
                    ]
                }
            }
        })
    }

    // ----- Course 2 -----
    const course2 = await prisma.course.findFirst({
        where: { title: 'English Grammar' }
    })

    if (!course2) {
        await prisma.course.create({
            data: {
                title: 'English Grammar',
                description: 'ไวยากรณ์ภาษาอังกฤษ',
                image: 'english.jpg',
                price: 599,
                type: 'POPULAR',
                teacherId: teacher.id,
                categoryId: categories.English.id,
                lessons: {
                    create: [
                        {
                            title: 'Tenses',
                            content: 'โครงสร้าง Tense',
                            sortOrder: 1
                        },
                        {
                            title: 'Parts of Speech',
                            content: 'ชนิดของคำ',
                            sortOrder: 2
                        }
                    ]
                }
            }
        })
    }
    await prisma.payment.createMany({
        data: [
            {
                userId: 1,
                courseId: 1,
                amount: 1200,
                status: 'COMPLETED',
                paymentDate: new Date('2025-01-10')
            },
            {
                userId: 1,
                courseId: 2,
                amount: 1800,
                status: 'COMPLETED',
                paymentDate: new Date('2025-02-15')
            },
            {
                userId: 2,
                courseId: 1,
                amount: 1500,
                status: 'COMPLETED',
                paymentDate: new Date('2025-03-05')
            }
        ]
    })

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
