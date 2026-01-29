import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const plans = await prisma.productionPlan.findMany({
            include: {
                order: {
                    include: { items: true }
                },
                stages: {
                    orderBy: { name: 'asc' } // Ensure consistent order if needed, or rely on specific sorting in UI
                }
            },
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error("PRODUCTION_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return new NextResponse("Missing orderId", { status: 400 });
        }

        // Get order to know total quantity
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) return new NextResponse("Order not found", { status: 404 });

        const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
        const STAGES = ['1. CUTTING', '2. SEWING', '3. QC', '4. PACKING'];

        // Create Plan and Stages transaction
        const plan = await prisma.productionPlan.create({
            data: {
                orderId,
                status: 'PLANNED',
                startDate: new Date(),
                stages: {
                    create: STAGES.map(stageName => ({
                        name: stageName,
                        status: 'PENDING',
                        quantityTarget: totalQuantity,
                        quantityProduced: 0,
                        quantityError: 0
                    }))
                }
            },
            include: { stages: true }
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PRODUCING' }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error("PRODUCTION_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
