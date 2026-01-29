import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding HR Requests & Scenarios...');

    // 1. Get or Create Users
    const users = await prisma.user.findMany({ take: 3 });
    if (users.length < 3) {
        console.log("Not enough users, skipping detailed scenario assignment (need >3 users in DB).");
        return;
    }

    const [u1, u2, u3] = users;

    // Scenario 1: HARD WORKING + APPROVED LEAVE (User 1)
    console.log(`Setting up User ${u1.name} as Hard Working + Leave`);
    // Clear old data for clarity
    await prisma.attendance.deleteMany({ where: { userId: u1.id } });
    await prisma.request.deleteMany({ where: { userId: u1.id } });

    // 20 Days attendance
    for (let i = 0; i < 20; i++) {
        const d = new Date(); d.setDate(d.getDate() - i - 5); // Past days
        d.setHours(7, 55, 0);
        await prisma.attendance.create({
            data: { userId: u1.id, date: d, checkInTime: d, status: 'ON_TIME', checkInLocation: 'FACTORY' }
        });
    }
    // 2 Days Approved Leave
    await prisma.request.create({
        data: {
            userId: u1.id,
            type: 'LEAVE',
            reason: 'Nghỉ phép năm đi du lịch',
            date: new Date(),
            status: 'APPROVED',
            isPaid: true,
            managerComment: 'Ok, enjoy!'
        }
    });
    await prisma.request.create({
        data: {
            userId: u1.id, type: 'LEAVE', reason: 'Nghỉ phép năm (ngày 2)', date: new Date(), status: 'APPROVED', isPaid: true
        }
    });

    // Scenario 2: SICK + PENDING REQUEST (User 2)
    console.log(`Setting up User ${u2.name} as Pending Request`);
    await prisma.request.create({
        data: {
            userId: u2.id,
            type: 'LEAVE',
            reason: 'Em bị sốt cao, xin nghỉ 1 ngày đi khám.',
            date: new Date(),
            status: 'PENDING',
            isPaid: true
        }
    });

    // Scenario 3: LATE (User 3)
    console.log(`Setting up User ${u3.name} as Late Worker`);
    await prisma.attendance.deleteMany({ where: { userId: u3.id } });
    // 3 Late days
    for (let i = 0; i < 3; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        d.setHours(8, 45, 0); // Late 45 mins
        await prisma.attendance.create({
            data: { userId: u3.id, date: d, checkInTime: d, status: 'LATE', lateMinutes: 45, checkInLocation: 'FACTORY' }
        });
    }

    console.log('Seeding HR Done. Please reload dashboard.');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); })
