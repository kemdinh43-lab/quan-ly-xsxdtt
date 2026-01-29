import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Kiosk Mode requires NO AUTH (or a fixed token) because it runs on a shared tablet.
// For security in production, we would use an API Key header.
// For this MVP, we assume the route is open (Internal Network).

const DEFAULT_START_HOUR = 8;
const DEFAULT_START_MINUTE = 0;
const DEFAULT_LATE_Period = 15;

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        // 1. Find User
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ success: false, message: "Mã nhân viên không tồn tại!" }, { status: 404 });

        // 2. Load Settings (Start Time) - For now use defaults or fetch DB
        // In real app, we fetch SystemSetting SHIFT_START

        // 3. Time Check
        const now = new Date();
        const startOfShift = new Date(now);
        startOfShift.setHours(DEFAULT_START_HOUR, DEFAULT_START_MINUTE, 0, 0);

        let status = 'ON_TIME';
        let lateMinutes = 0;

        if (now > startOfShift) {
            const diffMs = now.getTime() - startOfShift.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);
            if (diffMinutes > DEFAULT_LATE_Period) {
                status = 'LATE';
                lateMinutes = diffMinutes;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await prisma.attendance.findFirst({ where: { userId: user.id, date: today } });
        if (existing) {
            return NextResponse.json({ success: false, message: "Hôm nay đã chấm công rồi!" }, { status: 400 });
        }

        // 4. Create Record
        await prisma.attendance.create({
            data: {
                userId: user.id,
                date: today,
                checkInTime: now,
                checkInLocation: "KIOSK",
                status,
                lateMinutes
            }
        });

        const msg = status === 'LATE' ? `Đi muộn ${lateMinutes} phút.` : "Đúng giờ.";

        return NextResponse.json({
            success: true,
            userName: user.name,
            message: `Chấm công thành công! (${msg})`
        });

    } catch (error) {
        console.error("KIOSK_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
