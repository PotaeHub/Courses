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
                create: { phone: '0777777777' }
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
        'Computer Programming'
    ]

    for (const title of courseTitles) {
        const exists = await prisma.course.findFirst({ where: { title } })
        if (exists) continue

        const categoryKeys = Object.keys(categories)
        const randomCategory =
            categories[categoryKeys[Math.floor(Math.random() * categoryKeys.length)]]

        const lessons = []
        for (let i = 1; i <= 5; i++) {
            lessons.push({
                title: `Lesson ${i}`,
                content: `Content of lesson ${i}`,
                sortOrder: i,
                videos: {
                    create: [{ url: `/uploads/lessons/videos/sample-${i}.mp4` }]
                }
            })
        }

        await prisma.course.create({
            data: {
                title,
                description: `Description for ${title}`,
                image: `/uploads/courses/images/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                price: 500 + Math.floor(Math.random() * 1000),
                type: 'GENERAL',
                status: 'PUBLISHED',
                teacherId: teacher.id,
                categoryId: randomCategory.id,
                lessons: { create: lessons }
            }
        })
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
