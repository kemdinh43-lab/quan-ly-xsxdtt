import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from 'date-fns';

export async function POST(request: Request) {
    // Note: Kiosk API might be public or protected by a shared "Kiosk Token"
    // For MVP, we allow unauthenticated POST if it has a valid `code` (Employee Code)
    // In production, protect this endpoint.

    try {
        const body = await request.json();
        const { code } = body;

        if (!code) return new NextResponse("Missing Code", { status: 400 });

        // 1. Find User by Employee Code
        const user = await prisma.user.findUnique({
            where: { employeeCode: code }
        });

        if (!user) {
            return NextResponse.json({ status: "ERROR", message: "Mã nhân viên không tồn tại" });
        }

        // 2. Check for existing Attendance today
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.id,
                date: {
                    gte: start,
                    lte: end
                }
            }
        });

        let type = "IN";
        let message = `Xin chào ${user.name}, chúc bạn một ngày làm việc vui vẻ!`;

        if (existingAttendance) {
            // If already checked in, Check Out
            if (!existingAttendance.checkOutTime) {
                type = "OUT";
                await prisma.attendance.update({
                    where: { id: existingAttendance.id },
                    data: {
                        checkOutTime: new Date(),
                        // Calculate hours here if needed
                    }
                });
                message = `Tạm biệt ${user.name}, hẹn gặp lại! (Đã chấm công ra)`;
            } else {
                // Already checked out, maybe allow Re-Check In or Warning?
                // For simple flow: Update CheckOut Time (overwrite)
                type = "OUT";
                await prisma.attendance.update({
                    where: { id: existingAttendance.id },
                    data: { checkOutTime: new Date() }
                });
                message = `Cập nhật giờ ra thành công: ${format(new Date(), 'HH:mm')}`;
            }
        } else {
            // Create New Check In
            type = "IN";
            await prisma.attendance.create({
                data: {
                    userId: user.id,
                    date: start, // Store as Midnight for easier querying
                    checkInTime: new Date(),
                    status: "ON_TIME" // Simplified logic
                }
            });
        }

        return NextResponse.json({
            status: "SUCCESS",
            type,
            user: { name: user.name, id: user.id },
            time: format(new Date(), 'HH:mm'),
            message
        });

    } catch (error) {
        console.error("SCAN_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
