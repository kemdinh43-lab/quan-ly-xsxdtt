
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const customerName = searchParams.get("customerName");
    const productName = searchParams.get("productName");

    if (!customerName || !productName) {
        return NextResponse.json([]);
    }

    try {
        // Find previous Orders (completed) or Accepted Quotes
        // Better to check Orders for "Real" transactions
        const history = await prisma.order.findMany({
            where: {
                customerName: { contains: customerName }, // Flexible matching
                items: {
                    some: {
                        name: { contains: productName }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                items: {
                    where: {
                        name: { contains: productName }
                    }
                }
            }
        });

        // Map to simple structure: Date - Price - Quantity
        const results = history.map(order => {
            const item = order.items[0]; // The one matching the filter
            if (!item) return null;
            return {
                date: order.createdAt,
                price: order.totalAmount, // Warning: Order total might differ from Item price if we don't track unit price well in Order Item. 
                // Wait, Order Item DB schema might need Unit Price if not there.
                // Let's check Schema. Order -> Product(Quantity, but maybe no Price?)
                // Schema check: Product has `quantity`, `note`. No `price` field in `Product` model (Order Item). 
                // Only `QuoteItem` has price.
                // This is a flaw in Schema V1. We should track Deal Price in OrderItem or store it.
                // Fallback: Check Quotes instead since they definitely have price.
                type: 'ORDER'
            };
        }).filter(Boolean);

        // Better strategy: Check Quotes for Price History explicitly
        const quoteHistory = await prisma.quote.findMany({
            where: {
                customerName: { contains: customerName },
                items: {
                    some: {
                        productName: { contains: productName }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { items: true }
        });

        const refinedResults = quoteHistory.map(q => {
            const item = q.items.find(i => i.productName.includes(productName));
            if (!item) return null;
            return {
                id: q.id,
                date: q.createdAt,
                price: item.price,
                quantity: item.quantity,
                status: q.status
            };
        }).filter(Boolean);

        return NextResponse.json(refinedResults);

    } catch (error) {
        console.error("HISTORY_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
