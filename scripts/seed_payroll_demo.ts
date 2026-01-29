import { PrismaClient } from '@prisma/client';
import { startOfMonth, subDays, addDays, addHours, addMinutes, setHours, setMinutes } from 'date-fns';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Payroll Demo Data...");

    // 1. Clean up old demo data (Optional, be careful)
    // await prisma.attendance.deleteMany({});
    // await prisma.user.deleteMany({ where: { email: { contains: 'demo_payroll' } } });

    const password = await bcrypt.hash('123', 10);
    const monthStart = startOfMonth(new Date());

    const employees = [
        { name: 'Nguyễn Quản Lý (Demo)', email: 'manager@demo.com', role: 'MANAGER', dailyRate: 1000000, allowance: 2000000, otRate: 1.5, code: 'NV_DEMO_01' },
        { name: 'Lê Sale (Demo)', email: 'sale@demo.com', role: 'SALES', dailyRate: 500000, allowance: 500000, otRate: 1.5, code: 'NV_DEMO_02' },
        { name: 'Trần Kho (Demo)', email: 'warehouse@demo.com', role: 'WAREHOUSE', dailyRate: 400000, allowance: 300000, otRate: 2.0, code: 'NV_DEMO_03' }, // High OT rate
        { name: 'Phạm Công Nhân A (Demo)', email: 'worker_a@demo.com', role: 'WAREHOUSE', dailyRate: 350000, allowance: 150000, otRate: 1.5, code: 'NV_DEMO_04' },
        { name: 'Hoàng Công Nhân B (Demo)', email: 'worker_b@demo.com', role: 'WAREHOUSE', dailyRate: 350000, allowance: 150000, otRate: 1.5, code: 'NV_DEMO_05' },
    ];

    for (const emp of employees) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: emp.email },
            update: {
                dailyRate: emp.dailyRate,
                allowance: emp.allowance,
                otRate: emp.otRate,
                employeeCode: emp.code
            },
            create: {
                name: emp.name,
                email: emp.email,
                password,
                role: emp.role,
                employeeCode: emp.code,
                dailyRate: emp.dailyRate,
                allowance: emp.allowance,
                otRate: emp.otRate
            }
        });

        console.log(`Created/Updated User: ${user.name}`);

        // Generate Attendance for last 5 days
        // Logic:
        // Manager: Perfect
        // Sale: Late 2 days
        // Warehouse: Heavy OT
        // Worker A: Normal
        // Worker B: Missed 1 day

        for (let i = 0; i < 5; i++) {
            const date = subDays(new Date(), i);
            if (date.getDay() === 0) continue; // Skip Sunday

            let inHour = 8, inMin = 0;
            let outHour = 17, outMin = 0;

            if (emp.role === 'MANAGER') {
                // Perfect: 7:55 - 17:05
                inHour = 7; inMin = 55;
                outHour = 17; outMin = 5;
            } else if (emp.role === 'SALES') {
                // Sale: Randomly late
                if (i % 2 === 0) { inHour = 8; inMin = 30; } // Late
                else { inHour = 8; inMin = 0; }
                outHour = 17; outMin = 0;
            } else if (emp.role === 'WAREHOUSE' && emp.name.includes('Kho')) {
                // Warehouse Lead: OT
                inHour = 7; inMin = 50;
                outHour = 19; outMin = 30; // 2.5h OT
            } else if (emp.name.includes('Worker B') && i === 2) {
                // Worker B missed a day
                continue;
            } else {
                // Normal
                inHour = 7; inMin = 58;
                outHour = 17; outMin = 0;
            }

            const checkIn = setMinutes(setHours(date, inHour), inMin);
            const checkOut = setMinutes(setHours(date, outHour), outMin);

            // Create Attendance
            await prisma.attendance.create({
                data: {
                    userId: user.id,
                    date: setHours(date, 0), // Midnight
                    checkInTime: checkIn,
                    checkOutTime: checkOut,
                    status: 'PRESENT'
                }
            });
        }
    }

    console.log("✅ Seeding Complete. Check Payroll Dashboard.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
