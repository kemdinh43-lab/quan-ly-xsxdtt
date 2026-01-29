import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object map: { key: value }
        const settingMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingMap);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    // Allow robust access, maybe restrict to ADMIN later
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { settings } = body; // { COMPANY_NAME: "...", ... }

        // Upsert each key
        for (const [key, value] of Object.entries(settings)) {
            await prisma.systemSetting.upsert({
                where: { key: key },
                update: { value: String(value) },
                create: { key: key, value: String(value) }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
