const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyOpen(id) {
    try {
        const log = await prisma.emailLog.findUnique({
            where: { id }
        });

        console.log('---------------------------------------------------');
        console.log('🔍 TRACKING RESULT');
        console.log('---------------------------------------------------');
        console.log(`🆔 Email ID: ${log.id}`);
        console.log(`📧 Status:   ${log.opened ? '✅ OPENED' : '❌ NOT OPENED'}`);
        if (log.opened) {
            console.log(`⏰ Opened At: ${log.openedAt ? log.openedAt.toLocaleString() : 'N/A'}`);
        }
        console.log('---------------------------------------------------');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

const id = process.argv[2];
if (!id) {
    console.error("Please provide an ID");
} else {
    verifyOpen(id);
}
