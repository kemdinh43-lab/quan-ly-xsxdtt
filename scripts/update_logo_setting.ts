
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating COMPANY_LOGO setting...');
    await prisma.systemSetting.upsert({
        where: { key: 'COMPANY_LOGO' },
        update: { value: '/logo.png' },
        create: {
            key: 'COMPANY_LOGO',
            value: '/logo.png',
            description: 'System-wide Company Logo URL'
        }
    });
    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
