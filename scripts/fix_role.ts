import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find the user likely logged in (e.g., tung1109 or the first user)
    const users = await prisma.user.findMany();
    console.log("Current Users:", users.map(u => `${u.name} (${u.email}) - ${u.role}`));

    // Update 'tung1109' or 'Dương Thành Tín' to MANAGER if not already
    const me = users.find(u => u.email.includes('tung') || u.name.includes('Tín'));
    if (me) {
        console.log(`Updating ${me.name} to MANAGER...`);
        await prisma.user.update({
            where: { id: me.id },
            data: { role: 'MANAGER' }
        });
        console.log("Updated.");
    } else {
        console.log("Could not find current user to update role.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
