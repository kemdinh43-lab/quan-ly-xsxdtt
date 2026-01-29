
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'APPROVAL_THRESHOLD' }
    });

    return NextResponse.json({ value: setting?.value || "50000000" });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { value } = body;

        await prisma.systemSetting.upsert({
            where: { key: 'APPROVAL_THRESHOLD' },
            create: { key: 'APPROVAL_THRESHOLD', value: String(value), description: 'Quote Approval Threshold (VND)' },
            update: { value: String(value) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
