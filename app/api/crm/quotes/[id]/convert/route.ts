import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    // Relaxed auth for now or checking session
    // if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    try {
        // 1. Fetch Quote
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!quote) {
            return new NextResponse("Quote not found", { status: 404 });
        }

        // 2. Create Order
        // Generate Order Code based on Quote Code (e.g., BG-001 -> DH-BG-001 or just separate sequence)
        const orderCode = `DH-${quote.code}`;

        const order = await prisma.order.create({
            data: {
                code: orderCode, // Potential conflict if not unique, handled below
                customerName: quote.customerName,
                contactInfo: quote.customerAddress, // Mapping address to contact info
                status: 'CONFIRMED',
                totalAmount: quote.totalAmount,
                deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // Default +7 days
                items: {
                    create: quote.items.map(item => ({
                        code: `${orderCode}-${item.stt || 'X'}`,
                        name: item.productName,
                        // Quote items might not have size/color structure, putting detailed description in name or size field if parsing needed?
                        // For now detailed note goes to color field or similar to keep it visible
                        color: '',
                        size: item.unit || '',
                        quantity: parseInt(item.quantity || '0') || 0,
                        consumption: item.consumption || 1.2, // Transfer Consumption Norm
                        note: item.note || '' // Transfer Technical Specs
                    }))
                }
            }
        });

        // 3. Update Quote Status
        await prisma.quote.update({
            where: { id },
            data: { status: 'ACCEPTED' }
        });

        // 4. Auto-Generate Procurement Requests (Back-to-Back Logic)
        try {
            const { generatePurchaseRequestsForOrder } = await import('@/lib/procurement');
            await generatePurchaseRequestsForOrder(order.id);
        } catch (procurementError) {
            console.error("PROCUREMENT_GENERATION_FAILED", procurementError);
            // Don't fail the order creation, just log it. PRs can be generated manually later if needed.
        }

        return NextResponse.json({ orderId: order.id });

    } catch (error: any) {
        console.error("CONVERT_ERROR", error);

        // Handle Unique Constraint on Code (if re-converting same quote)
        if (error.code === 'P2002') {
            return new NextResponse("Order already exists for this Quote", { status: 409 });
        }

        return new NextResponse("Internal Error", { status: 500 });
    }
}
