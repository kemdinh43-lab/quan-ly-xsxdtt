import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        let { productId, quantity, note } = body;
        quantity = parseInt(quantity);

        if (!productId || isNaN(quantity) || quantity <= 0) {
            return new NextResponse("Invalid export data", { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) return new NextResponse("Product not found", { status: 404 });
        if (product.quantity < quantity) {
            return new NextResponse("Insufficient stock", { status: 400 });
        }

        // Deduct quantity
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                quantity: { decrement: quantity }
            }
        });

        // TODO: Log export transaction if InventoryLog table supports Product type or generic
        // For now, we update the product directly.

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("PRODUCT_EXPORT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
