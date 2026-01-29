
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!order) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(order);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
