import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true,
            },
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error("ORDERS_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { code, customerName, contactInfo, deadline, items } = body; // items is array of { name, size, color, quantity }

        if (!code || !customerName) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                code,
                customerName,
                contactInfo,
                status: "QUOTE", // Default status
                deadline: deadline ? new Date(deadline) : null,
                items: {
                    create: items.map((item: any) => ({
                        name: item.name,
                        size: item.size,
                        color: item.color,
                        quantity: parseInt(item.quantity) || 0,
                        code: `${code}-${item.name}-${item.size}`.toUpperCase().replace(/\s+/g, '-') // Auto-gen product code
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("ORDER_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
