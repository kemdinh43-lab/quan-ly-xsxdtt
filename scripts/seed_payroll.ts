import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding Payroll & Attendance...');

    const users = await prisma.user.findMany();

    for (const user of users) {
        // 1. Set Salary
        const roleBasedSalary = user.role === 'ADMIN' ? 1000000 : (user.role === 'MANAGER' ? 500000 : 300000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                dailyRate: roleBasedSalary,
                allowance: 50000 // Fixed allowance
            }
        });

        // 2. Create Attendance for last 5 days
        const today = new Date();
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Avoid dupes
            const exist = await prisma.attendance.findFirst({ where: { userId: user.id, date } });
            if (!exist) {
                await prisma.attendance.create({
                    data: {
                        userId: user.id,
                        date: date,
                        checkInTime: new Date(date.setHours(8, 0, 0)), // 8:00 AM
                        checkInLocation: "10.8411,106.8099",
                        status: 'ON_TIME'
                    }
                });
            }
        }
    }
    console.log('Seeding Payroll Done.');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); })
