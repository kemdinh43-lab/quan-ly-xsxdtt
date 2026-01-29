import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const products = await prisma.product.findMany({
            include: {
                order: { select: { code: true, customerName: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("PRODUCTS_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { name, size, color, quantity, code, orderId } = body;

        if (!name || !code) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                code,
                name,
                size,
                color,
                quantity: parseInt(quantity) || 0,
                orderId: orderId || null
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("PRODUCT_POST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
