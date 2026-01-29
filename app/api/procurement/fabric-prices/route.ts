
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const prices = await prisma.fabricPrice.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(prices);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    // if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') ... (Skip for demo simplicity)

    try {
        const body = await request.json();
        const { name, code, marketPrice, supplier } = body;

        const price = await prisma.fabricPrice.create({
            data: {
                name,
                code,
                marketPrice: parseFloat(marketPrice),
                supplier
            }
        });

        return NextResponse.json(price);
    } catch (error) {
        console.error("CREATE_PRICE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
