import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const where: any = {};
        if (type) where.type = type;

        // If not Admin, only see own requests
        if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
            where.userId = session.user.id;
        }

        const requests = await prisma.request.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { type, reason, date, isPaid } = body;

        await prisma.request.create({
            data: {
                userId: session.user.id,
                type,
                reason,
                date: new Date(date),
                isPaid: isPaid || false,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, status, managerComment } = body;

        await prisma.request.update({
            where: { id },
            data: { status, managerComment }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
