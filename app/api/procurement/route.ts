
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const requests = await prisma.purchaseRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        code: true,
                        customerName: true
                    }
                }
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("GET_PROCUREMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
