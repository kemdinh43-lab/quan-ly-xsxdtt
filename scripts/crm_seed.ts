import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding CRM data from Orders...');

    const orders = await prisma.order.findMany();
    console.log(`Found ${orders.length} orders.`);

    for (const order of orders) {
        if (!order.contactInfo) continue; // Skip if no contact info to identify

        // Try to find existing customer by phone (assuming contactInfo might be phone or contain it)
        // Simple heuristic: Take first 10 digits as phone if possible, else use contactInfo string as unique key
        let phone = order.contactInfo.replace(/\D/g, '');
        if (phone.length < 9) phone = order.contactInfo; // Fallback to raw string if not a phone number

        const existingCustomer = await prisma.customer.findUnique({
            where: { phone }
        });

        if (!existingCustomer) {
            console.log(`Creating customer from Order ${order.code}: ${order.customerName}`);

            const newCustomer = await prisma.customer.create({
                data: {
                    name: order.customerName,
                    phone: phone,
                    type: 'WHOLESALE', // Default
                    status: 'CUSTOMER', // Since they have an order
                    source: 'EXISTING_DATA',
                    totalRevenue: order.totalAmount, // Init with this order val
                    tags: 'IMPORTED'
                }
            });

            // Link Order to Customer
            await prisma.order.update({
                where: { id: order.id },
                data: { customerId: newCustomer.id }
            });
        } else {
            console.log(`Linking existing customer ${existingCustomer.name} to Order ${order.code}`);
            // Link and update revenue
            await prisma.order.update({
                where: { id: order.id },
                data: { customerId: existingCustomer.id }
            });

            await prisma.customer.update({
                where: { id: existingCustomer.id },
                data: {
                    totalRevenue: existingCustomer.totalRevenue + order.totalAmount,
                    lastInteraction: new Date()
                }
            });
        }
    }

    console.log('CRM Seeding completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
