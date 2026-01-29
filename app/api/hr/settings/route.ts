import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const settings = await prisma.systemSetting.findMany();
    // Convert to Object for easy access
    const config: any = {};
    settings.forEach(s => config[s.key] = s.value);

    return NextResponse.json(config);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        // Upsert each key
        for (const [key, value] of Object.entries(body)) {
            await prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
