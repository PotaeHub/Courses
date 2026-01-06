import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
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
}
console.log('🌱 Seed completed successfully');
main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
