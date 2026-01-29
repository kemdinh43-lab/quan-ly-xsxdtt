
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const count = await prisma.purchaseRequest.count({
            where: {
                status: 'PENDING'
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("PR_COUNT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
