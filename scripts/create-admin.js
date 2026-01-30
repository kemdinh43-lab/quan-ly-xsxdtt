const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_SB9Zd4HzmMDe@ep-odd-surf-a1bozcsk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
        }
    }
});

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = await prisma.user.upsert({
            where: { email: 'hung123@gmail.com' },
            update: {},
            create: {
                email: 'hung123@gmail.com',
                name: 'Hùng Admin',
                password: hashedPassword,
                role: 'ADMIN',
                dailyRate: 0
            }
        });

        console.log('✅ User created successfully:', user.email);
        console.log('📧 Email:', user.email);
        console.log('🔑 Password: 123456');
        console.log('👤 Role:', user.role);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
