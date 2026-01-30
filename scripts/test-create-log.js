const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateEmail() {
    try {
        const log = await prisma.emailLog.create({
            data: {
                recipient: 'test@example.com',
                subject: 'Test Tracking Pixel',
                status: 'SENT',
                opened: false,
                sentAt: new Date()
            }
        });
        console.log(log.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

simulateEmail();
