import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const quotes = await prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        return NextResponse.json(quotes);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { customerName, customerAddress, items, introText, footerText } = body;

        // Auto-generate Code: BG-YYYY-XXXX (Simple Random for MVP)
        const code = `BG-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;

        // Calculate approximate total
        const totalAmount = items.reduce((sum: number, item: any) => {
            const qty = parseInt(item.quantity) || 0; // fallback to 0 if range
            const price = parseFloat(item.price) || 0;
            return sum + (qty * price);
        }, 0);

        // Check Approval Threshold
        const thresholdSetting = await prisma.systemSetting.findUnique({
            where: { key: 'APPROVAL_THRESHOLD' }
        });
        const threshold = parseFloat(thresholdSetting?.value || "50000000"); // Default 50M
        const status = totalAmount > threshold ? 'PENDING_APPROVAL' : 'DRAFT';

        const quote = await prisma.quote.create({
            data: {
                code,
                customerName,
                customerAddress,
                introText,
                footerText,
                totalAmount,
                status, // Set status
                items: {
                    create: items.map((item: any, index: number) => ({
                        stt: index + 1,
                        productName: item.productName,
                        unit: item.unit,
                        quantity: item.quantity,
                        price: parseFloat(item.price),
                        consumption: parseFloat(item.consumption) || 1.2,
                        note: item.note,
                        imageUrl: item.imageUrl
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, id: quote.id });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
