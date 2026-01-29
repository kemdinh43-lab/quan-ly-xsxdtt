import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // "2024-05"

        const now = new Date();
        const dateQuery = monthParam ? new Date(monthParam) : now;

        const start = startOfMonth(dateQuery);
        const end = endOfMonth(dateQuery);

        // 1. Fetch Users with Salary Config & Attendance
        const users = await prisma.user.findMany({
            where: { role: { not: 'ADMIN' } },
            include: {
                attendances: {
                    where: {
                        date: {
                            gte: start,
                            lte: end
                        }
                    }
                }
                // requests: { where: { status: 'APPROVED', type: 'LEAVE', isPaid: true } } // Commented out until Request model verified
            }
        });

        // 2. Constants for Rules (Hardcoded for MVP)
        const WORK_START_HOUR = 8;
        const WORK_START_MIN = 0;
        const LATE_THRESHOLD_MIN = 15; // 8:15
        const OT_START_HOUR = 17;
        const OT_START_MIN = 30; // 17:30 start counting OT

        const payrollData = users.map(user => {
            let workDays = 0;
            let lateMinutes = 0;
            let otHours = 0;

            // Calculate Stats from Attendance
            user.attendances.forEach(att => {
                const checkIn = new Date(att.checkInTime);

                // Count Day
                workDays += 1;

                // Late Calculation
                const shiftStart = new Date(att.date);
                shiftStart.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
                const diffLate = differenceInMinutes(checkIn, shiftStart);
                if (diffLate > LATE_THRESHOLD_MIN) {
                    lateMinutes += diffLate;
                }

                // OT Calculation
                if (att.checkOutTime) {
                    const checkOut = new Date(att.checkOutTime);
                    const otStart = new Date(att.date);
                    otStart.setHours(OT_START_HOUR, OT_START_MIN, 0, 0);

                    if (checkOut > otStart) {
                        const diffOT = differenceInMinutes(checkOut, otStart);
                        otHours += (diffOT / 60);
                    }
                }
            });

            // Financials
            const dailyRate = user.dailyRate || 0;
            const allowance = user.allowance || 0;
            const otRate = user.otRate || 1.5;

            // Basic Salary = WorkDays * DailyRate
            const basicSalary = workDays * dailyRate;

            // OT Pay = (DailyRate / 8) * OTHours * OTRate
            const hourlyRate = dailyRate / 8;
            const otPay = otHours * hourlyRate * otRate;

            // Penalty (Example: 50k per hour late? Or just tracked? Let's assume 0 deduction for now unless requested)
            const latePenalty = 0;

            const totalSalary = basicSalary + allowance + otPay - latePenalty;

            return {
                id: user.id,
                name: user.name,
                employeeCode: user.employeeCode,
                role: user.role,
                dailyRate,
                allowance,
                otRate,
                workDays,
                lateMinutes,
                otHours: parseFloat(otHours.toFixed(2)),
                basicSalary: Math.round(basicSalary),
                otPay: Math.round(otPay),
                totalSalary: Math.round(totalSalary)
            };
        });

        return NextResponse.json(payrollData);

    } catch (error) {
        console.error("PAYROLL_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
