import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Logic:
// 1. Get Order Item -> Get Tech Spec (Consumption) -> Calculate Total Material Need.
// 2. Check current Inventory (Material).
// 3. Shortfall = Need - (Current Stock + Incoming).
// 4. If Shortfall > 0, create Purchase Request.

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) return new NextResponse("Missing Order ID", { status: 400 });

        // 1. Fetch Order with Items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) return new NextResponse("Order not found", { status: 404 });

        const createdRequests = [];

        // 2. Iterate items and calculate needs
        for (const item of order.items) {
            // Simplify: Assume Product Name maps to Material Name for MVP
            // Or look for "Consumption" stored in Quote Item if available?
            // In Module 13, let's assume a simpler mapping: 
            // - If "Áo thun" -> Needs "Vải Cotton" (approx 1.2m/ao)

            // For extensive logic, we need linked TechSpecs. 
            // If TechSpec is not yet defined, we create a generic placeholder request.

            const fabricName = "Vải chính (Theo mẫu)";
            const consumption = 1.2; // Default 1.2m
            const totalNeed = item.quantity * consumption;

            // Check existing PR for this Order Item? (Skip to avoid dupes)

            const pr = await prisma.purchaseRequest.create({
                data: {
                    orderId: order.id,
                    materialName: `${fabricName} - cho ${item.name}`,
                    quantity: totalNeed,
                    unit: 'm',
                    status: 'PENDING'
                }
            });
            createdRequests.push(pr);
        }

        return NextResponse.json({ success: true, count: createdRequests.length, requests: createdRequests });
    } catch (error) {
        console.error("GENERATE_PR_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
