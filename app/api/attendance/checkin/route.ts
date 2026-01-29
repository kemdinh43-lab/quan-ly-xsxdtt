import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// CONFIG: Factory Location
const FACTORY = {
    lat: 10.8411,
    lng: 106.8099,
    radius: 0.2 // km
};

// CONFIG: Shift
const SHIFT_START_HOUR = 8;
const SHIFT_START_MINUTE = 0;
const LATE_GRACE_PERIOD = 15; // Phut

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI / 180) }

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { lat, lng } = await request.json();

        // 1. Calculate Distance
        const dist = getDistanceFromLatLonInKm(lat, lng, FACTORY.lat, FACTORY.lng);
        if (dist > FACTORY.radius) {
            return NextResponse.json({
                success: false,
                message: `Bạn đang ở quá xa! (Cách xưởng ${(dist * 1000).toFixed(0)}m).`
            }, { status: 400 });
        }

        // 2. Validate Time (Late Check)
        const now = new Date();
        const startOfShift = new Date(now);
        startOfShift.setHours(SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0);

        let status = 'ON_TIME';
        let lateMinutes = 0;

        if (now > startOfShift) {
            const diffMs = now.getTime() - startOfShift.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);

            if (diffMinutes > LATE_GRACE_PERIOD) {
                status = 'LATE';
                lateMinutes = diffMinutes;
            }
        }

        if (!session.user?.id) {
            return new NextResponse("User ID missing", { status: 400 });
        }
        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await prisma.attendance.findFirst({
            where: { userId, date: today }
        });

        if (existing) {
            return NextResponse.json({ success: false, message: `Hôm nay đã chấm công rồi!` }, { status: 400 });
        }

        // 3. Create Record with Late Info
        await prisma.attendance.create({
            data: {
                userId,
                date: today,
                checkInTime: now,
                checkInLocation: `${lat},${lng}`,
                status,
                lateMinutes
            }
        });

        const msg = status === 'LATE'
            ? `Chấm công thành công! (Đi muộn ${lateMinutes} phút).`
            : "Chấm công thành công! Bạn đi làm đúng giờ.";

        return NextResponse.json({ success: true, message: msg });

    } catch (error) {
        console.error("GPS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
