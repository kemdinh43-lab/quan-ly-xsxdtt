import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');

        const where: any = {};
        if (status) where.status = status;

        const requests = await prisma.purchaseRequest.findMany({
            where,
            include: {
                order: {
                    select: { id: true, customerName: true }
                },
                supplier: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("GET_PURCHASE_REQUESTS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { materialName, quantity, unit, orderId, supplierId, sku } = body;

        const purchaseRequest = await prisma.purchaseRequest.create({
            data: {
                materialName,
                quantity: parseFloat(quantity),
                unit,
                orderId,
                supplierId,
                status: 'PENDING'
            }
        });

        return NextResponse.json(purchaseRequest);
    } catch (error) {
        console.error("CREATE_PURCHASE_REQUEST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
